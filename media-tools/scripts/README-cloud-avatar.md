# Cloud Avatar / Lipsync Runbook

Use this when moving avatar/lipsync work off the laptop.

## Recommended Setup

- GPU instance: NVIDIA A10/A100/A4000 or better
- OS: Linux with NVIDIA drivers + CUDA
- Storage: object storage or mounted workspace for large media

## Workflow

1. Prepare narration audio for one module:
   - source: `public/course-assets/audio/m{1-9}.mp3`
   - or remote-generated clone audio

2. Generate talking-head video:
   - input: module audio + avatar image
   - output: `media-tools/video/m{1-9}.mp4`

3. Lipsync:
   - align mouth motion to narration timestamps
   - output: `media-tools/video/m{1-9}-lipsync.mp4`

4. Composite with FFmpeg:
   - slide overlays from `public/course-assets/overlays/`
   - branding/captions/action-pause inserts
   - output: `media-tools/final/m{1-9}.mp4`

5. Publish:
   - copy final assets to `public/course-assets/video/` and `public/course-assets/final/`

## Tool Options

- Hedra or equivalent talking-head generation
- SadTalker / Wav2Lip-style lipsync
- FFmpeg for final assembly

## Constraints

- Do not store secrets in `media-tools/`.
- Do not commit large media files to git.
