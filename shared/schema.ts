import { pgTable, serial, text, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const mentorApplications = pgTable("mentor_applications", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  specialty: text("specialty").notNull(),
  bio: text("bio").notNull(),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const communityEvents = pgTable("community_events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  location: text("location").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  type: text("type").notNull(),
  url: text("url").notNull(),
  organizer: text("organizer").notNull(),
  status: text("status").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const trendingDiscussions = pgTable("trending_discussions", {
  id: serial("id").primaryKey(),
  platform: text("platform").notNull(),
  community: text("community").notNull(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  hotness: text("hotness").notNull(),
  replies: text("replies").notNull(),
  postedAt: text("posted_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const syncMetadata = pgTable("sync_metadata", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const siteClaims = pgTable("site_claims", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  value: text("value").notNull(),
  label: text("label").notNull(),
  context: text("context").notNull().default(""),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSiteClaimSchema = createInsertSchema(siteClaims).omit({ id: true, updatedAt: true });
export type SiteClaim = typeof siteClaims.$inferSelect;
export type InsertSiteClaim = z.infer<typeof insertSiteClaimSchema>;

export const faqChunks = pgTable("faq_chunks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
});

export type TimeWindow = {
  days: number[];
  start: string;
  end: string;
};

export type RuleEntry = {
  domains: string[];
  windows: TimeWindow[];
  appliesTo: string[];
  action: "block" | "remind";
};

export type CommitmentRules = {
  timezone: string;
  entries: RuleEntry[];
};

export const familyCommitments = pgTable("family_commitments", {
  id: serial("id").primaryKey(),
  familyId: text("family_id").notNull(),
  title: text("title").notNull(),
  terms: text("terms").notNull(),
  members: text("members").notNull(),
  status: text("status").notNull().default("pending"),
  ledgerHash: text("ledger_hash"),
  metadataCid: text("metadata_cid"),
  // Structured enforcement rules read by the Commitment Extension. Null on
  // every pre-existing row, and null must mean "enforce nothing".
  rules: jsonb("rules").$type<CommitmentRules | null>(),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const familyCommitmentMilestones = pgTable("family_commitment_milestones", {
  id: serial("id").primaryKey(),
  commitmentId: serial("commitment_id").references(() => familyCommitments.id),
  label: text("label").notNull(),
  targetDate: text("target_date"),
  completedAt: timestamp("completed_at"),
});

export const assessmentAnalytics = pgTable("assessment_analytics", {
  id: serial("id").primaryKey(),
  assessmentId: text("assessment_id").notNull(),
  moduleId: text("module_id").notNull(),
  workshopId: text("workshop_id"),
  totalQuestions: integer("total_questions").notNull(),
  correctCount: integer("correct_count").notNull(),
  score: integer("score").notNull(),
  passed: text("passed").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
});

export const insertAssessmentAnalyticsSchema = createInsertSchema(assessmentAnalytics).omit({
  id: true,
  completedAt: true,
});

export const curatedContent = pgTable("curated_content", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // "discussion" | "event"
  title: text("title").notNull(),
  url: text("url"),
  description: text("description"),
  platform: text("platform"),
  community: text("community"),
  hotness: text("hotness"),
  postedAt: text("posted_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCuratedContentSchema = createInsertSchema(curatedContent);
export type CuratedContent = typeof curatedContent.$inferSelect;
export type InsertCuratedContent = typeof curatedContent.$inferInsert;

export const stories = pgTable("stories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  message: text("message").notNull(),
  workshops: text("workshops").notNull().default(""),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertStorySchema = createInsertSchema(stories).omit({ id: true, createdAt: true });
export type Story = typeof stories.$inferSelect;
export type InsertStory = z.infer<typeof insertStorySchema>;

export type AssessmentAnalytics = typeof assessmentAnalytics.$inferSelect;
export type InsertAssessmentAnalytics = z.infer<typeof insertAssessmentAnalyticsSchema>;

export const insertMessageSchema = createInsertSchema(contactMessages);
export const insertMentorApplicationSchema = createInsertSchema(mentorApplications);
export const insertEventSchema = createInsertSchema(communityEvents);
export const insertDiscussionSchema = createInsertSchema(trendingDiscussions);
export const insertFaqChunkSchema = createInsertSchema(faqChunks);

export type Message = typeof contactMessages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type MentorApplication = typeof mentorApplications.$inferSelect;
export type InsertMentorApplication = z.infer<typeof insertMentorApplicationSchema>;
export type CommunityEvent = typeof communityEvents.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type TrendingDiscussion = typeof trendingDiscussions.$inferSelect;
export type InsertDiscussion = z.infer<typeof insertDiscussionSchema>;
export type FaqChunk = typeof faqChunks.$inferSelect;
export type InsertFaqChunk = z.infer<typeof insertFaqChunkSchema>;

export const insertFamilyCommitmentSchema = createInsertSchema(familyCommitments).extend({
  // drizzle-zod does not narrow a `$type`d jsonb column, so the inferred type
  // widens to drizzle's base `Json` (which includes `string`/`number`) and no
  // longer satisfies drizzle's insert signature. Pin it here so the whole
  // codebase sees the real type instead of every call site needing a cast.
  // Runtime validation lives in routes.ts's `commitmentRulesSchema`.
  rules: z.custom<CommitmentRules | null>(),
});
export const insertFamilyMilestoneSchema = createInsertSchema(familyCommitmentMilestones);

export type FamilyCommitment = typeof familyCommitments.$inferSelect;
export type InsertFamilyCommitment = z.infer<typeof insertFamilyCommitmentSchema>;
export type FamilyCommitmentMilestone = typeof familyCommitmentMilestones.$inferSelect;
export type InsertFamilyCommitmentMilestone = z.infer<typeof insertFamilyMilestoneSchema>;
