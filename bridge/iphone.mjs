import { runCommand } from "./command.mjs";
import { normalizeStorageGb } from "./android.mjs";

function parseKeyValues(output) {
  return Object.fromEntries(output.split(/\r?\n/).map((line) => line.match(/^([^:]+):\s*(.*)$/)).filter(Boolean).map((match) => [match[1].trim(), match[2].trim()]));
}

function plistInteger(output, key) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = output.match(new RegExp(`<key>\\s*${escapedKey}\\s*</key>\\s*<integer>\\s*(\\d+)\\s*</integer>`, "i"));
  return match ? Number(match[1]) : null;
}

export function parseBatteryDiagnostics(output) {
  const cycleCount = plistInteger(output, "CycleCount");
  const maximumCapacityPercent = plistInteger(output, "MaximumCapacityPercent");
  const fullChargeCapacity = plistInteger(output, "FullChargeCapacity");
  const designCapacity = plistInteger(output, "DesignCapacity");
  let batteryHealth = maximumCapacityPercent;

  if (batteryHealth === null && fullChargeCapacity !== null && designCapacity !== null && fullChargeCapacity > 200 && designCapacity > 200) {
    batteryHealth = Math.round((fullChargeCapacity / designCapacity) * 100);
  }

  return {
    batteryHealth: batteryHealth !== null && batteryHealth > 0 && batteryHealth <= 120 ? Math.min(100, batteryHealth) : null,
    chargeCycles: cycleCount,
  };
}

async function optional(command) {
  try { return await command(); } catch { return ""; }
}

export async function detectIphone(run = runCommand) {
  const idTool = process.env.IDEVICE_ID_PATH || "idevice_id";
  const infoTool = process.env.IDEVICEINFO_PATH || "ideviceinfo";
  const diagnosticsTool = process.env.IDEVICEDIAGNOSTICS_PATH || "idevicediagnostics";
  const udid = (await run(idTool, ["-l"])).split(/\r?\n/).find(Boolean)?.trim();
  if (!udid) return null;
  const info = parseKeyValues(await run(infoTool, ["-u", udid]));
  const battery = parseKeyValues(await optional(() => run(infoTool, ["-u", udid, "-q", "com.apple.mobile.battery"])));
  const diagnostics = parseBatteryDiagnostics(await optional(() => run(diagnosticsTool, ["-u", udid, "diagnostics", "GasGauge"])));
  const totalBytes = Number(info.TotalDiskCapacity);
  return {
    connected: true,
    platform: "iphone",
    model: info.DeviceName || info.ProductType || null,
    storageGb: Number.isFinite(totalBytes) && totalBytes > 0 ? normalizeStorageGb(totalBytes / 1024 / 1024 / 1024) : null,
    imei: info.InternationalMobileEquipmentIdentity?.match(/\d{15}/)?.[0] ?? null,
    batteryHealth: diagnostics.batteryHealth,
    chargeCycles: diagnostics.chargeCycles ?? (Number(battery.CycleCount) || null),
    missingFields: [],
  };
}
