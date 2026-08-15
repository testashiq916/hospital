import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { RequireAuth } from './components/RequireAuth'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Dashboard } from './pages/Dashboard'
import { BookAppointment } from './pages/BookAppointment'
import { Appointments } from './pages/Appointments'
import { Prescriptions } from './pages/Prescriptions'
import { LabReports } from './pages/LabReports'
import { Billing } from './pages/Billing'
import { Timeline } from './pages/Timeline'
import { Family } from './pages/Family'
import { Profile } from './pages/Profile'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="/appointments/book" element={<BookAppointment />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/prescriptions" element={<Prescriptions />} />
          <Route path="/reports" element={<LabReports />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/family" element={<Family />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
