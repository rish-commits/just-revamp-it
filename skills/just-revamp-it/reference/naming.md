# Naming and voice

Cheap to fix, and among the highest-leverage things in the system. Two spellings of one metric is a bug, not a style question.

---

## 1. Metric names

**Grammar: `<Population> <measure> <qualifier>`.** Sentence case. No abbreviations that are not universal in your org.

- **The window goes in the subtitle, not the name.** "Active users" plus a subtitle of "last 7 days" beats "7d active users", because the name stays stable when the window changes.
- **MUST — one canonical name per metric, registered in the definitions module and imported.** A metric name is a token, not a string literal.
- **MUST — a second spelling of an existing metric is a bug.** The failure looks like this: the same metric appears as a count on one page and a percentage on another under the same name, or the same pair renders as `N of M`, `N · P%` and `N / M` in three places. Readers conclude the numbers disagree.
- **Never surface raw database column names.** `first_activity_at` is not a label.
- Where a metric has a common industry name that means something slightly different for you, do not reuse it. Borrowing "retention" for something that is not retention costs more than inventing a name.

## 2. Card titles and subtitles

The annotation contract, and it is complete enough to adopt verbatim:

- **Title = the question the card answers.**
- **Subtitle = metric · window · timezone.**
- **Info affordance = the full methodology, in prose.**
- **The plot carries no axis titles, no units, and no caption.**

**Methodology paragraphs follow a fixed order:** source per step or group, then why anything is soft or approximate, then what the length or position encodes, then what any highlight colour means. A reader scanning three different cards should find the same information in the same place.

## 3. Copy standards

- **An empty state names the specific missing thing.** Never "No data".
- **An empty state that is good news is written affirmatively.** Report the achieved state, not the absence of rows.
- **An error names what failed in the reader's terms, states the blast radius, offers exactly one action, and shows a reference string.** Never a stack trace, never "Something went wrong".
- **An alert sentence carries the measurement, its baseline and the gap.** Never a bare adjective.
- Sentence case everywhere. All caps only for column heads and chips in the broadcast register.
- One separator character, used everywhere.
- **No em dashes**, in any medium.
- These rules apply to every string, including tooltips and titles.

### The four dashes

| Glyph | Job |
|---|---|
| Hyphen `-` | the absence token: not measured, or not applicable |
| Minus `−` | a negative value |
| En dash `–` | a range |
| Em dash `—` | not used |

**Never interchange them.** This is a real asset and is written down almost nowhere.

## 4. Units

Publish one formatting rule per unit. The ones most teams need beyond counts and percentages:

- **Durations.** Choose a unit per surface and hold it. **A duration axis is never linear across four orders of magnitude**; use a log scale and say so, or bucket.
- **Bytes.** Binary or decimal prefixes. Pick one org-wide; they differ by 2.4% at gigabyte scale and someone will notice.
- **Rates.** Always state per what, over what window. "Requests per second, averaged over 5 minutes" is a different number from "peak requests per second".
- **Per-unit economics.** Name the denominator in the metric name: cost per install, revenue per active user.

**Precision ladder**, and one precision per metric across every surface:

- Integer for rates over a population.
- One decimal for headline ratios.
- Two decimals only inside a dense comparison table.
