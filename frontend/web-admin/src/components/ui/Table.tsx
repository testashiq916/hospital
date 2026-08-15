import type { ReactNode } from 'react'

export interface TableColumn<T> {
  key: string
  label: string
  render?: (row: T) => ReactNode
  className?: string
}

export function Table<T extends { id: number | string }>({
  columns,
  rows,
  actions,
  onRowClick,
}: {
  columns: TableColumn<T>[]
  rows: T[]
  actions?: (row: T) => ReactNode
  onRowClick?: (row: T) => void
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs tracking-wide text-slate-500 uppercase">
            {columns.map((col) => (
              <th key={col.key} className={`px-3 py-2 font-medium ${col.className ?? ''}`}>
                {col.label}
              </th>
            ))}
            {actions && <th className="px-3 py-2 text-right font-medium">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className={`border-b border-slate-100 last:border-0 hover:bg-slate-50 ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <td key={col.key} className={`px-3 py-2.5 align-top text-slate-700 ${col.className ?? ''}`}>
                  {col.render ? col.render(row) : String((row as any)[col.key] ?? '—')}
                </td>
              ))}
              {actions && (
                <td className="px-3 py-2.5 text-right align-top" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-1.5">{actions(row)}</div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
