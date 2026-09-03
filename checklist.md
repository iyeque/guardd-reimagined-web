# Course Integration Checklist

## Phase 1 — Course shell in the app, no video dependency
- [ ] Add `/course` route as a linear, scoped route separate from `/workshops`
- [ ] Build lightweight `CoursePlayer` shell showing module titles, durations, action-pause prompts, and completion state
- [ ] Wire assessments directly into the route using existing quiz/checklist patterns
- [ ] Persist course progress independently from workshop progress

## Phase 2 — Assessment integration from `course.md`
- [ ] Add `AssessmentModal` components for Assessment 1 and Assessment 2
- [ ] Populate them with actual questions/answers from `course.md`
- [ ] Add passing thresholds and retry behavior
- [ ] Link assessments into the course flow at the correct module breakpoints

## Phase 3 — Media infrastructure design
- [ ] Define minimal manifest schema for course assets
- [ ] Add local/public asset layout under `public/course-assets/`
- [ ] Decide hosting strategy: local public assets for dev, CDN/object storage for production

## Phase 4 — Voice cloning pipeline
- [ ] Start with audio-only first
- [ ] Use Kokoro-based local CPU generation for drafts
- [ ] Use Step Audio EditX or equivalent for cloned voice refinement
- [ ] Output per module narration audio in `public/course-assets/audio/`
- [ ] Update `CoursePlayer` to play audio with animated waveform/progress bar

## Phase 5 — Avatar and lipsync
- [ ] Use Hedra or similar open-source talking-head tool
- [ ] Generate per-module `.mp4` files with lipsync aligned to narration audio
- [ ] Store in `public/course-assets/video/`
- [ ] Player prefers video when available, falls back to audio-only when missing

## Phase 6 — Compositing and polish
- [ ] Use FFmpeg to composite slide overlays, branding, captions, action-pause overlays, progress indicators
- [ ] Produce final deliverables in `public/course-assets/final/`
- [ ] Update `CoursePlayer` to use final assets and enable full playback

## Phase 7 — Production hardening
- [ ] Add lazy loading/code splitting for the course route
- [ ] Add offline caching hints if assets are large
- [ ] Add simple admin/manual trigger path for regenerating assets without redeploying the app
