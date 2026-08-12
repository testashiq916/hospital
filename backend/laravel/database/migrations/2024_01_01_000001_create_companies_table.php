<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('name');
            $table->string('code', 50)->unique();
            $table->string('email')->unique()->nullable();
            $table->string('phone', 20)->nullable();
            $table->text('address')->nullable();
            $table->string('city', 100)->nullable();
            $table->string('state', 100)->nullable();
            $table->string('country', 100)->nullable();
            $table->string('zip_code', 20)->nullable();
            $table->string('timezone', 50)->default('Asia/Kolkata');
            $table->string('currency', 10)->default('INR');
            $table->string('date_format', 20)->default('Y-m-d');
            $table->string('logo_path')->nullable();

            // Subscription
            $table->unsignedBigInteger('subscription_id')->nullable();
            $table->enum('subscription_status', ['trial', 'active', 'suspended', 'cancelled', 'expired'])->default('trial');
            $table->date('subscription_start_date')->nullable();
            $table->date('subscription_end_date')->nullable();
            $table->integer('hospital_limit')->default(1);
            $table->integer('bed_limit')->default(100);
            $table->integer('user_limit')->default(50);
            $table->unsignedBigInteger('storage_limit')->default(5368709120);

            // Hospital details
            $table->string('registration_no', 50)->nullable();
            $table->string('gstin', 50)->nullable();
            $table->string('pan', 50)->nullable();
            $table->enum('hospital_type', ['general', 'speciality', 'super_speciality'])->default('general');

            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('companies');
    }
};
