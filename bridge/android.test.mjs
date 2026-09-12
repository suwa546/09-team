import { describe, expect, it } from "vitest";
import { normalizeStorageGb, parseAdbDevices, parseBattery, parseImei, parseStorageGb } from "./android.mjs";

describe("Android bridge parsers", () => {
  it("selects device status from adb output", () => expect(parseAdbDevices("List of devices attached\nABC device product:x model:Pixel_8\nDEF unauthorized")).toEqual([{ serial: "ABC", state: "device" }, { serial: "DEF", state: "unauthorized" }]));
  it("parses battery values", () => expect(parseBattery("level: 87\n cycle count: 312")).toEqual({ batteryHealth: 87, chargeCycles: 312 }));
  it("normalizes physical storage to marketed capacity", () => { expect(normalizeStorageGb(119)).toBe(128); expect(parseStorageGb("Filesystem 1K-blocks Used\n/data 124780544 1")).toBe(128); });
  it("parses plain and parcel IMEI values", () => { expect(parseImei("490154203237518")).toBe("490154203237518"); expect(parseImei("00340039 00300031 00350034 00320030 00330032 00330037 00350031 00380000")).toBe("490154203237518"); });
});
