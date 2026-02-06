import { describe, expect, it, vi } from "vitest";
import type { VetVisit } from "../types";
import {
  filterVisitsByRange,
  getDashboardStats,
  getLastVisit,
  getNextAppointment,
} from "./visits";

const baseVisit: VetVisit = {
  id: "v-1",
  petId: "p-1",
  date: "2026-02-01",
  reason: "Control",
  createdAt: "2026-02-01T10:00:00.000Z",
  updatedAt: "2026-02-01T10:00:00.000Z",
};

function makeVisit(overrides: Partial<VetVisit>): VetVisit {
  return { ...baseVisit, ...overrides };
}

describe("filterVisitsByRange", () => {
  it("filters to last 30 days", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-06T12:00:00Z"));

    const visits = [
      makeVisit({ id: "v-1", date: "2026-02-06" }),
      makeVisit({ id: "v-2", date: "2026-01-10" }),
      makeVisit({ id: "v-3", date: "2025-11-01" }),
    ];

    const result = filterVisitsByRange(visits, "30d");
    expect(result.map((v) => v.id)).toEqual(["v-1", "v-2"]);

    vi.useRealTimers();
  });

  it("filters to last year", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-06T12:00:00Z"));

    const visits = [
      makeVisit({ id: "v-1", date: "2026-02-06" }),
      makeVisit({ id: "v-2", date: "2025-05-12" }),
      makeVisit({ id: "v-3", date: "2024-12-10" }),
    ];

    const result = filterVisitsByRange(visits, "year");
    expect(result.map((v) => v.id)).toEqual(["v-1", "v-2"]);

    vi.useRealTimers();
  });

  it("filters to last 90 days", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-06T12:00:00Z"));

    const visits = [
      makeVisit({ id: "v-1", date: "2026-02-06" }),
      makeVisit({ id: "v-2", date: "2025-12-10" }),
      makeVisit({ id: "v-3", date: "2025-10-10" }),
    ];

    const result = filterVisitsByRange(visits, "90d");
    expect(result.map((v) => v.id)).toEqual(["v-1", "v-2"]);

    vi.useRealTimers();
  });

  it("includes visits on the range boundary", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-06T12:00:00Z"));

    const visits = [
      makeVisit({ id: "v-1", date: "2026-01-07" }),
      makeVisit({ id: "v-2", date: "2026-01-06" }),
    ];

    const result = filterVisitsByRange(visits, "30d");
    expect(result.map((v) => v.id)).toEqual(["v-1"]);

    vi.useRealTimers();
  });

  it("returns all visits when range is all", () => {
    const visits = [
      makeVisit({ id: "v-1", date: "2026-02-06" }),
      makeVisit({ id: "v-2", date: "2025-05-12" }),
    ];

    const result = filterVisitsByRange(visits, "all");
    expect(result).toBe(visits);
  });

  it("ignores visits with invalid dates", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-06T12:00:00Z"));

    const visits = [
      makeVisit({ id: "v-1", date: "invalid" }),
      makeVisit({ id: "v-2", date: "2026-02-05" }),
    ];

    const result = filterVisitsByRange(visits, "30d");
    expect(result.map((v) => v.id)).toEqual(["v-2"]);

    vi.useRealTimers();
  });
});

describe("getLastVisit", () => {
  it("returns the most recent visit", () => {
    const visits = [
      makeVisit({ id: "v-1", date: "2026-01-01" }),
      makeVisit({ id: "v-2", date: "2026-02-05" }),
    ];

    const result = getLastVisit(visits);
    expect(result?.id).toBe("v-2");
  });

  it("returns null when no visits", () => {
    expect(getLastVisit([])).toBeNull();
  });

  it("ignores visits with invalid dates", () => {
    const visits = [
      makeVisit({ id: "v-1", date: "invalid" }),
      makeVisit({ id: "v-2", date: "2026-02-05" }),
    ];

    const result = getLastVisit(visits);
    expect(result?.id).toBe("v-2");
  });
});

describe("getNextAppointment", () => {
  it("returns the nearest future appointment", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-06T12:00:00Z"));

    const visits = [
      makeVisit({ id: "v-1", nextVisitDate: "2026-03-01" }),
      makeVisit({ id: "v-2", nextVisitDate: "2026-02-10" }),
      makeVisit({ id: "v-3", nextVisitDate: "2025-12-10" }),
    ];

    const result = getNextAppointment(visits);
    expect(result?.visit.id).toBe("v-2");
    expect(result?.date).toBe("2026-02-10");

    vi.useRealTimers();
  });

  it("returns null when no future dates exist", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-06T12:00:00Z"));

    const visits = [
      makeVisit({ id: "v-1", nextVisitDate: "2026-01-01" }),
    ];

    expect(getNextAppointment(visits)).toBeNull();

    vi.useRealTimers();
  });

  it("falls back to visit date when nextVisitDate is missing", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-06T12:00:00Z"));

    const visits = [
      makeVisit({ id: "v-1", date: "2026-02-12" }),
      makeVisit({ id: "v-2", nextVisitDate: "2026-02-10" }),
    ];

    const result = getNextAppointment(visits);
    expect(result?.visit.id).toBe("v-2");
    expect(result?.date).toBe("2026-02-10");

    vi.useRealTimers();
  });

  it("returns null when all future candidates are invalid", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-06T12:00:00Z"));

    const visits = [
      makeVisit({ id: "v-1", nextVisitDate: "invalid" }),
      makeVisit({ id: "v-2", date: "invalid" }),
    ];

    expect(getNextAppointment(visits)).toBeNull();

    vi.useRealTimers();
  });

  it("uses nextVisitDate even if visit date is later", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-06T12:00:00Z"));

    const visits = [
      makeVisit({ id: "v-1", date: "2026-03-01", nextVisitDate: "2026-02-08" }),
      makeVisit({ id: "v-2", date: "2026-02-20" }),
    ];

    const result = getNextAppointment(visits);
    expect(result?.visit.id).toBe("v-1");
    expect(result?.date).toBe("2026-02-08");

    vi.useRealTimers();
  });
});

describe("getDashboardStats", () => {
  it("aggregates totals and counts using the range", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-06T12:00:00Z"));

    const visits = [
      makeVisit({ id: "v-1", petId: "p-1", date: "2026-02-06", costCLP: 12000 }),
      makeVisit({ id: "v-2", petId: "p-2", date: "2026-01-15", costCLP: 8000 }),
      makeVisit({ id: "v-3", petId: "p-2", date: "2025-11-01", costCLP: 6000 }),
    ];

    const result = getDashboardStats(visits, "90d");
    expect(result.filteredVisits.map((v) => v.id)).toEqual(["v-1", "v-2"]);
    expect(result.petsInRangeCount).toBe(2);
    expect(result.totalCost).toBe(20000);
    expect(Array.from(result.totalsByPet.entries())).toEqual([
      ["p-1", 12000],
      ["p-2", 8000],
    ]);

    vi.useRealTimers();
  });

  it("includes next appointment from all visits", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-06T12:00:00Z"));

    const visits = [
      makeVisit({ id: "v-1", date: "2025-11-01", nextVisitDate: "2026-02-10" }),
      makeVisit({ id: "v-2", date: "2026-01-20", nextVisitDate: "2026-02-12" }),
    ];

    const result = getDashboardStats(visits, "30d");
    expect(result.nextAppointment?.visit.id).toBe("v-1");
    expect(result.lastVisit?.id).toBe("v-2");

    vi.useRealTimers();
  });
});
