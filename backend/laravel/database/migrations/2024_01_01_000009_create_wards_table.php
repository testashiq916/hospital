<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies');
            $table->foreignId('hospital_id')->constrained('hospitals');
            $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->string('name');
            $table->string('code', 50);
            $table->enum('ward_type', ['general', 'semi_private', 'private', 'icu', 'nicu', 'picu', 'isolation'])->default('general');
            $table->integer('total_beds')->default(0);
            $table->integer('available_beds')->default(0);
            $table->integer('occupied_beds')->default(0);
            $table->integer('floor_number')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wards');
    }
};
