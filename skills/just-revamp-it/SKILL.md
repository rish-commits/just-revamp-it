---
name: just-revamp-it
description: Use when auditing, revamping, designing, or reviewing a dashboard, analytics view, reporting surface, admin console, metrics page, or any data-dense UI. Covers chart selection and construction, funnels, KPI tiles, tables, number formatting, deltas and comparison windows, cohort and retention views, empty and loading states, metric definitions and data-honesty, dashboard information architecture, colour ramps and legibility, design tokens, and translating a dashboard into a Slack card, email, PDF, or deck. Also use to onboard a brand onto the dashboard system or to check an existing dashboard for visual drift. Not for marketing pages, native app UI, or non-data product surfaces.
version: 0.1.0
user-invocable: true
argument-hint: "[audit|critique|revamp · shape|chart|funnel|trust · brand|broadcast|document] [target]"
license: Apache-2.0
allowed-tools:
  - Bash(node *)
---

A dashboard is not a page that happens to contain charts. It is an instrument, and
it is judged on one thing: whether a reader reaches a **correct** conclusion, fast,
and knows how much to trust it. Everything in this skill serves that.

Most dashboard work fails in one of three ways, and prettier components fix none of
them: the reader cannot tell what is good or bad, the numbers are not defined so two
people read them differently, or the surface accreted so many one-off decisions that
nothing reads as deliberate. Audit for those first.

## The four that matter

1. **Restraint.** Good dashboards make few decisions and repeat them. A core of about
   five type sizes, four spacing steps, one accent. Sprawl is the most common cause of
   a dashboard that "looks off" while every individual choice is defensible. This is
   measurable: `scripts/vocabulary.mjs`.
2. **Judgment first.** Lead with the number and its verdict, then the detail. A surface
   that requires interpretation before it yields a conclusion has failed its reader.
   Big number, then delta, then context, then the drill-down.
3. **Light by default.** Dashboards are projected in lit rooms, screenshotted into
   light decks, and printed. Light grounds also give a sequential ramp more usable
   range, since every encoding here is a background fill. Dark is a narrow exception
   requiring a written justification, not a preference. See
   [reference/theming.md](reference/theming.md).
4. **Earned trust.** Name the population every number counts. Define terms on the
   surface, not in a deck. Say what the data cannot say rather than drawing a clean
   shape that implies precision the source does not have. A dashboard that is once
   caught overstating is never fully believed again.

## Where these rules came from

This system was extracted from one production product-analytics dashboard: a few
hundred users, one timezone, one currency, one accent hue, one export target, short
funnels, and a deliberately single-theme interface. That provenance matters.

- Chapters covering what that dashboard **shipped** (charts, funnels, tables, trust,
  numbers, layout, type, interaction, broadcast) are evidenced by practice.
- Chapters covering what it **never had to solve** (chart-types, targets, dark, scale,
  locale, output, performance) are reasoned from the same grammar. Sound, but unproven.

Do not mistake a single-instance decision for validated law. When a rule does not
survive contact with real data, that is information the system owner needs, not a
reason to quietly drop it.

## Rule tiers

Every rule in `reference/` is tagged. Respect the tag.

- **MUST** — breaks correctness, accessibility, or trust. Never trade away.
- **SHOULD** — the default. Depart only with a stated reason.
- **MAY** — taste. The brand or the team decides.

## Setup

1. Resolve `<skill>` to this skill's base directory. Keep cwd at the user's project.
2. Read the brand config at `.revamp/brand.json` if present. If absent and the work
   needs colour, run `brand` before styling anything.
3. Load the one reference that owns the request from the Commands table. Do not load
   the whole `reference/` tree; each file is written to stand alone.

## Scripts

Deterministic measurement, so judgment is spent on things that need judgment.

| Script | Use |
|---|---|
| `node <skill>/scripts/palette.mjs "<accent>" [--css\|--json]` | Derive and validate the full colour system, **both themes**, from one brand accent. Catches accent/delta collisions, pale accents, per-hue heat ceilings, colour-blind ramp collapse. `--css` emits light tokens; add `--dark` only for the narrow cases in `theming.md`. Exits non-zero on failure, so it belongs in CI. |
| `node <skill>/scripts/vocabulary.mjs <dir> [--json]` | Measure design restraint. Reports the core vocabulary, the tail to fold in, and a 0-100 score. |
| `node <skill>/scripts/scan.mjs <dir> [--json]` | Detect dashboard anti-patterns in source: non-semantic green/red, missing tabular numerals, truncated baselines, undefined metrics, missing empty states. |

Treat script output as evidence, not verdicts. Verify each finding in context and say
so when one is a false positive.

## Commands

| Command | Category | Description | Reference |
|---|---|---|---|
| `audit [target]` | Evaluate | Measurable checks: tokens, restraint, contrast, anti-patterns, states | [reference/audit.md](reference/audit.md) |
| `critique [target]` | Evaluate | Does this yield a correct judgment fast? Chart choice, hierarchy, honesty | [reference/critique.md](reference/critique.md) |
| `revamp [target]` | Refine | Apply the system to an existing dashboard, worst-first | [reference/revamp.md](reference/revamp.md) |
| `shape [surface]` | Build | Plan a dashboard's questions, IA and page composition before code | [reference/shape.md](reference/shape.md) |
| `chart [question]` | Build | Choose and build the right form for one question | [reference/choosing.md](reference/choosing.md) then [reference/charts.md](reference/charts.md) |
| `funnel [target]` | Build | Build or fix a funnel, including drop-off and honesty rules | [reference/funnel.md](reference/funnel.md) |
| `trust [target]` | Refine | Populations, definitions, caveats, freshness, empty and error states | [reference/trust.md](reference/trust.md) |
| `brand [accent]` | Setup | Onboard a brand: derive tokens, validate, write `.revamp/brand.json` | [reference/brand.md](reference/brand.md) |
| `broadcast [target]` | Build | Translate a dashboard into a Slack card, email, PDF, or deck | [reference/broadcast.md](reference/broadcast.md) |
| `document` | Build | Emit this project's own dashboard spec from its code | [reference/document.md](reference/document.md) |

Reference chapters, loaded by the commands above rather than invoked directly:

| Reference | Covers |
|---|---|
| [reference/color.md](reference/color.md) | Palette, semantic reservations, ramps, legibility |
| [reference/numbers.md](reference/numbers.md) | Formatting, absence, deltas, comparison windows, time |
| [reference/tables.md](reference/tables.md) | Table anatomy, overflow, density, provenance |
| [reference/layout.md](reference/layout.md) | Page skeleton, grid patterns, navigation, URLs |
| [reference/typography.md](reference/typography.md) | Type scale, spacing, shape, component primitives |
| [reference/interaction.md](reference/interaction.md) | Motion, selection, hover, focus, tooltips, controls |
| [reference/choosing.md](reference/choosing.md) | Which form answers which question, and the forms this system refuses |
| [reference/chart-types.md](reference/chart-types.md) | Distributions, scatter, geography, big-N, financial tables, real-time |
| [reference/targets.md](reference/targets.md) | Targets, forecasts and thresholds, and why all three differ from measured data |
| [reference/scale.md](reference/scale.md) | Small-N policy, large-N thresholds, per-form range table |
| [reference/theming.md](reference/theming.md) | Light by default, why, and how to ship dark correctly if you must |
| [reference/accessibility.md](reference/accessibility.md) | Conformance target, no-fact-by-hue, chart contract, CI enforcement |
| [reference/locale.md](reference/locale.md) | Locale, multi-currency, timezone, long labels, RTL |
| [reference/output.md](reference/output.md) | Print, projection, TV, email, CSV export |
| [reference/performance.md](reference/performance.md) | Node-count budgets and where work belongs |
| [reference/naming.md](reference/naming.md) | Metric naming grammar, title voice, copy standards, units |
| [reference/governance.md](reference/governance.md) | Ownership, exceptions, review checklist, migration, enforcement |
| [reference/craft-floor.md](reference/craft-floor.md) | General quality floor when no craft skill is present |

Routing:

- **No argument:** run `audit`, then offer `critique` and `revamp`. That sequence is
  what the skill's name promises, and it is the right default for an existing surface.
- **Explicit or implied command:** load its reference and follow it. Ask once if two fit.
- **New dashboard, nothing built yet:** `shape` first. Never start with colour.
- **General frontend craft** outside data display (marketing pages, native, motion
  systems, brand identity): this skill defers. If the `impeccable` skill is available,
  hand off to it; otherwise apply [reference/craft-floor.md](reference/craft-floor.md)
  and say what was out of scope.

## Two registers

The same system, two media. Choose deliberately and say which you are in.

- **Explore** — interactive, on-screen, hover and drill-down available, the reader
  controls the question. Light canvas, one accent, quiet labels, dense where earned.
- **Broadcast** — pushed to the reader as a fixed artefact: Slack card, email, PDF,
  deck slide, wall display. No hover, no drill-down, often small or far away. Verdict
  stated in words, higher contrast, larger type, fewer metrics, no interaction-dependent
  meaning. See [reference/broadcast.md](reference/broadcast.md).

A Broadcast artefact that is just a screenshot of an Explore surface is a defect.

## Brand

The system is brand-neutral by construction. A brand supplies an accent, a wordmark,
a font, a locale and a currency; everything else is derived and validated, so a brand
cannot accidentally ship an illegible ramp or a delta colour that collides with its own
identity. Run `brand` once per brand, commit `.revamp/brand.json`, and never hand-edit
generated tokens.

Green and red are reserved system-wide for change, in every brand. A brand whose accent
is green or red does not get to override that; it gets the alternative delta treatment
in [reference/color.md](reference/color.md).
