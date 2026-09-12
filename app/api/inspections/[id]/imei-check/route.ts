import { auth } from "@/auth";
import { isValidImei } from "@/src/lib/imei/isValidImei";
import { checkNetworkRestriction } from "@/src/lib/network/checkNetworkRestriction";
import { prisma } from "@/src/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "認証が必要です" }, { status: 401 });
  const { id } = await params;
  const inspection = await prisma.inspection.findUnique({ where: { id }, include: { device: true } });
  if (!inspection) return Response.json({ error: "検品が見つかりません" }, { status: 404 });

  const imeiValid = isValidImei(inspection.device.imei);
  const networkRestricted = await checkNetworkRestriction(inspection.device.imei);
  await prisma.inspection.update({ where: { id }, data: { imeiValid, networkRestricted } });
  return Response.json({ imei: inspection.device.imei, imeiValid, networkRestricted });
}
