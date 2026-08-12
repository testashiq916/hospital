<?php

namespace App\Models\Patient;

use App\Models\Hospital\Hospital;
use App\Models\System\Company;
use App\Models\System\User;
use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CaseSheet extends Model
{
    use HasFactory, BelongsToCompany;

    protected $fillable = [
        'company_id', 'hospital_id', 'patient_id', 'admission_id', 'visit_id',
        'doctor_id', 'case_sheet_id', 'note_date', 'note_time', 'note_type',
        'subjective', 'objective', 'assessment', 'plan', 'vitals', 'investigations',
        'treatment_given', 'remarks', 'status', 'created_by',
    ];

    protected $casts = [
        'note_date' => 'date',
        'vitals' => 'array',
    ];

    protected static function booted(): void
    {
        static::creating(function (CaseSheet $sheet) {
            $sheet->case_sheet_id ??= 'CS-'.date('Y').'-'.strtoupper(uniqid());
        });
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function hospital(): BelongsTo
    {
        return $this->belongsTo(Hospital::class);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function admission(): BelongsTo
    {
        return $this->belongsTo(PatientAdmission::class, 'admission_id');
    }

    public function visit(): BelongsTo
    {
        return $this->belongsTo(PatientVisit::class, 'visit_id');
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }
}
