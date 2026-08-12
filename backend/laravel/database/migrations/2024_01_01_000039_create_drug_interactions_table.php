<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Gap-filling reference table for the AI Drug-Interaction Alerts feature
// (docs/spec/02-feature-menu.txt). Global reference data (not tenant scoped),
// consistent with how `permissions` is a shared, company-agnostic table.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('drug_interactions', function (Blueprint $table) {
            $table->id();
            $table->string('drug_a');
            $table->string('drug_b');
            $table->enum('severity', ['minor', 'moderate', 'major'])->default('moderate');
            $table->text('description')->nullable();
            $table->text('recommendation')->nullable();
            $table->timestamps();

            $table->index(['drug_a', 'drug_b']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('drug_interactions');
    }
};
