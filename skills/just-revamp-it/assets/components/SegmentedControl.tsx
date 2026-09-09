"use client";

/**
 * A toggle that picks a VIEW is a mode, not data, so its selected state is a solid
 * neutral rather than the accent (reference/interaction.md). A segment that filters
 * a population states that population's size on itself, turning a filter into
 * evidence rather than a claim.
 */
export function SegmentedControl<T extends string>({
  options, value, onChange, label,
}: {
  options: { value: T; label: string; count?: number }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div className="jr-segmented" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" className="jr-segmented__option"
          aria-pressed={o.value === value} onClick={() => onChange(o.value)}>
          {o.label}
          {o.count != null && <span className="jr-segmented__count">{o.count.toLocaleString()}</span>}
        </button>
      ))}
    </div>
  );
}
