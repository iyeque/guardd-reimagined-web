// Vercel Serverless Function.
//
// Two hard-won constraints:
//
// 1. The import MUST carry an explicit `.js` extension. The root package.json
//    declares "type": "module", so Vercel emits this function as ESM. An
//    extensionless `../server/index` is unresolvable in ESM and the function
//    died with ERR_MODULE_NOT_FOUND at /var/task/server/index. TypeScript's
//    NodeNext convention maps `.js` -> `.ts`, which the rest of server/
//    already follows (./routes.js, ../shared/schema.js).
//
// 2. This file must live in git as SOURCE. A bundle written to api/ during
//    `npm run build` was never registered as a function, so every /api/*
//    request fell through to the SPA rewrite and returned index.html.
import { app } from "../server/index.js";
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
