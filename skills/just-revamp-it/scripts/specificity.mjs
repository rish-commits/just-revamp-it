#!/usr/bin/env node
/**
 * generic.mjs — detect a dashboard that was generated rather than designed.
 *
 *   node generic.mjs <dir> [--json] [--rule <id>]
 *
 * A different question from scan.mjs. That one asks "will a reader draw a wrong
 * conclusion?". This one asks "was this built for THIS product, or for any product?"
 *
 * The tell is not ugliness. Generated dashboards are usually tidy. The tell is
 * genericness: borrowed copy, invented data, a palette that encodes nothing, and
 * chrome that would sit equally well on a fitness app or a payments console.
 *
 * That matters here more than on a marketing page, because a dashboard's whole
 * claim is that its numbers mean something. Fake names and a fabricated "+12.5%"
 * are not cosmetic defects: they are the same failure as an unlabelled population,
 * arriving through the front door.
 *
 * Written for this system. The idea of shipping an anti-pattern detector alongside
 * a design system is borrowed from `impeccable`; none of its code or rules are.
 */

import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, extname, relative } from "node:path";
import { hexToOklch } from "./lib/color.mjs";

const SKIP = new Set(["node_modules", ".git", ".next", "dist", "build", "out", "coverage", ".vercel"]);
const EXT = new Set([".tsx", ".jsx", ".ts", ".js", ".vue", ".svelte", ".astro", ".html", ".css"]);

function walk(dir, files = []) {
  let entries; try { entries = readdirSync(dir); } catch { return files; }
  for (const e of entries) {
    if (SKIP.has(e) || (e.startsWith(".") && e.length > 1)) continue;
    const p = join(dir, e);
    let st; try { st = statSync(p); } catch { continue; }
    if (st.isDirectory()) walk(p, files);
    else if (EXT.has(extname(p))) files.push(p);
  }
  return files;
}

const lineOf = (src, i) => src.slice(0, i).split("\n").length;
const inComment = (src, i) => {
  const line = src.slice(0, i).split("\n").pop() ?? "";
  return /^\s*(\/\/|\*|\/\*)/.test(line);
};

// ---------------------------------------------------------------------------

const RULES = [
  {
    id: "invented-data",
    severity: "P0",
    title: "Placeholder data presented as real",
    why: "A dashboard's entire claim is that its numbers mean something. Fake names and invented figures shipped into a real surface are the same failure as an unlabelled population, and they are the fastest way to lose a reader permanently.",
    fix: "Wire real data, or mark the surface plainly as an example. Never leave demo values where a reader would take them as measurements.",
    check(src, file) {
      const out = [];
      const needles = [
        /\bJohn Doe\b/g, /\bJane (Doe|Smith)\b/g, /\bAcme\b/g, /\bLorem ipsum\b/gi,
        /\buser@example\.com\b/g, /\bjohn@/gi, /\btest@test\b/g,
        /\bProduct [ABC]\b/g, /\bCompany [ABC]\b/g, /\bfoo(bar|baz)?\b/g,
        /\$45,?231\.89\b/g, /\bOlivia Martin\b/g, /\bsomeone@example\b/gi,
      ];
      for (const re of needles)
        for (const m of src.matchAll(re)) {
          if (inComment(src, m.index)) continue;
          out.push({ file, line: lineOf(src, m.index), evidence: m[0] });
        }
      return out;
    },
  },
  {
    id: "template-copy",
    severity: "P1",
    title: "Metric names borrowed from a template",
    why: "These labels come from the starter blocks every generator reaches for. They describe no particular product, so they state no population, no window and no denominator. A reader cannot tell what was counted.",
    fix: "Name metrics from your own product: `<Population> <measure> <qualifier>`, with the window in the subtitle. See reference/naming.md.",
    heuristic: true,
    check(src, file) {
      const out = [];
      const phrases = [
        /["'>]\s*Total Revenue\s*["'<]/g, /["'>]\s*Subscriptions\s*["'<]/g,
        /["'>]\s*Active Now\s*["'<]/g, /["'>]\s*Recent Activity\s*["'<]/g,
        /from last month/gi, /\+20\.1%/g, /\+180\.1%/g, /\+19% from last month/gi,
      ];
      for (const re of phrases)
        for (const m of src.matchAll(re)) out.push({ file, line: lineOf(src, m.index), evidence: m[0].trim() });
      return out;
    },
  },
  {
    id: "fabricated-delta",
    severity: "P1",
    title: "Hard-coded change figures",
    why: "A delta written as a literal is not a measurement. Generated dashboards fill every tile with a plausible one, and they are almost always positive, which quietly turns the surface into an advertisement.",
    fix: "Compute the delta in the data layer from a stated comparison window, and render nothing when the prior period is zero or absent.",
    check(src, file) {
      const out = [];
      const hits = [];
      for (const m of src.matchAll(/["'>+\s](\+|\-|−)\s?\d{1,3}(\.\d)?%/g)) {
        if (inComment(src, m.index)) continue;
        hits.push({ line: lineOf(src, m.index), text: m[0].trim() });
      }
      // One literal is a label. Three or more in a file is a wall of invented deltas.
      if (hits.length >= 3)
        for (const h of hits) out.push({ file, line: h.line, evidence: h.text });
      return out;
    },
  },
  {
    id: "random-data",
    severity: "P1",
    title: "Chart fed by a random number generator",
    why: "A chart drawn from noise looks exactly like a chart drawn from data, which is precisely the problem. It will be screenshotted, and nobody downstream can tell.",
    fix: "Use real data, or a fixed sample that is labelled as sample data on the surface itself.",
    check(src, file) {
      const out = [];
      for (const m of src.matchAll(/Math\.random\(\)/g)) {
        if (inComment(src, m.index)) continue;
        const ctx = src.slice(Math.max(0, m.index - 300), m.index + 200);
        if (!/(chart|data|series|value|point|bar|spark|trend|metric)/i.test(ctx)) continue;
        out.push({ file, line: lineOf(src, m.index), evidence: "Math.random() near chart data" });
      }
      return out;
    },
  },
  {
    id: "rainbow-palette",
    severity: "P1",
    title: "Categorical colours spanning the spectrum",
    why: "A palette that runs across many hues encodes nothing: the reader cannot rank the categories, and green and red inside it collide with the meaning this system reserves for change. It is the default a generator produces because it looks lively.",
    fix: "One accent for the whole distribution with categories carried by their labels, or the sequential ramp from palette.mjs. If the categories are a genuine ordinal severity axis, apply the three-part test in reference/color.md and write the justification next to the code.",
    heuristic: true,
    check(src, file) {
      const out = [];
      for (const m of src.matchAll(/\[[^\][]{10,400}?\]/g)) {
        const hexes = [...m[0].matchAll(/#[0-9a-fA-F]{6}\b/g)].map((x) => x[0]);
        if (hexes.length < 4) continue;
        let hues;
        try { hues = hexes.map((h) => hexToOklch(h).h); } catch { continue; }
        // circular spread: the largest gap's complement
        const sorted = [...hues].sort((a, b) => a - b);
        let gap = 360 - (sorted[sorted.length - 1] - sorted[0]);
        for (let i = 1; i < sorted.length; i++) gap = Math.max(gap, sorted[i] - sorted[i - 1]);
        const spread = 360 - gap;
        if (spread < 150) continue;
        out.push({ file, line: lineOf(src, m.index), evidence: `${hexes.length} hues spanning ${Math.round(spread)}°: ${hexes.join(" ")}` });
      }
      return out;
    },
  },
  {
    id: "emoji-ui",
    severity: "P2",
    title: "Emoji as interface furniture",
    why: "Emoji render differently on every platform, carry no meaning to a screen reader, and cannot be restyled. In a dense data interface they read as decoration in a place the reader expects an encoding.",
    fix: "Use the stroked icon family, or nothing. A section rarely needs a marker at all.",
    check(src, file) {
      const out = [];
      for (const m of src.matchAll(/["'>][^"'<>\n]{0,40}?(\p{Extended_Pictographic})/gu)) {
        if (inComment(src, m.index)) continue;
        out.push({ file, line: lineOf(src, m.index), evidence: m[1] });
      }
      return out;
    },
  },
  {
    id: "gradient-text",
    severity: "P2",
    title: "Gradient-filled text",
    why: "It reduces contrast across the glyphs unpredictably, so part of the word always fails legibility, and it is the single most recognisable generated-design tell.",
    fix: "Set the heading in one ink from the token set. Spend emphasis on size and weight.",
    check(src, file) {
      const out = [];
      for (const m of src.matchAll(/(bg-clip-text|background-clip:\s*text|-webkit-background-clip:\s*text)/g))
        out.push({ file, line: lineOf(src, m.index), evidence: m[0] });
      return out;
    },
  },
  {
    id: "glassmorphism",
    severity: "P2",
    title: "Translucent blurred surfaces",
    why: "A data surface needs a stable ground. Blur puts whatever is behind a card into competition with the numbers on it, and the effective contrast changes as the page scrolls.",
    fix: "Opaque surface, hairline border, one soft shadow. Depth comes from the border and the tint step, not from blur.",
    check(src, file) {
      const out = [];
      for (const m of src.matchAll(/(backdrop-blur|backdrop-filter\s*:\s*blur)/g))
        out.push({ file, line: lineOf(src, m.index), evidence: m[0] });
      return out;
    },
  },
  {
    id: "heavy-shadow",
    severity: "P2",
    title: "Heavy shadows on every surface",
    why: "When every card is lifted, nothing is. Elevation stops being a hierarchy signal and becomes texture, which is what makes a generated dashboard read as a pile of tiles rather than one page.",
    fix: "One hairline plus one soft shadow, applied to the card role only. Lift the single thing that needs it.",
    check(src, file) {
      const hits = [...src.matchAll(/(?<![\w-])shadow-(lg|xl|2xl)(?![\w-])/g)];
      return hits.length >= 3
        ? hits.map((m) => ({ file, line: lineOf(src, m.index), evidence: m[0] }))
        : [];
    },
  },
  {
    id: "nested-card",
    severity: "P2",
    title: "Cards inside cards",
    why: "Border, fill, radius and shadow each say 'separate object'. Nesting them says it twice and flattens the hierarchy the outer card was drawing.",
    fix: "Divide a card's interior with a rule and space, not another card. A full-page table needs no card at all.",
    heuristic: true,
    check(src, file) {
      const out = [];
      const re = /<(?:div|section|article)[^>]*className=["'][^"']*\b(?:card|rounded-(?:xl|2xl))\b[^"']*shadow[^"']*["'][^>]*>/g;
      const opens = [...src.matchAll(re)];
      for (let i = 1; i < opens.length; i++) {
        const between = src.slice(opens[i - 1].index, opens[i].index);
        const closes = (between.match(/<\/(?:div|section|article)>/g) || []).length;
        const nested = (between.match(/<(?:div|section|article)/g) || []).length;
        if (closes < nested) out.push({ file, line: lineOf(src, opens[i].index), evidence: "card-like element inside another" });
      }
      return out;
    },
  },
];

// ---------------------------------------------------------------------------

export function run(root, only) {
  const findings = [];
  for (const file of walk(root)) {
    let src; try { src = readFileSync(file, "utf8"); } catch { continue; }
    for (const rule of RULES) {
      if (only && rule.id !== only) continue;
      let hits = [];
      try { hits = rule.check(src, relative(root, file) || file) ?? []; } catch { hits = []; }
      for (const h of hits)
        findings.push({ rule: rule.id, severity: rule.severity, title: rule.title,
                        heuristic: !!rule.heuristic, why: rule.why, fix: rule.fix, ...h });
    }
  }
  return { root, findings };
}

/** 0-100. Weighted by severity, saturating, so one P0 dominates a pile of P2s. */
export function score({ findings }) {
  const w = { P0: 25, P1: 8, P2: 3 };
  const penalty = findings.reduce((n, f) => n + (w[f.severity] ?? 1), 0);
  return Math.max(0, 100 - Math.min(100, penalty));
}

function render(res) {
  const B = (t) => `\x1b[1m${t}\x1b[0m`, D = (t) => `\x1b[2m${t}\x1b[0m`;
  const COL = { P0: "\x1b[41;97m P0 \x1b[0m", P1: "\x1b[31mP1\x1b[0m", P2: "\x1b[33mP2\x1b[0m" };
  const out = [`\n${B("Specificity scan")}  ${res.root}`];
  out.push(D("  Does this dashboard belong to this product, or to any product?\n"));
  if (!res.findings.length) {
    out.push("  \x1b[32mNothing generic detected.\x1b[0m\n");
    return out.join("\n");
  }
  const by = new Map();
  for (const f of res.findings) { if (!by.has(f.rule)) by.set(f.rule, []); by.get(f.rule).push(f); }
  const order = { P0: 0, P1: 1, P2: 2 };
  for (const [, g] of [...by].sort((a, b) => order[a[1][0].severity] - order[b[1][0].severity])) {
    const f = g[0];
    out.push(`  ${COL[f.severity]} ${B(f.title)} ${D(`(${g.length})`)}${f.heuristic ? D("  heuristic, verify") : ""}`);
    out.push(`      ${D(f.why)}`);
    for (const h of g.slice(0, 5)) out.push(`      ${h.file}:${h.line}  ${D(h.evidence)}`);
    if (g.length > 5) out.push(D(`      +${g.length - 5} more`));
    out.push(`      ${D("fix: " + f.fix)}`);
    out.push("");
  }
  const s = score(res);
  const band = s >= 85 ? "\x1b[32mspecific to this product\x1b[0m"
             : s >= 60 ? "\x1b[33mpartly templated\x1b[0m"
             : "\x1b[31mcould be any product\x1b[0m";
  out.push(`  ${B("Specificity")} ${s}/100  ${band}\n`);
  return out.join("\n");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const root = args.find((a) => !a.startsWith("--")) ?? ".";
  const only = args.includes("--rule") ? args[args.indexOf("--rule") + 1] : null;
  if (!existsSync(root)) { console.error(`no such directory: ${root}`); process.exit(2); }
  const res = run(root, only);
  if (args.includes("--json")) console.log(JSON.stringify({ ...res, score: score(res) }, null, 2));
  else process.stdout.write(render(res));
}
