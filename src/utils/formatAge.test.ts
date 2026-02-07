import { describe, expect, it } from "vitest";
import { formatAge } from "./formatAge";

describe("formatAge", () => {
  it("returns dash for missing or invalid dates", () => {
    expect(formatAge(undefined, new Date(2026, 1, 6))).toBe("—");
    expect(formatAge("invalid", new Date(2026, 1, 6))).toBe("—");
  });

  it("returns dash for future dates", () => {
    expect(formatAge("2026-03-01", new Date(2026, 1, 6))).toBe("—");
  });

  it("returns months when under a year", () => {
    expect(formatAge("2025-10-06", new Date(2026, 1, 6))).toBe("4 meses");
    expect(formatAge("2025-12-06", new Date(2026, 1, 6))).toBe("2 meses");
  });

  it("returns years when exact year", () => {
    expect(formatAge("2025-02-06", new Date(2026, 1, 6))).toBe("1 año");
  });

  it("returns years and months for mixed ages", () => {
    expect(formatAge("2024-02-05", new Date(2026, 1, 6))).toBe("2 años");
    expect(formatAge("2024-05-10", new Date(2026, 1, 6))).toBe(
      "1 año 8 meses",
    );
  });

  it("adjusts months when current day is before birth day", () => {
    expect(formatAge("2025-01-20", new Date(2026, 1, 6))).toBe("1 año");
  });
});
