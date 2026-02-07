const isoDatePattern = /^(\d{4})-(\d{2})-(\d{2})$/;

export type IsoDateParts = {
  year: number;
  month: number;
  day: number;
};

function pad2(value: number): string {
  return value.toString().padStart(2, "0");
}

export function isIsoDate(value: string): boolean {
  return isoDatePattern.test(value);
}

export function getIsoDateParts(iso?: string): IsoDateParts | null {
  if (!iso) return null;
  const match = isoDatePattern.exec(iso);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!year || month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { year, month, day };
}

export function formatIsoToLocal(iso?: string): string {
  const parts = getIsoDateParts(iso);
  if (!parts) return "";
  return `${pad2(parts.day)}/${pad2(parts.month)}/${parts.year}`;
}

export function formatIsoToDisplay(iso?: string, fallback = "—"): string {
  const local = formatIsoToLocal(iso);
  return local || fallback;
}

export function normalizeLocalDateInput(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const isoMatch = isoDatePattern.exec(trimmed);
  if (isoMatch) return formatIsoToLocal(trimmed);
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 8) {
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  }
  return trimmed.replace(/[.\-]/g, "/").replace(/[^0-9/]/g, "");
}

export function parseLocalDate(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (isIsoDate(trimmed)) return trimmed;
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmed);
  if (!match) return "";
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (month < 1 || month > 12 || day < 1) return "";
  const maxDay = new Date(year, month, 0).getDate();
  if (day > maxDay) return "";
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

export function updateIsoMonthYear(
  iso: string,
  year?: number,
  month?: number,
): string {
  const base = getIsoDateParts(iso) ?? {
    year: new Date().getFullYear(),
    month: 1,
    day: 1,
  };
  const nextYear = year ?? base.year;
  const nextMonth = month ?? base.month;
  const maxDay = new Date(nextYear, nextMonth, 0).getDate();
  const nextDay = Math.min(base.day, maxDay);
  return `${nextYear}-${pad2(nextMonth)}-${pad2(nextDay)}`;
}

export function buildYearOptions(start: number, end: number): number[] {
  const years: number[] = [];
  for (let year = end; year >= start; year -= 1) {
    years.push(year);
  }
  return years;
}

export const monthOptions: Array<{ value: number; label: string }> = [
  { value: 1, label: "Ene" },
  { value: 2, label: "Feb" },
  { value: 3, label: "Mar" },
  { value: 4, label: "Abr" },
  { value: 5, label: "May" },
  { value: 6, label: "Jun" },
  { value: 7, label: "Jul" },
  { value: 8, label: "Ago" },
  { value: 9, label: "Sep" },
  { value: 10, label: "Oct" },
  { value: 11, label: "Nov" },
  { value: 12, label: "Dic" },
];
