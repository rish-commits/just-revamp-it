A design review of whether the dashboard **works as an instrument**. `audit` measures what is checkable; this judges what is not. Run it when the numbers are sound but the surface still does not feel right, or before building on top of an existing dashboard.

Do not fix anything. Produce a judgment with evidence.

## Do this first

Read the dashboard the way its actual reader does, and say who that is. A leadership reader in a weekly meeting, an operator living in it daily, and an engineer debugging a metric want incompatible things. **Name the priority reader before critiquing.** Where density serves the operator and clarity serves leadership, leadership wins unless the product says otherwise.

Then, for each page, answer in one sentence: **what question does this page answer?** If you cannot, that is the finding, and it outranks everything else in this file.

## The one-minute test

Open the page. Start a timer. Can you state, correctly, whether the thing being measured is healthy?

- **Under 10 seconds** — the headline number and its verdict are doing their job.
- **Under a minute** — acceptable, but the hierarchy is costing the reader.
- **Over a minute, or you cannot tell** — the page has failed its primary reader regardless of how good it looks.

The common failure is a page that presents *available* metrics in a grid rather than making an *argument*. Every metric is defensible; the page still says nothing. Name this explicitly when you see it, because teams rarely see it themselves.

## Seven lenses

**1. Does it yield a verdict?** Is there a headline number, is it the right one, and does the reader learn whether it is good without already knowing the baseline? A number with no comparison is trivia.

**2. Is the narrative order right?** A dashboard should read top to bottom as one argument: health, then where it comes from, then where it leaks, then who is behind it. Check that the first screenful carries the conclusion and the detail comes after. Scrolling to find the point is a hierarchy failure.

**3. Is every element earning its place?** Charts that restate a single number, legends that duplicate direct labels, tables nobody reads, decorative panels. Cutting is the strongest edit available; propose specific removals rather than general restraint.

**4. Is the form right for the question?** Trend wants a line, comparison wants ranked bars, drop-off wants a funnel, exact lookup wants a table. Most bad dashboards contain no bad charts, only charts answering a question nobody asked. Say what question each chart answers and whether anyone has it.

**5. Would a reader be misled?** Not "is it accurate" but "what will someone conclude at a glance". A technically correct chart that implies a trend it does not support is worse than an obviously broken one, because nobody checks it. Look hardest at anything with a comparison, a percentage, or a shape that suggests causation.

**6. Is the density right for the reader and the room?** Dashboards get projected, screenshared, and screenshotted into decks. A layout tuned for a 27-inch monitor at arm's length fails in a meeting. Check it at 50%.

**7. Can it be trusted?** Would a reader know where these numbers come from, when they were computed, who is excluded, and what the dashboard cannot see? Trust is not a feature that gets added later; a dashboard caught overstating once is never fully believed again.

## Score

Rate each lens 0-4, total **/28**.

| Lens | Score | Finding |
|---|---|---|
| Yields a verdict | | |
| Narrative order | | |
| Earning its place | | |
| Form fits question | | |
| Misleading risk | | |
| Density and room | | |
| Trust | | |

**Bands:** 25-28 exceptional · 20-24 strong · 14-19 works but costs the reader · 8-13 presents data without making a point · 0-7 not usable as an instrument.

## Report

Open with the one-minute test result and the priority reader. Then the score table. Then findings, most consequential first, each with: what a reader concludes, what they should conclude, and the specific change that closes the gap.

Include **what to cut**. Most critiques only add. A dashboard that people like is usually one that says less than it could.

Close with the three changes that would move the score most, and route them: `trust`, `chart`, `funnel`, `shape` for restructuring, `revamp` to apply.

**Never** critique without naming the reader. **Never** call something unclear without saying what the reader concludes instead. **Never** recommend adding a metric without saying which one it replaces.
