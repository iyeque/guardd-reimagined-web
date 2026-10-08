// Vercel supplies environment variables through process.env.
// Export the Express app directly so Vercel can invoke all nested /api/* routes.
import { app } from "../index.js";

export default app;
