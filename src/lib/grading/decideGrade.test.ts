import { describe, expect, it } from "vitest";
import { decideGrade } from "./decideGrade";

describe("decideGrade", () => {
  it("returns A when no defects exist", () => expect(decideGrade([])).toBe("A"));
  it("returns B for up to five small scratches", () => expect(decideGrade(Array.from({ length: 5 }, () => ({ type: "scratch" as const, sizeMm: 1 })))).toBe("B"));
  it("returns C for too many scratches", () => expect(decideGrade(Array.from({ length: 6 }, () => ({ type: "scratch" as const, sizeMm: 0.5 })))).toBe("C"));
  it.each(["dent", "crack"] as const)("returns C for a %s", (type) => expect(decideGrade([{ type, sizeMm: 0.5 }])).toBe("C"));
  it("returns C for a scratch larger than 1 mm", () => expect(decideGrade([{ type: "scratch", sizeMm: 1.01 }])).toBe("C"));
});
