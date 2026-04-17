import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertMessageSchema, insertMentorApplicationSchema } from "@shared/schema";
import { syncCommunityData } from "./community-sync";

export async function registerRoutes(app: Express) {
  // Simple Admin Middleware
  const validateAdmin = (req: any, res: any, next: any) => {
    const adminSecret = process.env.ADMIN_SECRET;
    if (!adminSecret) {
      return res.status(500).json({ error: "Server Configuration Error: ADMIN_SECRET not set" });
    }

    const providedKey = req.headers["x-admin-key"] || req.query.key;
    if (providedKey !== adminSecret) {
      return res.status(401).json({ error: "Unauthorized: Invalid Admin Key" });
    }
    next();
  };

  // Community Data (Public)
  app.get("/api/community/data", async (_req, res) => {
    try {
      const events = await storage.getEvents();
      const discussions = await storage.getDiscussions();
      
      // If empty, trigger initial sync
      if (events.length === 0) {
        try {
          await syncCommunityData();
        } catch (syncErr) {
          console.error("Initial sync error:", syncErr);
        }
        return res.json({
          events: await storage.getEvents(),
          discussions: await storage.getDiscussions(),
          activeUsers: Math.floor(Math.random() * (3500 - 2000) + 2000),
          lastSync: new Date().toISOString()
        });
      }

      res.json({
        events,
        discussions,
        activeUsers: Math.floor(Math.random() * (3500 - 2000) + 2000),
        lastSync: new Date().toISOString()
      });
    } catch (error) {
      console.error("Fetch community data error:", error);
      res.status(500).json({ error: "Failed to fetch community data" });
    }
  });

  // Sync Trigger (Protected)
  app.post("/api/community/sync", validateAdmin, async (_req, res) => {
    try {
      const result = await syncCommunityData();
      res.json({ message: "Sync successful", lastSync: result.lastSync });
    } catch (error: any) {
      console.error("Sync error:", error);
      res.status(500).json({ error: error.message || "Sync failed" });
    }
  });

  // Contact Form (Public)
  app.post("/api/contact", async (req, res) => {
    try {
      const { firstName, lastName, email, message } = req.body;
      const data = {
        name: `${firstName || ""} ${lastName || ""}`.trim() || req.body.name,
        email,
        message
      };
      
      const validatedMessage = insertMessageSchema.parse(data);
      const result = await storage.createMessage(validatedMessage);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: "Invalid message data" });
    }
  });

  // Mentor Applications (Public)
  app.post("/api/mentors/apply", async (req, res) => {
    try {
      const validatedApp = insertMentorApplicationSchema.parse(req.body);
      const result = await storage.createMentorApplication(validatedApp);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: "Invalid application data" });
    }
  });

  // Admin Endpoints (Protected)
  app.get("/api/admin/messages", validateAdmin, async (_req, res) => {
    try {
      const messages = await storage.getMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.get("/api/admin/applications", validateAdmin, async (_req, res) => {
    try {
      const apps = await storage.getMentorApplications();
      res.json(apps);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch applications" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
