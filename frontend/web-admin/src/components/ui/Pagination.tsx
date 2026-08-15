import { Button } from './Button'

export function Pagination({
  currentPage,
  lastPage,
  total,
  from,
  to,
  onPageChange,
}: {
  currentPage: number
  lastPage: number
  total: number
  from: number | null
  to: number | null
  onPageChange: (page: number) => void
}) {
  if (lastPage <= 1 && total === 0) return null

  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-1 py-3 text-sm text-slate-500">
      <span>
        {from ?? 0}–{to ?? 0} of {total}
      </span>
      <div className="flex items-center gap-1.5">
        <Button
          size="sm"
          variant="secondary"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Prev
        </Button>
        <span className="px-2 text-xs">
          Page {currentPage} of {lastPage || 1}
        </span>
        <Button
          size="sm"
          variant="secondary"
          disabled={currentPage >= lastPage}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
