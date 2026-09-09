#!/usr/bin/env node
/**
 * scan.mjs — detect dashboard anti-patterns in source.
 *
 *   node scan.mjs <dir> [--json] [--rule <id>]
 *
 * Deliberately NOT a general linter. Every rule here is about whether a reader
 * draws a correct conclusion from a number: misleading encodings, numbers that
 * jitter, values too small to see, missing empty states, undefined metrics.
 *
 * Findings are evidence, not verdicts. Each carries file:line so it can be
 * checked. Some rules are heuristic and say so; verify before acting.
 */

import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, extname, relative } from "node:path";

const SKIP = new Set(["node_modules", ".git", ".next", "dist", "build", "out", "coverage", ".vercel"]);
const EXT = new Set([".tsx", ".jsx", ".ts", ".js", ".vue", ".svelte", ".astro"]);

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

const lineOf = (src, idx) => src.slice(0, idx).split("\n").length;

// ---------------------------------------------------------------------------
// Rules
// ---------------------------------------------------------------------------

const RULES = [
  {
    id: "numbers-jitter",
    severity: "P1",
    title: "Numeric value without tabular numerals",
    why: "Proportional digits have different widths, so a number that updates or a column of numbers visibly shifts. Columns stop aligning and the eye cannot compare down the column.",
    fix: "Add `tabular-nums` (or `font-variant-numeric: tabular-nums`) to the element rendering the value.",
    check(src, file) {
      const out = [];
      // Only markup renders a number to a reader. A `${n.toFixed(1)}` inside a
      // template literal is usually building an SVG path or a class string, and
      // flagging those trains people to ignore this rule.
      if (!/\.(tsx|jsx|vue|svelte|astro)$/.test(file)) return out;
      const re = /\{[^{}\n]*(?:toLocaleString\(\)|toFixed\(\d\)|\bpct\b)[^{}\n]*\}/g;
      for (const m of src.matchAll(re)) {
        const before = src.slice(Math.max(0, m.index - 600), m.index);
        // inside a template literal? count unescaped backticks since the last newline-ish boundary
        const ticks = (before.match(/`/g) || []).length;
        if (ticks % 2 === 1) continue;
        const openTag = before.lastIndexOf("<");
        if (openTag === -1) continue;
        const tag = before.slice(openTag);
        // must actually be a JSX text position: the tag has been closed with `>`
        if (!/>/.test(tag)) continue;
        if (/tabular-nums|tabularNums|variant-numeric/.test(tag)) continue;
        if (/(?:key|title|aria-label|alt|href)\s*=\s*$/.test(before.trimEnd())) continue;
        out.push({ file, line: lineOf(src, m.index), evidence: m[0].trim().slice(0, 90) });
      }
      return out;
    },
  },
  {
    id: "invisible-small-value",
    severity: "P1",
    title: "Proportional bar width with no minimum",
    why: "A step worth 0.3% of the first renders as a sliver or nothing at all, so a real value reads as absent. Funnels with large magnitude drops hit this constantly.",
    fix: "Floor the rendered length (e.g. `Math.max(pct, 1.5)`) and always print the count and conversion as text alongside the bar.",
    check(src, file) {
      const out = [];
      for (const m of src.matchAll(/width:\s*`\$\{([^}]{1,80})\}%`/g)) {
        if (/Math\.max/.test(m[1])) continue;
        out.push({ file, line: lineOf(src, m.index), evidence: m[0].trim().slice(0, 90) });
      }
      return out;
    },
  },
  {
    id: "truncated-baseline",
    severity: "P0",
    title: "Bar chart baseline may not be zero",
    why: "Bars encode magnitude by length, so a non-zero baseline exaggerates differences. A 3% change can be drawn to look like a doubling. This is the single most misleading thing a dashboard can do.",
    fix: "Bars start at zero, always. If the interesting variation is small, use a line chart, which may have a clipped domain, or plot the delta directly.",
    heuristic: true,
    check(src, file) {
      const out = [];
      if (!/\bbar\b|Bar/i.test(file) && !/<rect|bar/i.test(src)) return out;
      for (const m of src.matchAll(/const\s+(?:min|domainMin|yMin)\s*=\s*Math\.min\(/g))
        out.push({ file, line: lineOf(src, m.index), evidence: m[0].trim() });
      return out;
    },
  },
  {
    id: "pie-chart",
    severity: "P2",
    title: "Pie or donut chart",
    why: "Angle is the hardest visual encoding to compare accurately. Beyond about three slices a reader cannot rank them, and almost every pie is better as a ranked bar.",
    fix: "Use a ranked horizontal bar chart, or a single stat with a share percentage if there is only one interesting slice.",
    check(src, file) {
      const out = [];
      for (const m of src.matchAll(/\b(PieChart|DonutChart|<Pie\b|pieChart|arc\(\)|d3\.pie)/g))
        out.push({ file, line: lineOf(src, m.index), evidence: m[0] });
      return out;
    },
  },
  {
    id: "semantic-color-misuse",
    severity: "P1",
    title: "Green or red used as a category colour",
    why: "Green and red are reserved for change and status. Using them to distinguish categories makes an unrelated series read as good or bad news.",
    fix: "Use the brand's sequential ramp for categories. Keep green and red exclusively for deltas and status.",
    heuristic: true,
    check(src, file) {
      const out = [];
      // arrays of colours containing a green AND another hue = categorical palette
      for (const m of src.matchAll(/\[[^\]]*#(?:0[0-9a-f]{2}|10b981|059669|22c55e|16a34a)[0-9a-f]{0,3}[^\]]*\]/gi)) {
        const seg = m[0];
        if (seg.length > 400) continue;
        const hexes = [...seg.matchAll(/#[0-9a-fA-F]{6}/g)].map((x) => x[0]);
        if (hexes.length >= 2) out.push({ file, line: lineOf(src, m.index), evidence: hexes.join(" ") });
      }
      return out;
    },
  },
  {
    id: "missing-empty-state",
    severity: "P1",
    heuristic: true,
    title: "List rendered without an empty state",
    why: "An empty array renders as blank space, which reads as a loading bug or a broken query rather than a true zero. The reader cannot tell 'no data yet' from 'nothing happened'.",
    fix: "Branch on length and say which it is: 'No users onboarded yet' differs from 'Data unavailable'.",
    check(src, file) {
      const out = [];
      // Identifiers destructured from props or function params: the only ones
      // whose emptiness is a runtime question rather than a code-reading one.
      const props = new Set();
      for (const d of src.matchAll(/(?:function\s+\w+|=>|\bconst\s+\w+\s*=)?\s*\(\s*\{([^}]{2,400})\}\s*(?::[^)]*)?\)/g))
        for (const part of d[1].split(","))
          { const id = part.trim().split(/[:=\s]/)[0]; if (/^\w+$/.test(id)) props.add(id); }
      for (const d of src.matchAll(/\bconst\s*\{([^}]{2,300})\}\s*=\s*(?:await\s+)?\w/g))
        for (const part of d[1].split(","))
          { const id = part.trim().split(/[:=\s]/)[0]; if (/^\w+$/.test(id)) props.add(id); }
      for (const m of src.matchAll(/\{(\w+(?:\.\w+)*)\.map\(/g)) {
        const name = m[1];
        const esc = name.replace(/\./g, "\\.");
        // A literal array declared in this module cannot be empty at runtime, so
        // an empty state for it would be dead code. Only data can be empty.
        const root = name.split(".")[0];
        if (new RegExp(`const\\s+${root}\\s*(?::[^=]+)?=\\s*\\[`).test(src)) continue;
        if (/^[A-Z0-9_]+$/.test(root)) continue;
        // Only data that arrives from outside the component can be empty at
        // runtime. Structural iteration (gradient stops, column definitions,
        // a fixed set of tabs) is derived in-module and always populated.
        if (!props.has(root)) continue;
        if (new RegExp(`${esc}\\.length|${esc}\\?\\.length|!${esc}\\b`).test(src)) continue;
        out.push({ file, line: lineOf(src, m.index), evidence: `${name}.map(...) with no length guard` });
      }
      return out;
    },
  },
  {
    id: "undefined-metric",
    severity: "P1",
    title: "Metric surfaced without a definition",
    why: "Two readers will define 'active' differently and reach different conclusions from the same number. A metric that is not defined on the surface is defined in the reader's head.",
    fix: "Attach a definition to every non-obvious metric: an info affordance on the card, or a definitions block on the page.",
    heuristic: true,
    check(src, file) {
      const out = [];
      for (const m of src.matchAll(/<(?:KpiTile|StatTile|Kpi|Metric)\b([\s\S]{0,600}?)\/?>/g)) {
        if (/\binfo\s*=|\btooltip\s*=|\bdefinition\s*=|\bhint\s*=/.test(m[1])) continue;
        const label = m[1].match(/label\s*=\s*[{"']([^"'}]{2,60})/);
        out.push({ file, line: lineOf(src, m.index), evidence: label ? `KpiTile "${label[1]}" has no info/definition` : "KpiTile with no info/definition" });
      }
      return out;
    },
  },
  {
    id: "hardcoded-color",
    severity: "P2",
    title: "Hard-coded colour where a token exists",
    why: "A brand cannot be re-skinned if its colours are spread through components as literals. This is what makes a design system per-brand rather than per-file.",
    fix: "Move the value into the generated token set and reference the token.",
    check(src, file) {
      const out = [];
      for (const m of src.matchAll(/#[0-9a-fA-F]{6}(?![0-9a-fA-F])/g)) {
        const line = lineOf(src, m.index);
        const ctx = src.slice(Math.max(0, m.index - 120), m.index);
        if (/\/\/|\/\*|\*/.test(ctx.split("\n").pop() ?? "")) continue; // comment
        out.push({ file, line, evidence: m[0] });
      }
      return out;
    },
  },
];

// ---------------------------------------------------------------------------

export function run(root, only) {
  const files = walk(root);
  const findings = [];
  for (const file of files) {
    let src; try { src = readFileSync(file, "utf8"); } catch { continue; }
    for (const rule of RULES) {
      if (only && rule.id !== only) continue;
      let hits = [];
      try { hits = rule.check(src, relative(root, file) || file) ?? []; } catch { hits = []; }
      for (const h of hits) findings.push({ rule: rule.id, severity: rule.severity, title: rule.title, heuristic: !!rule.heuristic, why: rule.why, fix: rule.fix, ...h });
    }
  }
  return { root, fileCount: files.length, findings };
}

function render({ root, fileCount, findings }) {
  const B = (t) => `\x1b[1m${t}\x1b[0m`, D = (t) => `\x1b[2m${t}\x1b[0m`;
  const COL = { P0: "\x1b[41;97m P0 \x1b[0m", P1: "\x1b[31mP1\x1b[0m", P2: "\x1b[33mP2\x1b[0m", P3: "\x1b[2mP3\x1b[0m" };
  const out = [`\n${B("Dashboard scan")}  ${fileCount} files under ${root}\n`];
  if (!findings.length) { out.push("  \x1b[32mNo anti-patterns detected.\x1b[0m\n"); return out.join("\n"); }
  const byRule = new Map();
  for (const f of findings) { if (!byRule.has(f.rule)) byRule.set(f.rule, []); byRule.get(f.rule).push(f); }
  const order = { P0: 0, P1: 1, P2: 2, P3: 3 };
  for (const [id, group] of [...byRule].sort((a, b) => order[a[1][0].severity] - order[b[1][0].severity])) {
    const g = group[0];
    out.push(`  ${COL[g.severity]} ${B(g.title)} ${D(`(${group.length})`)}${g.heuristic ? D("  heuristic, verify") : ""}`);
    out.push(`      ${D(g.why)}`);
    for (const f of group.slice(0, 6)) out.push(`      ${f.file}:${f.line}  ${D(f.evidence)}`);
    if (group.length > 6) out.push(D(`      +${group.length - 6} more`));
    out.push(`      ${D("fix: " + g.fix)}`);
    out.push("");
  }
  const c = (s) => findings.filter((f) => f.severity === s).length;
  out.push(`  ${B("Totals")}  P0 ${c("P0")}   P1 ${c("P1")}   P2 ${c("P2")}\n`);
  return out.join("\n");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const root = args.find((a) => !a.startsWith("--")) ?? ".";
  const only = args.includes("--rule") ? args[args.indexOf("--rule") + 1] : null;
  if (!existsSync(root)) { console.error(`no such directory: ${root}`); process.exit(2); }
  const res = run(root, only);
  if (args.includes("--json")) console.log(JSON.stringify(res, null, 2));
  else process.stdout.write(render(res));
}
