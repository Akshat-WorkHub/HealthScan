import { useEffect, useState } from "react"
import DoctorLayout from "../DoctorLayout"

import {
  getMyDoctorLeaves,
  createDoctorLeave,
} from "../../../services/api"


function DoctorLeave() {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [reason, setReason] = useState("")

  const [leaveHistory, setLeaveHistory] = useState([])

  const [loading, setLoading] = useState(false)
  const [loadingLeaves, setLoadingLeaves] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")


  const token = localStorage.getItem("access_token")


  // ============================================================
  // LOAD LEAVE HISTORY
  // ============================================================

  async function loadLeaves() {
    try {
      setLoadingLeaves(true)
      setError("")

      if (!token) {
        throw new Error("Authentication token not found")
      }

      const data = await getMyDoctorLeaves(token)

      setLeaveHistory(data)
    } catch (err) {
      console.error("Failed to load leaves:", err)

      setError(
        err.message ||
        "Failed to load leave history."
      )
    } finally {
      setLoadingLeaves(false)
    }
  }


  useEffect(() => {
    loadLeaves()
  }, [])


  // ============================================================
  // ADD LEAVE
  // ============================================================

  async function handleAddLeave(event) {
    event.preventDefault()

    setError("")
    setSuccess("")

    if (!startDate || !endDate) {
      setError(
        "Please select both start date and end date."
      )
      return
    }

    if (startDate > endDate) {
      setError(
        "End date cannot be before start date."
      )
      return
    }

    if (!reason.trim()) {
      setError(
        "Please enter a reason for your leave."
      )
      return
    }

    try {
      setLoading(true)

      if (!token) {
        throw new Error(
          "Authentication token not found"
        )
      }

      await createDoctorLeave(
        token,
        {
          start_date: startDate,
          end_date: endDate,
          reason: reason.trim(),
        }
      )

      setStartDate("")
      setEndDate("")
      setReason("")

      setSuccess(
        "Leave request submitted successfully."
      )

      // Reload from database
      await loadLeaves()

    } catch (err) {
      console.error(
        "Add leave failed:",
        err
      )

      setError(
        err.message ||
        "Unable to add leave. Please try again."
      )

    } finally {
      setLoading(false)
    }
  }


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
          My Leave
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Manage your leave dates and availability.
        </p>

      </section>


      {/* ======================================================
          PAGE CONTENT
      ====================================================== */}

      <section className="space-y-6 p-6 lg:p-8">

        {/* ==================================================
            ADD LEAVE
        ================================================== */}

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-6 py-5">

            <h3 className="text-xl font-semibold text-slate-900">
              Add Leave
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Select the dates when you will be unavailable.
            </p>

          </div>


          <form
            onSubmit={handleAddLeave}
            className="px-6 py-6 lg:px-8"
          >

            {/* Error */}

            {error && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-600">
                  {error}
                </p>
              </div>
            )}


            {/* Success */}

            {success && (
              <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
                <p className="text-sm text-emerald-600">
                  {success}
                </p>
              </div>
            )}


            {/* Dates */}

            <div className="grid gap-5 md:grid-cols-2">

              {/* Start Date */}

              <div>

                <label
                  htmlFor="start-date"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Start Date
                </label>

                <input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(event) =>
                    setStartDate(event.target.value)
                  }
                  disabled={loading}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                />

              </div>


              {/* End Date */}

              <div>

                <label
                  htmlFor="end-date"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  End Date
                </label>

                <input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(event) =>
                    setEndDate(event.target.value)
                  }
                  disabled={loading}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                />

              </div>

            </div>


            {/* Reason */}

            <div className="mt-5">

              <label
                htmlFor="leave-reason"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Reason
              </label>

              <textarea
                id="leave-reason"
                value={reason}
                onChange={(event) =>
                  setReason(event.target.value)
                }
                placeholder="Enter the reason for your leave"
                rows={4}
                disabled={loading}
                className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              />

            </div>


            {/* Button */}

            <div className="mt-6 flex justify-end">

              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Adding..." : "Add Leave"}
              </button>

            </div>

          </form>

        </div>


        {/* ==================================================
            LEAVE HISTORY
        ================================================== */}

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-6 py-5">

            <h3 className="text-xl font-semibold text-slate-900">
              Leave History
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              View your previously scheduled leave periods.
            </p>

          </div>


          {leaveHistory.length === 0 ? (

            <div className="flex min-h-[220px] flex-col items-center justify-center px-6 py-10 text-center">

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
                No leave records found
              </h4>

              <p className="mt-2 text-sm text-slate-500">
                Your scheduled leave periods will appear here.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead className="border-b border-slate-200 bg-slate-50">

                  <tr>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Start Date
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      End Date
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Reason
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                  </tr>

                </thead>


                <tbody className="divide-y divide-slate-200">

                  {leaveHistory.map((leave) => (

                    <tr key={leave.id}>

                      <td className="px-6 py-4 text-sm text-slate-900">
                        {leave.start_date}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-900">
                        {leave.end_date}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {leave.reason}
                      </td>

                      <td className="px-6 py-4">

                        <span className="inline-flex rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700">
                          {leave.status}
                        </span>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </section>

    </DoctorLayout>
  )
}


export default DoctorLeave