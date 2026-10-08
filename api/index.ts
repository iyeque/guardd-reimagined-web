// Vercel Serverless Function.
//
// The Express app is imported LAZILY inside try/catch on purpose: server/db.ts
// throws at module scope when DATABASE_URL is unset, which would otherwise
// take down the entire function as an opaque FUNCTION_INVOCATION_FAILED.
// This way a boot failure returns a JSON diagnostic naming the real cause.
//
// Vercel's @vercel/node runtime compiles this file, bundles to CommonJS and
// installs dependencies from package.json, so Express needs no module-type
// workarounds. The file must live in git as source — a bundle written to api/
// during `npm run build` was never registered as a function.
import type { IncomingMessage, ServerResponse } from "http";

type Res = ServerResponse & {
  status(code: number): Res;
  json(body: unknown): void;
};

const DIAGNOSTIC_ENV_KEYS = [
  "DATABASE_URL",
  "ENCRYPTION_KEY",
  "ADMIN_SECRET",
  "SERP_API_KEY",
  "NODE_ENV",
] as const;

let appPromise: Promise<unknown> | null = null;

function loadApp(): Promise<unknown> {
  if (!appPromise) {
    appPromise = import("../server/index").then((mod) => mod.app);
  }
  return appPromise;
}

export default async function handler(
  req: IncomingMessage,
  res: Res,
): Promise<void> {
  try {
    const app = (await loadApp()) as (
      req: IncomingMessage,
      res: Res,
    ) => unknown;
    app(req, res);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    // Booleans only — never log or return secret values.
    const env = Object.fromEntries(
      DIAGNOSTIC_ENV_KEYS.map((key) => [key, Boolean(process.env[key])]),
    );
    console.error(`[api] boot failure: ${message}\n${stack ?? ""}`);
    res.status(500).json({
      error: "FUNCTION_BOOT_FAILED",
      message,
      stack: stack?.split("\n").slice(0, 8),
      env,
      node: process.version,
    });
  }
}
