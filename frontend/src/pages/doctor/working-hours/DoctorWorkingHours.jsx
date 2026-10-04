import { useEffect, useState } from "react"
import DoctorLayout from "../DoctorLayout"
import { getMyWorkingHours, getMyDoctorProfile, saveMyWorkingSchedule, updateMyDoctorProfile } from "../../../services/api"

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const morning = () => ({ start_time: "09:00", end_time: "12:30" })
const afternoon = () => ({ start_time: "14:00", end_time: "18:00" })

function DoctorWorkingHours() {
  const token = localStorage.getItem("access_token")
  const [draft, setDraft] = useState({})
  const [duration, setDuration] = useState(30)
  const [notice, setNotice] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      const [hours, profile] = await Promise.all([getMyWorkingHours(token), getMyDoctorProfile(token)])
      setDuration(profile.slot_duration_minutes)
      setDraft(Object.fromEntries(days.map((_, day) => {
        const intervals = hours.filter((item) => item.day_of_week === day && item.is_active)
        return [day, intervals.length ? intervals.map((record) => ({ start_time: record.start_time.slice(0, 5), end_time: record.end_time.slice(0, 5) })) : []]
      })))
    } catch (e) { setError(e.message || "Unable to load working hours") }
    finally { setLoading(false) }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void load() }, 0)
    return () => window.clearTimeout(timer)
  }, [token])

  function toggle(day) {
    setDraft({ ...draft, [day]: draft[day]?.length ? [] : [morning(), afternoon()] })
  }

  async function save() {
    setError(""); setNotice("")
    try {
      await updateMyDoctorProfile(token, { slot_duration_minutes: Number(duration) })
      await saveMyWorkingSchedule(token, days.map((_, day) => ({
        day_of_week: day,
        intervals: draft[day] || [],
      })))
      setNotice("Your weekly working hours have been saved.")
      await load()
    } catch (e) { setError(e.message || "Unable to save working hours") }
  }

  return <DoctorLayout><section className="mx-auto max-w-4xl p-6 lg:p-10">
    <h2 className="text-2xl font-bold text-slate-900">Working Hours</h2>
    <p className="mt-2 text-sm text-slate-600">Set your recurring weekly schedule. The fixed lunch break, 12:30–14:00, is always excluded from bookings.</p>
    {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {notice && <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{notice}</p>}
    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
      <label className="flex items-center gap-3 text-sm font-medium text-slate-700">Appointment duration
        <select value={duration} onChange={(e) => setDuration(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2">
          {[15, 20, 30, 40, 45, 50, 60].map((n) => <option key={n} value={n}>{n} minutes</option>)}
        </select>
      </label>
    </div>
    <div className="mt-4 space-y-3">{days.map((name, day) => {
      const intervals = draft[day] || []
      const active = intervals.length > 0
      return <div key={day} className="grid items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-[140px_1fr_1fr_auto]">
        <label className="flex items-center gap-2 font-semibold text-slate-800"><input type="checkbox" checked={active} onChange={() => toggle(day)} />{name}</label>
        <div className="sm:col-span-2">
          {intervals.map((interval, index) => <div key={index} className="mb-2 flex items-end gap-3">
            <label className="flex-1 text-xs text-slate-500">Start<input type="time" value={interval.start_time} onChange={(e) => setDraft({ ...draft, [day]: intervals.map((range, i) => i === index ? { ...range, start_time: e.target.value } : range) })} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900" /></label>
            <label className="flex-1 text-xs text-slate-500">End<input type="time" value={interval.end_time} onChange={(e) => setDraft({ ...draft, [day]: intervals.map((range, i) => i === index ? { ...range, end_time: e.target.value } : range) })} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900" /></label>
            <button type="button" onClick={() => setDraft({ ...draft, [day]: intervals.filter((_, i) => i !== index) })} className="mb-1 text-xs font-medium text-red-600">Remove</button>
          </div>)}
          <button type="button" onClick={() => setDraft({ ...draft, [day]: [...intervals, intervals.at(-1)?.end_time === "12:30" ? afternoon() : { start_time: intervals.at(-1)?.end_time || "09:00", end_time: "18:00" }] })} className="mt-1 text-xs font-semibold text-blue-600">+ Add hours</button>
        </div>
        <span className="text-sm text-slate-500">{active ? "Working" : "Off"}</span>
      </div>
    })}</div>
    <button disabled={loading} onClick={save} className="mt-5 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">Save Schedule</button>
  </section></DoctorLayout>
}

export default DoctorWorkingHours
