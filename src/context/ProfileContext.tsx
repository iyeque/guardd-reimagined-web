import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  FC,
} from "react";
import {
  Profile,
  getCurrentProfile,
  createProfile,
  setCurrentProfile,
  updateProfile,
  deleteProfile,
  listProfiles,
  migrateOldProgress,
  getProfile,
  getProfileStorageKey,
  type FamilyMode,
  type ProfileSaveResult,
} from "@/lib/profiles";

interface ProfileContextType {
  currentProfile: Profile | null;
  profiles: Profile[];
  reloadProfiles: () => void;
  createNewProfile: (nickname?: string, mode?: FamilyMode) => Profile | null;
  switchProfile: (profileId: string) => void;
  updateCurrentProfile: (
    updates: Partial<Pick<Profile, "nickname" | "mode">>
  ) => ProfileSaveResult;
  deleteCurrentProfile: () => boolean;
  resetCurrentProgress: () => void;
  }

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [currentProfile, setCurrentProfileState] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const existing = getCurrentProfile();
    const profileList = listProfiles();

    // A stale pointer is the common corruption: dg_current_profile names an id
    // that is not in dg_profiles, so getCurrentProfile() returns null and every
    // save reports "not found" even though the key exists and parses. Re-point at
    // a real profile rather than leaving the app with nothing selected.
    const repoint = (profile: Profile) => {
      setCurrentProfile(profile.id);
      setCurrentProfileState(profile);
      setProfiles(listProfiles());
      return profile;
    };

    if (!existing && profileList.length === 0) {
      setCurrentProfileState(createProfile("", "family"));
      setProfiles(listProfiles());
    } else if (existing) {
      migrateOldProgress(existing.id);
      setCurrentProfileState(existing);
      setProfiles(listProfiles());
    } else if (profileList.length > 0) {
      repoint(profileList[0]);
      migrateOldProgress(profileList[0].id);
    } else {
      setCurrentProfileState(createProfile("", "family"));
      setProfiles(listProfiles());
    }
    setIsLoaded(true);
  }, []);

  const createNewProfile = useCallback(
    (nickname: string = "", mode: FamilyMode = "family"): Profile | null => {
      const profile = createProfile(nickname, mode);
      // null means the write failed, so nothing was stored — adopting it would
      // show a profile that vanishes on reload.
      if (!profile) return null;
      // Adopt it, or the profile is written to storage but never appears: the
      // list only re-renders from state, so skipping these lines looks exactly
      // like the create button being dead.
      setCurrentProfile(profile.id);
      setCurrentProfileState(profile);
      setProfiles(listProfiles());
      return profile;
    },
    []
  );

  const switchProfile = useCallback((profileId: string) => {
    try {
      setCurrentProfile(profileId);
    } catch (err) {
      console.error("switchProfile: failed to switch to", profileId, err);
      return;
    }
    const profile = getProfile(profileId);
    if (profile) {
      migrateOldProgress(profileId);
      setCurrentProfileState(profile);
      setProfiles(listProfiles());
    }
  }, []);

  const updateCurrentProfile = useCallback(
    (
      updates: Partial<Pick<Profile, "nickname" | "mode">>
    ): ProfileSaveResult => {
      if (!currentProfile) return { ok: false, reason: "not-found" };
      const result = updateProfile(currentProfile.id, updates);
      if (result.ok) {
        setCurrentProfileState(result.profile);
        setProfiles(listProfiles());
      }
      // Pass the reason through: the caller decides what to tell the user, and
      // collapsing both failures into one message hides which one happened.
      return result;
    },
    [currentProfile]
  );

  const deleteCurrentProfile = useCallback(() => {
    if (!currentProfile) return false;
    const result = deleteProfile(currentProfile.id);
    if (result) {
      const remaining = listProfiles();
      if (remaining.length > 0) {
        const next = remaining[0];
        setCurrentProfile(next.id);
        setCurrentProfileState(next);
        setProfiles(remaining);
      } else {
        const defaultProfile = createProfile("", "family");
        setCurrentProfileState(defaultProfile);
        setProfiles(listProfiles());
      }
    }
    return result;
  }, [currentProfile]);

  const resetCurrentProgress = useCallback(() => {
    if (!currentProfile) return;
    if (typeof window === "undefined") return;
    localStorage.removeItem(getProfileStorageKey("dg_course", currentProfile.id));
    localStorage.removeItem(getProfileStorageKey("dg_workshops", currentProfile.id));
    localStorage.removeItem(getProfileStorageKey("dg_companion", currentProfile.id));
  }, [currentProfile]);

  const reloadProfiles = useCallback(() => {
    if (typeof window === "undefined") return;
    const existing = getCurrentProfile();
    const profileList = listProfiles();
    if (existing) {
      setCurrentProfileState(existing);
    } else if (profileList.length > 0) {
      const fallback = profileList[0];
      setCurrentProfile(fallback.id);
      setCurrentProfileState(fallback);
      migrateOldProgress(fallback.id);
    }
    setProfiles(profileList);
  }, []);

  if (!isLoaded) {
    return null;
  }

  return (
    <ProfileContext.Provider
      value={{
        currentProfile,
        profiles,
        reloadProfiles,
        createNewProfile,
        switchProfile,
        updateCurrentProfile,
        deleteCurrentProfile,
        resetCurrentProgress,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};

export const useProfileId = (): string | null => {
  const { currentProfile } = useProfile();
  return currentProfile?.id ?? null;
};

export const useSwitchProfile = (): ((profileId: string) => void) => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useSwitchProfile must be used within a ProfileProvider");
  }
  return context.switchProfile;
};
