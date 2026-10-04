import { useEffect, useState } from "react"
import DoctorLayout from "../DoctorLayout"
import { getMyDoctorAppointments } from "../../../services/api"

function formatDate(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  })
}

function formatTime(value) {
  const [hour, minute] = value.split(":").map(Number)
  return new Date(2000, 0, 1, hour, minute).toLocaleTimeString("en-IN", {
    hour: "numeric", minute: "2-digit", hour12: true,
  })
}

function DoctorAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const token = localStorage.getItem("access_token")

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const result = await getMyDoctorAppointments(token)
        if (active) setAppointments(Array.isArray(result) ? result : [])
      } catch (err) {
        if (active) setError(err.message || "Unable to load appointments")
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [token])

  return <DoctorLayout>
    <section className="border-b border-slate-200 bg-white px-6 py-6 lg:px-8">
      <p className="text-sm font-medium text-blue-600">Doctor Portal</p>
      <h2 className="mt-1 text-2xl font-bold text-slate-900">Appointments</h2>
      <p className="mt-1 text-sm text-slate-500">View appointments booked by your patients.</p>
    </section>

    <section className="p-6 lg:p-8">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h3 className="text-base font-semibold text-slate-900">My Appointments</h3>
          <p className="mt-1 text-sm text-slate-500">Appointments are shared with the patient portal from the same appointment record.</p>
        </div>
        {loading ? <p className="p-8 text-center text-sm text-slate-500">Loading appointments...</p>
          : error ? <p role="alert" className="m-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>
            : appointments.length === 0 ? <div className="px-6 py-16 text-center">
              <h4 className="font-semibold text-slate-900">No appointments found</h4>
              <p className="mt-2 text-sm text-slate-500">You currently have no patient appointments.</p>
            </div>
              : <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr><th className="px-6 py-3">Patient</th><th className="px-6 py-3">Date</th><th className="px-6 py-3">Time</th><th className="px-6 py-3">Status</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {appointments.map((appointment) => <tr key={appointment.id}>
                      <td className="px-6 py-4 font-medium text-slate-900">{appointment.patient_name?.trim() || "Patient"}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-slate-700">{formatDate(appointment.appointment_date)}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-slate-700">{formatTime(appointment.start_time)} – {formatTime(appointment.end_time)}</td>
                      <td className="px-6 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${appointment.status === "SCHEDULED" ? "bg-blue-50 text-blue-700" : appointment.status === "COMPLETED" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{appointment.status}</span></td>
                    </tr>)}
                  </tbody>
                </table>
              </div>}
      </div>
    </section>
  </DoctorLayout>
}

export default DoctorAppointments
