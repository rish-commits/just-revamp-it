# Specificity

A different question from the rest of the system. `scan.mjs` asks whether a reader will draw a **wrong** conclusion. `specificity.mjs` asks whether this dashboard was built for **this** product, or for any product.

```bash
node <skill>/scripts/specificity.mjs <src>
```

**The tell is not ugliness.** Generated dashboards are usually tidy: even grids, consistent radii, pleasant colours. The tell is that they know nothing about the product. Borrowed metric names, invented figures, a palette that encodes nothing, and chrome that would sit equally well on a fitness app or a payments console.

That matters more here than on a marketing page. A dashboard's entire claim is that its numbers mean something. **Fake names and a fabricated "+12.5%" are not cosmetic defects; they are the same failure as an unlabelled population, arriving through the front door.** A reader who catches one stops believing the rest, which is the `trust.md` argument exactly.

---

## What it looks for

**Invented data · P0.** Placeholder names, example addresses, template figures. Shipping demo values where a reader takes them as measurements is the most damaging thing on this list, and the easiest to leave behind by accident.

**Template copy · P1.** Metric names lifted from starter blocks: *Total Revenue*, *Subscriptions*, *Active Now*, *Recent Activity*, *from last month*. They describe no particular product, so they state no population, no window and no denominator. See `naming.md`.

**Fabricated deltas · P1.** Change figures written as literals. Three or more in one file is a wall of invented movement, and they are almost always positive, which quietly turns a dashboard into an advertisement. A delta is computed from a stated comparison window or it does not appear.

**Random data · P1.** A chart drawn from noise looks exactly like a chart drawn from data, which is the problem. It will be screenshotted, and nobody downstream can tell.

**Rainbow palette · P1.** Four or more categorical colours spanning more than 150° of hue. Such a palette encodes nothing: a reader cannot rank the categories, and any green or red inside it collides with the meaning this system reserves for change. The check computes real hue spread in OKLCH rather than counting colours.

**Emoji as interface furniture · P2.** Renders differently on every platform, carries nothing to a screen reader, cannot be restyled, and sits where a reader expects an encoding.

**Gradient text · P2.** Contrast varies unpredictably across the glyphs, so part of the word always fails, and it is the single most recognisable generated-design tell.

**Glassmorphism · P2.** A data surface needs a stable ground. Blur puts whatever is behind a card into competition with the numbers on it, and effective contrast changes as the page scrolls.

**Heavy shadows everywhere · P2.** When every card is lifted, nothing is. Elevation stops being hierarchy and becomes texture.

**Nested cards · P2.** Border, fill, radius and shadow each say "separate object". Nesting says it twice and flattens the hierarchy the outer card was drawing.

## Reading the score

| Score | Reading |
|---|---|
| 85–100 | Specific to this product |
| 60–84 | Partly templated |
| 0–59 | Could be any product |

Weighted so one P0 outweighs a pile of P2s: invented data is a trust failure, a heavy shadow is a taste failure.

**Two rules are heuristic and will produce false positives you should confirm rather than obey.**

- *Rainbow palette* fires on a genuine ordinal severity ramp, which `color.md` sanctions under a three-part test. If your ramp passes that test and the justification is written next to the code, mark it a false positive and move on.
- *Nested cards* fires on some legitimate compositions.

Say in the report how many you dismissed. A scan presented unfiltered trains people to ignore it.

## What it deliberately does not check

Aesthetic quality. Whether the page is beautiful, brave or boring is outside this system, and a general craft skill is better at it (`with-impeccable.md`). This checks one thing: whether the dashboard knows what product it belongs to.

---

*The idea of shipping an anti-pattern detector alongside a design system is borrowed from `impeccable`, which does it for general frontend craft. None of its code or rules are used here; the patterns above are dashboard-specific and independently written.*
