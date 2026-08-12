<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hospitals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies');
            $table->string('hospital_id', 50)->unique();
            $table->string('name');
            $table->string('code', 50);
            $table->text('address')->nullable();
            $table->string('city', 100)->nullable();
            $table->string('state', 100)->nullable();
            $table->string('country', 100)->nullable();
            $table->string('zip_code', 20)->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('email')->nullable();
            $table->string('ambulance_phone', 20)->nullable();
            $table->string('emergency_phone', 20)->nullable();
            $table->string('administrator')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->enum('hospital_type', ['general', 'speciality', 'super_speciality'])->default('general');
            $table->json('facility_types')->nullable();
            $table->integer('total_beds')->default(0);
            $table->integer('available_beds')->default(0);
            $table->integer('total_doctors')->default(0);
            $table->integer('total_nurses')->default(0);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_head_office')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hospitals');
    }
};
