import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"

import { getMyPatientAppointments } from "../../../services/api"
import PatientLayout from "../PatientLayout"
import PreVisitInformationDialog from "./PreVisitInformationDialog"

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

function StatusBadge({ status }) {
  const styles = {
    SCHEDULED: "bg-blue-50 text-blue-700",
    COMPLETED: "bg-emerald-50 text-emerald-700",
    CANCELLED: "bg-red-50 text-red-700",
  }
  const labels = { SCHEDULED: "Scheduled", COMPLETED: "Completed", CANCELLED: "Cancelled" }
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[status] || "bg-slate-100 text-slate-700"}`}>{labels[status] || status}</span>
}

function AppointmentTable({ appointments, upcoming = false, onOpenPreVisit }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left">
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            <th scope="col" className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Doctor</th>
            <th scope="col" className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Specialization</th>
            <th scope="col" className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Date</th>
            <th scope="col" className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Time</th>
            <th scope="col" className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
            {upcoming && <th scope="col" className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Pre-Visit</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {appointments.map((appointment) => (
            <tr key={appointment.id} className="transition hover:bg-slate-50">
              <td className="px-5 py-4 text-sm font-semibold text-slate-900">{appointment.doctor_name}</td>
              <td className="px-5 py-4 text-sm text-slate-600">{appointment.doctor_specialization}</td>
              <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">{formatDate(appointment.appointment_date)}</td>
              <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">{formatTime(appointment.start_time)}</td>
              <td className="px-5 py-4"><StatusBadge status={appointment.status} /></td>
              {upcoming && <td className="px-5 py-4 text-right">
                <button type="button" onClick={() => onOpenPreVisit(appointment)} className="portal-secondary-button whitespace-nowrap rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50">Pre-Visit Information</button>
              </td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function EmptyState({ title, description, action }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center px-6 py-10 text-center">
      <span aria-hidden="true" className="portal-empty-icon mb-3 flex h-11 w-11 items-center justify-center rounded-full text-lg">✚</span>
      <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      {action}
    </div>
  )
}

function PatientAppointments() {
  const token = localStorage.getItem("access_token")
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedAppointment, setSelectedAppointment] = useState(null)

  useEffect(() => {
    let active = true
    getMyPatientAppointments(token)
      .then((result) => {
        if (active) setAppointments(Array.isArray(result) ? result : [])
      })
      .catch((err) => {
        if (!active) return
        setAppointments([])
        setError(err.message || "Unable to load your appointments.")
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
      setError(err.message || "Unable to load your appointments.")
    } finally {
      setLoading(false)
    }
  }

  const upcomingAppointments = useMemo(
    () => appointments.filter((appointment) => appointment.status === "SCHEDULED"),
    [appointments],
  )
  const pastAppointments = useMemo(
    () => appointments.filter((appointment) => ["COMPLETED", "CANCELLED"].includes(appointment.status)),
    [appointments],
  )

  return (
    <PatientLayout>
      <section className="portal-page-heading border-b border-slate-200 px-6 py-7 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="portal-eyebrow text-sm font-semibold">Patient Portal</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Appointments</h2>
            <p className="mt-1 text-sm text-slate-600">View upcoming visits and your appointment history.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={loadAppointments} disabled={loading} className="portal-secondary-button rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">{loading ? "Refreshing…" : "Refresh"}</button>
            <Link to="/patient/book-appointment" className="portal-primary-button rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Book Appointment</Link>
          </div>
        </div>
      </section>

      <div className="space-y-6 p-6 lg:p-8">
        {error && <div role="alert" className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"><p>{error}</p><button type="button" onClick={loadAppointments} className="font-semibold text-red-800 hover:underline">Retry</button></div>}

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-5 sm:px-6">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Upcoming Appointments</h3>
              <p className="mt-1 text-sm text-slate-500">Your scheduled visits and pre-visit information.</p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{upcomingAppointments.length} scheduled</span>
          </div>
          {loading ? <p className="px-6 py-12 text-center text-sm text-slate-500">Loading upcoming appointments…</p> : upcomingAppointments.length ? (
            <AppointmentTable appointments={upcomingAppointments} upcoming onOpenPreVisit={setSelectedAppointment} />
          ) : (
            <EmptyState title="No upcoming appointments" description="You do not have any scheduled appointments at this time." action={<Link to="/patient/book-appointment" className="portal-link mt-4 text-sm font-semibold">Find a doctor →</Link>} />
          )}
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
            <h3 className="text-base font-semibold text-slate-900">Past Appointments</h3>
            <p className="mt-1 text-sm text-slate-500">History of completed and cancelled visits.</p>
          </div>
          {loading ? <p className="px-6 py-12 text-center text-sm text-slate-500">Loading appointment history…</p> : pastAppointments.length ? (
            <AppointmentTable appointments={pastAppointments} />
          ) : (
            <EmptyState title="No past appointment records found" description="Completed or cancelled appointments will appear here." />
          )}
        </section>
      </div>

      {selectedAppointment && <PreVisitInformationDialog key={selectedAppointment.id} appointment={selectedAppointment} onClose={() => setSelectedAppointment(null)} />}
    </PatientLayout>
  )
}

export default PatientAppointments
