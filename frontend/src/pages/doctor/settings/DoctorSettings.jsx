import { useState } from "react"

import { useNavigate } from "react-router-dom"
import DoctorLayout from "../DoctorLayout"
import { changePassword } from "../../../services/api"


function DoctorSettings() {
  const navigate = useNavigate()
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)


  const handleChangePassword = async (event) => {

    event.preventDefault()

    setError("")
    setSuccess("")


    // Validate new password
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.")
      return
    }


    // Confirm new password
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.")
      return
    }


    // Prevent same password
    if (currentPassword === newPassword) {
      setError(
        "New password must be different from current password."
      )
      return
    }


    const token = localStorage.getItem("access_token")

    if (!token) {
      setError("Authentication session not found. Please sign in again.")
      return
    }


    try {

      setLoading(true)

      await changePassword(
        token,
        {
          current_password: currentPassword,
          new_password: newPassword,
        }
      )


      setSuccess("Password changed successfully.")

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")

      setShowPasswordForm(false)

    } catch (error) {

      setError(
        error.message || "Failed to change password."
      )

    } finally {

      setLoading(false)

    }
  }


  const handleCancel = () => {

    setShowPasswordForm(false)

    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")

    setError("")
    setSuccess("")
  }


  return (
    <DoctorLayout>

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <section className="border-b border-slate-200 bg-white px-6 py-6 lg:px-8">

        <p className="text-sm font-medium text-blue-600">
          Doctor Portal
        </p>

        <h2 className="mt-1 text-2xl font-bold text-slate-900">
          Settings
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Manage your doctor account settings.
        </p>

      </section>


      {/* ======================================================
          PAGE CONTENT
      ====================================================== */}

      <section className="p-6 lg:p-8">

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

          {/* Card Header */}

          <div className="border-b border-slate-200 px-6 py-5">

            <h3 className="text-base font-semibold text-slate-900">
              Account Settings
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Manage your account preferences and security.
            </p>

          </div>


          {/* ==================================================
              SUCCESS MESSAGE
          ================================================== */}

          {success && (

            <div className="mx-6 mt-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </div>

          )}


          {/* ==================================================
              ERROR MESSAGE
          ================================================== */}

          {error && (

            <div className="mx-6 mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>

          )}


          {/* Settings Content */}

          <div className="divide-y divide-slate-200">

            {/* ==================================================
                PROFILE
            ================================================== */}

            <div className="flex items-center justify-between px-6 py-5">

              <div>

                <h4 className="text-sm font-semibold text-slate-900">
                  Profile
                </h4>

                <p className="mt-1 text-sm text-slate-500">
                  View and manage your doctor profile information.
                </p>

              </div>

              <button
                type="button"
                onClick={() => navigate("/doctor/profile")}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
              >
                Manage
              </button>

            </div>


            {/* ==================================================
                PASSWORD
            ================================================== */}

            <div className="px-6 py-5">

              <div className="flex items-center justify-between">

                <div>

                  <h4 className="text-sm font-semibold text-slate-900">
                    Password
                  </h4>

                  <p className="mt-1 text-sm text-slate-500">
                    Change your account password.
                  </p>

                </div>


                {!showPasswordForm && (

                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordForm(true)
                      setError("")
                      setSuccess("")
                    }}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
                  >
                    Change Password
                  </button>

                )}

              </div>


              {/* ==================================================
                  CHANGE PASSWORD FORM
              ================================================== */}

              {showPasswordForm && (

                <form
                  onSubmit={handleChangePassword}
                  className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-5"
                >

                  <div className="space-y-5">

                    {/* Current Password */}

                    <div>

                      <label
                        htmlFor="current-password"
                        className="block text-sm font-medium text-slate-700"
                      >
                        Current Password
                      </label>

                      <input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(event) =>
                          setCurrentPassword(event.target.value)
                        }
                        required
                        autoComplete="current-password"
                        className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="Enter your current password"
                      />

                    </div>


                    {/* New Password */}

                    <div>

                      <label
                        htmlFor="new-password"
                        className="block text-sm font-medium text-slate-700"
                      >
                        New Password
                      </label>

                      <input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(event) =>
                          setNewPassword(event.target.value)
                        }
                        required
                        minLength={8}
                        autoComplete="new-password"
                        className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="Enter your new password"
                      />

                      <p className="mt-1 text-xs text-slate-500">
                        Password must be between 8 and 128 characters.
                      </p>

                    </div>


                    {/* Confirm Password */}

                    <div>

                      <label
                        htmlFor="confirm-password"
                        className="block text-sm font-medium text-slate-700"
                      >
                        Confirm New Password
                      </label>

                      <input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(event) =>
                          setConfirmPassword(event.target.value)
                        }
                        required
                        minLength={8}
                        autoComplete="new-password"
                        className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="Confirm your new password"
                      />

                    </div>


                    {/* Buttons */}

                    <div className="flex justify-end gap-3 pt-2">

                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={loading}
                        className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Cancel
                      </button>


                      <button
                        type="submit"
                        disabled={loading}
                        className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {loading
                          ? "Changing Password..."
                          : "Update Password"}
                      </button>

                    </div>

                  </div>

                </form>

              )}

            </div>


            {/* ==================================================
                NOTIFICATIONS
            ================================================== */}

            <div className="flex items-center justify-between px-6 py-5">

              <div>

                <h4 className="text-sm font-semibold text-slate-900">
                  Notifications
                </h4>

                <p className="mt-1 text-sm text-slate-500">
                  Manage your notification preferences.
                </p>

              </div>

              <span className="text-sm font-medium text-slate-400">
                Available soon
              </span>

            </div>

          </div>

        </div>

      </section>

    </DoctorLayout>
  )
}


export default DoctorSettings