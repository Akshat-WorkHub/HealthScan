import { useState } from "react"

import { usePatientPortal } from "../../../context/PatientContext"
import { createMyPatientProfile, updateMyPatientProfile } from "../../../services/api"
import PatientLayout from "../PatientLayout"

function formatDate(dateString) {
  if (!dateString) return "Not provided"
  return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function PatientProfileContent() {
  const { patient, setPatient, user } = usePatientPortal()
  const token = localStorage.getItem("access_token")
  const [editing, setEditing] = useState(!patient)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [form, setForm] = useState(() => ({
    first_name: patient?.first_name || "",
    last_name: patient?.last_name || "",
    date_of_birth: patient?.date_of_birth || "",
    phone: patient?.phone || "",
  }))

  function startEditing() {
    setForm({
      first_name: patient?.first_name || "",
      last_name: patient?.last_name || "",
      date_of_birth: patient?.date_of_birth || "",
      phone: patient?.phone || "",
    })
    setError("")
    setNotice("")
    setEditing(true)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError("")
    setNotice("")
    setSaving(true)
    try {
      const payload = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        date_of_birth: form.date_of_birth,
        phone: form.phone.trim(),
      }
      const saved = patient
        ? await updateMyPatientProfile(token, payload)
        : await createMyPatientProfile(token, payload)
      setPatient(saved)
      setEditing(false)
      setNotice("Your profile has been saved.")
    } catch (err) {
      setError(err.message || "Unable to save your profile.")
    } finally {
      setSaving(false)
    }
  }

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  return (
    <>
      <section className="portal-page-heading border-b border-slate-200 px-6 py-7 lg:px-8">
        <p className="portal-eyebrow text-sm font-semibold">Patient Portal</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Profile</h2>
        <p className="mt-1 text-sm text-slate-600">Manage the personal information associated with your account.</p>
      </section>

      <div className="mx-auto max-w-4xl space-y-6 p-6 lg:p-8">
        {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</p>}
        {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">{notice}</p>}

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-6 py-5">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Patient Account Summary</h3>
              <p className="mt-1 text-sm text-slate-500">Your personal and contact information.</p>
            </div>
            {!editing && <button type="button" onClick={startEditing} className="portal-secondary-button rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Edit Profile</button>}
          </div>

          {!editing ? (
            <dl className="grid gap-6 px-6 py-6 sm:grid-cols-2">
              <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Full Name</dt><dd className="mt-1 text-sm font-medium text-slate-900">{patient ? `${patient.first_name} ${patient.last_name}` : "Not provided yet"}</dd></div>
              <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Date of Birth</dt><dd className="mt-1 text-sm font-medium text-slate-900">{formatDate(patient?.date_of_birth)}</dd></div>
              <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone Number</dt><dd className="mt-1 text-sm font-medium text-slate-900">{patient?.phone || "Not provided"}</dd></div>
              <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Account Status</dt><dd className="mt-1"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${user?.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{user?.is_active ? "ACTIVE" : "INACTIVE"}</span></dd></div>
              <div className="sm:col-span-2"><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</dt><dd className="mt-1 text-sm font-medium text-slate-900">{user?.email || "Not provided"}</dd></div>
            </dl>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">First Name<input name="first_name" type="text" required value={form.first_name} onChange={updateField} className="mt-1.5 h-11 w-full rounded-lg border border-slate-300 px-3.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" /></label>
                <label className="block text-sm font-medium text-slate-700">Last Name<input name="last_name" type="text" required value={form.last_name} onChange={updateField} className="mt-1.5 h-11 w-full rounded-lg border border-slate-300 px-3.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" /></label>
                <label className="block text-sm font-medium text-slate-700">Date of Birth<input name="date_of_birth" type="date" required value={form.date_of_birth} onChange={updateField} className="mt-1.5 h-11 w-full rounded-lg border border-slate-300 px-3.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" /></label>
                <label className="block text-sm font-medium text-slate-700">Phone Number<input name="phone" type="tel" required value={form.phone} onChange={updateField} placeholder="e.g. +1 555-0199 or 9876543210" className="mt-1.5 h-11 w-full rounded-lg border border-slate-300 px-3.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" /></label>
              </div>
              <p className="text-sm text-slate-500">Account email: <span className="font-medium text-slate-700">{user?.email}</span></p>
              <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
                {patient && <button type="button" onClick={() => { setEditing(false); setError("") }} disabled={saving} className="portal-secondary-button rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Cancel</button>}
                <button type="submit" disabled={saving} className="portal-primary-button rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Saving..." : patient ? "Save Changes" : "Complete Profile"}</button>
              </div>
            </form>
          )}
        </section>
      </div>
    </>
  )
}

function PatientProfile() {
  return (
    <PatientLayout>
      <PatientProfileContent />
    </PatientLayout>
  )
}

export default PatientProfile
