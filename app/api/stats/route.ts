import { auth } from "@/auth";
import { prisma } from "@/src/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "認証が必要です" }, { status: 401 });
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const [total, todayCount, grades, statuses, completed] = await Promise.all([
    prisma.inspection.count(),
    prisma.inspection.count({ where: { startedAt: { gte: today } } }),
    prisma.inspection.groupBy({ by: ["grade"], _count: { _all: true } }),
    prisma.inspection.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.inspection.findMany({ where: { completedAt: { not: null } }, select: { startedAt: true, completedAt: true } }),
  ]);
  const averageProcessingMinutes = completed.length
    ? Math.round(completed.reduce((sum, item) => sum + ((item.completedAt?.getTime() ?? item.startedAt.getTime()) - item.startedAt.getTime()), 0) / completed.length / 60000)
    : 0;
  return Response.json({
    total, todayCount, averageProcessingMinutes,
    grades: Object.fromEntries(grades.map((item) => [item.grade, item._count._all])),
    statuses: Object.fromEntries(statuses.map((item) => [item.status, item._count._all])),
  });
}
