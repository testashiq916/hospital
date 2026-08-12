<?php

namespace App\Models\AI;

use App\Models\Hospital\Hospital;
use App\Models\Patient\Patient;
use App\Models\System\Company;
use App\Models\System\User;
use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AIChatHistory extends Model
{
    use HasFactory, BelongsToCompany;

    protected $table = 'ai_chat_histories';

    protected $fillable = [
        'company_id', 'hospital_id', 'patient_id', 'user_id', 'session_id', 'type',
        'input', 'output', 'created_by',
    ];

    protected $casts = [
        'input' => 'array',
        'output' => 'array',
    ];

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

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
