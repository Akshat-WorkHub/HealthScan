import { useEffect, useState } from "react"
import { Link, NavLink } from "react-router-dom"
import { useAuth } from "../../../context/AuthContext"
import {
  getAdminDoctors,
  updateAdminDoctorStatus,
  createAdminDoctor,
  updateAdminDoctor,
} from "../../../services/api"


function AdminDoctors() {
  const { token, user, logout } = useAuth()

  const [doctors, setDoctors] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [updatingDoctorId, setUpdatingDoctorId] = useState(null)

  const [showAddDoctor, setShowAddDoctor] = useState(false)

  const [showEditDoctor, setShowEditDoctor] = useState(false)
  const [editingDoctorId, setEditingDoctorId] = useState(null)
  const [updatingDoctor, setUpdatingDoctor] = useState(false)

    const [doctorForm, setDoctorForm] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    specialization: "",
    qualification: "",
    experience_years: "",
    slot_duration_minutes: "",
    })

    const [addingDoctor, setAddingDoctor] = useState(false)


  async function loadDoctors() {
    setLoading(true)
    setError("")

    try {
      const data = await getAdminDoctors(token)
      setDoctors(data)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    if (token) {
      loadDoctors()
    }
  }, [token])


  async function handleStatusChange(doctor) {
    const newStatus = !doctor.is_active

    setUpdatingDoctorId(doctor.id)
    setError("")

    try {
        await updateAdminDoctorStatus(
        token,
        doctor.id,
        newStatus
        )

        await loadDoctors()
    } catch (error) {
        setError(error.message)
    } finally {
        setUpdatingDoctorId(null)
    }
 }

 function handleEditDoctor(doctor) {
    setEditingDoctorId(doctor.id)

    setDoctorForm({
        email: "",
        password: "",
        first_name: doctor.first_name || "",
        last_name: doctor.last_name || "",
        specialization: doctor.specialization || "",
        qualification: doctor.qualification || "",
        experience_years: doctor.experience_years ?? "",
        slot_duration_minutes: doctor.slot_duration_minutes ?? "",
    })

    setShowEditDoctor(true)
 }

 async function handleUpdateDoctor(event) {
    event.preventDefault()

    setUpdatingDoctor(true)
    setError("")

    try {
        await updateAdminDoctor(token, editingDoctorId, {
        first_name: doctorForm.first_name,
        last_name: doctorForm.last_name,
        specialization: doctorForm.specialization,
        qualification: doctorForm.qualification,
        experience_years: Number(
            doctorForm.experience_years
        ),
        slot_duration_minutes: Number(
            doctorForm.slot_duration_minutes
        ),
        })

        setShowEditDoctor(false)
        setEditingDoctorId(null)

        await loadDoctors()
    } catch (error) {
        setError(error.message)
    } finally {
        setUpdatingDoctor(false)
    }
 }


 function handleDoctorFormChange(event) {
    const { name, value } = event.target

    setDoctorForm((previous) => ({
        ...previous,
        [name]: value,
    }))
 }

 async function handleAddDoctor(event) {
    event.preventDefault()

    setAddingDoctor(true)
    setError("")

    try {
        await createAdminDoctor(token, {
        email: doctorForm.email,
        password: doctorForm.password,
        first_name: doctorForm.first_name,
        last_name: doctorForm.last_name,
        specialization: doctorForm.specialization,
        qualification: doctorForm.qualification,
        experience_years: Number(
            doctorForm.experience_years
        ),
        slot_duration_minutes: Number(
            doctorForm.slot_duration_minutes
        ),
        })

        await loadDoctors()

        setDoctorForm({
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        specialization: "",
        qualification: "",
        experience_years: "",
        slot_duration_minutes: "",
        })

        setShowAddDoctor(false)

    } catch (error) {
        setError(error.message)

    } finally {
        setAddingDoctor(false)
    }
 }



  const filteredDoctors = doctors.filter((doctor) => {
    const searchValue = search.toLowerCase()

    const fullName =
      `${doctor.first_name} ${doctor.last_name}`.toLowerCase()

    const specialization =
      doctor.specialization.toLowerCase()

    const qualification =
      doctor.qualification.toLowerCase()

    return (
      fullName.includes(searchValue) ||
      specialization.includes(searchValue) ||
      qualification.includes(searchValue)
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

            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              Doctor Management
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Manage doctor profiles, access and availability.
            </p>

          </div>


          {/* Toolbar */}
          <div className="mb-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">

            {/* Search */}
            <div className="w-full sm:max-w-md">

              <label
                htmlFor="doctor-search"
                className="sr-only"
              >
                Search doctors
              </label>

              <input
                id="doctor-search"
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search by name, specialization or qualification"
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>


            {/* Add Doctor */}
            <button
                type="button"
                onClick={() => setShowAddDoctor(true)}
                className="h-10 shrink-0 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                + Add Doctor
            </button>

          </div>


          {/* Error */}
          {error && (
            <div className="mb-6 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3">

              <p className="text-sm text-red-600">
                {error}
              </p>

              <button
                onClick={loadDoctors}
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
                Loading doctors...
              </p>

            </div>
          ) : filteredDoctors.length === 0 ? (

            /* Empty */
            <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">

                <span className="text-xl text-slate-500">
                  +
                </span>

              </div>

              <h3 className="mt-4 text-base font-semibold text-slate-900">
                {search
                  ? "No doctors found"
                  : "No doctors registered"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">

                {search
                  ? "Try changing your search terms."
                  : "Add a doctor to start managing your medical staff."}

              </p>

            </div>
          ) : (

            /* Doctor Table */
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">

              <div className="overflow-x-auto">

                <table className="w-full min-w-[850px]">

                  <thead className="border-b border-slate-200 bg-slate-50">

                    <tr>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Doctor
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Specialization
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Qualification
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Experience
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Action
                      </th>

                    </tr>

                  </thead>


                  <tbody className="divide-y divide-slate-100">

                    {filteredDoctors.map((doctor) => {

                      const isActive =
                        doctor.is_active ?? true

                      const isUpdating =
                        updatingDoctorId === doctor.id

                      return (
                        <tr
                          key={doctor.id}
                          className="transition hover:bg-slate-50"
                        >

                          {/* Doctor */}
                          <td className="px-6 py-5">

                            <div className="flex items-center gap-3">

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">

                                {doctor.first_name
                                  ?.charAt(0)
                                  .toUpperCase()}

                                {doctor.last_name
                                  ?.charAt(0)
                                  .toUpperCase()}

                              </div>

                              <div>

                                <p className="text-sm font-semibold text-slate-900">
                                  Dr.{" "}
                                  {doctor.first_name}{" "}
                                  {doctor.last_name}
                                </p>

                                <p className="text-xs text-slate-500">
                                  Doctor ID #{doctor.id}
                                </p>

                              </div>

                            </div>

                          </td>


                          {/* Specialization */}
                          <td className="px-6 py-5">

                            <p className="text-sm text-slate-700">
                              {doctor.specialization}
                            </p>

                          </td>


                          {/* Qualification */}
                          <td className="px-6 py-5">

                            <p className="max-w-[220px] text-sm text-slate-700">
                              {doctor.qualification}
                            </p>

                          </td>


                          {/* Experience */}
                          <td className="px-6 py-5">

                            <p className="text-sm text-slate-700">
                              {doctor.experience_years}{" "}
                              {doctor.experience_years === 1
                                ? "year"
                                : "years"}
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


                          {/* Action */}
                          <td className="px-6 py-5 text-right">
                            
                            <button
                                type="button"
                                onClick={() => handleEditDoctor(doctor)}
                                disabled={isUpdating}
                                className="mr-3 text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50"
                                >
                                Edit
                            </button>

                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleStatusChange(doctor)}
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


      {/* Add Doctor Modal */}
      {showAddDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">

          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Add Doctor
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Create a new doctor account and profile.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddDoctor(false)}
                className="rounded-lg px-3 py-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>

            </div>


            {/* Form */}
            <form
              onSubmit={handleAddDoctor}
              className="max-h-[75vh] overflow-y-auto p-6"
            >

              <div className="grid gap-5 sm:grid-cols-2">

                {/* Email */}
                <div className="sm:col-span-2">

                  <label className="text-sm font-medium text-slate-700">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={doctorForm.email}
                    onChange={handleDoctorFormChange}
                    required
                    placeholder="doctor@example.com"
                    className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>


                {/* Password */}
                <div className="sm:col-span-2">

                  <label className="text-sm font-medium text-slate-700">
                    Temporary Password
                  </label>

                  <input
                    type="password"
                    name="password"
                    value={doctorForm.password}
                    onChange={handleDoctorFormChange}
                    required
                    minLength={8}
                    placeholder="Minimum 8 characters"
                    className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>


                {/* First Name */}
                <div>

                  <label className="text-sm font-medium text-slate-700">
                    First Name
                  </label>

                  <input
                    type="text"
                    name="first_name"
                    value={doctorForm.first_name}
                    onChange={handleDoctorFormChange}
                    required
                    className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                    value={doctorForm.last_name}
                    onChange={handleDoctorFormChange}
                    required
                    className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>


                {/* Specialization */}
                <div>

                  <label className="text-sm font-medium text-slate-700">
                    Specialization
                  </label>

                  <input
                    type="text"
                    name="specialization"
                    value={doctorForm.specialization}
                    onChange={handleDoctorFormChange}
                    required
                    placeholder="e.g. Cardiology"
                    className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>


                {/* Qualification */}
                <div>

                  <label className="text-sm font-medium text-slate-700">
                    Qualification
                  </label>

                  <input
                    type="text"
                    name="qualification"
                    value={doctorForm.qualification}
                    onChange={handleDoctorFormChange}
                    required
                    placeholder="e.g. MBBS, MD"
                    className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>


                {/* Experience */}
                <div>

                  <label className="text-sm font-medium text-slate-700">
                    Experience (Years)
                  </label>

                  <input
                    type="number"
                    name="experience_years"
                    value={doctorForm.experience_years}
                    onChange={handleDoctorFormChange}
                    required
                    min="0"
                    className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>


                {/* Slot Duration */}
                <div>

                  <label className="text-sm font-medium text-slate-700">
                    Slot Duration (Minutes)
                  </label>

                  <input
                    type="number"
                    name="slot_duration_minutes"
                    value={doctorForm.slot_duration_minutes}
                    onChange={handleDoctorFormChange}
                    required
                    min="1"
                    placeholder="30"
                    className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>

              </div>


              {/* Modal Actions */}
              <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-5">

                <button
                  type="button"
                  onClick={() => setShowAddDoctor(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={addingDoctor}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {addingDoctor
                    ? "Creating..."
                    : "Create Doctor"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

      {/* Edit Doctor Modal */}
      {showEditDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">

          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Edit Doctor
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Update doctor profile information.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowEditDoctor(false)}
                className="text-xl text-slate-400 hover:text-slate-600"
              >
                ×
              </button>

            </div>


            {/* Form */}
            <form
              onSubmit={handleUpdateDoctor}
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
                    value={doctorForm.first_name}
                    onChange={handleDoctorFormChange}
                    name="first_name"
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
                    value={doctorForm.last_name}
                    onChange={handleDoctorFormChange}
                    name="last_name"
                    required
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>


                {/* Specialization */}
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Specialization
                  </label>

                  <input
                    type="text"
                    value={doctorForm.specialization}
                    onChange={handleDoctorFormChange}
                    name="specialization"
                    required
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>


                {/* Qualification */}
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Qualification
                  </label>

                  <input
                    type="text"
                    value={doctorForm.qualification}
                    onChange={handleDoctorFormChange}
                    name="qualification"
                    required
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>


                {/* Experience */}
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Experience (Years)
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={doctorForm.experience_years}
                    onChange={handleDoctorFormChange}
                    name="experience_years"
                    required
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>


                {/* Slot Duration */}
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Slot Duration (Minutes)
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={doctorForm.slot_duration_minutes}
                    onChange={handleDoctorFormChange}
                    name="slot_duration_minutes"
                    required
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

              </div>


              {/* Actions */}
              <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">

                <button
                  type="button"
                  onClick={() => setShowEditDoctor(false)}
                  className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={updatingDoctor}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {updatingDoctor ? "Saving..." : "Save Changes"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  )
}

export default AdminDoctors
