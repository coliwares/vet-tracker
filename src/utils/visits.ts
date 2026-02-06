import type { VetVisit } from "../types";

export type VisitRange = "30d" | "90d" | "year" | "all";

export type NextAppointment = {
  visit: VetVisit;
  date: string;
};

function toDayTimestamp(value: string): number | null {
  if (!value) return null;
  const parsed = Date.parse(`${value}T00:00:00`);
  return Number.isNaN(parsed) ? null : parsed;
}

function todayTimestamp(): number {
  const now = new Date();
  const day = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return day.getTime();
}

export function filterVisitsByRange(visits: VetVisit[], range: VisitRange) {
  if (range === "all") return visits;

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (range === "30d") start.setDate(start.getDate() - 30);
  if (range === "90d") start.setDate(start.getDate() - 90);
  if (range === "year") start.setFullYear(start.getFullYear() - 1);

  const startTs = start.getTime();
  const endTs = now.getTime();

  return visits.filter((visit) => {
    const visitTs = toDayTimestamp(visit.date);
    if (visitTs === null) return false;
    return visitTs >= startTs && visitTs <= endTs;
  });
}

export function getNextAppointment(visits: VetVisit[]): NextAppointment | null {
  const todayTs = todayTimestamp();
  let best: NextAppointment | null = null;
  let bestTs = Number.POSITIVE_INFINITY;

  for (const visit of visits) {
    const candidateDate = visit.nextVisitDate || visit.date;
    const candidateTs = toDayTimestamp(candidateDate);
    if (candidateTs === null || candidateTs < todayTs) continue;

    if (candidateTs < bestTs) {
      bestTs = candidateTs;
      best = { visit, date: candidateDate };
    }
  }

  return best;
}

export function getLastVisit(visits: VetVisit[]): VetVisit | null {
  let best: VetVisit | null = null;
  let bestTs = Number.NEGATIVE_INFINITY;

  for (const visit of visits) {
    const visitTs = toDayTimestamp(visit.date);
    if (visitTs === null) continue;
    if (visitTs > bestTs) {
      bestTs = visitTs;
      best = visit;
    }
  }

  return best;
}
