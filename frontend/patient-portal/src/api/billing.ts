import { http } from '../lib/http'
import type { HospitalBill, HospitalPayment, Paginated, PaymentMethod } from '../types/api'

export interface RecordPaymentInput {
  bill_id: number
  amount: number
  payment_method: PaymentMethod
  transaction_id?: string
  notes?: string
}

export const billingApi = {
  listBills: (patientId: number) =>
    http.get<Paginated<HospitalBill>>('/bills', { patient_id: patientId, per_page: 50 }),
  getBill: (id: number) => http.get<HospitalBill>(`/bills/${id}`),
  listPayments: (patientId: number) =>
    http.get<Paginated<HospitalPayment>>('/payments', { patient_id: patientId, per_page: 50 }),
  /**
   * Simulated payment: there is no real payment gateway wired up anywhere in
   * this build. This calls the real backend `payments` endpoint (which posts
   * a real double-entry accounting voucher) exactly as if a card/UPI charge
   * had just succeeded — see README "What's simulated".
   */
  pay: (payload: RecordPaymentInput) => http.post<HospitalPayment>('/payments', payload),
}
