import { describe, expect, it } from "vitest";
import {
  buildYearOptions,
  formatIsoToDisplay,
  formatIsoToLocal,
  getIsoDateParts,
  isIsoDate,
  normalizeLocalDateInput,
  parseLocalDate,
  updateIsoMonthYear,
} from "./date";

describe("isIsoDate", () => {
  it("matches ISO dates", () => {
    expect(isIsoDate("2026-02-06")).toBe(true);
    expect(isIsoDate("2026-2-6")).toBe(false);
    expect(isIsoDate("06/02/2026")).toBe(false);
  });
});

describe("getIsoDateParts", () => {
  it("parses ISO date parts", () => {
    expect(getIsoDateParts("2026-02-06")).toEqual({
      year: 2026,
      month: 2,
      day: 6,
    });
  });

  it("returns null for invalid values", () => {
    expect(getIsoDateParts("invalid")).toBeNull();
    expect(getIsoDateParts("2026-13-01")).toBeNull();
    expect(getIsoDateParts("")).toBeNull();
  });
});

describe("formatIsoToLocal", () => {
  it("formats ISO to dd/mm/yyyy", () => {
    expect(formatIsoToLocal("2026-02-06")).toBe("06/02/2026");
  });

  it("returns empty string for invalid input", () => {
    expect(formatIsoToLocal("")).toBe("");
    expect(formatIsoToLocal("invalid")).toBe("");
  });
});

describe("formatIsoToDisplay", () => {
  it("formats ISO with fallback", () => {
    expect(formatIsoToDisplay("2026-02-06")).toBe("06/02/2026");
    expect(formatIsoToDisplay("")).toBe("—");
    expect(formatIsoToDisplay("", "-")).toBe("-");
  });
});

describe("normalizeLocalDateInput", () => {
  it("normalizes ISO to local", () => {
    expect(normalizeLocalDateInput("2026-02-06")).toBe("06/02/2026");
  });

  it("normalizes digits into dd/mm/yyyy", () => {
    expect(normalizeLocalDateInput("06022026")).toBe("06/02/2026");
  });

  it("normalizes separators and filters input", () => {
    expect(normalizeLocalDateInput("06-02-2026")).toBe("06/02/2026");
    expect(normalizeLocalDateInput("06.02.2026")).toBe("06/02/2026");
    expect(normalizeLocalDateInput("06/02/2026abc")).toBe("06/02/2026");
  });
});

describe("parseLocalDate", () => {
  it("parses dd/mm/yyyy into ISO", () => {
    expect(parseLocalDate("06/02/2026")).toBe("2026-02-06");
  });

  it("accepts ISO input", () => {
    expect(parseLocalDate("2026-02-06")).toBe("2026-02-06");
  });

  it("rejects invalid dates", () => {
    expect(parseLocalDate("31/02/2026")).toBe("");
    expect(parseLocalDate("99/99/9999")).toBe("");
    expect(parseLocalDate("06/02/20")).toBe("");
  });
});

describe("updateIsoMonthYear", () => {
  it("updates month and clamps day", () => {
    expect(updateIsoMonthYear("2026-03-31", 2026, 2)).toBe("2026-02-28");
  });

  it("falls back to current date when invalid", () => {
    const result = updateIsoMonthYear("invalid", 2025, 1);
    expect(result).toBe("2025-01-01");
  });
});

describe("buildYearOptions", () => {
  it("builds a descending list", () => {
    expect(buildYearOptions(2024, 2026)).toEqual([2026, 2025, 2024]);
  });
});
