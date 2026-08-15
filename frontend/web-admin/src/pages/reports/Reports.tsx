import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import type { TodaySummary, RevenueTrendPoint, DepartmentPerformance } from '@/api/reports'
import { Card, PageHeader, Spinner } from '@/components/ui/Misc'
import { Select } from '@/components/ui/Field'
import { BarChart } from '@/components/charts/BarChart'
import { formatCurrency } from '@/lib/format'

export default function ReportsPage() {
  const [days, setDays] = useState('30')

  const summaryQuery = useQuery({
    queryKey: ['reports', 'today-summary'],
    queryFn: async () => (await apiClient.get<TodaySummary>('/reports/today-summary')).data,
  })
  const trendQuery = useQuery({
    queryKey: ['reports', 'revenue-trend', days],
    queryFn: async () => (await apiClient.get<RevenueTrendPoint[]>('/reports/revenue-trend', { params: { days } })).data,
  })
  const deptQuery = useQuery({
    queryKey: ['reports', 'department-performance'],
    queryFn: async () => (await apiClient.get<DepartmentPerformance[]>('/reports/department-performance')).data,
  })
  const occupancyQuery = useQuery({
    queryKey: ['reports', 'occupancy'],
    queryFn: async () => (await apiClient.get<{ occupancy_rate: number }>('/reports/occupancy')).data,
  })

  const summary = summaryQuery.data
  const totalRevenue = (trendQuery.data ?? []).reduce((s, d) => s + Number(d.revenue), 0)
  const totalBills = (trendQuery.data ?? []).reduce((s, d) => s + Number(d.bill_count), 0)

  return (
    <div>
      <PageHeader title="Reports & Analytics" description="Operational and financial performance across the hospital." />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard label="Total Patients" value={summary?.total_patients} />
        <MetricCard label="Active Admissions" value={summary?.active_admissions} />
        <MetricCard label="Occupancy Rate" value={occupancyQuery.data ? `${occupancyQuery.data.occupancy_rate}%` : undefined} />
        <MetricCard label="Revenue Today" value={summary ? formatCurrency(summary.revenue_today) : undefined} />
      </div>

      <Card className="mt-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">Revenue Trend</h3>
          <div className="w-40">
            <Select
              label=""
              value={days}
              onChange={(e) => setDays(e.target.value)}
              options={[
                { value: '7', label: 'Last 7 days' },
                { value: '30', label: 'Last 30 days' },
                { value: '90', label: 'Last 90 days' },
              ]}
            />
          </div>
        </div>
        {trendQuery.isLoading ? (
          <Spinner />
        ) : (
          <>
            <BarChart
              data={(trendQuery.data ?? []).map((d) => ({
                label: new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
                value: Number(d.revenue),
              }))}
              valueFormatter={(v) => formatCurrency(v)}
            />
            <p className="mt-2 text-xs text-slate-400">
              {formatCurrency(totalRevenue)} across {totalBills} bills in this period.
            </p>
          </>
        )}
      </Card>

      <Card className="mt-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-800">Department Performance</h3>
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
  )
}

function MetricCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Card>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-xl font-semibold text-slate-900">{value ?? '—'}</div>
    </Card>
  )
}
