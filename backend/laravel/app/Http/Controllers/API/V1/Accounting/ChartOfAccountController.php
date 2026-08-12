<?php

namespace App\Http\Controllers\API\V1\Accounting;

use App\Http\Controllers\API\V1\CrudController;
use App\Models\Accounting\ChartOfAccount;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChartOfAccountController extends CrudController
{
    protected string $model = ChartOfAccount::class;

    protected string $orderBy = 'account_code';

    protected string $orderDirection = 'asc';

    protected function rules(Request $request, $id = null): array
    {
        return [
            'account_code' => ['required', 'string', 'max:20', 'unique:chart_of_accounts,account_code'],
            'account_name' => ['required', 'string', 'max:255'],
            'group_code' => ['required', 'string', 'max:20'],
            'head_code' => ['required', 'string', 'max:20'],
            'account_type' => ['required', 'in:debit,credit'],
            'opening_balance' => ['nullable', 'numeric'],
        ];
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate($this->rules($request));
        $data['created_by'] = Auth::id();
        $data['current_balance'] = $data['opening_balance'] ?? 0;

        return response()->json(ChartOfAccount::create($data), 201);
    }
}
