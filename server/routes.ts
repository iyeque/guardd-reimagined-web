import type { Express } from "express";
import { storage } from "./storage.ts";
import { insertMessageSchema, insertMentorApplicationSchema } from "../shared/schema.ts";
import { syncCommunityData } from "./community-sync.ts";

export function registerRoutes(app: Express) {
  // Health check for Vercel
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", time: new Date().toISOString(), env: process.env.NODE_ENV });
  });

  // Simple Admin Middleware
  const validateAdmin = (req: any, res: any, next: any) => {
    const adminSecret = process.env.ADMIN_SECRET;
    if (!adminSecret) {
      console.error("ADMIN_SECRET not set in environment");
      return res.status(500).json({ error: "Server Configuration Error" });
    }

    const providedKey = req.headers["x-admin-key"] || req.query.key;
    if (providedKey !== adminSecret) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    next();
  };

  // Community Data (Public)
  app.get("/api/community/data", async (_req, res) => {
    try {
      let events = await storage.getEvents();
      let discussions = await storage.getDiscussions();
      
      if (events.length === 0) {
        try {
          await syncCommunityData();
          events = await storage.getEvents();
          discussions = await storage.getDiscussions();
        } catch (syncErr) {
          console.error("Sync failed:", syncErr);
        }
      }

      res.json({
        events: events || [],
        discussions: discussions || [],
        activeUsers: Math.floor(Math.random() * (3500 - 2000) + 2000),
        lastSync: new Date().toISOString()
      });
    } catch (error) {
      console.error("Fatal API error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Sync Trigger (Protected)
  app.post("/api/community/sync", validateAdmin, async (_req, res) => {
    try {
      const result = await syncCommunityData();
      res.json({ message: "Sync successful", lastSync: result.lastSync });
    } catch (error: any) {
      console.error("Manual sync error:", error);
      res.status(500).json({ error: error.message || "Sync failed" });
    }
  });

  // Contact Form
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

  // Mentor Applications
  app.post("/api/mentors/apply", async (req, res) => {
    try {
      const validatedApp = insertMentorApplicationSchema.parse(req.body);
      const result = await storage.createMentorApplication(validatedApp);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: "Invalid application data" });
    }
  });

  // Admin Endpoints
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
}
