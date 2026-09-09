# Accessibility

A dashboard's job is to convey a fact. A fact a reader cannot perceive was not conveyed. That framing makes most of this chapter obvious rather than compliance-driven.

---

## 1. The bar

**Target: WCAG 2.2 AA.** State it, so "is this accessible enough" stops being a per-PR argument.

**In scope:** every interactive element, all text, and every data mark that carries unique information.

**Out of scope:** decorative marks that repeat information already available as text. A sparkline beside a number that also prints its trend is decorative and correctly hidden from assistive technology. Say which of your marks are decorative, and hide those explicitly rather than leaving it ambiguous.

## 2. No fact carried by hue alone

**MUST.** This is the rule that catches the most real failures in dashboards.

- **Direction gets a glyph or a sign**, not just a colour. A delta pill that strips the sign and prints a coloured magnitude with a decorative arrow carries **no direction at all** for a reader with red-green colour blindness, which is roughly 8% of men.
- **Status gets a word or a shape**, not just a fill.
- **Category gets a direct label**, not just a swatch.

Two specific traps:

- **Green and red are the classic red-green collision.** The system reserves them for change, which is correct and unavoidable, so the redundant cue is mandatory rather than optional.
- **A green-to-red severity ramp at constant lightness is invisible to a dichromat.** If you ship one (see the exception test in `color.md`), it must vary in lightness too, and the palette validator must simulate it.

**Good news worth stating:** a single-hue sequential ramp is the *most* colour-blind-safe sequential encoding available, because it varies lightness monotonically. That is a genuine strength of this system.

## 3. Charts

The weakest area in most dashboards, and cheap to fix.

- **MUST — every informative chart ships a summary sentence** as an image role plus a label: series name, point count, first and last labelled values, and the peak or total. One line of code, and it is the difference between a chart and a blank region.
- **MUST — every interactive chart's hover band is also a focus stop**, with the same handlers. Hover-only interaction means keyboard and touch users get the summary sentence and nothing else.
- **MUST — every chart has a reachable table equivalent.** A collapsed "View as table" is sufficient and cheap. This is also what makes a chart usable by anyone who wants the exact numbers, so it pays for itself beyond accessibility.
- Decorative marks are hidden explicitly.

## 4. Tables, controls, motion

- Tables get a caption or label, column scope, and if sortable, a sort state.
- **Every focusable control has a visible focus ring.** One recipe, never removed.
- **When a control's visible label changes with state, its accessible name changes with it.**
- **Never truncate without a non-hover recovery path.** A native title is invisible on touch and to keyboard; where the label matters, put it in the accessible name too.
- **Every infinite animation is guarded by a reduced-motion alternative, with no exceptions**, including ones you consider harmless and ones the user triggered.
- **The reduced-motion path is the complete experience, not a degraded one.** Removing the animation must not remove the state change it was communicating.

## 5. Enforce it, do not convention it

**A written convention at 40% coverage is the evidence that conventions do not hold.**

Four cheap checks, all of which belong in CI rather than review:

1. **A palette contrast assertion.** Every palette member against the ink the helper picks for it, asserted at 4.5:1, **in every theme**. `palette.mjs` does this; wire its exit code into CI. Six lines, and it catches the exact failure of shipping a fill your own helper cannot find legible ink for.
2. **A hex census.** Fail on colour literals outside the token module. `vocabulary.mjs` reports these.
3. **A lint rule for the focus ring**, or a shared primitive that makes it impossible to omit. Prefer the primitive.
4. **A lint rule for truncation without a recovery path.**

## 6. The projection floor

Dashboards are read projected in meetings and screenshared at reduced size far more often than teams design for, and that is a real accessibility constraint rather than a nicety.

Either build a presentation mode, or set a floor and hold it:

- No text below 12px.
- No ink below 4.5:1, including captions and axis labels. Muted greys around 2.5:1 are the usual offender and they fail the room.
- No information carried by an element smaller than about 8px.

The floor is cheaper than a mode and is usually the right call. See `output.md`.
