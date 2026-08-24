import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { checkBackendHealth } from "../../services/api"

function CalendarIcon() {
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
      <path d="M8 14h3M8 17h3M14 14h3M14 17h3" />
    </svg>
  )
}

function MedicationIcon() {
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M8 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
      <path d="M9 7h6M9 11h6M9 15h3" />
      <path d="M17 15v4M15 17h4" />
    </svg>
  )
}

function PrescriptionIcon() {
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
      <path d="M8 8h8M8 12h8M8 16h5" />
      <path d="M17 15l2 2-3 3-2-2 3-3Z" />
    </svg>
  )
}

function PatientIcon() {
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="8" r="3" />
      <path d="M5 21a7 7 0 0 1 14 0" />
    </svg>
  )
}

function DoctorIcon() {
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="7" r="3" />
      <path d="M5 21a7 7 0 0 1 14 0" />
      <path d="M18 4v4M16 6h4" />
    </svg>
  )
}

function AdminIcon() {
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4Z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}

function Home() {
  const [systemStatus, setSystemStatus] = useState("Checking")

  useEffect(() => {
    checkBackendHealth()
      .then(() => {
        setSystemStatus("Operational")
      })
      .catch(() => {
        setSystemStatus("Unavailable")
      })
  }, [])

  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* =========================
          NAVBAR
      ========================== */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-6 lg:px-10">

          {/* Logo */}
          <Link
            to="/"
            className="text-[24px] font-bold tracking-tight"
          >
            HealthScan{" "}
            <span className="text-blue-600">AI</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden items-center gap-10 md:flex">
            <a
              href="#home"
              className="text-[15px] font-medium text-slate-700 transition hover:text-blue-600"
            >
              Home
            </a>

            <a
              href="#features"
              className="text-[15px] font-medium text-slate-500 transition hover:text-blue-600"
            >
              Features
            </a>

            <a
              href="#how-it-works"
              className="text-[15px] font-medium text-slate-500 transition hover:text-blue-600"
            >
              How It Works
            </a>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-5">
            <a
              href="#portals"
              className="hidden text-[15px] font-semibold text-slate-700 transition hover:text-blue-600 sm:block"
            >
              Sign in
            </a>

            <a
              href="#portals"
              className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Get Started
            </a>
          </div>
        </div>
      </header>


      {/* =========================
          HERO SECTION
      ========================== */}
      <section
        id="home"
        className="relative overflow-hidden bg-slate-50"
      >
        <div className="mx-auto grid min-h-[620px] max-w-[1280px] items-center gap-14 px-6 py-20 lg:grid-cols-2 lg:px-10">

          {/* Hero content */}
          <div>

            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              A smarter healthcare experience
            </div>

            <h1 className="max-w-[650px] text-5xl font-bold leading-[1.08] tracking-tight text-slate-950 md:text-6xl">
              Your healthcare,
              <br />
              <span className="text-blue-600">
                simplified.
              </span>
            </h1>

            <p className="mt-7 max-w-[600px] text-lg leading-8 text-slate-500">
              Manage appointments, connect with doctors, receive
              medication reminders, and keep your healthcare journey
              organized in one secure platform.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <a
                href="#portals"
                className="rounded-lg bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                Get Started
                <span className="ml-2">→</span>
              </a>

              <a
                href="#portals"
                className="rounded-lg border border-slate-300 bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-600"
              >
                Sign In
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-500">
              <span className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span>
                Easy appointment management
              </span>

              <span className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span>
                Medication reminders
              </span>
            </div>
          </div>


          {/* Hero dashboard mockup */}
          <div className="relative">

            <div className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-[0_25px_70px_rgba(15,23,42,0.10)]">

              <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">
                    Patient Portal
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-900">
                    Your Health Dashboard
                  </h2>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <CalendarIcon />
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-slate-50 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Upcoming Appointment
                    </p>

                    <h3 className="mt-2 text-lg font-semibold text-slate-900">
                      Doctor Consultation
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Manage your scheduled visits
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                    Scheduled
                  </span>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4">

                <div className="rounded-2xl border border-slate-200 p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <CalendarIcon />
                  </div>

                  <p className="mt-4 font-semibold text-slate-900">
                    Appointments
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Book & manage visits
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <PatientIcon />
                  </div>

                  <p className="mt-4 font-semibold text-slate-900">
                    My Profile
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Manage your information
                  </p>
                </div>

              </div>
            </div>

            {/* Floating reminder */}
            <div className="absolute -bottom-6 -left-8 hidden rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-lg sm:flex sm:items-center sm:gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <MedicationIcon />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Medication Reminder
                </p>

                <p className="text-xs text-slate-500">
                  Never miss an important dose
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* =========================
          ROLE PORTALS
      ========================== */}
      <section
        id="portals"
        className="scroll-mt-20 bg-white py-24"
      >
        <div className="mx-auto max-w-[1280px] px-6 lg:px-10">

          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold text-blue-600">
              Choose your portal
            </p>

            <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
              One platform, three experiences
            </h2>

            <p className="mt-4 text-lg leading-7 text-slate-500">
              Access the tools designed specifically for your role in
              the healthcare journey.
            </p>
          </div>


          <div className="mt-14 grid gap-7 lg:grid-cols-3">

            {/* Patient */}
            <div className="flex min-h-[430px] flex-col rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <PatientIcon />
              </div>

              <div className="mt-6">
                <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-blue-600">
                  Patient
                </span>

                <h3 className="mt-5 text-2xl font-bold text-slate-950">
                  Patient Portal
                </h3>

                <p className="mt-2 text-base text-slate-500">
                  Book appointments and stay on top of your healthcare.
                </p>
              </div>

              <ul className="mt-7 space-y-3 text-sm text-slate-600">
                <li>• Search doctors & available slots</li>
                <li>• Manage upcoming appointments</li>
                <li>• Receive medication reminders</li>
                <li>• Access structured prescriptions</li>
              </ul>

              <div className="mt-auto flex gap-3 pt-8">
                <Link
                  to="/patient/register"
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Register
                </Link>

                <Link
                  to="/patient/login"
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-600"
                >
                  Sign In
                </Link>
              </div>
            </div>


            {/* Doctor */}
            <div className="flex min-h-[430px] flex-col rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <DoctorIcon />
              </div>

              <div className="mt-6">
                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-emerald-600">
                  Provider
                </span>

                <h3 className="mt-5 text-2xl font-bold text-slate-950">
                  Doctor Portal
                </h3>

                <p className="mt-2 text-base text-slate-500">
                  Manage appointments and provide better patient care.
                </p>
              </div>

              <ul className="mt-7 space-y-3 text-sm text-slate-600">
                <li>• Manage working hours & availability</li>
                <li>• View scheduled appointments</li>
                <li>• Review patient information</li>
                <li>• Create structured prescriptions</li>
              </ul>

              <div className="mt-auto pt-8">
                <Link
                  to="/doctor/login"
                  className="block rounded-lg bg-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Doctor Sign In
                </Link>
              </div>
            </div>


            {/* Admin */}
            <div className="flex min-h-[430px] flex-col rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <AdminIcon />
              </div>

              <div className="mt-6">
                <span className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-violet-600">
                  Administrator
                </span>

                <h3 className="mt-5 text-2xl font-bold text-slate-950">
                  Admin Portal
                </h3>

                <p className="mt-2 text-base text-slate-500">
                  Configure and manage the healthcare platform.
                </p>
              </div>

              <ul className="mt-7 space-y-3 text-sm text-slate-600">
                <li>• Manage doctor accounts</li>
                <li>• Configure appointment settings</li>
                <li>• Manage doctor schedules & leaves</li>
                <li>• Monitor platform operations</li>
              </ul>

              <div className="mt-auto pt-8">
                <Link
                  to="/admin/login"
                  className="block rounded-lg bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Admin Sign In
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* =========================
          FEATURES
      ========================== */}
      <section
        id="features"
        className="scroll-mt-20 border-y border-slate-100 bg-slate-50 py-24"
      >
        <div className="mx-auto max-w-[1280px] px-6 lg:px-10">

          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold text-blue-600">
              Everything in one place
            </p>

            <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
              Healthcare made simpler
            </h2>

            <p className="mt-4 text-lg leading-8 text-slate-500">
              HealthScan brings the essential parts of your healthcare
              journey together in one platform.
            </p>
          </div>


          <div className="mt-14 grid gap-7 lg:grid-cols-3">

            {/* Appointments */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <CalendarIcon />
              </div>

              <h3 className="mt-7 text-xl font-semibold text-slate-950">
                Easy Appointments
              </h3>

              <p className="mt-3 leading-7 text-slate-500">
                Find available doctors, explore appointment slots,
                and manage your upcoming visits from one convenient place.
              </p>
            </div>


            {/* Medication */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <MedicationIcon />
              </div>

              <h3 className="mt-7 text-xl font-semibold text-slate-950">
                Medication Reminders
              </h3>

              <p className="mt-3 leading-7 text-slate-500">
                Stay on schedule with medication reminders delivered
                through email and calendar-based notifications.
              </p>
            </div>


            {/* Prescription */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <PrescriptionIcon />
              </div>

              <h3 className="mt-7 text-xl font-semibold text-slate-950">
                Structured Prescriptions
              </h3>

              <p className="mt-3 leading-7 text-slate-500">
                Keep prescriptions organized with structured medication,
                dosage, and instruction details from your doctor.
              </p>
            </div>

          </div>
        </div>
      </section>


      {/* =========================
          HOW IT WORKS
      ========================== */}
      <section
        id="how-it-works"
        className="scroll-mt-20 bg-slate-50 py-24"
      >
        <div className="mx-auto max-w-[1280px] px-6 lg:px-10">

          <div className="text-center">
            <p className="text-sm font-semibold text-blue-600">
              Simple process
            </p>

            <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
              How it works
            </h2>
          </div>


          <div className="mt-16 grid gap-12 lg:grid-cols-3">

            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                01
              </div>

              <h3 className="mt-7 text-xl font-semibold">
                Choose your portal
              </h3>

              <p className="mx-auto mt-3 max-w-sm leading-7 text-slate-500">
                Select the patient, doctor, or administrator portal
                based on your role.
              </p>
            </div>


            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                02
              </div>

              <h3 className="mt-7 text-xl font-semibold">
                Access your dashboard
              </h3>

              <p className="mx-auto mt-3 max-w-sm leading-7 text-slate-500">
                Sign in securely and access the tools available
                for your role.
              </p>
            </div>


            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                03
              </div>

              <h3 className="mt-7 text-xl font-semibold">
                Manage healthcare
              </h3>

              <p className="mx-auto mt-3 max-w-sm leading-7 text-slate-500">
                Book appointments, manage schedules, consultations,
                prescriptions, and more.
              </p>
            </div>

          </div>
        </div>
      </section>


      {/* =========================
          CTA
      ========================== */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">

          <h2 className="text-4xl font-bold tracking-tight text-slate-950">
            Take control of your healthcare journey
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-500">
            Get started with HealthScan and manage your healthcare
            experience with ease.
          </p>

          <a
            href="#portals"
            className="mt-9 inline-flex rounded-lg bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Choose Your Portal
            <span className="ml-2">→</span>
          </a>

        </div>
      </section>


      {/* =========================
          FOOTER
      ========================== */}
      <footer className="border-t border-slate-200 bg-white">

        <div className="mx-auto flex max-w-[1280px] flex-col justify-between gap-8 px-6 py-10 sm:flex-row sm:items-center lg:px-10">

          <div>
            <p className="text-lg font-bold">
              HealthScan{" "}
              <span className="text-blue-600">AI</span>
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Health Appointment Manager
            </p>
          </div>


          <div className="flex items-center gap-3">

            <span
              className={`h-2.5 w-2.5 rounded-full ${
                systemStatus === "Operational"
                  ? "bg-emerald-500"
                  : systemStatus === "Unavailable"
                    ? "bg-red-500"
                    : "bg-amber-400"
              }`}
            />

            <div>
              <p className="text-xs text-slate-400">
                System status
              </p>

              <p
                className={`text-sm font-semibold ${
                  systemStatus === "Operational"
                    ? "text-emerald-600"
                    : systemStatus === "Unavailable"
                      ? "text-red-600"
                      : "text-amber-600"
                }`}
              >
                {systemStatus}
              </p>
            </div>

          </div>
        </div>

      </footer>

    </div>
  )
}

export default Home