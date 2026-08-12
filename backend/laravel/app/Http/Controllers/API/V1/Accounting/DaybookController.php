<?php

namespace App\Http\Controllers\API\V1\Accounting;

use App\Http\Controllers\Controller;
use App\Models\Accounting\ChartOfAccount;
use App\Models\Accounting\Daybook;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DaybookController extends Controller
{
    public function index(Request $request)
    {
        $query = Daybook::query();

        $query->when($request->account_code, fn ($q) => $q->where('account_code', $request->account_code))
            ->when($request->voucher_type, fn ($q) => $q->where('voucher_type', $request->voucher_type))
            ->when($request->from_date, fn ($q) => $q->whereDate('voucher_date', '>=', $request->from_date))
            ->when($request->to_date, fn ($q) => $q->whereDate('voucher_date', '<=', $request->to_date));

        return response()->json($query->orderByDesc('slno')->paginate((int) $request->input('per_page', 50)));
    }

    /**
     * Trial Balance: sum of debits/credits per account, computed live from
     * the daybook (opening_balance + posted movements).
     */
    public function trialBalance(Request $request)
    {
        $movements = Daybook::query()
            ->select('account_code', 'drcr', DB::raw('SUM(amount) as total'))
            ->when($request->to_date, fn ($q) => $q->whereDate('voucher_date', '<=', $request->to_date))
            ->groupBy('account_code', 'drcr')
            ->get()
            ->groupBy('account_code');

        $rows = ChartOfAccount::orderBy('account_code')->get()->map(function (ChartOfAccount $account) use ($movements) {
            $entries = $movements->get($account->account_code, collect());
            $debit = (float) ($entries->firstWhere('drcr', 'dr')->total ?? 0);
            $credit = (float) ($entries->firstWhere('drcr', 'cr')->total ?? 0);

            $openingDebit = $account->account_type === 'debit' ? (float) $account->opening_balance : 0;
            $openingCredit = $account->account_type === 'credit' ? (float) $account->opening_balance : 0;

            return [
                'account_code' => $account->account_code,
                'account_name' => $account->account_name,
                'account_type' => $account->account_type,
                'total_debit' => round($openingDebit + $debit, 2),
                'total_credit' => round($openingCredit + $credit, 2),
                'closing_balance' => round(($openingDebit + $debit) - ($openingCredit + $credit), 2),
            ];
        });

        return response()->json([
            'accounts' => $rows,
            'total_debit' => round($rows->sum('total_debit'), 2),
            'total_credit' => round($rows->sum('total_credit'), 2),
        ]);
    }
}
