import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
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

export const faqChunks = pgTable("faq_chunks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
});

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
