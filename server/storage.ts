import { 
  contactMessages, type Message, type InsertMessage,
  mentorApplications, type MentorApplication, type InsertMentorApplication,
  communityEvents, type CommunityEvent, type InsertEvent,
  trendingDiscussions, type TrendingDiscussion, type InsertDiscussion
} from "../shared/schema.js";
import { db } from "./db.js";
import { desc, eq } from "drizzle-orm";

export interface IStorage {
  createMessage(message: InsertMessage): Promise<Message>;
  getMessages(): Promise<Message[]>;
  createMentorApplication(app: InsertMentorApplication): Promise<MentorApplication>;
  getMentorApplications(): Promise<MentorApplication[]>;
  updateMentorApplicationStatus(id: number, status: string): Promise<MentorApplication>;
  
  // Community Data
  getEvents(): Promise<CommunityEvent[]>;
  setEvents(events: InsertEvent[]): Promise<void>;
  getDiscussions(): Promise<TrendingDiscussion[]>;
  setDiscussions(discussions: InsertDiscussion[]): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(contactMessages).values(insertMessage).returning();
    return message;
  }

  async getMessages(): Promise<Message[]> {
    return await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  }

  async createMentorApplication(insertApp: InsertMentorApplication): Promise<MentorApplication> {
    const [app] = await db.insert(mentorApplications).values(insertApp).returning();
    return app;
  }

  async getMentorApplications(): Promise<MentorApplication[]> {
    return await db.select().from(mentorApplications).orderBy(desc(mentorApplications.createdAt));
  }

  async updateMentorApplicationStatus(id: number, status: string): Promise<MentorApplication> {
    const [app] = await db
      .update(mentorApplications)
      .set({ status })
      .where(eq(mentorApplications.id, id))
      .returning();
    return app;
  }

  async getEvents(): Promise<CommunityEvent[]> {
    return await db.select().from(communityEvents).orderBy(communityEvents.date);
  }

  async setEvents(events: InsertEvent[]): Promise<void> {
    // Neon HTTP doesn't support transactions, so we use sequential execution
    await db.delete(communityEvents);
    if (events.length > 0) {
      // Chunking to stay within Neon/Vercel request limits
      for (let i = 0; i < events.length; i += 10) {
        await db.insert(communityEvents).values(events.slice(i, i + 10));
      }
    }
  }

  async getDiscussions(): Promise<TrendingDiscussion[]> {
    return await db.select().from(trendingDiscussions).orderBy(desc(trendingDiscussions.createdAt));
  }

  async setDiscussions(discussions: InsertDiscussion[]): Promise<void> {
    await db.delete(trendingDiscussions);
    if (discussions.length > 0) {
      await db.insert(trendingDiscussions).values(discussions);
    }
  }
}

export const storage = new DatabaseStorage();
