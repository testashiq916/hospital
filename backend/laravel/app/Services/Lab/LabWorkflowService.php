<?php

namespace App\Services\Lab;

use App\Events\Lab\LabOrderCreated;
use App\Events\Lab\LabReportGenerated;
use App\Models\Lab\LabOrder;
use App\Models\Lab\LabOrderItem;
use App\Models\Lab\LabReport;
use App\Models\Lab\LabTest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

/**
 * Implements the order -> collect -> result -> verify -> report workflow for
 * the Laboratory Information System, auto-flagging is_abnormal from each lab
 * test parameter's normal range.
 */
class LabWorkflowService
{
    public function createOrder(array $data, array $testIds): LabOrder
    {
        return DB::transaction(function () use ($data, $testIds) {
            $data['company_id'] = $data['company_id'] ?? Auth::user()?->company_id;
            $data['order_date'] = now()->toDateString();
            $data['order_time'] = now()->toTimeString();
            $data['created_by'] = Auth::id();

            $order = LabOrder::create($data);

            foreach (LabTest::whereIn('id', $testIds)->get() as $test) {
                LabOrderItem::create([
                    'lab_order_id' => $order->id,
                    'lab_test_id' => $test->id,
                    'result_status' => 'pending',
                ]);
            }

            LabOrderCreated::dispatch($order);

            return $order->load('items.labTest');
        });
    }

    public function collectSample(LabOrder $order, ?string $specimenId = null): LabOrder
    {
        $order->update([
            'status' => 'collected',
            'collected_by' => Auth::id(),
            'collected_at' => now(),
        ]);

        if ($specimenId) {
            $order->items()->update(['specimen_id' => $specimenId, 'sample_collected_at' => now()]);
        } else {
            $order->items()->update(['sample_collected_at' => now()]);
        }

        return $order->fresh(['items']);
    }

    /**
     * Enter a result for one order item. Auto-flags is_abnormal by comparing
     * against the item's (or the underlying lab_test_parameters') normal range.
     */
    public function enterResult(LabOrderItem $item, array $data): LabOrderItem
    {
        $item->fill($data);

        $rangeLow = $item->range_low ?? $item->labTest?->parameters()->min('normal_range_low');
        $rangeHigh = $item->range_high ?? $item->labTest?->parameters()->max('normal_range_high');

        $item->range_low = $item->range_low ?? $rangeLow;
        $item->range_high = $item->range_high ?? $rangeHigh;

        if ($item->result !== null && $rangeLow !== null && $rangeHigh !== null) {
            $item->is_abnormal = ((float) $item->result < (float) $rangeLow) || ((float) $item->result > (float) $rangeHigh);
        }

        $item->result_status = $item->is_abnormal ? 'abnormal' : 'completed';
        $item->save();

        $order = $item->labOrder;
        if ($order && $order->items()->whereIn('result_status', ['pending', 'processing'])->doesntExist()) {
            $order->update(['status' => 'completed', 'completed_at' => now()]);
        }

        return $item->fresh();
    }

    public function verifyAndReport(LabOrder $order, array $data): LabReport
    {
        return DB::transaction(function () use ($order, $data) {
            $abnormalCount = $order->items()->where('is_abnormal', true)->count();
            $totalCount = max(1, $order->items()->count());
            $riskScore = round(($abnormalCount / $totalCount) * 100, 2);

            $report = LabReport::create([
                'company_id' => $order->company_id,
                'hospital_id' => $order->hospital_id,
                'lab_order_id' => $order->id,
                'patient_id' => $order->patient_id,
                'report_date' => now()->toDateString(),
                'report_time' => now()->toTimeString(),
                'report_title' => $data['report_title'] ?? 'Laboratory Report',
                'clinical_interpretation' => $data['clinical_interpretation'] ?? null,
                'recommendation' => $data['recommendation'] ?? null,
                'is_verified' => true,
                'verified_by' => Auth::id(),
                'verified_at' => now(),
                'ai_risk_score' => $riskScore,
                'status' => 'reported',
                'created_by' => Auth::id(),
            ]);

            LabReportGenerated::dispatch($report);

            return $report;
        });
    }
}
