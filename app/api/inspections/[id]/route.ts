import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/src/lib/prisma";
import { updateInspectionSchema, validationMessage } from "@/src/lib/validation";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "認証が必要です" }, { status: 401 });
  const { id } = await params;
  const inspection = await prisma.inspection.findUnique({
    where: { id }, include: { device: true, images: { orderBy: { createdAt: "asc" } }, staff: { select: { id: true, name: true } } },
  });
  if (!inspection) return Response.json({ error: "検品が見つかりません" }, { status: 404 });
  return Response.json({ inspection });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "認証が必要です" }, { status: 401 });
  const { id } = await params;
  const parsed = updateInspectionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: validationMessage(parsed.error) }, { status: 400 });
  const current = await prisma.inspection.findUnique({ where: { id }, select: { id: true, completedAt: true } });
  if (!current) return Response.json({ error: "検品が見つかりません" }, { status: 404 });

  const data: Prisma.InspectionUpdateInput = { ...parsed.data };
  if (parsed.data.status === "DONE" && !current.completedAt) data.completedAt = new Date();
  if (parsed.data.status && parsed.data.status !== "DONE") data.completedAt = null;
  const inspection = await prisma.inspection.update({ where: { id }, data, include: { device: true, images: true } });
  return Response.json({ inspection });
}
