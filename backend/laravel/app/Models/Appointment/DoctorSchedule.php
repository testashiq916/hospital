<?php

namespace App\Models\Appointment;

use App\Models\Hospital\Hospital;
use App\Models\System\Company;
use App\Models\System\User;
use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DoctorSchedule extends Model
{
    use HasFactory, BelongsToCompany;

    protected $fillable = [
        'company_id', 'hospital_id', 'doctor_id', 'day_of_week', 'start_time',
        'end_time', 'slot_duration', 'max_patients', 'is_available', 'is_recurring',
        'start_date', 'end_date', 'location', 'consultation_fee',
    ];

    protected $casts = [
        'is_available' => 'boolean',
        'is_recurring' => 'boolean',
        'start_date' => 'date',
        'end_date' => 'date',
        'consultation_fee' => 'decimal:2',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function hospital(): BelongsTo
    {
        return $this->belongsTo(Hospital::class);
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }
}
