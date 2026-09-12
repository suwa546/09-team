import { describe, expect, it } from "vitest";
import { parseBatteryDiagnostics } from "./iphone.mjs";

describe("iPhone diagnostics parsers", () => {
  it("calculates battery health and reads charge cycles from GasGauge diagnostics", () => {
    const output = `
      <key>CycleCount</key><integer>275</integer>
      <key>DesignCapacity</key><integer>1751</integer>
      <key>FullChargeCapacity</key><integer>1600</integer>
    `;

    expect(parseBatteryDiagnostics(output)).toEqual({ batteryHealth: 91, chargeCycles: 275 });
  });

  it("prefers a reported maximum-capacity percentage", () => {
    const output = `<key>MaximumCapacityPercent</key><integer>87</integer>`;
    expect(parseBatteryDiagnostics(output)).toEqual({ batteryHealth: 87, chargeCycles: null });
  });

  it("does not treat an ambiguous 100 value as a physical capacity", () => {
    const output = `<key>DesignCapacity</key><integer>3200</integer><key>FullChargeCapacity</key><integer>100</integer>`;
    expect(parseBatteryDiagnostics(output).batteryHealth).toBeNull();
  });
});
