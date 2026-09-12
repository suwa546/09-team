import { Grade, Status, type Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/src/lib/prisma";
import { createInspectionSchema, validationMessage } from "@/src/lib/validation";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "認証が必要です" }, { status: 401 });

  const query = new URL(request.url).searchParams;
  const where: Prisma.InspectionWhereInput = {};
  const grade = query.get("grade");
  const status = query.get("status");
  const from = query.get("from");
  const to = query.get("to");
  const search = query.get("search")?.trim();

  if (["A", "B", "C", "UNRATED"].includes(grade ?? "")) where.grade = grade as Grade;
  if (["PENDING", "IN_PROGRESS", "DONE"].includes(status ?? "")) where.status = status as Status;
  if (from || to) {
    where.startedAt = {};
    if (from) where.startedAt.gte = new Date(`${from}T00:00:00`);
    if (to) where.startedAt.lte = new Date(`${to}T23:59:59.999`);
  }
  if (search) where.device = { OR: [{ model: { contains: search } }, { imei: { contains: search } }] };

  const inspections = await prisma.inspection.findMany({
    where,
    include: { device: true, staff: { select: { id: true, name: true } }, _count: { select: { images: true } } },
    orderBy: { startedAt: "desc" },
  });
  return Response.json({ inspections });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "認証が必要です" }, { status: 401 });

  const parsed = createInspectionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: validationMessage(parsed.error) }, { status: 400 });

  const inspection = await prisma.inspection.create({
    data: {
      staff: { connect: { id: session.user.id } },
      batteryHealth: parsed.data.batteryHealth,
      chargeCycles: parsed.data.chargeCycles,
      notes: parsed.data.notes,
      device: { create: { model: parsed.data.model, storageGb: parsed.data.storageGb, imei: parsed.data.imei } },
    },
    include: { device: true },
  });
  return Response.json({ inspection }, { status: 201 });
}
