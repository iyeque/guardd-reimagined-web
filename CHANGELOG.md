# Changelog

## [Unreleased] - 2025-09-23

### Added
- Advanced TargetCursor component with GSAP animations, parallax support, and target detection.
- Refined TargetCursor CSS with updated styles matching the desired design (using .target-cursor-wrapper, .target-cursor-dot, .target-cursor-corner classes).
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

