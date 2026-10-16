import {
  contactMessages,
  type Message,
  type InsertMessage,
  mentorApplications,
  type MentorApplication,
  type InsertMentorApplication,
  communityEvents,
  type CommunityEvent,
  type InsertEvent,
  trendingDiscussions,
  type TrendingDiscussion,
  type InsertDiscussion,
  syncMetadata,
  siteClaims,
  type SiteClaim,
  type InsertSiteClaim,
  familyCommitments,
  type FamilyCommitment,
  type InsertFamilyCommitment,
  familyCommitmentMilestones,
  type InsertFamilyCommitmentMilestone,
  assessmentAnalytics,
  type AssessmentAnalytics,
  type InsertAssessmentAnalytics,
  stories,
  type Story,
  type InsertStory,
  curatedContent,
  type CuratedContent,
  type InsertCuratedContent,
  familyContentPacks,
  type InsertFamilyContentPack,
} from "../shared/schema.js";
import { db } from "./db.js";
import { and, desc, eq } from "drizzle-orm";

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

  // Site claims
  listClaims(): Promise<SiteClaim[]>;
  upsertClaim(insert: InsertSiteClaim): Promise<SiteClaim>;
  deleteClaim(id: number): Promise<void>;

  // Family commitments
  listFamilyCommitments(familyId: string): Promise<FamilyCommitment[]>;
  getFamilyCommitment(id: number): Promise<FamilyCommitment | null>;
  createFamilyCommitment(insert: InsertFamilyCommitment): Promise<FamilyCommitment>;
  updateFamilyCommitment(id: number, patch: Partial<InsertFamilyCommitment>): Promise<FamilyCommitment | null>;
  listFamilyCommitmentMilestones(commitmentId: number): Promise<InsertFamilyCommitmentMilestone[]>;

  // Assessment analytics
  createAssessmentAnalytics(insert: InsertAssessmentAnalytics): Promise<AssessmentAnalytics>;
  listAssessmentAnalytics(limit?: number, offset?: number): Promise<AssessmentAnalytics[]>;
  getAssessmentAnalyticsById(id: number): Promise<AssessmentAnalytics | null>;
  deleteAssessmentAnalytics(id: number): Promise<void>;

  // Stories
  createStory(insert: InsertStory): Promise<Story>;
  getStories(): Promise<Story[]>;
  updateStoryStatus(id: number, status: string): Promise<Story>;

  // Curated Content
  createCuratedContent(item: InsertCuratedContent): Promise<CuratedContent>;
  listCuratedContent(): Promise<CuratedContent[]>;
  updateCuratedContent(id: number, updates: Partial<InsertCuratedContent>): Promise<CuratedContent>;
  deleteCuratedContent(id: number): Promise<void>;
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

  // community_events / trending_discussions mark every text column NOT NULL,
  // but sync sources (RSS, SerpApi) routinely omit fields. A single null used
  // to abort the whole sync with a constraint violation, so coerce missing
  // values to safe defaults here at the sink — covers every source at once.
  private normalizeEvent(event: InsertEvent): InsertEvent {
    const str = (value: unknown, fallback: string): string =>
      typeof value === "string" && value.trim() !== "" ? value : fallback;
    return {
      ...event,
      title: str(event.title, "Untitled event"),
      location: str(event.location, "Online"),
      date: str(event.date, "TBD"),
      time: str(event.time, "TBD"),
      type: str(event.type, "Event"),
      url: str(event.url, ""),
      organizer: str(event.organizer, "Unknown organizer"),
      status: str(event.status, "Upcoming"),
      description: str(event.description, ""),
    };
  }

  private normalizeDiscussion(discussion: InsertDiscussion): InsertDiscussion {
    const str = (value: unknown, fallback: string): string =>
      typeof value === "string" && value.trim() !== "" ? value : fallback;
    return {
      ...discussion,
      platform: str(discussion.platform, "Community"),
      community: str(discussion.community, "Digital Wellness"),
      title: str(discussion.title, "Untitled discussion"),
      url: str(discussion.url, ""),
      hotness: str(discussion.hotness, "Trending"),
      replies: str(discussion.replies, "0"),
      postedAt: str(discussion.postedAt, "Recently"),
    };
  }

  async setEvents(events: InsertEvent[]): Promise<void> {
    await db.delete(communityEvents);
    const rows = events.map((event) => this.normalizeEvent(event));
    if (rows.length > 0) {
      for (let i = 0; i < rows.length; i += 10) {
        await db.insert(communityEvents).values(rows.slice(i, i + 10));
      }
    }
  }

  async getDiscussions(): Promise<TrendingDiscussion[]> {
    return await db.select().from(trendingDiscussions).orderBy(desc(trendingDiscussions.createdAt));
  }

  async setDiscussions(discussions: InsertDiscussion[]): Promise<void> {
    await db.delete(trendingDiscussions);
    const rows = discussions.map((discussion) =>
      this.normalizeDiscussion(discussion),
    );
    if (rows.length > 0) {
      await db.insert(trendingDiscussions).values(rows);
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

  async listClaims(): Promise<SiteClaim[]> {
    return await db.select().from(siteClaims).orderBy(siteClaims.slug);
  }

  async upsertClaim(insert: InsertSiteClaim): Promise<SiteClaim> {
    const [row] = await db
      .insert(siteClaims)
      .values(insert)
      .onConflictDoUpdate({ target: siteClaims.slug, set: insert })
      .returning();
    return row;
  }

  async deleteClaim(id: number): Promise<void> {
    await db.delete(siteClaims).where(eq(siteClaims.id, id));
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

  async listFamilyContentPacks(familyId: string): Promise<InsertFamilyContentPack[]> {
    return await db.select().from(familyContentPacks).where(eq(familyContentPacks.familyId, familyId));
  }

  async getFamilyContentPack(familyId: string, packId: string): Promise<InsertFamilyContentPack | null> {
    const [row] = await db
      .select()
      .from(familyContentPacks)
      .where(and(eq(familyContentPacks.familyId, familyId), eq(familyContentPacks.packId, packId)))
      .limit(1);
    return row ?? null;
  }

  async createFamilyContentPack(insert: InsertFamilyContentPack): Promise<InsertFamilyContentPack> {
    const [row] = await db.insert(familyContentPacks).values(insert).returning();
    return row;
  }

  async updateFamilyContentPack(
    familyId: string,
    packId: string,
    patch: Partial<InsertFamilyContentPack>,
  ): Promise<InsertFamilyContentPack | null> {
    const [row] = await db
      .update(familyContentPacks)
      .set({ ...patch, updatedAt: new Date() })
      .where(and(eq(familyContentPacks.familyId, familyId), eq(familyContentPacks.packId, packId)))
      .returning();
    return row ?? null;
  }

  async createAssessmentAnalytics(insert: InsertAssessmentAnalytics): Promise<AssessmentAnalytics> {
    const [row] = await db.insert(assessmentAnalytics).values(insert).returning();
    return row;
  }

  async listAssessmentAnalytics(limit = 50, offset = 0): Promise<AssessmentAnalytics[]> {
    return await db
      .select()
      .from(assessmentAnalytics)
      .orderBy(desc(assessmentAnalytics.completedAt))
      .limit(limit)
      .offset(offset);
  }

  async getAssessmentAnalyticsById(id: number): Promise<AssessmentAnalytics | null> {
    const [row] = await db.select().from(assessmentAnalytics).where(eq(assessmentAnalytics.id, id)).limit(1);
    return row ?? null;
  }

  async deleteAssessmentAnalytics(id: number): Promise<void> {
    await db.delete(assessmentAnalytics).where(eq(assessmentAnalytics.id, id));
  }

  async createStory(insert: InsertStory): Promise<Story> {
    const [row] = await db.insert(stories).values(insert).returning();
    return row;
  }

  async getStories(): Promise<Story[]> {
    return await db.select().from(stories).orderBy(desc(stories.createdAt));
  }

  async updateStoryStatus(id: number, status: string): Promise<Story> {
    const [row] = await db
      .update(stories)
      .set({ status })
      .where(eq(stories.id, id))
      .returning();
    if (!row) throw new Error(`Story with ID ${id} not found`);
    return row;
  }

  // Curated Content
  async createCuratedContent(item: InsertCuratedContent): Promise<CuratedContent> {
    const [row] = await db.insert(curatedContent).values(item).returning();
    return row;
  }

  async listCuratedContent(): Promise<CuratedContent[]> {
    return db.select().from(curatedContent).orderBy(desc(curatedContent.createdAt));
  }

  async updateCuratedContent(id: number, updates: Partial<InsertCuratedContent>): Promise<CuratedContent> {
    const [row] = await db.update(curatedContent).set(updates).where(eq(curatedContent.id, id)).returning();
    if (!row) throw new Error(`Curated content ${id} not found`);
    return row;
  }

  async deleteCuratedContent(id: number): Promise<void> {
    await db.delete(curatedContent).where(eq(curatedContent.id, id));
  }
}

export const storage = new DatabaseStorage();
