export interface TodaySummary {
  date: string
  total_patients: number
  new_registrations_today: number
  appointments_today: number
  admissions_today: number
  active_admissions: number
  revenue_today: number
  occupancy_rate: number
}

export interface RevenueTrendPoint {
  date: string
  revenue: number
  bill_count: number
}

export interface DepartmentPerformance {
  department_id: number
  name: string
  wards_count: number
  visits: number
  admissions: number
}

export interface OccupancyResponse {
  occupancy_rate: number
}
