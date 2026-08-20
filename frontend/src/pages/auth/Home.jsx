import { useEffect, useState } from "react"
import { checkBackendHealth } from "../../services/api"

function Home() {
  const [backendStatus, setBackendStatus] = useState("Checking...")

  useEffect(() => {
    checkBackendHealth()
      .then((data) => {
        setBackendStatus(data.status)
      })
      .catch(() => {
        setBackendStatus("Backend unavailable")
      })
  }, [])

  return (
    <div>
      <h1>SmartHealth AI</h1>
      <p>Health Appointment Manager</p>
      <p>Backend: {backendStatus}</p>
    </div>
  )
}

export default Home