import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import PatientLayout from "../PatientLayout"
import {
  getActiveDoctors,
  getDoctorSlots,
  bookAppointment,
} from "../../../services/api"


// ─── Helpers ─────────────────────────────────────────────────
function todayString() {
  return new Date().toISOString().split("T")[0]
}

function formatTime(t) {
  // t is "HH:MM" — format to "9:00 AM" style
  const [h, m] = t.split(":").map(Number)
  const ampm = h >= 12 ? "PM" : "AM"
  const hour = h % 12 || 12
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`
}

// ─── Step indicator ───────────────────────────────────────────
function StepBar({ step }) {
  const steps = ["Choose Doctor", "Pick Date & Slot", "Confirm"]
  return (
    <div className="mb-8 flex items-center gap-0">
      {steps.map((label, i) => {
        const idx = i + 1
        const active = idx === step
        const done = idx < step
        return (
          <div key={idx} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold
                  ${done ? "bg-blue-600 text-white" : active ? "bg-blue-600 text-white ring-4 ring-blue-100" : "bg-slate-200 text-slate-500"}`}
              >
                {done ? "✓" : idx}
              </div>
              <span className={`mt-1 text-xs font-medium ${active ? "text-blue-600" : "text-slate-400"}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`mb-4 h-0.5 flex-1 ${done ? "bg-blue-600" : "bg-slate-200"}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}


// ─── Main Component ───────────────────────────────────────────
function BookAppointment() {
  const navigate = useNavigate()
  const token = localStorage.getItem("access_token")

  const [step, setStep] = useState(1)
  const [pageError, setPageError] = useState("")

  // Step 1: Doctor list
  const [doctors, setDoctors] = useState([])
  const [doctorsLoading, setDoctorsLoading] = useState(true)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Step 2: Date & Slots
  const [selectedDate, setSelectedDate] = useState(todayString())
  const [slots, setSlots] = useState([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [slotsMessage, setSlotsMessage] = useState("")
  const [selectedSlot, setSelectedSlot] = useState(null)

  // Step 3: Booking
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingError, setBookingError] = useState("")
  const [booked, setBooked] = useState(false)
  const [bookedAppointment, setBookedAppointment] = useState(null)


  // ── Load doctors on mount ──────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        setDoctorsLoading(true)
        const data = await getActiveDoctors(token)
        setDoctors(data)
      } catch (err) {
        setPageError("Failed to load doctors: " + err.message)
      } finally {
        setDoctorsLoading(false)
      }
    }
    load()
  }, [token])


  // ── Load slots when doctor or date changes ─────────────────
  useEffect(() => {
    if (step !== 2 || !selectedDoctor || !selectedDate) return

    async function loadSlots() {
      try {
        setSlotsLoading(true)
        setSlotsMessage("")
        setSelectedSlot(null)
        setSlots([])
        const data = await getDoctorSlots(token, selectedDoctor.id, selectedDate)
        setSlots(data.slots || [])
        if (data.message) setSlotsMessage(data.message)
      } catch (err) {
        setSlotsMessage("Failed to load slots: " + err.message)
      } finally {
        setSlotsLoading(false)
      }
    }
    loadSlots()
  }, [step, selectedDoctor, selectedDate, token])


  // ── Confirm booking ────────────────────────────────────────
  async function handleConfirm() {
    if (!selectedDoctor || !selectedSlot) return
    setBookingLoading(true)
    setBookingError("")

    try {
      const result = await bookAppointment(token, {
        doctor_id: selectedDoctor.id,
        appointment_date: selectedDate,
        start_time: selectedSlot.start_time + ":00",
        end_time: selectedSlot.end_time + ":00",
      })
      setBookedAppointment(result)
      setBooked(true)
    } catch (err) {
      setBookingError(err.message)
    } finally {
      setBookingLoading(false)
    }
  }


  // ── Filtered doctors ───────────────────────────────────────
  const filteredDoctors = doctors.filter((d) => {
    const q = searchQuery.toLowerCase()
    return (
      d.first_name.toLowerCase().includes(q) ||
      d.last_name.toLowerCase().includes(q) ||
      d.specialization.toLowerCase().includes(q)
    )
  })


  // ── Success screen ─────────────────────────────────────────
  if (booked && bookedAppointment) {
    return (
      <PatientLayout>
        <div className="mx-auto max-w-xl py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Appointment Booked!</h2>
          <p className="mt-2 text-slate-500">Your appointment has been confirmed.</p>

          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-left">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="font-medium text-slate-600">Doctor</dt>
                <dd className="text-slate-900">{bookedAppointment.doctor_name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-slate-600">Specialization</dt>
                <dd className="text-slate-900">{bookedAppointment.doctor_specialization}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-slate-600">Date</dt>
                <dd className="text-slate-900">{bookedAppointment.appointment_date}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-slate-600">Time</dt>
                <dd className="text-slate-900">
                  {formatTime(bookedAppointment.start_time.slice(0, 5))} – {formatTime(bookedAppointment.end_time.slice(0, 5))}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-slate-600">Status</dt>
                <dd className="font-semibold text-emerald-700">{bookedAppointment.status}</dd>
              </div>
            </dl>
          </div>

          <div className="mt-8 flex gap-3 justify-center">
            <button
              onClick={() => navigate("/patient/dashboard")}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => {
                setBooked(false)
                setBookedAppointment(null)
                setStep(1)
                setSelectedDoctor(null)
                setSelectedSlot(null)
              }}
              className="rounded-lg border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Book Another
            </button>
          </div>
        </div>
      </PatientLayout>
    )
  }


  return (
    <PatientLayout>
      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/patient/dashboard")}
            className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-slate-900">Book an Appointment</h1>
          <p className="mt-1 text-sm text-slate-500">
            Choose a doctor, select an available time slot, and confirm your booking.
          </p>
        </div>

        {pageError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {pageError}
          </div>
        )}

        <StepBar step={step} />


        {/* ─── STEP 1: Choose Doctor ─── */}
        {step === 1 && (
          <div>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search by name or specialization…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {doctorsLoading ? (
              <div className="flex items-center justify-center py-16 text-slate-400 text-sm">
                Loading doctors…
              </div>
            ) : filteredDoctors.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-400 text-sm">
                {searchQuery ? "No doctors match your search." : "No active doctors found."}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredDoctors.map((doctor) => (
                  <button
                    key={doctor.id}
                    onClick={() => {
                      setSelectedDoctor(doctor)
                      setStep(2)
                    }}
                    className="rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-blue-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 text-lg font-bold">
                        {doctor.first_name[0]}{doctor.last_name[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900">
                          Dr. {doctor.first_name} {doctor.last_name}
                        </p>
                        <p className="text-sm text-blue-600">{doctor.specialization}</p>
                        <p className="mt-1 text-xs text-slate-400">
                          {doctor.qualification} · {doctor.experience_years} yrs exp · {doctor.slot_duration_minutes} min slots
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}


        {/* ─── STEP 2: Pick Date & Slot ─── */}
        {step === 2 && selectedDoctor && (
          <div>
            {/* Selected doctor banner */}
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm">
                {selectedDoctor.first_name[0]}{selectedDoctor.last_name[0]}
              </div>
              <div>
                <p className="font-semibold text-slate-900">
                  Dr. {selectedDoctor.first_name} {selectedDoctor.last_name}
                </p>
                <p className="text-xs text-blue-600">{selectedDoctor.specialization}</p>
              </div>
              <button
                onClick={() => { setStep(1); setSelectedSlot(null) }}
                className="ml-auto text-xs text-slate-400 hover:text-slate-700 underline"
              >
                Change
              </button>
            </div>

            {/* Date picker */}
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Select Date
            </label>
            <input
              type="date"
              min={todayString()}
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value)
                setSelectedSlot(null)
              }}
              className="mb-6 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />

            {/* Slots */}
            <p className="mb-3 text-sm font-medium text-slate-700">Available Slots</p>

            {slotsLoading ? (
              <div className="py-8 text-center text-sm text-slate-400">Loading slots…</div>
            ) : slotsMessage && slots.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
                {slotsMessage}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                {slots.map((slot) => {
                  const isSelected =
                    selectedSlot?.start_time === slot.start_time
                  return (
                    <button
                      key={slot.start_time}
                      disabled={!slot.available}
                      onClick={() => setSelectedSlot(slot)}
                      className={`rounded-lg border px-2 py-2 text-xs font-medium transition
                        ${!slot.available
                          ? "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300"
                          : isSelected
                            ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                            : "border-slate-200 bg-white text-slate-700 hover:border-blue-400 hover:bg-blue-50"
                        }`}
                    >
                      {formatTime(slot.start_time)}
                      {!slot.available && (
                        <span className="block text-slate-300">Booked</span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Navigation */}
            <div className="mt-8 flex justify-between">
              <button
                onClick={() => { setStep(1); setSelectedSlot(null) }}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                ← Back
              </button>
              <button
                disabled={!selectedSlot}
                onClick={() => setStep(3)}
                className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continue →
              </button>
            </div>
          </div>
        )}


        {/* ─── STEP 3: Confirm ─── */}
        {step === 3 && selectedDoctor && selectedSlot && (
          <div>
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-semibold text-slate-900">Appointment Summary</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Doctor</dt>
                  <dd className="font-medium text-slate-900">
                    Dr. {selectedDoctor.first_name} {selectedDoctor.last_name}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Specialization</dt>
                  <dd className="text-slate-900">{selectedDoctor.specialization}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Date</dt>
                  <dd className="text-slate-900">
                    {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-IN", {
                      weekday: "long", year: "numeric", month: "long", day: "numeric"
                    })}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Time</dt>
                  <dd className="font-medium text-slate-900">
                    {formatTime(selectedSlot.start_time)} – {formatTime(selectedSlot.end_time)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Duration</dt>
                  <dd className="text-slate-900">{selectedDoctor.slot_duration_minutes} minutes</dd>
                </div>
              </dl>
            </div>

            {bookingError && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {bookingError}
              </div>
            )}

            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                ← Back
              </button>
              <button
                onClick={handleConfirm}
                disabled={bookingLoading}
                className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {bookingLoading ? "Booking…" : "Confirm Appointment"}
              </button>
            </div>
          </div>
        )}

      </div>
    </PatientLayout>
  )
}

export default BookAppointment
