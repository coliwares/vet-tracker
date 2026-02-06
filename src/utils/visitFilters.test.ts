import { describe, expect, it, vi } from "vitest";
import type { VetVisit } from "../types";
import { applyFilters, searchVisits } from "./visitFilters";

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

describe("searchVisits", () => {
  it("matches full-text fields", () => {
    const visits = [
      makeVisit({ id: "v-1", reason: "Vacuna" }),
      makeVisit({ id: "v-2", clinic: "Vet Norte" }),
      makeVisit({ id: "v-3", diagnosis: "Dermatitis" }),
      makeVisit({ id: "v-4", treatment: "Antibiotico" }),
      makeVisit({ id: "v-5", notes: "Sin apetito" }),
    ];

    expect(searchVisits(visits, "vacuna").map((v) => v.id)).toEqual(["v-1"]);
    expect(searchVisits(visits, "norte").map((v) => v.id)).toEqual(["v-2"]);
    expect(searchVisits(visits, "dermatitis").map((v) => v.id)).toEqual(["v-3"]);
    expect(searchVisits(visits, "antibi").map((v) => v.id)).toEqual(["v-4"]);
    expect(searchVisits(visits, "apetito").map((v) => v.id)).toEqual(["v-5"]);
  });

  it("returns all when query is empty", () => {
    const visits = [makeVisit({ id: "v-1" }), makeVisit({ id: "v-2" })];
    expect(searchVisits(visits, " ")).toBe(visits);
  });
});

describe("applyFilters", () => {
  it("filters by range, pet, search, and sort", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-06T12:00:00Z"));

    const visits = [
      makeVisit({
        id: "v-1",
        petId: "p-1",
        date: "2026-02-01",
        reason: "Vacuna",
        costCLP: 20000,
      }),
      makeVisit({
        id: "v-2",
        petId: "p-2",
        date: "2026-01-20",
        reason: "Control",
        costCLP: 5000,
      }),
      makeVisit({
        id: "v-3",
        petId: "p-1",
        date: "2025-11-20",
        reason: "Piel",
        costCLP: 30000,
      }),
    ];

    const result = applyFilters(visits, {
      petId: "p-1",
      range: "90d",
      query: "vacuna",
      sortKey: "cost",
    });

    expect(result.map((v) => v.id)).toEqual(["v-1"]);

    vi.useRealTimers();
  });

  it("sorts by oldest when requested", () => {
    const visits = [
      makeVisit({ id: "v-1", date: "2026-02-05" }),
      makeVisit({ id: "v-2", date: "2026-01-05" }),
    ];

    const result = applyFilters(visits, {
      petId: "",
      range: "all",
      query: "",
      sortKey: "oldest",
    });

    expect(result.map((v) => v.id)).toEqual(["v-2", "v-1"]);
  });
});
