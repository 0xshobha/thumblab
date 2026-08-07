import { z } from "zod";

import {
  AUDIENCES,
  EMOTIONS,
  HEADLINE_POSITIONS,
  SUBJECT_PLACEMENTS,
  STRATEGIES,
  VISUAL_STYLES,
} from "./types";

const safeText = (maximum: number) =>
  z
    .string()
    .trim()
    .max(maximum, "This field is too long.")
    .refine(
      (value) => !/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(value),
      "This field contains unsupported control characters.",
    );

export const creatorBriefSchema = z.object({
  videoTitle: safeText(120).min(3, "Add a video title."),
  videoDescription: safeText(1200).min(20, "Add a little more context about the video."),
  headline: safeText(90),
  audience: z.enum(AUDIENCES),
  visualStyle: z.enum(VISUAL_STYLES),
  emotion: z.enum(EMOTIONS),
  subjectPlacement: z.enum(SUBJECT_PLACEMENTS),
  headlinePosition: z.enum(HEADLINE_POSITIONS),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Choose a valid hex accent color."),
});

export const generationRequestSchema = creatorBriefSchema.extend({
  strategy: z.enum(STRATEGIES),
  refinement: safeText(240).optional(),
});

export function parseGenerationRequest(value: unknown) {
  return generationRequestSchema.safeParse(value);
}

export function isCreatorBriefValid(value: unknown) {
  return creatorBriefSchema.safeParse(value).success;
}
