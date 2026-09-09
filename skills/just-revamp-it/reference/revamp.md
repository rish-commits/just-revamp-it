Apply the system to an existing dashboard. This is the command that changes code.

**Refinement, not replacement.** Keep the product's content, metric definitions, data sources, copy and function. Change how it is presented. If the incumbent structure is genuinely wrong rather than merely untidy, stop and route to `shape`; do not silently rebuild a dashboard someone asked you to tidy.

## Before editing

1. **Audit first.** Never revamp from impression. If `audit` has not run this session, run it. You need the finding list and the score to know what worst-first means and to prove the change worked.
2. **Confirm the brand.** Read `.revamp/brand.json`. If absent, run `brand` before touching colour. Never invent an accent, and never leave a brand's colours as literals scattered through components.
3. **Read the incumbent.** Open the token source, one representative chart, and one representative page before changing any of them. A revamp that ignores existing conventions produces a third style rather than replacing the second.

## Order of work

Worst-first, by what corrupts a reader's conclusion. Do not start with colour; it is the most visible and least important item on this list.

1. **P0 encoding and truth.** Truncated baselines, fabricated shapes, invisible values, unlabelled populations, missing definitions. These change what people believe. Fix them before anything cosmetic.
2. **States.** Empty, loading, partial, error. Make them distinguishable from each other and from a real zero.
3. **Numbers.** Tabular figures, consistent formatting by magnitude, correct delta polarity, a stated comparison window.
4. **Hierarchy.** Get the headline number to lead. Cut what does not earn its place.
5. **System fidelity.** Replace hard-coded values with tokens, fold the vocabulary tail into the core scale, unify component variants.
6. **Polish.** Spacing rhythm, alignment, radii, the last 10%.

Work in batches by category, not file by file. One pass that fixes every missing empty state is reviewable; twelve scattered commits are not.

## Rules while editing

- **Change presentation, not meaning.** If a fix would alter what a number counts, stop and ask. Renaming a metric, changing a denominator, or adjusting a date window is a product decision, not a design one.
- **Preserve deliberate exceptions.** A rule broken with a comment explaining why is a decision, not drift. Read the comment before "fixing" it. If the reason is sound, leave it and note it in the report.
- **Never fabricate data or shape.** If a step is flat because instrumentation is missing, it stays flat with a note. Making a funnel look natural is falsification.
- **Every generated token comes from `palette.mjs`.** Do not hand-write a ramp, a heat fill, or a hover tint.
- **Preserve the definitions layer.** Never remove an info affordance, caveat or footnote to make a card cleaner. If it is visually noisy, restyle it; do not delete it.

## Verify

Bounded passes, not a loop.

1. Make the full batch of changes.
2. Re-run `scan.mjs` and `vocabulary.mjs`. Confirm findings closed and none introduced.
3. Look at the result at full size and at 50%, since this is how it will be read in a meeting.
4. Fix what that shows, in one batch.
5. Re-run once to confirm. Stop.

Open-ended self-review burns budget for diminishing returns. Two rounds, then hand back.

## Report

- Score before and after, per dimension.
- What changed, grouped by category, with file references.
- What was deliberately left alone, and why. Exceptions you preserved belong here.
- What you could not fix without a product decision, stated as a question for the team.

**Never** change a metric's meaning to make a chart cleaner. **Never** delete a caveat. **Never** claim a score improved without re-running the scripts.
