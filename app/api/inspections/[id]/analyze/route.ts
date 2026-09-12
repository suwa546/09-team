import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { decideGrade, type Defect } from "@/src/lib/grading/decideGrade";
import { analyzeImage } from "@/src/lib/imageAnalysis/analyzeImage";
import { publicImagePath } from "@/src/lib/imageStorage";
import { prisma } from "@/src/lib/prisma";

export const runtime = "nodejs";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "認証が必要です" }, { status: 401 });
  const { id } = await params;
  const inspection = await prisma.inspection.findUnique({ where: { id }, include: { images: true } });
  if (!inspection) return Response.json({ error: "検品が見つかりません" }, { status: 404 });
  if (inspection.images.length === 0) return Response.json({ error: "解析する画像がありません" }, { status: 400 });

  try {
    const results: Array<{ imageId: string; defects: Defect[] }> = [];
    for (const image of inspection.images) {
      results.push({ imageId: image.id, defects: await analyzeImage(publicImagePath(image.imageUrl)) });
    }
    const defects = results.flatMap((result) => result.defects);
    const grade = decideGrade(defects);
    await prisma.$transaction([
      ...results.map((result) => prisma.inspectionImage.update({ where: { id: result.imageId }, data: { detectedDefects: result.defects as Prisma.InputJsonValue } })),
      prisma.inspection.update({ where: { id }, data: { grade, status: "IN_PROGRESS" } }),
    ]);
    return Response.json({ grade, defects, imageResults: results });
  } catch (error) {
    console.error("Image analysis failed", error);
    return Response.json({ error: "画像解析に失敗しました。画像を確認してください。" }, { status: 422 });
  }
}
