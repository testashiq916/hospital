<?php

namespace App\Services\Billing;

use App\Events\Billing\InvoiceGenerated;
use App\Events\Billing\PaymentReceived;
use App\Models\Billing\BillItem;
use App\Models\Billing\HospitalBill;
use App\Models\Billing\HospitalPayment;
use App\Models\Billing\InsuranceClaim;
use App\Services\Accounting\VoucherPostingService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

/**
 * Builds hospital bills (with GST calc) and posts the corresponding
 * double-entry voucher, reproducing the exact account pattern from
 * docs/spec/accounting-example-01/02/03/04.sql:
 *  - OPD/pharmacy/lab/radiology bills settle immediately -> primary account
 *    is Cash/Bank (102), debited for the grand total.
 *  - IPD/emergency/procedure/discharge bills are billed on account -> primary
 *    account is Accounts Receivable (104), debited for the grand total.
 *  - Revenue lines are credited per item_type; CGST/SGST are split evenly
 *    from the total GST collected (intrastate assumption, matching the
 *    worked examples).
 */
class BillingService
{
    protected const REVENUE_ACCOUNTS = [
        'consultation' => '401',
        'opd' => '401',
        'lab' => '402',
        'room' => '403',
        'ipd' => '403',
        'pharmacy' => '404',
        'radiology' => '405',
        'procedure' => '406',
        'discharge' => '406',
        'emergency' => '401',
    ];

    protected const CASH_ACCOUNT = '102';

    protected const RECEIVABLE_ACCOUNT = '104';

    protected const INSURANCE_RECEIVABLE_ACCOUNT = '105';

    protected const CGST_ACCOUNT = '202';

    protected const SGST_ACCOUNT = '203';

    protected const REVENUE_ACCOUNT_DEFAULT = '401';

    public function __construct(protected VoucherPostingService $vouchers) {}

    public function createBill(array $billData, array $items, bool $settledImmediately = null): HospitalBill
    {
        return DB::transaction(function () use ($billData, $items, $settledImmediately) {
            $subtotal = 0;
            $gstTotal = 0;
            $lineTotals = [];

            $computedItems = array_map(function ($item) use (&$subtotal, &$gstTotal, &$lineTotals) {
                $qty = $item['quantity'] ?? 1;
                $unitPrice = (float) $item['unit_price'];
                $gross = $qty * $unitPrice;
                $discountPercent = $item['discount_percent'] ?? 0;
                $discountAmount = round($gross * ($discountPercent / 100), 2);
                $taxable = $gross - $discountAmount;
                $gstRate = $item['gst_rate'] ?? 0;
                $gstAmount = round($taxable * ($gstRate / 100), 2);
                $total = round($taxable + $gstAmount, 2);

                $subtotal += $taxable;
                $gstTotal += $gstAmount;

                $itemType = strtolower($item['item_type']);
                $lineTotals[$itemType] = ($lineTotals[$itemType] ?? 0) + $taxable;

                return array_merge($item, [
                    'quantity' => $qty,
                    'discount_amount' => $discountAmount,
                    'gst_amount' => $gstAmount,
                    'total' => $total,
                ]);
            }, $items);

            $billDiscount = (float) ($billData['discount_amount'] ?? 0);
            $serviceCharge = (float) ($billData['service_charge'] ?? 0);
            $totalAmount = round($subtotal - $billDiscount + $gstTotal + $serviceCharge, 2);

            $settledImmediately ??= in_array($billData['bill_type'], ['opd', 'pharmacy', 'lab', 'radiology'], true);

            $billData['company_id'] = $billData['company_id'] ?? Auth::user()?->company_id;
            $billData['bill_date'] = now()->toDateString();
            $billData['bill_time'] = now()->toTimeString();
            $billData['subtotal'] = round($subtotal, 2);
            $billData['discount_amount'] = $billDiscount;
            $billData['tax_amount'] = round($gstTotal, 2);
            $billData['service_charge'] = $serviceCharge;
            $billData['total_amount'] = $totalAmount;
            $billData['paid_amount'] = $settledImmediately ? $totalAmount : 0;
            $billData['balance_amount'] = $settledImmediately ? 0 : $totalAmount;
            $billData['payment_status'] = $settledImmediately ? 'paid' : 'pending';
            $billData['patient_payable'] = $totalAmount;
            $billData['created_by'] = Auth::id();

            $bill = HospitalBill::create($billData);

            foreach ($computedItems as $item) {
                $item['bill_id'] = $bill->id;
                BillItem::create($item);
            }

            $distribution = [];
            foreach ($lineTotals as $itemType => $amount) {
                if ($amount <= 0) {
                    continue;
                }
                $distribution[] = [
                    'account_code' => self::REVENUE_ACCOUNTS[$itemType] ?? self::REVENUE_ACCOUNT_DEFAULT,
                    'drcr' => 'cr',
                    'amount' => round($amount, 2),
                    'remarks' => ucfirst($itemType).' revenue',
                ];
            }

            if ($gstTotal > 0) {
                $half = round($gstTotal / 2, 2);
                $distribution[] = ['account_code' => self::CGST_ACCOUNT, 'drcr' => 'cr', 'amount' => $half, 'remarks' => 'CGST collected'];
                $distribution[] = ['account_code' => self::SGST_ACCOUNT, 'drcr' => 'cr', 'amount' => round($gstTotal - $half, 2), 'remarks' => 'SGST collected'];
            }

            // A bill-level discount reduces the primary settlement amount
            // directly (the primary debit already nets it out via
            // $totalAmount above) rather than needing a separate
            // contra-revenue line — the worked examples have no discount
            // scenario to match against.

            $primaryAccount = $settledImmediately ? self::CASH_ACCOUNT : self::RECEIVABLE_ACCOUNT;

            $voucher = $this->vouchers->post(
                'billing',
                ['account_code' => $primaryAccount, 'drcr' => 'dr', 'amount' => $totalAmount, 'remarks' => 'Bill '.$bill->bill_id],
                $distribution,
                [
                    'company_id' => $bill->company_id,
                    'hospital_id' => $bill->hospital_id,
                    'patient_id' => $bill->patient_id,
                    'bill_id' => $bill->id,
                    'voucher_date' => $bill->bill_date,
                    'narration' => 'Bill '.$bill->bill_id,
                ]
            );

            $bill->update(['voucher_id' => $voucher->id]);

            InvoiceGenerated::dispatch($bill->fresh());

            return $bill->fresh(['items', 'voucher']);
        });
    }

    public function recordPayment(HospitalBill $bill, array $paymentData): HospitalPayment
    {
        return DB::transaction(function () use ($bill, $paymentData) {
            $paymentData['company_id'] = $bill->company_id;
            $paymentData['hospital_id'] = $bill->hospital_id;
            $paymentData['patient_id'] = $bill->patient_id;
            $paymentData['bill_id'] = $bill->id;
            $paymentData['payment_date'] = now()->toDateString();
            $paymentData['payment_time'] = now()->toTimeString();
            $paymentData['received_by'] = Auth::id();

            $payment = HospitalPayment::create($paymentData);

            $voucher = $this->vouchers->post(
                'receipt',
                ['account_code' => self::CASH_ACCOUNT, 'drcr' => 'dr', 'amount' => (float) $payment->amount, 'remarks' => 'Payment received - '.$bill->bill_id],
                [['account_code' => self::RECEIVABLE_ACCOUNT, 'drcr' => 'cr', 'amount' => (float) $payment->amount, 'remarks' => 'Payment applied - '.$bill->bill_id]],
                [
                    'company_id' => $bill->company_id,
                    'hospital_id' => $bill->hospital_id,
                    'patient_id' => $bill->patient_id,
                    'bill_id' => $bill->id,
                    'narration' => 'Receipt against '.$bill->bill_id,
                ]
            );

            $payment->update(['voucher_id' => $voucher->id]);

            $paidAmount = round((float) $bill->paid_amount + (float) $payment->amount, 2);
            $balance = max(0, round((float) $bill->total_amount - $paidAmount, 2));

            $bill->update([
                'paid_amount' => $paidAmount,
                'balance_amount' => $balance,
                'payment_status' => $balance <= 0 ? 'paid' : 'partial',
            ]);

            PaymentReceived::dispatch($payment->fresh());

            return $payment->fresh();
        });
    }

    /**
     * Insurance claim settlement voucher: revenue (credit, single line) is
     * split across Insurance Receivable + Patient Receivable (debit lines),
     * matching docs/spec/accounting-example-03-insurance-claim.sql.
     */
    public function postInsuranceClaimVoucher(InsuranceClaim $claim, float $approvedAmount, float $patientPayable): void
    {
        $this->vouchers->post(
            'insurance',
            ['account_code' => self::REVENUE_ACCOUNT_DEFAULT, 'drcr' => 'cr', 'amount' => round($approvedAmount + $patientPayable, 2), 'remarks' => 'Revenue - '.$claim->claim_id],
            [
                ['account_code' => self::INSURANCE_RECEIVABLE_ACCOUNT, 'drcr' => 'dr', 'amount' => round($approvedAmount, 2), 'remarks' => 'Insurance claim - '.$claim->claim_id],
                ['account_code' => self::RECEIVABLE_ACCOUNT, 'drcr' => 'dr', 'amount' => round($patientPayable, 2), 'remarks' => 'Patient payable - '.$claim->claim_id],
            ],
            [
                'company_id' => $claim->company_id,
                'hospital_id' => $claim->hospital_id,
                'patient_id' => $claim->patient_id,
                'bill_id' => $claim->bill_id,
                'narration' => 'Insurance settlement '.$claim->claim_id,
            ]
        );
    }
}
