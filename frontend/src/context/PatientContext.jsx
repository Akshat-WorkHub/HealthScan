import { createContext, useContext } from "react"

export const PatientContext = createContext(null)

export function usePatientPortal() {
  const context = useContext(PatientContext)
  if (!context) {
    throw new Error("usePatientPortal must be used inside PatientLayout")
  }
  return context
}
