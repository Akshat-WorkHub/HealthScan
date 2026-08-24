import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { useAuth } from "../../../context/AuthContext"

function DoctorLogin() {
  const navigate = useNavigate()
  
  const { login } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")


  async function handleSubmit(event) {
      event.preventDefault()

      setError("")

      if (!email.trim() || !password) {
        setError("Please enter your email and password.")
        return
      }

      try {
        setLoading(true)

        const currentUser = await login({
          email,
          password,
        })

        if (currentUser.role !== "DOCTOR") {
          throw new Error(
            "This login is only available for doctor accounts."
          )
        }

        navigate("/doctor/dashboard")

      } catch (err) {
        console.error("Doctor login failed:", err)

        setError(
          err.message ||
          "Unable to login. Please check your credentials."
        )
      } finally {
        setLoading(false)
      }
  }


  return (
    <div className="min-h-screen bg-slate-50">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

          <div>

            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              HealthScan{" "}
              <span className="text-blue-600">
                AI
              </span>
            </h1>

            <p className="text-xs text-slate-500">
              Healthcare Management System
            </p>

          </div>


          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
          >
            Back to Home
          </button>

        </div>

      </header>


      {/* ======================================================
          LOGIN
      ====================================================== */}

      <main className="flex min-h-[calc(100vh-64px)] items-center justify-center px-6 py-12">

        <div className="w-full max-w-md">

          {/* Title */}

          <div className="mb-8 text-center">

            <h2 className="text-2xl font-bold text-slate-900">
              Doctor Login
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Sign in to access your doctor dashboard.
            </p>

          </div>


          {/* Card */}

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* Error */}

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">

                  <p className="text-sm text-red-600">
                    {error}
                  </p>

                </div>
              )}


              {/* Email */}

              <div>

                <label
                  htmlFor="doctor-email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Email
                </label>

                <input
                  id="doctor-email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="doctor@example.com"
                  autoComplete="email"
                  disabled={loading}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                />

              </div>


              {/* Password */}

              <div>

                <label
                  htmlFor="doctor-password"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Password
                </label>

                <input
                  id="doctor-password"
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={loading}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                />

              </div>


              {/* Login Button */}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Signing in..."
                  : "Sign In"}
              </button>

            </form>


            {/* Patient/Admin Login */}

            <div className="mt-6 border-t border-slate-200 pt-6 text-center">

              <p className="text-sm text-slate-500">
                Are you a patient?
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate("/patient/login")
                }
                className="mt-2 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
              >
                Patient Login
              </button>

            </div>

          </div>

        </div>

      </main>

    </div>
  )
}


export default DoctorLogin