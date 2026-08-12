<?php

namespace App\Services\AI;

use App\Models\Pharmacy\DrugInteraction;
use Illuminate\Support\Collection;

/**
 * Real, deterministic rule-based drug-drug interaction checker against the
 * seeded `drug_interactions` reference table. No external AI API involved.
 */
class DrugInteractionService
{
    public function checkPair(string $drugA, string $drugB): ?DrugInteraction
    {
        return DrugInteraction::where(function ($q) use ($drugA, $drugB) {
            $q->where(fn ($q2) => $q2->whereRaw('LOWER(drug_a) = ?', [strtolower($drugA)])
                ->whereRaw('LOWER(drug_b) = ?', [strtolower($drugB)]))
                ->orWhere(fn ($q2) => $q2->whereRaw('LOWER(drug_a) = ?', [strtolower($drugB)])
                    ->whereRaw('LOWER(drug_b) = ?', [strtolower($drugA)]));
        })->first();
    }

    /**
     * Given a list of drug/medicine names currently prescribed together,
     * return every pairwise interaction found in the reference table.
     */
    public function checkForNames(array $names): Collection
    {
        $names = array_values(array_unique(array_filter($names)));
        $alerts = collect();

        for ($i = 0; $i < count($names); $i++) {
            for ($j = $i + 1; $j < count($names); $j++) {
                $match = $this->checkPair($names[$i], $names[$j]);

                if ($match) {
                    $alerts->push([
                        'drug_a' => $names[$i],
                        'drug_b' => $names[$j],
                        'severity' => $match->severity,
                        'description' => $match->description,
                        'recommendation' => $match->recommendation,
                    ]);
                }
            }
        }

        return $alerts;
    }
}
