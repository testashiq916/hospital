<?php

namespace Database\Seeders;

use App\Models\Hospital\Hospital;
use App\Models\Lab\LabTest;
use App\Models\Lab\LabTestParameter;
use App\Models\Lab\RadiologyTest;
use App\Models\System\Company;
use Illuminate\Database\Seeder;

class LabRadiologySeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::where('code', 'DEMO-HMS')->firstOrFail();
        $hospital = Hospital::where('hospital_id', 'HOSP-DEMO-001')->firstOrFail();

        $tests = [
            [
                'code' => 'CBC', 'name' => 'Complete Blood Count', 'category' => 'Hematology', 'price' => 400,
                'specimen' => 'Blood', 'parameters' => [
                    ['name' => 'Hemoglobin', 'low' => 13.0, 'high' => 17.0, 'unit' => 'g/dL'],
                    ['name' => 'WBC Count', 'low' => 4000, 'high' => 11000, 'unit' => '/uL'],
                    ['name' => 'Platelet Count', 'low' => 150000, 'high' => 450000, 'unit' => '/uL'],
                ],
            ],
            [
                'code' => 'FBS', 'name' => 'Fasting Blood Sugar', 'category' => 'Biochemistry', 'price' => 150,
                'specimen' => 'Blood', 'parameters' => [
                    ['name' => 'Glucose (Fasting)', 'low' => 70, 'high' => 100, 'unit' => 'mg/dL'],
                ],
            ],
            [
                'code' => 'LIPID', 'name' => 'Lipid Profile', 'category' => 'Biochemistry', 'price' => 600,
                'specimen' => 'Blood', 'parameters' => [
                    ['name' => 'Total Cholesterol', 'low' => 0, 'high' => 200, 'unit' => 'mg/dL'],
                    ['name' => 'LDL Cholesterol', 'low' => 0, 'high' => 100, 'unit' => 'mg/dL'],
                    ['name' => 'HDL Cholesterol', 'low' => 40, 'high' => 60, 'unit' => 'mg/dL'],
                    ['name' => 'Triglycerides', 'low' => 0, 'high' => 150, 'unit' => 'mg/dL'],
                ],
            ],
            [
                'code' => 'LFT', 'name' => 'Liver Function Test', 'category' => 'Biochemistry', 'price' => 500,
                'specimen' => 'Blood', 'parameters' => [
                    ['name' => 'SGPT (ALT)', 'low' => 7, 'high' => 56, 'unit' => 'U/L'],
                    ['name' => 'SGOT (AST)', 'low' => 8, 'high' => 48, 'unit' => 'U/L'],
                    ['name' => 'Bilirubin (Total)', 'low' => 0.1, 'high' => 1.2, 'unit' => 'mg/dL'],
                ],
            ],
            [
                'code' => 'KFT', 'name' => 'Kidney Function Test', 'category' => 'Biochemistry', 'price' => 500,
                'specimen' => 'Blood', 'parameters' => [
                    ['name' => 'Creatinine', 'low' => 0.6, 'high' => 1.3, 'unit' => 'mg/dL'],
                    ['name' => 'Urea', 'low' => 7, 'high' => 20, 'unit' => 'mg/dL'],
                ],
            ],
        ];

        foreach ($tests as $test) {
            $labTest = LabTest::updateOrCreate(
                ['test_code' => $test['code']],
                [
                    'company_id' => $company->id,
                    'hospital_id' => $hospital->id,
                    'name' => $test['name'],
                    'category' => $test['category'],
                    'price' => $test['price'],
                    'turnaround_time' => 24,
                    'specimen_type' => $test['specimen'],
                    'is_active' => true,
                ]
            );

            foreach ($test['parameters'] as $param) {
                LabTestParameter::updateOrCreate(
                    ['lab_test_id' => $labTest->id, 'parameter_name' => $param['name']],
                    [
                        'normal_range_low' => $param['low'],
                        'normal_range_high' => $param['high'],
                        'unit' => $param['unit'],
                    ]
                );
            }
        }

        $radiologyTests = [
            ['code' => 'XR-CHEST', 'name' => 'Chest X-Ray', 'modality' => 'xray', 'price' => 500],
            ['code' => 'CT-HEAD', 'name' => 'CT Scan - Head', 'modality' => 'ct', 'price' => 3500],
            ['code' => 'MRI-BRAIN', 'name' => 'MRI - Brain', 'modality' => 'mri', 'price' => 6500],
            ['code' => 'USG-ABD', 'name' => 'Ultrasound - Abdomen', 'modality' => 'ultrasound', 'price' => 1200],
        ];

        foreach ($radiologyTests as $test) {
            RadiologyTest::updateOrCreate(
                ['test_code' => $test['code']],
                [
                    'company_id' => $company->id,
                    'hospital_id' => $hospital->id,
                    'name' => $test['name'],
                    'modality' => $test['modality'],
                    'price' => $test['price'],
                    'is_active' => true,
                ]
            );
        }
    }
}
