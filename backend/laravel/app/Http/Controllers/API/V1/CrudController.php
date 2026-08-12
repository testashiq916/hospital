<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Generic REST base for the many straightforward tenant-scoped lookup /
 * master-data resources (departments, wards, beds, lab tests, medicines,
 * ...). Tenant isolation is already enforced by the model's CompanyScope
 * global scope, so this only needs to handle the standard index/store/
 * show/update/destroy shape. Workflow-heavy resources (patients,
 * appointments, admissions, lab orders, billing, accounting, AI, ...) use
 * dedicated controllers + services instead of this base.
 */
abstract class CrudController extends Controller
{
    /** @var class-string<\Illuminate\Database\Eloquent\Model> */
    protected string $model;

    protected array $with = [];

    protected string $orderBy = 'id';

    protected string $orderDirection = 'desc';

    protected int $perPage = 20;

    protected function rules(Request $request, $id = null): array
    {
        return [];
    }

    protected function applyFilters($query, Request $request)
    {
        return $query;
    }

    public function index(Request $request): JsonResponse
    {
        $query = $this->applyFilters(($this->model)::query()->with($this->with), $request);

        $items = $query->orderBy($this->orderBy, $this->orderDirection)
            ->paginate((int) $request->input('per_page', $this->perPage));

        return response()->json($items);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate($this->rules($request));

        $item = ($this->model)::create($data);

        return response()->json($item->load($this->with), 201);
    }

    public function show($id): JsonResponse
    {
        $item = ($this->model)::with($this->with)->findOrFail($id);

        return response()->json($item);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $item = ($this->model)::findOrFail($id);

        $data = $request->validate($this->rules($request, $id));

        $item->update($data);

        return response()->json($item->fresh($this->with));
    }

    public function destroy($id): JsonResponse
    {
        $item = ($this->model)::findOrFail($id);

        $item->delete();

        return response()->json(['message' => 'Deleted successfully.']);
    }
}
