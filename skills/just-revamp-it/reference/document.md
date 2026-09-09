# Document

Emit a project's own dashboard spec from its code, so an agent or a new team member can extend the surface without re-deriving its conventions.

This produces a **description of what is**, not a wish list. Where the code is inconsistent, say so rather than documenting the version you prefer.

## Gather

```bash
node <skill>/scripts/vocabulary.mjs <src> --json   # real scales, by frequency
node <skill>/scripts/scan.mjs <src> --json         # anti-patterns and drift
node <skill>/scripts/palette.mjs "<accent>" --json # the derived system
```

Then read: the token source, the primitive components, one representative page, one representative chart, and the metric definitions.

## Write

Emit `DESIGN.md` at the project root:

1. **Identity** — accent, wordmark, font, locale, currency, timezone. Mark the accent as a brand slot, and note whether a derived working colour is in use.
2. **Tokens** — colour, type scale, spacing, radii, shadows. **Report the real scales by usage frequency**, not the aspirational ones. Name the tail explicitly as drift.
3. **Primitives** — every shared component with its props and its visual spec.
4. **Chart inventory** — each chart type, the question it answers, and its geometry constants.
5. **Metric definitions** — the canonical wording of every metric, its population, its denominator, and its exclusions. This is the most valuable section and the one most often missing.
6. **Conventions** — comparison window, timezone, number formatting, absence tokens.
7. **Known exceptions** — every sanctioned rule-break with its reason. An exception recorded is a decision; an exception undocumented is drift the next person will "fix".

## Rules

- **Describe, do not prescribe.** If the codebase uses ten type sizes, the document says ten and names the six that are tail. It does not claim four.
- **Frequency is evidence.** A value used 65 times is the convention; the same value used once is an accident. Say which is which.
- **Read comments before recording a rule as a violation.** A deviation with a comment explaining why is a decision.
- **Do not invent.** No brand guidelines, no tone of voice, no accessibility standard unless the project actually has one. Note absences as absences.
- Close with what a future contributor must not break: the trust rules, the reserved colours, the population vocabulary.
