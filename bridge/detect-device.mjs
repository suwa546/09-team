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
  const authorizationError = errors.find((message) => message.includes("USBデバッグの許可"));
  return {
    connected: false,
    platform: null,
    model: null,
    storageGb: null,
    imei: null,
    batteryHealth: null,
    chargeCycles: null,
    missingFields: [],
    message: authorizationError ?? "USB端末を検出できません。接続、端末側の許可、検品PCのUSB用ツールを確認してください。",
  };
}
