import { describe, expect, it } from "vitest";
import { MAX_IMAGE_BYTES, publicImagePath, validateImageFile } from "./imageStorage";

describe("image storage", () => {
  it("accepts supported image MIME types", () => {
    expect(validateImageFile(new File(["image"], "phone.jpg", { type: "image/jpeg" }))).toBe("jpg");
  });

  it("rejects unsupported and oversized files", () => {
    expect(() => validateImageFile(new File(["x"], "x.gif", { type: "image/gif" }))).toThrow();
    expect(() => validateImageFile(new File([new Uint8Array(MAX_IMAGE_BYTES + 1)], "x.png", { type: "image/png" }))).toThrow();
  });

  it("blocks paths outside the upload directory", () => {
    expect(() => publicImagePath("/../secret.txt")).toThrow();
  });
});
