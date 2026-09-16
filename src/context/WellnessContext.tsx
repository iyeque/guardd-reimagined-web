import React, { createContext, useContext, useState, ReactNode, FC } from 'react';
import type { FamilyMode } from '@/lib/profiles';

export type AgeGroup = 'toddler' | 'child' | 'teen' | 'adult';

export type ContentAgeGroup = 'kids' | 'teens' | 'parents' | 'both' | 'family';

interface WellnessContextType {
  mode: FamilyMode;
  setMode: (mode: FamilyMode) => void;
  contentAgeGroup: ContentAgeGroup;
  setContentAgeGroup: (g: ContentAgeGroup) => void;
}

const WellnessContext = createContext<WellnessContextType | undefined>(undefined);

export const WellnessProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<FamilyMode>('family');
  const [contentAgeGroup, setContentAgeGroup] = useState<ContentAgeGroup>('family');

  return (
    <WellnessContext.Provider value={{ mode, setMode, contentAgeGroup, setContentAgeGroup }}>
      {children}
    </WellnessContext.Provider>
  );
};

export const useWellness = () => {
  const context = useContext(WellnessContext);
  return context ?? { mode: 'family', setMode: () => {}, contentAgeGroup: 'family', setContentAgeGroup: () => {} };
};
