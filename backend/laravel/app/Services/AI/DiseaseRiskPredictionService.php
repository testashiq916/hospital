<?php

namespace App\Services\AI;

use App\Models\Patient\Patient;

/**
 * Rule-based (weighted scoring) Disease-Risk Prediction. Deterministic
 * heuristic scoring against known clinical risk factors — not a trained ML
 * model, but genuinely computed from patient data rather than hardcoded.
 */
class DiseaseRiskPredictionService
{
    /**
     * @return array<string, array{score: float, level: string, factors: array}>
     */
    public function predict(Patient $patient, array $vitals = []): array
    {
        $age = $patient->date_of_birth ? $patient->date_of_birth->age : ($patient->age ?? 0);
        $bmi = $this->bmi($vitals['height_cm'] ?? null, $vitals['weight_kg'] ?? null);
        $systolic = $this->parseSystolic($vitals['blood_pressure'] ?? $patient->blood_pressure);
        $chronic = strtolower((string) $patient->chronic_diseases);
        $family = strtolower((string) $patient->family_history);
        $smoker = (bool) ($vitals['smoker'] ?? false);

        return [
            'diabetes' => $this->diabetesRisk($age, $bmi, $chronic, $family),
            'hypertension' => $this->hypertensionRisk($age, $bmi, $systolic, $chronic, $smoker),
            'cardiovascular_disease' => $this->cardiovascularRisk($age, $bmi, $systolic, $smoker, $family),
        ];
    }

    protected function diabetesRisk(int $age, ?float $bmi, string $chronic, string $family): array
    {
        $score = 0;
        $factors = [];

        if ($age >= 45) {
            $score += 20;
            $factors[] = 'age >= 45';
        }
        if ($bmi !== null && $bmi >= 25) {
            $score += 25;
            $factors[] = 'BMI >= 25 (overweight)';
        }
        if (str_contains($chronic, 'diabetes')) {
            $score += 40;
            $factors[] = 'existing diabetes diagnosis on record';
        }
        if (str_contains($family, 'diabetes')) {
            $score += 15;
            $factors[] = 'family history of diabetes';
        }

        return $this->result($score, $factors);
    }

    protected function hypertensionRisk(int $age, ?float $bmi, ?int $systolic, string $chronic, bool $smoker): array
    {
        $score = 0;
        $factors = [];

        if ($age >= 40) {
            $score += 15;
            $factors[] = 'age >= 40';
        }
        if ($bmi !== null && $bmi >= 30) {
            $score += 20;
            $factors[] = 'BMI >= 30 (obese)';
        }
        if ($systolic !== null && $systolic >= 130) {
            $score += 35;
            $factors[] = "systolic BP {$systolic} mmHg";
        }
        if (str_contains($chronic, 'hypertension') || str_contains($chronic, 'blood pressure')) {
            $score += 20;
            $factors[] = 'existing hypertension diagnosis on record';
        }
        if ($smoker) {
            $score += 10;
            $factors[] = 'smoker';
        }

        return $this->result($score, $factors);
    }

    protected function cardiovascularRisk(int $age, ?float $bmi, ?int $systolic, bool $smoker, string $family): array
    {
        $score = 0;
        $factors = [];

        if ($age >= 50) {
            $score += 20;
            $factors[] = 'age >= 50';
        }
        if ($bmi !== null && $bmi >= 30) {
            $score += 15;
            $factors[] = 'BMI >= 30 (obese)';
        }
        if ($systolic !== null && $systolic >= 140) {
            $score += 25;
            $factors[] = "systolic BP {$systolic} mmHg";
        }
        if ($smoker) {
            $score += 20;
            $factors[] = 'smoker';
        }
        if (str_contains($family, 'heart') || str_contains($family, 'cardiac')) {
            $score += 20;
            $factors[] = 'family history of heart disease';
        }

        return $this->result($score, $factors);
    }

    protected function result(int $score, array $factors): array
    {
        $score = min(100, $score);

        return [
            'score' => (float) $score,
            'level' => match (true) {
                $score >= 70 => 'high',
                $score >= 35 => 'moderate',
                default => 'low',
            },
            'factors' => $factors,
        ];
    }

    protected function bmi(?float $heightCm, ?float $weightKg): ?float
    {
        if (! $heightCm || ! $weightKg || $heightCm <= 0) {
            return null;
        }

        $heightM = $heightCm / 100;

        return round($weightKg / ($heightM * $heightM), 1);
    }

    protected function parseSystolic(?string $bloodPressure): ?int
    {
        if (! $bloodPressure || ! str_contains($bloodPressure, '/')) {
            return null;
        }

        [$systolic] = explode('/', $bloodPressure);

        return is_numeric(trim($systolic)) ? (int) trim($systolic) : null;
    }
}
