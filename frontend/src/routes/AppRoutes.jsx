import { Navigate, Routes, Route } from "react-router-dom"

import Home from "../pages/auth/Home"

import PatientDashboard from "../pages/patient/dashboard/PatientDashboard"
import PatientRegister from "../pages/patient/register/PatientRegister"
import PatientLogin from "../pages/patient/login/PatientLogin"

import DoctorDashboard from "../pages/doctor/dashboard/DoctorDashboard"
import DoctorLogin from "../pages/doctor/login/DoctorLogin"
import DoctorAppointments from "../pages/doctor/appointments/DoctorAppointments"
import DoctorLeave from "../pages/doctor/leave/DoctorLeave"
import DoctorSettings from "../pages/doctor/settings/DoctorSettings"
import DoctorProfile from "../pages/doctor/profile/DoctorProfile"

import AdminAppointments from "../pages/admin/appointments/AdminAppointments"
import AdminDashboard from "../pages/admin/dashboard/AdminDashboard"
import AdminPatients from "../pages/admin/patients/AdminPatients"
import AdminDoctorLeave from "../pages/admin/doctor-leave/AdminDoctorLeave"
import AdminDoctors from "../pages/admin/doctors/AdminDoctors"
import AdminLogin from "../pages/admin/login/AdminLogin"

import AdminSettings from "../pages/admin/settings/AdminSettings"

import ProtectedRoute from "./ProtectedRoute"
import RoleRoute from "./RoleRoute"


function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />

      <Route path="/patient/login" element={<PatientLogin />} />
      <Route path="/patient/register" element={<PatientRegister />} />
      <Route path="/doctor/login" element={<DoctorLogin />} />
      <Route path="/admin/login" element={<AdminLogin />} />


      {/* Patient */}
      <Route
        path="/patient/dashboard"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["PATIENT"]}>
              <PatientDashboard />
            </RoleRoute>
          </ProtectedRoute>
        }
      />


      {/* Doctor */}
      <Route
        path="/doctor/dashboard"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["DOCTOR"]}>
              <DoctorDashboard />
            </RoleRoute>
          </ProtectedRoute>
        }
      />


      {/* Admin */}
      <Route
        path="/admin"
        element={<Navigate to="/admin/dashboard" replace />}
      />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/doctors"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["ADMIN"]}>
              <AdminDoctors />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/patients"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["ADMIN"]}>
              <AdminPatients />
            </RoleRoute>
          </ProtectedRoute>
        }
      />


      <Route
        path="/admin/appointments"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["ADMIN"]}>
              <AdminAppointments />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/doctor-leave"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["ADMIN"]}>
              <AdminDoctorLeave />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["ADMIN"]}>
              <AdminSettings />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* Doctor Appointments */}
      <Route
        path="/doctor/appointments"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["DOCTOR"]}>
              <DoctorAppointments />
            </RoleRoute>
          </ProtectedRoute>
        }
      />


      {/* Doctor Leave */}
      <Route
        path="/doctor/leave"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["DOCTOR"]}>
              <DoctorLeave />
            </RoleRoute>
          </ProtectedRoute>
        }
      />


      {/* Doctor Settings */}
      <Route
        path="/doctor/settings"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["DOCTOR"]}>
              <DoctorSettings />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/doctor/profile"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["DOCTOR"]}>
              <DoctorProfile />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

    </Routes>

  )
}

export default AppRoutes
