// Load env vars BEFORE importing app (db.ts checks DATABASE_URL at import time)
import { config } from "dotenv";
config();

import { app } from "../index.js";

// Vercel serverless function handler
// Processes requests through the Express app without requiring an HTTP server
export const handler = async (req: any, res: any): Promise<void> => {
  app(req, res);
};

export default handler;
