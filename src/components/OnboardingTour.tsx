import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { startOnboardingTour } from '@/lib/onboarding'

export const OnboardingTour = () => {
  const navigate = useNavigate()
  useEffect(() => {
    startOnboardingTour(navigate)
  }, [navigate])

  return null
}
