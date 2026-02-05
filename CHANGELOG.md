# Changelog

## [2026-02-05]

### Fixed
- **SunnySky Rendering Error**: Resolved ESLint error regarding ref usage in `useEffect` cleanup.
- **Linting & Type Errors**:
  - Fixed `@typescript-eslint/no-explicit-any` errors in `server/index.ts` and `src/components/ElectricBorder.tsx`.
  - Fixed `no-empty` error in `src/components/ElectricBorder.tsx`.
  - Fixed `prefer-const` error in `src/components/Galaxy.tsx`.
  - Fixed `react-hooks/exhaustive-deps` warnings in `src/components/ElectricBorder.tsx`.
  - Fixed `react-refresh/only-export-components` warnings by restructuring exports in `button.tsx`, `sonner.tsx`, and `ThemeContext.tsx`, and introducing new files for shared components/contexts.
  - Resolved all TypeScript import errors caused by restructuring.

### Improved
- **SunnySky Visuals**: Significantly enhanced the `SunnySky.tsx` component.
  - Implemented hyper-realistic sky with advanced GLSL shaders, including domain warping, multiple FBM noise layers, and improved cloud coloring.
  - Enabled antialiasing for smoother rendering.
  - Increased cloud movement speed for a more noticeable and dynamic effect.
  - Increased device pixel ratio (DPR) cap to 2.5 for better resolution on high-DPI displays.
- **UI/UX - Theme Legibility**: Comprehensive updates to ensure maximum text legibility in both light and dark modes.
  - Refactored theme handling in `src/context/ThemeContext.tsx` to correctly apply light/dark classes to `document.documentElement`.
  - Adjusted CSS variables in `src/index.css` for proper light and dark mode color definitions (dark text on light background, white text on dark background).
  - Updated text elements across `PredictiveHero.tsx`, `Services.tsx`, `About.tsx`, `Contact.tsx`, `Navigation.tsx`, and `Stats.tsx` to use theme-adaptive `text-foreground` and `text-muted-foreground` classes.
  - Added `bg-background` to `src/components/Layout.tsx` to ensure a solid, theme-adaptive background behind the text for optimal contrast.

## [Unreleased]

### Added
- **Modernized Hero Section**: Updated the hero section with a "Cyber/Neon" aesthetic.
  - Implemented a "Cyber Neon" color palette for category buttons.
  - Standardized button styles with glassmorphism, neon borders, and glow effects.
  - Enhanced "Digital Wellness" button with a distinct Green/Emerald gradient.
  - Updated search input with semi-transparent dark background and improved focus states.

### Improved
- **Galaxy Background Performance**: Significant optimization of the `Galaxy.tsx` component.
  - Reduced shader complexity by lowering `NUM_LAYER` from 4.0 to 2.0.
  - Capped `devicePixelRatio` to 1.0 to prevent rendering overhead on high-DPI screens.
  - Reduced star density (1.7 -> 1.2) for better frame rates.
  - Removed manual JS frame throttling to allow native `requestAnimationFrame` optimization.
  - Result: Much smoother animation and reduced GPU load.

## [2026-01-06]

### Added
- **Global Layout**: Implemented a `Layout` component to ensure the Galaxy background and Navigation persist across all pages.
- **Screen Time Management Page**: Launched full content for `/screen-time-management` with strategies, stats, and tools.
- **Family Digital Agreements**: Launched interactive agreement builder (`/family-digital-agreements`) allowing families to customize and "print" their digital rules.
- **Educational Blog**: Launched blog listing page (`/educational-blog`) with categorized article cards and hover effects.
- **Educational Games**: Launched game hub (`/educational-games`) with two interactive activities:
  - **Digital Wellness Pop**: A reflex game about balancing wellness vs. distractions.
  - **Cyber Defense Quiz**: A 5-question quiz testing knowledge on passwords, privacy, and online safety.
- **Video Resources**: Launched video hub (`/video-resources`) embedding the official YouTube channel (`UCCRU...`) uploads playlist for dynamic content access.
- **Community Support**: Launched community hub (`/community-support`) featuring:
  - **Discussion Forums**: Threaded discussions on parenting, tech reviews, and safety.
  - **Events Calendar**: Listings for webinars and Q&A sessions.
  - **Mentorship Program**: Call-to-action for community volunteers.

### Fixed
- **Improved Legibility**: Updated font colors across all main components (`PredictiveHero`, `Navigation`, `Stats`, `Services`, `About`, `Contact`) to `text-white`, `text-gray-200`, and brighter accent colors (`green-400`, `blue-400`, `purple-400`) to ensure readability against the dark starry background.
- **Predictive Search**: Enhanced the search input and modal card readability with dark semi-transparent backgrounds and light text.
- **Page Consistency**: Updated `Workshop`, `EducationalGames`, and other sub-pages to match the dark galaxy theme with transparent backgrounds and white text.
- **Navigation**: Fixed navigation links to work correctly from sub-pages (absolute paths).

### Upcoming Work
- **Expansion**: Further populate content across all modules based on user feedback.
- **Backend Integration**: Prepare for future backend connections (currently using mock data).

## [2025-09-30]

### Improved
- Tuned Galaxy background for smoother, less glitchy animation: reduced density, speed, and increased glow for a more subtle, high-performance effect.
- Set Galaxy background to solid black for better contrast and visual clarity.
- Optimized Galaxy layering and z-index for consistent background placement.
- Updated ElectricBorder card props for less chaos, slower speed, and softer border radius for a more polished, less jittery lightning effect.
- Enhanced card backgrounds and shadows for better readability and contrast over the galaxy background.
- Improved card hover and transition effects for a more interactive, modern feel.

## [2025-09-23]

### Added
- Enhanced Galaxy background component with WebGL rendering and optimized performance.
- Stylelint configuration to ignore Tailwind-specific at-rules.
- VSCode settings to disable built-in CSS validation for improved development experience.

## [2025-01-15]

### Major Project Optimization & Cleanup
- **Removed 30+ unused UI components** (accordion, alert, avatar, badge, calendar, checkbox, dialog, form, etc.)
- **Eliminated duplicate files** (duplicate use-toast.ts, unused ParallaxComponent.tsx, unused App.css)
- **Removed unused dependencies** (react-scroll-parallax, react-force-graph, d3-force-boundary, cmdk, embla-carousel, input-otp, vaul, recharts, react-day-picker, react-resizable-panels)
- **Cleaned up commented code** and unused imports throughout the project
- **Simplified main.tsx** by removing unused ParallaxProvider wrapper
- **Removed console.error** from NotFound.tsx for production cleanliness
- **Bundle size reduction** of ~500KB+ through file cleanup and dependency removal
- **Removed TargetCursor component** completely (TargetCursor.tsx, TargetCursor.css, GSAP dependency, and all related code)

### Performance Optimizations
- **Galaxy Background Component**: Major performance improvements to resolve glitchy behavior
  - Reduced device pixel ratio from 2.0 to 1.5 for better performance
  - Implemented 60fps frame rate throttling with frame interval limiting
  - Added mouse interaction throttling (16ms intervals) to reduce CPU usage
  - Optimized WebGL renderer settings with `antialias: false` and `powerPreference: 'high-performance'`
  - Reduced animation parameters: density (2.5→1.8), glow intensity (0.3→0.25), twinkle intensity (0.7→0.5)
  - Batched uniform updates to reduce GPU calls and improve rendering efficiency

### Fixed
- **Galaxy Background**: Resolved stuttering and glitchy star animations
- **Performance**: Eliminated frame drops and inconsistent animation speeds
- **React Hooks**: Fixed invalid hook call error by moving useCallback hooks to component level

### Changed
- **Optimized Parameters**: Reduced visual intensity while maintaining visual appeal
- **Animation Smoothness**: Improved from inconsistent frame rates to stable 60fps
- **Resource Usage**: Significantly reduced CPU and GPU load across all devices
- **Animation Speed**: Increased star movement speed (0.2→0.8), overall speed (0.3→1.2), and rotation speed (0.03→0.15)
- **Loading Experience**: Added loading indicator with "Loading Galaxy..." message
- **Frame Throttling**: Reduced throttling aggressiveness (0.8x instead of 1.0x) for smoother animations
- **Simplified Interaction**: Disabled mouse interaction and mouse repulsion for cleaner, static background
- **Reduced Complexity**: Lowered star density (1.8→1.2) and star speed (0.8→0.5) for subtle background effect
- **Removed Custom Cursor**: Eliminated TargetCursor component and all related functionality for simpler user experience