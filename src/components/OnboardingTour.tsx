import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { startOnboardingTourAfterConsent } from '@/lib/onboarding'

export const OnboardingTour = () => {
  const navigate = useNavigate()
  useEffect(() => {
    // Waits for the cookie banner to be answered first, so the tour overlay
    // never covers the banner and traps the visitor inside the tour.
    return startOnboardingTourAfterConsent(navigate)
  }, [navigate])

  return null
}
