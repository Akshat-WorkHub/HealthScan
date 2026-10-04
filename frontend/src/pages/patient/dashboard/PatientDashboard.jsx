import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { usePatientPortal } from "../../../context/PatientContext"
import { getMyPatientAppointments } from "../../../services/api"
import PatientLayout from "../PatientLayout"

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
  return date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })
}

function PatientDashboardContent() {
  const navigate = useNavigate()
  const { patient, user } = usePatientPortal()
  const token = localStorage.getItem("access_token")
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true
    getMyPatientAppointments(token)
      .then((result) => {
        if (active) setAppointments(Array.isArray(result) ? result : [])
      })
      .catch((err) => {
        if (!active) return
        setAppointments([])
        setError(err.message || "Failed to load appointments")
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [token])

  async function loadAppointments() {
    setLoading(true)
    setError("")
    try {
      const result = await getMyPatientAppointments(token)
      setAppointments(Array.isArray(result) ? result : [])
    } catch (err) {
      setAppointments([])
      setError(err.message || "Failed to load appointments")
    } finally {
      setLoading(false)
    }
  }

  const upcomingAppointments = useMemo(
    () => appointments
      .filter((appointment) => appointment.status === "SCHEDULED")
      .sort((a, b) => `${a.appointment_date} ${a.start_time}`.localeCompare(`${b.appointment_date} ${b.start_time}`)),
    [appointments],
  )
  const completedCount = appointments.filter((appointment) => appointment.status === "COMPLETED").length
  const nextAppointment = upcomingAppointments[0]

  return (
    <>
      <section className="portal-page-heading border-b border-slate-200 px-6 py-7 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="portal-eyebrow text-sm font-semibold">Patient Portal</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              {patient ? `Welcome back, ${patient.first_name}!` : "Welcome to HealthScan AI"}
            </h2>
            <p className="mt-1 text-sm text-slate-600">Your care schedule and health information, all in one place.</p>
          </div>
          <button
            type="button"
            onClick={loadAppointments}
            disabled={loading}
            className="portal-secondary-button rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </section>

      <div className="space-y-6 p-6 lg:p-8">
        {error && (
          <div role="alert" className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            <p>{error}</p>
            <button type="button" onClick={loadAppointments} className="shrink-0 font-semibold text-red-800 hover:underline">Retry</button>
          </div>
        )}

        {!patient && user && (
          <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center">
            <div>
              <h3 className="font-semibold text-amber-900">Complete your patient profile</h3>
              <p className="mt-1 text-sm text-amber-800">Add your contact details so your care team has your information.</p>
            </div>
            <Link to="/patient/profile" className="portal-primary-button inline-flex shrink-0 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">Complete Profile</Link>
          </div>
        )}

        <section aria-label="Appointment overview" className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Upcoming Visits", value: upcomingAppointments.length, detail: "Scheduled consultations" },
            { label: "Completed Visits", value: completedCount, detail: "Completed consultations" },
            { label: "Total Appointments", value: appointments.length, detail: "All your visits" },
          ].map((stat) => (
            <article key={stat.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="mt-3 text-3xl font-bold text-slate-900">{loading ? "…" : stat.value}</p>
              <p className="mt-1 text-xs text-slate-500">{stat.detail}</p>
            </article>
          ))}
        </section>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(260px,0.65fr)]">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="portal-eyebrow text-xs font-semibold uppercase tracking-wide">Next appointment</p>
                {nextAppointment ? (
                  <>
                    <h3 className="mt-2 text-lg font-semibold text-slate-900">{nextAppointment.doctor_name}</h3>
                    <p className="mt-1 text-sm text-slate-600">{nextAppointment.doctor_specialization}</p>
                    <p className="mt-4 text-sm font-medium text-slate-800">
                      {formatDate(nextAppointment.appointment_date)} · {formatTime(nextAppointment.start_time)}
                    </p>
                  </>
                ) : (
                  <h3 className="mt-2 text-lg font-semibold text-slate-900">No upcoming visits</h3>
                )}
              </div>
              {nextAppointment && <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">Scheduled</span>}
            </div>
            <Link to="/patient/appointments" className="portal-link mt-5 inline-flex text-sm font-semibold">View appointments <span aria-hidden="true" className="ml-1">→</span></Link>
          </section>

          <section className="portal-action-card flex flex-col justify-between rounded-xl border border-slate-200 p-6 shadow-sm">
            <div>
              <p className="portal-eyebrow text-xs font-semibold uppercase tracking-wide">Plan your care</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">Book an appointment</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">Find a doctor and choose an available time that works for you.</p>
            </div>
            <button type="button" onClick={() => navigate("/patient/book-appointment")} className="portal-primary-button mt-5 inline-flex w-fit rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
              Book Appointment <span aria-hidden="true" className="ml-2">→</span>
            </button>
          </section>
        </div>
      </div>
    </>
  )
}

function PatientDashboard() {
  return (
    <PatientLayout>
      <PatientDashboardContent />
    </PatientLayout>
  )
}

export default PatientDashboard
