import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { titleCase } from '@/lib/format'

export function Topbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--color-border)] bg-white px-5">
      <div className="text-sm text-slate-500">{user?.company?.name}</div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-sm font-medium text-slate-800">{user?.name}</div>
          <div className="text-xs text-slate-400">{titleCase(user?.role?.slug)}</div>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-semibold text-white">
          {user?.first_name?.[0]}
          {user?.last_name?.[0]}
        </div>
        <button
          onClick={handleLogout}
          className="ml-2 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
        >
          Log out
        </button>
      </div>
    </header>
  )
}
