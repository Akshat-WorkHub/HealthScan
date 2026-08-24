import DoctorLayout from "../DoctorLayout"


function DoctorAppointments() {
  return (
    <DoctorLayout>

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <section className="border-b border-slate-200 bg-white px-6 py-6 lg:px-8">

        <p className="text-sm font-medium text-blue-600">
          Doctor Portal
        </p>

        <h2 className="mt-1 text-2xl font-bold text-slate-900">
          Appointments
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          View and manage your scheduled patient appointments.
        </p>

      </section>


      {/* ======================================================
          PAGE CONTENT
      ====================================================== */}

      <section className="p-6 lg:p-8">

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

          {/* Card Header */}

          <div className="border-b border-slate-200 px-6 py-5">

            <h3 className="text-base font-semibold text-slate-900">
              My Appointments
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Your scheduled patient appointments will appear here.
            </p>

          </div>


          {/* Empty State */}

          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-12 text-center">

            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">

              <svg
                className="h-7 w-7 text-blue-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <rect
                  x="3"
                  y="4"
                  width="18"
                  height="17"
                  rx="2"
                />

                <path d="M16 2v4" />
                <path d="M8 2v4" />
                <path d="M3 10h18" />
              </svg>

            </div>

            <h4 className="text-base font-semibold text-slate-900">
              No appointments found
            </h4>

            <p className="mt-2 max-w-md text-sm text-slate-500">
              You currently have no scheduled patient appointments.
            </p>

          </div>

        </div>

      </section>

    </DoctorLayout>
  )
}


export default DoctorAppointments