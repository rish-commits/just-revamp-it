# Shape

Plan a dashboard before writing code. Use this for a new surface, or when `critique` finds that the problem is structural rather than visual.

**Never start with colour.** Most bad dashboards were styled before they were scoped.

## 1. The question

**Write the one question this surface answers, in a sentence.** Not a topic ("engagement"), a question ("are people coming back after their first week, and if not, where do they stop?").

If you cannot write it, stop. There is no design problem to solve yet, there is a product conversation to have. A surface with no question becomes a grid of available metrics, which is the single most common way a dashboard ends up useless while containing nothing wrong.

## 2. The reader

Name the **priority reader** and what success looks like for them. Most dashboards have several audiences with incompatible needs:

- **Leadership** wants a verdict in seconds and will not interpret raw tables.
- **The daily operator** wants density and speed, and finds a verdict patronising.
- **The engineer** wants the definition and the source.

They cannot all win. Say who wins when density trades against clarity, and write it down, because every later argument about the surface is really this argument.

## 3. The metrics

For each candidate metric:

- What **population** does it count?
- What is its **denominator**?
- What **comparison** makes it interpretable?
- Would the reader **act differently** depending on its value?

**Cut every metric that fails the last one.** A number nobody would act on is a number that dilutes the ones they would.

Then define the ones that survive. See `trust.md`: canonical wording, counting unit, denominator, exclusions, and a worked counter-example.

## 4. The narrative

A dashboard reads top to bottom as **one argument**, not as a grid.

The reliable order:

1. **Verdict** — the headline number, its comparison, and whether that is good.
2. **Composition** — what the headline is made of.
3. **Leak** — where it is being lost.
4. **Detail** — who and what is behind it, on demand.

The first screenful must carry the conclusion. If a reader has to scroll to learn whether things are fine, the hierarchy is wrong.

## 5. The forms

For each block, choose the form from the question, using the table in `charts.md`. Write the question next to each chart in the plan. **A block with no question is cut, not styled.**

Decide now, not later:
- What is the **comparison window**, and is it the same across the page?
- Which numbers are **soft** (aggregate, cross-source, not per-user)?
- What does this look like with **no data**, **one row**, and **far too many rows**?

## 6. Drill-down

Overview surfaces answer "is this healthy". Detail surfaces answer "which ones". Keep them separate and link them in one direction.

Put filter and period state **in the URL**, so a reader can send someone the exact view they are looking at. A dashboard whose interesting states cannot be linked to gets screenshotted into chat instead, and then it is stale forever.

## 7. Output

Produce, before any code:

- The question, in one sentence
- The priority reader
- The metric list, with populations and denominators, and what you cut
- The block order, with the question each block answers and the form it takes
- The comparison window
- The empty, minimal and extreme cases
- What is deliberately **not** on this surface

Then hand off to `chart`, `funnel` and `trust` to build, and run `audit` when it stands up.
