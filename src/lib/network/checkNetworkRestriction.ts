export type NetworkRestrictionResult = "OK" | "RESTRICTED" | "UNKNOWN";

export async function checkNetworkRestriction(imei: string): Promise<NetworkRestrictionResult> {
  // 本番ではキャリアのネットワーク利用制限照会APIに差し替える。
  const lastDigit = Number(imei.slice(-1));
  if (Number.isNaN(lastDigit) || imei.length === 0) return "UNKNOWN";
  return lastDigit % 5 === 0 ? "RESTRICTED" : "OK";
}
