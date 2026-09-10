# Governance

The difference between a style guide and a system. Everything before this chapter describes what good looks like; this one describes who decides and what stops it rotting.

**Most design-system failures are governance failures wearing design clothes.** A doc that contradicts itself, declares a component that does not exist, specifies a spacing scale missing its two most-used values, or disagrees with the shipped code about padding: none of those are taste problems. Nobody owned the rules.

---

## 1. One source of truth

**MUST — the tokens are a machine-readable file, and both the code and the documentation are generated from it or checked against it.**

The most damning thing that can be said about a design system is that the doc and the code are separate artefacts that drifted. The fix is structural, not editorial.

**Ship a drift test in CI** that fails when:

- a documented token has no consumer, or
- a shipped literal has no token.

`vocabulary.mjs` produces the second half of that census today.

## 2. Exceptions

**An exception is legal only when it is written next to the code that embodies it**, and states four things:

1. The rule it breaks.
2. Why it does not apply here.
3. What the exception does **not** license.
4. Who approved it, if your org wants that.

The reason for point 3 is empirical: in the source system, one well-justified exception to the "green and red mean change only" rule was silently copied into four other places that did not meet the justification. **An exception without a stated boundary becomes a precedent.**

An exception recorded is a decision. An exception undocumented is drift, and the next person will "fix" it.

## 3. Who owns what

| Layer | Examples | To change it |
|---|---|---|
| **Brand slots** | accent, wordmark, font, locale, currency, timezone | No review. Run `brand`, commit the result |
| **Structural constants** | alpha ladders, ink threshold, minimum bar width, heat ceiling, row geometry, type scale | Needs the system owner. These are what make two brands' dashboards read as one system |
| **New chart type** | anything not in `choosing.md` | Needs a written question-and-answer justification: what question it answers that no existing form answers |
| **Team latitude** | page composition, which metrics, copy within the voice rules | The team decides |

**Name the system owner.** A system with no owner has no structural constants, only suggestions.

## 4. The review checklist

One page, runnable by a non-designer, before a dashboard ships:

- [ ] Does every metric name its population?
- [ ] Does every percentage show its denominator?
- [ ] Is every delta's polarity declared, including on tiles with no delta yet?
- [ ] Does every chart answer one stated question?
- [ ] Do bars start at zero?
- [ ] Is any fact carried by hue alone?
- [ ] Does every truncation have a non-hover recovery path?
- [ ] Does every interactive element have a visible focus ring?
- [ ] Does every chart have a summary sentence and a table equivalent?
- [ ] Are empty, loading and error states distinguishable from a real zero?
- [ ] Is the comparison window stated?
- [ ] Is the freshness stamp present, in a named timezone?
- [ ] Is the surface light, or does a dark one carry a written exception?
- [ ] Is any data on screen invented, or any metric name borrowed from a template?

Twelve questions, and the first three catch most of what matters.

## 5. Deprecation

**Retire a control by leaving it visible and inert, not by deleting it**, with a comment stating why and **a removal date**. A control that vanishes makes readers think the product broke; a control that lingers forever makes the interface a museum. Both halves are required.

## 6. Adoption and migration

The most valuable governance content most orgs never write down: **how to replace a dashboard while people are using it.**

The pattern that works:

1. **Two information architectures coexist behind a route group**, not behind conditionals inside shared pages.
2. **The legacy header self-hides** in the new tree rather than being conditionally rendered from a shared component.
3. **Shared components are parameterised by destination** so one roster can mount in both trees without forking.
4. **A theme opt-out variant** lets the new surface adopt a single theme without forking hundreds of declarations in the old one.
5. **New work lands only in the new tree.** The old one gets correctness fixes, not investment.
6. **The old tree has a retirement condition**, stated: when the new one covers its ground.

Point 6 is the one teams skip, and it is why products end up with three generations of interface live at once.

## 7. Enforcement

**A written convention at 40% coverage is the evidence that conventions do not hold.** Four cheap checks, all in CI:

1. **Palette contrast assertion** in every theme. `palette.mjs` exits non-zero on failure; wire it up.
2. **Hex census.** Fail on colour literals outside the token module.
3. **A lint rule or shared primitive for the focus ring.** Prefer the primitive: make it impossible to omit rather than detectable when omitted.
4. **A fixed-canvas assertion** for any exported artefact, that natural content height fits the canvas. This is how a broadcast card silently clips its own footer for months.

## 8. Provenance and honesty

**State where the rules came from.** This system was derived from one product-analytics dashboard with a few hundred users, one timezone, one currency, one accent, one export target and short funnels.

That matters because **a reader who does not know the provenance will mistake single-instance decisions for validated law.** Chapters covering what that dashboard actually shipped are well-evidenced. Chapters covering what it never had to solve are reasoned from the same grammar and are sound but unproven.

**When a rule does not survive contact with your data, that is information the system owner needs**, not a reason to quietly ignore the rule. Feed it back.
