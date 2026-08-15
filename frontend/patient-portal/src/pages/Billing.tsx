import { useEffect, useState } from 'react'
import { usePatient } from '../context/PatientContext'
import { billingApi } from '../api/billing'
import type { HospitalBill, HospitalPayment, PaymentMethod } from '../types/api'
import { Alert, Badge, Button, Card, EmptyState, Field, PageSpinner, inputClass } from '../components/ui'
import { formatCurrency, formatDate, titleCase } from '../lib/format'
import { ApiError } from '../lib/http'

const STATUS_TONE: Record<string, 'green' | 'amber' | 'red'> = {
  paid: 'green',
  partial: 'amber',
  pending: 'red',
}

export function Billing() {
  const { patient } = usePatient()
  const [bills, setBills] = useState<HospitalBill[] | null>(null)
  const [payments, setPayments] = useState<HospitalPayment[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [payingBill, setPayingBill] = useState<HospitalBill | null>(null)

  function load() {
    if (!patient) return
    Promise.all([billingApi.listBills(patient.id), billingApi.listPayments(patient.id)])
      .then(([billPage, payPage]) => {
        setBills(billPage.data)
        setPayments(payPage.data)
      })
      .catch(() => setError('Could not load your billing information.'))
  }

  useEffect(load, [patient])

  if (!patient || bills === null || payments === null) {
    return error ? <p className="text-sm text-rose-600">{error}</p> : <PageSpinner />
  }

  const outstanding = bills.reduce((sum, b) => sum + parseFloat(b.balance_amount), 0)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Bills &amp; payments</h1>
        <p className="mt-1 text-sm text-slate-500">Your billing history and outstanding balance.</p>
      </div>

      <Card className="bg-gradient-to-br from-brand-600 to-brand-700 text-white">
        <p className="text-sm text-brand-100">Outstanding balance</p>
        <p className="mt-1 text-3xl font-bold">{formatCurrency(outstanding)}</p>
      </Card>

      {error && <Alert>{error}</Alert>}

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Bills</h2>
        {bills.length === 0 ? (
          <EmptyState icon="🧾" title="No bills yet" />
        ) : (
          <div className="flex flex-col gap-3">
            {bills.map((bill) => (
              <Card key={bill.id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-slate-900">
                      {titleCase(bill.bill_type)} bill · {bill.bill_id}
                    </p>
                    <p className="text-sm text-slate-500">{formatDate(bill.bill_date)}</p>
                    <p className="mt-1 text-sm text-slate-700">
                      Total {formatCurrency(bill.total_amount)} · Paid{' '}
                      {formatCurrency(bill.paid_amount)} · Balance{' '}
                      {formatCurrency(bill.balance_amount)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge tone={STATUS_TONE[bill.payment_status]}>
                      {titleCase(bill.payment_status)}
                    </Badge>
                    {parseFloat(bill.balance_amount) > 0 && (
                      <Button size="sm" onClick={() => setPayingBill(bill)}>
                        Pay now
                      </Button>
                    )}
                  </div>
                </div>
                {bill.items && bill.items.length > 0 && (
                  <div className="mt-3 divide-y divide-slate-100 border-t border-slate-100 pt-2 text-sm text-slate-600">
                    {bill.items.map((item) => (
                      <div key={item.id} className="flex justify-between py-1.5">
                        <span>
                          {item.description} × {item.quantity}
                        </span>
                        <span>{formatCurrency(item.total)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Payment history</h2>
        {payments.length === 0 ? (
          <EmptyState icon="💳" title="No payments recorded yet" />
        ) : (
          <Card className="divide-y divide-slate-100 p-0">
            {payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">{formatCurrency(p.amount)}</p>
                  <p className="text-xs text-slate-500">
                    {titleCase(p.payment_method)} · {formatDate(p.payment_date)}
                  </p>
                </div>
                {p.transaction_id && (
                  <span className="text-xs text-slate-400">Ref: {p.transaction_id}</span>
                )}
              </div>
            ))}
          </Card>
        )}
      </section>

      {payingBill && (
        <PayModal
          bill={payingBill}
          onClose={() => setPayingBill(null)}
          onPaid={() => {
            setPayingBill(null)
            load()
          }}
        />
      )}
    </div>
  )
}

function PayModal({
  bill,
  onClose,
  onPaid,
}: {
  bill: HospitalBill
  onClose: () => void
  onPaid: () => void
}) {
  const [method, setMethod] = useState<PaymentMethod>('upi')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const balance = parseFloat(bill.balance_amount)

  async function handlePay() {
    setSubmitting(true)
    setError(null)
    try {
      await billingApi.pay({
        bill_id: bill.id,
        amount: balance,
        payment_method: method,
        transaction_id: `SIMULATED-${Date.now()}`,
        notes: 'Paid via patient portal (simulated payment — no real gateway).',
      })
      onPaid()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Payment failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <Card className="w-full max-w-md">
        <h3 className="text-lg font-semibold text-slate-900">Pay bill {bill.bill_id}</h3>
        <p className="mt-1 text-sm text-slate-500">
          Amount due: <span className="font-medium text-slate-800">{formatCurrency(balance)}</span>
        </p>

        <Alert tone="amber">
          This is a <strong>simulated payment</strong> — there's no real payment gateway wired up.
          Confirming will call the backend's real payments API as if a card/UPI charge had just
          succeeded.
        </Alert>

        <div className="mt-4">
          <Field label="Payment method">
            <select
              className={inputClass}
              value={method}
              onChange={(e) => setMethod(e.target.value as PaymentMethod)}
            >
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank transfer</option>
            </select>
          </Field>
        </div>

        {error && (
          <div className="mt-3">
            <Alert>{error}</Alert>
          </div>
        )}

        <div className="mt-5 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handlePay} disabled={submitting}>
            {submitting ? 'Processing…' : `Pay ${formatCurrency(balance)}`}
          </Button>
        </div>
      </Card>
    </div>
  )
}
