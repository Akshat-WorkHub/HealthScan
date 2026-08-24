import { useEffect, useState } from "react"
import { Link, NavLink } from "react-router-dom"
import { useAuth } from "../../../context/AuthContext"
import {
  getAdminPatients,
  updateAdminPatient,
  updateAdminPatientStatus,
} from "../../../services/api"


function AdminPatients() {
  const { token, user, logout } = useAuth()

  const [patients, setPatients] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [updatingPatientId, setUpdatingPatientId] = useState(null)

  const [showEditPatient, setShowEditPatient] = useState(false)
  const [editingPatientId, setEditingPatientId] = useState(null)
  const [updatingPatient, setUpdatingPatient] = useState(false)

  const [patientForm, setPatientForm] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    phone: "",
  })


  async function loadPatients() {
    setLoading(true)
    setError("")

    try {
      const data = await getAdminPatients(token)
      setPatients(data)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    if (token) {
      loadPatients()
    }
  }, [token])


  async function handleStatusChange(patient) {
    const newStatus = !patient.is_active

    setUpdatingPatientId(patient.id)
    setError("")

    try {
      await updateAdminPatientStatus(
        token,
        patient.id,
        newStatus
      )

      await loadPatients()
    } catch (error) {
      setError(error.message)
    } finally {
      setUpdatingPatientId(null)
    }
  }


  function handleEditPatient(patient) {
    setEditingPatientId(patient.id)

    setPatientForm({
      first_name: patient.first_name || "",
      last_name: patient.last_name || "",
      date_of_birth: patient.date_of_birth || "",
      phone: patient.phone || "",
    })

    setShowEditPatient(true)
  }


  function handlePatientFormChange(event) {
    const { name, value } = event.target

    setPatientForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }


  async function handleUpdatePatient(event) {
    event.preventDefault()

    setUpdatingPatient(true)
    setError("")

    try {
      await updateAdminPatient(
        token,
        editingPatientId,
        {
          first_name: patientForm.first_name,
          last_name: patientForm.last_name,
          date_of_birth: patientForm.date_of_birth,
          phone: patientForm.phone,
        }
      )

      setShowEditPatient(false)
      setEditingPatientId(null)

      setPatientForm({
        first_name: "",
        last_name: "",
        date_of_birth: "",
        phone: "",
      })

      await loadPatients()
    } catch (error) {
      setError(error.message)
    } finally {
      setUpdatingPatient(false)
    }
  }


  const filteredPatients = patients.filter((patient) => {
    const searchValue = search.toLowerCase()

    const fullName =
      `${patient.first_name} ${patient.last_name}`.toLowerCase()

    const phone =
      patient.phone?.toLowerCase() || ""

    return (
      fullName.includes(searchValue) ||
      phone.includes(searchValue)
    )
  })


  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <header className="border-b border-slate-200 bg-white">

        <div className="flex h-16 items-center justify-between px-6 lg:px-10">

          {/* Logo */}
          <Link
            to="/admin/dashboard"
            className="group"
          >
            <h1 className="text-lg font-bold tracking-tight text-slate-900">
              HealthScan{" "}
              <span className="text-blue-600">
                AI
              </span>
            </h1>

            <p className="text-xs text-slate-500">
              Administration Portal
            </p>
          </Link>


          {/* User */}
          <div className="flex items-center gap-5">

            <div className="hidden text-right sm:block">

              <p className="text-sm font-medium text-slate-900">
                {user?.email}
              </p>

              <p className="text-xs text-slate-500">
                Administrator
              </p>

            </div>

            <button
              onClick={logout}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Sign Out
            </button>

          </div>

        </div>

      </header>


      {/* Layout */}
      <div className="flex">

        {/* Sidebar */}
        <aside className="hidden min-h-[calc(100vh-64px)] w-64 border-r border-slate-200 bg-white lg:block">
          <nav className="space-y-1 p-4">

            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                `block rounded-lg px-4 py-3 text-sm transition ${
                  isActive
                    ? "bg-blue-50 font-semibold text-blue-700"
                    : "font-medium text-slate-600 hover:bg-slate-50"
                }`
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/admin/doctors"
              className={({ isActive }) =>
                `block rounded-lg px-4 py-3 text-sm transition ${
                  isActive
                    ? "bg-blue-50 font-semibold text-blue-700"
                    : "font-medium text-slate-600 hover:bg-slate-50"
                }`
              }
            >
              Doctors
            </NavLink>

            <NavLink
              to="/admin/patients"
              className={({ isActive }) =>
                `block rounded-lg px-4 py-3 text-sm transition ${
                  isActive
                    ? "bg-blue-50 font-semibold text-blue-700"
                    : "font-medium text-slate-600 hover:bg-slate-50"
                }`
              }
            >
              Patients
            </NavLink>

            <NavLink
              to="/admin/appointments"
              className={({ isActive }) =>
                `block rounded-lg px-4 py-3 text-sm transition ${
                  isActive
                    ? "bg-blue-50 font-semibold text-blue-700"
                    : "font-medium text-slate-600 hover:bg-slate-50"
                }`
              }
            >
              Appointments
            </NavLink>

            <NavLink
              to="/admin/doctor-leave"
              className={({ isActive }) =>
                `block rounded-lg px-4 py-3 text-sm transition ${
                  isActive
                    ? "bg-blue-50 font-semibold text-blue-700"
                    : "font-medium text-slate-600 hover:bg-slate-50"
                }`
              }
            >
              Doctor Leave
            </NavLink>

            <NavLink
              to="/admin/settings"
              className={({ isActive }) =>
                `block rounded-lg px-4 py-3 text-sm transition ${
                  isActive
                    ? "bg-blue-50 font-semibold text-blue-700"
                    : "font-medium text-slate-600 hover:bg-slate-50"
                }`
              }
            >
              Settings
            </NavLink>

          </nav>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1 p-6 lg:p-10">

          {/* Heading */}
          <div className="mb-8">

            <p className="text-sm font-medium text-blue-600">
              Administration
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Patient Management
            </h2>

            <p className="mt-2 text-base text-slate-500">
              Manage registered patient accounts and access.
            </p>

          </div>


          {/* Search */}
          <div className="mb-8 rounded-xl border border-slate-200 bg-white p-5">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search by patient name or phone"
                className="h-11 w-full rounded-lg border border-slate-300 px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:max-w-xl"
              />

              <div className="text-sm text-slate-500">
                Total Patients:{" "}
                <span className="font-semibold text-slate-900">
                  {patients.length}
                </span>
              </div>

            </div>

          </div>


          {/* Error */}
          {error && (
            <div className="mb-6 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3">

              <p className="text-sm text-red-600">
                {error}
              </p>

              <button
                onClick={loadPatients}
                className="text-sm font-semibold text-red-700 hover:underline"
              >
                Retry
              </button>

            </div>
          )}


          {/* Loading */}
          {loading ? (

            <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center">

              <p className="text-sm text-slate-500">
                Loading patients...
              </p>

            </div>

          ) : filteredPatients.length === 0 ? (

            /* Empty */
            <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">

                <span className="text-xl text-slate-500">
                  +
                </span>

              </div>

              <h3 className="mt-4 text-base font-semibold text-slate-900">
                {search
                  ? "No patients found"
                  : "No patients registered"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">

                {search
                  ? "Try changing your search terms."
                  : "Registered patients will appear here."}

              </p>

            </div>

          ) : (

            /* Patient Table */
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">

              <div className="overflow-x-auto">

                <table className="w-full min-w-[900px]">

                  <thead className="border-b border-slate-200 bg-slate-50">

                    <tr>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Patient
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Date of Birth
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Phone
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Actions
                      </th>

                    </tr>

                  </thead>


                  <tbody className="divide-y divide-slate-100">

                    {filteredPatients.map((patient) => {

                      const isActive =
                        patient.is_active ?? false

                      const isUpdating =
                        updatingPatientId === patient.id

                      return (

                        <tr
                          key={patient.id}
                          className="transition hover:bg-slate-50"
                        >

                          {/* Patient */}
                          <td className="px-6 py-5">

                            <div className="flex items-center gap-3">

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">

                                {patient.first_name
                                  ?.charAt(0)
                                  .toUpperCase()}

                                {patient.last_name
                                  ?.charAt(0)
                                  .toUpperCase()}

                              </div>


                              <div>

                                <p className="text-sm font-semibold text-slate-900">
                                  {patient.first_name}{" "}
                                  {patient.last_name}
                                </p>

                                <p className="text-xs text-slate-500">
                                  Patient ID #{patient.id}
                                </p>

                              </div>

                            </div>

                          </td>


                          {/* Date of Birth */}
                          <td className="px-6 py-5">

                            <p className="text-sm text-slate-700">
                              {patient.date_of_birth}
                            </p>

                          </td>


                          {/* Phone */}
                          <td className="px-6 py-5">

                            <p className="text-sm text-slate-700">
                              {patient.phone}
                            </p>

                          </td>


                          {/* Status */}
                          <td className="px-6 py-5">

                            <span
                              className={
                                isActive
                                  ? "inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                                  : "inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                              }
                            >

                              <span
                                className={
                                  isActive
                                    ? "h-1.5 w-1.5 rounded-full bg-emerald-500"
                                    : "h-1.5 w-1.5 rounded-full bg-slate-400"
                                }
                              />

                              {isActive
                                ? "Active"
                                : "Inactive"}

                            </span>

                          </td>


                          {/* Actions */}
                          <td className="px-6 py-5 text-right">

                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() =>
                                handleEditPatient(patient)
                              }
                              className="mr-4 text-sm font-semibold text-blue-600 transition hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Edit
                            </button>


                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() =>
                                handleStatusChange(patient)
                              }
                              className={
                                isActive
                                  ? "text-sm font-semibold text-red-600 transition hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                  : "text-sm font-semibold text-emerald-600 transition hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                              }
                            >

                              {isUpdating
                                ? "Updating..."
                                : isActive
                                  ? "Deactivate"
                                  : "Activate"}

                            </button>

                          </td>

                        </tr>

                      )
                    })}

                  </tbody>

                </table>

              </div>

            </div>

          )}

        </main>

      </div>


      {/* Edit Patient Modal */}
      {showEditPatient && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">

          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

              <div>

                <h3 className="text-lg font-semibold text-slate-900">
                  Edit Patient
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Update patient profile information.
                </p>

              </div>


              <button
                type="button"
                onClick={() => {
                  setShowEditPatient(false)
                  setEditingPatientId(null)
                }}
                className="rounded-lg px-3 py-2 text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                ×
              </button>

            </div>


            {/* Form */}
            <form
              onSubmit={handleUpdatePatient}
              className="space-y-5 p-6"
            >

              <div className="grid gap-5 sm:grid-cols-2">

                {/* First Name */}
                <div>

                  <label className="text-sm font-medium text-slate-700">
                    First Name
                  </label>

                  <input
                    type="text"
                    name="first_name"
                    value={patientForm.first_name}
                    onChange={handlePatientFormChange}
                    required
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>


                {/* Last Name */}
                <div>

                  <label className="text-sm font-medium text-slate-700">
                    Last Name
                  </label>

                  <input
                    type="text"
                    name="last_name"
                    value={patientForm.last_name}
                    onChange={handlePatientFormChange}
                    required
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>


                {/* Date of Birth */}
                <div>

                  <label className="text-sm font-medium text-slate-700">
                    Date of Birth
                  </label>

                  <input
                    type="date"
                    name="date_of_birth"
                    value={patientForm.date_of_birth}
                    onChange={handlePatientFormChange}
                    required
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>


                {/* Phone */}
                <div>

                  <label className="text-sm font-medium text-slate-700">
                    Phone
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={patientForm.phone}
                    onChange={handlePatientFormChange}
                    required
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>

              </div>


              {/* Actions */}
              <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">

                <button
                  type="button"
                  onClick={() => {
                    setShowEditPatient(false)
                    setEditingPatientId(null)
                  }}
                  className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  disabled={updatingPatient}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {updatingPatient
                    ? "Saving..."
                    : "Save Changes"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  )
}


export default AdminPatients
