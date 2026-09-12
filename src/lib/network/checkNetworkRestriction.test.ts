import { describe, expect, it } from "vitest";
import { checkNetworkRestriction } from "./checkNetworkRestriction";

describe("checkNetworkRestriction", () => {
  it("returns RESTRICTED when the last digit is divisible by five", async () => expect(checkNetworkRestriction("12345")).resolves.toBe("RESTRICTED"));
  it("returns OK for other digits", async () => expect(checkNetworkRestriction("12348")).resolves.toBe("OK"));
  it("returns UNKNOWN for an invalid final character", async () => expect(checkNetworkRestriction("invalid")).resolves.toBe("UNKNOWN"));
});
