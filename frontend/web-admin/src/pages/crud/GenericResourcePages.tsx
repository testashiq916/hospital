import { ResourcePage } from '@/components/crud/ResourcePage'
import * as resources from '@/lib/resources'

export const HospitalsPage = () => <ResourcePage config={resources.hospitalsConfig} />
export const DepartmentsPage = () => <ResourcePage config={resources.departmentsConfig} />
export const WardsPage = () => <ResourcePage config={resources.wardsConfig} />
export const BedsPage = () => <ResourcePage config={resources.bedsConfig} />
export const PatientTypesPage = () => <ResourcePage config={resources.patientTypesConfig} />
export const DoctorSchedulesPage = () => <ResourcePage config={resources.doctorSchedulesConfig} />
export const DoctorUnavailabilityPage = () => <ResourcePage config={resources.doctorUnavailabilityConfig} />
export const LabTestsPage = () => <ResourcePage config={resources.labTestsConfig} />
export const RadiologyTestsPage = () => <ResourcePage config={resources.radiologyTestsConfig} />
export const MedicineCategoriesPage = () => <ResourcePage config={resources.medicineCategoriesConfig} />
export const MedicinesPage = () => <ResourcePage config={resources.medicinesConfig} />
export const SuppliersPage = () => <ResourcePage config={resources.suppliersConfig} />
export const PharmacyInventoryPage = () => <ResourcePage config={resources.pharmacyInventoryConfig} />
export const ChartOfAccountsPage = () => <ResourcePage config={resources.chartOfAccountsConfig} />
export const VisitsPage = () => <ResourcePage config={resources.visitsConfig} />
export const CaseSheetsPage = () => <ResourcePage config={resources.caseSheetsConfig} />
export const OpdRecordsPage = () => <ResourcePage config={resources.opdRecordsConfig} />
export const IpdRecordsPage = () => <ResourcePage config={resources.ipdRecordsConfig} />
export const NursingRecordsPage = () => <ResourcePage config={resources.nursingRecordsConfig} />
export const IcuRecordsPage = () => <ResourcePage config={resources.icuRecordsConfig} />
export const OtSchedulesPage = () => <ResourcePage config={resources.otSchedulesConfig} />
export const RadiologyOrdersPage = () => <ResourcePage config={resources.radiologyOrdersConfig} />
export const BloodBankPage = () => <ResourcePage config={resources.bloodBankConfig} />
export const InsuranceClaimsPage = () => <ResourcePage config={resources.insuranceClaimsConfig} />
export const AuditLogsPage = () => <ResourcePage config={resources.auditLogsConfig} />
