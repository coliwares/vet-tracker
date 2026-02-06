import { describe, expect, it } from "vitest";
import type { AppState, Pet, VetVisit } from "../types";
import { dedupePets, dedupeVisits, mergeData } from "./backupMerge";

const basePet: Pet = {
  id: "p-1",
  name: "Luna",
};

const baseVisit: VetVisit = {
  id: "v-1",
  petId: "p-1",
  date: "2026-02-01",
  reason: "Control",
  createdAt: "2026-02-01T10:00:00.000Z",
  updatedAt: "2026-02-01T10:00:00.000Z",
};

function makeState(pets: Pet[], visits: VetVisit[]): AppState {
  return { version: 1, pets, visits };
}

describe("dedupePets", () => {
  it("deduplicates by id when present", () => {
    const pets = [
      { ...basePet },
      { ...basePet, name: "Luna 2" },
    ];

    expect(dedupePets(pets)).toHaveLength(1);
  });

  it("deduplicates by name and birthDate when id is missing", () => {
    const pets: Pet[] = [
      { id: "", name: "Kira", birthDate: "2020-01-01" },
      { id: "", name: "kira", birthDate: "2020-01-01" },
    ];

    expect(dedupePets(pets)).toHaveLength(1);
  });
});

describe("dedupeVisits", () => {
  it("deduplicates by petId, date, reason, and cost", () => {
    const visits = [
      { ...baseVisit, costCLP: 1000 },
      { ...baseVisit, id: "v-2", costCLP: 1000 },
      { ...baseVisit, id: "v-3", costCLP: 2000 },
    ];

    expect(dedupeVisits(visits).map((v) => v.id)).toEqual(["v-1", "v-3"]);
  });
});

describe("mergeData", () => {
  it("replaces data when mode is replace", () => {
    const current = makeState([{ ...basePet }], [{ ...baseVisit }]);
    const incoming = makeState([{ id: "p-2", name: "Nala" }], []);

    const result = mergeData(current, incoming, "replace");
    expect(result.state.pets).toHaveLength(1);
    expect(result.state.pets[0].id).toBe("p-2");
    expect(result.summary.pets.kept).toBe(1);
    expect(result.summary.pets.discarded).toBe(0);
  });

  it("merges and deduplicates when mode is merge", () => {
    const current = makeState([{ ...basePet }], [{ ...baseVisit, costCLP: 1000 }]);
    const incoming = makeState([{ ...basePet }], [{ ...baseVisit, id: "v-2", costCLP: 1000 }]);

    const result = mergeData(current, incoming, "merge");
    expect(result.state.pets).toHaveLength(1);
    expect(result.state.visits).toHaveLength(1);
    expect(result.summary.pets.discarded).toBe(1);
    expect(result.summary.visits.discarded).toBe(1);
  });
});
