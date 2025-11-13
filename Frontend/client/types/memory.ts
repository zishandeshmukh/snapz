export type MemoryType = "article" | "video" | "image" | "note";

export type Emotion =
  | "funny"
  | "inspiring"
  | "sad"
  | "angry"
  | "calm"
  | "awe"
  | "neutral";

export interface MemoryItem {
  id: string;
  title: string;
  summary?: string;
  keywords?: string[];
  emotion?: string;
  mood?: string;
  timestamp: string;
  url?: string;
  type: string;
  favorite: boolean;
  imageDataUrl?: string | null;
}

export interface Preferences {
  localOnly: boolean;
  excludedKeywords: string[];
}
