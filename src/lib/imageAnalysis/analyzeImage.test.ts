import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import sharp from "sharp";
import { afterEach, describe, expect, it } from "vitest";
import { analyzeImage } from "./analyzeImage";

let directory: string | undefined;
afterEach(async () => { if (directory) await rm(directory, { recursive: true, force: true }); directory = undefined; });

describe("analyzeImage", () => {
  it("returns no defects for a uniformly colored image", async () => {
    directory = await mkdtemp(path.join(tmpdir(), "smartphone-inspection-"));
    const imagePath = path.join(directory, "plain.png");
    await sharp({ create: { width: 100, height: 100, channels: 3, background: "white" } }).png().toFile(imagePath);
    await expect(analyzeImage(imagePath)).resolves.toEqual([]);
  });
});
