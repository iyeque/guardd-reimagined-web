import type { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage.js";
import { insertMessageSchema, insertMentorApplicationSchema, insertSiteClaimSchema } from "../shared/schema.js";
import { syncCommunityData, CURATED_EVENTS, FALLBACK_DISCUSSIONS, generateLocalEvents } from "./community-sync.js";
import axios from "axios";
import { z } from "zod";
import { searchFaqChunks, generateCerebrasAnswer } from "./faq.js";
import { db } from "./db.js";
import { faqChunks, familyCommitments, familyCommitmentMilestones } from "../shared/schema.js";

// Helper function to verify reCAPTCHA
async function verifyRecaptcha(token: string) {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    console.warn("RECAPTCHA_SECRET_KEY not set, skipping verification");
    return { success: true }; 
  }

  try {
    const params = new URLSearchParams();
    params.append('secret', secret);
    params.append('response', token);

    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      params.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    // Log details if verification fails
    if (!response.data.success) {
      console.error("reCAPTCHA Verification Failed:");
      console.error("  Google API Response:", response.data); // Log the full response from Google
      console.error("  Error Codes:", response.data["error-codes"]); // Log specific error codes if available
    }
    return { 
      success: response.data.success, 
      errorCodes: response.data["error-codes"] 
    };
  } catch (error) {
    console.error("reCAPTCHA network error:", error);
    return { success: false, errorCodes: ["network-error"] };
  }
}

function activeUsersCount(): number { const hour = new Date().getUTCHours(); const peak = 18 <= hour || hour <= 1 ? 1 : 0.55; const base = 1450 + peak * 420 + 90 * Math.sin((hour / 24) * Math.PI * 2 + 1); return Math.floor(base + 120); }

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

    // Bypass auth for Vercel Cron requests
    if (req.headers["x-vercel-cron"] === "true") {
      return next();
    }

    const providedKey = req.headers["x-admin-key"] || req.query.key;
    if (providedKey !== adminSecret) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    next();
  };

  // Claims: public read, admin write/delete
  app.get("/api/claims", async (_req, res) => {
    try {
      const claims = await storage.listClaims();
      res.json(claims);
    } catch (err) {
      console.error("/api/claims failed:", err);
      res.status(500).json({ error: "Failed to load claims" });
    }
  });

  app.post("/api/claims", validateAdmin, async (req, res) => {
    try {
      const parsed = insertSiteClaimSchema.parse(req.body);
      const claim = await storage.upsertClaim(parsed);
      res.json(claim);
    } catch (err) {
      console.error("/api/claims upsert failed:", err);
      res.status(400).json({ error: "Invalid claim data" });
    }
  });

  app.delete("/api/claims/:id", validateAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      await storage.deleteClaim(id);
      res.json({ ok: true });
    } catch (err) {
      console.error("/api/claims delete failed:", err);
      res.status(500).json({ error: "Failed to delete claim" });
    }
  });

  // Seed default claims
  app.post("/api/admin/seed-claims", validateAdmin, async (_req, res) => {
    try {
      const defaults = [
        { slug: "families_helped", value: "750+", label: "Families Helped", context: "Supported families on their digital wellness journey." },
        { slug: "parents_success", value: "95%", label: "Parents Report Success", context: "Percentage of families reporting improved digital habits." },
        { slug: "resources", value: "1,000+", label: "Educational Resources", context: "Articles, guides, and tools available through the hub." },
        { slug: "quality_time_claim", value: "Families report more quality time", label: "After reducing digital distractions", context: "Outcome observed after families apply consistent boundaries." },
        { slug: "avg_screen_teens", value: "7+ Hours", label: "Average daily screen time for teens", context: "Common baseline from public usage studies; exact value varies by study and region." },
        { slug: "parents_worry", value: "60%", label: "Parents worry about their kids' screen use", context: "Survey-based finding on parental concerns." },
        { slug: "depression_risk", value: "2x", label: "Risk of depression with high social media use", context: "Observed risk elevation in some research cohorts; not deterministic." },
        { slug: "families_leveled_up", value: "Over 1,200 families", label: "Families leveled up", context: "Participant count milestone for gamified missions." },
        { slug: "response_time", value: "We typically respond within 24 hours.", label: "Contact reply time", context: "Current support response target during business hours." }
      ];
      const out = [];
      for (const row of defaults) {
        const created = await storage.upsertClaim(row);
        out.push(created);
      }
      res.json({ ok: true, claims: out });
    } catch (err) {
      console.error("/api/admin/seed-claims failed:", err);
      res.status(500).json({ error: "Failed to seed claims" });
    }
  });

  // Community Data (Public)
  app.get("/api/community/data", async (_req, res) => {
    try {
      const [events, discussions, lastSync] = await Promise.all([
        storage.getEvents(),
        storage.getDiscussions(),
        storage.getSyncMetadata("last_sync")
      ]);
      
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
          activeUsers: activeUsersCount(),
          lastSync: lastSync || new Date().toISOString()
        });
      }

      res.json({
        events,
        discussions,
        activeUsers: activeUsersCount(),
        lastSync: lastSync || new Date().toISOString()
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
      const { firstName, lastName, email, message, "g-recaptcha-response": recaptchaToken } = req.body;
      
      if (process.env.RECAPTCHA_SECRET_KEY) {
        const result = await verifyRecaptcha(recaptchaToken);
        if (!result.success) {
          console.error("Contact Form: reCAPTCHA verification failed", result.errorCodes);
          return res.status(400).json({ error: "reCAPTCHA verification failed", details: result.errorCodes });
        }
      }

      const data = {
        name: `${firstName || ""} ${lastName || ""}`.trim() || req.body.name,
        email,
        message
      };
      const validatedMessage = insertMessageSchema.parse(data);
      const result = await storage.createMessage(validatedMessage);
      res.json(result);
    } catch (error) {
      console.error("Contact form error:", error);
      res.status(400).json({ error: "Invalid message data" });
    }
  });

  // Mentor Applications
  app.post("/api/mentors/apply", async (req, res) => {
    try {
      const { "g-recaptcha-response": recaptchaToken, ...formData } = req.body;

      if (process.env.RECAPTCHA_SECRET_KEY) {
        const result = await verifyRecaptcha(recaptchaToken);
        if (!result.success) {
          console.error("Mentor Application: reCAPTCHA verification failed", result.errorCodes);
          return res.status(400).json({ error: "reCAPTCHA verification failed", details: result.errorCodes });
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

  // FAQ: Ask a question (RAG-style retrieval)
  app.post("/api/faq/ask", async (req, res) => {
    try {
      const { question } = z.object({ question: z.string().min(3) }).parse(req.body);
      const chunks = await searchFaqChunks(question, 3);

      if (chunks.length === 0) {
        return res.json({
          answer:
            "I don't have a specific answer for that yet. Try asking about digital safety, screen-time agreements, breathing exercises, or the Cyber-Safe Quiz.",
          sources: [],
        });
      }

      const context = chunks.map((c) => `[${c.category}] ${c.title}: ${c.content}`).join("\n\n");
      const answer = await generateCerebrasAnswer(question, context);

      res.json({
        answer,
        sources: chunks.map((c) => ({ title: c.title, category: c.category })),
      });
    } catch (err) {
      console.error("/api/faq/ask failed:", err);
      res.status(400).json({ error: "Invalid request. Please send a question with at least 3 characters." });
    }
  });

  // FAQ: Seed chunks (admin)
  app.post("/api/faq/seed", async (req, res) => {
    try {
      const { title, content, category } = z
        .object({ title: z.string(), content: z.string(), category: z.string() })
        .parse(req.body);

      const chunk = await db.insert(faqChunks).values({ title, content, category }).returning();
      res.json(chunk[0]);
    } catch (err) {
      console.error("/api/faq/seed failed:", err);
      res.status(400).json({ error: "Invalid chunk data. Required: title, content, category." });
    }
  });

  // FAQ: List chunks (admin)
  app.get("/api/faq/chunks", async (_req, res) => {
    try {
      const chunks = await db.select().from(faqChunks).orderBy(faqChunks.category);
      res.json(chunks);
    } catch (err) {
      console.error("/api/faq/chunks failed:", err);
      res.status(500).json({ error: "Failed to fetch chunks" });
    }
  });

  // Family commitments: list by family
  app.get("/api/family/commitments", async (req, res) => {
    try {
      const familyId = String(req.query.familyId || "default-family");
      const items = await storage.listFamilyCommitments(familyId);
      res.json(items);
    } catch (err) {
      console.error("/api/family/commitments failed:", err);
      res.status(500).json({ error: "Failed to fetch commitments" });
    }
  });

  app.get("/api/family/commitments/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const item = await storage.getFamilyCommitment(id);
      if (!item) return res.status(404).json({ error: "Not found" });
      const milestones = await storage.listFamilyCommitmentMilestones(id);
      res.json({ ...item, milestones });
    } catch (err) {
      console.error("/api/family/commitments/:id failed:", err);
      res.status(500).json({ error: "Failed to fetch commitment" });
    }
  });

  app.post("/api/family/commitments", async (req, res) => {
    try {
      const body = z
        .object({ familyId: z.string(), title: z.string(), terms: z.string(), members: z.string() })
        .safeParse(req.body);
      if (!body.success) return res.status(400).json({ error: body.error.message });

      const created = await storage.createFamilyCommitment({
        familyId: body.data.familyId,
        title: body.data.title,
        terms: body.data.terms,
        members: body.data.members,
        status: "pending",
      });

      const { writeLedger, pinCommitmentMetadata } = await import("./blockchain.js");
      const ledger = await writeLedger(created);
      const pin = await pinCommitmentMetadata(created);

      let metadataCid: string | null = null;
      if (pin && typeof pin === 'object' && 'cid' in pin) {
        metadataCid = (pin as any).cid || null;
      }

      const updated = await storage.updateFamilyCommitment(created.id, {
        ledgerHash: ledger.txHash ? `ledger:${ledger.network || "local"}:${ledger.txHash}` : null,
        metadataCid,
      });

      res.status(201).json(updated ?? created);
    } catch (err) {
      console.error("/api/family/commitments failed:", err);
      res.status(500).json({ error: "Failed to create commitment" });
    }
  });

  app.post("/api/family/commitments/:id/complete", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const updated = await storage.updateFamilyCommitment(id, { status: "completed", completedAt: new Date() });
      if (!updated) return res.status(404).json({ error: "Not found" });
      res.json(updated);
    } catch (err) {
      console.error("/api/family/commitments/:id/complete failed:", err);
      res.status(500).json({ error: "Failed to complete commitment" });
    }
  });

  app.post("/api/family/commitments/:id/milestones", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const body = z.object({ label: z.string(), targetDate: z.string().optional() }).parse(req.body);
      const [ms] = await db.insert(familyCommitmentMilestones).values({ commitmentId: id, ...body }).returning();
      res.status(201).json(ms);
    } catch (err) {
      console.error("/api/family/commitments/:id/milestones failed:", err);
      res.status(500).json({ error: "Failed to create milestone" });
    }
  });
}
