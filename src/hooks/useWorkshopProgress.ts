import { useState, useEffect, useCallback } from "react";

interface ProgressState {
  [workshopId: string]: {
    [moduleId: string]: boolean;
  };
}

export const useWorkshopProgress = (workshopId?: string) => {
  const [progress, setProgress] = useState<ProgressState>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem("guardd_workshop_progress");
      if (saved) setProgress(JSON.parse(saved));
    } catch (e) {
      console.error("Failed to parse progress", e);
    }
  }, []);

  const saveProgress = useCallback((newProgress: ProgressState) => {
    setProgress(newProgress);
    localStorage.setItem(
      "guardd_workshop_progress",
      JSON.stringify(newProgress)
    );
  }, []);

  const completeModule = useCallback((wsId: string, moduleId: string) => {
    setProgress((prev) => {
      const updated = {
        ...prev,
        [wsId]: {
          ...prev[wsId],
          [moduleId]: true,
        },
      };
      localStorage.setItem(
        "guardd_workshop_progress",
        JSON.stringify(updated)
      );
      return updated;
    });
  }, []);

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

  const currentProgress = workshopId
    ? getWorkshopProgress(workshopId, 5)
    : 0;

  return {
    progress: currentProgress,
    rawProgress: progress,
    completeModule,
    getWorkshopProgress,
    isModuleComplete,
  };
};
