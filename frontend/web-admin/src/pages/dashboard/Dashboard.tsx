import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { apiClient } from '@/api/client'
import type { TodaySummary, RevenueTrendPoint, DepartmentPerformance } from '@/api/reports'
import { Card, PageHeader, Spinner } from '@/components/ui/Misc'
import { formatCurrency } from '@/lib/format'
import { BarChart } from '@/components/charts/BarChart'
import { useAuth } from '@/auth/AuthContext'
import { hasModule } from '@/lib/permissions'

function StatTile({ label, value, icon, accent }: { label: string; value: string; icon: string; accent: string }) {
  return (
    <Card className="flex items-center gap-3">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-xl"
        style={{ backgroundColor: accent }}
      >
        {icon}
      </div>
      <div>
        <div className="text-xs text-slate-500">{label}</div>
        <div className="text-xl font-semibold text-slate-900">{value}</div>
      </div>
    </Card>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()

  const summaryQuery = useQuery({
    queryKey: ['reports', 'today-summary'],
    queryFn: async () => (await apiClient.get<TodaySummary>('/reports/today-summary')).data,
    enabled: hasModule(user, 'reports'),
  })

  const trendQuery = useQuery({
    queryKey: ['reports', 'revenue-trend'],
    queryFn: async () => (await apiClient.get<RevenueTrendPoint[]>('/reports/revenue-trend', { params: { days: 14 } })).data,
    enabled: hasModule(user, 'reports'),
  })

  const deptQuery = useQuery({
    queryKey: ['reports', 'department-performance'],
    queryFn: async () => (await apiClient.get<DepartmentPerformance[]>('/reports/department-performance')).data,
    enabled: hasModule(user, 'reports'),
  })

  const summary = summaryQuery.data

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.first_name}`}
        description="Here's what's happening at your hospital today."
      />

      {summaryQuery.isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          <StatTile label="Total Patients" value={String(summary?.total_patients ?? 0)} icon="👤" accent="#dbeafe" />
          <StatTile label="New Today" value={String(summary?.new_registrations_today ?? 0)} icon="🆕" accent="#dcfce7" />
          <StatTile label="Appointments Today" value={String(summary?.appointments_today ?? 0)} icon="🗓️" accent="#fef3c7" />
          <StatTile label="Admissions Today" value={String(summary?.admissions_today ?? 0)} icon="🛏️" accent="#fee2e2" />
          <StatTile label="Active Admissions" value={String(summary?.active_admissions ?? 0)} icon="🏥" accent="#ede9fe" />
          <StatTile label="Occupancy Rate" value={`${summary?.occupancy_rate ?? 0}%`} icon="📈" accent="#e0f2fe" />
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Revenue trend (last 14 days)</h3>
            <span className="text-xs text-slate-400">Today: {formatCurrency(summary?.revenue_today)}</span>
          </div>
          {trendQuery.isLoading ? (
            <Spinner />
          ) : (
            <BarChart
              data={(trendQuery.data ?? []).map((d) => ({
                label: new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
                value: Number(d.revenue),
              }))}
              valueFormatter={(v) => formatCurrency(v)}
            />
          )}
        </Card>

        <Card>
          <h3 className="mb-3 text-sm font-semibold text-slate-800">Quick actions</h3>
          <div className="flex flex-col gap-2">
            <QuickAction to="/patients/new" label="Register Patient" icon="👤" />
            <QuickAction to="/appointments" label="Book Appointment" icon="🗓️" />
            <QuickAction to="/admissions" label="Admit Patient" icon="🛏️" />
            <QuickAction to="/billing/bills" label="Generate Bill" icon="💳" />
          </div>
        </Card>
      </div>

      <div className="mt-4">
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-slate-800">Department performance</h3>
          {deptQuery.isLoading ? (
            <Spinner />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase">
                    <th className="px-3 py-2 font-medium">Department</th>
                    <th className="px-3 py-2 font-medium">Wards</th>
                    <th className="px-3 py-2 font-medium">Visits</th>
                    <th className="px-3 py-2 font-medium">Admissions</th>
                  </tr>
                </thead>
                <tbody>
                  {(deptQuery.data ?? []).map((d) => (
                    <tr key={d.department_id} className="border-b border-slate-100 last:border-0">
                      <td className="px-3 py-2 text-slate-700">{d.name}</td>
                      <td className="px-3 py-2 text-slate-700">{d.wards_count}</td>
                      <td className="px-3 py-2 text-slate-700">{d.visits}</td>
                      <td className="px-3 py-2 text-slate-700">{d.admissions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

function QuickAction({ to, label, icon }: { to: string; label: string; icon: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:border-[var(--color-primary)] hover:bg-blue-50"
    >
      <span>{icon}</span>
      {label}
    </Link>
  )
}
