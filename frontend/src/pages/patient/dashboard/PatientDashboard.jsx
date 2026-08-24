import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import PatientLayout from "../PatientLayout"

import {
  createMyPatientProfile,
  getMyPatientAppointments,
  getMyPatientProfile,
  updateMyPatientProfile,
} from "../../../services/api"


function PatientDashboard() {
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Profile Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState("create") // "create" | "edit"
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [phone, setPhone] = useState("")
  const [modalError, setModalError] = useState("")
  const [modalLoading, setModalLoading] = useState(false)

  const token = localStorage.getItem("access_token")


  // ============================================================
  // LOAD DASHBOARD DATA
  // ============================================================

  async function loadDashboardData() {
    try {
      setLoading(true)
      setError("")

      if (!token) {
        throw new Error("Authentication token not found")
      }

      // Fetch profile (handle non-existent profile gracefully)
      try {
        const profileData = await getMyPatientProfile(token)
        setProfile(profileData)
      } catch (err) {
        console.warn("Patient profile not found:", err.message)
        setProfile(null)
      }

      // Fetch appointments
      try {
        const appointmentList = await getMyPatientAppointments(token)
        setAppointments(appointmentList || [])
      } catch (err) {
        console.warn("Failed to load patient appointments:", err.message)
        setAppointments([])
      }

    } catch (err) {
      console.error("Dashboard error:", err)
      setError(err.message || "Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    loadDashboardData()
  }, [])


  // ============================================================
  // MODAL HANDLERS
  // ============================================================

  function handleOpenCreateModal() {
    setModalMode("create")
    setFirstName("")
    setLastName("")
    setDateOfBirth("")
    setPhone("")
    setModalError("")
    setIsModalOpen(true)
  }

  function handleOpenEditModal() {
    if (!profile) {
      handleOpenCreateModal()
      return
    }

    setModalMode("edit")
    setFirstName(profile.first_name || "")
    setLastName(profile.last_name || "")
    setDateOfBirth(profile.date_of_birth || "")
    setPhone(profile.phone || "")
    setModalError("")
    setIsModalOpen(true)
  }

  function handleCloseModal() {
    setIsModalOpen(false)
    setModalError("")
  }

  async function handleSaveProfile(event) {
    event.preventDefault()
    setModalError("")

    if (!firstName.trim()) {
      setModalError("First name is required.")
      return
    }

    if (!lastName.trim()) {
      setModalError("Last name is required.")
      return
    }

    if (!dateOfBirth) {
      setModalError("Date of birth is required.")
      return
    }

    if (!phone.trim()) {
      setModalError("Phone number is required.")
      return
    }

    const payload = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      date_of_birth: dateOfBirth,
      phone: phone.trim(),
    }

    setModalLoading(true)

    try {
      let savedProfile
      if (modalMode === "create") {
        savedProfile = await createMyPatientProfile(token, payload)
      } else {
        savedProfile = await updateMyPatientProfile(token, payload)
      }

      setProfile(savedProfile)
      setIsModalOpen(false)
    } catch (err) {
      console.error("Failed to save profile:", err)
      setModalError(err.message || "Failed to save profile information")
    } finally {
      setModalLoading(false)
    }
  }


  // ============================================================
  // STATISTICS & APPOINTMENT SEGMENTATION
  // ============================================================

  const totalAppointments = appointments.length

  const upcomingAppointments = useMemo(() => {
    return appointments.filter(
      (appointment) => appointment.status === "SCHEDULED"
    )
  }, [appointments])

  const recentAppointments = useMemo(() => {
    return appointments.filter(
      (appointment) =>
        appointment.status === "COMPLETED" ||
        appointment.status === "CANCELLED"
    )
  }, [appointments])

  const completedCount = useMemo(() => {
    return appointments.filter(
      (appointment) => appointment.status === "COMPLETED"
    ).length
  }, [appointments])


  // ============================================================
  // FORMATTERS
  // ============================================================

  function formatDate(dateString) {
    if (!dateString) return "—"
    return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  function formatTime(timeString) {
    if (!timeString) return "—"
    const [hours, minutes] = timeString.split(":")
    const date = new Date()
    date.setHours(Number(hours), Number(minutes), 0, 0)
    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    })
  }

  function getStatusBadge(status) {
    switch (status) {
      case "SCHEDULED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            Scheduled
          </span>
        )
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Completed
          </span>
        )
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            Cancelled
          </span>
        )
      default:
        return (
          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {status}
          </span>
        )
    }
  }


  return (
    <PatientLayout>

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <section className="border-b border-slate-200 bg-white px-6 py-6 lg:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">
              Patient Portal
            </p>

            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              {profile
                ? `Welcome back, ${profile.first_name}!`
                : "Welcome to Your Health Dashboard"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage your healthcare appointments and profile from here.
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={loadDashboardData}
              disabled={loading}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
      </section>


      {/* ======================================================
          PAGE CONTENT
      ====================================================== */}

      <div className="space-y-6 p-6 lg:p-8">

        {/* Error Notification */}
        {error && (
          <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            <p>{error}</p>
            <button
              type="button"
              onClick={loadDashboardData}
              className="font-semibold text-red-800 hover:underline"
            >
              Retry
            </button>
          </div>
        )}


        {/* ==================================================
            PROFILE NOTICE (IF INCOMPLETE)
        ================================================== */}

        {!profile && !loading && (
          <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 p-6 sm:flex-row sm:items-center">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.8"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 7.5h.008v.008H12v-.008Z"
                  />
                </svg>
              </div>

              <div>
                <h3 className="text-base font-semibold text-amber-900">
                  Profile Information Needed
                </h3>
                <p className="mt-1 text-sm text-amber-700">
                  Your patient profile is not yet completed. Complete your details to make booking appointments easier.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="shrink-0 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700"
            >
              Complete Profile
            </button>
          </div>
        )}


        {/* ==================================================
            STATISTICS CARDS
        ================================================== */}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

          {/* Upcoming Visits */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                Upcoming Visits
              </p>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.8"
                  stroke="currentColor"
                >
                  <rect x="3" y="4" width="18" height="17" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
              </span>
            </div>

            <p className="mt-4 text-3xl font-bold text-slate-900">
              {loading ? "..." : upcomingAppointments.length}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Scheduled consultations
            </p>
          </div>


          {/* Completed Visits */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                Completed Visits
              </p>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.8"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              </span>
            </div>

            <p className="mt-4 text-3xl font-bold text-slate-900">
              {loading ? "..." : completedCount}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Past consultations
            </p>
          </div>


          {/* Total Appointments */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                Total Appointments
              </p>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.8"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z"
                  />
                </svg>
              </span>
            </div>

            <p className="mt-4 text-3xl font-bold text-slate-900">
              {loading ? "..." : totalAppointments}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Lifetime bookings
            </p>
          </div>

        </div>


        {/* ==================================================
            QUICK ACTIONS
        ================================================== */}

        <div className="grid gap-5 sm:grid-cols-3">

          {/* Book Appointment Card */}
          <button
            type="button"
            onClick={() => navigate("/patient/book-appointment")}
            className="relative w-full rounded-xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-blue-200 hover:shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.8"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </div>

            <h3 className="mt-4 text-base font-semibold text-slate-900">
              Book Appointment
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Search available doctors, select a time slot, and book your visit.
            </p>

            <span className="mt-4 inline-flex items-center text-xs font-semibold text-blue-600">
              Booking Engine (Next Module) →
            </span>
          </button>


          {/* View Appointments Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-200 hover:shadow-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.8"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                />
              </svg>
            </div>

            <h3 className="mt-4 text-base font-semibold text-slate-900">
              My Appointments
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Review your upcoming scheduled visits and consultation records.
            </p>

            <a
              href="#upcoming-appointments"
              className="mt-4 inline-block text-xs font-semibold text-emerald-600 hover:underline"
            >
              View Schedule ↓
            </a>
          </div>


          {/* Profile Overview Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-200 hover:shadow-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.8"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                />
              </svg>
            </div>

            <h3 className="mt-4 text-base font-semibold text-slate-900">
              Profile Summary
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Check your personal information and contact details.
            </p>

            <button
              type="button"
              onClick={handleOpenEditModal}
              className="mt-4 inline-block text-left text-xs font-semibold text-violet-600 hover:underline"
            >
              {profile ? "View / Edit Profile →" : "Create Profile →"}
            </button>
          </div>

        </div>


        {/* ==================================================
            UPCOMING APPOINTMENTS SECTION
        ================================================== */}

        <div id="upcoming-appointments" className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Upcoming Appointments
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Your scheduled upcoming consultations.
                </p>
              </div>

              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {upcomingAppointments.length} Scheduled
              </span>
            </div>
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center text-sm text-slate-500">
              Loading upcoming appointments...
            </div>
          ) : upcomingAppointments.length === 0 ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center px-6 py-12 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.8"
                  stroke="currentColor"
                >
                  <rect x="3" y="4" width="18" height="17" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
              </div>

              <h4 className="text-sm font-semibold text-slate-900">
                No upcoming appointments
              </h4>

              <p className="mt-1 max-w-sm text-xs text-slate-500">
                You do not have any scheduled appointments at this time.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Doctor
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Specialization
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Date
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Time
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {upcomingAppointments.map((appointment) => (
                    <tr key={appointment.id} className="transition hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                        {appointment.doctor_name}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {appointment.doctor_specialization}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">
                        {formatDate(appointment.appointment_date)}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">
                        {formatTime(appointment.start_time)}
                      </td>

                      <td className="px-6 py-4 text-right">
                        {getStatusBadge(appointment.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>


        {/* ==================================================
            RECENT / PAST APPOINTMENTS SECTION
        ================================================== */}

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h3 className="text-base font-semibold text-slate-900">
              Past Appointments
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              History of completed and cancelled visits.
            </p>
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center text-sm text-slate-500">
              Loading past appointments...
            </div>
          ) : recentAppointments.length === 0 ? (
            <div className="flex min-h-[160px] flex-col items-center justify-center px-6 py-10 text-center">
              <p className="text-sm font-medium text-slate-700">
                No past appointment records found
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Completed or cancelled appointments will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Doctor
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Specialization
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Date
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Time
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {recentAppointments.map((appointment) => (
                    <tr key={appointment.id} className="transition hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                        {appointment.doctor_name}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {appointment.doctor_specialization}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">
                        {formatDate(appointment.appointment_date)}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">
                        {formatTime(appointment.start_time)}
                      </td>

                      <td className="px-6 py-4 text-right">
                        {getStatusBadge(appointment.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>


        {/* ==================================================
            PROFILE SUMMARY CARD
        ================================================== */}

        <div id="profile-summary" className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Patient Account Summary
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Overview of your registered account information.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenEditModal}
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              {profile ? "Edit Profile" : "Complete Profile"}
            </button>
          </div>

          <div className="grid gap-6 px-6 py-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Full Name
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {profile
                  ? `${profile.first_name} ${profile.last_name}`
                  : "Not provided yet"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Date of Birth
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {profile ? formatDate(profile.date_of_birth) : "Not provided yet"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Phone Number
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {profile ? profile.phone : "Not provided yet"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Account Status
              </p>
              <span className="mt-1 inline-flex rounded-full bg-emerald-50 px-3 py-0.5 text-xs font-semibold text-emerald-700">
                ACTIVE
              </span>
            </div>
          </div>
        </div>

      </div>


      {/* ======================================================
          PROFILE MODAL (CREATE / EDIT)
      ====================================================== */}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {modalMode === "create"
                    ? "Complete Your Profile"
                    : "Edit Profile Information"}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {modalMode === "create"
                    ? "Please enter your personal details to complete your patient profile."
                    : "Update your contact and personal information."}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Error */}
            {modalError && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                {modalError}
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleSaveProfile} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-xs font-semibold uppercase tracking-wide text-slate-700"
                  >
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. John"
                    className="mt-1.5 h-10 w-full rounded-lg border border-slate-300 px-3.5 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-xs font-semibold uppercase tracking-wide text-slate-700"
                  >
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Doe"
                    className="mt-1.5 h-10 w-full rounded-lg border border-slate-300 px-3.5 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="dateOfBirth"
                  className="block text-xs font-semibold uppercase tracking-wide text-slate-700"
                >
                  Date of Birth
                </label>
                <input
                  id="dateOfBirth"
                  type="date"
                  required
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-lg border border-slate-300 px-3.5 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-xs font-semibold uppercase tracking-wide text-slate-700"
                >
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +1 555-0199 or 9876543210"
                  className="mt-1.5 h-10 w-full rounded-lg border border-slate-300 px-3.5 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Form Actions */}
              <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={modalLoading}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={modalLoading}
                  className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {modalLoading
                    ? "Saving..."
                    : modalMode === "create"
                    ? "Complete Profile"
                    : "Save Changes"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </PatientLayout>
  )
}


export default PatientDashboard