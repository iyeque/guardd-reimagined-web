export interface CourseAssetEntry {
  moduleId: string;
  title: string;
  duration: string;
  audio: string;
  video: string;
  final: string;
  overlay: string;
  actionPause?: {
    enabled: boolean;
    timeSeconds: number;
    title: string;
  };
}

export interface CourseManifest {
  version: string;
  title: string;
  modules: CourseAssetEntry[];
  productionHosting: {
    dev: string;
    recommended: string;
    notes: string;
  };
}

export const COURSE_ASSETS_PATH = "/course-assets/manifest.json";

export const getCourseManifest = async (): Promise<CourseManifest> => {
  const res = await fetch(COURSE_ASSETS_PATH, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Failed to load course manifest");
  }
  return res.json();
};

export const resolveAssetForModule = (entry: CourseAssetEntry): {
  primarySrc: string;
  type: "video" | "audio";
} => {
  if (entry.final) {
    return { primarySrc: entry.final, type: "video" };
  }
  if (entry.video) {
    return { primarySrc: entry.video, type: "video" };
  }
  return { primarySrc: entry.audio, type: "audio" };
};
