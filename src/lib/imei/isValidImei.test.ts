import { describe, expect, it } from "vitest";
import { isValidImei } from "./isValidImei";

describe("isValidImei", () => {
  it("accepts a valid IMEI", () => expect(isValidImei("490154203237518")).toBe(true));
  it("ignores display separators", () => expect(isValidImei("49-015420-323751-8")).toBe(true));
  it("rejects an invalid check digit", () => expect(isValidImei("490154203237519")).toBe(false));
  it("rejects a non-15-digit number", () => expect(isValidImei("12345")).toBe(false));
});
