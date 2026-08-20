import { Routes, Route } from "react-router-dom"

import Home from "../pages/auth/Home"
import PatientLogin from "../pages/auth/PatientLogin"
import PatientRegister from "../pages/auth/PatientRegister"
import DoctorLogin from "../pages/auth/DoctorLogin"
import AdminLogin from "../pages/auth/AdminLogin"

import PatientDashboard from "../pages/patient/PatientDashboard"
import DoctorDashboard from "../pages/doctor/DoctorDashboard"
import AdminDashboard from "../pages/admin/AdminDashboard"

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/patient/login" element={<PatientLogin />} />
      <Route path="/patient/register" element={<PatientRegister />} />
      <Route path="/patient/dashboard" element={<PatientDashboard />} />

      <Route path="/doctor/login" element={<DoctorLogin />} />
      <Route path="/doctor/dashboard" element={<DoctorDashboard />} />

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
    </Routes>
  )
}

export default AppRoutes