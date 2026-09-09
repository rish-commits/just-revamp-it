# Layout and IA

Composition is where a dashboard becomes an argument instead of a grid of available metrics.

---

## 1. The page skeleton

**MUST — fix the narrative order on every scan page and do not let a page negotiate it:**

1. **H1** — the surface's name.
2. **Dek** — one sentence, phrased as the question this page answers, capped around 75 characters per line. Name the population here.
3. **Hero row** — the headline number, usually beside the surface's most important chart.
4. **KPI strip** — the supporting metrics not already inside the hero.
5. **Sections** — composition, then leak, then detail.
6. **Definitions** — where the numbers depend on contested terms.

The first screenful carries the conclusion. If a reader scrolls to learn whether things are fine, the hierarchy is wrong.

**One root element per page**, written identically every time, with all chrome in a shared layout. When two information architectures must coexist, give them separate layouts rather than conditionals inside one.

## 2. Measure and rhythm

- **A three-tier width ladder**, changing only the max-width and never the padding: a wide tier for scan pages and rosters, a narrower tier for single-visualisation drill-downs, narrower still for prose.
- **Narrow the measure as the reader drills down.** A single chart on a full-width page reads as an accident.
- **Align the sticky header's inner container to the page's content column** with the same max-width and padding, so the wordmark sits over the H1.
- **Four vertical rhythm steps, no more**, with the direction chosen by page type: scan pages breathe between rows, dense drill-downs tighten.
- **One grid gap at page level, and never responsive.** A gap that changes at a breakpoint makes the whole page reflow into a different design.

## 3. Column patterns

**Ship four page-level column patterns and invent no fifth:**

1. **Hero row** — a one-third headline stat beside a two-thirds chart.
2. **KPI strip** — three to four equal tiles.
3. **Paired cards** — two columns, top-aligned.
4. **Full-width section** — one card, stacked.

**MUST — top-align every multi-column card row.** Centre alignment makes two cards of unequal height float against each other and implies a correspondence between their contents that does not exist. Exempt only a card explicitly designed to fill, which must then absorb the slack internally.

**MUST — put a minimum-width override of zero on every grid or flex child that can hold a table, a chart, or a long label.** Grid items default to auto minimum width, so a wide child refuses to shrink and pushes the card out of its track. This is the single most common dashboard layout bug.

## 4. Budget the page

**Cap a scan page at roughly four to six top-level rows, three to six cards, and four to six KPI tiles.** About eight card-shaped objects.

When a page needs more, it is two pages. This is the most-ignored rule in dashboard design and the one that most reliably separates a surface people use from one they skim once.

## 5. Cards

- **One card shell**, with a class override for the exceptions. Radius, border, padding and shadow fixed.
- **Depth comes from a hairline plus one soft shadow, not from value.** No heavy shadows, no glass, no gradients except a single sanctioned one.
- **The card header's right slot holds exactly three things:** a drill-down link, a status pill, or a count chip. Things that describe the card, not things that change it. Controls that change the data belong inside the body, above the content they affect, so they cannot be mistaken for page-level filters.
- **Padding steps down as content shrinks; radius stays constant.** Varying the radius makes cards look like different components.
- **A drill-down page whose whole body is one visualisation uses a bare card** with no title and no subtitle. The page H1 already said it.
- **When a list or table *is* the page, mount it bare.** No card.
- Break a card into sub-sections with one of a small set of published forms, chosen by the relationship between the parts.

## 6. Headings

Three rungs and no fourth: page H1, card title, sub-section label. A fourth size means two of them are doing the same job.

**Attach a metric's definition to the object, not to a legend** — an info affordance on the card title and on the KPI tile. End any page whose numbers depend on contested definitions with a full-width definitions card.

## 7. Navigation and URLs

- **One flat spine of six to eight top-level routes in a single non-collapsing row.** No sidebar, no nested menus, no hamburger on desktop. A dashboard's IA should be visible in one glance; if it does not fit in a row, the product has too many top-level concepts.
- **Make the URL the IA:** `/{stage}` for an overview, `/{stage}/{view}` for a drill-down, `/{entity}/{id}` for a record. A reader should be able to guess a URL.
- **Reach every drill-down with a paired affordance and ship no breadcrumbs:** a forward link in the parent card's header, and a back link at the top of the child. Breadcrumbs are for deep trees; a two-level dashboard does not have one.
- **When an overview card needs a second dimension, route to a dedicated page** rather than adding a control that doubles the card's meaning.
- **Put filter and period state in the URL** on server-rendered pages, so a reader can send someone exactly what they are looking at. Ephemeral refinement can stay in component state. A dashboard whose interesting states cannot be linked gets screenshotted into chat instead, and is then stale forever.
- Give list components a destination prop rather than hardcoding routes, so one roster serves several mounts.

## 8. Responsive

- **Two breakpoints, giving three states.** Resist a third; each one multiplies the states nobody tests.
- **State explicitly what does *not* change responsively:** container width, padding, grid gap, card padding, card radius, type scale. Naming the invariants is what stops a layout drifting into four designs.
- Below the small breakpoint, reflow the header rather than collapsing the nav into a menu.
- **Design for the room, not the monitor.** Dashboards are read projected and screenshared far more often than teams design for. Check at 50%.

## 9. States at page level

- **A route-level loading skeleton reproduces the real grid** — same container, same column spans, same block heights — or the page visibly jumps at hydration and reads as broken.
- **When a whole page depends on one upstream source, guard the entire body** and render a single titled card explaining what is unavailable. Do not render eight cards each saying "no data".
- **Empty states are a centred sentence naming what is missing and why.** No icons, no illustrations.

## 10. Theme

Pin a single-mode product's theme at the layout wrapper and set the colour scheme explicitly, so browser-native surfaces do not render in the wrong mode. See `color.md` §10.

---

## Checklist

- [ ] Narrative order fixed: H1, dek, hero, strip, sections, definitions
- [ ] Dek states the page's question and the population
- [ ] Four column patterns, no fifth
- [ ] Multi-column rows top-aligned
- [ ] Minimum-width override on every chart/table container
- [ ] Page budget held to about eight card-shaped objects
- [ ] One card shell, one radius, hairline plus one shadow
- [ ] Flat nav spine, URL mirrors the IA
- [ ] Linkable filter state
- [ ] Two breakpoints, invariants named
- [ ] Skeleton mirrors the real grid
