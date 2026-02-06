import type { AppState, Pet, VetVisit } from "../types";

export type MergeMode = "replace" | "merge";

export type MergeSummary = {
  pets: {
    total: number;
    kept: number;
    discarded: number;
  };
  visits: {
    total: number;
    kept: number;
    discarded: number;
  };
};

function petKey(pet: Pet): string {
  if (pet.id) return `id:${pet.id}`;
  const name = pet.name?.trim().toLowerCase() ?? "";
  const birthDate = pet.birthDate ?? "";
  return `name:${name}|birth:${birthDate}`;
}

function visitKey(visit: VetVisit): string {
  const reason = visit.reason?.trim().toLowerCase() ?? "";
  const cost = visit.costCLP ?? "";
  return `${visit.petId}|${visit.date}|${reason}|${cost}`;
}

export function dedupePets(pets: Pet[]): Pet[] {
  const seen = new Set<string>();
  const result: Pet[] = [];

  for (const pet of pets) {
    const key = petKey(pet);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(pet);
  }

  return result;
}

export function dedupeVisits(visits: VetVisit[]): VetVisit[] {
  const seen = new Set<string>();
  const result: VetVisit[] = [];

  for (const visit of visits) {
    const key = visitKey(visit);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(visit);
  }

  return result;
}

export function mergeData(
  current: AppState,
  incoming: AppState,
  mode: MergeMode,
): { state: AppState; summary: MergeSummary } {
  if (mode === "replace") {
    const summary: MergeSummary = {
      pets: {
        total: incoming.pets.length,
        kept: incoming.pets.length,
        discarded: 0,
      },
      visits: {
        total: incoming.visits.length,
        kept: incoming.visits.length,
        discarded: 0,
      },
    };

    return { state: { ...incoming, version: 1 }, summary };
  }

  const mergedPets = dedupePets([...current.pets, ...incoming.pets]);
  const mergedVisits = dedupeVisits([...current.visits, ...incoming.visits]);

  const petsTotal = current.pets.length + incoming.pets.length;
  const visitsTotal = current.visits.length + incoming.visits.length;
  const summary: MergeSummary = {
    pets: {
      total: petsTotal,
      kept: mergedPets.length,
      discarded: Math.max(0, petsTotal - mergedPets.length),
    },
    visits: {
      total: visitsTotal,
      kept: mergedVisits.length,
      discarded: Math.max(0, visitsTotal - mergedVisits.length),
    },
  };

  return {
    state: {
      version: 1,
      pets: mergedPets,
      visits: mergedVisits,
    },
    summary,
  };
}
