import { useEffect, useState } from "react"
import DoctorLayout from "../DoctorLayout"
import {
  getMyDoctorProfile,
  updateMyDoctorProfile,
} from "../../../services/api"


function DoctorProfile() {

  const token = localStorage.getItem("access_token")

  const [profile, setProfile] = useState(null)

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    specialization: "",
    qualification: "",
    experience_years: "",
    slot_duration_minutes: "",
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")


  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true)
        setError("")

        const data = await getMyDoctorProfile(token)

        setProfile(data)

        setFormData({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          specialization: data.specialization || "",
          qualification: data.qualification || "",
          experience_years: data.experience_years ?? "",
          slot_duration_minutes:
            data.slot_duration_minutes ?? "",
        })

      } catch (err) {
        setError(err.message || "Failed to load profile")
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      loadProfile()
    } else {
      setError("Authentication token not found")
      setLoading(false)
    }
  }, [token])


  function handleChange(event) {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }


  async function handleSubmit(event) {
    event.preventDefault()

    try {
      setSaving(true)
      setError("")
      setSuccess("")

      const updatedProfile = await updateMyDoctorProfile(
        token,
        {
          ...formData,
          experience_years:
            Number(formData.experience_years),
          slot_duration_minutes:
            Number(formData.slot_duration_minutes),
        }
      )

      setProfile(updatedProfile)

      setFormData({
        first_name: updatedProfile.first_name || "",
        last_name: updatedProfile.last_name || "",
        specialization:
          updatedProfile.specialization || "",
        qualification:
          updatedProfile.qualification || "",
        experience_years:
          updatedProfile.experience_years ?? "",
        slot_duration_minutes:
          updatedProfile.slot_duration_minutes ?? "",
      })

      setSuccess("Profile updated successfully.")

    } catch (err) {
      setError(err.message || "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }


  if (loading) {
    return (
      <DoctorLayout>
        <section className="p-6 lg:p-8">
          <p className="text-sm text-slate-500">
            Loading profile...
          </p>
        </section>
      </DoctorLayout>
    )
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
          Doctor Profile
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          View and manage your professional profile information.
        </p>

      </section>


      {/* ======================================================
          PAGE CONTENT
      ====================================================== */}

      <section className="p-6 lg:p-8">

        <div className="mx-auto max-w-4xl rounded-xl border border-slate-200 bg-white shadow-sm">

          {/* Card Header */}

          <div className="border-b border-slate-200 px-6 py-5">

            <h3 className="text-base font-semibold text-slate-900">
              Profile Information
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Update your professional information below.
            </p>

          </div>


          {/* Messages */}

          {error && (
            <div className="mx-6 mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="mx-6 mt-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
              {success}
            </div>
          )}


          {/* Form */}

          <form
            onSubmit={handleSubmit}
            className="p-6"
          >

            <div className="grid gap-5 md:grid-cols-2">

              {/* First Name */}

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  First Name
                </label>

                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>


              {/* Last Name */}

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Last Name
                </label>

                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>


              {/* Specialization */}

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Specialization
                </label>

                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>


              {/* Qualification */}

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Qualification
                </label>

                <input
                  type="text"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>


              {/* Experience */}

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Experience (Years)
                </label>

                <input
                  type="number"
                  name="experience_years"
                  value={formData.experience_years}
                  onChange={handleChange}
                  min="0"
                  required
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>


              {/* Slot Duration */}

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Slot Duration (Minutes)
                </label>

                <input
                  type="number"
                  name="slot_duration_minutes"
                  value={formData.slot_duration_minutes}
                  onChange={handleChange}
                  min="1"
                  required
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

            </div>


            {/* Save Button */}

            <div className="mt-6 flex justify-end">

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>

            </div>

          </form>

        </div>

      </section>

    </DoctorLayout>
  )
}


export default DoctorProfile