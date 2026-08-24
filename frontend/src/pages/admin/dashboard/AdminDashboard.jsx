import { useEffect, useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../../../context/AuthContext"
import { getAdminDashboardStats } from "../../../services/api"

function AdminDashboard() {
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()

  const [stats, setStats] = useState({
    total_doctors: 0,
    total_patients: 0,
    total_appointments: 0,
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function loadDashboardStats() {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        setError("")

        const data = await getAdminDashboardStats(token)

        setStats(data)
      } catch (error) {
        setError(error.message || "Unable to load dashboard statistics")
      } finally {
        setLoading(false)
      }
    }

    loadDashboardStats()
  }, [token])

  function handleLogout() {
    logout()
    navigate("/admin/login")
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <header className="border-b border-slate-200 bg-white">

        <div className="flex h-16 items-center justify-between px-6 lg:px-10">

          {/* Logo */}
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">
              HealthScan <span className="text-blue-600">AI</span>
            </h1>

            <p className="text-xs text-slate-500">
              Administration Portal
            </p>
          </div>

          {/* Right */}
          <div className="flex items-center gap-5">

            <div className="hidden text-right sm:block">

              <p className="text-sm font-medium text-slate-900">
                {user?.email}
              </p>

              <p className="text-xs text-slate-500">
                Administrator
              </p>

            </div>

            <button
              onClick={handleLogout}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Sign Out
            </button>

          </div>

        </div>

      </header>


      {/* Layout */}
      <div className="flex">

        {/* Sidebar */}
        <aside className="hidden min-h-[calc(100vh-64px)] w-64 border-r border-slate-200 bg-white lg:block">
          <nav className="space-y-1 p-4">

            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                `block rounded-lg px-4 py-3 text-sm transition ${
                  isActive
                    ? "bg-blue-50 font-semibold text-blue-700"
                    : "font-medium text-slate-600 hover:bg-slate-50"
                }`
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/admin/doctors"
              className={({ isActive }) =>
                `block rounded-lg px-4 py-3 text-sm transition ${
                  isActive
                    ? "bg-blue-50 font-semibold text-blue-700"
                    : "font-medium text-slate-600 hover:bg-slate-50"
                }`
              }
            >
              Doctors
            </NavLink>

            <NavLink
              to="/admin/patients"
              className={({ isActive }) =>
                `block rounded-lg px-4 py-3 text-sm transition ${
                  isActive
                    ? "bg-blue-50 font-semibold text-blue-700"
                    : "font-medium text-slate-600 hover:bg-slate-50"
                }`
              }
            >
              Patients
            </NavLink>

            <NavLink
              to="/admin/appointments"
              className={({ isActive }) =>
                `block rounded-lg px-4 py-3 text-sm transition ${
                  isActive
                    ? "bg-blue-50 font-semibold text-blue-700"
                    : "font-medium text-slate-600 hover:bg-slate-50"
                }`
              }
            >
              Appointments
            </NavLink>

            <NavLink
              to="/admin/doctor-leave"
              className={({ isActive }) =>
                `block rounded-lg px-4 py-3 text-sm transition ${
                  isActive
                    ? "bg-blue-50 font-semibold text-blue-700"
                    : "font-medium text-slate-600 hover:bg-slate-50"
                }`
              }
            >
              Doctor Leave
            </NavLink>

            <NavLink
              to="/admin/settings"
              className={({ isActive }) =>
                `block rounded-lg px-4 py-3 text-sm transition ${
                  isActive
                    ? "bg-blue-50 font-semibold text-blue-700"
                    : "font-medium text-slate-600 hover:bg-slate-50"
                }`
              }
            >
              Settings
            </NavLink>

          </nav>
        </aside>


        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-10">

          {/* Page heading */}
          <div className="mb-8">

            <p className="text-sm font-medium text-blue-600">
              Administration
            </p>

            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              Dashboard
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Manage doctors, patients, appointments and system
              configuration.
            </p>

          </div>


          {/* Error */}
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}


          {/* Statistics */}
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

            {/* Doctors */}
            <div className="rounded-xl border border-slate-200 bg-white p-6">

              <p className="text-sm font-medium text-slate-500">
                Total Doctors
              </p>

              <p className="mt-3 text-3xl font-bold text-slate-900">
                {loading ? "..." : stats.total_doctors}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Registered doctors
              </p>

            </div>


            {/* Patients */}
            <div className="rounded-xl border border-slate-200 bg-white p-6">

              <p className="text-sm font-medium text-slate-500">
                Total Patients
              </p>

              <p className="mt-3 text-3xl font-bold text-slate-900">
                {loading ? "..." : stats.total_patients}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Registered patients
              </p>

            </div>


            {/* Appointments */}
            <div className="rounded-xl border border-slate-200 bg-white p-6">

              <p className="text-sm font-medium text-slate-500">
                Appointments
              </p>

              <p className="mt-3 text-3xl font-bold text-slate-900">
                {loading ? "..." : stats.total_appointments}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Total appointments
              </p>

            </div>


            {/* System Status */}
            <div className="rounded-xl border border-slate-200 bg-white p-6">

              <p className="text-sm font-medium text-slate-500">
                System Status
              </p>

              <div className="mt-4 flex items-center gap-2">

                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

                <span className="text-sm font-semibold text-emerald-600">
                  Operational
                </span>

              </div>

              <p className="mt-2 text-xs text-slate-400">
                HealthScan AI platform
              </p>

            </div>

          </div>


          {/* Quick Actions */}
          <section className="mt-8">

            <h3 className="text-lg font-semibold text-slate-900">
              Administration
            </h3>

            <div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">

              {/* Doctor Management */}
              <div className="rounded-xl border border-slate-200 bg-white p-6">

                <h4 className="font-semibold text-slate-900">
                  Doctor Management
                </h4>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Create and manage doctor profiles, schedules and
                  availability.
                </p>

                <button
                  onClick={() => navigate("/admin/doctors")}
                  className="mt-5 text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  Manage Doctors →
                </button>

              </div>


              {/* Patient Management */}
              <div className="rounded-xl border border-slate-200 bg-white p-6">

                <h4 className="font-semibold text-slate-900">
                  Patient Management
                </h4>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  View registered patients and manage patient access.
                </p>

                <button
                  onClick={() => navigate("/admin/patients")}
                  className="mt-5 text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  Manage Patients →
                </button>

              </div>


              {/* Appointment Management */}
              <div className="rounded-xl border border-slate-200 bg-white p-6">

                <h4 className="font-semibold text-slate-900">
                  Appointment Management
                </h4>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Monitor appointments and handle scheduling conflicts.
                </p>

                <button
                  onClick={() => navigate("/admin/appointments")}
                  className="mt-5 text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  View Appointments →
                </button>

              </div>

            </div>

          </section>

        </main>

      </div>

    </div>
  )
}

export default AdminDashboard
