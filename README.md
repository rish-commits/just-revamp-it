# just-revamp-it

A Claude Code skill for dashboards.

A dashboard is an instrument, and it is judged on one thing: whether a reader
reaches a **correct** conclusion, fast, and knows how much to trust it. This skill
audits, revamps and builds data surfaces against that standard.

It is brand-neutral and multi-brand by design. A brand supplies one accent; the
full colour system is derived and validated from it, so a team cannot accidentally
ship an illegible ramp or a delta colour that collides with its own identity.

## The handbook page

A rendered version for people who want to look at the system rather than have an
agent use it, with a live accent deriver that runs the real validator in the
browser: <https://claude.ai/code/artifact/91aa4b92-ecfd-42a6-8b99-a3bb73a98d1a>

Source at [`docs/handbook.html`](docs/handbook.html). Republish it from that file
to update the same URL.

## Install

```
/plugin marketplace add rish-commits/just-revamp-it
/plugin install just-revamp-it@just-revamp-it
```

Or drop `skills/just-revamp-it/` into a project's `.claude/skills/` directory.

## Use

```
/just-revamp-it audit          # measurable checks against the system
/just-revamp-it critique       # does this yield a correct judgment, fast?
/just-revamp-it revamp         # apply the system, worst-first
/just-revamp-it brand "#7c3aed"  # onboard a brand: derive and validate tokens
```

With no argument it audits, then offers critique and revamp.

## What it measures

Three scripts, so judgment is spent only where judgment is needed. Each runs
standalone with plain Node and no dependencies.

```bash
node skills/just-revamp-it/scripts/palette.mjs "#7c3aed"      # derive + validate a colour system
node skills/just-revamp-it/scripts/vocabulary.mjs ./src       # measure design restraint
node skills/just-revamp-it/scripts/scan.mjs ./src             # detect dashboard anti-patterns
```

**`palette.mjs`** turns one accent into a validated system: a five-step sequential
ramp in OKLCH so the ladder holds for any hue, per-hue heat-fill ceilings, and
checks for accent/delta collision, pale accents that cannot carry a 2px line, and
ramps that collapse under colour-vision deficiency. Where a brand colour fails, it
derives a working colour in the same hue rather than rejecting the brand.

**`vocabulary.mjs`** measures restraint, which is the most common reason a dashboard
"looks off" while every individual choice is defensible. It grades the *core*
vocabulary (the smallest set of values covering 90% of uses) rather than the raw
count, so a disciplined system with a tail is not scored like an evenly-sprawling
one, and it names the tail as the cleanup list.

**`specificity.mjs`** asks a different question: was this built for *this* product, or
for any product? Invented data, metric names lifted from starter blocks, fabricated
deltas, palettes spanning the spectrum, gradient text, blurred data surfaces. It
scores a hand-built dashboard 89 and a generated one 0. The tell is never ugliness;
generated dashboards are tidy. The tell is that they know nothing about the product.

**`scan.mjs`** detects anti-patterns that make readers draw wrong conclusions:
truncated bar baselines, proportional bars with no minimum width, numbers without
tabular figures, green and red used as category colours, lists with no empty state,
metrics surfaced with no definition.

## What it knows

The `reference/` chapters were not written from opinion. They were extracted from a
production dashboard by 25 agents across ten dimensions, adversarially re-audited
against the source, and reduced to 552 practiced rules with the reason each one
exists. Rules are tagged MUST, SHOULD or MAY, and separated into what is universal,
what is specific to analytics dashboards, and what is a brand slot.

31 chapters. The core was extracted from practice; the rest closes the
gaps that dashboard could not teach, reasoned from the same grammar: chart
selection, distributions and scatter and maps, targets and forecasts and
thresholds, data-volume extremes, dark mode, accessibility, locale and currency,
print and export, performance budgets, metric naming, and governance.

The chapter worth reading first is [trust](skills/just-revamp-it/reference/trust.md).
It is the part general design systems do not have, and the part that decides whether
a dashboard is believed.

## The kit

Prose does not enforce anything. `assets/` ships the part that does:

- **`tokens.css` / `tokens.json`** — 72 variables, regenerated per brand from one accent
- **`components.css`** — 69 classes, framework-independent, every value from the tokens
- **`components/`** — 13 React files that encode the rules rather than restating them: the
  delta pill cannot report growth from a zero baseline, the funnel cannot render a real
  value invisibly or blank a 0%, the line chart cannot draw a non-zero baseline
- **`starter/`** — a worked page in the narrative order, annotated inline

See [reference/kit.md](skills/just-revamp-it/reference/kit.md).

## Status

v0.4.0. Script, reference and kit layers complete. Dashboards are light by default;
the colour system derives and validates a full light palette from one accent, and
can derive a validated dark one for the narrow cases that justify it. Verified
against a production dashboard; not yet piloted on a second one.

## Licence

Apache-2.0.
