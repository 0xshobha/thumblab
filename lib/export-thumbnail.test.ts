import { describe, expect, it } from "vitest";

import { getHeadlineAnchor, wrapHeadline } from "./export-thumbnail";

describe("wrapHeadline", () => {
  it("returns no lines for a blank headline", () => {
    expect(wrapHeadline("   ")).toEqual([]);
  });

  it("keeps a short headline on one line", () => {
    expect(wrapHeadline("MY AI CEO")).toEqual(["MY AI CEO"]);
  });

  it("wraps multiple words predictably", () => {
    expect(wrapHeadline("THE AGENT THAT RUNS MY STARTUP", 15)).toEqual([
      "THE AGENT THAT",
      "RUNS MY STARTUP",
    ]);
  });

  it("splits an unusually long word rather than overflowing", () => {
    expect(wrapHeadline("SUPERCALIFRAGILISTIC", 8)).toEqual(["SUPERCAL", "IFRAGILI", "STIC"]);
  });
});

describe("getHeadlineAnchor", () => {
  it("uses safe margins for left and right positions", () => {
    expect(getHeadlineAnchor("left", 1280, 72)).toBe(72);
    expect(getHeadlineAnchor("right", 1280, 72)).toBe(1208);
  });

  it("centers centered headlines", () => {
    expect(getHeadlineAnchor("center", 1280)).toBe(640);
  });
});
