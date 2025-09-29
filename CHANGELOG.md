# Changelog

## [Unreleased] - 2025-01-15

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

## [Unreleased] - 2025-09-23

### Added
- Enhanced Galaxy background component with WebGL rendering and optimized performance.
- Stylelint configuration to ignore Tailwind-specific at-rules.
- VSCode settings to disable built-in CSS validation for improved development experience.


## [Unreleased]
### Added
- Integrated a Galaxy WebGL background component with interactive, glowing stars and dark background, inspired by reactbits.dev.
- Exposed props for density, glow, hue, twinkle, rotation, repulsion, and animation speed for full customization.
- Made all main page and UI components transparent to allow the galaxy background to show through.

### Fixed
- Fixed issue where the site background was white, hiding the galaxy effect.
- Fixed fragment shader to always render a black background for a true dark galaxy look.

### Changed
- Updated theme to dark by default in `index.css`.
- Optimized Galaxy component for performance and responsiveness.

---

