import { app } from "../index.js";

// Vercel serverless function handler
// Processes requests through the Express app without requiring an HTTP server
export const handler = async (req: any, res: any): Promise<void> => {
  // Load env vars for Vercel serverless runtime
  const m = await import("dotenv");
  m.config?.();
  app(req, res);
};

export default handler;
