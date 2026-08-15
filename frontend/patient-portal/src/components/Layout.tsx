import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usePatient } from '../context/PatientContext'
import { CompleteProfile } from './CompleteProfile'
import { PageSpinner } from './ui'

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: '🏠', end: true },
  { to: '/appointments/book', label: 'Book Appointment', icon: '📅' },
  { to: '/appointments', label: 'My Appointments', icon: '🗓️' },
  { to: '/prescriptions', label: 'Prescriptions', icon: '💊' },
  { to: '/reports', label: 'Lab & Radiology', icon: '🧪' },
  { to: '/billing', label: 'Bills & Payments', icon: '💳' },
  { to: '/timeline', label: 'Health Timeline', icon: '📈' },
  { to: '/family', label: 'Family', icon: '👨‍👩‍👧' },
  { to: '/profile', label: 'Profile', icon: '👤' },
]

export function Layout() {
  const { user, logout } = useAuth()
  const { patient, isLoading: patientLoading, needsProfile } = usePatient()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="flex items-center gap-2 px-6 py-5">
          <span className="text-2xl">🏥</span>
          <span className="text-lg font-semibold text-slate-900">City Care</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-200 p-4">
          <p className="truncate text-sm font-medium text-slate-800">
            {patient ? `${patient.first_name} ${patient.last_name}` : user?.name}
          </p>
          <p className="truncate text-xs text-slate-500">{user?.email}</p>
          <button
            onClick={handleLogout}
            className="mt-3 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Log out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏥</span>
            <span className="font-semibold text-slate-900">City Care</span>
          </div>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </header>
        {menuOpen && (
          <nav className="flex flex-col gap-1 border-b border-slate-200 bg-white px-3 py-2 md:hidden">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                    isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600'
                  }`
                }
              >
                <span aria-hidden>{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-rose-600"
            >
              🚪 Log out
            </button>
          </nav>
        )}

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 md:px-8 md:py-8">
          {patientLoading ? <PageSpinner /> : needsProfile ? <CompleteProfile /> : <Outlet />}
        </main>
      </div>
    </div>
  )
}
