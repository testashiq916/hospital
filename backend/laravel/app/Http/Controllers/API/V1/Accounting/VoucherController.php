<?php

namespace App\Http\Controllers\API\V1\Accounting;

use App\Http\Controllers\Controller;
use App\Models\Accounting\Voucher;
use App\Services\Accounting\VoucherPostingService;
use Illuminate\Http\Request;

class VoucherController extends Controller
{
    public function __construct(protected VoucherPostingService $vouchers) {}

    public function index(Request $request)
    {
        $query = Voucher::query();

        $query->when($request->voucher_type, fn ($q) => $q->where('voucher_type', $request->voucher_type))
            ->when($request->hospital_id, fn ($q) => $q->where('hospital_id', $request->hospital_id));

        return response()->json($query->orderByDesc('id')->paginate((int) $request->input('per_page', 20)));
    }

    public function show(Voucher $voucher)
    {
        return response()->json($voucher->load('entries'));
    }

    /**
     * Manual journal voucher posting (Journal Entries screen) — rejects
     * unbalanced entries.
     */
    public function storeJournal(Request $request)
    {
        $data = $request->validate([
            'hospital_id' => ['nullable', 'exists:hospitals,id'],
            'narration' => ['nullable', 'string'],
            'lines' => ['required', 'array', 'min:2'],
            'lines.*.account_code' => ['required', 'exists:chart_of_accounts,account_code'],
            'lines.*.drcr' => ['required', 'in:dr,cr'],
            'lines.*.amount' => ['required', 'numeric', 'min:0.01'],
            'lines.*.remarks' => ['nullable', 'string'],
        ]);

        $voucher = $this->vouchers->postJournal($data['lines'], [
            'hospital_id' => $data['hospital_id'] ?? null,
            'narration' => $data['narration'] ?? null,
        ]);

        return response()->json($voucher->load('entries'), 201);
    }
}
