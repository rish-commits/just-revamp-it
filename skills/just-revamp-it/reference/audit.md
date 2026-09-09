Run measurable checks against a dashboard and report what is wrong, ranked. **Do not fix anything here.** Auditing and fixing in one pass produces a list nobody reviewed and changes nobody agreed to. `revamp` applies fixes.

This is a *dashboard* audit, not a general frontend audit. Every check below exists because it changes what conclusion a reader draws. If a finding does not change a conclusion, it is P3 or it is not a finding.

## 1. Measure first

Run all three, from the skill's base directory, with cwd at the user's project:

```bash
node <skill>/scripts/scan.mjs <src> --json         # anti-patterns
node <skill>/scripts/vocabulary.mjs <src> --json   # restraint
node <skill>/scripts/palette.mjs "<accent>"        # colour system (accent from .revamp/brand.json)
```

**Verify every finding in context before reporting it.** Rules marked `heuristic` in the scanner output are pattern matches, not proofs. Open the file, read the line, and drop it if it is a false positive. Say in the report how many you dropped, so the reader knows the list was filtered rather than pasted.

Script output is evidence. The score below is your judgment.

## 2. Score six dimensions, 0-4

### 1. Truth
Does every number say what it counts, and is the dashboard honest about what it cannot measure?

- Every metric names its population. An unlabelled metric is a defect, not a nicety: "active users" without "of those who completed onboarding" is a different number to different readers.
- Non-obvious metrics carry a definition on the surface, not in a deck.
- Unreliable measurements are marked rather than smoothed. A step that is flat because instrumentation is missing says so; it does not get a fabricated slope.
- Aggregate or cross-source figures are labelled as such and are never presented as a per-user drop.
- Freshness is visible: the reader can tell how old the data is and in which timezone.

**0** numbers with no stated meaning · **2** defined in places · **4** every metric names its population, definitions on-surface, limits stated

### 2. Encoding
Do the visual encodings support the conclusion a reader will draw?

- Bars start at zero. Always. A truncated bar baseline is the single most misleading thing a dashboard can do, and it is P0 every time.
- Chart form matches the question: trend over time, comparison across categories, part-to-whole only when parts genuinely sum, distribution when spread is the point.
- No pie or donut beyond three slices; ranked bars instead.
- Proportional lengths have a minimum so a small real value never renders as absent.
- Green and red mean change or status, never category.
- Every chart answers one stated question. A chart with no question is decoration.

**0** actively misleading · **2** correct but unconsidered · **4** every encoding chosen and defensible

### 3. Restraint
Run `vocabulary.mjs`. Grade the **core** vocabulary, not the raw count.

- Core type sizes within budget, with a named role for each.
- Spacing and radii on a scale, not ad hoc.
- Colour tokens countable and enumerable.
- The tail is the cleanup list; report it explicitly.

**0** score below 50 · **2** 65-84 · **4** 85+, and the tail is empty or deliberate

### 4. Legibility
- Text on any data-driven fill clears 4.5:1 at every value in the scale, not just the sampled one.
- Numbers use tabular figures wherever they sit in a column or update in place.
- The surface survives its real viewing conditions. Dashboards are read projected in meetings and screenshared at reduced size far more often than teams design for; check at 50% scale before calling it done.
- Keyboard reachable, focus visible, interactive elements labelled.

**0** fails AA in normal use · **2** passes at rest, fails in states · **4** passes at every value and state

### 5. Judgment
Does a reader reach a correct conclusion fast?

- The headline number is the largest thing on the page, and it is the *right* number.
- Change is shown against a stated comparison window, with correct polarity: falling cost is good, rising churn is bad, and the colour must reflect that rather than the sign.
- The page reads top to bottom as one argument, not as a grid of available metrics.
- A reader can tell good from bad without already knowing the baseline.

**0** requires interpretation to yield anything · **2** yields a verdict with effort · **4** verdict in seconds, detail on demand

### 6. Resilience
- Empty, loading, partial and error states exist and are distinguishable from each other. Blank space that means "no data yet" and blank space that means "the query failed" are different messages.
- Extremes hold: 0 rows, 1 row, 30,000 rows; 2 funnel steps and 20; labels far longer than the design assumed.
- Wide content scrolls inside its own container; the page never scrolls sideways.

**0** breaks on empty or large · **2** handles empty, breaks at extremes · **4** all states designed and distinguishable

## 3. Report

```
| # | Dimension  | Score | Key finding |
|---|------------|-------|-------------|
| 1 | Truth      |  ?/4  |             |
| 2 | Encoding   |  ?/4  |             |
| 3 | Restraint  |  ?/4  |             |
| 4 | Legibility |  ?/4  |             |
| 5 | Judgment   |  ?/4  |             |
| 6 | Resilience |  ?/4  |             |
|   | **Total**  | **??/24** |         |
```

**Bands:** 22-24 excellent · 18-21 good · 13-17 needs work · 8-12 poor · 0-7 rebuild.

Lead with a **Truth verdict**: pass or fail on whether this dashboard can be believed. A surface scoring well everywhere else while failing Truth is worse than one that scores badly overall, because it will be trusted while being wrong. Say so plainly.

Then, per finding:

- **[P0-P3] Name** · file:line · dimension · what conclusion a reader draws wrongly · the fix · which command applies it

**Severity:**
- **P0** a reader reaches a *wrong* conclusion. Truncated baselines, unlabelled populations, fabricated shapes, values rendered invisible.
- **P1** a reader is slowed or misled but can recover. Missing definitions, missing empty states, wrong delta polarity.
- **P2** drift and inconsistency. Hard-coded colour, vocabulary sprawl, off-scale spacing.
- **P3** polish.

Close with **patterns** (a finding appearing 15 times is one systemic problem, not 15 problems) and **what is working**, with specifics. A team that only hears failures stops running the audit.

## 4. Recommend

List next commands in priority order, P0 first: `trust`, `chart`, `funnel`, `revamp`, `brand`. End with `critique` if the numbers are sound but the reading experience was not assessed.

Then say:

> Run these one at a time or all at once. Re-run `/just-revamp-it audit` after fixes to see the score move.

**Never** report a finding without saying what conclusion it corrupts. **Never** report an unverified heuristic as fact. **Never** let P3 noise bury a P0.
