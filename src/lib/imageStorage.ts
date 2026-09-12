import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export function validateImageFile(file: File): string {
  const extension = ALLOWED_IMAGES.get(file.type);
  if (!extension) throw new Error("JPEG、PNG、WebP形式の画像を選択してください");
  if (file.size === 0) throw new Error("画像ファイルが空です");
  if (file.size > MAX_IMAGE_BYTES) throw new Error("画像は10MB以下にしてください");
  return extension;
}

export async function saveInspectionImage(file: File, inspectionId: string) {
  const extension = validateImageFile(file);
  const buffer = Buffer.from(await file.arrayBuffer());
  try {
    const metadata = await sharp(buffer).metadata();
    if (!metadata.width || !metadata.height) throw new Error("invalid dimensions");
  } catch {
    throw new Error("画像データを読み込めませんでした");
  }

  const directory = path.join(process.cwd(), "public", "uploads", inspectionId);
  await mkdir(directory, { recursive: true });
  const filename = `${randomUUID()}.${extension}`;
  await writeFile(path.join(directory, filename), buffer);
  return `/uploads/${inspectionId}/${filename}`;
}

export function publicImagePath(imageUrl: string) {
  const relative = imageUrl.replace(/^\/+/, "");
  const fullPath = path.resolve(process.cwd(), "public", relative);
  const uploadsRoot = path.resolve(process.cwd(), "public", "uploads");
  if (!fullPath.startsWith(`${uploadsRoot}${path.sep}`)) throw new Error("不正な画像パスです");
  return fullPath;
}
