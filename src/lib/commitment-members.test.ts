import { describe, it, expect } from "vitest";
import { parseMemberOptions } from "./commitment-members";

describe("parseMemberOptions", () => {
  it("splits a comma-separated Members field", () => {
    expect(parseMemberOptions("Mom, Dad, Alex")).toEqual(["Mom", "Dad", "Alex"]);
  });

  it("trims whitespace and drops empty entries", () => {
    expect(parseMemberOptions("  Mom ,, Dad ,  ")).toEqual(["Mom", "Dad"]);
  });

  it("returns an empty list for an empty or blank field", () => {
    expect(parseMemberOptions("")).toEqual([]);
    expect(parseMemberOptions("   ")).toEqual([]);
    expect(parseMemberOptions(", ,")).toEqual([]);
  });

  it("preserves a single name", () => {
    expect(parseMemberOptions("Elise")).toEqual(["Elise"]);
  });
});
