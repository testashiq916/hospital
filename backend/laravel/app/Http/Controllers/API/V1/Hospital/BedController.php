<?php

namespace App\Http\Controllers\API\V1\Hospital;

use App\Http\Controllers\API\V1\CrudController;
use App\Models\Hospital\Bed;
use App\Models\Hospital\Ward;
use Illuminate\Http\Request;

class BedController extends CrudController
{
    protected string $model = Bed::class;

    protected array $with = ['ward', 'hospital'];

    protected function applyFilters($query, Request $request)
    {
        return $query
            ->when($request->hospital_id, fn ($q) => $q->where('hospital_id', $request->hospital_id))
            ->when($request->ward_id, fn ($q) => $q->where('ward_id', $request->ward_id))
            ->when($request->status, fn ($q) => $q->where('status', $request->status));
    }

    protected function rules(Request $request, $id = null): array
    {
        return [
            'hospital_id' => ['required', 'exists:hospitals,id'],
            'ward_id' => ['required', 'exists:wards,id'],
            'bed_number' => ['required', 'string', 'max:20'],
            'bed_type' => ['nullable', 'in:general,icu,private,semi_private,isolation'],
            'daily_rate' => ['nullable', 'numeric', 'min:0'],
            'status' => ['nullable', 'in:available,occupied,reserved,cleaning,maintenance'],
            'is_active' => ['boolean'],
        ];
    }

    /**
     * Explicit bed status transition (Bed Status screen in the feature menu),
     * keeping the owning ward's available/occupied counters in sync.
     */
    public function updateStatus(Request $request, Bed $bed)
    {
        $data = $request->validate([
            'status' => ['required', 'in:available,occupied,reserved,cleaning,maintenance'],
        ]);

        $oldStatus = $bed->status;
        $bed->update(['status' => $data['status']]);

        if ($oldStatus !== $data['status']) {
            $ward = Ward::find($bed->ward_id);
            if ($ward) {
                $ward->occupied_beds = $ward->beds()->where('status', 'occupied')->count();
                $ward->available_beds = $ward->beds()->where('status', 'available')->count();
                $ward->save();
            }
        }

        return response()->json($bed->fresh(['ward']));
    }
}
