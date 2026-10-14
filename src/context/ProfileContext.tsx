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
} from "@/lib/profiles";

interface ProfileContextType {
  currentProfile: Profile | null;
  profiles: Profile[];
  reloadProfiles: () => void;
  createNewProfile: (nickname?: string, mode?: FamilyMode) => Profile | null;
  switchProfile: (profileId: string) => void;
  updateCurrentProfile: (
    updates: Partial<Pick<Profile, "nickname" | "mode">>
  ) => Profile | null;
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

    if (!existing && profileList.length === 0) {
      const defaultProfile = createProfile("", "family");
      setCurrentProfileState(defaultProfile);
      setProfiles(listProfiles());
    } else if (existing) {
      migrateOldProgress(existing.id);
      setCurrentProfileState(existing);
      setProfiles(listProfiles());
    } else if (profileList.length > 0) {
      const fallback = profileList[0];
      setCurrentProfile(fallback.id);
      setCurrentProfileState(fallback);
      setProfiles(listProfiles());
      migrateOldProgress(fallback.id);
    } else {
      const defaultProfile = createProfile("", "family");
      setCurrentProfileState(defaultProfile);
      setProfiles(listProfiles());
    }
    setIsLoaded(true);
  }, []);

  const createNewProfile = useCallback(
    (nickname: string = "", mode: FamilyMode = "family"): Profile | null => {
      // null means the write failed, so the profile was never stored. Callers
      // must not adopt it — it would appear in the UI and vanish on reload.
      return createProfile(nickname, mode);
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
    ): Profile | null => {
      if (!currentProfile) return null;
      const updated = updateProfile(currentProfile.id, updates);
      if (updated) {
        setCurrentProfileState(updated);
        setProfiles(listProfiles());
        return updated;
      }
      // null means the write did not land — almost always localStorage quota.
      // Callers need to know so they can say so instead of failing silently.
      return null;
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
