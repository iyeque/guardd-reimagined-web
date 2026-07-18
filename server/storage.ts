import { 
  contactMessages, type Message, type InsertMessage,
  mentorApplications, type MentorApplication, type InsertMentorApplication,
  communityEvents, type CommunityEvent, type InsertEvent,
  trendingDiscussions, type TrendingDiscussion, type InsertDiscussion,
  syncMetadata,
  familyCommitments, type FamilyCommitment, type InsertFamilyCommitment,
  familyCommitmentMilestones, type InsertFamilyCommitmentMilestone
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

  // Sync metadata
  getSyncMetadata(key: string): Promise<string | null>;
  setSyncMetadata(key: string, value: string): Promise<void>;

  // Family commitments (ORCA-style inventory bridge adapted for family wellness)
  listFamilyCommitments(familyId: string): Promise<FamilyCommitment[]>;
  getFamilyCommitment(id: number): Promise<FamilyCommitment | null>;
  createFamilyCommitment(commitment: InsertFamilyCommitment): Promise<FamilyCommitment>;
  updateFamilyCommitment(id: number, patch: Partial<InsertFamilyCommitment>): Promise<FamilyCommitment | null>;
  listFamilyCommitmentMilestones(commitmentId: number): Promise<InsertFamilyCommitmentMilestone[]>;
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

  async getSyncMetadata(key: string): Promise<string | null> {
    const [row] = await db.select({ value: syncMetadata.value }).from(syncMetadata).where(eq(syncMetadata.key, key)).limit(1);
    return row?.value ?? null;
  }

  async setSyncMetadata(key: string, value: string): Promise<void> {
    const now = new Date();
    await db.insert(syncMetadata).values({ key, value, updatedAt: now }).onConflictDoUpdate({
      target: syncMetadata.key,
      set: { value, updatedAt: now }
    });
  }

  async listFamilyCommitments(familyId: string): Promise<FamilyCommitment[]> {
    return await db.select().from(familyCommitments).where(eq(familyCommitments.familyId, familyId));
  }

  async getFamilyCommitment(id: number): Promise<FamilyCommitment | null> {
    const [row] = await db.select().from(familyCommitments).where(eq(familyCommitments.id, id)).limit(1);
    return row ?? null;
  }

  async createFamilyCommitment(insert: InsertFamilyCommitment): Promise<FamilyCommitment> {
    const [row] = await db.insert(familyCommitments).values(insert).returning();
    return row;
  }

  async updateFamilyCommitment(id: number, patch: Partial<InsertFamilyCommitment>): Promise<FamilyCommitment | null> {
    const [row] = await db
      .update(familyCommitments)
      .set(patch)
      .where(eq(familyCommitments.id, id))
      .returning();
    return row ?? null;
  }

  async listFamilyCommitmentMilestones(commitmentId: number): Promise<InsertFamilyCommitmentMilestone[]> {
    return await db.select().from(familyCommitmentMilestones).where(eq(familyCommitmentMilestones.commitmentId, commitmentId));
  }
}

export const storage = new DatabaseStorage();
