/**
 * Content script: shows the family agreement when a blocked page loads.
 *
 * Phase 4 fills in the overlay. This exists now so the manifest is loadable and
 * so the shared rule engine is provably reachable from a page context — the same
 * `DGRules` global the background worker uses, bundled from
 * shared/commitment-rules.ts by `npm run build:extension`.
 */

// Nothing to do until a rule actually fires. Phase 4 listens for the block
// signal and renders the family's own wording here.
