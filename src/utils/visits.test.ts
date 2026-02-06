import { describe, expect, it, vi } from "vitest";
import type { VetVisit } from "../types";
import {
  filterVisitsByRange,
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
});
