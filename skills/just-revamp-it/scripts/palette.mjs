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

// ---------------------------------------------------------------------------
// Dark theme
//
// Dark is not an inversion. Alpha-over-black borders become alpha-over-white and
// need roughly double the value to read as the same weight; elevation reverses
// (shadows vanish on dark, so a raised surface gets LIGHTER); and the accent that
// clears AA as a fill on white routinely fails as text on near-black. Every value
// below is re-derived against the dark ground and validated independently.
// ---------------------------------------------------------------------------

const NEUTRAL_DARK = {
  canvas:     "#0b0b0c",
  surface:    "#1a1a1f",
  raised:     "#24242b",
  foreground: "#ededed",
  muted:      "#a1a1aa",
  border:     "rgba(255,255,255,0.12)",
};

// The ramp's organising principle is that step 0 carries the MOST contrast
// against the ground, so visual weight falls as the population falls. On white
// that means starting dark; on near-black it means starting light. Mirroring the
// light ladder would invert the meaning, so the ladder is re-chosen, not flipped.
const RAMP_L_DARK = [0.86, 0.78, 0.70, 0.61, 0.52];
const RAMP_C_DARK = [0.50, 0.70, 0.90, 1.00, 0.95];

/** Shift lightness in either direction until the colour clears `target` on `ground`. */
function tuneFor(hex, ground, target, dir) {
  const { L, C, h } = hexToOklch(hex);
  for (let i = 0; i <= 90; i++) {
    const l = L + dir * i * 0.01;
    if (l < 0.05 || l > 0.99) break;
    const cand = oklchToHex({ L: l, C, h });
    if (contrast(cand, ground) >= target) return cand;
  }
  return hex;
}

/** The accent, re-derived so it can carry marks and links on a dark ground. */
export function deriveAccentDark(accent) {
  const ok = (hex) =>
    contrast(hex, NEUTRAL_DARK.canvas) >= AA_LARGE && contrast(hex, NEUTRAL_DARK.surface) >= AA_LARGE;
  if (ok(accent)) return accent;
  return tuneFor(accent, NEUTRAL_DARK.surface, AA_LARGE, +1);
}

export function deriveRampDark(accent) {
  const { C, h } = hexToOklch(accent);
  return RAMP_L_DARK.map((L, i) => oklchToHex({ L, C: C * RAMP_C_DARK[i], h }));
}

/** Chip tone for dark: a lighter ink over a slightly higher-alpha fill. */
function chipDark(tone) {
  const fill = composite(tone, 0.18, NEUTRAL_DARK.surface);
  return { fill, ink: tuneFor(tone, fill, AA, +1) };
}

export function deriveDark(accent) {
  const accentUi = deriveAccentDark(accent);
  const ramp = deriveRampDark(accent);
  const heat = heatCeiling(accentUi, NEUTRAL_DARK.surface, NEUTRAL_DARK.foreground);
  const { L, C, h } = hexToOklch(accentUi);
  return {
    accent,
    accentUi,
    accentUiDerived: accentUi.toLowerCase() !== accent.toLowerCase(),
    ramp,
    rampInk: ramp.map((c) => inkOn(c, "#0b0b0c", "#ffffff")),
    heat: { min: 0.12, max: heat.max, ink: NEUTRAL_DARK.foreground, deadBand: heat.deadBand },
    funnel: { from: ramp[0], to: ramp[3], breakOpacity: 0.4 },
    hero: { from: accentUi, to: oklchToHex({ L: Math.max(0.30, L - 0.14), C, h }) },
    delta: {
      positive: chipDark(DELTA.positive),
      negative: chipDark(DELTA.negative),
      neutral:  chipDark(DELTA.neutral),
    },
    chartChrome: { gridline: "rgba(255,255,255,0.10)", axis: "rgba(255,255,255,0.22)", tick: NEUTRAL_DARK.muted },
    neutral: NEUTRAL_DARK,
  };
}

/** Contrast guard for the dark system. Same shape as validate(). */
export function validateDark(d) {
  const out = [];
  const fail = (id, msg, fix) => out.push({ level: "fail", id, msg, fix });
  const warn = (id, msg, fix) => out.push({ level: "warn", id, msg, fix });
  const pass = (id, msg) => out.push({ level: "pass", id, msg });

  const onCanvas = contrast(d.accentUi, d.neutral.canvas);
  onCanvas < AA_LARGE
    ? fail("dark-accent", `dark accent ${d.accentUi} is ${onCanvas.toFixed(2)}:1 on the dark canvas`,
        "this hue cannot carry marks on a dark ground even after lightening")
    : pass("dark-accent", `dark accent reads on the dark canvas at ${onCanvas.toFixed(2)}:1${d.accentUiDerived ? " (re-derived from the brand accent)" : ""}`);

  const body = contrast(d.neutral.foreground, d.neutral.surface);
  body < AA ? fail("dark-body", `body text is ${body.toFixed(2)}:1 on the card surface`, "lighten the foreground")
            : pass("dark-body", `body text clears AA on the card surface at ${body.toFixed(2)}:1`);

  const muted = contrast(d.neutral.muted, d.neutral.surface);
  muted < AA ? warn("dark-muted", `muted text is ${muted.toFixed(2)}:1, below AA for body copy`,
        "acceptable for large text only; do not use it for captions that carry meaning")
             : pass("dark-muted", `muted text clears AA at ${muted.toFixed(2)}:1`);

  // Elevation must be perceptible without relying on shadow.
  const elev = contrast(d.neutral.surface, d.neutral.canvas);
  elev < 1.10
    ? warn("dark-elevation", `card and canvas differ by only ${elev.toFixed(2)}:1`,
        "shadows are near-invisible on dark; separate surfaces by lightness plus a border")
    : pass("dark-elevation", `card is separable from the canvas by lightness (${elev.toFixed(2)}:1)`);

  for (const [name, chip] of Object.entries(d.delta)) {
    const r = contrast(chip.ink, chip.fill);
    r < AA ? fail("dark-delta", `${name} delta chip ink is ${r.toFixed(2)}:1 on its own fill`, "lighten the ink further")
           : pass(`dark-delta-${name}`, `${name} delta chip clears AA at ${r.toFixed(2)}:1`);
  }

  const pinched = d.ramp
    .map((c, i) => ({ i: i + 1, r: contrast(c, inkOn(c, "#0b0b0c", "#ffffff")) }))
    .filter((x) => x.r < AA);
  pinched.length
    ? warn("dark-ramp-text", `dark ramp stop(s) ${pinched.map((p) => `${p.i} at ${p.r.toFixed(2)}:1`).join("; ")} cannot carry body text`,
        "fill-only for these stops")
    : pass("dark-ramp-text", "all dark ramp stops carry body text");

  for (const kind of ["protanopia", "deuteranopia", "tritanopia"]) {
    const col = [];
    for (let i = 1; i < d.ramp.length; i++)
      if (deltaE(simulate(d.ramp[i - 1], kind), simulate(d.ramp[i], kind)) < 0.040) col.push(`${i}->${i + 1}`);
    col.length ? warn(`dark-cvd-${kind}`, `dark stops merge under ${kind}: ${col.join(", ")}`, "keep the lightness ladder; never encode by hue alone")
               : pass(`dark-cvd-${kind}`, `dark ramp stays separable under ${kind}`);
  }
  return out;
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
    dark: deriveDark(accent),
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

/* Dark is re-derived, not inverted: surfaces lighten with elevation, borders are
   alpha over white at roughly double the light value, the ramp starts light so
   weight still falls with magnitude, and the heat ceiling is recomputed for this
   hue against the dark surface. */
${darkBlock(s.dark, ':root:not([data-theme="light"])', '@media (prefers-color-scheme: dark)')}
${darkBlock(s.dark, ':root[data-theme="dark"]', null)}
`;

// Light is the default and dark is a narrow exception (see reference/theming.md),
// so the dark block ships only when explicitly asked for. Emitting it by default
// would quietly encourage a theme most dashboards should not have.
const cssLight = (s) => css(s).split("\n/* Dark is re-derived")[0].trimEnd() + "\n";

function darkBlock(d, selector, wrapper) {
  const body = `${selector} {
  --accent-ui: ${d.accentUi};
  --accent-deep: ${d.hero.to};
${d.ramp.map((c, i) => `  --chart-${i + 1}: ${c};`).join("\n")}
${d.ramp.map((c, i) => `  --chart-${i + 1}-ink: ${d.rampInk[i]};`).join("\n")}
  --funnel-from: ${d.funnel.from};
  --funnel-to: ${d.funnel.to};
  --heat-max: ${d.heat.max};
  --heat-ink: ${d.heat.ink};
  --delta-positive: ${d.delta.positive.ink};
  --delta-positive-fill: ${d.delta.positive.fill};
  --delta-negative: ${d.delta.negative.ink};
  --delta-negative-fill: ${d.delta.negative.fill};
  --canvas: ${d.neutral.canvas};
  --surface: ${d.neutral.surface};
  --raised: ${d.neutral.raised};
  --foreground: ${d.neutral.foreground};
  --muted: ${d.neutral.muted};
  --border: ${d.neutral.border};
  --gridline: ${d.chartChrome.gridline};
  --axis: ${d.chartChrome.axis};
}`;
  return wrapper ? `${wrapper} {\n${body.split("\n").map((l) => "  " + l).join("\n")}\n}` : body;
}

function report(sys, checks, darkChecks = [], darkOnly = false) {
  const B = (t) => `\x1b[1m${t}\x1b[0m`;
  const D = (t) => `\x1b[2m${t}\x1b[0m`;
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
  if (darkChecks.length && darkOnly) {
    const d = sys.dark;
    lines.push("");
    lines.push(B("  Dark theme") + D("  (re-derived, not inverted)"));
    lines.push(`    accent ${swatch(d.accentUi)} ${d.accentUi}${d.accentUiDerived ? D("  (brand accent re-derived for the dark ground)") : ""}`);
    lines.push("    ramp   " + d.ramp.map((c) => swatch(c)).join("") + "  " + D(d.ramp.join(" ")));
    lines.push(`    surfaces ${swatch(d.neutral.canvas)}${swatch(d.neutral.surface)}${swatch(d.neutral.raised)}  ` + D("canvas / card / raised"));
    lines.push(`    heat   alpha ${d.heat.min} to ${d.heat.max}` + D(`  (light theme: ${sys.heat.max})`));
    for (const c of darkChecks.filter((x) => x.level !== "pass")) {
      const tag = c.level === "fail" ? "\x1b[31mFAIL\x1b[0m" : "\x1b[33mWARN\x1b[0m";
      lines.push(`    ${tag}  ${c.msg}`);
      if (c.fix) lines.push(`          ${D("-> " + c.fix)}`);
    }
    lines.push(D(`    ${darkChecks.filter((c) => c.level === "pass").length} dark checks passed`));
  }
  const all = darkOnly ? [...checks, ...darkChecks] : checks;
  const fails = all.filter((c) => c.level === "fail").length;
  const warns = all.filter((c) => c.level === "warn").length;
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
  const darkChecks = validateDark(sys.dark);
  if (flags.includes("--css")) process.stdout.write(flags.includes("--dark") ? css(sys) : cssLight(sys));
  else if (flags.includes("--json")) process.stdout.write(JSON.stringify({ ...sys, checks, darkChecks }, null, 2) + "\n");
  else process.stdout.write(report(sys, checks, darkChecks, flags.includes("--dark")));
  process.exit((flags.includes("--dark") ? [...checks, ...darkChecks] : checks).some((c) => c.level === "fail") ? 1 : 0);
}
