<?php

namespace Tests\Feature;

use App\Models\Accounting\Daybook;
use App\Models\Hospital\Hospital;
use App\Models\Patient\Patient;
use App\Models\System\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * Reproduces docs/spec/accounting-example-01-opd-billing.sql: consultation
 * fee 500 + lab test 1000 = 1500 subtotal, GST 18% (270, split CGST/SGST
 * 135 each) = grand total 1770, settled immediately to Bank/Cash (102).
 */
class BillingAccountingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(DatabaseSeeder::class);

        $admin = User::where('email', 'admin@demo-hms.test')->firstOrFail();
        Sanctum::actingAs($admin, ['*']);
    }

    public function test_opd_bill_posts_a_balanced_voucher_matching_the_worked_example(): void
    {
        $hospital = Hospital::where('hospital_id', 'HOSP-DEMO-001')->firstOrFail();

        $patient = $this->postJson('/api/v1/patients', [
            'hospital_id' => $hospital->id,
            'first_name' => 'Billing',
            'last_name' => 'Example',
            'gender' => 'male',
            'date_of_birth' => '1988-03-03',
            'mobile' => '9888800001',
            'registration_type' => 'opd',
        ])->assertCreated();

        $patientId = $patient->json('id');

        $response = $this->postJson('/api/v1/bills', [
            'hospital_id' => $hospital->id,
            'patient_id' => $patientId,
            'bill_type' => 'opd',
            'items' => [
                ['description' => 'Consultation Fee', 'item_type' => 'consultation', 'quantity' => 1, 'unit_price' => 500, 'gst_rate' => 18],
                ['description' => 'Lab Test', 'item_type' => 'lab', 'quantity' => 1, 'unit_price' => 1000, 'gst_rate' => 18],
            ],
        ]);

        $response->assertCreated();

        $this->assertEquals(1500, (float) $response->json('subtotal'));
        $this->assertEquals(270, (float) $response->json('tax_amount'));
        $this->assertEquals(1770, (float) $response->json('total_amount'));
        $this->assertEquals('paid', $response->json('payment_status'));

        $voucherId = $response->json('voucher_id') ?? $response->json('voucher.id');
        $voucher = \App\Models\Accounting\Voucher::findOrFail($voucherId);

        $this->assertTrue((bool) $voucher->is_balanced);
        $this->assertTrue((bool) $voucher->is_posted);
        $this->assertEquals('billing', $voucher->voucher_type);
        $this->assertEquals(1770, (float) $voucher->total_debit);
        $this->assertEquals(1770, (float) $voucher->total_credit);

        $entries = Daybook::where('voucher_no', $voucher->voucher_no)
            ->where('voucher_type', 'billing')
            ->get()
            ->keyBy('account_code');

        // Entry 1: Debit Bank/Cash 1770
        $this->assertEquals('dr', $entries['102']->drcr);
        $this->assertEquals(1770, (float) $entries['102']->amount);

        // Entry 2: Credit Consultation Revenue 500
        $this->assertEquals('cr', $entries['401']->drcr);
        $this->assertEquals(500, (float) $entries['401']->amount);

        // Entry 3: Credit Lab Revenue 1000
        $this->assertEquals('cr', $entries['402']->drcr);
        $this->assertEquals(1000, (float) $entries['402']->amount);

        // Entry 4 & 5: Credit CGST / SGST, 135 each
        $this->assertEquals('cr', $entries['202']->drcr);
        $this->assertEquals(135, (float) $entries['202']->amount);
        $this->assertEquals('cr', $entries['203']->drcr);
        $this->assertEquals(135, (float) $entries['203']->amount);

        // Balanced: total debit == total credit across all daybook lines.
        $totalDebit = $entries->where('drcr', 'dr')->sum('amount');
        $totalCredit = $entries->where('drcr', 'cr')->sum('amount');
        $this->assertEquals($totalDebit, $totalCredit);
    }

    public function test_unbalanced_voucher_is_rejected(): void
    {
        $service = app(\App\Services\Accounting\VoucherPostingService::class);

        $this->expectException(\Illuminate\Validation\ValidationException::class);

        $service->post(
            'journal',
            ['account_code' => '102', 'drcr' => 'dr', 'amount' => 100],
            [['account_code' => '401', 'drcr' => 'cr', 'amount' => 90]],
        );
    }
}
