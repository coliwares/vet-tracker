export function formatCLP(value?: number | null): string {
  if (value === undefined || value === null) return "—";
  if (!Number.isFinite(value)) return "—";
  const rounded = Math.round(value);

  try {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(rounded);
  } catch {
    const sign = rounded < 0 ? "-" : "";
    const digits = Math.abs(rounded).toString();
    const withDots = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${sign}$${withDots}`;
  }
}

export function parseCLP(value: string): number {
  if (!value) return Number.NaN;
  const digits = value.replace(/[^0-9]/g, "");
  if (!digits) return Number.NaN;
  return Number(digits);
}
