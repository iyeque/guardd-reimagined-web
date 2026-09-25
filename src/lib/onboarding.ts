import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

const STORAGE_KEY = 'dg_onboarding_seen'
const PENDING_STEP_KEY = 'dg_onboarding_pending_step'

const tourSteps = [
  {
    id: 'hero',
    element: () => document.querySelector('[data-tour="hero"]') ?? undefined,
    popover: {
      title: 'Welcome to Digital Guardian',
      description:
        'Search any digital safety topic above, or explore our family wellness tools below.',
      side: 'bottom',
      showButtons: ['next'] as const,
    },
  },
  {
    id: 'services',
    element: () => document.getElementById('resources') ?? undefined,
    popover: {
      title: 'Your Family Toolkit',
      description:
        'Six resources: screen time tools, family agreements, expert blog, games, video guides, and community support.',
      side: 'bottom',
      showButtons: ['next'] as const,
    },
  },
  {
    id: 'profile',
    element: () => document.querySelector('[data-tour="profile-switcher"]') ?? undefined,
    popover: {
      title: 'Your Family Profiles',
      description:
        'Create separate profiles for each family member and switch between them. You can also export and transfer profiles to a new device using a QR code.',
      side: 'bottom',
      showButtons: ['next'] as const,
    },
  },
  {
    id: 'family-mode',
    element: () => document.querySelector('[data-tour="family-mode-switcher"]') ?? undefined,
    popover: {
      title: 'Switch Family Modes',
      description:
        'Toggle between Parent, Kids, and Together modes to see content tailored to each family member\'s age and role.',
      side: 'right',
      showButtons: ['next'] as const,
    },
  },
  {
    id: 'wellness-companion',
    element: () => document.querySelector('[data-tour="wellness-companion"]') ?? undefined,
    popover: {
      title: 'AI Wellness Companion',
      description:
        'Your personal AI guide for digital wellness tips, breathing exercises, eye breaks, and quick answers — always one click away.',
      side: 'left',
      showButtons: ['next'] as const,
    },
  },
  {
    id: 'workshops-cta',
    element: () => document.querySelector('[data-tour="workshop-cta"]') ?? undefined,
    popover: {
      title: 'Start Learning Together',
      description:
        'Jump into interactive family workshops — quizzes, activities, and collaborative exercises for all ages.',
      side: 'bottom',
      showButtons: ['next'] as const,
      onNext: () => {
        localStorage.setItem(PENDING_STEP_KEY, '6')
        window.location.href = '/workshops'
      },
    },
  },
  {
    id: 'workshops-page',
    element: () => document.querySelector('[data-tour="workshops-heading"]') ?? undefined,
    popover: {
      title: 'Family Workshops',
      description:
        'Learn together through interactive activities, quizzes, and collaborative exercises designed for the whole family. Browse the full library here.',
      side: 'bottom',
      showButtons: ['next', 'skip'] as const,
      onDestroyed: () => {
        localStorage.setItem(STORAGE_KEY, 'true')
      },
    },
  },
]

let onboardingDriver: ReturnType<typeof driver> | null = null

export function startOnboardingTour() {
  if (typeof window === 'undefined') return
  if (localStorage.getItem(STORAGE_KEY) === 'true') return
  const d = (driver as any)({
    steps: tourSteps,
    showProgress: true,
    animate: true,
    overlayOpacity: 0.5,
    overlayColor: '#0f172a',
    disableActiveInteraction: true,
    allowKeyboardNavigation: true,
    skipMissingElement: true,
  })
  onboardingDriver = d
  d.drive()
}

export function resumeOnboardingTour(stepIndex: number) {
  if (typeof window === 'undefined') return
  const d = onboardingDriver ?? ((driver as any)({
    steps: tourSteps,
    showProgress: true,
    animate: true,
    overlayOpacity: 0.5,
    overlayColor: '#0f172a',
    disableActiveInteraction: true,
    allowKeyboardNavigation: true,
    skipMissingElement: true,
  }))
  onboardingDriver = d
  d.drive(stepIndex)
}
