import { describe, expect, it } from "vitest";
import { createInspectionSchema, updateInspectionSchema } from "./validation";

describe("inspection validation", () => {
  it("accepts a valid device", () => {
    expect(createInspectionSchema.safeParse({ model: "iPhone 15", storageGb: "128", imei: "490154203237518", batteryHealth: "88" }).success).toBe(true);
  });

  it("rejects invalid ranges and IMEI length", () => {
    expect(createInspectionSchema.safeParse({ model: "", storageGb: 0, imei: "123", batteryHealth: 101 }).success).toBe(false);
  });

  it("requires at least one update field", () => {
    expect(updateInspectionSchema.safeParse({}).success).toBe(false);
  });
});
