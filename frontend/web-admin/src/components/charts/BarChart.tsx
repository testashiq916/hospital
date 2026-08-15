interface BarDatum {
  label: string
  value: number
}

/** Minimal dependency-free bar chart for small trend visualizations. */
export function BarChart({ data, valueFormatter }: { data: BarDatum[]; valueFormatter?: (v: number) => string }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  const fmt = valueFormatter ?? ((v: number) => String(v))

  if (data.length === 0) {
    return <div className="flex h-40 items-center justify-center text-sm text-slate-400">No data yet.</div>
  }

  return (
    <div className="flex h-48 items-end gap-1.5 overflow-x-auto pb-1">
      {data.map((d) => (
        <div key={d.label} className="flex min-w-[28px] flex-1 flex-col items-center gap-1" title={`${d.label}: ${fmt(d.value)}`}>
          <div className="flex h-36 w-full items-end">
            <div
              className="w-full rounded-t-sm bg-[var(--color-primary)] transition-all"
              style={{ height: `${Math.max(2, (d.value / max) * 100)}%` }}
            />
          </div>
          <span className="text-[10px] whitespace-nowrap text-slate-400">{d.label}</span>
        </div>
      ))}
    </div>
  )
}
