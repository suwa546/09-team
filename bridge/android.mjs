import { runCommand } from "./command.mjs";

const STORAGE_SIZES = [16, 32, 64, 128, 256, 512, 1024, 2048];

export function parseAdbDevices(output) {
  return output.split(/\r?\n/).slice(1).map((line) => line.trim()).filter(Boolean).map((line) => {
    const [serial, state] = line.split(/\s+/, 2);
    return { serial, state };
  });
}

export function parseBattery(output) {
  const level = output.match(/^\s*level:\s*(\d+)/im)?.[1];
  const cycles = output.match(/^\s*(?:cycle count|battery cycle count):\s*(\d+)/im)?.[1];
  return {
    batteryHealth: level ? Math.min(100, Number(level)) : null,
    chargeCycles: cycles ? Number(cycles) : null,
  };
}

export function normalizeStorageGb(sizeGb) {
  return STORAGE_SIZES.reduce((closest, size) => Math.abs(size - sizeGb) < Math.abs(closest - sizeGb) ? size : closest);
}

export function parseStorageGb(output) {
  const lines = output.split(/\r?\n/).filter((line) => line.trim());
  const columns = lines.at(-1)?.trim().split(/\s+/);
  const sizeKb = Number(columns?.[1]);
  if (!Number.isFinite(sizeKb) || sizeKb <= 0) return null;
  return normalizeStorageGb(sizeKb / 1024 / 1024);
}

export function parseImei(output) {
  const direct = output.match(/\b\d{15}\b/)?.[0];
  if (direct) return direct;
  const decoded = [...output.matchAll(/\b([0-9a-fA-F]{4})([0-9a-fA-F]{4})\b/g)]
    .flatMap((match) => [match[1], match[2]])
    .map((hex) => String.fromCharCode(Number.parseInt(hex, 16)))
    .join("")
    .replace(/\D/g, "");
  return decoded.match(/\d{15}/)?.[0] ?? null;
}

async function optional(command) {
  try { return await command(); } catch { return ""; }
}

export async function detectAndroid(run = runCommand) {
  const adb = process.env.ADB_PATH || "adb";
  const devices = parseAdbDevices(await run(adb, ["devices", "-l"]));
  const device = devices.find((item) => item.state === "device");
  if (!device) return null;
  const shell = (...args) => run(adb, ["-s", device.serial, "shell", ...args]);
  const [model, storage, batteryOutput, cycleOutput, imeiOutput] = await Promise.all([
    optional(() => shell("getprop", "ro.product.model")),
    optional(() => shell("df", "-k", "/data")),
    optional(() => shell("dumpsys", "battery")),
    optional(() => shell("settings", "get", "global", "battery_cycle_count")),
    optional(async () => (await optional(() => shell("cmd", "phone", "get-imei", "0"))) || shell("service", "call", "iphonesubinfo", "1")),
  ]);
  const battery = parseBattery(batteryOutput);
  const cycleNumber = /^\d+$/.test(cycleOutput.trim()) ? Number(cycleOutput.trim()) : battery.chargeCycles;
  return {
    connected: true,
    platform: "android",
    model: model || null,
    storageGb: parseStorageGb(storage),
    imei: parseImei(imeiOutput),
    batteryHealth: battery.batteryHealth,
    chargeCycles: cycleNumber,
    missingFields: [],
  };
}
