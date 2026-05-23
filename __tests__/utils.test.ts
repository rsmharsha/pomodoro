import { describe, it, expect } from "vitest";
import { formatHoursMinutes } from "@/lib/utils";

describe("formatHoursMinutes", () => {
  it("shows only minutes when under 1 hour", () => {
    expect(formatHoursMinutes(0)).toBe("0 min");
    expect(formatHoursMinutes(60)).toBe("1 min");
    expect(formatHoursMinutes(2700)).toBe("45 min");
    expect(formatHoursMinutes(3540)).toBe("59 min");
  });

  it("shows only hours when on the hour", () => {
    expect(formatHoursMinutes(3600)).toBe("1 hr");
    expect(formatHoursMinutes(7200)).toBe("2 hr");
    expect(formatHoursMinutes(18000)).toBe("5 hr");
  });

  it("shows hours and minutes when over 1 hour", () => {
    expect(formatHoursMinutes(3660)).toBe("1 hr 1 min");
    expect(formatHoursMinutes(3900)).toBe("1 hr 5 min");
    expect(formatHoursMinutes(5640)).toBe("1 hr 34 min");
    expect(formatHoursMinutes(6300)).toBe("1 hr 45 min");
    expect(formatHoursMinutes(7500)).toBe("2 hr 5 min");
  });

  it("truncates partial seconds (floors to whole minutes)", () => {
    // 3659s = 1 hr + 59s → 59s floors to 0 min → "1 hr"
    expect(formatHoursMinutes(3659)).toBe("1 hr");
    // 3661s = 1 hr + 61s → 61s floors to 1 min → "1 hr 1 min"
    expect(formatHoursMinutes(3661)).toBe("1 hr 1 min");
    // 3720s = 1 hr + 120s → 120s = 2 min
    expect(formatHoursMinutes(3720)).toBe("1 hr 2 min");
  });
});
