import { useState, useEffect, useCallback } from "react";
import { useProfileId } from "@/context/ProfileContext";
import { getProfileStorageKey } from "@/lib/profiles";

interface ProgressState {
  [workshopId: string]: {
    [moduleId: string]: boolean;
  };
}

export const useWorkshopProgress = (workshopId?: string, totalModules?: number) => {
  const profileId = useProfileId();
  const [progress, setProgress] = useState<ProgressState>({});

  useEffect(() => {
    try {
      const key =
        profileId != null
          ? getProfileStorageKey("dg_workshops", profileId)
          : "guardd_workshop_progress";
      const saved = typeof window !== "undefined" ? localStorage.getItem(key) : null;
      if (saved) setProgress(JSON.parse(saved));
    } catch (e) {
      console.error("Failed to parse progress", e);
    }
  }, [profileId]);

  const saveProgress = useCallback(
    (newProgress: ProgressState) => {
      setProgress(newProgress);
      const key =
        profileId != null
          ? getProfileStorageKey("dg_workshops", profileId)
          : "guardd_workshop_progress";
      if (typeof window === "undefined") return;
      localStorage.setItem(key, JSON.stringify(newProgress));
    },
    [profileId]
  );

  const completeModule = useCallback(
    (wsId: string, moduleId: string) => {
      setProgress((prev) => {
        const updated = {
          ...prev,
          [wsId]: {
            ...prev[wsId],
            [moduleId]: true,
          },
        };
        const key =
          profileId != null
            ? getProfileStorageKey("dg_workshops", profileId)
            : "guardd_workshop_progress";
        if (typeof window !== "undefined") {
          localStorage.setItem(key, JSON.stringify(updated));
        }
        return updated;
      });
    },
    [profileId]
  );

  const getWorkshopProgress = useCallback(
    (wsId: string, totalModules: number) => {
      const completed = Object.values(progress[wsId] || {}).filter(
        Boolean
      ).length;
      return totalModules > 0 ? (completed / totalModules) * 100 : 0;
    },
    [progress]
  );

  const isModuleComplete = useCallback(
    (wsId: string, moduleId: string) => {
      return !!progress[wsId]?.[moduleId];
    },
    [progress]
  );

  const currentProgress = workshopId && totalModules
    ? getWorkshopProgress(workshopId, totalModules)
    : 0;

  return {
    progress: currentProgress,
    rawProgress: progress,
    completeModule,
    getWorkshopProgress,
    isModuleComplete,
  };
};
