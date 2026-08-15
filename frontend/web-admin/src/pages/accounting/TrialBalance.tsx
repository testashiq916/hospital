import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { Card, PageHeader, Spinner, EmptyState } from '@/components/ui/Misc'
import { formatCurrency } from '@/lib/format'

interface TrialBalanceRow {
  account_code: string
  account_name: string
  account_type: string
  total_debit: number
  total_credit: number
  closing_balance: number
}

export default function TrialBalancePage() {
  const query = useQuery({
    queryKey: ['daybook', 'trial-balance'],
    queryFn: async () =>
      (await apiClient.get<{ accounts: TrialBalanceRow[]; total_debit: number; total_credit: number }>('/daybook/trial-balance')).data,
  })

  const data = query.data

  return (
    <div>
      <PageHeader title="Trial Balance" description="Live debit/credit balances per account, computed from the daybook." />
      <Card>
        {query.isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : !data || data.accounts.length === 0 ? (
          <EmptyState message="No accounts to display." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase">
                  <th className="px-3 py-2 font-medium">Code</th>
                  <th className="px-3 py-2 font-medium">Account</th>
                  <th className="px-3 py-2 font-medium text-right">Debit</th>
                  <th className="px-3 py-2 font-medium text-right">Credit</th>
                  <th className="px-3 py-2 font-medium text-right">Closing Balance</th>
                </tr>
              </thead>
              <tbody>
                {data.accounts.map((row) => (
                  <tr key={row.account_code} className="border-b border-slate-100 last:border-0">
                    <td className="px-3 py-2 text-slate-500">{row.account_code}</td>
                    <td className="px-3 py-2 text-slate-700">{row.account_name}</td>
                    <td className="px-3 py-2 text-right text-slate-700">{formatCurrency(row.total_debit)}</td>
                    <td className="px-3 py-2 text-right text-slate-700">{formatCurrency(row.total_credit)}</td>
                    <td className={`px-3 py-2 text-right font-medium ${row.closing_balance < 0 ? 'text-red-600' : 'text-slate-800'}`}>
                      {formatCurrency(row.closing_balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-300 font-semibold text-slate-900">
                  <td className="px-3 py-2" colSpan={2}>
                    Total
                  </td>
                  <td className="px-3 py-2 text-right">{formatCurrency(data.total_debit)}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(data.total_credit)}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(data.total_debit - data.total_credit)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
