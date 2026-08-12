<?php

namespace App\Services\Pharmacy;

use App\Models\Pharmacy\Medicine;
use App\Models\Pharmacy\PharmacyDispensing;
use App\Models\Pharmacy\PharmacyDispensingItem;
use App\Models\Pharmacy\PharmacyInventory;
use App\Models\Pharmacy\Prescription;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Dispenses a prescription: deducts stock using FEFO (First-Expire-First-Out)
 * batch selection from pharmacy_inventory, keeps medicines.current_stock in
 * sync, and computes GST/discount line totals.
 */
class PharmacyDispensingService
{
    public function dispense(Prescription $prescription, array $items): PharmacyDispensing
    {
        return DB::transaction(function () use ($prescription, $items) {
            $dispensing = PharmacyDispensing::create([
                'company_id' => $prescription->company_id,
                'hospital_id' => $prescription->hospital_id,
                'patient_id' => $prescription->patient_id,
                'prescription_id' => $prescription->id,
                'dispensing_date' => now()->toDateString(),
                'dispensing_time' => now()->toTimeString(),
                'pharmacist_id' => Auth::id(),
            ]);

            foreach ($items as $line) {
                $medicine = Medicine::lockForUpdate()->findOrFail($line['medicine_id']);
                $quantity = (int) $line['quantity'];

                if ($medicine->current_stock < $quantity) {
                    throw ValidationException::withMessages([
                        'medicine_id' => "Insufficient stock for {$medicine->name}. Available: {$medicine->current_stock}, requested: {$quantity}.",
                    ]);
                }

                $remaining = $quantity;
                $batches = PharmacyInventory::where('medicine_id', $medicine->id)
                    ->where('quantity', '>', 0)
                    ->where('status', '!=', 'expired')
                    ->orderBy('expiry_date')
                    ->lockForUpdate()
                    ->get();

                $unitPrice = $line['unit_price'] ?? $medicine->price;
                $discountPercent = $line['discount_percent'] ?? 0;
                $gstRate = $medicine->gst_rate ?? 0;
                $usedBatch = null;

                foreach ($batches as $batch) {
                    if ($remaining <= 0) {
                        break;
                    }

                    $take = min($remaining, $batch->quantity);
                    $batch->quantity -= $take;
                    $batch->status = $batch->quantity <= 0 ? 'disposed' : ($batch->quantity <= $medicine->reorder_level ? 'low_stock' : 'available');
                    $batch->save();

                    $usedBatch ??= $batch;
                    $remaining -= $take;
                }

                // If no batch-level inventory rows exist/cover the full
                // quantity (e.g. stock was never received into a batch), the
                // dispense still proceeds against the medicine's aggregate
                // current_stock counter, decremented below.

                $discountAmount = round($unitPrice * $quantity * ($discountPercent / 100), 2);
                $taxableAmount = ($unitPrice * $quantity) - $discountAmount;
                $gstAmount = round($taxableAmount * ($gstRate / 100), 2);
                $total = round($taxableAmount + $gstAmount, 2);

                PharmacyDispensingItem::create([
                    'dispensing_id' => $dispensing->id,
                    'medicine_id' => $medicine->id,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'batch_number' => $usedBatch?->batch_number,
                    'expiry_date' => $usedBatch?->expiry_date,
                    'discount_percent' => $discountPercent,
                    'discount_amount' => $discountAmount,
                    'gst_rate' => $gstRate,
                    'gst_amount' => $gstAmount,
                    'total' => $total,
                ]);

                $medicine->decrement('current_stock', $quantity);
            }

            $prescription->update(['status' => 'completed']);

            return $dispensing->load('items.medicine');
        });
    }

    public function lowStockMedicines(int $companyId, ?int $hospitalId = null): \Illuminate\Support\Collection
    {
        return Medicine::whereColumn('current_stock', '<=', 'reorder_level')
            ->when($hospitalId, fn ($q) => $q->where('hospital_id', $hospitalId))
            ->get();
    }

    public function expiringSoon(int $days = 30): \Illuminate\Support\Collection
    {
        return PharmacyInventory::whereNotNull('expiry_date')
            ->whereBetween('expiry_date', [now()->toDateString(), now()->addDays($days)->toDateString()])
            ->where('quantity', '>', 0)
            ->with('medicine')
            ->get();
    }
}
