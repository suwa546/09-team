import { describe, expect, it } from "vitest";
import { assertNicosumaProductUrl } from "./config";

describe("assertNicosumaProductUrl", () => {
  it("allows a query-free official product page", () => expect(assertNicosumaProductUrl("https://www.nicosuma.com/iphone/iphone-15-pro")).toBe("https://www.nicosuma.com/iphone/iphone-15-pro"));
  it("allows an official trade-in product page", () => expect(assertNicosumaProductUrl("https://www.nicosuma.com/sell/smartphone/iphone/iphone-15-pro")).toBe("https://www.nicosuma.com/sell/smartphone/iphone/iphone-15-pro"));
  it.each(["https://example.com/iphone/x", "https://www.nicosuma.com/iphone/x?cb_grades=A", "https://www.nicosuma.com/en/iphone/x"])("rejects unsafe URL %s", (url) => expect(() => assertNicosumaProductUrl(url)).toThrow());
});
