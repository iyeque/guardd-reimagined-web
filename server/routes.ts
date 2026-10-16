import type { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage.js";
import { insertMessageSchema, insertMentorApplicationSchema, insertSiteClaimSchema, insertAssessmentAnalyticsSchema, insertCuratedContentSchema, insertStorySchema } from "../shared/schema.js";
import { syncCommunityData, CURATED_EVENTS, FALLBACK_DISCUSSIONS, generateLocalEvents } from "./community-sync.js";
import axios from "axios";
import { z } from "zod";
import { searchFaqChunks, generateOpenRouterAnswer } from "./faq.js";
import { db } from "./db.js";
import { timingSafeEqual, randomBytes } from "node:crypto";
import { faqChunks, familyCommitments, familyCommitmentMilestones, familyAccess } from "../shared/schema.js";
import { eq, and, gte } from "drizzle-orm";
import { encryptField, decryptField } from "./crypto.js";

/** Constant-time compare so the admin key cannot be recovered by timing. */
function secretsMatch(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * True only for a genuine Vercel Cron call.
 *
 * Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`. This deliberately
 * does NOT trust `x-vercel-cron`, `x-vercel-cron-schedule`, or a
 * `vercel-cron/` user-agent — a client can set all three and Vercel does not
 * strip them, so trusting them handed unauthenticated access to every route
 * that used them (verified against the live API). With no CRON_SECRET
 * configured this returns false, so cron traffic is rejected loudly rather
 * than silently admitted.
 */
function isCronRequest(req: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  return req.headers["authorization"] === `Bearer ${cronSecret}`;
}

function generateFamilyToken(): string {
  return randomBytes(32).toString("base64url");
}

/** Families any one caller may create per hour. See the bootstrap route. */
const BOOTSTRAP_HOURLY_LIMIT = 20;

/**
 * Resolve which family a request targets.
 *
 * Most routes carry `familyId` in the query or body, but `/:id/complete` and
 * `/:id/milestones` identify the commitment by path id only. Load the row in
 * that case so the client never has to repeat the familyId (and so a wrong
 * familyId can't be smuggled in alongside a valid token).
 */
/** The family a caller DECLARED, ignoring anything the token implies. */
async function declaredFamilyId(req: Request): Promise<string | null> {
  const fromQuery = req.query?.familyId;
  if (typeof fromQuery === "string" && fromQuery) return fromQuery;
  const fromBody = (req.body ?? {}) as { familyId?: unknown };
  if (typeof fromBody.familyId === "string" && fromBody.familyId) return fromBody.familyId;
  const fromParams = req.params?.familyId;
  if (typeof fromParams === "string" && fromParams) return fromParams;
  return null;
}

/**
 * Which family a request targets: what the caller declared, else the family
 * `requireFamilyAccess` resolved from the token, else — for `/:id/complete`
 * and `/:id/milestones`, which identify a commitment by path id only — the
 * family that row belongs to.
 */
async function resolveFamilyId(req: Request): Promise<string | null> {
  const declared = await declaredFamilyId(req);
  if (declared) return declared;
  const resolved = (req as Request & { resolvedFamilyId?: string }).resolvedFamilyId;
  if (resolved) return resolved;
  const id = Number(req.params?.id);
  if (Number.isFinite(id) && id > 0) {
    try {
      const [row] = await db
        .select({ familyId: familyCommitments.familyId })
        .from(familyCommitments)
        .where(eq(familyCommitments.id, id))
        .limit(1);
      return row?.familyId ?? null;
    } catch (err) {
      console.error("resolveFamilyId lookup failed:", err);
      return null;
    }
  }
  return null;
}

/**
 * Gates every family-commitment route on one of the family's device tokens.
 *
 * The familyId alone is not a credential — it is guessable and was previously
 * enough to read any family's decrypted terms. Reads and writes both require
 * `Authorization: Bearer <token>` matching a row in `family_access`. There may
 * be many tokens per family, one per device.
 *
 * The token identifies the family, so a caller need NOT declare a familyId. If
 * one is declared it must match the token's family, otherwise the token alone
 * resolves it. This is what lets a parent paste a key and have it just work,
 * without their browser profile's stored familyId having to agree.
 */
const requireFamilyAccess = async (req: Request, res: Response, next: NextFunction) => {
  const auth = req.headers["authorization"];
  const provided = typeof auth === "string" && auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!provided) {
    return res.status(401).json({ error: "Family access token required" });
  }
  const declared = await declaredFamilyId(req);
  try {
    if (declared) {
      const [row] = await db
        .select({ token: familyAccess.token })
        .from(familyAccess)
        .where(and(eq(familyAccess.familyId, declared), eq(familyAccess.token, provided)))
        .limit(1);
      if (!row) {
        return res.status(401).json({ error: "Invalid family access token" });
      }
    } else {
      // No family declared — look the family up from the token itself.
      const [row] = await db
        .select({ familyId: familyAccess.familyId })
        .from(familyAccess)
        .where(eq(familyAccess.token, provided))
        .limit(1);
      if (!row) {
        return res.status(401).json({ error: "Invalid family access token" });
      }
      // Stash it so the route handler reads the same family the token resolved.
      (req as Request & { resolvedFamilyId?: string }).resolvedFamilyId = row.familyId;
    }
    // Best-effort "last seen" so the device list is useful. Never block a
    // request because bookkeeping failed.
    void db
      .update(familyAccess)
      .set({ lastUsedAt: new Date() })
      .where(eq(familyAccess.token, provided))
      .catch(() => {});
    next();
  } catch (err) {
    console.error("requireFamilyAccess failed:", err);
    res.status(500).json({ error: "Authorization check failed" });
  }
};

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

    // Vercel Cron authenticates with CRON_SECRET as an Authorization: Bearer
    // token — that is the documented, unforgeable mechanism.
    //
    // This deliberately does NOT trust the `x-vercel-cron` request header. An
    // external caller can set that header and Vercel does not strip it, so
    // trusting it handed full admin access to anyone on the internet (verified:
    // `curl -H "x-vercel-cron: true" /api/admin/messages` returned real
    // contact PII). Fail closed instead — with no CRON_SECRET configured, cron
    // traffic gets a 401 and the daily sync fails loudly rather than silently
    // running unauthenticated.
    if (isCronRequest(req)) {
      return next();
    }

    const providedKey = req.headers["x-admin-key"] || req.query.key;
    if (typeof providedKey !== "string" || !secretsMatch(providedKey, adminSecret)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    next();
  };

  const runCommunitySync = async (_req: Request, res: Response) => {
    try {
      const result = await syncCommunityData();
      res.json({ message: "Sync successful", lastSync: result.lastSync });
    } catch (error: unknown) {
      console.error("Community sync error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Sync failed" });
    }
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
  // Genuine Vercel Cron is verified by CRON_SECRET bearer token. The previous
  // check trusted `x-vercel-cron-schedule` and a `vercel-cron/` user-agent,
  // both of which any client can set — that was an unauthenticated sync.
  app.get("/api/community/sync", (req, res, next) => {
    if (isCronRequest(req)) return runCommunitySync(req, res);
    return validateAdmin(req, res, next);
  });

  app.post("/api/community/sync", validateAdmin, runCommunitySync);

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

  // Assessment Analytics (Admin)
  app.get("/api/assessment-analytics", validateAdmin, async (req, res) => {
    try {
      const limit = Number(req.query.limit || 50);
      const offset = Number(req.query.offset || 0);
      const rows = await storage.listAssessmentAnalytics(limit, offset);
      const out = rows.map((row) => ({
        id: row.id,
        assessmentId: row.assessmentId,
        moduleId: row.moduleId,
        workshopId: row.workshopId ?? null,
        totalQuestions: row.totalQuestions,
        correctCount: row.correctCount,
        score: row.score,
        passed: row.passed === "true",
        completedAt: row.completedAt?.toISOString() ?? null,
      }));
      res.json(out);
    } catch (error) {
      console.error("/api/assessment-analytics failed:", error);
      res.status(500).json({ error: "Failed to load assessment analytics" });
    }
  });

  app.post("/api/assessment-analytics", async (req, res) => {
    try {
      // Rate limit: allow max 10 submissions per IP per minute
      const ip = req.ip || req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() || "unknown";
      const key = `ratelimit:analytics:${ip}`;
      const now = Date.now();
      const windowMs = 60 * 1000; // 1 minute
      const maxRequests = 10;

      const existing = (await storage.getSyncMetadata(key)) ?? "";
      const timestamps = existing ? JSON.parse(existing) : [];
      const recent = timestamps.filter((t: number) => now - t < windowMs);

      if (recent.length >= maxRequests) {
        return res.status(429).json({ error: "Too many requests. Please wait before submitting again." });
      }

      recent.push(now);
      await storage.setSyncMetadata(key, JSON.stringify(recent));

      const raw = req.body as Record<string, unknown>;
      const body = insertAssessmentAnalyticsSchema.parse({
        assessmentId: raw.assessmentId,
        moduleId: raw.moduleId,
        workshopId: raw.workshopId ?? undefined,
        totalQuestions: raw.totalQuestions,
        correctCount: raw.correctCount,
        score: raw.score,
        passed: raw.passed,
      });
      const created = await storage.createAssessmentAnalytics(body);
      res.status(201).json(created);
    } catch (error) {
      console.error("/api/assessment-analytics failed:", error);
      res.status(400).json({ error: "Invalid assessment analytics data" });
    }
  });

  app.delete("/api/assessment-analytics/:id", validateAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      await storage.deleteAssessmentAnalytics(id);
      res.json({ ok: true });
    } catch (error) {
      console.error("/api/assessment-analytics delete failed:", error);
      res.status(500).json({ error: "Failed to delete assessment analytics" });
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
      const answer = await generateOpenRouterAnswer(question, context);

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

  // Family access devices.
  //
  // Pairing, listing and revocation all require an existing valid token — a
  // family grows its device list from a token it already holds. The only
  // unauthenticated path is admin recovery, for when a family has lost every
  // token it held.

  /**
   * Which family does this token belong to? Lets a client adopt the family its
   * key actually unlocks instead of relying on a stored guess that may be for a
   * different family. Admin-protected routes aside, this is the one place a
   * familyId is derived from a credential rather than supplied by the caller.
   */
  app.get("/api/family/access/whoami", async (req, res) => {
    const auth = req.headers["authorization"];
    const token = typeof auth === "string" && auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Family access token required" });
    try {
      const [row] = await db
        .select({ familyId: familyAccess.familyId, label: familyAccess.label })
        .from(familyAccess)
        .where(eq(familyAccess.token, token))
        .limit(1);
      if (!row) return res.status(401).json({ error: "Invalid family access token" });
      res.json({ familyId: row.familyId, deviceLabel: row.label ?? "Unnamed device" });
    } catch (err) {
      console.error("/api/family/access/whoami failed:", err);
      res.status(500).json({ error: "Failed to resolve family" });
    }
  });

  /**
   * Bootstrap: create a brand-new family and return its first access key.
   *
   * Unauthenticated by design — a stranger installing the extension has no key
   * and no account, so there is no credential to check. The familyId is
   * generated server-side rather than accepted from the caller, which is what
   * stops anyone claiming an existing family's id. Each family is its own
   * private space, so creating one grants nothing over another.
   *
   * The abuse guard is a blunt instrument: an unauthenticated write on a public
   * API can otherwise fill the table. It caps how many families may be created
   * per hour. If that ever becomes a real constraint, reCAPTCHA (already used on
   * the contact form) is the proper answer.
   */
  app.post("/api/family/access/bootstrap", async (req, res) => {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recent = await db
        .select({ createdAt: familyAccess.createdAt })
        .from(familyAccess)
        .where(gte(familyAccess.createdAt, oneHourAgo));

      if (recent.length >= BOOTSTRAP_HOURLY_LIMIT) {
        console.warn(`family bootstrap rate limit hit: ${recent.length} in the last hour`);
        return res.status(429).json({
          error: "Too many families created recently. Try again later.",
        });
      }

      // 64 bits of entropy. Deliberately server-generated: a caller-supplied id
      // would let someone target an id that already exists.
      const familyId = `family-${randomBytes(8).toString("hex")}`;
      const token = generateFamilyToken();
      await db.insert(familyAccess).values({ familyId, token, label: "First device" });

      res.status(201).json({ familyId, token, deviceLabel: "First device" });
    } catch (err) {
      console.error("/api/family/access/bootstrap failed:", err);
      res.status(500).json({ error: "Failed to create a family" });
    }
  });

  /** Pair a new device: requires an existing token, mints another. */
  app.post("/api/family/access/pair", requireFamilyAccess, async (req, res) => {
    try {
      const familyId = await resolveFamilyId(req);
      if (!familyId) return res.status(400).json({ error: "familyId is required" });
      const body = z.object({ label: z.string().max(80).optional() }).safeParse(req.body ?? {});
      const token = generateFamilyToken();
      const [row] = await db
        .insert(familyAccess)
        .values({
          familyId,
          token,
          label: body.success ? (body.data.label ?? null) : null,
        })
        .returning();
      res.status(201).json({ familyId, token: row.token, label: row.label, createdAt: row.createdAt });
    } catch (err) {
      console.error("/api/family/access/pair failed:", err);
      res.status(500).json({ error: "Failed to pair device" });
    }
  });

  /** List this family's paired devices. Never returns the tokens themselves. */
  app.get("/api/family/access/devices", requireFamilyAccess, async (req, res) => {
    try {
      const familyId = await resolveFamilyId(req);
      if (!familyId) return res.status(400).json({ error: "familyId is required" });
      const rows = await db
        .select({
          token: familyAccess.token,
          label: familyAccess.label,
          createdAt: familyAccess.createdAt,
          lastUsedAt: familyAccess.lastUsedAt,
        })
        .from(familyAccess)
        .where(eq(familyAccess.familyId, familyId));
      // Mark which row is the caller so the UI can say "this device".
      const auth = req.headers["authorization"];
      const mine = typeof auth === "string" && auth.startsWith("Bearer ") ? auth.slice(7) : "";
      res.json(
        rows.map((r) => ({
          label: r.label ?? "Unnamed device",
          createdAt: r.createdAt,
          lastUsedAt: r.lastUsedAt,
          current: r.token === mine,
        })),
      );
    } catch (err) {
      console.error("/api/family/access/devices failed:", err);
      res.status(500).json({ error: "Failed to list devices" });
    }
  });

  /** Revoke one device by its token. */
  app.delete("/api/family/access/:token", requireFamilyAccess, async (req, res) => {
    try {
      const familyId = await resolveFamilyId(req);
      if (!familyId) return res.status(400).json({ error: "familyId is required" });
      const target = String(req.params.token || "");
      if (!target) return res.status(400).json({ error: "token is required" });
      const del = await db
        .delete(familyAccess)
        .where(and(eq(familyAccess.familyId, familyId), eq(familyAccess.token, target)))
        .returning({ token: familyAccess.token });
      if (del.length === 0) return res.status(404).json({ error: "Device not found" });
      res.json({ revoked: del.length });
    } catch (err) {
      console.error("/api/family/access revoke failed:", err);
      res.status(500).json({ error: "Failed to revoke device" });
    }
  });

  /** Admin-only recovery: reveal a family's tokens, or mint the first one. */
  app.get("/api/family/access", validateAdmin, async (req, res) => {
    try {
      const familyId = String(req.query.familyId || "");
      if (!familyId) return res.status(400).json({ error: "familyId is required" });
      const rows = await db
        .select({ token: familyAccess.token, label: familyAccess.label, createdAt: familyAccess.createdAt })
        .from(familyAccess)
        .where(eq(familyAccess.familyId, familyId));
      if (rows.length > 0) {
        return res.json({ familyId, devices: rows });
      }
      // No tokens yet — mint the first so the family can start using one.
      const token = generateFamilyToken();
      const [row] = await db.insert(familyAccess).values({ familyId, token, label: "Recovered" }).returning();
      res.json({ familyId, devices: [{ token: row.token, label: row.label, createdAt: row.createdAt }] });
    } catch (err) {
      console.error("/api/family/access failed:", err);
      res.status(500).json({ error: "Failed to resolve family access tokens" });
    }
  });

  // Family commitments: list by family
  // Shared validator for a commitment's enforcement rules. Nullable so
  // commitments created before rules existed stay valid, and null must keep
  // meaning "enforce nothing" (see shared/commitment-rules.ts).
  const commitmentRulesSchema = z
    .object({
      timezone: z.string().min(1),
      entries: z
        .array(
          z.object({
            domains: z.array(z.string().min(1)),
            windows: z.array(
              z.object({
                days: z.array(z.number().int().min(0).max(6)),
                start: z.string().regex(/^\d{1,2}:\d{2}$/),
                end: z.string().regex(/^\d{1,2}:\d{2}$/),
              }),
            ),
            appliesTo: z.array(z.string()),
            action: z.enum(["block", "remind"]),
          }),
        )
        .min(1),
    })
    .nullable();

  app.get("/api/family/commitments", requireFamilyAccess, async (req, res) => {
    try {
      // Never fall back to a default here — that would hand one family's
      // commitments to any valid token that omits familyId.
      const familyId = await resolveFamilyId(req);
      if (!familyId) return res.status(400).json({ error: "familyId is required" });
      const items = await storage.listFamilyCommitments(familyId);
      const decrypted = await Promise.all(
        items.map(async (item) => ({
          ...item,
          terms: await decryptField(item.terms),
          members: await decryptField(item.members),
          rules: item.rules ?? null,
        }))
      );
      res.json(decrypted);
    } catch (err) {
      console.error("/api/family/commitments failed:", err);
      res.status(500).json({ error: "Failed to fetch commitments" });
    }
  });

  app.get("/api/family/commitments/:id", requireFamilyAccess, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const item = await storage.getFamilyCommitment(id);
      if (!item) return res.status(404).json({ error: "Not found" });
      const milestones = await storage.listFamilyCommitmentMilestones(id);
      const [terms, members] = await Promise.all([
        decryptField(item.terms),
        decryptField(item.members),
      ]);
      res.json({ ...item, terms, members, milestones });
    } catch (err) {
      console.error("/api/family/commitments/:id failed:", err);
      res.status(500).json({ error: "Failed to fetch commitment" });
    }
  });

  app.post("/api/family/commitments", async (req, res) => {
    try {
      const body = z
        .object({
          familyId: z.string(),
          title: z.string(),
          terms: z.string(),
          members: z.string(),
          rules: commitmentRulesSchema.optional(),
        })
        .safeParse(req.body);
      if (!body.success) return res.status(400).json({ error: body.error.message });

      // Bootstrap gate. A family that already has a token must present it —
      // otherwise this endpoint would let anyone add commitments to any family.
      // A family with no token yet has nothing to protect, so its first
      // commitment is allowed and mints the token, returned once below.
      const existingTokens = await db
        .select({ token: familyAccess.token })
        .from(familyAccess)
        .where(eq(familyAccess.familyId, body.data.familyId));

      let mintedToken: string | null = null;
      if (existingTokens.length > 0) {
        const auth = req.headers["authorization"];
        const provided = typeof auth === "string" && auth.startsWith("Bearer ") ? auth.slice(7) : null;
        const ok =
          !!provided && existingTokens.some((row) => secretsMatch(provided, row.token));
        if (!ok) {
          return res.status(401).json({ error: "Invalid family access token" });
        }
      } else {
        mintedToken = generateFamilyToken();
        await db.insert(familyAccess).values({
          familyId: body.data.familyId,
          token: mintedToken,
          label: "First device",
        });
      }

      const [encTerms, encMembers] = await Promise.all([
        encryptField(body.data.terms),
        encryptField(body.data.members),
      ]);
      const created = await storage.createFamilyCommitment({
        familyId: body.data.familyId,
        title: body.data.title,
        terms: encTerms,
        members: encMembers,
        status: "pending",
        rules: body.data.rules ?? null,
      });

      const { writeLedger, pinCommitmentMetadata } = await import("./blockchain.js");
      const ledger = await writeLedger(created);
      const pin = await pinCommitmentMetadata(created);

      let metadataCid: string | null = null;
      if (pin && typeof pin === 'object' && 'cid' in pin) {
        const candidate = (pin as { cid?: unknown }).cid;
        metadataCid = typeof candidate === 'string' ? candidate : null;
      } else {
        metadataCid = null;
      }

      const updated = await storage.updateFamilyCommitment(created.id, {
        ledgerHash: ledger.txHash ? `ledger:${ledger.network || "local"}:${ledger.txHash}` : null,
        metadataCid,
      });

      // The token is returned exactly once, on the create that minted it. The
      // client stores it in the profile; there is no second chance to read it.
      res.status(201).json(
        mintedToken ? { ...(updated ?? created), familyAccessToken: mintedToken } : (updated ?? created),
      );
    } catch (err) {
      console.error("/api/family/commitments failed:", err);
      res.status(500).json({ error: "Failed to create commitment" });
    }
  });

  app.post("/api/family/commitments/:id/complete", requireFamilyAccess, async (req, res) => {
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

  app.post("/api/family/commitments/:id/milestones", requireFamilyAccess, async (req, res) => {
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

  /** Share the family's content packs with the extension (and the parent's apps). */
  app.get("/api/family/chapters", requireFamilyAccess, async (req, res) => {
    try {
      const familyId = await resolveFamilyId(req);
      if (!familyId) return res.status(400).json({ error: "familyId is required" });
      const packs = await storage.listFamilyContentPacks(familyId);
      res.json({
        familyId,
        packs: packs.map((p) => ({ ...p, memberIds: JSON.parse(p.memberIds ?? "[]") })),
      });
    } catch (err) {
      console.error("/api/family/chapters failed:", err);
      res.status(500).json({ error: "Failed to load content packs" });
    }
  });

  // Curated Content (admin-managed discussions and events)
  app.get("/api/admin/curated-content", validateAdmin, async (req, res) => {
    try {
      const items = await storage.listCuratedContent();
      res.json(items);
    } catch (err) {
      console.error("/api/admin/curated-content failed:", err);
      res.status(500).json({ error: "Failed to fetch curated content" });
    }
  });

  app.post("/api/admin/curated-content", validateAdmin, async (req, res) => {
    try {
      const body = insertCuratedContentSchema.safeParse(req.body);
      if (!body.success) return res.status(400).json({ error: body.error.message });
      const created = await storage.createCuratedContent(body.data);
      res.status(201).json(created);
    } catch (err) {
      console.error("/api/admin/curated-content POST failed:", err);
      res.status(500).json({ error: "Failed to create curated content" });
    }
  });

  app.patch("/api/admin/curated-content/:id", validateAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const body = insertCuratedContentSchema.partial().safeParse(req.body);
      if (!body.success) return res.status(400).json({ error: body.error.message });
      const updated = await storage.updateCuratedContent(id, body.data);
      res.json(updated);
    } catch (err) {
      console.error("/api/admin/curated-content/:id PATCH failed:", err);
      res.status(500).json({ error: "Failed to update curated content" });
    }
  });

  app.delete("/api/admin/curated-content/:id", validateAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      await storage.deleteCuratedContent(id);
      res.json({ success: true });
    } catch (err) {
      console.error("/api/admin/curated-content/:id DELETE failed:", err);
      res.status(500).json({ error: "Failed to delete curated content" });
    }
  });

  // Stories (public submit, admin manage)
  app.post("/api/stories", async (req, res) => {
    try {
      const body = insertStorySchema.safeParse(req.body);
      if (!body.success) return res.status(400).json({ error: body.error.message });
      const created = await storage.createStory(body.data);
      res.status(201).json(created);
    } catch (err) {
      console.error("/api/stories POST failed:", err);
      res.status(500).json({ error: "Failed to create story" });
    }
  });

  app.get("/api/stories", async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      const stories = await storage.getStories();
      const filtered = status ? stories.filter(s => s.status === status) : stories;
      res.json(filtered);
    } catch (err) {
      console.error("/api/stories GET failed:", err);
      res.status(500).json({ error: "Failed to fetch stories" });
    }
  });

  app.get("/api/admin/stories", validateAdmin, async (_req, res) => {
    try {
      const stories = await storage.getStories();
      res.json(stories);
    } catch (err) {
      console.error("/api/admin/stories failed:", err);
      res.status(500).json({ error: "Failed to fetch stories" });
    }
  });

  app.patch("/api/admin/stories/:id", validateAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const body = z.object({ status: z.string() }).safeParse(req.body);
      if (!body.success) return res.status(400).json({ error: body.error.message });
      const updated = await storage.updateStoryStatus(id, body.data.status);
      res.json(updated);
    } catch (err) {
      console.error("/api/admin/stories/:id PATCH failed:", err);
      res.status(500).json({ error: "Failed to update story" });
    }
  });
}
