import { describe, expect, it } from "vitest";
import { formatCLP, parseCLP } from "./currency";

describe("formatCLP", () => {
  it("formats numbers as CLP currency", () => {
    expect(formatCLP(25000)).toBe("$25.000");
    expect(formatCLP(0)).toBe("$0");
  });

  it("rounds values before formatting", () => {
    expect(formatCLP(1999.6)).toBe("$2.000");
  });
});

describe("parseCLP", () => {
  it("parses formatted strings into numbers", () => {
    expect(parseCLP("$25.000")).toBe(25000);
    expect(parseCLP("25.000")).toBe(25000);
    expect(parseCLP("CLP 1.200.000")).toBe(1200000);
  });

  it("returns NaN for empty or invalid input", () => {
    expect(Number.isNaN(parseCLP(""))).toBe(true);
    expect(Number.isNaN(parseCLP("-"))).toBe(true);
  });

  it("round-trips format and parse", () => {
    const value = 987654;
    expect(parseCLP(formatCLP(value))).toBe(value);
  });
});
