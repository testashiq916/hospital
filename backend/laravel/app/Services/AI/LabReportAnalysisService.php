<?php

namespace App\Services\AI;

use App\Models\Lab\LabOrder;

/**
 * AI Lab-Report Analysis: summarizes abnormal parameters in a lab order into
 * a human-readable clinical interpretation and a 0-100 risk score. Purely
 * rule-based over the recorded results/normal ranges.
 */
class LabReportAnalysisService
{
    public function analyze(LabOrder $labOrder): array
    {
        $items = $labOrder->items()->with('labTest')->get();
        $total = max(1, $items->count());
        $abnormal = $items->where('is_abnormal', true);

        $findings = $abnormal->map(function ($item) {
            $direction = null;

            if ($item->result !== null && $item->range_low !== null && $item->range_high !== null) {
                $direction = (float) $item->result > (float) $item->range_high ? 'high' : 'low';
            }

            return [
                'test' => $item->labTest?->name,
                'result' => $item->result ?? $item->result_text,
                'unit' => $item->unit,
                'normal_range' => $item->range_low !== null && $item->range_high !== null
                    ? "{$item->range_low}-{$item->range_high}"
                    : null,
                'direction' => $direction,
            ];
        })->values();

        $riskScore = round(($abnormal->count() / $total) * 100, 2);

        $interpretation = $findings->isEmpty()
            ? 'All tested parameters are within normal reference ranges.'
            : 'Abnormal findings: '.$findings->map(fn ($f) => "{$f['test']} is {$f['direction']} ({$f['result']} {$f['unit']}, normal {$f['normal_range']})")->implode('; ').'.';

        return [
            'lab_order_id' => $labOrder->id,
            'total_parameters' => $total,
            'abnormal_count' => $abnormal->count(),
            'risk_score' => $riskScore,
            'findings' => $findings->all(),
            'interpretation' => $interpretation,
            'recommendation' => $riskScore > 0
                ? 'Correlate abnormal findings clinically; consider specialist referral if symptomatic.'
                : 'No abnormal findings detected; routine follow-up as clinically indicated.',
        ];
    }
}
