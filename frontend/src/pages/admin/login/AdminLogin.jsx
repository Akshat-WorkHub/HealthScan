import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../../../context/AuthContext"

function AdminLogin() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleLogin(event) {
    event.preventDefault()

    setError("")
    setLoading(true)

    try {
      const user = await login({
        email,
        password,
      })

      if (user.role !== "ADMIN") {
        setError("This account is not an admin account.")
        return
      }

      navigate("/admin/dashboard")
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <header className="h-[68px] border-b border-slate-200 bg-white">
        <div className="flex h-full items-center justify-between px-8">

          <Link
            to="/"
            className="text-xl font-bold tracking-tight text-slate-900"
          >
            HealthScan <span className="text-blue-600">AI</span>
          </Link>

          <Link
            to="/"
            className="text-sm font-medium text-slate-500 transition hover:text-blue-600"
          >
            Back to Home
          </Link>

        </div>
      </header>

      {/* Main */}
      <main className="flex min-h-[calc(100vh-68px)] items-center justify-center px-4 py-12">

        {/* Login Card */}
        <div className="w-full max-w-[430px] rounded-2xl border border-slate-200 bg-white px-8 py-9 shadow-sm">

          {/* Heading */}
          <div className="text-center">

            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.8"
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3l7 4v5c0 4.5-3 7.8-7 9-4-1.2-7-4.5-7-9V7l7-4z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.5 12l1.7 1.7 3.5-3.5"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Admin Sign In
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Sign in to manage the HealthScan platform.
            </p>

          </div>

          {/* Form */}
          <form
            onSubmit={handleLogin}
            className="mt-8"
          >

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="text-sm font-semibold text-slate-700"
              >
                Email Address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@example.com"
                required
                autoComplete="email"
                className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Password */}
            <div className="mt-5">
              <label
                htmlFor="password"
                className="text-sm font-semibold text-slate-700"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Forgot Password */}
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                className="text-xs font-medium text-blue-600 transition hover:text-blue-700 hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-6 h-11 w-full rounded-lg bg-blue-600 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

          </form>

          {/* Security Note */}
          <div className="mt-7 border-t border-slate-100 pt-5 text-center">
            <p className="text-xs leading-5 text-slate-400">
              Authorized administrators only.
              <br />
              Access to system management features is restricted.
            </p>
          </div>

        </div>

      </main>
    </div>
  )
}

export default AdminLogin