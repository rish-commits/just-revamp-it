# Interaction and motion

A dashboard is read, not played with. Almost every rule here reduces motion and choice rather than adding it.

---

## 1. Motion

**MUST — data renders at its final value on first paint.**

No count-up numbers, no growing bars, no drawing-in chart paths, no staggered card entrances. Animated data is unreadable while it animates, it delays the answer the reader came for, and on a surface that refreshes it makes every load feel slow. This is the single most common way a dashboard is made worse by good intentions.

- **Ship one transition utility: colour.** No transition-all, no transform, no opacity transitions on data.
- **Never write a duration, easing curve or delay.** Inherit the framework default. Every hand-written duration is a second motion system.
- **Allow at most two animations product-wide**, both infinite status loops: a spinner on in-flight state, and a pulse on a loading skeleton.
- **Guard every infinite animation with a reduced-motion alternative**, including ones you consider harmless.

## 2. Selection has three languages

**MUST NOT mix them.** Each says something different:

1. **A toggle that picks a view** — solid dark neutral on white. It is a mode, not data.
2. **A filter that narrows a population** — accent tint. It is acting on the data.
3. **A navigation item marking where you are** — neutral wash. It is location.

**Navigation and view toggles are never the accent.** If the accent marks both "this is data" and "this is where you are", it marks neither.

**A segment that filters a population states that population's size on the segment**, dimmed one step. That turns a filter into evidence.

## 3. Hover

**A five-value ladder keyed to surface weight, and nothing may invent a sixth**: table row wash, control wash, tint, text darkening, underline.

There is a second, wash-free idiom for controls inside a rail or a text run: darken the text one step and underline. Use it where a wash would draw a box around something that is not a box.

**A table row's identity link is ink text with an underline on hover and nothing else** — no colour change, no wash of its own. It sits inside a row that already has one.

Give in-page navigation links a padded hover target and pull it back with a negative margin, so the target is generous without the text shifting.

**Use a non-default cursor only to say something the cursor cannot otherwise say**: help on a definitional trigger, not-allowed on an inert control. Never a pointer on non-interactive text.

## 4. Focus and semantics

- **One focus recipe on every focusable control.** Two-pixel accent outline with an offset. Never remove it; restyle it.
- Every button declares its type. Every toggle announces its pressed state.
- **When a control's visible label changes with state, its accessible name must change with it.** Never pin a static label to a control whose meaning moves.
- **MUST — never let direction be carried by colour plus a decorative icon alone.** Put the direction in text the screen reader receives. A delta that says only "12%" in a green pill says nothing to a reader who cannot see the pill.

## 5. Tooltips

**Three mechanisms with a strict division of labour, never blurred:**

1. **An authored, focusable info affordance** for definitions and methodology.
2. **A native title attribute** for per-mark detail and full text behind truncation.
3. **A hand-built chart tooltip** for hover on a plot.

Rules for the authored one:

- Position it **fixed from the trigger's bounding rect**, captured at show time, so an overflow container can never clip it.
- **Open and close instantly.** No hover-intent delay, no grace period. A dashboard reader is scanning, and a delay reads as lag.
- Make the bubble non-interactive so it cannot swallow the pointer.
- The trigger is a real focus stop, bound to the same handlers as hover, with the tooltip referenced as its description.
- One visual: dark ground, light ink, small text, capped width, wrapping.
- Budget about 200 characters. Longer belongs in an on-page definitions block.

**Write a title readout as `Label: value · qualifier · qualifier`**, stating the denominator and the comparison. It is often the only place a keyboard or screen-reader user can get the number.

**Never truncate without a title carrying the full string.**

## 6. Charts

- **Hover targets are full-height transparent bands, one per data column**, laid over the plot. Never the mark itself.
- The chart tooltip is an HTML element positioned over the SVG by percentage of the viewBox, not an SVG text node.
- **Every informative chart carries an image role and a full-sentence label** composed from the data. See `charts.md`.

## 7. Client and server

**Interactivity is a thin client shell over server-rendered data.** Mark a file as client-side only when it needs a pointer event or browser state.

- **A toggle over server data renders every view on the server** and receives them as slots. Do not refetch to switch a tab.
- Where a toggle needs real computation, ship the raw rows once and compute in the client.
- **A reusable control primitive is fully controlled**: it takes a value and a change handler and owns no state.
- **When view state goes in the URL, make it a link, not a button**, and let the default option be the bare path. That keeps views shareable and the back button honest.

## 8. Freshness and refresh

- **A "last updated" stamp must be browser-only by construction**, or it will render one time on the server and a different time on the client.
- **On a fully dynamic page, refresh is a hard reload**, not a client-side revalidation, and both the stamp and the button switch to a present-tense in-flight state while it runs.

## 9. Disclosure

- **Filter an in-memory dataset instantly and un-debounced.** Debouncing a client-side filter adds latency to hide work that is not happening.
- **State the result count above the controls**, and repeat what is hidden below.
- Long lists get one of two idioms, chosen by whether the tail is reachable: expand in place, or link to a full view. Not both.
- **Confirm a copy action in place** by swapping the icon **and** its accessible label for about a second. Never a toast.
- **Retire a control by leaving it visible and inert, not by deleting it.** A control that vanishes makes readers think the product broke.
- Compute navigation active state with prefix matching so child routes keep the parent lit.
- On narrow screens, drop the nav into its own scrollable row rather than collapsing it behind a menu.

## 10. Native controls stay native

Style the chrome. Leave the behaviour alone. A hand-built select loses keyboard support, type-ahead, mobile pickers and screen-reader semantics in exchange for a matching border radius, which is never a good trade in an internal tool.
