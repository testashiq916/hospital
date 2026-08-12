<?php

namespace Database\Seeders;

use App\Models\Hospital\Hospital;
use App\Models\Pharmacy\Medicine;
use App\Models\Pharmacy\MedicineCategory;
use App\Models\Pharmacy\PharmacyInventory;
use App\Models\Pharmacy\Supplier;
use App\Models\System\Company;
use Illuminate\Database\Seeder;

class PharmacySeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::where('code', 'DEMO-HMS')->firstOrFail();
        $hospital = Hospital::where('hospital_id', 'HOSP-DEMO-001')->firstOrFail();

        $categories = [
            'Analgesics' => 'ANLG',
            'Antibiotics' => 'ANTB',
            'Cardiovascular' => 'CARD',
            'Antidiabetic' => 'DIAB',
            'Anticoagulants' => 'ANTC',
        ];

        $categoryIds = [];
        foreach ($categories as $name => $code) {
            $categoryIds[$name] = MedicineCategory::updateOrCreate(
                ['company_id' => $company->id, 'hospital_id' => $hospital->id, 'code' => $code],
                ['name' => $name, 'is_active' => true]
            )->id;
        }

        $supplier = Supplier::updateOrCreate(
            ['company_id' => $company->id, 'hospital_id' => $hospital->id, 'name' => 'MedSupply India Pvt Ltd'],
            ['contact_person' => 'Rakesh Gupta', 'phone' => '+91-9123456780', 'email' => 'sales@medsupply.test', 'gstin' => '29MEDSP1234F1Z1', 'is_active' => true]
        );

        $medicines = [
            ['name' => 'Paracetamol', 'generic_name' => 'Acetaminophen', 'category' => 'Analgesics', 'strength' => '500mg', 'form' => 'Tablet', 'price' => 2.00, 'gst' => 12, 'stock' => 500],
            ['name' => 'Ibuprofen', 'generic_name' => 'Ibuprofen', 'category' => 'Analgesics', 'strength' => '400mg', 'form' => 'Tablet', 'price' => 3.00, 'gst' => 12, 'stock' => 400],
            ['name' => 'Amoxicillin', 'generic_name' => 'Amoxicillin', 'category' => 'Antibiotics', 'strength' => '500mg', 'form' => 'Capsule', 'price' => 8.00, 'gst' => 12, 'stock' => 300],
            ['name' => 'Clarithromycin', 'generic_name' => 'Clarithromycin', 'category' => 'Antibiotics', 'strength' => '250mg', 'form' => 'Tablet', 'price' => 15.00, 'gst' => 12, 'stock' => 150],
            ['name' => 'Aspirin', 'generic_name' => 'Acetylsalicylic acid', 'category' => 'Cardiovascular', 'strength' => '75mg', 'form' => 'Tablet', 'price' => 1.50, 'gst' => 12, 'stock' => 600],
            ['name' => 'Warfarin', 'generic_name' => 'Warfarin sodium', 'category' => 'Anticoagulants', 'strength' => '5mg', 'form' => 'Tablet', 'price' => 4.00, 'gst' => 12, 'stock' => 200],
            ['name' => 'Simvastatin', 'generic_name' => 'Simvastatin', 'category' => 'Cardiovascular', 'strength' => '20mg', 'form' => 'Tablet', 'price' => 6.00, 'gst' => 12, 'stock' => 250],
            ['name' => 'Metformin', 'generic_name' => 'Metformin HCl', 'category' => 'Antidiabetic', 'strength' => '500mg', 'form' => 'Tablet', 'price' => 3.50, 'gst' => 12, 'stock' => 350, 'reorder' => 400],
            ['name' => 'Amlodipine', 'generic_name' => 'Amlodipine besylate', 'category' => 'Cardiovascular', 'strength' => '5mg', 'form' => 'Tablet', 'price' => 3.00, 'gst' => 12, 'stock' => 20, 'reorder' => 50],
            ['name' => 'Cetirizine', 'generic_name' => 'Cetirizine HCl', 'category' => 'Analgesics', 'strength' => '10mg', 'form' => 'Tablet', 'price' => 1.20, 'gst' => 5, 'stock' => 300],
        ];

        foreach ($medicines as $index => $m) {
            $medicine = Medicine::updateOrCreate(
                ['medicine_code' => 'MED-'.str_pad($index + 1, 4, '0', STR_PAD_LEFT)],
                [
                    'company_id' => $company->id,
                    'hospital_id' => $hospital->id,
                    'category_id' => $categoryIds[$m['category']],
                    'name' => $m['name'],
                    'generic_name' => $m['generic_name'],
                    'strength' => $m['strength'],
                    'dosage_form' => $m['form'],
                    'unit' => 'strip',
                    'manufacturer' => 'Generic Pharma Ltd',
                    'price' => $m['price'],
                    'gst_rate' => $m['gst'],
                    'reorder_level' => $m['reorder'] ?? 50,
                    'reorder_quantity' => 200,
                    'current_stock' => $m['stock'],
                    'min_stock' => 20,
                    'max_stock' => 1000,
                    'batch_number' => 'BATCH-'.($index + 1),
                    'expiry_date' => now()->addYear(),
                    'is_active' => true,
                ]
            );

            PharmacyInventory::updateOrCreate(
                ['medicine_id' => $medicine->id, 'batch_number' => 'BATCH-'.($index + 1)],
                [
                    'company_id' => $company->id,
                    'hospital_id' => $hospital->id,
                    'quantity' => $m['stock'],
                    'unit_price' => $m['price'],
                    'purchase_date' => now()->subMonths(1)->toDateString(),
                    'expiry_date' => now()->addYear()->toDateString(),
                    'supplier_id' => $supplier->id,
                    'rack_location' => 'A-'.($index + 1),
                    'status' => 'available',
                ]
            );
        }
    }
}
