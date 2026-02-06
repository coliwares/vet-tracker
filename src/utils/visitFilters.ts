import type { VetVisit } from "../types";
import { filterVisitsByRange, type VisitRange } from "./visits";

export type SortKey = "newest" | "oldest" | "cost";

export type VisitFilters = {
  petId: string;
  range: VisitRange;
  query: string;
  sortKey: SortKey;
};

export function searchVisits(visits: VetVisit[], query: string): VetVisit[] {
  const q = query.trim().toLowerCase();
  if (!q) return visits;

  return visits.filter((visit) => {
    const hay = [
      visit.reason,
      visit.clinic,
      visit.diagnosis,
      visit.treatment,
      visit.notes,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return hay.includes(q);
  });
}

export function sortVisits(visits: VetVisit[], sortKey: SortKey): VetVisit[] {
  const next = [...visits];

  if (sortKey === "newest") {
    return next.sort((a, b) => (a.date < b.date ? 1 : -1));
  }

  if (sortKey === "oldest") {
    return next.sort((a, b) => (a.date > b.date ? 1 : -1));
  }

  return next.sort((a, b) => (b.costCLP ?? 0) - (a.costCLP ?? 0));
}

export function applyFilters(
  visits: VetVisit[],
  filters: VisitFilters,
): VetVisit[] {
  let result = filterVisitsByRange(visits, filters.range);

  if (filters.petId) {
    result = result.filter((visit) => visit.petId === filters.petId);
  }

  result = searchVisits(result, filters.query);
  return sortVisits(result, filters.sortKey);
}
