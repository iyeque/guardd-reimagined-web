// Vercel Serverless Function.
//
// MUST use a STATIC top-level import. A dynamic import("../server/index")
// is left unbundled by Vercel's builder, so server/ is never deployed and the
// function dies with ERR_MODULE_NOT_FOUND at /var/task/server/index.
//
// Vercel's @vercel/node runtime compiles this file, bundles to CommonJS and
// installs dependencies from package.json, so Express needs no module-type
// workarounds. The file must live in git as SOURCE — a bundle written to api/
// during `npm run build` was never registered as a function, so every /api/*
// request fell through to the SPA rewrite and returned index.html.
import { app } from "../server/index";
import type { IncomingMessage, ServerResponse } from "http";

export default function handler(
  req: IncomingMessage,
  res: ServerResponse,
): void {
  try {
    (app as unknown as (req: IncomingMessage, res: ServerResponse) => unknown)(
      req,
      res,
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[api] unhandled request error: ${message}`);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "INTERNAL_ERROR", message }));
    }
  }
}
