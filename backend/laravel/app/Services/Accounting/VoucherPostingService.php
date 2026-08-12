<?php

namespace App\Services\Accounting;

use App\Models\Accounting\Daybook;
use App\Models\Accounting\Voucher;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Posts balanced double-entry vouchers to the daybook, reproducing the
 * account/debit/credit pattern from docs/spec/accounting-example-*.sql.
 *
 * Every voucher in those examples has one "primary" account (the account
 * being settled — cash/bank on a billing receipt, accounts receivable on an
 * insurance claim, ...) and one or more "distribution" accounts on the
 * opposite side (revenue lines, tax lines, receivable splits, ...). Each
 * distribution line's opposite_account_code points back to the primary
 * account, and the primary line's opposite_account_code points to the first
 * distribution line — exactly the pattern in the worked examples.
 *
 * A plain multi-line journal (arbitrary N debits / M credits) is also
 * supported via postJournal() for completeness; opposite_account_code there
 * is best-effort (first account on the other side) since the worked
 * examples never exercise that shape.
 */
class VoucherPostingService
{
    protected const PREFIXES = [
        'billing' => 'BIL',
        'payment' => 'PAY',
        'receipt' => 'REC',
        'journal' => 'JNL',
        'contra' => 'CON',
        'insurance' => 'INS',
    ];

    /**
     * @param  string  $voucherType  billing|payment|receipt|journal|contra|insurance
     * @param  array{account_code:string,drcr:string,amount:float}  $primary
     * @param  array<int,array{account_code:string,drcr:string,amount:float,remarks?:string}>  $distribution
     */
    public function post(
        string $voucherType,
        array $primary,
        array $distribution,
        array $meta = [],
    ): Voucher {
        return DB::transaction(function () use ($voucherType, $primary, $distribution, $meta) {
            $primaryAmount = round((float) $primary['amount'], 2);
            $distributionTotal = round(array_sum(array_column($distribution, 'amount')), 2);

            if (abs($primaryAmount - $distributionTotal) > 0.01) {
                throw ValidationException::withMessages([
                    'amount' => "Voucher is not balanced: primary {$primaryAmount} vs distribution total {$distributionTotal}.",
                ]);
            }

            $companyId = $meta['company_id'] ?? Auth::user()?->company_id;
            $voucherNo = $meta['voucher_no'] ?? $this->nextVoucherNo($companyId, $voucherType);

            $totalDebit = $primary['drcr'] === 'dr' ? $primaryAmount : $distributionTotal;
            $totalCredit = $primary['drcr'] === 'cr' ? $primaryAmount : $distributionTotal;

            $voucher = Voucher::create([
                'company_id' => $companyId,
                'voucher_no' => $voucherNo,
                'voucher_type' => $voucherType,
                'voucher_date' => $meta['voucher_date'] ?? now()->toDateString(),
                'reference_no' => $meta['reference_no'] ?? null,
                'reference_date' => $meta['reference_date'] ?? null,
                'narration' => $meta['narration'] ?? null,
                'total_debit' => $totalDebit,
                'total_credit' => $totalCredit,
                'total_amount' => $primaryAmount,
                'balance_difference' => round($totalDebit - $totalCredit, 2),
                'is_balanced' => true,
                'is_posted' => true,
                'posted_by' => Auth::id(),
                'posted_at' => now(),
                'hospital_id' => $meta['hospital_id'] ?? null,
                'created_by' => Auth::id(),
            ]);

            $sno = 1;
            $firstDistributionAccount = $distribution[0]['account_code'];

            $this->writeEntry($voucher, $sno++, $primary['account_code'], $firstDistributionAccount, $primaryAmount, $primary['drcr'], $primary['remarks'] ?? null, $meta);

            foreach ($distribution as $line) {
                $this->writeEntry($voucher, $sno++, $line['account_code'], $primary['account_code'], round((float) $line['amount'], 2), $line['drcr'], $line['remarks'] ?? null, $meta);
            }

            return $voucher->fresh();
        });
    }

    /**
     * Generic balanced multi-line journal (N debits, M credits, sum equal).
     */
    public function postJournal(array $lines, array $meta = []): Voucher
    {
        return DB::transaction(function () use ($lines, $meta) {
            $debits = array_filter($lines, fn ($l) => $l['drcr'] === 'dr');
            $credits = array_filter($lines, fn ($l) => $l['drcr'] === 'cr');

            $totalDebit = round(array_sum(array_column($debits, 'amount')), 2);
            $totalCredit = round(array_sum(array_column($credits, 'amount')), 2);

            if (abs($totalDebit - $totalCredit) > 0.01) {
                throw ValidationException::withMessages([
                    'amount' => "Journal voucher is not balanced: debit {$totalDebit} vs credit {$totalCredit}.",
                ]);
            }

            $companyId = $meta['company_id'] ?? Auth::user()?->company_id;
            $voucherNo = $meta['voucher_no'] ?? $this->nextVoucherNo($companyId, 'journal');

            $voucher = Voucher::create([
                'company_id' => $companyId,
                'voucher_no' => $voucherNo,
                'voucher_type' => 'journal',
                'voucher_date' => $meta['voucher_date'] ?? now()->toDateString(),
                'narration' => $meta['narration'] ?? null,
                'total_debit' => $totalDebit,
                'total_credit' => $totalCredit,
                'total_amount' => $totalDebit,
                'balance_difference' => round($totalDebit - $totalCredit, 2),
                'is_balanced' => true,
                'is_posted' => true,
                'posted_by' => Auth::id(),
                'posted_at' => now(),
                'hospital_id' => $meta['hospital_id'] ?? null,
                'created_by' => Auth::id(),
            ]);

            $firstCredit = array_values($credits)[0]['account_code'] ?? array_values($debits)[0]['account_code'];
            $firstDebit = array_values($debits)[0]['account_code'] ?? $firstCredit;

            $sno = 1;
            foreach ($lines as $line) {
                $opposite = $line['drcr'] === 'dr' ? $firstCredit : $firstDebit;
                $this->writeEntry($voucher, $sno++, $line['account_code'], $opposite, round((float) $line['amount'], 2), $line['drcr'], $line['remarks'] ?? null, $meta);
            }

            return $voucher->fresh();
        });
    }

    protected function writeEntry(Voucher $voucher, int $sno, string $accountCode, string $oppositeAccountCode, float $amount, string $drcr, ?string $remarks, array $meta): Daybook
    {
        $nextSlno = (int) (Daybook::max('slno') ?? 0) + 1;

        return Daybook::create([
            'company_id' => $voucher->company_id,
            'slno' => $nextSlno,
            'sno' => $sno,
            'account_code' => $accountCode,
            'opposite_account_code' => $oppositeAccountCode,
            'amount' => $amount,
            'drcr' => $drcr,
            'voucher_type' => $voucher->voucher_type,
            'voucher_no' => $voucher->voucher_no,
            'voucher_date' => $voucher->voucher_date,
            'remarks' => $remarks,
            'reference_no' => $meta['reference_no'] ?? null,
            'reference_date' => $meta['reference_date'] ?? null,
            'patient_id' => $meta['patient_id'] ?? null,
            'bill_id' => $meta['bill_id'] ?? null,
            'hospital_id' => $voucher->hospital_id,
            'created_by' => Auth::id(),
        ]);
    }

    public function nextVoucherNo(?int $companyId, string $voucherType): string
    {
        $prefix = self::PREFIXES[$voucherType] ?? strtoupper(substr($voucherType, 0, 3));
        $year = now()->year;

        $count = Voucher::where('company_id', $companyId)
            ->where('voucher_type', $voucherType)
            ->whereYear('voucher_date', $year)
            ->count();

        return sprintf('%s-%d-%03d', $prefix, $year, $count + 1);
    }
}
