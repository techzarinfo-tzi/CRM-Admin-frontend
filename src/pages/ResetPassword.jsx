import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { resetPassword } from '@/api/auth'
import Logo from '@/components/Logo'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setSubmitting(true)
    try {
      await resetPassword({ token, password })
      setDone(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <Logo className="mx-auto mb-6 h-10 w-auto" />
        <h1 className="mb-6 text-center text-xl font-semibold text-gray-900">Set a new password</h1>

        {!token ? (
          <>
            <p className="text-center text-sm text-red-600">
              This reset link is missing or invalid. Please request a new one.
            </p>
            <Link
              to="/forgot-password"
              className="mt-6 block w-full rounded-md bg-brand-700 py-2.5 text-center text-sm font-medium text-white hover:bg-brand-800"
            >
              Request a new link
            </Link>
          </>
        ) : done ? (
          <>
            <p className="text-center text-sm text-gray-600">
              Your password has been reset. You can now sign in with your new password.
            </p>
            <Link
              to="/login"
              className="mt-6 block w-full rounded-md bg-brand-700 py-2.5 text-center text-sm font-medium text-white hover:bg-brand-800"
            >
              Back to sign in
            </Link>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">New password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-600 focus:outline-none"
              />
              <p className="mt-1 text-xs text-gray-400">At least 8 characters.</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Confirm new password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-600 focus:outline-none"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-brand-700 py-2.5 text-sm font-medium text-white hover:bg-brand-800 disabled:opacity-50"
            >
              {submitting ? 'Resetting...' : 'Reset password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
