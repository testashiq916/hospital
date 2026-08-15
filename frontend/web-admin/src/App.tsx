import { Navigate, Route, Routes } from 'react-router-dom'
import { RequireAuth } from '@/auth/RequireAuth'
import { AppShell } from '@/components/layout/AppShell'
import LoginPage from '@/pages/Login'
import DashboardPage from '@/pages/dashboard/Dashboard'

import PatientsListPage from '@/pages/patients/PatientsList'
import PatientRegisterPage from '@/pages/patients/PatientRegister'
import PatientProfilePage from '@/pages/patients/PatientProfile'

import AppointmentsListPage from '@/pages/appointments/AppointmentsList'
import QueueBoardPage from '@/pages/appointments/QueueBoard'

import AdmissionsListPage from '@/pages/admissions/AdmissionsList'
import AdmissionDetailPage from '@/pages/admissions/AdmissionDetail'

import LabOrdersListPage from '@/pages/lab/LabOrdersList'
import LabOrderDetailPage from '@/pages/lab/LabOrderDetail'

import PrescriptionsPage from '@/pages/pharmacy/Prescriptions'
import DispensingPage from '@/pages/pharmacy/Dispensing'

import BillsListPage from '@/pages/billing/BillsList'
import BillBuilderPage from '@/pages/billing/BillBuilder'
import BillDetailPage from '@/pages/billing/BillDetail'
import PaymentsListPage from '@/pages/billing/PaymentsList'

import VouchersPage from '@/pages/accounting/Vouchers'
import DaybookPage from '@/pages/accounting/Daybook'
import TrialBalancePage from '@/pages/accounting/TrialBalance'

import AIFeaturesPage from '@/pages/ai/AIFeatures'
import ReportsPage from '@/pages/reports/Reports'

import CompanySettingsPage from '@/pages/settings/CompanySettings'
import UsersPage from '@/pages/settings/Users'
import RolesPage from '@/pages/settings/Roles'

import {
  HospitalsPage,
  DepartmentsPage,
  WardsPage,
  BedsPage,
  PatientTypesPage,
  DoctorSchedulesPage,
  DoctorUnavailabilityPage,
  LabTestsPage,
  RadiologyTestsPage,
  MedicineCategoriesPage,
  MedicinesPage,
  SuppliersPage,
  PharmacyInventoryPage,
  ChartOfAccountsPage,
  VisitsPage,
  CaseSheetsPage,
  OpdRecordsPage,
  IpdRecordsPage,
  NursingRecordsPage,
  IcuRecordsPage,
  OtSchedulesPage,
  RadiologyOrdersPage,
  BloodBankPage,
  InsuranceClaimsPage,
  AuditLogsPage,
} from '@/pages/crud/GenericResourcePages'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<DashboardPage />} />

          <Route path="/patients" element={<PatientsListPage />} />
          <Route path="/patients/new" element={<PatientRegisterPage />} />
          <Route path="/patients/:id" element={<PatientProfilePage />} />

          <Route path="/appointments" element={<AppointmentsListPage />} />
          <Route path="/appointments/queue" element={<QueueBoardPage />} />

          <Route path="/admissions" element={<AdmissionsListPage />} />
          <Route path="/admissions/:id" element={<AdmissionDetailPage />} />

          <Route path="/clinical/visits" element={<VisitsPage />} />
          <Route path="/clinical/opd-records" element={<OpdRecordsPage />} />
          <Route path="/clinical/ipd-records" element={<IpdRecordsPage />} />
          <Route path="/clinical/nursing-records" element={<NursingRecordsPage />} />
          <Route path="/clinical/icu-records" element={<IcuRecordsPage />} />
          <Route path="/clinical/ot-schedules" element={<OtSchedulesPage />} />
          <Route path="/clinical/case-sheets" element={<CaseSheetsPage />} />

          <Route path="/lab/orders" element={<LabOrdersListPage />} />
          <Route path="/lab/orders/:id" element={<LabOrderDetailPage />} />
          <Route path="/lab/tests" element={<LabTestsPage />} />
          <Route path="/lab/radiology-orders" element={<RadiologyOrdersPage />} />
          <Route path="/lab/radiology-tests" element={<RadiologyTestsPage />} />
          <Route path="/lab/blood-bank" element={<BloodBankPage />} />

          <Route path="/pharmacy/dispensing" element={<DispensingPage />} />
          <Route path="/pharmacy/prescriptions" element={<PrescriptionsPage />} />
          <Route path="/pharmacy/medicines" element={<MedicinesPage />} />
          <Route path="/pharmacy/categories" element={<MedicineCategoriesPage />} />
          <Route path="/pharmacy/suppliers" element={<SuppliersPage />} />
          <Route path="/pharmacy/inventory" element={<PharmacyInventoryPage />} />

          <Route path="/billing/bills" element={<BillsListPage />} />
          <Route path="/billing/bills/new" element={<BillBuilderPage />} />
          <Route path="/billing/bills/:id" element={<BillDetailPage />} />
          <Route path="/billing/payments" element={<PaymentsListPage />} />
          <Route path="/billing/insurance-claims" element={<InsuranceClaimsPage />} />

          <Route path="/accounting/chart-of-accounts" element={<ChartOfAccountsPage />} />
          <Route path="/accounting/vouchers" element={<VouchersPage />} />
          <Route path="/accounting/daybook" element={<DaybookPage />} />
          <Route path="/accounting/trial-balance" element={<TrialBalancePage />} />

          <Route path="/ai" element={<AIFeaturesPage />} />
          <Route path="/reports" element={<ReportsPage />} />

          <Route path="/hospital/hospitals" element={<HospitalsPage />} />
          <Route path="/hospital/departments" element={<DepartmentsPage />} />
          <Route path="/hospital/wards" element={<WardsPage />} />
          <Route path="/hospital/beds" element={<BedsPage />} />
          <Route path="/hospital/patient-types" element={<PatientTypesPage />} />
          <Route path="/hospital/doctor-schedules" element={<DoctorSchedulesPage />} />
          <Route path="/hospital/doctor-unavailability" element={<DoctorUnavailabilityPage />} />

          <Route path="/settings/company" element={<CompanySettingsPage />} />
          <Route path="/settings/users" element={<UsersPage />} />
          <Route path="/settings/roles" element={<RolesPage />} />
          <Route path="/settings/audit-logs" element={<AuditLogsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
