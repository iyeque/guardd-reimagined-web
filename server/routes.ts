import type { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage.js";
import { insertMessageSchema, insertMentorApplicationSchema } from "../shared/schema.js";
import { syncCommunityData, CURATED_EVENTS, FALLBACK_DISCUSSIONS, generateLocalEvents } from "./community-sync.js";
import axios from "axios";
import { z } from "zod";

// Helper function to verify reCAPTCHA
async function verifyRecaptcha(token: string) {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    console.warn("RECAPTCHA_SECRET_KEY not set, skipping verification");
    return true; // Don't block in dev if not configured
  }

  try {
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`
    );
    return response.data.success;
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return false;
  }
}

export function registerRoutes(app: Express) {
  // Health check for Vercel
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", time: new Date().toISOString(), env: process.env.NODE_ENV });
  });

  // Simple Admin Middleware
  const validateAdmin = (req: Request, res: Response, next: NextFunction) => {
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
      const events = await storage.getEvents();
      const discussions = await storage.getDiscussions();
      
      // If database is empty, return static data immediately and trigger sync in background
      if (events.length === 0 || discussions.length === 0) {
        console.log("Database empty, returning initial static data...");
        
        // Return a mix of curated and generated data for immediate display
        const initialEvents = [...CURATED_EVENTS, ...generateLocalEvents()].map((e, i) => ({ id: i + 1, ...e }));
        const initialDiscussions = FALLBACK_DISCUSSIONS.map((d, i) => ({ id: i + 1, ...d }));

        // Trigger sync in background (fire and forget)
        syncCommunityData().catch(err => console.error("Background sync failed:", err));

        return res.json({
          events: initialEvents,
          discussions: initialDiscussions,
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
      console.error("Fatal API error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Sync Trigger (Protected)
  app.post("/api/community/sync", validateAdmin, async (_req, res) => {
    try {
      // For manual sync, we DO await it so the admin knows if it worked
      const result = await syncCommunityData();
      res.json({ message: "Sync successful", lastSync: result.lastSync });
    } catch (error: unknown) {
      console.error("Manual sync error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Sync failed" });
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
      const { "g-recaptcha-response": recaptchaToken, ...formData } = req.body;

      if (process.env.RECAPTCHA_SECRET_KEY) {
        const isValid = await verifyRecaptcha(recaptchaToken);
        if (!isValid) {
          console.error("Mentor Application: reCAPTCHA verification failed");
          return res.status(400).json({ error: "reCAPTCHA verification failed. Please try again." });
        }
      } else {
        console.warn("Mentor Application: Skipping reCAPTCHA check (RECAPTCHA_SECRET_KEY not set)");
      }

      const validatedApp = insertMentorApplicationSchema.parse(formData);
      const result = await storage.createMentorApplication(validatedApp);
      res.json(result);
    } catch (error) {
      console.error("Mentor application error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid application data. Please check all fields." });
      }
      res.status(500).json({ error: "Internal server error. Database storage failed." });
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

  app.patch("/api/admin/applications/:id", validateAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }
      const app = await storage.updateMentorApplicationStatus(id, status);
      res.json(app);
    } catch (error) {
      console.error("Failed to update application:", error);
      res.status(500).json({ error: "Failed to update application" });
    }
  });
}
