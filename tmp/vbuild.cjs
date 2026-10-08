"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc2) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc(from, key)) || desc2.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server/blockchain.ts
var blockchain_exports = {};
__export(blockchain_exports, {
  pinCommitmentMetadata: () => pinCommitmentMetadata,
  writeLedger: () => writeLedger
});
function sha256(input) {
  const data = new TextEncoder().encode(input);
  return crypto.subtle.digest("SHA-256", data).then((buf) => {
    const bytes = new Uint8Array(buf);
    return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  });
}
async function pinCommitmentMetadata(commitment) {
  if (!PINATA_JWT) return pinLocalOnly(commitment);
  try {
    const payload = {
      id: commitment.id,
      familyId: commitment.familyId,
      title: commitment.title,
      terms: commitment.terms,
      members: commitment.members,
      status: commitment.status,
      startedAt: commitment.startedAt instanceof Date ? commitment.startedAt.toISOString() : commitment.startedAt
    };
    const res = await fetch(PINATA_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ pinataContent: payload, pinataMetadata: { name: `commitment-${commitment.id}.json` } })
    });
    if (!res.ok) throw new Error(`Pinata failed: ${res.status}`);
    const json = await res.json();
    return { cid: json.IpfsHash, metadata: payload };
  } catch {
    return pinLocalOnly(commitment);
  }
}
async function pinLocalOnly(commitment) {
  const payload = JSON.stringify({
    id: commitment.id,
    familyId: commitment.familyId,
    title: commitment.title,
    status: commitment.status
  });
  const hash = await sha256(`${commitment.familyId}-${commitment.title}-${commitment.terms}-${commitment.startedAt}`);
  return { cid: `local:sha256:${hash}`, metadata: { sha256: hash } };
}
async function writeLedger(commitment) {
  if (process.env.LEDGER_NETWORK === "simulated") {
    const hash = await sha256(`${commitment.familyId}-${commitment.id}-${Date.now()}`);
    return { txHash: hash, network: "local-ledger" };
  }
  return {};
}
var PINATA_API_URL, PINATA_JWT;
var init_blockchain = __esm({
  "server/blockchain.ts"() {
    "use strict";
    PINATA_API_URL = "https://api.pinata.cloud/pinning/pinJSONToIPFS";
    PINATA_JWT = process.env.PINATA_JWT;
  }
});

// api/index.ts
var index_exports = {};
__export(index_exports, {
  default: () => index_default
});
module.exports = __toCommonJS(index_exports);

// server/index.ts
var import_express = __toESM(require("express"), 1);

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  assessmentAnalytics: () => assessmentAnalytics,
  communityEvents: () => communityEvents,
  contactMessages: () => contactMessages,
  curatedContent: () => curatedContent,
  familyCommitmentMilestones: () => familyCommitmentMilestones,
  familyCommitments: () => familyCommitments,
  faqChunks: () => faqChunks,
  insertAssessmentAnalyticsSchema: () => insertAssessmentAnalyticsSchema,
  insertCuratedContentSchema: () => insertCuratedContentSchema,
  insertDiscussionSchema: () => insertDiscussionSchema,
  insertEventSchema: () => insertEventSchema,
  insertFamilyCommitmentSchema: () => insertFamilyCommitmentSchema,
  insertFamilyMilestoneSchema: () => insertFamilyMilestoneSchema,
  insertFaqChunkSchema: () => insertFaqChunkSchema,
  insertMentorApplicationSchema: () => insertMentorApplicationSchema,
  insertMessageSchema: () => insertMessageSchema,
  insertSiteClaimSchema: () => insertSiteClaimSchema,
  insertStorySchema: () => insertStorySchema,
  mentorApplications: () => mentorApplications,
  siteClaims: () => siteClaims,
  stories: () => stories,
  syncMetadata: () => syncMetadata,
  trendingDiscussions: () => trendingDiscussions
});
var import_pg_core = require("drizzle-orm/pg-core");
var import_drizzle_zod = require("drizzle-zod");
var contactMessages = (0, import_pg_core.pgTable)("contact_messages", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  name: (0, import_pg_core.text)("name").notNull(),
  email: (0, import_pg_core.text)("email").notNull(),
  message: (0, import_pg_core.text)("message").notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var mentorApplications = (0, import_pg_core.pgTable)("mentor_applications", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  name: (0, import_pg_core.text)("name").notNull(),
  email: (0, import_pg_core.text)("email").notNull(),
  specialty: (0, import_pg_core.text)("specialty").notNull(),
  bio: (0, import_pg_core.text)("bio").notNull(),
  status: (0, import_pg_core.text)("status").default("pending"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var communityEvents = (0, import_pg_core.pgTable)("community_events", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  title: (0, import_pg_core.text)("title").notNull(),
  location: (0, import_pg_core.text)("location").notNull(),
  date: (0, import_pg_core.text)("date").notNull(),
  time: (0, import_pg_core.text)("time").notNull(),
  type: (0, import_pg_core.text)("type").notNull(),
  url: (0, import_pg_core.text)("url").notNull(),
  organizer: (0, import_pg_core.text)("organizer").notNull(),
  status: (0, import_pg_core.text)("status").notNull(),
  description: (0, import_pg_core.text)("description").notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var trendingDiscussions = (0, import_pg_core.pgTable)("trending_discussions", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  platform: (0, import_pg_core.text)("platform").notNull(),
  community: (0, import_pg_core.text)("community").notNull(),
  title: (0, import_pg_core.text)("title").notNull(),
  url: (0, import_pg_core.text)("url").notNull(),
  hotness: (0, import_pg_core.text)("hotness").notNull(),
  replies: (0, import_pg_core.text)("replies").notNull(),
  postedAt: (0, import_pg_core.text)("posted_at").notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var syncMetadata = (0, import_pg_core.pgTable)("sync_metadata", {
  key: (0, import_pg_core.text)("key").primaryKey(),
  value: (0, import_pg_core.text)("value").notNull(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").notNull()
});
var siteClaims = (0, import_pg_core.pgTable)("site_claims", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  slug: (0, import_pg_core.text)("slug").notNull().unique(),
  value: (0, import_pg_core.text)("value").notNull(),
  label: (0, import_pg_core.text)("label").notNull(),
  context: (0, import_pg_core.text)("context").notNull().default(""),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").notNull().defaultNow()
});
var insertSiteClaimSchema = (0, import_drizzle_zod.createInsertSchema)(siteClaims).omit({ id: true, updatedAt: true });
var faqChunks = (0, import_pg_core.pgTable)("faq_chunks", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  title: (0, import_pg_core.text)("title").notNull(),
  content: (0, import_pg_core.text)("content").notNull(),
  category: (0, import_pg_core.text)("category").notNull()
});
var familyCommitments = (0, import_pg_core.pgTable)("family_commitments", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  familyId: (0, import_pg_core.text)("family_id").notNull(),
  title: (0, import_pg_core.text)("title").notNull(),
  terms: (0, import_pg_core.text)("terms").notNull(),
  members: (0, import_pg_core.text)("members").notNull(),
  status: (0, import_pg_core.text)("status").notNull().default("pending"),
  ledgerHash: (0, import_pg_core.text)("ledger_hash"),
  metadataCid: (0, import_pg_core.text)("metadata_cid"),
  startedAt: (0, import_pg_core.timestamp)("started_at").defaultNow(),
  completedAt: (0, import_pg_core.timestamp)("completed_at")
});
var familyCommitmentMilestones = (0, import_pg_core.pgTable)("family_commitment_milestones", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  commitmentId: (0, import_pg_core.serial)("commitment_id").references(() => familyCommitments.id),
  label: (0, import_pg_core.text)("label").notNull(),
  targetDate: (0, import_pg_core.text)("target_date"),
  completedAt: (0, import_pg_core.timestamp)("completed_at")
});
var assessmentAnalytics = (0, import_pg_core.pgTable)("assessment_analytics", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  assessmentId: (0, import_pg_core.text)("assessment_id").notNull(),
  moduleId: (0, import_pg_core.text)("module_id").notNull(),
  workshopId: (0, import_pg_core.text)("workshop_id"),
  totalQuestions: (0, import_pg_core.integer)("total_questions").notNull(),
  correctCount: (0, import_pg_core.integer)("correct_count").notNull(),
  score: (0, import_pg_core.integer)("score").notNull(),
  passed: (0, import_pg_core.text)("passed").notNull(),
  completedAt: (0, import_pg_core.timestamp)("completed_at").defaultNow()
});
var insertAssessmentAnalyticsSchema = (0, import_drizzle_zod.createInsertSchema)(assessmentAnalytics).omit({
  id: true,
  completedAt: true
});
var curatedContent = (0, import_pg_core.pgTable)("curated_content", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  type: (0, import_pg_core.text)("type").notNull(),
  // "discussion" | "event"
  title: (0, import_pg_core.text)("title").notNull(),
  url: (0, import_pg_core.text)("url"),
  description: (0, import_pg_core.text)("description"),
  platform: (0, import_pg_core.text)("platform"),
  community: (0, import_pg_core.text)("community"),
  hotness: (0, import_pg_core.text)("hotness"),
  postedAt: (0, import_pg_core.text)("posted_at"),
  isActive: (0, import_pg_core.boolean)("is_active").default(true),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var insertCuratedContentSchema = (0, import_drizzle_zod.createInsertSchema)(curatedContent);
var stories = (0, import_pg_core.pgTable)("stories", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  name: (0, import_pg_core.text)("name").notNull(),
  message: (0, import_pg_core.text)("message").notNull(),
  workshops: (0, import_pg_core.text)("workshops").notNull().default(""),
  status: (0, import_pg_core.text)("status").notNull().default("pending"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var insertStorySchema = (0, import_drizzle_zod.createInsertSchema)(stories).omit({ id: true, createdAt: true });
var insertMessageSchema = (0, import_drizzle_zod.createInsertSchema)(contactMessages);
var insertMentorApplicationSchema = (0, import_drizzle_zod.createInsertSchema)(mentorApplications);
var insertEventSchema = (0, import_drizzle_zod.createInsertSchema)(communityEvents);
var insertDiscussionSchema = (0, import_drizzle_zod.createInsertSchema)(trendingDiscussions);
var insertFaqChunkSchema = (0, import_drizzle_zod.createInsertSchema)(faqChunks);
var insertFamilyCommitmentSchema = (0, import_drizzle_zod.createInsertSchema)(familyCommitments);
var insertFamilyMilestoneSchema = (0, import_drizzle_zod.createInsertSchema)(familyCommitmentMilestones);

// server/db.ts
var import_serverless = require("@neondatabase/serverless");
var import_neon_http = require("drizzle-orm/neon-http");
var import_fs = require("fs");
var import_path = require("path");
try {
  const envPath = (0, import_path.join)(process.cwd(), ".env");
  if ((0, import_fs.existsSync)(envPath)) {
    const text2 = (0, import_fs.readFileSync)(envPath, "utf8");
    for (const rawLine of text2.split("\n")) {
      const line = rawLine.trim().replace(/\r$/, "");
      if (!line || line.startsWith("#")) continue;
      const eq3 = line.indexOf("=");
      if (eq3 <= 0) continue;
      const key = line.slice(0, eq3).trim();
      const value = line.slice(eq3 + 1).trim().replace(/^['"]|['"]$/g, "");
      if (key && !(key in process.env)) process.env[key] = value;
    }
  }
} catch {
}
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Follow instructions in README.md to setup your database."
  );
}
var sql = (0, import_serverless.neon)(process.env.DATABASE_URL);
var db = (0, import_neon_http.drizzle)(sql, { schema: schema_exports });

// server/storage.ts
var import_drizzle_orm = require("drizzle-orm");
var DatabaseStorage = class {
  async createMessage(insertMessage) {
    const [message] = await db.insert(contactMessages).values(insertMessage).returning();
    return message;
  }
  async getMessages() {
    return await db.select().from(contactMessages).orderBy((0, import_drizzle_orm.desc)(contactMessages.createdAt));
  }
  async createMentorApplication(insertApp) {
    const [app2] = await db.insert(mentorApplications).values(insertApp).returning();
    return app2;
  }
  async getMentorApplications() {
    return await db.select().from(mentorApplications).orderBy((0, import_drizzle_orm.desc)(mentorApplications.createdAt));
  }
  async updateMentorApplicationStatus(id, status) {
    const [app2] = await db.update(mentorApplications).set({ status }).where((0, import_drizzle_orm.eq)(mentorApplications.id, id)).returning();
    return app2;
  }
  async getEvents() {
    return await db.select().from(communityEvents).orderBy(communityEvents.date);
  }
  async setEvents(events) {
    await db.delete(communityEvents);
    if (events.length > 0) {
      for (let i = 0; i < events.length; i += 10) {
        await db.insert(communityEvents).values(events.slice(i, i + 10));
      }
    }
  }
  async getDiscussions() {
    return await db.select().from(trendingDiscussions).orderBy((0, import_drizzle_orm.desc)(trendingDiscussions.createdAt));
  }
  async setDiscussions(discussions) {
    await db.delete(trendingDiscussions);
    if (discussions.length > 0) {
      await db.insert(trendingDiscussions).values(discussions);
    }
  }
  async getSyncMetadata(key) {
    const [row] = await db.select({ value: syncMetadata.value }).from(syncMetadata).where((0, import_drizzle_orm.eq)(syncMetadata.key, key)).limit(1);
    return row?.value ?? null;
  }
  async setSyncMetadata(key, value) {
    const now = /* @__PURE__ */ new Date();
    await db.insert(syncMetadata).values({ key, value, updatedAt: now }).onConflictDoUpdate({
      target: syncMetadata.key,
      set: { value, updatedAt: now }
    });
  }
  async listClaims() {
    return await db.select().from(siteClaims).orderBy(siteClaims.slug);
  }
  async upsertClaim(insert) {
    const [row] = await db.insert(siteClaims).values(insert).onConflictDoUpdate({ target: siteClaims.slug, set: insert }).returning();
    return row;
  }
  async deleteClaim(id) {
    await db.delete(siteClaims).where((0, import_drizzle_orm.eq)(siteClaims.id, id));
  }
  async listFamilyCommitments(familyId) {
    return await db.select().from(familyCommitments).where((0, import_drizzle_orm.eq)(familyCommitments.familyId, familyId));
  }
  async getFamilyCommitment(id) {
    const [row] = await db.select().from(familyCommitments).where((0, import_drizzle_orm.eq)(familyCommitments.id, id)).limit(1);
    return row ?? null;
  }
  async createFamilyCommitment(insert) {
    const [row] = await db.insert(familyCommitments).values(insert).returning();
    return row;
  }
  async updateFamilyCommitment(id, patch) {
    const [row] = await db.update(familyCommitments).set(patch).where((0, import_drizzle_orm.eq)(familyCommitments.id, id)).returning();
    return row ?? null;
  }
  async listFamilyCommitmentMilestones(commitmentId) {
    return await db.select().from(familyCommitmentMilestones).where((0, import_drizzle_orm.eq)(familyCommitmentMilestones.commitmentId, commitmentId));
  }
  async createAssessmentAnalytics(insert) {
    const [row] = await db.insert(assessmentAnalytics).values(insert).returning();
    return row;
  }
  async listAssessmentAnalytics(limit = 50, offset = 0) {
    return await db.select().from(assessmentAnalytics).orderBy((0, import_drizzle_orm.desc)(assessmentAnalytics.completedAt)).limit(limit).offset(offset);
  }
  async getAssessmentAnalyticsById(id) {
    const [row] = await db.select().from(assessmentAnalytics).where((0, import_drizzle_orm.eq)(assessmentAnalytics.id, id)).limit(1);
    return row ?? null;
  }
  async deleteAssessmentAnalytics(id) {
    await db.delete(assessmentAnalytics).where((0, import_drizzle_orm.eq)(assessmentAnalytics.id, id));
  }
  async createStory(insert) {
    const [row] = await db.insert(stories).values(insert).returning();
    return row;
  }
  async getStories() {
    return await db.select().from(stories).orderBy((0, import_drizzle_orm.desc)(stories.createdAt));
  }
  async updateStoryStatus(id, status) {
    const [row] = await db.update(stories).set({ status }).where((0, import_drizzle_orm.eq)(stories.id, id)).returning();
    if (!row) throw new Error(`Story with ID ${id} not found`);
    return row;
  }
  // Curated Content
  async createCuratedContent(item) {
    const [row] = await db.insert(curatedContent).values(item).returning();
    return row;
  }
  async listCuratedContent() {
    return db.select().from(curatedContent).orderBy((0, import_drizzle_orm.desc)(curatedContent.createdAt));
  }
  async updateCuratedContent(id, updates) {
    const [row] = await db.update(curatedContent).set(updates).where((0, import_drizzle_orm.eq)(curatedContent.id, id)).returning();
    if (!row) throw new Error(`Curated content ${id} not found`);
    return row;
  }
  async deleteCuratedContent(id) {
    await db.delete(curatedContent).where((0, import_drizzle_orm.eq)(curatedContent.id, id));
  }
};
var storage = new DatabaseStorage();

// server/community-sync.ts
var import_axios = __toESM(require("axios"), 1);
var import_rss_parser = __toESM(require("rss-parser"), 1);
function toText(v) {
  return typeof v === "number" ? String(v) : String(v ?? "");
}
var rssParser = new import_rss_parser.default();
var RSS_FEEDS = [
  { platform: "Family Online Safety Institute", community: "Online Safety", url: "https://www.fosi.org/feed/" },
  { platform: "Safer Internet", community: "Youth Safety", url: "https://www.saferinternet.org.uk/feed" },
  { platform: "Internet Matters", community: "Family Media", url: "https://www.internetmatters.org/feed/" },
  { platform: "ChildNet", community: "Youth Safety", url: "https://www.childnet.com/blog/rss" },
  { platform: "Get Safe Online", community: "Online Safety", url: "https://www.getsafeonline.org/feed/" }
];
var EXTRA_RSS_RAW = String(process.env.COMM_RSS_FEEDS || "").trim();
var EXTRA_RSS_FEEDS = EXTRA_RSS_RAW.split(",").map((s) => s.trim()).filter(Boolean).map((part) => {
  const [platform, community, url] = part.split("|");
  return { platform: platform || "Custom", community: community || "General", url: url || "" };
}).filter((f) => f.url);
var ALL_RSS_FEEDS = [...RSS_FEEDS, ...EXTRA_RSS_FEEDS];
var CURATED_EVENTS = [
  {
    title: "ISTE 2026",
    location: "San Antonio, TX",
    date: "2026-07-01",
    time: "3 Days",
    type: "Conference",
    url: "https://www.iste.org/conference",
    organizer: "International Society for Technology in Education",
    status: "Registration Open",
    description: "The premier edtech event with major focus on AI safety, digital citizenship, and responsible tech integration in schools."
  },
  {
    title: "Digital Citizenship Summit 2026",
    location: "Chicago, IL / Hybrid",
    date: "2026-08-15",
    time: "9:00 AM CST",
    type: "Summit",
    url: "https://www.digitalcitizenshipsummit.org/",
    organizer: "Digital Citizenship Institute",
    status: "Upcoming",
    description: "Annual gathering of educators, parents, and policymakers tackling online safety, media literacy, and ethical tech use."
  },
  {
    title: "Family Tech Safety Week 2026",
    location: "Online / Global",
    date: "2026-09-10",
    time: "Week-Long",
    type: "Global Action",
    url: "https://www.staysafeonline.org/",
    organizer: "National Cybersecurity Alliance",
    status: "Annual Event",
    description: "A global week of workshops, webinars, and family challenges focused on building healthier digital habits at home."
  }
];
var FALLBACK_DISCUSSIONS = [
  {
    platform: "Reddit",
    community: "r/parenting",
    title: "Community debate: At what age did you give your child their first smartphone?",
    url: "https://www.reddit.com/r/parenting/search/?q=first+smartphone+age&restrict_sr=1",
    hotness: "High",
    postedAt: "1h ago",
    replies: toText(842)
  }
];
var CITIES = [
  "Sydney",
  "Singapore",
  "Toronto",
  "London",
  "New York",
  "Berlin",
  "Tokyo",
  "San Francisco",
  "Austin",
  "Melbourne",
  "Dubai",
  "Paris"
];
var EVENT_TYPES = ["Meetup", "Workshop", "Seminar", "Webinar"];
function generateLocalEvents() {
  const localEvents = [];
  const baseDate = /* @__PURE__ */ new Date();
  for (let i = 0; i < 15; i++) {
    const city = CITIES[Math.floor(Math.random() * CITIES.length)];
    const type = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + i * 7 + Math.floor(Math.random() * 5));
    localEvents.push({
      title: `Digital Wellness ${type}: ${city} Chapter`,
      location: type === "Webinar" ? "Online / Global" : `${city}, Community Center`,
      date: date.toISOString().split("T")[0],
      time: "6:00 PM Local",
      type,
      url: "https://www.meetup.com/topics/digital-wellness/",
      organizer: "Digital Wellness Community Volunteers",
      status: "Scheduled",
      description: `A local ${type.toLowerCase()} for families to share experiences and learn practical digital safety tips.`
    });
  }
  return localEvents;
}
async function fetchRSSNews() {
  try {
    const feedPromises = ALL_RSS_FEEDS.map(async (feedInfo) => {
      try {
        const feed = await rssParser.parseURL(feedInfo.url);
        return feed.items.slice(0, 3).map((item) => ({
          platform: feedInfo.platform,
          community: feedInfo.community,
          title: item.title || "Untitled Article",
          url: item.link || "#",
          hotness: "Trending",
          replies: toText(Math.floor(Math.random() * 50) + 10),
          postedAt: item.pubDate ? new Date(item.pubDate).toLocaleDateString() : "Recent"
        }));
      } catch (err) {
        console.error(`Failed to fetch RSS from ${feedInfo.platform}:`, err);
        return [];
      }
    });
    const results = await Promise.all(feedPromises);
    return results.flat();
  } catch (error) {
    console.error("RSS Fetch error:", error);
    return [];
  }
}
async function syncCommunityData() {
  console.log("Starting data synchronization...");
  const liveEvents = await fetchLiveEventsFromSerp();
  const rssEvents = await fetchRSSEvents();
  const withTitles = (events) => events.filter((e) => Boolean(e?.title));
  const allEvents = withTitles(liveEvents || []);
  const allRSSEvents = withTitles(rssEvents || []);
  const uniqueEvents = Array.from(new Map([
    ...allEvents.map((e) => [`${e.url ?? ""}-${e.title}`, e]),
    ...allRSSEvents.map((e) => [`${e.url ?? ""}-${e.title}`, e])
  ]).values()).slice(0, 25);
  const sourceEvents = uniqueEvents.length > 0 ? uniqueEvents : CURATED_EVENTS;
  const [liveReddit, liveRSS] = await Promise.all([
    getLiveRedditTrends(),
    fetchRSSNews()
  ]);
  let combinedDiscussions = [...liveRSS];
  if (liveReddit) combinedDiscussions = [...liveReddit, ...combinedDiscussions];
  const finalDiscussions = combinedDiscussions.length > 0 ? combinedDiscussions.slice(0, 12) : FALLBACK_DISCUSSIONS;
  await storage.setEvents(sourceEvents);
  await storage.setDiscussions(finalDiscussions);
  const lastSync = (/* @__PURE__ */ new Date()).toISOString();
  await storage.setSyncMetadata("last_sync", lastSync);
  console.log(`Sync complete: ${sourceEvents.length} events, ${finalDiscussions.length} discussions.`);
  return { lastSync };
}
async function getRedditAccessToken() {
  const { REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET } = process.env;
  if (!REDDIT_CLIENT_ID || !REDDIT_CLIENT_SECRET) return null;
  try {
    const auth = Buffer.from(`${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`).toString("base64");
    const response = await import_axios.default.post(
      "https://www.reddit.com/api/v1/access_token",
      "grant_type=client_credentials",
      {
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": process.env.REDDIT_USER_AGENT || "DigitalGuardApp/1.0.0"
        }
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error("Failed to get Reddit access token:", error);
    return null;
  }
}
async function fetchRedditSubredditHot(subreddit, token) {
  try {
    const response = await import_axios.default.get(`https://oauth.reddit.com/r/${subreddit}/hot`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "User-Agent": process.env.REDDIT_USER_AGENT || "DigitalGuardApp/1.0.0"
      },
      params: { limit: 5 }
    });
    return response.data.data.children.map((child) => {
      const post = child.data;
      return {
        platform: "Reddit",
        community: `r/${subreddit}`,
        title: post.title,
        url: `https://reddit.com${post.permalink}`,
        hotness: post.score > 500 ? "Critical" : post.score > 100 ? "High" : "Trending",
        replies: post.num_comments,
        postedAt: `${Math.floor((Date.now() / 1e3 - post.created_utc) / 3600)}h ago`
      };
    });
  } catch (error) {
    console.error(`Failed to fetch r/${subreddit}:`, error);
    return [];
  }
}
async function getLiveRedditTrends() {
  const token = await getRedditAccessToken();
  if (!token) return null;
  const subreddits = ["parenting", "cybersecurity", "privacy", "digitalwellness", "ScreenTime"];
  const results = await Promise.all(subreddits.map((sub) => fetchRedditSubredditHot(sub, token)));
  return results.flat().sort((a, b) => (b.replies || 0) - (a.replies || 0)).slice(0, 10);
}
async function fetchLiveEventsFromSerp() {
  const apiKey = process.env.SERP_API_KEY;
  if (!apiKey) {
    console.log("SERP_API_KEY missing, skipping live event fetch.");
    return null;
  }
  try {
    const queries = [
      '"digital wellness" conference 2026',
      '"online safety" workshop 2026',
      '"digital citizenship" summit 2026',
      '"family tech" safety week 2026',
      'digital parenting "workshop" OR "seminar" 2026'
    ];
    const results = await Promise.all(queries.map(
      (q) => import_axios.default.get("https://serpapi.com/search.json", {
        params: {
          engine: "google_search",
          q,
          api_key: apiKey,
          hl: "en",
          gl: "us"
        }
      })
    ));
    const events = results.flatMap((r) => r.data.organic_results || []).map((e) => ({
      title: e.title,
      location: "See listing for details",
      date: "2026",
      time: "See listing",
      type: "Community Event",
      url: e.link || `https://www.google.com/search?q=${encodeURIComponent(e.title)}`,
      organizer: "Community Partner",
      status: "Live Discovery",
      description: e.snippet || "Interactive session covering modern digital risks and family safety strategies."
    }));
    const uniqueEvents = Array.from(new Map(events.map((item) => [item["title"], item])).values());
    return uniqueEvents.length > 0 ? uniqueEvents.slice(0, 25) : null;
  } catch (error) {
    console.error("Failed to fetch events from SerpApi:", error);
    return null;
  }
}
var EVENT_KEYWORDS = ["conference", "workshop", "webinar", "seminar", "summit", "meetup", "event", "training", "bootcamp", "symposium"];
function isEventItem(item) {
  const title = (item?.title || "").toLowerCase();
  const description = (item?.description || "").toLowerCase();
  const content = (item?.content || "").toLowerCase();
  const datePatterns = /\d{4}-\d{2}-\d{2}|2026|2027|january|february|march|april|may|june|july|august|september|october|november|december/i;
  return EVENT_KEYWORDS.some((k) => title.includes(k) || description.includes(k) || content.includes(k)) || datePatterns.test(title + description + content);
}
async function fetchRSSEvents() {
  try {
    const events = [];
    for (const feedInfo of ALL_RSS_FEEDS) {
      try {
        const feed = await rssParser.parseURL(feedInfo.url);
        for (const item of feed.items) {
          const title = (item.title || "").toLowerCase();
          const description = (item.description || "").toLowerCase();
          const content = (item.content || "").toLowerCase();
          const isEvent = isEventItem(item);
          if (isEvent) {
            const existing = events.find((e) => `${e.url}-${e.title}` === `${item.link || ""}-${item.title}`);
            if (!existing) {
              events.push({
                platform: feedInfo.platform,
                community: feedInfo.community,
                title: item.title || "Untitled Event",
                url: item.link || "#",
                location: "Online",
                // Estimate from content
                date: item.pubDate ? new Date(item.pubDate).toLocaleDateString() : "Upcoming",
                type: "Event",
                hotness: "Trending",
                replies: 0,
                postedAt: item.pubDate ? new Date(item.pubDate).toLocaleDateString() : "Recent"
              });
            }
          }
          if (events.length >= 10) break;
        }
        if (events.length >= 10) break;
      } catch (err) {
        console.error(`Failed to parse RSS from ${feedInfo.platform}:`, err);
      }
    }
    return events;
  } catch (error) {
    console.error("RSS event fetch error:", error);
    return [];
  }
}

// server/routes.ts
var import_axios3 = __toESM(require("axios"), 1);
var import_zod = require("zod");

// server/faq.ts
var import_axios2 = __toESM(require("axios"), 1);
var import_drizzle_orm2 = require("drizzle-orm");
function simpleTfIdfScore(query, text2) {
  const qTerms = query.toLowerCase().split(/\W+/).filter(Boolean);
  const tLower = text2.toLowerCase();
  let score = 0;
  for (const term of qTerms) {
    if (tLower.includes(term)) score += 1;
  }
  return score;
}
async function searchFaqChunks(query, topK = 3) {
  const rows = await db.select().from(faqChunks);
  const scored = rows.map((r) => ({
    ...r,
    score: simpleTfIdfScore(query, `${r.title} ${r.content} ${r.category}`)
  })).sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}
async function generateOpenRouterAnswer(question, context) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const endpoint = process.env.OPENROUTER_ENDPOINT || "https://openrouter.ai/api/v1/chat/completions";
  const model = process.env.OPENROUTER_MODEL || "google/gemma-4-26b-a4b-it:free";
  if (!apiKey) {
    return context.split("\n\n")[0]?.replace(/\[.*?\]\s*/g, "") || "I couldn't find a specific answer.";
  }
  try {
    const response = await import_axios2.default.post(
      endpoint,
      {
        model,
        messages: [
          {
            role: "system",
            content: "You are a family digital wellness advisor. Prefer the provided context when relevant. If the question is about digital wellness, screen time, online safety, parenting with technology, mental health and device use, or closely related topics, answer helpfully from general digital wellness knowledge. If it is unrelated, decline politely and suggest a related topic like digital safety, screen-time agreements, breathing exercises, or the Cyber-Safe Quiz. Keep answers under 120 words, practical, warm, and never invent statistics."
          },
          {
            role: "user",
            content: `Question: ${question}

Context:
${context}`
          }
        ],
        max_tokens: 220,
        temperature: 0.3
      },
      { headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" } }
    );
    const data = response.data;
    const text2 = data?.choices?.[0]?.message?.content;
    if (typeof text2 === "string" && text2.trim()) return text2.trim();
  } catch (err) {
    console.error("OpenRouter FAQ generation failed:", err instanceof Error ? err.message : String(err));
  }
  return context.split("\n\n")[0]?.replace(/\[.*?\]\s*/g, "") || "I don't have enough information to answer that. Try asking about digital safety, screen-time agreements, breathing exercises, or the Cyber-Safe Quiz.";
}

// server/crypto.ts
var import_node_crypto = require("node:crypto");
var ALGORITHM = "AES-GCM";
var IV_LENGTH = 12;
var KEY_LENGTH = 32;
async function getKey() {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex || hex.length !== KEY_LENGTH * 2) return null;
  const bytes = new Uint8Array(KEY_LENGTH);
  for (let i = 0; i < KEY_LENGTH; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return import_node_crypto.webcrypto.subtle.importKey("raw", bytes, ALGORITHM, false, ["encrypt", "decrypt"]);
}
async function encryptField(plaintext) {
  const key = await getKey();
  if (!key) return plaintext;
  const iv = import_node_crypto.webcrypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const data = new TextEncoder().encode(plaintext);
  const ciphertext = await import_node_crypto.webcrypto.subtle.encrypt({ name: ALGORITHM, iv }, key, data);
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);
  let binary = "";
  for (let i = 0; i < combined.length; i++) binary += String.fromCharCode(combined[i]);
  return btoa(binary);
}
async function decryptField(encrypted) {
  const key = await getKey();
  if (!key) return encrypted;
  try {
    const combined = Uint8Array.from(atob(encrypted), (c) => c.charCodeAt(0));
    if (combined.length < IV_LENGTH + 1) return encrypted;
    const iv = combined.slice(0, IV_LENGTH);
    const ciphertext = combined.slice(IV_LENGTH);
    const data = await import_node_crypto.webcrypto.subtle.decrypt({ name: ALGORITHM, iv }, key, ciphertext);
    return new TextDecoder().decode(data);
  } catch {
    return encrypted;
  }
}

// server/routes.ts
async function verifyRecaptcha(token) {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    console.warn("RECAPTCHA_SECRET_KEY not set, skipping verification");
    return { success: true };
  }
  try {
    const params = new URLSearchParams();
    params.append("secret", secret);
    params.append("response", token);
    const response = await import_axios3.default.post(
      "https://www.google.com/recaptcha/api/siteverify",
      params.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );
    if (!response.data.success) {
      console.error("reCAPTCHA Verification Failed:");
      console.error("  Google API Response:", response.data);
      console.error("  Error Codes:", response.data["error-codes"]);
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
function activeUsersCount() {
  const hour = (/* @__PURE__ */ new Date()).getUTCHours();
  const peak = 18 <= hour || hour <= 1 ? 1 : 0.55;
  const base = 1450 + peak * 420 + 90 * Math.sin(hour / 24 * Math.PI * 2 + 1);
  return Math.floor(base + 120);
}
function registerRoutes(app2) {
  app2.get("/api/health", (_req, res) => {
    res.json({ status: "ok", time: (/* @__PURE__ */ new Date()).toISOString(), env: process.env.NODE_ENV });
  });
  const validateAdmin = (req, res, next) => {
    const adminSecret = process.env.ADMIN_SECRET;
    if (!adminSecret) {
      console.error("ADMIN_SECRET not set in environment");
      return res.status(500).json({ error: "Server Configuration Error" });
    }
    if (req.headers["x-vercel-cron"] === "true") {
      return next();
    }
    const providedKey = req.headers["x-admin-key"] || req.query.key;
    if (providedKey !== adminSecret) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    next();
  };
  const runCommunitySync = async (_req, res) => {
    try {
      const result = await syncCommunityData();
      res.json({ message: "Sync successful", lastSync: result.lastSync });
    } catch (error) {
      console.error("Community sync error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Sync failed" });
    }
  };
  app2.get("/api/claims", async (_req, res) => {
    try {
      const claims = await storage.listClaims();
      res.json(claims);
    } catch (err) {
      console.error("/api/claims failed:", err);
      res.status(500).json({ error: "Failed to load claims" });
    }
  });
  app2.post("/api/claims", validateAdmin, async (req, res) => {
    try {
      const parsed = insertSiteClaimSchema.parse(req.body);
      const claim = await storage.upsertClaim(parsed);
      res.json(claim);
    } catch (err) {
      console.error("/api/claims upsert failed:", err);
      res.status(400).json({ error: "Invalid claim data" });
    }
  });
  app2.delete("/api/claims/:id", validateAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      await storage.deleteClaim(id);
      res.json({ ok: true });
    } catch (err) {
      console.error("/api/claims delete failed:", err);
      res.status(500).json({ error: "Failed to delete claim" });
    }
  });
  app2.post("/api/admin/seed-claims", validateAdmin, async (_req, res) => {
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
  app2.get("/api/community/data", async (_req, res) => {
    try {
      const [events, discussions, lastSync] = await Promise.all([
        storage.getEvents(),
        storage.getDiscussions(),
        storage.getSyncMetadata("last_sync")
      ]);
      if (events.length === 0 || discussions.length === 0) {
        console.log("Database empty, returning initial static data...");
        const initialEvents = [...CURATED_EVENTS, ...generateLocalEvents()].map((e, i) => ({ id: i + 1, ...e }));
        const initialDiscussions = FALLBACK_DISCUSSIONS.map((d, i) => ({ id: i + 1, ...d }));
        syncCommunityData().catch((err) => console.error("Background sync failed:", err));
        return res.json({
          events: initialEvents,
          discussions: initialDiscussions,
          activeUsers: activeUsersCount(),
          lastSync: lastSync || (/* @__PURE__ */ new Date()).toISOString()
        });
      }
      res.json({
        events,
        discussions,
        activeUsers: activeUsersCount(),
        lastSync: lastSync || (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Fatal API error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  app2.get("/api/community/sync", (req, res, next) => {
    const isVercelCron = Boolean(req.headers["x-vercel-cron-schedule"]) || String(req.headers["user-agent"] || "").includes("vercel-cron/");
    if (!isVercelCron) return validateAdmin(req, res, next);
    return runCommunitySync(req, res);
  });
  app2.post("/api/community/sync", validateAdmin, runCommunitySync);
  app2.post("/api/contact", async (req, res) => {
    try {
      const { firstName, lastName, email, message, "g-recaptcha-response": recaptchaToken } = req.body;
      if (process.env.RECAPTCHA_SECRET_KEY) {
        const result2 = await verifyRecaptcha(recaptchaToken);
        if (!result2.success) {
          console.error("Contact Form: reCAPTCHA verification failed", result2.errorCodes);
          return res.status(400).json({ error: "reCAPTCHA verification failed", details: result2.errorCodes });
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
  app2.post("/api/mentors/apply", async (req, res) => {
    try {
      const { "g-recaptcha-response": recaptchaToken, ...formData } = req.body;
      if (process.env.RECAPTCHA_SECRET_KEY) {
        const result2 = await verifyRecaptcha(recaptchaToken);
        if (!result2.success) {
          console.error("Mentor Application: reCAPTCHA verification failed", result2.errorCodes);
          return res.status(400).json({ error: "reCAPTCHA verification failed", details: result2.errorCodes });
        }
      } else {
        console.warn("Mentor Application: Skipping reCAPTCHA check (RECAPTCHA_SECRET_KEY not set)");
      }
      const validatedApp = insertMentorApplicationSchema.parse(formData);
      const result = await storage.createMentorApplication(validatedApp);
      res.json(result);
    } catch (error) {
      console.error("Mentor application error:", error);
      if (error instanceof import_zod.z.ZodError) {
        return res.status(400).json({ error: "Invalid application data. Please check all fields." });
      }
      res.status(500).json({ error: "Internal server error. Database storage failed." });
    }
  });
  app2.get("/api/admin/messages", validateAdmin, async (_req, res) => {
    try {
      const messages = await storage.getMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });
  app2.get("/api/admin/applications", validateAdmin, async (_req, res) => {
    try {
      const apps = await storage.getMentorApplications();
      res.json(apps);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch applications" });
    }
  });
  app2.patch("/api/admin/applications/:id", validateAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }
      const app3 = await storage.updateMentorApplicationStatus(id, status);
      res.json(app3);
    } catch (error) {
      console.error("Failed to update application:", error);
      res.status(500).json({ error: "Failed to update application" });
    }
  });
  app2.get("/api/assessment-analytics", validateAdmin, async (req, res) => {
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
        completedAt: row.completedAt?.toISOString() ?? null
      }));
      res.json(out);
    } catch (error) {
      console.error("/api/assessment-analytics failed:", error);
      res.status(500).json({ error: "Failed to load assessment analytics" });
    }
  });
  app2.post("/api/assessment-analytics", async (req, res) => {
    try {
      const ip = req.ip || req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() || "unknown";
      const key = `ratelimit:analytics:${ip}`;
      const now = Date.now();
      const windowMs = 60 * 1e3;
      const maxRequests = 10;
      const existing = await storage.getSyncMetadata(key) ?? "";
      const timestamps = existing ? JSON.parse(existing) : [];
      const recent = timestamps.filter((t) => now - t < windowMs);
      if (recent.length >= maxRequests) {
        return res.status(429).json({ error: "Too many requests. Please wait before submitting again." });
      }
      recent.push(now);
      await storage.setSyncMetadata(key, JSON.stringify(recent));
      const raw = req.body;
      const body = insertAssessmentAnalyticsSchema.parse({
        assessmentId: raw.assessmentId,
        moduleId: raw.moduleId,
        workshopId: raw.workshopId ?? void 0,
        totalQuestions: raw.totalQuestions,
        correctCount: raw.correctCount,
        score: raw.score,
        passed: raw.passed
      });
      const created = await storage.createAssessmentAnalytics(body);
      res.status(201).json(created);
    } catch (error) {
      console.error("/api/assessment-analytics failed:", error);
      res.status(400).json({ error: "Invalid assessment analytics data" });
    }
  });
  app2.delete("/api/assessment-analytics/:id", validateAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      await storage.deleteAssessmentAnalytics(id);
      res.json({ ok: true });
    } catch (error) {
      console.error("/api/assessment-analytics delete failed:", error);
      res.status(500).json({ error: "Failed to delete assessment analytics" });
    }
  });
  app2.post("/api/faq/ask", async (req, res) => {
    try {
      const { question } = import_zod.z.object({ question: import_zod.z.string().min(3) }).parse(req.body);
      const chunks = await searchFaqChunks(question, 3);
      if (chunks.length === 0) {
        return res.json({
          answer: "I don't have a specific answer for that yet. Try asking about digital safety, screen-time agreements, breathing exercises, or the Cyber-Safe Quiz.",
          sources: []
        });
      }
      const context = chunks.map((c) => `[${c.category}] ${c.title}: ${c.content}`).join("\n\n");
      const answer = await generateOpenRouterAnswer(question, context);
      res.json({
        answer,
        sources: chunks.map((c) => ({ title: c.title, category: c.category }))
      });
    } catch (err) {
      console.error("/api/faq/ask failed:", err);
      res.status(400).json({ error: "Invalid request. Please send a question with at least 3 characters." });
    }
  });
  app2.post("/api/faq/seed", async (req, res) => {
    try {
      const { title, content, category } = import_zod.z.object({ title: import_zod.z.string(), content: import_zod.z.string(), category: import_zod.z.string() }).parse(req.body);
      const chunk = await db.insert(faqChunks).values({ title, content, category }).returning();
      res.json(chunk[0]);
    } catch (err) {
      console.error("/api/faq/seed failed:", err);
      res.status(400).json({ error: "Invalid chunk data. Required: title, content, category." });
    }
  });
  app2.get("/api/faq/chunks", async (_req, res) => {
    try {
      const chunks = await db.select().from(faqChunks).orderBy(faqChunks.category);
      res.json(chunks);
    } catch (err) {
      console.error("/api/faq/chunks failed:", err);
      res.status(500).json({ error: "Failed to fetch chunks" });
    }
  });
  app2.get("/api/family/commitments", async (req, res) => {
    try {
      const familyId = String(req.query.familyId || "default-family");
      const items = await storage.listFamilyCommitments(familyId);
      const decrypted = await Promise.all(
        items.map(async (item) => ({
          ...item,
          terms: await decryptField(item.terms),
          members: await decryptField(item.members)
        }))
      );
      res.json(decrypted);
    } catch (err) {
      console.error("/api/family/commitments failed:", err);
      res.status(500).json({ error: "Failed to fetch commitments" });
    }
  });
  app2.get("/api/family/commitments/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const item = await storage.getFamilyCommitment(id);
      if (!item) return res.status(404).json({ error: "Not found" });
      const milestones = await storage.listFamilyCommitmentMilestones(id);
      const [terms, members] = await Promise.all([
        decryptField(item.terms),
        decryptField(item.members)
      ]);
      res.json({ ...item, terms, members, milestones });
    } catch (err) {
      console.error("/api/family/commitments/:id failed:", err);
      res.status(500).json({ error: "Failed to fetch commitment" });
    }
  });
  app2.post("/api/family/commitments", async (req, res) => {
    try {
      const body = import_zod.z.object({ familyId: import_zod.z.string(), title: import_zod.z.string(), terms: import_zod.z.string(), members: import_zod.z.string() }).safeParse(req.body);
      if (!body.success) return res.status(400).json({ error: body.error.message });
      const [encTerms, encMembers] = await Promise.all([
        encryptField(body.data.terms),
        encryptField(body.data.members)
      ]);
      const created = await storage.createFamilyCommitment({
        familyId: body.data.familyId,
        title: body.data.title,
        terms: encTerms,
        members: encMembers,
        status: "pending"
      });
      const { writeLedger: writeLedger2, pinCommitmentMetadata: pinCommitmentMetadata2 } = await Promise.resolve().then(() => (init_blockchain(), blockchain_exports));
      const ledger = await writeLedger2(created);
      const pin = await pinCommitmentMetadata2(created);
      let metadataCid = null;
      if (pin && typeof pin === "object" && "cid" in pin) {
        const candidate = pin.cid;
        metadataCid = typeof candidate === "string" ? candidate : null;
      } else {
        metadataCid = null;
      }
      const updated = await storage.updateFamilyCommitment(created.id, {
        ledgerHash: ledger.txHash ? `ledger:${ledger.network || "local"}:${ledger.txHash}` : null,
        metadataCid
      });
      res.status(201).json(updated ?? created);
    } catch (err) {
      console.error("/api/family/commitments failed:", err);
      res.status(500).json({ error: "Failed to create commitment" });
    }
  });
  app2.post("/api/family/commitments/:id/complete", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const updated = await storage.updateFamilyCommitment(id, { status: "completed", completedAt: /* @__PURE__ */ new Date() });
      if (!updated) return res.status(404).json({ error: "Not found" });
      res.json(updated);
    } catch (err) {
      console.error("/api/family/commitments/:id/complete failed:", err);
      res.status(500).json({ error: "Failed to complete commitment" });
    }
  });
  app2.post("/api/family/commitments/:id/milestones", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const body = import_zod.z.object({ label: import_zod.z.string(), targetDate: import_zod.z.string().optional() }).parse(req.body);
      const [ms] = await db.insert(familyCommitmentMilestones).values({ commitmentId: id, ...body }).returning();
      res.status(201).json(ms);
    } catch (err) {
      console.error("/api/family/commitments/:id/milestones failed:", err);
      res.status(500).json({ error: "Failed to create milestone" });
    }
  });
  app2.get("/api/admin/curated-content", validateAdmin, async (req, res) => {
    try {
      const items = await storage.listCuratedContent();
      res.json(items);
    } catch (err) {
      console.error("/api/admin/curated-content failed:", err);
      res.status(500).json({ error: "Failed to fetch curated content" });
    }
  });
  app2.post("/api/admin/curated-content", validateAdmin, async (req, res) => {
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
  app2.patch("/api/admin/curated-content/:id", validateAdmin, async (req, res) => {
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
  app2.delete("/api/admin/curated-content/:id", validateAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      await storage.deleteCuratedContent(id);
      res.json({ success: true });
    } catch (err) {
      console.error("/api/admin/curated-content/:id DELETE failed:", err);
      res.status(500).json({ error: "Failed to delete curated content" });
    }
  });
  app2.post("/api/stories", async (req, res) => {
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
  app2.get("/api/stories", async (req, res) => {
    try {
      const status = req.query.status;
      const stories2 = await storage.getStories();
      const filtered = status ? stories2.filter((s) => s.status === status) : stories2;
      res.json(filtered);
    } catch (err) {
      console.error("/api/stories GET failed:", err);
      res.status(500).json({ error: "Failed to fetch stories" });
    }
  });
  app2.get("/api/admin/stories", validateAdmin, async (_req, res) => {
    try {
      const stories2 = await storage.getStories();
      res.json(stories2);
    } catch (err) {
      console.error("/api/admin/stories failed:", err);
      res.status(500).json({ error: "Failed to fetch stories" });
    }
  });
  app2.patch("/api/admin/stories/:id", validateAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const body = import_zod.z.object({ status: import_zod.z.string() }).safeParse(req.body);
      if (!body.success) return res.status(400).json({ error: body.error.message });
      const updated = await storage.updateStoryStatus(id, body.data.status);
      res.json(updated);
    } catch (err) {
      console.error("/api/admin/stories/:id PATCH failed:", err);
      res.status(500).json({ error: "Failed to update story" });
    }
  });
}

// server/log.ts
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

// server/index.ts
var app = (0, import_express.default)();
app.use(import_express.default.json());
app.use(import_express.default.urlencoded({ extended: false }));
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
registerRoutes(app);
app.use((err, _req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

// api/index.ts
var index_default = app;
