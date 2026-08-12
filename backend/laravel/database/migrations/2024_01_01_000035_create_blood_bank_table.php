<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('blood_bank', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies');
            $table->foreignId('hospital_id')->constrained('hospitals');
            $table->string('donor_id', 50)->nullable();
            $table->string('donor_name')->nullable();
            $table->string('blood_group', 10);
            $table->enum('rh_factor', ['positive', 'negative'])->default('positive');
            $table->enum('component_type', ['whole_blood', 'packed_rbc', 'platelets', 'plasma', 'cryoprecipitate'])->default('whole_blood');
            $table->decimal('quantity', 10, 2)->default(0);
            $table->string('unit', 20)->default('ml');
            $table->date('collection_date')->nullable();
            $table->date('expiry_date')->nullable();
            $table->boolean('is_screened')->default(false);
            $table->text('screening_results')->nullable();
            $table->enum('status', ['available', 'reserved', 'issued', 'expired', 'discarded'])->default('available');
            $table->foreignId('issued_to_patient_id')->nullable()->constrained('patients')->nullOnDelete();
            $table->foreignId('issued_by')->nullable()->constrained('users');
            $table->timestamp('issued_at')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blood_bank');
    }
};
