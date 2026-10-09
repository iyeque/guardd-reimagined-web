const CURRENT_PROFILE_KEY = "dg_current_profile";
const PROFILES_KEY = "dg_profiles";

export type FamilyMode = "parent" | "child" | "family";

export interface Profile {
  id: string;
  nickname: string;
  familyId: string;
  mode: FamilyMode;
  createdAt: number;
  /**
   * Credential for /api/family/commitments. Returned once by the create call
   * that minted it. Losing it means the family cannot read its own
   * commitments — an admin reissue is the recovery path.
   */
  familyAccessToken?: string;
}

function generateId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getProfiles(): Record<string, Profile> {
  if (typeof window === "undefined") return {};
  try {
    const data = localStorage.getItem(PROFILES_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error("Failed to parse profiles", e);
  }
  return {};
}

function saveProfiles(profiles: Record<string, Profile>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

export function getCurrentProfileId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CURRENT_PROFILE_KEY);
}

export function getProfile(profileId: string): Profile | null {
  const profiles = getProfiles();
  return profiles[profileId] ?? null;
}

export function getCurrentProfile(): Profile | null {
  const id = getCurrentProfileId();
  if (!id) return null;
  return getProfile(id);
}

export function createProfile(
  nickname: string = "",
  mode: FamilyMode = "family",
  baseFamilyId?: string
): Profile {
  const profiles = getProfiles();
  const id = generateId();
  const familyId = baseFamilyId ?? `family-${id.slice(0, 8)}`;

  const newProfile: Profile = {
    id,
    nickname,
    familyId,
    mode,
    createdAt: Date.now(),
  };

  profiles[id] = newProfile;
  saveProfiles(profiles);
  localStorage.setItem(CURRENT_PROFILE_KEY, id);

  return newProfile;
}

export function setCurrentProfile(profileId: string): void {
  const profiles = getProfiles();
  if (!profiles[profileId]) {
    console.error(`setCurrentProfile: profile ${profileId} not found`);
    return;
  }
  localStorage.setItem(CURRENT_PROFILE_KEY, profileId);
}

export function updateProfile(
  profileId: string,
  updates: Partial<Pick<Profile, "nickname" | "mode" | "familyAccessToken">>
): Profile | null {
  const profiles = getProfiles();
  if (!profiles[profileId]) return null;

  profiles[profileId] = { ...profiles[profileId], ...updates };
  saveProfiles(profiles);
  return profiles[profileId];
}

export function deleteProfile(profileId: string): boolean {
  const profiles = getProfiles();
  if (!profiles[profileId]) return false;

  delete profiles[profileId];

  const currentId = getCurrentProfileId();
  if (currentId === profileId) {
    const remaining = Object.keys(profiles);
    if (remaining.length > 0) {
      localStorage.setItem(CURRENT_PROFILE_KEY, remaining[0]);
    } else {
      localStorage.removeItem(CURRENT_PROFILE_KEY);
    }
  }

  saveProfiles(profiles);
  return true;
}

export function listProfiles(): Profile[] {
  const profiles = getProfiles();
  return Object.values(profiles).sort((a, b) => a.createdAt - b.createdAt);
}

export function migrateOldProgress(profileId: string): void {
  if (typeof window === "undefined") return;
  const oldCourseKey = "guardd_course_progress";
  const oldWorkshopKey = "guardd_workshop_progress";
  const oldCompanionKey = "guardd_companion_progress";

  const courseData = localStorage.getItem(oldCourseKey);
  if (courseData) {
    localStorage.setItem(`dg_course_${profileId}`, courseData);
    localStorage.removeItem(oldCourseKey);
  }

  const workshopData = localStorage.getItem(oldWorkshopKey);
  if (workshopData) {
    localStorage.setItem(`dg_workshops_${profileId}`, workshopData);
    localStorage.removeItem(oldWorkshopKey);
  }

  const companionData = localStorage.getItem(oldCompanionKey);
  if (companionData) {
    localStorage.setItem(`dg_companion_${profileId}`, companionData);
    localStorage.removeItem(oldCompanionKey);
  }
}

export function getProfileStorageKey(prefix: string, profileId: string): string {
  return `${prefix}_${profileId}`;
}

export const COOKIE_CONSENT_KEY = "dg_cookie_consent";
