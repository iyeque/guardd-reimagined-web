import { driver, type DriveStep } from 'driver.js'
import 'driver.js/dist/driver.css'
import type { NavigateFunction } from 'react-router-dom'
import { COOKIE_CONSENT_KEY } from '@/lib/profiles'

export const STORAGE_KEY = 'dg_onboarding_seen'
const PENDING_STEP_KEY = 'dg_onboarding_pending_step'

/**
 * Dispatched by CookieConsentBanner once the visitor accepts or rejects.
 * The first-visit tour waits for this so the two overlays never fight:
 * the tour used to start on mount and its overlay covered the banner,
 * leaving visitors unable to consent until they'd sat through the tour.
 */
export const COOKIE_CONSENT_RESOLVED_EVENT = 'dg:cookie-consent-resolved'

export function isCookieConsentResolved(): boolean {
  if (typeof window === 'undefined') return false
  const stored = localStorage.getItem(COOKIE_CONSENT_KEY)
  return stored === 'accept' || stored === 'reject'
}

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
  // Gated like the auto-start: clicking "replay tour" before the cookie
  // choice must not drop the tour overlay over the banner.
  runWhenConsentResolved(() => startOnboardingTour(navigate))
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
  popoverClass: 'driver-popover',
  highlighterClass: 'driver-highlight',
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
        showButtons: ['next', 'close'] as const,
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
      id: 'workshops-heading',
      element: () => document.querySelector('[data-tour="workshops-heading"]') as Element,
      popover: {
        title: 'Family Workshops 📚',
        description:
          'Learn together through interactive activities, quizzes, and collaborative exercises designed for the whole family. Browse the full library here.',
        side: 'bottom' as const,
        showButtons: ['next', 'close'] as const,
      },
    },
    {
      id: 'workshops-course-cta',
      element: () => document.querySelector('[data-tour="workshops-course-cta"]') as Element,
      popover: {
        title: 'Start with the Full Course 🎓',
        description:
          'Our flagship 1-hour course takes you from awareness to digital mastery with guided lessons, hands-on action pauses, and two assessments. Or browse individual workshop topics below.',
        side: 'bottom' as const,
        showButtons: ['next'] as const,
      },
    },
    {
      id: 'workshops-search',
      element: () => document.querySelector('[data-tour="workshops-search"]') as Element,
      popover: {
        title: 'Find What You Need 🔍',
        description:
          'Search workshops by topic or filter by age group and duration to find the perfect activity for your family.',
        side: 'bottom' as const,
        showButtons: ['next'] as const,
        onNext: () => {},
      },
    },
    {
      id: 'transfer-tour',
      element: () => null, // no element — jumps to transfer page
      popover: {
        title: 'Transfer Profiles 🔄',
        description:
          'Now let\'s look at how to move your profiles to another device. We\'ll cover export and import next.',
        side: 'center' as const,
        showButtons: ['next'] as const,
        onNext: () => {
          window.location.href = '/transfer';
        },
      },
    },
    {
      id: 'transfer-tabs',
      element: () => document.querySelector('[data-tour="transfer-tabs"]') as Element,
      popover: {
        title: 'Export or Import 🔄',
        description:
          'Use Export to create a transfer code for your profiles. Use Import to bring profiles from another device using a code or QR scan.',
        side: 'bottom' as const,
        showButtons: ['next'] as const,
      },
    },
    {
      id: 'transfer-code-area',
      element: () => document.querySelector('[data-tour="transfer-code-area"]') as Element,
      popover: {
        title: 'Your Transfer Code 📋',
        description:
          'This code contains all your profile data. Scan the QR with another device, or copy and paste it. The code is not encrypted — only share with people you trust.',
        side: 'bottom' as const,
        showButtons: ['next', 'close'] as const,
      },
    },
    {
      id: 'transfer-import-mode',
      element: () => document.querySelector('[data-tour="transfer-import-mode"]') as Element,
      popover: {
        title: 'How to Import 🛡️',
        description:
          'Replace mode clears your existing data and loads the imported profiles. Merge adds new profiles while keeping your current ones. Replace is recommended when moving to a new device.',
        side: 'bottom' as const,
        showButtons: ['next', 'close'] as const,
      },
    },
  ] as unknown as DriveStep[]
}

let onboardingDriver: ReturnType<typeof driver> | null = null

/**
 * Runs `start` once the cookie banner has been answered. Every tour entry
 * point goes through here so the tour overlay never covers the banner and
 * traps the visitor before they can consent. Accepting and rejecting both
 * resolve the choice, so either answer releases the tour.
 *
 * Only one listener is ever attached: if the visitor clicks "replay tour"
 * again while waiting, the latest intent replaces the queued one instead of
 * stacking listeners that would each start a tour.
 */
/**
 * Run `start` once cookie consent is resolved, waiting if it is not yet.
 *
 * Exported so every tour entry point shares one gate — the main onboarding tour,
 * its replay buttons, and the extension tour all go through here. A tour that
 * starts before consent is answered is the bug this exists to prevent.
 */
export function runWhenConsentResolved(start: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  if (isCookieConsentResolved()) {
    start()
    return () => {}
  }

  queuedStart = start

  if (consentListener) return () => {}

  const detach = () => {
    window.removeEventListener(COOKIE_CONSENT_RESOLVED_EVENT, onResolved)
    consentListener = null
  }
  const onResolved = () => {
    detach()
    const run = queuedStart
    queuedStart = null
    run?.()
  }

  consentListener = onResolved
  window.addEventListener(COOKIE_CONSENT_RESOLVED_EVENT, onResolved)
  return () => {}
}

let queuedStart: (() => void) | null = null
let consentListener: ((event: Event) => void) | null = null

/**
 * First-visit auto-start. Waits for the cookie banner so the two overlays
 * never compete. Returns a disposer (no-op once released).
 */
export function startOnboardingTourAfterConsent(
  navigate?: NavigateFunction,
): () => void {
  return runWhenConsentResolved(() => startOnboardingTour(navigate))
}

/** Explicit "replay tour" clicks from the nav — also waits for consent. */
export function resumeOnboardingTourAfterConsent(stepIndex: number): void {
  runWhenConsentResolved(() => resumeOnboardingTour(stepIndex))
}

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
