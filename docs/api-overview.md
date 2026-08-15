# Backend API Overview

Laravel 11 + Sanctum, source in `backend/laravel/`. Base URL in local dev:
`http://localhost:8000/api/v1`. All routes except `auth/login`, `auth/register`
require a Sanctum bearer token (`Authorization: Bearer <token>` from
`POST /api/v1/auth/login`). Every tenant-scoped resource is automatically
filtered to the authenticated user's `company_id` — cross-tenant reads are
not possible even by guessing IDs.

## Running it locally

```bash
cd backend/laravel
composer install
cp .env.example .env      # defaults to mysql; point DB_* at a real MySQL server
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

For quick local iteration without MySQL, `DB_CONNECTION=sqlite` +
`database/database.sqlite` also works (that's how the test suite runs:
`php artisan test`, 14 passing feature tests).

## Seeded demo login

Every seeded user shares the password **`Password@123`**. One user per role,
all in the demo company/hospital:

| Role | Email |
|---|---|
| Super admin | superadmin@demo-hms.test |
| Hospital admin | admin@demo-hms.test |
| Doctor | doctor@demo-hms.test |
| Nurse | nurse@demo-hms.test |
| Receptionist | receptionist@demo-hms.test |
| Lab technician | labtech@demo-hms.test |
| Pharmacist | pharmacist@demo-hms.test |
| Accountant | accountant@demo-hms.test |
| Patient | patient@demo-hms.test |

`POST /api/v1/auth/register` self-registers a brand new company/tenant (for
the "sign up your hospital" flow); `POST /api/v1/auth/login` authenticates
against an existing one and returns `{ user, token }`.

## Endpoint groups (216 routes total)

- **Auth** — `auth/login`, `auth/register`, `auth/logout`, `auth/me`
- **Hospital** — `hospitals`, `departments`, `wards`, `beds` (+ `beds/{id}/status`)
- **Patients** — `patients`, `patients/{id}/family`, `.../documents`
  (+ `.../verify`), `.../timeline`, `.../medical-history`, `patient-types`,
  `visits`, `admissions` (+ `/discharge`, `/transfer`), `case-sheets`
- **Doctors & appointments** — `doctors`, `doctors/{id}/today-queue`,
  `doctor-schedules`, `doctor-unavailability`, `appointments`
  (+ `/cancel`, `/optimal-slot/{doctorId}`), `queue-tokens`
  (+ `/call`, `/start`, `/complete`, `/skip`)
- **Clinical** — `opd-records`, `ipd-records`, `nursing-records`,
  `icu-records`, `ot-schedules` (+ `/status`)
- **Lab & radiology** — `lab-tests` (+ `/parameters`), `lab-orders`
  (+ `/collect`, `/items/{id}/result`, `/verify`), `lab-reports`,
  `radiology-tests`, `radiology-orders` (+ `/report`), `blood-bank`
  (+ `/issue`)
- **Pharmacy** — `medicine-categories`, `medicines` (+ `/low-stock`,
  `/expiring-soon`), `suppliers`, `pharmacy-inventory`, `prescriptions`,
  `pharmacy-dispensing`
- **Billing & accounting** — `bills`, `payments`, `insurance-claims`
  (+ `/approve`, `/reject`, `/settle`), `chart-of-accounts`, `vouchers`
  (+ `/journal`), `daybook` (+ `/trial-balance`)
- **AI** — `ai/symptom-checker`, `ai/icd10-coding`,
  `ai/patients/{id}/disease-risk`, `ai/patients/{id}/health-risk-score`,
  `ai/prescription-suggestions`, `ai/drug-interactions`,
  `ai/appointments/optimize/{doctorId}`,
  `ai/lab-orders/{id}/report-analysis`, `ai/chat-history`
- **Reports** — `reports/today-summary`, `/revenue-trend`,
  `/department-performance`, `/occupancy`
- **System / admin** — `settings/company`, `users` (+ `/reset-password`),
  `roles`, `permissions`, `audit-logs`, `system/health`

Run `php artisan route:list --path=api` inside `backend/laravel` for the
exhaustive, always-current list with middleware.

## Notes for frontend integrations

- AI endpoints are real deterministic rule-based services (seeded reference
  data + heuristics), not calls to a third-party LLM — no API key needed.
- `VoucherPostingService` (behind `bills`/`payments`/`vouchers/journal`)
  always posts balanced double-entry `daybook` rows; it reproduces the
  worked examples in `docs/spec/accounting-example-*.sql`.
- Pharmacy dispensing decrements `pharmacy_inventory`/`medicines.current_stock`
  atomically and rejects over-dispensing.
