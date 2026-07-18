import React, { createContext, useContext, useState, ReactNode, FC } from 'react';
import { FamilyMode } from '../components/wellness/FamilyModeSwitcher';

interface WellnessContextType {
  mode: FamilyMode;
  setMode: (mode: FamilyMode) => void;
}

const WellnessContext = createContext<WellnessContextType | undefined>(undefined);

export const WellnessProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<FamilyMode>('family');

  return (
    <WellnessContext.Provider value={{ mode, setMode }}>
      {children}
    </WellnessContext.Provider>
  );
};

export const useWellness = () => {
  const context = useContext(WellnessContext);
  return context ?? { mode: 'family', setMode: () => {} };
};
