# Changelog

## [Unreleased] - 2026-03-03

### Added
- **Visual Academy (Video Resources)**: Significant upgrade to the video learning hub.
  - Replaced "Coming Soon" placeholders with a structured library of Tutorials, Expert Talks, and Webinars.
  - Implemented **watchable YouTube embeds** within a high-fidelity modal system for all resource cards.
  - Curated content including iOS/Android parental control guides, psychology talks, and gaming safety webinars.
- **Community Pulse Automation**: Created a specialized TypeScript script (`scripts/update-community-data.ts`) to source and refresh 2026/27 safety events and simulate live family activity.
- **Elite Mentor Application**: Added a functional application system for digital wellness experts, including a professional form modal and submission workflow.

### Improved
- **Global Navigation & Hash Scrolling**: 
  - Implemented a `GlobalScrollHandler` in `App.tsx` to manage smooth-scrolling to home page sections from any sub-page.
  - Overhauled `Navigation.tsx` logic to support consistent cross-page redirection.
- **Digital Wellness Pop Game**: 
  - Implemented a **Combo System** for rewarding consecutive accurate pops.
  - Added new bubble types: **ZEN** (Bonus points) and **CALM** (Instant stress reduction).
  - Added **Floating Text Feedback** for real-time point and stress tracking.
  - Created a **Dynamic Background** that changes color based on player stress levels.
  - Added a comprehensive Start Screen with instructions and High Score persistence via `localStorage`.
- **Predictive Hero UX**:
  - Increased definition modal z-index to ensure visibility above the navbar.
  - Implemented **Scrollable Definition Cards** to accommodate lengthy expert summaries (e.g., "Online Trolling").
  - Removed layout-level z-index constraints to allow fixed overlays to layer correctly.

### Fixed
- **Navigation Syntax Error**: Resolved a crash caused by duplicate closing braces in the Navigation component.
- **Port Conflict**: Updated Vite configuration to default to port `5173` to avoid `EACCES` errors on port `8080`.

... (previous entries) ...
