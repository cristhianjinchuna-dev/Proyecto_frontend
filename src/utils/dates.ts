// Dates travel as "yyyy-MM-dd" strings. We build them with the LOCAL date
// (toISOString() uses UTC and in Lima after 7 pm it would already be "tomorrow").

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseIsoDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day); // local midnight, no timezone shift
}

export function todayIso(): string {
  return toIsoDate(new Date());
}

export function addDays(iso: string, days: number): string {
  const date = parseIsoDate(iso);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

// Number of nights between two dates (end - start)
export function countNights(startIso: string, endIso: string): number {
  const ms = parseIsoDate(endIso).getTime() - parseIsoDate(startIso).getTime();
  return Math.round(ms / 86_400_000);
}

const dateFormatter = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });

export function formatDate(iso: string): string {
  return dateFormatter.format(parseIsoDate(iso)); // 12 nov 2026
}