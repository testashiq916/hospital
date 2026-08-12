# Hospital Management System — Original Spec

These files were extracted from `hospital.zip` (a set of DeepSeek chat exports)
and are the source of truth for the build:

- `01-folder-structure.txt` — intended monorepo layout (Laravel backend,
  web-admin, patient-portal, Flutter mobile app, docker, scripts, docs).
- `02-feature-menu.txt` — full feature/menu tree the product must cover
  (dashboard, hospital mgmt, patient mgmt, doctor/appointments, clinical
  OPD/IPD/ICU/OT, lab & radiology, pharmacy & billing, double-entry
  accounting, AI features, patient portal, reports, settings, user mgmt).
- `03-architecture-diagram.txt` — presentation/application/data layer diagram.
- `schema-01-system.sql` … `schema-08-billing-accounting.sql` — MySQL DDL for
  every table, grouped by module. Some tables are referenced but never
  defined in the source export (`hospitals` load order vs `users`,
  `suppliers` referenced by `pharmacy_inventory`, and the AI tables implied
  by the folder structure but not scripted) — these are filled in during
  implementation, keeping column names/conventions consistent with the rest
  of the schema.
- `accounting-example-*.sql` — worked double-entry voucher scenarios (OPD
  billing with GST, IPD billing, insurance claim split, payment receipt)
  that the accounting service's posting logic must reproduce.

The system is multi-tenant SaaS: `companies` own one or more `hospitals`;
almost every operational table is scoped by `company_id` (+ `hospital_id`
where relevant).
