import { useEffect, useMemo, useState } from "react"
import { NavLink } from "react-router-dom"

import {
  getAdminAppointments,
  updateAdminAppointmentStatus,
} from "../../../services/api"


function AdminAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [updatingAppointmentId, setUpdatingAppointmentId] = useState(null)
  const [statusFilter, setStatusFilter] = useState("ALL")


  const token = localStorage.getItem("access_token")


  // ============================================================
  // LOAD APPOINTMENTS
  // ============================================================

  async function loadAppointments() {
    try {
      setLoading(true)
      setError("")

      if (!token) {
        throw new Error("Authentication token not found")
      }

      const data = await getAdminAppointments(token)

      setAppointments(data)
    } catch (err) {
      console.error("Failed to load appointments:", err)
      setError(err.message || "Failed to load appointments")
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    loadAppointments()
  }, [])


  // ============================================================
  // STATUS UPDATE
  // ============================================================

  async function handleStatusChange(
    appointmentId,
    newStatus
  ) {
    try {
      setUpdatingAppointmentId(appointmentId)
      setError("")

      if (!token) {
        throw new Error("Authentication token not found")
      }

      const updatedAppointment =
        await updateAdminAppointmentStatus(
          token,
          appointmentId,
          newStatus
        )

      setAppointments((currentAppointments) =>
        currentAppointments.map((appointment) =>
          appointment.id === appointmentId
            ? updatedAppointment
            : appointment
        )
      )
    } catch (err) {
      console.error(
        "Failed to update appointment status:",
        err
      )

      setError(
        err.message ||
          "Failed to update appointment status"
      )
    } finally {
      setUpdatingAppointmentId(null)
    }
  }


  // ============================================================
  // FILTER
  // ============================================================

  const filteredAppointments = useMemo(() => {
    if (statusFilter === "ALL") {
      return appointments
    }

    return appointments.filter(
      (appointment) =>
        appointment.status === statusFilter
    )
  }, [appointments, statusFilter])


  // ============================================================
  // STATISTICS
  // ============================================================

  const totalAppointments = appointments.length

  const scheduledAppointments = appointments.filter(
    (appointment) =>
      appointment.status === "SCHEDULED"
  ).length

  const completedAppointments = appointments.filter(
    (appointment) =>
      appointment.status === "COMPLETED"
  ).length

  const cancelledAppointments = appointments.filter(
    (appointment) =>
      appointment.status === "CANCELLED"
  ).length


  // ============================================================
  // FORMATTERS
  // ============================================================

  function formatDate(dateString) {
    if (!dateString) {
      return "-"
    }

    return new Date(
      `${dateString}T00:00:00`
    ).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }


  function formatTime(timeString) {
    if (!timeString) {
      return "-"
    }

    const [hours, minutes] =
      timeString.split(":")

    const date = new Date()

    date.setHours(
      Number(hours),
      Number(minutes),
      0,
      0
    )

    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    })
  }


  function getStatusClass(status) {
    switch (status) {
      case "SCHEDULED":
        return "bg-blue-50 text-blue-700"

      case "COMPLETED":
        return "bg-emerald-50 text-emerald-700"

      case "CANCELLED":
        return "bg-red-50 text-red-700"

      default:
        return "bg-slate-100 text-slate-700"
    }
  }


  // ============================================================
  // RENDER
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

      <main className="min-w-0 flex-1">

        {/* Header */}

        <header className="border-b border-slate-200 bg-white px-8 py-5">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-xl font-semibold text-slate-900">
                Appointment Management
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Manage and monitor patient appointments.
              </p>

            </div>


            <button
              type="button"
              onClick={loadAppointments}
              disabled={loading}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Refreshing..."
                : "Refresh"}
            </button>

          </div>

        </header>


        {/* Content */}

        <div className="p-6 lg:p-8">

          {/* Error */}

          {error && (
            <div className="mb-6 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3">

              <p className="text-sm text-red-600">
                {error}
              </p>

              <button
                type="button"
                onClick={loadAppointments}
                className="text-sm font-semibold text-red-700 hover:underline"
              >
                Retry
              </button>

            </div>
          )}


          {/* ==================================================
              STATISTICS
          ================================================== */}

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

            {/* Total */}

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <p className="text-sm font-medium text-slate-500">
                Total Appointments
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {totalAppointments}
              </p>

            </div>


            {/* Scheduled */}

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <p className="text-sm font-medium text-slate-500">
                Scheduled
              </p>

              <p className="mt-2 text-3xl font-bold text-blue-600">
                {scheduledAppointments}
              </p>

            </div>


            {/* Completed */}

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <p className="text-sm font-medium text-slate-500">
                Completed
              </p>

              <p className="mt-2 text-3xl font-bold text-emerald-600">
                {completedAppointments}
              </p>

            </div>


            {/* Cancelled */}

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <p className="text-sm font-medium text-slate-500">
                Cancelled
              </p>

              <p className="mt-2 text-3xl font-bold text-red-600">
                {cancelledAppointments}
              </p>

            </div>

          </div>


          {/* ==================================================
              APPOINTMENTS
          ================================================== */}

          <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

            {/* Section Header */}

            <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 md:flex-row md:items-center md:justify-between">

              <div>

                <h3 className="text-lg font-semibold text-slate-900">
                  Appointments
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  View and manage all appointments.
                </p>

              </div>


              {/* Filter */}

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >

                <option value="ALL">
                  All Statuses
                </option>

                <option value="SCHEDULED">
                  Scheduled
                </option>

                <option value="COMPLETED">
                  Completed
                </option>

                <option value="CANCELLED">
                  Cancelled
                </option>

              </select>

            </div>


            {/* Loading */}

            {loading ? (

              <div className="flex items-center justify-center px-6 py-16">

                <p className="text-sm text-slate-500">
                  Loading appointments...
                </p>

              </div>

            ) : filteredAppointments.length === 0 ? (

              /* Empty State */

              <div className="flex flex-col items-center justify-center px-6 py-20 text-center">

                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">

                  <span className="text-2xl text-slate-500">
                    ◷
                  </span>

                </div>

                <h4 className="mt-4 text-sm font-semibold text-slate-900">
                  No appointments found
                </h4>

                <p className="mt-1 text-sm text-slate-500">
                  There are no appointments matching the selected filter.
                </p>

              </div>

            ) : (

              /* Appointment Table */

              <div className="overflow-x-auto">

                <table className="w-full min-w-[900px]">

                  <thead className="border-b border-slate-200 bg-slate-50">

                    <tr>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Patient
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Doctor
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Date
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Time
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Action
                      </th>

                    </tr>

                  </thead>


                  <tbody className="divide-y divide-slate-100">

                    {filteredAppointments.map(
                      (appointment) => {

                        const isUpdating =
                          updatingAppointmentId ===
                          appointment.id

                        const canUpdate =
                          appointment.status ===
                            "SCHEDULED"


                        return (
                          <tr
                            key={appointment.id}
                            className="transition-colors hover:bg-slate-50"
                          >

                            {/* Patient */}

                            <td className="px-6 py-5">

                              <p className="text-sm font-semibold text-slate-900">
                                {appointment.patient_name}
                              </p>

                            </td>


                            {/* Doctor */}

                            <td className="px-6 py-5">

                              <p className="text-sm font-semibold text-slate-900">
                                {appointment.doctor_name}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {appointment.doctor_specialization}
                              </p>

                            </td>


                            {/* Date */}

                            <td className="whitespace-nowrap px-6 py-5">

                              <p className="text-sm text-slate-700">
                                {formatDate(
                                  appointment.appointment_date
                                )}
                              </p>

                            </td>


                            {/* Time */}

                            <td className="whitespace-nowrap px-6 py-5">

                              <p className="text-sm text-slate-700">
                                {formatTime(
                                  appointment.appointment_time
                                )}
                              </p>

                            </td>


                            {/* Status */}

                            <td className="px-6 py-5">

                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                                  appointment.status
                                )}`}
                              >
                                {appointment.status}
                              </span>

                            </td>


                            {/* Action */}

                            <td className="px-6 py-5 text-right">

                              {canUpdate ? (

                                <select
                                  value={
                                    appointment.status
                                  }
                                  disabled={
                                    isUpdating
                                  }
                                  onChange={(event) =>
                                    handleStatusChange(
                                      appointment.id,
                                      event.target.value
                                    )
                                  }
                                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                                >

                                  <option value="SCHEDULED">
                                    Scheduled
                                  </option>

                                  <option value="COMPLETED">
                                    Completed
                                  </option>

                                  <option value="CANCELLED">
                                    Cancelled
                                  </option>

                                </select>

                              ) : (

                                <span className="text-xs text-slate-400">
                                  No actions
                                </span>

                              )}

                            </td>

                          </tr>
                        )
                      }
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </div>

      </main>

    </div>
  )
}


export default AdminAppointments
