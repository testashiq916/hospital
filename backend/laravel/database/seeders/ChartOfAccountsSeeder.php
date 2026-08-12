<?php

namespace Database\Seeders;

use App\Models\Accounting\ChartOfAccount;
use App\Models\System\Company;
use Illuminate\Database\Seeder;

/**
 * Starter chart of accounts matching the account codes used throughout
 * docs/spec/accounting-example-*.sql (102 bank, 104 accounts receivable,
 * 105 insurance receivable, 202/203 CGST/SGST payable, 401-403 revenue
 * heads) plus a few more to round out a usable double-entry ledger.
 */
class ChartOfAccountsSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::where('code', 'DEMO-HMS')->firstOrFail();

        $accounts = [
            ['account_code' => '101', 'account_name' => 'Cash in Hand', 'group_code' => 'ASSET', 'head_code' => '100', 'account_type' => 'debit'],
            ['account_code' => '102', 'account_name' => 'Bank Account', 'group_code' => 'ASSET', 'head_code' => '100', 'account_type' => 'debit'],
            ['account_code' => '104', 'account_name' => 'Accounts Receivable - Patients', 'group_code' => 'ASSET', 'head_code' => '100', 'account_type' => 'debit'],
            ['account_code' => '105', 'account_name' => 'Insurance Receivable', 'group_code' => 'ASSET', 'head_code' => '100', 'account_type' => 'debit'],
            ['account_code' => '110', 'account_name' => 'Pharmacy Inventory', 'group_code' => 'ASSET', 'head_code' => '110', 'account_type' => 'debit'],
            ['account_code' => '201', 'account_name' => 'Accounts Payable - Suppliers', 'group_code' => 'LIABILITY', 'head_code' => '200', 'account_type' => 'credit'],
            ['account_code' => '202', 'account_name' => 'GST Payable - CGST', 'group_code' => 'LIABILITY', 'head_code' => '200', 'account_type' => 'credit'],
            ['account_code' => '203', 'account_name' => 'GST Payable - SGST', 'group_code' => 'LIABILITY', 'head_code' => '200', 'account_type' => 'credit'],
            ['account_code' => '204', 'account_name' => 'GST Payable - IGST', 'group_code' => 'LIABILITY', 'head_code' => '200', 'account_type' => 'credit'],
            ['account_code' => '401', 'account_name' => 'Consultation Revenue', 'group_code' => 'INCOME', 'head_code' => '400', 'account_type' => 'credit'],
            ['account_code' => '402', 'account_name' => 'Lab Revenue', 'group_code' => 'INCOME', 'head_code' => '400', 'account_type' => 'credit'],
            ['account_code' => '403', 'account_name' => 'Room Revenue', 'group_code' => 'INCOME', 'head_code' => '400', 'account_type' => 'credit'],
            ['account_code' => '404', 'account_name' => 'Pharmacy Revenue', 'group_code' => 'INCOME', 'head_code' => '400', 'account_type' => 'credit'],
            ['account_code' => '405', 'account_name' => 'Radiology Revenue', 'group_code' => 'INCOME', 'head_code' => '400', 'account_type' => 'credit'],
            ['account_code' => '406', 'account_name' => 'Procedure Revenue', 'group_code' => 'INCOME', 'head_code' => '400', 'account_type' => 'credit'],
            ['account_code' => '501', 'account_name' => 'Discount Allowed', 'group_code' => 'EXPENSE', 'head_code' => '500', 'account_type' => 'debit'],
            ['account_code' => '502', 'account_name' => 'Salaries & Wages', 'group_code' => 'EXPENSE', 'head_code' => '500', 'account_type' => 'debit'],
        ];

        foreach ($accounts as $account) {
            ChartOfAccount::updateOrCreate(
                ['account_code' => $account['account_code']],
                array_merge($account, [
                    'company_id' => $company->id,
                    'opening_balance' => 0,
                    'current_balance' => 0,
                    'status' => 'active',
                    'is_system' => true,
                ])
            );
        }
    }
}
