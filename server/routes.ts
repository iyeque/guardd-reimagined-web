import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertMessageSchema, insertMentorApplicationSchema } from "@shared/schema";
import { syncCommunityData } from "./community-sync";

export async function registerRoutes(app: Express) {
  // Community Data
  app.get("/api/community/data", async (_req, res) => {
    try {
      const events = await storage.getEvents();
      const discussions = await storage.getDiscussions();
      
      // If empty, trigger initial sync
      if (events.length === 0) {
        await syncCommunityData();
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

  app.post("/api/community/sync", async (_req, res) => {
    try {
      const result = await syncCommunityData();
      res.json({ message: "Sync successful", lastSync: result.lastSync });
    } catch (error) {
      res.status(500).json({ error: "Sync failed" });
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
  app.get("/api/admin/messages", async (_req, res) => {
    const messages = await storage.getMessages();
    res.json(messages);
  });

  app.get("/api/admin/applications", async (_req, res) => {
    const apps = await storage.getMentorApplications();
    res.json(apps);
  });

  return createServer(app);
}
