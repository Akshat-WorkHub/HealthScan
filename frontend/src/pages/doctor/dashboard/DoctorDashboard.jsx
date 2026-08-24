import DoctorLayout from "../DoctorLayout"
import { NavLink } from "react-router-dom"


function DoctorDashboard() {
  return (
    <DoctorLayout>

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div className="border-b border-slate-200 bg-white px-6 py-6 lg:px-8">

        <p className="text-sm font-medium text-blue-600">
          Doctor Portal
        </p>

        <h2 className="mt-1 text-2xl font-bold text-slate-900">
          Doctor Dashboard
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Welcome back. Manage your appointments and availability from here.
        </p>

      </div>


      {/* ======================================================
          CONTENT
      ====================================================== */}

      <div className="p-6 lg:p-8">

        {/* ==================================================
            WELCOME CARD
        ================================================== */}

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <p className="text-sm font-medium text-blue-600">
            Welcome
          </p>

          <h3 className="mt-2 text-xl font-semibold text-slate-900">
            Welcome to your Doctor Dashboard
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Your doctor account is active and ready to use.
          </p>

        </div>


        {/* ==================================================
            QUICK ACTIONS
        ================================================== */}

        <div className="mt-6 grid gap-5 md:grid-cols-2">

          {/* Appointments */}

          <NavLink
            to="/doctor/appointments"
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-200 hover:shadow-md"
          >

            <h3 className="text-base font-semibold text-slate-900">
              Appointments
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              View and manage your scheduled patient appointments.
            </p>

            <p className="mt-4 text-sm font-semibold text-blue-600">
              View Appointments →
            </p>

          </NavLink>


          {/* Leave */}

          <NavLink
            to="/doctor/leave"
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-200 hover:shadow-md"
          >

            <h3 className="text-base font-semibold text-slate-900">
              My Leave
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Manage your leave periods and availability.
            </p>

            <p className="mt-4 text-sm font-semibold text-blue-600">
              Manage Leave →
            </p>

          </NavLink>

        </div>


        {/* ==================================================
            ACCOUNT INFORMATION
        ================================================== */}

        <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-6 py-5">

            <h3 className="text-base font-semibold text-slate-900">
              Account Information
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Current authenticated account details.
            </p>

          </div>


          <div className="grid gap-5 px-6 py-6 sm:grid-cols-2">

            {/* Email */}

            <div>

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Email
              </p>

              <p className="mt-2 text-sm font-medium text-slate-900">
                Doctor account
              </p>

            </div>


            {/* Role */}

            <div>

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Role
              </p>

              <span className="mt-2 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                DOCTOR
              </span>

            </div>


            {/* Account Status */}

            <div>

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Account Status
              </p>

              <span className="mt-2 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                ACTIVE
              </span>

            </div>

          </div>

        </div>

      </div>

    </DoctorLayout>
  )
}


export default DoctorDashboard