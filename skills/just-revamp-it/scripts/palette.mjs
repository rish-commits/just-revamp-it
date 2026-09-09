#!/usr/bin/env node
/**
 * palette.mjs — derive a complete, validated dashboard colour system from ONE accent.
 *
 *   node palette.mjs "#7c3aed"            human report
 *   node palette.mjs "#7c3aed" --css      tokens.css
 *   node palette.mjs "#7c3aed" --json     tokens.json
 *
 * Why this exists: a handbook that says "swap the accent" is a promise it cannot
 * keep. Brands do not hand you a hue that happens to stay legible at every step
 * of a sequential ramp. This derives the ramp, finds the legibility ceiling for
 * THAT hue rather than reusing a number tuned for someone else's, and refuses to
 * emit a system that fails its own rules.
 */

import {
  hexToOklch, oklchToHex, contrast, inkOn, composite, simulate, deltaE, parseHex, toHex,
} from "./lib/color.mjs";

// The ladder is fixed in perceptual lightness so every brand's ramp reads as the
// same sequence. Chroma follows the accent's own, tapering toward the light end
// the way saturated hues naturally do; anything out of sRGB gets gamut-mapped.
const RAMP_L = [0.491, 0.541, 0.606, 0.709, 0.811];
const RAMP_C = [0.98, 1.00, 0.89, 0.64, 0.41];

const AA = 4.5;        // WCAG AA, normal text
const AA_LARGE = 3.0;  // WCAG AA, large text / graphical objects
const MARGIN = 0.04;   // back off the measured ceiling so rounding never crosses it

// Deltas are NOT derived from the accent. Green and red carry a fixed meaning
// ("this changed, and in which direction"); letting a brand tint them would make
// the one colour rule that must survive re-skinning the first casualty of it.
const DELTA = {
  positive: "#059669",
  negative: "#e11d48",
  neutral:  "#6b7280",
};

const NEUTRAL = {
  canvas:     "#fafafa",
  surface:    "#ffffff",
  foreground: "#171717",
  muted:      "#6b7280",
  border:     "rgba(0,0,0,0.06)",
};

/** Five sequential stops, dark to light, in the accent's own hue. */
export function deriveRamp(accent) {
  const { C, h } = hexToOklch(accent);
  return RAMP_L.map((L, i) => oklchToHex({ L, C: C * RAMP_C[i], h }));
}

/**
 * The heat-fill ceiling for this hue.
 *
 * A sequential heat fill is the accent at rising alpha over the surface. Text
 * sits on top of it at every value in the scale, so one ink has to stay legible
 * across the whole range. Past some alpha the dark ink fails; the light ink does
 * not recover until noticeably later, leaving a band where NEITHER clears AA.
 * Cap the ramp below that band rather than discovering it in production.
 */
export function heatCeiling(accent, ground = NEUTRAL.surface, ink = NEUTRAL.foreground) {
  let ceiling = 1;
  for (let a = 0.02; a <= 1.0001; a += 0.01) {
    if (contrast(composite(accent, a, ground), ink) < AA) { ceiling = a - 0.01; break; }
  }
  // Where the opposite ink becomes usable again; the gap between the two is dead.
  let recovers = null;
  const other = ink === NEUTRAL.foreground ? "#ffffff" : NEUTRAL.foreground;
  for (let a = ceiling; a <= 1.0001; a += 0.01) {
    if (contrast(composite(accent, a, ground), other) >= AA) { recovers = a; break; }
  }
  return {
    max: Math.max(0.2, Math.round((ceiling - MARGIN) * 100) / 100),
    measured: Math.round(ceiling * 100) / 100,
    deadBand: recovers && recovers > ceiling ? [Math.round(ceiling * 100) / 100, Math.round(recovers * 100) / 100] : null,
    ink,
  };
}

/**
 * The contrast-safe working colour for this brand.
 *
 * A brand hands you the colour its logo uses, not a colour that survives being a
 * 2px line on a near-white canvas. Sky blues and yellows routinely fail both the
 * canvas and the white-ink test. Refusing the brand is not an option, so keep the
 * identity colour for identity and darken the same hue until it can do UI work.
 * Where the brand colour already passes, these are the same value.
 */
export function deriveAccentUi(accent) {
  const { L, C, h } = hexToOklch(accent);
  const ok = (hex) => contrast(hex, NEUTRAL.canvas) >= AA_LARGE && contrast(hex, "#ffffff") >= AA;
  if (ok(accent)) return accent;
  for (let l = L; l >= 0.20; l -= 0.01) {
    const cand = oklchToHex({ L: l, C, h });
    if (ok(cand)) return cand;
  }
  return oklchToHex({ L: 0.20, C, h });
}

export function derive(accent) {
  const ramp = deriveRamp(accent);
  const heat = heatCeiling(accent);
  const { L, C, h } = hexToOklch(accent);
  const accentUi = deriveAccentUi(accent);
  return {
    accent,
    accentUi,
    accentUiDerived: accentUi.toLowerCase() !== accent.toLowerCase(),
    accentOklch: { L: +L.toFixed(4), C: +C.toFixed(4), h: +h.toFixed(2) },
    ramp,
    rampInk: ramp.map((c) => inkOn(c)),
    heat: { min: 0.12, max: heat.max, ink: heat.ink, deadBand: heat.deadBand },
    funnel: { from: ramp[0], to: ramp[3], breakOpacity: 0.4 },
    hero: { from: accentUi, to: oklchToHex({ L: Math.max(0.28, L - 0.16), C, h }) },
    tints: {
      hover:     `color-mix(in oklab, ${accent} 8%, transparent)`,
      selection: `color-mix(in oklab, ${accent} 18%, transparent)`,
      track:     "rgba(0,0,0,0.04)",
    },
    delta: DELTA,
    neutral: NEUTRAL,
  };
}

// ---------------------------------------------------------------------------
// Validation — the part that makes "swappable accent" a real guarantee
// ---------------------------------------------------------------------------

export function validate(sys) {
  const out = [];
  const fail = (id, msg, fix) => out.push({ level: "fail", id, msg, fix });
  const warn = (id, msg, fix) => out.push({ level: "warn", id, msg, fix });
  const pass = (id, msg) => out.push({ level: "pass", id, msg });

  // 1. How much text each ramp stop can carry.
  //
  // A stop that fails AA is not a broken colour, it is a colour with a rule
  // attached: use it as a fill and put the label outside. Single-hue ramps always
  // pinch in the middle, where the fill is too dark for dark ink and too light for
  // white. Report the constraint here; scan.mjs escalates it to a failure only when
  // it finds real text sitting on one of these fills.
  sys.textSafety = sys.ramp.map((c, i) => {
    const r = contrast(c, inkOn(c));
    return { stop: i + 1, hex: c, ink: inkOn(c), ratio: +r.toFixed(2),
             carries: r >= AA ? "any text" : r >= AA_LARGE ? "large text only" : "no text" };
  });
  const pinched = sys.textSafety.filter((s) => s.carries !== "any text");
  pinched.length
    ? warn("ramp-text-safety",
        `stop(s) ${pinched.map((p) => `${p.stop} at ${p.ratio}:1 (${p.carries})`).join("; ")} cannot carry body text`,
        "fill-only for these stops: put counts and labels outside the shape, never on it")
    : pass("ramp-text-safety", `all 5 stops carry body text at >= ${AA}:1`);

  // 2. Neighbouring stops must be tellable apart, or the ramp encodes nothing.
  const near = [];
  for (let i = 1; i < sys.ramp.length; i++) {
    const d = deltaE(sys.ramp[i - 1], sys.ramp[i]);
    if (d < 0.045) near.push(`${i}->${i + 1} (dE ${d.toFixed(3)})`);
  }
  near.length
    ? warn("ramp-separation", `adjacent stops too close: ${near.join(", ")}`, "use fewer categories, or switch to position/label encoding")
    : pass("ramp-separation", "adjacent ramp stops are perceptually distinct");

  // 3. The same, for colour-vision deficiency.
  for (const kind of ["protanopia", "deuteranopia", "tritanopia"]) {
    const collisions = [];
    for (let i = 1; i < sys.ramp.length; i++) {
      const d = deltaE(simulate(sys.ramp[i - 1], kind), simulate(sys.ramp[i], kind));
      if (d < 0.040) collisions.push(`${i}->${i + 1}`);
    }
    collisions.length
      ? warn(`cvd-${kind}`, `stops merge under ${kind}: ${collisions.join(", ")}`, "single-hue ramps rely on lightness; keep the lightness ladder and never encode by hue alone")
      : pass(`cvd-${kind}`, `ramp stays separable under ${kind}`);
  }

  // 4. The accent must not be mistakable for a delta. This is the multi-brand trap:
  //    a brand whose accent is green or red destroys "green/red only ever mean change".
  for (const [name, hex] of Object.entries({ positive: DELTA.positive, negative: DELTA.negative })) {
    const d = deltaE(sys.accent, hex);
    if (d < 0.13) {
      fail("accent-delta-collision",
        `accent ${sys.accent} is too close to the ${name} delta colour ${hex} (dE ${d.toFixed(3)})`,
        `this brand cannot use green/red for change AND this accent. Either shift the accent's hue, or adopt the arrow-plus-neutral delta treatment in reference/color.md`);
    }
  }
  if (!out.some((o) => o.id === "accent-delta-collision")) {
    pass("accent-delta-collision", "accent is clearly distinct from both delta colours");
  }

  // 5. The accent must read against the canvas it sits on.
  const onCanvas = contrast(sys.accent, NEUTRAL.canvas);
  if (sys.accentUiDerived) {
    warn("accent-on-canvas",
      `brand accent ${sys.accent} is ${onCanvas.toFixed(2)}:1 on the canvas, too pale to carry bars, lines or active states`,
      `keep ${sys.accent} for identity (wordmark, marketing). UI work uses the derived ${sys.accentUi} at ${contrast(sys.accentUi, NEUTRAL.canvas).toFixed(2)}:1, same hue. Both ship as tokens.`);
  } else {
    pass("accent-on-canvas", `accent reads on the canvas at ${onCanvas.toFixed(2)}:1`);
  }

  // 6. The hero uses white text on the accent gradient.
  const heroInk = contrast(sys.accentUi, "#ffffff");
  heroInk < AA
    ? fail("hero-ink", `white text on the hero fill is ${heroInk.toFixed(2)}:1, below ${AA}:1 even after darkening`,
        "this hue cannot host a white headline number. Use dark ink on a pale tint of it instead of a filled hero.")
    : pass("hero-ink", `white text on the hero clears AA at ${heroInk.toFixed(2)}:1`);

  return out;
}

// ---------------------------------------------------------------------------
// Emitters
// ---------------------------------------------------------------------------

const css = (s) => `/* Generated by just-revamp-it from accent ${s.accent}. Do not hand-edit. */
:root {
  --accent: ${s.accent};            /* brand identity: wordmark, marketing */
  --accent-ui: ${s.accentUi};       /* working colour: bars, lines, links, active states */
  --accent-deep: ${s.hero.to};

${s.ramp.map((c, i) => `  --chart-${i + 1}: ${c};`).join("\n")}
${s.ramp.map((c, i) => `  --chart-${i + 1}-ink: ${s.rampInk[i]};`).join("\n")}

  --funnel-from: ${s.funnel.from};
  --funnel-to: ${s.funnel.to};
  --funnel-break-opacity: ${s.funnel.breakOpacity};

  /* Heat fills: alpha from --heat-min to --heat-max only. Past the max, no ink
     stays legible on this hue. */
  --heat-min: ${s.heat.min};
  --heat-max: ${s.heat.max};
  --heat-ink: ${s.heat.ink};

  --delta-positive: ${s.delta.positive};
  --delta-negative: ${s.delta.negative};
  --delta-neutral: ${s.delta.neutral};

  --canvas: ${s.neutral.canvas};
  --surface: ${s.neutral.surface};
  --foreground: ${s.neutral.foreground};
  --muted: ${s.neutral.muted};
  --border: ${s.neutral.border};

  --tint-hover: ${s.tints.hover};
  --tint-selection: ${s.tints.selection};
  --track: ${s.tints.track};
}
`;

function report(sys, checks) {
  const B = (t) => `\x1b[1m${t}\x1b[0m`;
  const swatch = (hex) => { const { r, g, b } = parseHex(hex); return `\x1b[48;2;${r};${g};${b}m   \x1b[0m`; };
  const lines = [];
  lines.push(`\n${B("Derived colour system")}  accent ${sys.accent}  (OKLCH L ${sys.accentOklch.L} C ${sys.accentOklch.C} h ${sys.accentOklch.h})\n`);
  if (sys.accentUiDerived) {
    lines.push(`  ${B("Working colour")}  ${swatch(sys.accentUi)} ${sys.accentUi}  \x1b[2m(brand accent is too pale for UI; same hue, darkened)\x1b[0m\n`);
  }
  lines.push(B("  Sequential ramp"));
  sys.ramp.forEach((c, i) => lines.push(`    ${swatch(c)} chart-${i + 1}  ${c}   ink ${sys.rampInk[i]}   ${contrast(c, sys.rampInk[i]).toFixed(2)}:1`));
  lines.push("");
  lines.push(B("  Heat fill"));
  lines.push(`    alpha ${sys.heat.min} to ${sys.heat.max}, ink ${sys.heat.ink}`);
  if (sys.heat.deadBand) lines.push(`    \x1b[2mdead band at alpha ${sys.heat.deadBand[0]}-${sys.heat.deadBand[1]}: neither ink clears AA. Capped below it.\x1b[0m`);
  lines.push("");
  lines.push(B("  Fixed by the system (never brand-derived)"));
  lines.push(`    ${swatch(DELTA.positive)} positive ${DELTA.positive}   ${swatch(DELTA.negative)} negative ${DELTA.negative}`);
  lines.push("");
  lines.push(B("  Checks"));
  for (const c of checks) {
    const tag = c.level === "fail" ? "\x1b[31mFAIL\x1b[0m" : c.level === "warn" ? "\x1b[33mWARN\x1b[0m" : "\x1b[32mpass\x1b[0m";
    lines.push(`    ${tag}  ${c.msg}`);
    if (c.fix) lines.push(`          \x1b[2m-> ${c.fix}\x1b[0m`);
  }
  const fails = checks.filter((c) => c.level === "fail").length;
  const warns = checks.filter((c) => c.level === "warn").length;
  lines.push("");
  lines.push(fails ? `  \x1b[31m${fails} failure(s)\x1b[0m and ${warns} warning(s). This accent is not usable as-is.`
                   : warns ? `  \x1b[33mUsable, with ${warns} warning(s).\x1b[0m`
                           : `  \x1b[32mClean. This accent is safe to ship.\x1b[0m`);
  return lines.join("\n") + "\n";
}

// ---------------------------------------------------------------------------

const [, , accentArg, ...flags] = process.argv;
if (import.meta.url === `file://${process.argv[1]}`) {
  if (!accentArg) {
    console.error('usage: palette.mjs "#7c3aed" [--css|--json]');
    process.exit(2);
  }
  let sys;
  try { sys = derive(accentArg); }
  catch (e) { console.error(`error: ${e.message}`); process.exit(2); }
  const checks = validate(sys);
  if (flags.includes("--css")) process.stdout.write(css(sys));
  else if (flags.includes("--json")) process.stdout.write(JSON.stringify({ ...sys, checks }, null, 2) + "\n");
  else process.stdout.write(report(sys, checks));
  process.exit(checks.some((c) => c.level === "fail") ? 1 : 0);
}
