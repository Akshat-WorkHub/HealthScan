import { useEffect, useState } from "react"
import {
  generateMyPreVisitSummary,
  getMyPreVisitInformation,
  saveMyPreVisitInformation,
} from "../../../services/api"

function formatDate(dateString) {
  if (!dateString) return "—"
  return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function PreVisitInformationDialog({ appointment, onClose }) {
  const token = localStorage.getItem("access_token")
  const [symptoms, setSymptoms] = useState("")
  const [notes, setNotes] = useState("")
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  useEffect(() => {
    let active = true
    async function loadInformation() {
      try {
        const info = await getMyPreVisitInformation(token, appointment.id)
        if (!active) return
        setSymptoms(info?.symptoms || "")
        setNotes(info?.additional_notes || "")
        setSummary(info?.summary || null)
      } catch (err) {
        if (active) setError(err.message || "Unable to load pre-visit information.")
      } finally {
        if (active) setLoading(false)
      }
    }
    loadInformation()
    return () => { active = false }
  }, [appointment.id, token])

  async function handleSave(event) {
    event.preventDefault()
    setError("")
    setNotice("")
    setSaving(true)
    try {
      const saved = await saveMyPreVisitInformation(token, appointment.id, {
        symptoms,
        additional_notes: notes,
      })
      setSymptoms(saved.symptoms)
      setNotes(saved.additional_notes || "")
      setSummary(saved.summary || null)
      setNotice("Your pre-visit information has been saved.")
    } catch (err) {
      setError(err.message || "Unable to save your information.")
    } finally {
      setSaving(false)
    }
  }

  async function handleGenerateSummary() {
    setError("")
    setNotice("")
    setGenerating(true)
    try {
      const saved = await saveMyPreVisitInformation(token, appointment.id, {
        symptoms,
        additional_notes: notes,
      })
      setSummary(saved.summary || null)
      const generated = await generateMyPreVisitSummary(token, appointment.id)
      setSummary(generated)
      setNotice("Your preliminary AI summary is ready for your doctor.")
    } catch (err) {
      setError(err.message || "We couldn't generate your AI summary right now. Please try again later.")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-slate-900/50 p-4 backdrop-blur-xs">
      <section role="dialog" aria-modal="true" aria-labelledby="pre-visit-title" className="flex max-h-[calc(100dvh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-6 pb-4 pt-6 sm:px-8 sm:pt-8">
          <div>
            <p className="portal-eyebrow text-xs font-semibold uppercase tracking-wide">Appointment Pre-Visit</p>
            <h2 id="pre-visit-title" className="mt-1 text-xl font-bold text-slate-900">Pre-Visit Information</h2>
            <p className="mt-1 text-sm text-slate-500">{appointment.doctor_name} · {formatDate(appointment.appointment_date)}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close pre-visit information" className="portal-secondary-button shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">Close</button>
        </header>

        <div className="min-h-0 overflow-y-auto overscroll-contain px-6 pb-6 sm:px-8 sm:pb-8">
          {error && <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {notice && <p role="status" className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</p>}

          {loading ? <p className="py-10 text-center text-sm text-slate-500">Loading your pre-visit information...</p> : <>
            <form onSubmit={handleSave} className="mt-5 space-y-4">
              <div>
                <label htmlFor="pre-visit-symptoms" className="mb-1 block text-sm font-medium text-slate-700">Symptoms</label>
                <textarea id="pre-visit-symptoms" required minLength={5} maxLength={10000} rows={4} value={symptoms} onChange={(event) => setSymptoms(event.target.value)} placeholder="Describe the symptoms you would like to discuss with your doctor." className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label htmlFor="pre-visit-notes" className="mb-1 block text-sm font-medium text-slate-700">Additional notes <span className="font-normal text-slate-400">(optional)</span></label>
                <textarea id="pre-visit-notes" maxLength={10000} rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Anything else you want your doctor to know." className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </div>
              <div className="flex flex-wrap justify-end gap-3">
                <button type="submit" disabled={saving || generating} className="portal-secondary-button rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">{saving ? "Saving..." : "Save Information"}</button>
                <button type="button" onClick={handleGenerateSummary} disabled={saving || generating} className="portal-primary-button rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{generating ? "Generating..." : "Generate AI Summary"}</button>
              </div>
            </form>

            {summary && <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50/50 p-5">
              <h3 className="font-semibold text-slate-900">Your preliminary summary</h3>
              <p className="mt-3 text-sm"><span className="font-semibold">Urgency:</span> {summary.urgency_level}</p>
              <p className="mt-2 text-sm"><span className="font-semibold">Chief complaint:</span> {summary.chief_complaint}</p>
              <p className="mt-3 text-sm font-semibold">Questions to discuss with your doctor</p>
              <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm text-slate-700">
                {(Array.isArray(summary.suggested_questions) ? summary.suggested_questions : []).map((question, index) => <li key={index}>{question}</li>)}
              </ol>
              <p className="mt-4 text-xs text-slate-500">This AI-generated summary is preliminary and is not a medical diagnosis.</p>
            </div>}
          </>}
        </div>
      </section>
    </div>
  )
}

export default PreVisitInformationDialog
