import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useLeadNotifications } from '@/hooks/useLeadNotifications'
import Logo from '@/components/Logo'

const navItems = [
  { label: 'Leads', to: '/', end: true },
  { label: 'Blogs', to: '/blogs', end: false },
]

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  useLeadNotifications()

  return (
    <div className="min-h-screen bg-gray-50">
      {mobileNavOpen && (
        <button
          aria-label="Close menu"
          onClick={() => setMobileNavOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-gray-200 bg-white p-4 transition-transform duration-200 ease-in-out md:w-60 md:translate-x-0 ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Logo className="mb-8 h-8 w-auto" />
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileNavOpen(false)}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2.5 text-sm font-medium ${
                  isActive
                    ? 'bg-brand-700 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-h-screen flex-col md:ml-60">
        <header className="flex items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              aria-label="Open menu"
              onClick={() => setMobileNavOpen(true)}
              className="-ml-1 rounded-md p-2 text-gray-600 hover:bg-gray-100 md:hidden"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>
            <span className="truncate text-sm text-gray-500">
              Welcome back{user ? `, ${user.name}` : ''}
            </span>
          </div>
          <button
            onClick={logout}
            className="shrink-0 rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Log out
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
