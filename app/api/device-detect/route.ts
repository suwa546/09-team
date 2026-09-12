import { z } from "zod";
import { auth } from "@/auth";
import { detectDevice } from "@/bridge/detect-device.mjs";

const deviceResponse = z.object({
  connected: z.boolean(), platform: z.enum(["android", "iphone"]).nullable(), model: z.string().nullable(),
  storageGb: z.number().int().positive().nullable(), imei: z.string().regex(/^\d{15}$/).nullable(),
  batteryHealth: z.number().int().min(0).max(100).nullable(), chargeCycles: z.number().int().min(0).nullable(),
  missingFields: z.array(z.string()), message: z.string().optional(),
});

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "認証が必要です" }, { status: 401 });

  try {
    const parsed = deviceResponse.safeParse(await detectDevice());
    if (!parsed.success) {
      return Response.json({ error: "端末検出処理から不正な応答を受信しました" }, { status: 502 });
    }

    return Response.json(parsed.data, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json(
      { connected: false, error: "端末情報の取得中にエラーが発生しました。USB接続と端末側の許可を確認してください。" },
      { status: 500 },
    );
  }
}
