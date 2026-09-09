/**
 * Number and absence formatting.
 *
 * Every rule in reference/numbers.md that a component can enforce lives here, so
 * no component invents its own placeholder or precision. Locale and currency are
 * parameters, never baked in (reference/locale.md).
 */

export type Absence = "unmeasured" | "zero" | "na" | "future";

/** The four absences render differently, always. Never collapse them. */
export const ABSENCE: Record<Absence, string> = {
  unmeasured: "-",   // no source, or the source failed
  zero: "0",         // measured, and the answer is none
  na: "n/a",         // cannot have a value (e.g. a ratio with no denominator)
  future: "",        // the period has not happened yet
};

export type FormatOpts = { locale: string; currency?: string };

/** Counts print in full with grouping. Never compact notation in a dashboard. */
export function count(v: number | null | undefined, { locale }: FormatOpts): string {
  if (v == null || Number.isNaN(v)) return ABSENCE.unmeasured;
  return v.toLocaleString(locale, { maximumFractionDigits: 0 });
}

/** Precision is set by the surface, not the value. Pass the same `digits` per surface. */
export function percent(
  v: number | null | undefined,
  { locale }: FormatOpts,
  digits: 0 | 1 = 0,
): string {
  if (v == null || Number.isNaN(v)) return ABSENCE.na;
  return `${v.toLocaleString(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits })}%`;
}

/** Always a real currency formatter: symbol placement and decimals vary by locale. */
export function money(v: number | null | undefined, { locale, currency }: FormatOpts): string {
  if (v == null || Number.isNaN(v)) return ABSENCE.unmeasured;
  if (!currency) throw new Error("money() needs a currency; see reference/locale.md");
  return v.toLocaleString(locale, { style: "currency", currency, maximumFractionDigits: 0 });
}

/** A ratio with no denominator is n/a, never 0 in the unit. */
export function ratio(num: number | null, den: number | null, digits = 1): string {
  if (num == null || den == null || den === 0) return ABSENCE.na;
  return (Math.round((num / den) * 10 ** digits) / 10 ** digits).toFixed(digits);
}

/**
 * Delta as a rounded integer percent, computed once in the data layer.
 * Returns null when the prior period is zero or absent: there is no meaningful
 * percentage change from nothing, and inventing one reports fake growth.
 */
export function delta(current: number | null, prior: number | null): number | null {
  if (current == null || prior == null || prior === 0) return null;
  return Math.round(((current - prior) / prior) * 100);
}

/** A date-only bucket key is produced in UTC; an instant is formatted in the reporting zone. */
export const bucketKey = (d: Date): string =>
  d.toLocaleDateString("en-CA", { timeZone: "UTC" });

export const stamp = (d: Date, timeZone: string, locale: string): string =>
  d.toLocaleString(locale, { timeZone, dateStyle: "medium", timeStyle: "short" });
