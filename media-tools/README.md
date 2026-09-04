# Media Tools

This folder holds local/cloud media generation assets for the DigitalGuard course pipeline.
It is intentionally not committed to the main repo.

## Local vs Cloud Guidance

- Local CPU tasks on this laptop: audio drafting/stubs, checks, FFmpeg compositing.
- Heavy avatar/lipsync/generation: use a remote/cloud GPU instance or a workstation with a discrete NVIDIA/AMD GPU.

## Directory Layout

- `audio/` — narration drafts, clones, processed WAV/MP3
- `video/` — raw talking-head outputs, lipsync exports
- `final/` — FFmpeg composites, branded deliverables
- `scripts/` — local helper scripts

## Local Audio Stubs

Run the stub generator from repo root:

```bash
node media-tools/scripts/generate-audio-stubs.mjs --check-only
node media-tools/scripts/generate-audio-stubs.mjs
```

This creates placeholder/index artifacts only. It does not call any cloud GPU provider.

## Cloud Avatar / Lipsync Instructions

Recommended path for avatar and lipsync:

1. Export module narration audio from `public/course-assets/audio/` or `media-tools/audio/`.
2. Upload audio + avatar source image to a remote GPU environment with:
   - Hedra or similar talking-head tool
   - lipsync model aligned to narration timing
3. Render per-module `.mp4` outputs to `media-tools/video/`.
4. Run FFmpeg compositing to produce `media-tools/final/`.
5. Copy final assets into `public/course-assets/video/` and `public/course-assets/final/` when ready for the web app.

## Compositing

FFmpeg is available on this machine. Example concepts:

- overlay slide graphics
- add branding/captions
- render action-pause inserts
- output to `media-tools/final/`

## Notes

- Keep API keys and provider credentials out of this folder.
- Do not commit large generated media files.
