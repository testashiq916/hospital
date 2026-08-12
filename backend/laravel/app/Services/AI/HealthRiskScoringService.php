<?php

namespace App\Services\AI;

use App\Models\Patient\Patient;

/**
 * Aggregate Health-Risk Scoring: combines age, chronic condition count, and
 * recent abnormal lab results into a single 0-100 score. Rule-based and
 * deterministic.
 */
class HealthRiskScoringService
{
    public function score(Patient $patient): array
    {
        $score = 0;
        $factors = [];

        $age = $patient->date_of_birth ? $patient->date_of_birth->age : ($patient->age ?? 0);

        if ($age >= 65) {
            $score += 25;
            $factors[] = 'age >= 65';
        } elseif ($age >= 45) {
            $score += 12;
            $factors[] = 'age >= 45';
        }

        $chronicCount = $patient->chronic_diseases
            ? count(array_filter(array_map('trim', explode(',', $patient->chronic_diseases))))
            : 0;

        if ($chronicCount > 0) {
            $add = min(40, $chronicCount * 15);
            $score += $add;
            $factors[] = "{$chronicCount} chronic condition(s) on record";
        }

        if ($patient->is_deceased) {
            $score = 100;
            $factors[] = 'patient record marked deceased';
        }

        $abnormalRatio = $patient->labOrders()
            ->with('items')
            ->get()
            ->flatMap(fn ($order) => $order->items)
            ->groupBy(fn () => 1)
            ->map(function ($items) {
                $total = $items->count();

                return $total > 0 ? $items->where('is_abnormal', true)->count() / $total : 0;
            })
            ->first();

        if ($abnormalRatio) {
            $add = round($abnormalRatio * 30);
            $score += $add;
            $factors[] = 'recent abnormal lab results: '.round($abnormalRatio * 100).'%';
        }

        $score = (int) min(100, $score);

        return [
            'score' => $score,
            'category' => match (true) {
                $score >= 70 => 'high',
                $score >= 35 => 'moderate',
                default => 'low',
            },
            'factors' => $factors,
        ];
    }
}
