import { detectAndroid } from "./android.mjs";
import { detectIphone } from "./iphone.mjs";

export async function detectDevice() {
  const errors = [];
  for (const detector of [detectAndroid, detectIphone]) {
    try {
      const device = await detector();
      if (device) {
        device.missingFields = ["model", "storageGb", "imei", "batteryHealth", "chargeCycles"].filter((field) => device[field] === null);
        return device;
      }
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }
  return { connected: false, platform: null, model: null, storageGb: null, imei: null, batteryHealth: null, chargeCycles: null, missingFields: [], message: errors.length ? "ADBまたはlibimobiledeviceを確認してください。" : "USB接続された端末がありません。" };
}
