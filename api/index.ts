// Vercel Serverless Function — compiled by Vercel's @vercel/node runtime.
//
// Why this file exists in git as SOURCE (not a build artifact):
// Vercel only registers a Serverless Function when it finds a file in the
// repo's root `api/` directory. An esbuild bundle written to `api/` during
// `npm run build` was never picked up, so every /api/* request fell through
// to the SPA rewrite and returned index.html (HTTP 200, content-type
// text/html) — which the frontend then failed to parse as JSON.
//
// @vercel/node bundles this to CommonJS and installs the deps from
// package.json, so Express works without any module-type gymnastics.
import { app } from "../server/index";

export default app;
