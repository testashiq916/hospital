<?php

use App\Http\Controllers\API\V1\Accounting\ChartOfAccountController;
use App\Http\Controllers\API\V1\Accounting\DaybookController;
use App\Http\Controllers\API\V1\Accounting\VoucherController;
use App\Http\Controllers\API\V1\AI\AIController;
use App\Http\Controllers\API\V1\Appointment\AppointmentController;
use App\Http\Controllers\API\V1\Appointment\QueueTokenController;
use App\Http\Controllers\API\V1\Auth\AuthController;
use App\Http\Controllers\API\V1\Billing\HospitalBillController;
use App\Http\Controllers\API\V1\Billing\HospitalPaymentController;
use App\Http\Controllers\API\V1\Billing\InsuranceClaimController;
use App\Http\Controllers\API\V1\Clinical\ICURecordController;
use App\Http\Controllers\API\V1\Clinical\IPDRecordController;
use App\Http\Controllers\API\V1\Clinical\NursingRecordController;
use App\Http\Controllers\API\V1\Clinical\OPDRecordController;
use App\Http\Controllers\API\V1\Clinical\OTScheduleController;
use App\Http\Controllers\API\V1\Doctor\DoctorController;
use App\Http\Controllers\API\V1\Doctor\DoctorScheduleController;
use App\Http\Controllers\API\V1\Doctor\DoctorUnavailabilityController;
use App\Http\Controllers\API\V1\Hospital\BedController;
use App\Http\Controllers\API\V1\Hospital\DepartmentController;
use App\Http\Controllers\API\V1\Hospital\HospitalController;
use App\Http\Controllers\API\V1\Hospital\WardController;
use App\Http\Controllers\API\V1\Lab\BloodBankController;
use App\Http\Controllers\API\V1\Lab\LabOrderController;
use App\Http\Controllers\API\V1\Lab\LabReportController;
use App\Http\Controllers\API\V1\Lab\LabTestController;
use App\Http\Controllers\API\V1\Lab\RadiologyOrderController;
use App\Http\Controllers\API\V1\Lab\RadiologyTestController;
use App\Http\Controllers\API\V1\Patient\CaseSheetController;
use App\Http\Controllers\API\V1\Patient\PatientAdmissionController;
use App\Http\Controllers\API\V1\Patient\PatientController;
use App\Http\Controllers\API\V1\Patient\PatientDocumentController;
use App\Http\Controllers\API\V1\Patient\PatientFamilyController;
use App\Http\Controllers\API\V1\Patient\PatientTypeController;
use App\Http\Controllers\API\V1\Patient\PatientVisitController;
use App\Http\Controllers\API\V1\Pharmacy\MedicineCategoryController;
use App\Http\Controllers\API\V1\Pharmacy\MedicineController;
use App\Http\Controllers\API\V1\Pharmacy\PharmacyDispensingController;
use App\Http\Controllers\API\V1\Pharmacy\PharmacyInventoryController;
use App\Http\Controllers\API\V1\Pharmacy\PrescriptionController;
use App\Http\Controllers\API\V1\Pharmacy\SupplierController;
use App\Http\Controllers\API\V1\Reports\ReportsController;
use App\Http\Controllers\API\V1\System\AuditLogController;
use App\Http\Controllers\API\V1\System\CompanySettingsController;
use App\Http\Controllers\API\V1\System\PermissionController;
use App\Http\Controllers\API\V1\System\RoleController;
use App\Http\Controllers\API\V1\System\SystemHealthController;
use App\Http\Controllers\API\V1\System\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // ---------------------------------------------------------------
    // Auth
    // ---------------------------------------------------------------
    Route::prefix('auth')->group(function () {
        Route::post('register', [AuthController::class, 'register']);
        Route::post('login', [AuthController::class, 'login']);

        Route::middleware('auth:sanctum')->group(function () {
            Route::post('logout', [AuthController::class, 'logout']);
            Route::get('me', [AuthController::class, 'me']);
        });
    });

    Route::middleware(['auth:sanctum', 'company.active'])->group(function () {

        // -------------------------------------------------------
        // Hospital Management
        // -------------------------------------------------------
        Route::middleware('permission:hospitals.view')->group(function () {
            Route::get('hospitals', [HospitalController::class, 'index']);
            Route::get('hospitals/{hospital}', [HospitalController::class, 'show']);
        });
        Route::middleware('permission:hospitals.manage')->group(function () {
            Route::post('hospitals', [HospitalController::class, 'store']);
            Route::put('hospitals/{hospital}', [HospitalController::class, 'update']);
            Route::delete('hospitals/{hospital}', [HospitalController::class, 'destroy']);
        });

        Route::apiResource('departments', DepartmentController::class)->middleware('permission:departments.manage');
        Route::apiResource('wards', WardController::class)->middleware('permission:wards.manage');
        Route::apiResource('beds', BedController::class)->middleware('permission:beds.manage');
        Route::patch('beds/{bed}/status', [BedController::class, 'updateStatus'])->middleware('permission:beds.manage');

        // -------------------------------------------------------
        // Patient Management
        // -------------------------------------------------------
        Route::apiResource('patient-types', PatientTypeController::class)->middleware('permission:patients.manage');

        Route::middleware('permission:patients.view')->group(function () {
            Route::get('patients', [PatientController::class, 'index']);
            Route::get('patients/{patient}', [PatientController::class, 'show']);
            Route::get('patients/{patient}/medical-history', [PatientController::class, 'medicalHistory']);
            Route::get('patients/{patient}/timeline', [PatientController::class, 'timeline']);
        });
        Route::middleware('permission:patients.manage')->group(function () {
            Route::post('patients', [PatientController::class, 'store']);
            Route::put('patients/{patient}', [PatientController::class, 'update']);
            Route::delete('patients/{patient}', [PatientController::class, 'destroy']);

            Route::get('patients/{patient}/family', [PatientFamilyController::class, 'index']);
            Route::post('patients/{patient}/family', [PatientFamilyController::class, 'store']);
            Route::put('patients/{patient}/family/{familyMember}', [PatientFamilyController::class, 'update']);
            Route::delete('patients/{patient}/family/{familyMember}', [PatientFamilyController::class, 'destroy']);

            Route::get('patients/{patient}/documents', [PatientDocumentController::class, 'index']);
            Route::post('patients/{patient}/documents', [PatientDocumentController::class, 'store']);
            Route::post('patients/{patient}/documents/{document}/verify', [PatientDocumentController::class, 'verify']);
            Route::delete('patients/{patient}/documents/{document}', [PatientDocumentController::class, 'destroy']);
        });

        Route::apiResource('visits', PatientVisitController::class)->only(['index', 'store', 'show', 'update'])
            ->middleware('permission:patient_records.manage');

        Route::middleware('permission:patient_records.manage')->group(function () {
            Route::apiResource('admissions', PatientAdmissionController::class)->only(['index', 'store', 'show']);
            Route::post('admissions/{admission}/discharge', [PatientAdmissionController::class, 'discharge']);
            Route::post('admissions/{admission}/transfer', [PatientAdmissionController::class, 'transfer']);

            Route::apiResource('case-sheets', CaseSheetController::class)->only(['index', 'store', 'show', 'update']);
        });

        // -------------------------------------------------------
        // Doctor & Appointment
        // -------------------------------------------------------
        Route::middleware('permission:doctors.view')->group(function () {
            Route::get('doctors', [DoctorController::class, 'index']);
            Route::get('doctors/{doctor}/today-queue', [DoctorController::class, 'todayQueue']);
        });

        Route::apiResource('doctor-schedules', DoctorScheduleController::class)->middleware('permission:doctors.manage');
        Route::apiResource('doctor-unavailability', DoctorUnavailabilityController::class)->middleware('permission:doctors.manage');

        Route::middleware('permission:appointments.view')->group(function () {
            Route::get('appointments', [AppointmentController::class, 'index']);
            Route::get('appointments/{appointment}', [AppointmentController::class, 'show']);
            Route::get('appointments/optimal-slot/{doctorId}', [AppointmentController::class, 'optimalSlot']);
        });
        Route::middleware('permission:appointments.manage')->group(function () {
            Route::post('appointments', [AppointmentController::class, 'store']);
            Route::put('appointments/{appointment}', [AppointmentController::class, 'update']);
            Route::post('appointments/{appointment}/cancel', [AppointmentController::class, 'cancel']);

            Route::get('queue-tokens', [QueueTokenController::class, 'index']);
            Route::post('queue-tokens/{queueToken}/call', [QueueTokenController::class, 'call']);
            Route::post('queue-tokens/{queueToken}/start', [QueueTokenController::class, 'start']);
            Route::post('queue-tokens/{queueToken}/complete', [QueueTokenController::class, 'complete']);
            Route::post('queue-tokens/{queueToken}/skip', [QueueTokenController::class, 'skip']);
        });

        // -------------------------------------------------------
        // Clinical Management
        // -------------------------------------------------------
        Route::middleware('permission:clinical.manage')->group(function () {
            Route::apiResource('opd-records', OPDRecordController::class);
            Route::apiResource('ipd-records', IPDRecordController::class);
            Route::apiResource('nursing-records', NursingRecordController::class);
            Route::apiResource('icu-records', ICURecordController::class);
            Route::apiResource('ot-schedules', OTScheduleController::class);
            Route::patch('ot-schedules/{otSchedule}/status', [OTScheduleController::class, 'updateStatus']);
        });

        // -------------------------------------------------------
        // Laboratory & Radiology
        // -------------------------------------------------------
        Route::apiResource('lab-tests', LabTestController::class)->middleware('permission:lab.manage');
        Route::post('lab-tests/{labTest}/parameters', [LabTestController::class, 'addParameter'])->middleware('permission:lab.manage');

        Route::middleware('permission:lab.view')->group(function () {
            Route::get('lab-orders', [LabOrderController::class, 'index']);
            Route::get('lab-orders/{labOrder}', [LabOrderController::class, 'show']);
            Route::get('lab-reports', [LabReportController::class, 'index']);
            Route::get('lab-reports/{labReport}', [LabReportController::class, 'show']);
        });
        Route::middleware('permission:lab.manage')->group(function () {
            Route::post('lab-orders', [LabOrderController::class, 'store']);
            Route::post('lab-orders/{labOrder}/collect', [LabOrderController::class, 'collect']);
            Route::post('lab-orders/{labOrder}/items/{item}/result', [LabOrderController::class, 'enterResult']);
            Route::post('lab-orders/{labOrder}/verify', [LabOrderController::class, 'verify']);
        });

        Route::apiResource('radiology-tests', RadiologyTestController::class)->middleware('permission:radiology.manage');
        Route::middleware('permission:radiology.manage')->group(function () {
            Route::apiResource('radiology-orders', RadiologyOrderController::class);
            Route::post('radiology-orders/{radiologyOrder}/report', [RadiologyOrderController::class, 'report']);
        });

        Route::apiResource('blood-bank', BloodBankController::class)->middleware('permission:blood_bank.manage');
        Route::post('blood-bank/{bloodBank}/issue', [BloodBankController::class, 'issue'])->middleware('permission:blood_bank.manage');

        // -------------------------------------------------------
        // Pharmacy & Billing
        // -------------------------------------------------------
        Route::apiResource('medicine-categories', MedicineCategoryController::class)->middleware('permission:pharmacy.manage');
        Route::apiResource('suppliers', SupplierController::class)->middleware('permission:pharmacy.manage');

        Route::middleware('permission:pharmacy.view')->group(function () {
            Route::get('medicines', [MedicineController::class, 'index']);
            Route::get('medicines/low-stock', [MedicineController::class, 'lowStock']);
            Route::get('medicines/expiring-soon', [MedicineController::class, 'expiringSoon']);
            Route::get('medicines/{medicine}', [MedicineController::class, 'show']);
        });
        Route::middleware('permission:pharmacy.manage')->group(function () {
            Route::post('medicines', [MedicineController::class, 'store']);
            Route::put('medicines/{medicine}', [MedicineController::class, 'update']);
            Route::delete('medicines/{medicine}', [MedicineController::class, 'destroy']);

            Route::apiResource('pharmacy-inventory', PharmacyInventoryController::class);
        });

        Route::middleware('permission:prescriptions.manage')->group(function () {
            Route::apiResource('prescriptions', PrescriptionController::class)->only(['index', 'store', 'show']);
            Route::apiResource('pharmacy-dispensing', PharmacyDispensingController::class)->only(['index', 'store', 'show']);
        });

        Route::middleware('permission:billing.view')->group(function () {
            Route::get('bills', [HospitalBillController::class, 'index']);
            Route::get('bills/{bill}', [HospitalBillController::class, 'show']);
            Route::get('payments', [HospitalPaymentController::class, 'index']);
        });
        Route::middleware('permission:billing.manage')->group(function () {
            Route::post('bills', [HospitalBillController::class, 'store']);
            Route::post('payments', [HospitalPaymentController::class, 'store']);
        });

        Route::middleware('permission:insurance.manage')->group(function () {
            Route::apiResource('insurance-claims', InsuranceClaimController::class)->only(['index', 'store', 'show']);
            Route::post('insurance-claims/{insuranceClaim}/approve', [InsuranceClaimController::class, 'approve']);
            Route::post('insurance-claims/{insuranceClaim}/settle', [InsuranceClaimController::class, 'settle']);
            Route::post('insurance-claims/{insuranceClaim}/reject', [InsuranceClaimController::class, 'reject']);
        });

        // -------------------------------------------------------
        // Accounting (Double-Entry)
        // -------------------------------------------------------
        Route::apiResource('chart-of-accounts', ChartOfAccountController::class)->middleware('permission:accounting.manage');

        Route::middleware('permission:accounting.view')->group(function () {
            Route::get('vouchers', [VoucherController::class, 'index']);
            Route::get('vouchers/{voucher}', [VoucherController::class, 'show']);
            Route::get('daybook', [DaybookController::class, 'index']);
            Route::get('daybook/trial-balance', [DaybookController::class, 'trialBalance']);
        });
        Route::post('vouchers/journal', [VoucherController::class, 'storeJournal'])->middleware('permission:accounting.manage');

        // -------------------------------------------------------
        // AI Features
        // -------------------------------------------------------
        Route::middleware('permission:ai.use')->prefix('ai')->group(function () {
            Route::post('symptom-checker', [AIController::class, 'symptomChecker']);
            Route::post('icd10-coding', [AIController::class, 'icd10Coding']);
            Route::post('prescription-suggestions', [AIController::class, 'prescriptionSuggestions']);
            Route::post('patients/{patient}/disease-risk', [AIController::class, 'diseaseRiskPrediction']);
            Route::get('patients/{patient}/health-risk-score', [AIController::class, 'healthRiskScore']);
            Route::post('drug-interactions', [AIController::class, 'drugInteractions']);
            Route::get('lab-orders/{labOrder}/report-analysis', [AIController::class, 'labReportAnalysis']);
            Route::get('appointments/optimize/{doctorId}', [AIController::class, 'appointmentOptimization']);
            Route::get('chat-history', [AIController::class, 'chatHistory']);
        });

        // -------------------------------------------------------
        // Reports & Analytics
        // -------------------------------------------------------
        Route::middleware('permission:reports.view')->prefix('reports')->group(function () {
            Route::get('today-summary', [ReportsController::class, 'todaySummary']);
            Route::get('revenue-trend', [ReportsController::class, 'revenueTrend']);
            Route::get('department-performance', [ReportsController::class, 'departmentPerformance']);
            Route::get('occupancy', [ReportsController::class, 'occupancy']);
        });

        // -------------------------------------------------------
        // System Settings & User Management
        // -------------------------------------------------------
        Route::middleware('permission:settings.manage')->group(function () {
            Route::get('settings/company', [CompanySettingsController::class, 'show']);
            Route::put('settings/company', [CompanySettingsController::class, 'update']);
        });

        Route::middleware('permission:users.manage')->group(function () {
            Route::apiResource('users', UserController::class);
            Route::post('users/{user}/reset-password', [UserController::class, 'resetPassword']);
        });

        Route::middleware('permission:roles.manage')->group(function () {
            Route::apiResource('roles', RoleController::class);
        });

        Route::get('permissions', [PermissionController::class, 'index']);

        Route::middleware('permission:audit.view')->get('audit-logs', [AuditLogController::class, 'index']);

        Route::get('system/health', [SystemHealthController::class, 'index']);
    });
});
