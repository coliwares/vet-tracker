export function formatAge(birthDate?: string, now: Date = new Date()): string {
  if (!birthDate) return "—";

  const parsed = Date.parse(`${birthDate}T00:00:00`);
  if (Number.isNaN(parsed)) return "—";

  const start = new Date(parsed);
  if (start > now) return "—";

  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();

  if (now.getDate() < start.getDate()) {
    months -= 1;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years < 0) return "—";

  if (years === 0) {
    const monthLabel = months === 1 ? "mes" : "meses";
    return `${months} ${monthLabel}`;
  }

  if (months === 0) {
    const yearLabel = years === 1 ? "año" : "años";
    return `${years} ${yearLabel}`;
  }

  const yearLabel = years === 1 ? "año" : "años";
  const monthLabel = months === 1 ? "mes" : "meses";
  return `${years} ${yearLabel} ${months} ${monthLabel}`;
}
