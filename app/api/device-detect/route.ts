import { z } from "zod";
import { auth } from "@/auth";

const bridgeResponse = z.object({
  connected: z.boolean(), platform: z.enum(["android", "iphone"]).nullable(), model: z.string().nullable(),
  storageGb: z.number().int().positive().nullable(), imei: z.string().regex(/^\d{15}$/).nullable(),
  batteryHealth: z.number().int().min(0).max(100).nullable(), chargeCycles: z.number().int().min(0).nullable(),
  missingFields: z.array(z.string()), message: z.string().optional(),
});

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "認証が必要です" }, { status: 401 });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const baseUrl = process.env.DEVICE_BRIDGE_URL || "http://127.0.0.1:4123";
    const response = await fetch(new URL("/device", baseUrl), { cache: "no-store", signal: controller.signal });
    if (!response.ok) throw new Error("bridge error");
    const parsed = bridgeResponse.safeParse(await response.json());
    if (!parsed.success) return Response.json({ error: "端末ブリッジから不正な応答を受信しました" }, { status: 502 });
    return Response.json(parsed.data);
  } catch {
    return Response.json({ connected: false, error: "端末ブリッジに接続できません。別のターミナルで npm run bridge を起動してください。" }, { status: 503 });
  } finally { clearTimeout(timeout); }
}
