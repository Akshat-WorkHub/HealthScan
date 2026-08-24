import { useEffect, useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"

import {
  getAdminDoctorLeaves,
  createAdminDoctorLeave,
  updateAdminDoctorLeave,
  updateAdminDoctorLeaveStatus,
  deleteAdminDoctorLeave,
} from "../../../services/api"


function AdminDoctorLeave() {
  const navigate = useNavigate()

  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [showForm, setShowForm] = useState(false)
  const [editingLeave, setEditingLeave] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState("")


  const [leaveForm, setLeaveForm] = useState({
    doctor_id: "",
    start_date: "",
    end_date: "",
    reason: "",
  })

  const token = localStorage.getItem("access_token")


  // ============================================================
  // LOAD LEAVES
  // ============================================================

  async function loadLeaves() {
    try {
      setLoading(true)
      setError("")

      const data = await getAdminDoctorLeaves(token)

      setLeaves(data)
    } catch (err) {
      console.error(err)
      setError(err.message || "Failed to load doctor leaves")
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    if (!token) {
      navigate("/admin/login")
      return
    }

    loadLeaves()
  }, [])


  // ============================================================
  // FORM HANDLING
  // ============================================================

  function handleFormChange(event) {
    const { name, value } = event.target

    if (name === "doctor_id") {
        setFormError("")
    }

    setLeaveForm((previous) => ({
        ...previous,
        [name]: value,
    }))
  }


  function openAddForm() {
    setEditingLeave(null)
    setFormError("")

    setLeaveForm({
      doctor_id: "",
      start_date: "",
      end_date: "",
      reason: "",
    })

    setShowForm(true)
  }


  function openEditForm(leave) {
    setEditingLeave(leave)
    setFormError("")

    setLeaveForm({
      doctor_id: leave.doctor_id,
      start_date: leave.start_date,
      end_date: leave.end_date,
      reason: leave.reason || "",
    })

    setShowForm(true)
  }


  function closeForm() {
    if (saving) return

    setShowForm(false)
    setEditingLeave(null)

    setLeaveForm({
      doctor_id: "",
      start_date: "",
      end_date: "",
      reason: "",
    })
  }


  // ============================================================
  // CREATE / UPDATE
  // ============================================================

    async function handleSubmit(event) {
    event.preventDefault()

    try {
        setSaving(true)
        setError("")
        setFormError("")

        const payload = {
        doctor_id: Number(leaveForm.doctor_id),
        start_date: leaveForm.start_date,
        end_date: leaveForm.end_date,
        reason: leaveForm.reason || null,
        }

        if (editingLeave) {
        await updateAdminDoctorLeave(
            token,
            editingLeave.id,
            payload
        )
        } else {
        await createAdminDoctorLeave(
            token,
            payload
        )
        }

        closeForm()
        await loadLeaves()

    } catch (err) {
        console.error(err)

        if (
        err.message?.toLowerCase().includes("doctor not found")
        ) {
        setFormError(
            `Doctor with ID ${leaveForm.doctor_id} was not found.`
        )
        } else {
        setError(err.message || "Failed to save leave")
        }

    } finally {
        setSaving(false)
    }
  }


  // ============================================================
  // DELETE
  // ============================================================

  async function handleDelete(leaveId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this leave record?"
    )

    if (!confirmed) return

    try {
      setError("")

      await deleteAdminDoctorLeave(
        token,
        leaveId
      )

      await loadLeaves()
    } catch (err) {
      console.error(err)
      setError(err.message || "Failed to delete leave")
    }
  }

  // ============================================================
  // APPROVE / REJECT LEAVE
  // ============================================================

  async function handleLeaveStatus(leaveId, leaveStatus) {
    try {
      setError("")

      await updateAdminDoctorLeaveStatus(
        token,
        leaveId,
        leaveStatus
      )

      await loadLeaves()
    } catch (err) {
      console.error(err)
      setError(
        err.message || "Failed to update leave status"
      )
    }
  }


  // ============================================================
  // LOGOUT
  // ============================================================

  function handleLogout() {
    localStorage.removeItem("access_token")
    window.location.href = "/admin/login"
  }


  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

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


      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <main className="flex-1">

        {/* Header */}

        <header className="border-b border-slate-200 bg-white px-8 py-5">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Doctor Leave
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Manage doctor leave days and availability.
              </p>
            </div>


            <button
              type="button"
              onClick={openAddForm}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              + Add Leave
            </button>

          </div>

        </header>


        {/* Content */}

        <div className="p-8">

          {/* Error */}

          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}


          {/* Table Card */}

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-200 px-6 py-4">

              <h3 className="text-base font-semibold text-slate-900">
                Leave Records
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                All scheduled doctor leave periods.
              </p>

            </div>


            {loading ? (

              <div className="px-6 py-12 text-center text-sm text-slate-500">
                Loading leave records...
              </div>

            ) : leaves.length === 0 ? (

              <div className="px-6 py-12 text-center">

                <p className="text-sm font-medium text-slate-700">
                  No leave records found
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Add a leave period to get started.
                </p>

              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full text-left">

                  <thead className="bg-slate-50">

                    <tr>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Doctor ID
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Start Date
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        End Date
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Reason
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Actions
                      </th>

                    </tr>

                  </thead>


                  <tbody className="divide-y divide-slate-100">

                    {leaves.map((leave) => (

                      <tr
                        key={leave.id}
                        className="transition-colors hover:bg-slate-50"
                      >

                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                          #{leave.doctor_id}
                        </td>


                        <td className="px-6 py-4 text-sm text-slate-600">
                          {leave.start_date}
                        </td>


                        <td className="px-6 py-4 text-sm text-slate-600">
                          {leave.end_date}
                        </td>


                        <td className="px-6 py-4 text-sm text-slate-600">
                          {leave.reason || "—"}
                        </td>

                        <td className="px-6 py-4">

                          <div className="flex justify-end gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                openEditForm(leave)
                              }
                              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                            >
                              Edit
                            </button>


                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(leave.id)
                              }
                              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:border-red-600 hover:bg-red-600 hover:text-white"
                            >
                              Delete
                            </button>

                          </div>


                          {/* Approve / Reject — only for pending leaves */}

                          {leave.status === "PENDING" && (
                            <div className="mt-3 flex justify-end gap-2">

                              <button
                                type="button"
                                onClick={() =>
                                  handleLeaveStatus(
                                    leave.id,
                                    "APPROVED"
                                  )
                                }
                                className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-600 transition-colors hover:border-emerald-600 hover:bg-emerald-600 hover:text-white"
                              >
                                Approve
                              </button>


                              <button
                                type="button"
                                onClick={() =>
                                  handleLeaveStatus(
                                    leave.id,
                                    "REJECTED"
                                  )
                                }
                                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:border-red-600 hover:bg-red-600 hover:text-white"
                              >
                                Reject
                              </button>

                            </div>
                          )}

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </div>

      </main>


      {/* ======================================================
          ADD / EDIT MODAL
      ====================================================== */}

      {showForm && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">

          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">

            {/* Header */}

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

              <div>

                <h3 className="text-lg font-semibold text-slate-900">
                  {editingLeave
                    ? "Edit Doctor Leave"
                    : "Add Doctor Leave"}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {editingLeave
                    ? "Update the leave period."
                    : "Create a new doctor leave period."}
                </p>

              </div>


              <button
                type="button"
                onClick={closeForm}
                className="text-xl text-slate-400 transition-colors hover:text-slate-600"
              >
                ×
              </button>

            </div>


            {/* Form */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >

              {/* Doctor ID */}

              <div>

                <label className="text-sm font-medium text-slate-700">
                  Doctor ID
                </label>

                <input
                  type="number"
                  min="1"
                  name="doctor_id"
                  value={leaveForm.doctor_id}
                  onChange={handleFormChange}
                  disabled={Boolean(editingLeave)}
                  required
                  className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                />

                {formError && (
                    <p className="mt-2 text-sm text-red-600">
                        {formError}
                    </p>
                )}

              </div>


              {/* Dates */}

              <div className="grid gap-5 sm:grid-cols-2">

                <div>

                  <label className="text-sm font-medium text-slate-700">
                    Start Date
                  </label>

                  <input
                    type="date"
                    name="start_date"
                    value={leaveForm.start_date}
                    onChange={handleFormChange}
                    required
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>


                <div>

                  <label className="text-sm font-medium text-slate-700">
                    End Date
                  </label>

                  <input
                    type="date"
                    name="end_date"
                    value={leaveForm.end_date}
                    onChange={handleFormChange}
                    min={leaveForm.start_date || undefined}
                    required
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>

              </div>


              {/* Reason */}

              <div>

                <label className="text-sm font-medium text-slate-700">
                  Reason
                </label>

                <textarea
                  name="reason"
                  value={leaveForm.reason}
                  onChange={handleFormChange}
                  rows="3"
                  placeholder="Enter reason for leave"
                  className="mt-2 w-full resize-none rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

              </div>


              {/* Actions */}

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingLeave
                      ? "Save Changes"
                      : "Add Leave"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  )
}

export default AdminDoctorLeave
