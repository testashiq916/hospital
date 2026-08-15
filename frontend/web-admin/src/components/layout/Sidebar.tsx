import { NavLink as RouterNavLink } from 'react-router-dom'
import { NAV_SECTIONS } from '@/lib/nav'
import { useAuth } from '@/auth/AuthContext'
import { hasModule } from '@/lib/permissions'

export function Sidebar() {
  const { user } = useAuth()

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col overflow-y-auto bg-[var(--color-sidebar)] text-[var(--color-sidebar-text)]">
      <div className="flex items-center gap-2 px-4 py-4 text-white">
        <span className="text-xl">🏥</span>
        <div>
          <div className="text-sm font-semibold leading-tight">HMS Admin</div>
          <div className="text-[11px] text-slate-400 leading-tight">{user?.hospital?.name ?? 'Hospital'}</div>
        </div>
      </div>
      <nav className="flex-1 space-y-4 px-2 pb-6">
        {NAV_SECTIONS.map((section) => {
          const visibleLinks = section.links.filter((l) => hasModule(user, l.module))
          if (visibleLinks.length === 0) return null
          return (
            <div key={section.label}>
              <div className="flex items-center gap-1.5 px-2 pb-1 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                <span>{section.icon}</span>
                {section.label}
              </div>
              <div className="flex flex-col gap-0.5">
                {visibleLinks.map((link) => (
                  <RouterNavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/'}
                    className={({ isActive }) =>
                      `rounded-md px-3 py-1.5 text-sm transition-colors ${
                        isActive
                          ? 'bg-[var(--color-sidebar-active)] text-white'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`
                    }
                  >
                    {link.label}
                  </RouterNavLink>
                ))}
              </div>
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
