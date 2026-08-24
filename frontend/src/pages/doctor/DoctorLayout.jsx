import { useEffect, useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"

import {
  getCurrentUser,
  getMyDoctorProfile,
} from "../../services/api"


function DoctorLayout({ children }) {
  const navigate = useNavigate()

  const [doctor, setDoctor] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const token = localStorage.getItem("access_token")


  // ============================================================
  // LOAD DOCTOR
  // ============================================================

  async function loadDoctor() {
    try {
      setLoading(true)
      setError("")

      if (!token) {
        navigate("/doctor/login")
        return
      }

      const currentUser =
        await getCurrentUser(token)

      if (currentUser.role !== "DOCTOR") {
        localStorage.removeItem("access_token")
        navigate("/doctor/login")
        return
      }

      const doctorProfile =
        await getMyDoctorProfile(token)

      setUser(currentUser)
      setDoctor(doctorProfile)

    } catch (err) {
      console.error(
        "Failed to load doctor:",
        err
      )

      setError(
        err.message ||
        "Failed to load doctor information"
      )
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    loadDoctor()
  }, [])


  // ============================================================
  // LOGOUT
  // ============================================================

  function handleLogout() {
    localStorage.removeItem("access_token")
    navigate("/doctor/login")
  }


  // ============================================================
  // NAVIGATION STYLE
  // ============================================================

  function navLinkClass({ isActive }) {
    return `
      block rounded-lg px-4 py-3 text-sm transition
      ${
        isActive
          ? "bg-blue-50 font-semibold text-blue-700"
          : "font-medium text-slate-600 hover:bg-slate-50"
      }
    `
  }


  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">

        <div className="text-sm text-slate-500">
          Loading doctor dashboard...
        </div>

      </div>
    )
  }


  // ============================================================
  // ERROR
  // ============================================================

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">

        <div className="w-full max-w-md rounded-xl border border-red-200 bg-white p-6 text-center shadow-sm">

          <h2 className="text-lg font-semibold text-slate-900">
            Unable to load doctor portal
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={loadDoctor}
            className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Try Again
          </button>

        </div>

      </div>
    )
  }


  return (
    <div className="min-h-screen bg-slate-50">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="border-b border-slate-200 bg-white">

        <div className="flex h-16 items-center justify-between px-6 lg:px-10">

          {/* Logo */}

          <NavLink
            to="/doctor/dashboard"
            className="group"
          >

            <h1 className="text-lg font-bold tracking-tight text-slate-900">
              HealthScan{" "}
              <span className="text-blue-600">
                AI
              </span>
            </h1>

            <p className="text-xs text-slate-500">
              Doctor Portal
            </p>

          </NavLink>


          {/* User */}

          <div className="flex items-center gap-5">

            <div className="hidden text-right sm:block">

              <p className="text-sm font-semibold text-slate-900">
                {user?.email}
              </p>

              <p className="text-xs text-slate-500">
                Doctor
              </p>

            </div>


            {/* Sign Out */}

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:border-red-600 hover:bg-red-600 hover:text-white"
            >
              Sign Out
            </button>

          </div>

        </div>

      </header>


      {/* ======================================================
          BODY
      ====================================================== */}

      <div className="flex min-h-[calc(100vh-64px)]">

        {/* ====================================================
            SIDEBAR
        ==================================================== */}

        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block">

          <nav className="space-y-1 p-4">

            <NavLink
              to="/doctor/dashboard"
              className={navLinkClass}
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/doctor/appointments"
              className={navLinkClass}
            >
              Appointments
            </NavLink>

            <NavLink
              to="/doctor/leave"
              className={navLinkClass}
            >
              My Leave
            </NavLink>

            <NavLink
              to="/doctor/settings"
              className={navLinkClass}
            >
              Settings
            </NavLink>

          </nav>

        </aside>


        {/* ====================================================
            MAIN
        ==================================================== */}

        <main className="min-w-0 flex-1">

          {children}

        </main>

      </div>

    </div>
  )
}


export default DoctorLayout