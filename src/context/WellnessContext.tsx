import React, { createContext, useContext, useState, useEffect, ReactNode, FC } from 'react';
import type { FamilyMode } from '@/lib/profiles';
import { getCurrentProfile, getProfileStorageKey } from '@/lib/profiles';
import { useProfileId } from '@/context/ProfileContext';

export type AgeGroup = 'toddler' | 'child' | 'teen' | 'adult';

export type ContentAgeGroup = 'kids' | 'teens' | 'parents' | 'both' | 'family';

interface WellnessContextType {
  mode: FamilyMode;
  setMode: (mode: FamilyMode) => void;
  contentAgeGroup: ContentAgeGroup;
  setContentAgeGroup: (g: ContentAgeGroup) => void;
}

const WellnessContext = createContext<WellnessContextType | undefined>(undefined);

/**
 * The age group the content is filtered by.
 *
 * This used to be plain in-memory state seeded to 'family' and never written
 * anywhere, so it reset on every page load and any choice was lost. Importing a
 * profile changed `mode` (which does read the profile) but left this stuck on its
 * default, because nothing connected the two.
 *
 * It is now a real preference, stored per profile with the same key convention
 * every other feature uses, so it survives reloads and follows the profile.
 */
const AGE_GROUP_KEY_PREFIX = 'dg_content_age_group';

export const WellnessProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<FamilyMode>('family');
  const [contentAgeGroup, setContentAgeGroup] = useState<ContentAgeGroup>('family');
  // Read from ProfileContext rather than polling localStorage: this re-renders
  // when the profile is switched or imported, with no custom event to keep in sync.
  const profileId = useProfileId();

  // `mode` belongs to the profile itself and is read from it directly.
  useEffect(() => {
    const profile = getCurrentProfile();
    if (profile?.mode) setMode(profile.mode);
  }, [profileId]);

  const storageKey = profileId != null
    ? getProfileStorageKey(AGE_GROUP_KEY_PREFIX, profileId)
    : `${AGE_GROUP_KEY_PREFIX}_guest`;

  // Load the stored preference whenever the profile changes. 'family' is the
  // default for a fresh profile; a missing key means never chosen.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      setContentAgeGroup(saved ? (saved as ContentAgeGroup) : 'family');
    } catch {
      setContentAgeGroup('family');
    }
  }, [storageKey]);

  const updateContentAgeGroup = (g: ContentAgeGroup) => {
    setContentAgeGroup(g);
    try {
      localStorage.setItem(storageKey, g);
    } catch (e) {
      console.error('Failed to save content age group', e);
    }
  };

  return (
    <WellnessContext.Provider value={{ mode, setMode, contentAgeGroup, setContentAgeGroup: updateContentAgeGroup }}>
      {children}
    </WellnessContext.Provider>
  );
};

export const useWellness = () => {
  const context = useContext(WellnessContext);
  return context ?? { mode: 'family', setMode: () => {}, contentAgeGroup: 'family', setContentAgeGroup: () => {} };
};
