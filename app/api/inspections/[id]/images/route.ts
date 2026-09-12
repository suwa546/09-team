import { ImageAngle } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/src/lib/prisma";
import { saveInspectionImage } from "@/src/lib/imageStorage";

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "認証が必要です" }, { status: 401 });
  const { id } = await params;
  const inspection = await prisma.inspection.findUnique({ where: { id }, select: { id: true } });
  if (!inspection) return Response.json({ error: "検品が見つかりません" }, { status: 404 });

  const formData = await request.formData();
  const image = formData.get("image");
  const angleValue = formData.get("angle");
  if (!(image instanceof File)) return Response.json({ error: "画像を選択してください" }, { status: 400 });
  if (typeof angleValue !== "string" || !Object.values(ImageAngle).includes(angleValue as ImageAngle)) {
    return Response.json({ error: "撮影アングルが不正です" }, { status: 400 });
  }

  try {
    const imageUrl = await saveInspectionImage(image, id);
    const savedImage = await prisma.inspectionImage.create({
      data: { inspectionId: id, angle: angleValue as ImageAngle, imageUrl },
    });
    return Response.json({ image: savedImage }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "画像を保存できませんでした" }, { status: 400 });
  }
}
