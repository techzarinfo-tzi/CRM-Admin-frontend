import { Link, Outlet } from 'react-router-dom'
import Logo from '@/components/Logo'

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/">
            <Logo className="h-8 w-auto" />
          </Link>
          <nav>
            <Link to="/blog" className="text-sm font-medium text-gray-600 hover:text-brand-700">
              Blog
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}
