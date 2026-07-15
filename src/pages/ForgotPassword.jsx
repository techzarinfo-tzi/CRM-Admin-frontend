import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '@/api/auth'
import Logo from '@/components/Logo'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await forgotPassword({ email })
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <Logo className="mx-auto mb-6 h-10 w-auto" />
        <h1 className="mb-2 text-center text-xl font-semibold text-gray-900">Forgot password</h1>

        {sent ? (
          <>
            <p className="mt-4 text-center text-sm text-gray-600">
              If an account exists for <span className="font-medium text-gray-900">{email}</span>, a password
              reset link has been sent. Check your inbox.
            </p>
            <Link
              to="/login"
              className="mt-6 block w-full rounded-md bg-brand-700 py-2.5 text-center text-sm font-medium text-white hover:bg-brand-800"
            >
              Back to sign in
            </Link>
          </>
        ) : (
          <>
            <p className="mb-6 text-center text-sm text-gray-500">
              Enter your email and we'll send you a link to reset your password.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-600 focus:outline-none"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-md bg-brand-700 py-2.5 text-sm font-medium text-white hover:bg-brand-800 disabled:opacity-50"
              >
                {submitting ? 'Sending...' : 'Send reset link'}
              </button>
            </form>
            <p className="mt-4 text-center text-sm text-gray-500">
              <Link to="/login" className="font-medium text-brand-700 hover:underline">
                Back to sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
