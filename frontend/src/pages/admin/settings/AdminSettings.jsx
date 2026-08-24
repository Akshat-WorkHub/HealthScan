import { useState } from "react"
import { Link, NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../../../context/AuthContext"


function AdminSettings() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [changingPassword, setChangingPassword] = useState(false)


  // ============================================================
  // LOGOUT
  // ============================================================

  function handleLogout() {
    logout()
    navigate("/admin/login")
  }


  // ============================================================
  // PASSWORD FORM
  // ============================================================

  function handlePasswordSubmit(event) {
    event.preventDefault()

    setError("")
    setSuccess("")

    if (!currentPassword) {
      setError("Please enter your current password.")
      return
    }

    if (!newPassword) {
      setError("Please enter a new password.")
      return
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation password do not match.")
      return
    }

    /*
      Password-change API is not currently available in the
      existing backend API.

      Do not pretend the password was changed.

      We keep the form and validation ready for the backend
      password-change endpoint to be added.
    */

    setChangingPassword(true)

    setTimeout(() => {
      setChangingPassword(false)

      setError(
        "Password change is not available yet. The backend password-change endpoint has not been implemented."
      )
    }, 300)
  }


  const adminEmail =
    user?.email || "admin@healthscan.ai"

  const adminId =
    user?.id ?? "—"

  const adminRole =
    user?.role || "ADMIN"

  const accountStatus =
    user?.is_active === false
      ? "Inactive"
      : "Active"


  return (
    <div className="min-h-screen bg-slate-50">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="border-b border-slate-200 bg-white">

        <div className="flex h-16 items-center justify-between px-6 lg:px-10">

          {/* Logo */}

          <Link
            to="/admin"
            className="group"
          >

            <h1 className="text-lg font-bold tracking-tight text-slate-900">
              HealthScan{" "}
              <span className="text-blue-600">
                AI
              </span>
            </h1>

            <p className="text-xs text-slate-500">
              Administration Portal
            </p>

          </Link>


          {/* Right side */}

          <div className="flex items-center gap-5">

            <div className="text-right">

              <p className="text-sm font-medium text-slate-900">
                {adminEmail}
              </p>

              <p className="text-xs text-slate-500">
                Administrator
              </p>

            </div>


            {/* Sign Out */}

            <button
              type="button"
              onClick={handleLogout}
              className="
                rounded-lg
                bg-red-600
                px-5
                py-2.5
                text-sm
                font-semibold
                text-white
                transition-colors
                hover:bg-red-700
                active:bg-red-800
              "
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

        
        {/* ====================================================
            MAIN CONTENT
        ==================================================== */}

        <main className="flex-1">

          {/* Page Header */}

          <header className="border-b border-slate-200 bg-white px-8 py-5">

            <div>

              <h2 className="text-xl font-semibold text-slate-900">
                Settings
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Manage your administrator account settings.
              </p>

            </div>

          </header>


          {/* Content */}

          <div className="p-8">

            <div className="mx-auto max-w-6xl space-y-6">


              {/* ==================================================
                  ERROR
              ================================================== */}

              {error && (

                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>

              )}


              {/* ==================================================
                  SUCCESS
              ================================================== */}

              {success && (

                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
                  {success}
                </div>

              )}


              {/* ==================================================
                  ACCOUNT INFORMATION
              ================================================== */}

              <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">

                <div className="border-b border-slate-200 px-6 py-5">

                  <h3 className="text-lg font-semibold text-slate-900">
                    Account Information
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Your current administrator account details.
                  </p>

                </div>


                <div className="grid grid-cols-1 gap-6 px-6 py-6 md:grid-cols-2">


                  {/* User ID */}

                  <div>

                    <p className="text-sm font-medium text-slate-500">
                      User ID
                    </p>

                    <p className="mt-2 text-sm font-medium text-slate-900">
                      {adminId}
                    </p>

                  </div>


                  {/* Email */}

                  <div>

                    <p className="text-sm font-medium text-slate-500">
                      Email
                    </p>

                    <p className="mt-2 text-sm font-medium text-slate-900">
                      {adminEmail}
                    </p>

                  </div>


                  {/* Role */}

                  <div>

                    <p className="text-sm font-medium text-slate-500">
                      Role
                    </p>

                    <p className="mt-2 text-sm font-medium text-slate-900">
                      {adminRole}
                    </p>

                  </div>


                  {/* Status */}

                  <div>

                    <p className="text-sm font-medium text-slate-500">
                      Account Status
                    </p>

                    <p
                      className={
                        accountStatus === "Active"
                          ? "mt-2 text-sm font-medium text-emerald-600"
                          : "mt-2 text-sm font-medium text-red-600"
                      }
                    >
                      {accountStatus}
                    </p>

                  </div>

                </div>

              </section>


              {/* ==================================================
                  CHANGE PASSWORD
              ================================================== */}

              <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">

                <div className="border-b border-slate-200 px-6 py-5">

                  <h3 className="text-lg font-semibold text-slate-900">
                    Change Password
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Update your administrator account password.
                  </p>

                </div>


                <form
                  onSubmit={handlePasswordSubmit}
                  className="space-y-6 px-6 py-6"
                >


                  {/* Current Password */}

                  <div>

                    <label className="text-sm font-medium text-slate-700">
                      Current Password
                    </label>

                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(event) =>
                        setCurrentPassword(event.target.value)
                      }
                      className="
                        mt-2
                        w-full
                        rounded-lg
                        border
                        border-slate-300
                        px-4
                        py-2.5
                        text-sm
                        outline-none
                        focus:border-blue-500
                        focus:ring-2
                        focus:ring-blue-100
                      "
                    />

                  </div>


                  {/* New Password */}

                  <div>

                    <label className="text-sm font-medium text-slate-700">
                      New Password
                    </label>

                    <input
                      type="password"
                      value={newPassword}
                      onChange={(event) =>
                        setNewPassword(event.target.value)
                      }
                      className="
                        mt-2
                        w-full
                        rounded-lg
                        border
                        border-slate-300
                        px-4
                        py-2.5
                        text-sm
                        outline-none
                        focus:border-blue-500
                        focus:ring-2
                        focus:ring-blue-100
                      "
                    />

                    <p className="mt-1 text-xs text-slate-500">
                      Password must be at least 8 characters.
                    </p>

                  </div>


                  {/* Confirm Password */}

                  <div>

                    <label className="text-sm font-medium text-slate-700">
                      Confirm New Password
                    </label>

                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      className="
                        mt-2
                        w-full
                        rounded-lg
                        border
                        border-slate-300
                        px-4
                        py-2.5
                        text-sm
                        outline-none
                        focus:border-blue-500
                        focus:ring-2
                        focus:ring-blue-100
                      "
                    />

                  </div>


                  {/* Actions */}

                  <div className="flex justify-end border-t border-slate-200 pt-5">

                    <button
                      type="submit"
                      disabled={changingPassword}
                      className="
                        rounded-lg
                        bg-blue-600
                        px-5
                        py-2.5
                        text-sm
                        font-semibold
                        text-white
                        transition-colors
                        hover:bg-blue-700
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                    >
                      {changingPassword
                        ? "Changing..."
                        : "Change Password"}
                    </button>

                  </div>

                </form>

              </section>

            </div>

          </div>

        </main>

      </div>

    </div>
  )
}

export default AdminSettings
