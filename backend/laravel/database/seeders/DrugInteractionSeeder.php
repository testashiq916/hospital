<?php

namespace Database\Seeders;

use App\Models\Pharmacy\DrugInteraction;
use Illuminate\Database\Seeder;

class DrugInteractionSeeder extends Seeder
{
    public function run(): void
    {
        $pairs = [
            ['Aspirin', 'Warfarin', 'major', 'Both increase bleeding risk; concurrent use significantly raises risk of major hemorrhage.', 'Avoid combination if possible; monitor INR closely if co-prescribed.'],
            ['Ibuprofen', 'Warfarin', 'major', 'NSAIDs potentiate the anticoagulant effect of warfarin and increase GI bleeding risk.', 'Avoid NSAIDs in patients on warfarin; use paracetamol for pain relief instead.'],
            ['Simvastatin', 'Clarithromycin', 'major', 'Macrolide antibiotics strongly inhibit statin metabolism (CYP3A4), raising risk of rhabdomyolysis.', 'Suspend statin during the course of clarithromycin, or switch to a non-interacting antibiotic.'],
            ['Aspirin', 'Ibuprofen', 'moderate', 'Ibuprofen may reduce the antiplatelet effect of low-dose aspirin.', 'Separate dosing by several hours; consider an alternative analgesic.'],
            ['Metformin', 'Amlodipine', 'minor', 'No clinically significant interaction expected; monitor as per routine practice.', 'No specific action generally required.'],
            ['Amoxicillin', 'Warfarin', 'moderate', 'Antibiotics can alter gut flora and increase INR / bleeding risk in patients on warfarin.', 'Monitor INR more frequently during and after the antibiotic course.'],
        ];

        foreach ($pairs as [$a, $b, $severity, $description, $recommendation]) {
            DrugInteraction::updateOrCreate(
                ['drug_a' => $a, 'drug_b' => $b],
                ['severity' => $severity, 'description' => $description, 'recommendation' => $recommendation]
            );
        }
    }
}
