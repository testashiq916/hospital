<?php

namespace App\Services\AI;

/**
 * Rule-based (not ML) symptom -> possible-condition mapper. Deterministic
 * and fully unit-testable: scores each candidate condition by the fraction
 * of its defining symptoms present in the input, folding in
 * "AI Clinical Decision Support" as an extension of the same rule set.
 */
class SymptomCheckerService
{
    /** @var array<string, array<string>> condition => defining symptoms */
    protected const CONDITION_MAP = [
        'Common Cold' => ['runny nose', 'sneezing', 'sore throat', 'cough', 'mild fever', 'congestion'],
        'Influenza' => ['high fever', 'chills', 'body ache', 'fatigue', 'headache', 'cough', 'sore throat'],
        'Migraine' => ['headache', 'nausea', 'sensitivity to light', 'vomiting', 'visual disturbance'],
        'Gastroenteritis' => ['diarrhea', 'vomiting', 'abdominal pain', 'nausea', 'mild fever'],
        'Urinary Tract Infection' => ['burning urination', 'frequent urination', 'lower abdominal pain', 'cloudy urine', 'mild fever'],
        'Hypertensive Crisis' => ['severe headache', 'chest pain', 'shortness of breath', 'blurred vision', 'anxiety'],
        'Acute Myocardial Infarction' => ['chest pain', 'shortness of breath', 'sweating', 'left arm pain', 'nausea'],
        'Asthma Exacerbation' => ['shortness of breath', 'wheezing', 'chest tightness', 'cough'],
        'Type 2 Diabetes (uncontrolled)' => ['excessive thirst', 'frequent urination', 'fatigue', 'blurred vision', 'weight loss'],
        'Appendicitis' => ['abdominal pain', 'nausea', 'vomiting', 'mild fever', 'loss of appetite'],
        'Dengue Fever' => ['high fever', 'severe headache', 'joint pain', 'rash', 'body ache'],
        'Pneumonia' => ['high fever', 'cough', 'shortness of breath', 'chest pain', 'fatigue'],
    ];

    protected const EMERGENCY_SYMPTOMS = [
        'chest pain', 'shortness of breath', 'severe headache', 'left arm pain',
        'blurred vision', 'loss of consciousness', 'severe bleeding',
    ];

    /**
     * @param  array<string>  $symptoms
     * @return array{results: array, is_emergency: bool}
     */
    public function analyze(array $symptoms): array
    {
        $symptoms = collect($symptoms)->map(fn ($s) => strtolower(trim($s)))->filter()->unique()->values();

        $results = collect(self::CONDITION_MAP)->map(function (array $defining, string $condition) use ($symptoms) {
            $defining = collect($defining);
            $matched = $defining->filter(fn ($s) => $symptoms->contains($s));

            return [
                'condition' => $condition,
                'matched_symptoms' => $matched->values()->all(),
                'confidence' => $defining->isEmpty() ? 0 : round(($matched->count() / $defining->count()) * 100, 1),
            ];
        })
            ->filter(fn ($r) => $r['confidence'] > 0)
            ->sortByDesc('confidence')
            ->values()
            ->take(5)
            ->all();

        $isEmergency = $symptoms->intersect(self::EMERGENCY_SYMPTOMS)->isNotEmpty();

        return [
            'input_symptoms' => $symptoms->all(),
            'results' => $results,
            'is_emergency' => $isEmergency,
            'advice' => $isEmergency
                ? 'Symptoms may indicate a medical emergency. Seek immediate in-person care.'
                : 'This is a preliminary, rule-based suggestion only. Consult a doctor for diagnosis.',
        ];
    }
}
