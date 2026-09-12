import { runCommand } from "./command.mjs";
import { normalizeStorageGb } from "./android.mjs";

function parseKeyValues(output) {
  return Object.fromEntries(output.split(/\r?\n/).map((line) => line.match(/^([^:]+):\s*(.*)$/)).filter(Boolean).map((match) => [match[1].trim(), match[2].trim()]));
}

async function optional(command) {
  try { return await command(); } catch { return ""; }
}

export async function detectIphone(run = runCommand) {
  const idTool = process.env.IDEVICE_ID_PATH || "idevice_id";
  const infoTool = process.env.IDEVICEINFO_PATH || "ideviceinfo";
  const udid = (await run(idTool, ["-l"])).split(/\r?\n/).find(Boolean)?.trim();
  if (!udid) return null;
  const info = parseKeyValues(await run(infoTool, ["-u", udid]));
  const battery = parseKeyValues(await optional(() => run(infoTool, ["-u", udid, "-q", "com.apple.mobile.battery"])));
  const totalBytes = Number(info.TotalDiskCapacity);
  return {
    connected: true,
    platform: "iphone",
    model: info.DeviceName || info.ProductType || null,
    storageGb: Number.isFinite(totalBytes) && totalBytes > 0 ? normalizeStorageGb(totalBytes / 1024 / 1024 / 1024) : null,
    imei: info.InternationalMobileEquipmentIdentity?.match(/\d{15}/)?.[0] ?? null,
    batteryHealth: Number(battery.BatteryCurrentCapacity) || null,
    chargeCycles: Number(battery.CycleCount) || null,
    missingFields: [],
  };
}
