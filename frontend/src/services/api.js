const API_BASE_URL = "http://localhost:8000"


async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  })

  if (response.status === 204) {
    return null
  }

  const data = await response.json()

  if (!response.ok) {
    console.error("API Error:", data)

    throw new Error(
      typeof data.detail === "string"
        ? data.detail
        : JSON.stringify(data.detail)
    )
  }

  return data
}


// ============================================================
// SYSTEM
// ============================================================

export async function checkBackendHealth() {
  return request("/health")
}


// ============================================================
// AUTHENTICATION
// ============================================================

export async function registerUser(userData) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  })
}


export async function loginUser(credentials) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  })
}


export async function getCurrentUser(token) {
  return request("/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export async function getMyDoctorProfile(token) {
  return request("/doctors/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export async function updateMyDoctorProfile(
  token,
  doctorData
) {
  return request("/doctors/me", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(doctorData),
  })
}


// ============================================================
// ADMIN DASHBOARD
// ============================================================

export async function getAdminDashboardStats(token) {
  return request("/admin/dashboard/stats", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}


// ============================================================
// ADMIN — DOCTOR MANAGEMENT
// ============================================================

export async function getAdminDoctors(token) {
  return request("/doctors/admin", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}


export async function createAdminDoctor(token, doctorData) {
  return request("/doctors/admin", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(doctorData),
  })
}


export async function getAdminDoctor(token, doctorId) {
  return request(`/doctors/admin/${doctorId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export async function updateAdminDoctorStatus(
  token,
  doctorId,
  isActive
) {
  return request(
    `/doctors/admin/${doctorId}/status?is_active=${isActive}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
}

export async function updateAdminDoctor(
  token,
  doctorId,
  doctorData
) {
  return request(`/doctors/admin/${doctorId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(doctorData),
  })
}



export async function getAdminPatients(token) {
  return request("/patients/admin", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}


export async function getAdminPatient(token, patientId) {
  return request(`/patients/admin/${patientId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}


export async function updateAdminPatient(
  token,
  patientId,
  patientData
) {
  return request(`/patients/admin/${patientId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(patientData),
  })
}


export async function updateAdminPatientStatus(
  token,
  patientId,
  isActive
) {
  return request(
    `/patients/admin/${patientId}/status?is_active=${isActive}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
}

// ============================================================
// DOCTOR — LEAVE MANAGEMENT
// ============================================================

export async function getMyDoctorLeaves(token) {
  return request("/doctors/me/leaves", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}


export async function createDoctorLeave(
  token,
  leaveData
) {
  return request("/doctors/me/leaves", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(leaveData),
  })
}


export async function updateDoctorLeave(
  token,
  leaveId,
  leaveData
) {
  return request(`/doctors/me/leaves/${leaveId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(leaveData),
  })
}



// ============================================================
// ADMIN — APPOINTMENT MANAGEMENT
// ============================================================

export async function getAdminAppointments(token) {
  return request("/appointments/admin", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}


export async function getAdminAppointment(
  token,
  appointmentId
) {
  return request(`/appointments/admin/${appointmentId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}


export async function updateAdminAppointment(
  token,
  appointmentId,
  appointmentData
) {
  return request(`/appointments/admin/${appointmentId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(appointmentData),
  })
}


export async function updateAdminAppointmentStatus(
  token,
  appointmentId,
  appointmentStatus
) {
  return request(
    `/appointments/admin/${appointmentId}/status?appointment_status=${appointmentStatus}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
}


// ============================================================
// ADMIN — DOCTOR LEAVE MANAGEMENT
// ============================================================

export async function getAdminDoctorLeaves(token) {
  return request("/doctors/admin/leaves", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}


export async function getAdminDoctorLeave(
  token,
  leaveId
) {
  return request(`/doctors/admin/leaves/${leaveId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}


export async function createAdminDoctorLeave(
  token,
  leaveData
) {
  return request("/doctors/admin/leaves", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(leaveData),
  })
}


export async function updateAdminDoctorLeave(
  token,
  leaveId,
  leaveData
) {
  return request(`/doctors/admin/leaves/${leaveId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(leaveData),
  })
}


export async function deleteAdminDoctorLeave(
  token,
  leaveId
) {
  return request(`/doctors/admin/leaves/${leaveId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export async function updateAdminDoctorLeaveStatus(
  token,
  leaveId,
  leaveStatus
) {
  return request(
    `/doctors/admin/leaves/${leaveId}/status?leave_status=${leaveStatus}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
}

export async function changePassword(
  token,
  passwordData
) {
  return request("/auth/change-password", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(passwordData),
  })
}