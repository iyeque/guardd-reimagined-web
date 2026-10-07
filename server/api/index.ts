// Vercel provides env vars via process.env — no dotenv needed in serverless
import { app } from "../index.js";

// Vercel serverless function handler
// Processes requests through the Express app without requiring an HTTP server
export const handler = async (req: any, res: any): Promise<void> => {
  app(req, res);
};

export default handler;
