import { describe, expect, it } from "vitest";

import { parseGenerationRequest } from "./validation";
import { DEFAULT_BRIEF } from "./types";

const validRequest = {
  ...DEFAULT_BRIEF,
  videoTitle: "I built an agent",
  videoDescription: "A short, practical walkthrough of the agent and the work it automates.",
  headline: "MY AI CEO",
  strategy: "clarity",
};

describe("generation request validation", () => {
  it("accepts a valid request", () => {
    expect(parseGenerationRequest(validRequest).success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = parseGenerationRequest({
      ...validRequest,
      videoTitle: "",
      videoDescription: undefined,
    });

    expect(result.success).toBe(false);
  });

  it("rejects oversized fields", () => {
    const result = parseGenerationRequest({
      ...validRequest,
      videoDescription: "a".repeat(1201),
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid strategies and colors", () => {
    const result = parseGenerationRequest({
      ...validRequest,
      strategy: "ctr-score",
      accentColor: "chartreuse",
    });

    expect(result.success).toBe(false);
  });
});
