import { driver, type DriveStep } from 'driver.js'
import 'driver.js/dist/driver.css'
import type { NavigateFunction } from 'react-router-dom'

export const STORAGE_KEY = 'dg_onboarding_seen'
const PENDING_STEP_KEY = 'dg_onboarding_pending_step'

function markTourSeen() {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, 'true')
}

export function resetOnboardingSeen() {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(PENDING_STEP_KEY)
  } catch {
    // private browsing / disabled storage — swallow, tour can't be reset but nav flow continues
  }
}

export function restartOnboardingTour(navigate?: NavigateFunction) {
  resetOnboardingSeen()
  startOnboardingTour(navigate)
}

const DRIVER_OPTIONS = {
  showProgress: true,
  animate: true,
  overlayOpacity: 0.5,
  overlayColor: 'var(--background)',
  disableActiveInteraction: true,
  allowKeyboardNavigation: true,
  skipMissingElement: true,
  onDestroyed: markTourSeen,
}

function createTourSteps(navigate?: NavigateFunction): DriveStep[] {
  const goToWorkshops = () => {
    localStorage.setItem(PENDING_STEP_KEY, '6')
    if (navigate) {
      navigate('/workshops')
    } else {
      window.location.href = '/workshops'
    }
  }

  return [
    {
      id: 'hero',
      element: () => document.querySelector('[data-tour="hero"]') as Element,
      popover: {
        title: 'Welcome to Digital Guardian',
        description:
          'Search any digital safety topic above, or explore our family wellness tools below.',
        side: 'bottom' as const,
        showButtons: ['next'] as const,
      },
    },
    {
      id: 'services',
      element: () => document.getElementById('resources') as Element,
      popover: {
        title: 'Your Family Toolkit',
        description:
          'Six resources: screen time tools, family agreements, expert blog, games, video guides, and community support.',
        side: 'bottom' as const,
        showButtons: ['next'] as const,
      },
    },
    {
      id: 'profile',
      element: () => document.querySelector('[data-tour="profile-switcher"]') as Element,
      popover: {
        title: 'Your Family Profiles',
        description:
          'Create separate profiles for each family member and switch between them. You can also export and transfer profiles to a new device using a QR code.',
        side: 'bottom' as const,
        showButtons: ['next'] as const,
      },
    },
    {
      id: 'family-mode',
      element: () => document.querySelector('[data-tour="family-mode-switcher"]') as Element,
      popover: {
        title: 'Switch Family Modes',
        description:
          'Toggle between Parent, Kids, and Together modes to see content tailored to each family member\'s age and role.',
        side: 'right' as const,
        showButtons: ['next'] as const,
      },
    },
    {
      id: 'wellness-companion',
      element: () => document.querySelector('[data-tour="wellness-companion"]') as Element,
      popover: {
        title: 'AI Wellness Companion',
        description:
          'Your personal AI guide for digital wellness tips, breathing exercises, eye breaks, and quick answers — always one click away.',
        side: 'left' as const,
        showButtons: ['next'] as const,
      },
    },
    {
      id: 'workshops-cta',
      element: () => document.querySelector('[data-tour="workshop-cta"]') as Element,
      popover: {
        title: 'Start Learning Together',
        description:
          'Jump into interactive family workshops — quizzes, activities, and collaborative exercises for all ages.',
        side: 'bottom' as const,
        showButtons: ['next'] as const,
        onNext: goToWorkshops,
      },
    },
    {
      id: 'workshops-page',
      element: () => document.querySelector('[data-tour="workshops-heading"]') as Element,
      popover: {
        title: 'Family Workshops',
        description:
          'Learn together through interactive activities, quizzes, and collaborative exercises designed for the whole family. Browse the full library here.',
        side: 'bottom' as const,
        showButtons: ['next', 'skip'] as const,
      },
    },
  ] as unknown as DriveStep[]
}

let onboardingDriver: ReturnType<typeof driver> | null = null

export function startOnboardingTour(navigate?: NavigateFunction) {
  if (typeof window === 'undefined') return
  if (localStorage.getItem(STORAGE_KEY) === 'true') return
  const d = driver({
    ...DRIVER_OPTIONS,
    steps: createTourSteps(navigate),
  })
  onboardingDriver = d
  d.drive()
}

export function resumeOnboardingTour(stepIndex: number) {
  if (typeof window === 'undefined') return
  const d = onboardingDriver ?? driver({
    ...DRIVER_OPTIONS,
    steps: createTourSteps(),
  })
  onboardingDriver = d
  d.drive(stepIndex)
}
