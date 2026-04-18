import { app } from "./index.ts";
import { setupVite, serveStatic } from "./vite.ts";
import { log } from "./log.ts";
import { syncCommunityData } from "./community-sync.ts";
import { createServer } from "http";

(async () => {
...
    const port = 5000;
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
