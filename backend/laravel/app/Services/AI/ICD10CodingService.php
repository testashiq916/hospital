<?php

namespace App\Services\AI;

/**
 * Rule-based AI Medical Coding: matches free-text diagnosis wording against
 * a seeded keyword -> ICD-10 code reference map. Deterministic, no external
 * API calls.
 */
class ICD10CodingService
{
    /** @var array<string, array{code: string, description: string}> */
    protected const KEYWORD_MAP = [
        'type 2 diabetes' => ['code' => 'E11', 'description' => 'Type 2 diabetes mellitus'],
        'type 1 diabetes' => ['code' => 'E10', 'description' => 'Type 1 diabetes mellitus'],
        'hypertension' => ['code' => 'I10', 'description' => 'Essential (primary) hypertension'],
        'migraine' => ['code' => 'G43', 'description' => 'Migraine'],
        'asthma' => ['code' => 'J45', 'description' => 'Asthma'],
        'pneumonia' => ['code' => 'J18', 'description' => 'Pneumonia, unspecified organism'],
        'urinary tract infection' => ['code' => 'N39.0', 'description' => 'Urinary tract infection, site not specified'],
        'gastroenteritis' => ['code' => 'A09', 'description' => 'Infectious gastroenteritis and colitis, unspecified'],
        'dengue' => ['code' => 'A90', 'description' => 'Dengue fever'],
        'appendicitis' => ['code' => 'K35', 'description' => 'Acute appendicitis'],
        'myocardial infarction' => ['code' => 'I21', 'description' => 'Acute myocardial infarction'],
        'covid' => ['code' => 'U07.1', 'description' => 'COVID-19'],
        'anemia' => ['code' => 'D64.9', 'description' => 'Anemia, unspecified'],
        'fracture' => ['code' => 'T14.2', 'description' => 'Fracture of unspecified body region'],
        'fever' => ['code' => 'R50.9', 'description' => 'Fever, unspecified'],
        'chest pain' => ['code' => 'R07.9', 'description' => 'Chest pain, unspecified'],
        'headache' => ['code' => 'R51', 'description' => 'Headache'],
        'back pain' => ['code' => 'M54.5', 'description' => 'Low back pain'],
        'depression' => ['code' => 'F32', 'description' => 'Major depressive disorder, single episode'],
        'anxiety' => ['code' => 'F41.9', 'description' => 'Anxiety disorder, unspecified'],
        'covid-19' => ['code' => 'U07.1', 'description' => 'COVID-19'],
    ];

    /**
     * @return array<int, array{keyword: string, code: string, description: string}>
     */
    public function suggestCodes(string $diagnosisText): array
    {
        $text = strtolower($diagnosisText);
        $matches = [];

        foreach (self::KEYWORD_MAP as $keyword => $entry) {
            if (str_contains($text, $keyword)) {
                $matches[] = [
                    'keyword' => $keyword,
                    'code' => $entry['code'],
                    'description' => $entry['description'],
                ];
            }
        }

        return $matches;
    }

    /** @var array<string, array<string>> diagnosis keyword => suggested medicine classes */
    protected const PRESCRIPTION_SUGGESTIONS = [
        'type 2 diabetes' => ['Metformin (biguanide)', 'SGLT2 inhibitor', 'Lifestyle/diet counselling'],
        'hypertension' => ['ACE inhibitor', 'Calcium channel blocker', 'Thiazide diuretic'],
        'migraine' => ['NSAID (acute)', 'Triptan (acute)', 'Beta-blocker (prophylaxis)'],
        'asthma' => ['Inhaled short-acting beta-agonist (SABA)', 'Inhaled corticosteroid'],
        'pneumonia' => ['Amoxicillin or macrolide antibiotic (per local guidelines)', 'Antipyretic'],
        'urinary tract infection' => ['Nitrofurantoin or trimethoprim-sulfamethoxazole', 'Increased fluid intake'],
        'gastroenteritis' => ['Oral rehydration salts', 'Antiemetic'],
        'fever' => ['Paracetamol/Acetaminophen (antipyretic)'],
        'headache' => ['NSAID or Paracetamol'],
        'back pain' => ['NSAID', 'Muscle relaxant', 'Physiotherapy referral'],
        'anxiety' => ['SSRI (per specialist assessment)', 'Counselling/CBT referral'],
        'depression' => ['SSRI (per specialist assessment)', 'Counselling/CBT referral'],
    ];

    /**
     * "AI Prescription Suggestions" — folded in here since it shares the
     * same diagnosis-keyword rule set as ICD-10 coding. Suggests medicine
     * *classes*, not specific drugs/doses — a clinician must still prescribe.
     */
    public function suggestMedicineClasses(string $diagnosisText): array
    {
        $text = strtolower($diagnosisText);
        $suggestions = [];

        foreach (self::PRESCRIPTION_SUGGESTIONS as $keyword => $classes) {
            if (str_contains($text, $keyword)) {
                $suggestions[$keyword] = $classes;
            }
        }

        return $suggestions;
    }
}
