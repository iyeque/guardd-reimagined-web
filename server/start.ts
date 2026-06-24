import { app } from "./index.js";
import { setupVite, serveStatic } from "./vite.js";
import { log } from "./log.js";
import { syncCommunityData } from "./community-sync.js";
import { createServer } from "http";

(async () => {
  try {
    const server = createServer(app);

    // Initial community data sync (only in dev/standalone mode)
    log("Starting initial community data sync...");
    await syncCommunityData().catch(err => log(`Sync error: ${err}`));

    // Periodic sync every 10 minutes
    setInterval(() => {
      syncCommunityData().catch(err => log(`Periodic sync error: ${err}`));
    }, 10 * 60 * 1000);

    if (process.env.NODE_ENV !== "production") {
      log("Setting up Vite for development...");
      await setupVite(app, server);
      log("Vite setup completed.");
    } else {
      log("Setting up static file serving...");
      serveStatic(app);
      log("Static file serving setup completed.");
    }

    const port = process.env.PORT ? Number(process.env.PORT) : 5000;
    log(`Attempting to start server on port ${port}...`);
    server.listen({
      port,
      host: "127.0.0.1",
    }, () => {
      log(`Server is running on port ${port}`);
    });
  } catch (error) {
    log(`Failed to start server: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
})();
