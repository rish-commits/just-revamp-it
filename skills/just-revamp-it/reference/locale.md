# Locale, currency and language

Most dashboard systems are written in one market and hardcode it everywhere. The fix is cheap at the start and expensive later.

---

## 1. Formatters take parameters

**MUST — a number formatter takes a locale and a currency as arguments. Never bake them in.**

The failure mode is not exotic. It is a formatter called with no locale at all, which silently follows the *viewer's browser*, so the same figure renders differently for two colleagues looking at the same dashboard. A formatter without an explicit locale is a defect.

**MUST — format currency through a real currency formatter, never a symbol concatenated to a number.** Symbol placement, spacing, decimal convention and negative form all vary by locale. `₹1,23,456`, `€1.234,56` and `$1,234.56` are all correct in their own locale and all wrong in each other's.

**MUST NOT mix grouping conventions on one page.** Indian grouping (`12,34,567`) and Western grouping (`1,234,567`) are both correct and reading both on one surface breaks a reader's number sense.

## 2. Multiple currencies

**MUST — a single view never mixes currencies without conversion.** Summing them is arithmetic nonsense, and showing them side by side invites the reader to do it.

**MUST — a converted figure states its rate and the rate date.** A converted total with no rate is unauditable and will be challenged in the first meeting where it matters.

Where a view genuinely spans markets, either convert everything to one reporting currency and say so, or split by currency into separate sections. Never interleave.

## 3. Timezone

- **Pick one reporting timezone per surface and print it.**
- **A date-only bucket key is formatted in UTC; an instant is formatted in the reporting zone.** Getting this backwards shifts labels by a day near midnight, which is the hardest dashboard bug to notice and the easiest to disbelieve once found.
- **A formatter without an explicit timezone is a defect**, for the same reason as the locale.

## 4. Long labels

**Fixed-width label columns are the norm in this system, and they are sized to English abbreviations somebody typed by hand.** German and Finnish run 30 to 40% longer. Japanese runs shorter but breaks differently.

- **Size label columns in character or root-relative units, validated against the longest *translated* string**, not the English one.
- **Every truncation has a non-hover recovery path.** A native title is invisible on touch and to keyboard, so where a label carries meaning it also goes in the accessible name.
- **Where a label cannot be shortened, change the layout, not the clipping.** Move the label above the bar rather than truncating it harder.

## 5. Right-to-left

State the principle even if you defer the work, because retrofitting is the expensive part.

**Charts do not mirror. Chrome does.**

- A time axis stays left-to-right even in RTL locales. That convention is near-universal for time series.
- Bar charts grow right-to-left, the label column moves to the right.
- Navigation, sticky columns and drill-through arrows all mirror.

**SHOULD — use logical properties from day one, even in a left-to-right-only product.** Inline-start and inline-end rather than left and right, text-start rather than text-left. It costs a couple of hours now and saves a multi-week migration later, and it is free if you never ship RTL.

## 6. Non-Latin numerals and other calendars

Honest scope call: out of scope for most teams, with one principle.

**Never hand-format a number or a date.** A proper internationalisation API handles Eastern Arabic numerals, Devanagari digits, and the Islamic, Hebrew and Japanese imperial calendars if you pass it a locale, and handles none of them if you concatenate strings.

**One exception worth keeping:** formatting a machine key with a fixed ISO-producing locale is a good technique for bucket keys and sort keys. **Name it as a machine-key technique so it never leaks into display.**
