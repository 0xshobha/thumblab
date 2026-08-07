export const STRATEGIES = ["clarity", "curiosity", "emotion"] as const;
export type Strategy = (typeof STRATEGIES)[number];

export const AUDIENCES = [
  "general",
  "developers",
  "students",
  "founders",
  "gamers",
  "creators",
  "business",
  "education",
] as const;
export type Audience = (typeof AUDIENCES)[number];

export const VISUAL_STYLES = [
  "bold",
  "clean",
  "cinematic",
  "tech",
  "documentary",
  "gaming",
  "educational",
  "minimal",
] as const;
export type VisualStyle = (typeof VISUAL_STYLES)[number];

export const EMOTIONS = [
  "curiosity",
  "excitement",
  "urgency",
  "surprise",
  "trust",
  "serious",
] as const;
export type Emotion = (typeof EMOTIONS)[number];

export const SUBJECT_PLACEMENTS = ["left", "center", "right", "auto"] as const;
export type SubjectPlacement = (typeof SUBJECT_PLACEMENTS)[number];

export const HEADLINE_POSITIONS = ["left", "center", "right"] as const;
export type HeadlinePosition = (typeof HEADLINE_POSITIONS)[number];

export interface CreatorBrief {
  videoTitle: string;
  videoDescription: string;
  headline: string;
  audience: Audience;
  visualStyle: VisualStyle;
  emotion: Emotion;
  subjectPlacement: SubjectPlacement;
  headlinePosition: HeadlinePosition;
  accentColor: string;
}

export interface GenerationRequest extends CreatorBrief {
  strategy: Strategy;
  refinement?: string;
}

export type VariantStatus = "idle" | "generating" | "ready" | "error";

export interface VariantError {
  code: string;
  message: string;
}

export interface GeneratedVariant {
  strategy: Strategy;
  status: VariantStatus;
  image: string | null;
  error: VariantError | null;
  refinement: string;
}

export interface TypographySettings {
  headline: string;
  size: number;
  position: HeadlinePosition;
  fill: string;
  outline: string;
}

export const DEFAULT_BRIEF: CreatorBrief = {
  videoTitle: "",
  videoDescription: "",
  headline: "",
  audience: "general",
  visualStyle: "tech",
  emotion: "curiosity",
  subjectPlacement: "auto",
  headlinePosition: "left",
  accentColor: "#d7ff4f",
};

export const DEFAULT_TYPOGRAPHY: TypographySettings = {
  headline: "",
  size: 76,
  position: "left",
  fill: "#ffffff",
  outline: "#111111",
};

export const STRATEGY_LABELS: Record<Strategy, string> = {
  clarity: "Clarity",
  curiosity: "Curiosity",
  emotion: "Emotion",
};

export const STRATEGY_TAGLINES: Record<Strategy, string> = {
  clarity: "Make the idea obvious",
  curiosity: "Create a truthful question",
  emotion: "Lead with visual energy",
};

export const STRATEGY_DESCRIPTIONS: Record<Strategy, string> = {
  clarity: "One dominant subject, clean hierarchy, and immediate topic recognition.",
  curiosity: "Tension, contrast, or a partial reveal that invites the next click.",
  emotion: "Expressive framing, dramatic scale, and a stronger emotional read.",
};

export function createInitialVariants(): Record<Strategy, GeneratedVariant> {
  return {
    clarity: {
      strategy: "clarity",
      status: "idle",
      image: null,
      error: null,
      refinement: "",
    },
    curiosity: {
      strategy: "curiosity",
      status: "idle",
      image: null,
      error: null,
      refinement: "",
    },
    emotion: {
      strategy: "emotion",
      status: "idle",
      image: null,
      error: null,
      refinement: "",
    },
  };
}
