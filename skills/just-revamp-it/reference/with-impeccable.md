# Composing with a general craft skill

This skill is a specialist. It knows dashboards, data representation and trust. It deliberately does **not** know landing pages, brand identity, native platforms, illustration or motion systems.

`impeccable` (Apache-2.0, by Paul Bakaus, `github.com/pbakaus/impeccable`) is the general frontend craft skill this composes with best. The two overlap far less than you would expect: its detector hunts aesthetic anti-patterns (AI-looking palettes, gradient text, nested cards, dark glow, marquee), while `scan.mjs` hunts encodings that make a reader draw a wrong conclusion. Different failure modes entirely.

---

## Division of labour

| Owned here | Owned by a general craft skill |
|---|---|
| Chart choice and construction | Landing pages, marketing surfaces |
| Funnels, cohorts, distributions | Brand identity and visual worlds |
| Number formatting, deltas, comparison windows | Illustration and imagery |
| Populations, definitions, data honesty | Motion systems and micro-interaction delight |
| Dashboard IA and page composition | Native iOS and Android conventions |
| Sequential ramps and legibility maths | Copy voice outside metric naming |
| The broadcast register | Aesthetic anti-pattern detection |

## Handoff

**Detect, do not assume.** If `impeccable` is available in the session, hand off general craft to it. If it is not, apply `craft-floor.md`, which carries the minimum bar, and say plainly what was out of scope rather than improvising a brand system.

**On `audit`:** run this skill's three scripts first. If the surface also needs a general craft pass, invoke the other skill's audit separately and **present the findings merged but attributed**, so a reader can tell a data-correctness failure from an aesthetic one. Do not re-report the same issue twice under two names; contrast failures in particular will surface in both.

**On a new dashboard:** `shape` here, then build here. Route to the general skill only for surfaces around the dashboard, such as a marketing page or a sign-in screen.

**On anything not data-shaped:** hand it over entirely. A settings page inside a dashboard product is not a dashboard.

## Where the advice conflicts

Three real conflicts. **On a data surface, the rule in this skill wins**, and here is why in each case.

**1. Animation.** A general craft skill will add purposeful motion, entrance animation and micro-interaction delight. This skill requires data to render at its final value on first paint: no count-ups, no growing bars, no drawing-in paths. Animated data is unreadable while it animates, and on a surface that refreshes it makes every load feel slow. **Resolution: motion may apply to chrome (a refresh spinner, a disclosure), never to data marks.**

**2. Colour.** A general craft skill's `colorize` adds strategic colour to monochromatic interfaces. This skill caps a view at two accent colours and reserves green and red permanently for change. **Resolution: on a data surface, colour is an encoding before it is an aesthetic. Add interest with weight, space and hierarchy instead.**

**3. Hierarchy versus restraint.** A general detector may flag a flat type hierarchy or monotonous spacing as an anti-pattern. `vocabulary.mjs` rewards exactly the small vocabulary that can trigger it. This is a genuine tension, not a bug in either tool. **Resolution: hierarchy in a dashboard comes from size *and weight* pairs and from spatial grouping, not from adding type sizes.** A four-size scale with locked size-weight pairs is a hierarchy; adding a fifth size to look less flat is drift. If the general detector flags this on a dashboard, mark it a false positive and say why.

The general skill's own mode model agrees with the spirit here: it names an "Operate" mode for dashboards and admin UI where scanability, consistency and the real usage scene outrank expression. Where its guidance and this skill's diverge on a data surface, that mode is the tiebreaker.

## Not vendored

This skill **references** the other rather than bundling it. Apache-2.0 would permit vendoring with attribution, but a pinned copy of an actively developed 3MB skill becomes a fork nobody merges, most of it is irrelevant to dashboards, and some of its features depend on services a copy would not carry.

If your org later decides a bundled copy is worth the maintenance, the licence obligations are: include the Apache-2.0 licence text, retain the existing copyright and attribution notices, include upstream's NOTICE file if one exists, and state what you changed. That decision belongs to the system owner (`governance.md`), and a courtesy note to the author costs nothing.
