import sharp from "sharp";
import type { Defect, DefectType } from "../grading/decideGrade";
import { IMAGE_ANALYSIS_THRESHOLDS as T } from "../grading/thresholds";

type Component = { minX: number; maxX: number; minY: number; maxY: number; pixels: number };

function edgeMask(data: Buffer, width: number, height: number) {
  const mask = new Uint8Array(width * height);
  const at = (x: number, y: number) => data[y * width + x];
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const gx = -at(x - 1, y - 1) + at(x + 1, y - 1) - 2 * at(x - 1, y) + 2 * at(x + 1, y) - at(x - 1, y + 1) + at(x + 1, y + 1);
      const gy = -at(x - 1, y - 1) - 2 * at(x, y - 1) - at(x + 1, y - 1) + at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1);
      if (Math.hypot(gx, gy) >= T.sobelEdgeStrength) mask[y * width + x] = 1;
    }
  }
  return mask;
}

function components(mask: Uint8Array, width: number, height: number): Component[] {
  const seen = new Uint8Array(mask.length);
  const found: Component[] = [];
  const neighbors = [-1, 0, 1];
  for (let start = 0; start < mask.length; start++) {
    if (!mask[start] || seen[start]) continue;
    const queue = [start]; seen[start] = 1;
    const component: Component = { minX: start % width, maxX: start % width, minY: Math.floor(start / width), maxY: Math.floor(start / width), pixels: 0 };
    for (let cursor = 0; cursor < queue.length; cursor++) {
      const index = queue[cursor]; const x = index % width; const y = Math.floor(index / width);
      component.pixels++; component.minX = Math.min(component.minX, x); component.maxX = Math.max(component.maxX, x); component.minY = Math.min(component.minY, y); component.maxY = Math.max(component.maxY, y);
      for (const dy of neighbors) for (const dx of neighbors) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx; const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const next = ny * width + nx;
        if (mask[next] && !seen[next]) { seen[next] = 1; queue.push(next); }
      }
    }
    if (component.pixels >= T.minComponentPixels && component.pixels <= width * height * T.maxComponentAreaRatio) found.push(component);
  }
  return found;
}

function defectType(width: number, height: number, pixels: number): DefectType {
  const aspect = Math.max(width, height) / Math.max(1, Math.min(width, height));
  if (aspect >= T.crackAspectRatio) return "crack";
  if (pixels >= T.dentMinAreaPixels) return "dent";
  return "scratch";
}

export async function analyzeImage(imagePath: string): Promise<Defect[]> {
  const { data, info } = await sharp(imagePath)
    .resize({ width: T.maxWidthPx, withoutEnlargement: true })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const mask = edgeMask(data, info.width, info.height);
  return components(mask, info.width, info.height).map((component) => {
    const width = component.maxX - component.minX + 1;
    const height = component.maxY - component.minY + 1;
    const sizeMm = Number((Math.max(width, height) * T.millimetersPerPixel).toFixed(2));
    return {
      type: defectType(width, height, component.pixels),
      x: component.minX, y: component.minY, width, height, sizeMm,
      severity: sizeMm > 3 ? "high" : sizeMm > 1 ? "medium" : "low",
    };
  });
}
