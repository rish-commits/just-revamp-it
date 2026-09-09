#!/usr/bin/env node
/**
 * vocabulary.mjs — measure design restraint.
 *
 *   node vocabulary.mjs <dir> [--json] [--verbose]
 *
 * The premise: dashboards people like are rarely the ones with the best colours.
 * They are the ones that made FEW decisions and repeated them. A dashboard using
 * five type sizes reads as designed; the same dashboard with fourteen reads as
 * accreted, even when every individual choice was defensible.
 *
 * Nobody measures this, so it never gets fixed. This counts the distinct values
 * actually in use per dimension and, more usefully, names the one-off outliers,
 * which are almost always accidents rather than decisions.
 *
 * Works on Tailwind utility classes, plain CSS, and inline style objects, so it
 * runs against a sister brand's stack without assuming ours.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname, relative } from "node:path";

const SKIP_DIR = new Set(["node_modules", ".git", ".next", "dist", "build", "out", "coverage", ".vercel", "vendor", "__pycache__"]);
const EXT = new Set([".tsx", ".jsx", ".ts", ".js", ".css", ".scss", ".vue", ".svelte", ".html", ".astro"]);

// Tailwind's default scales, so a utility class and a raw px value can be counted
// as the same decision rather than as two different ones.
const TW_TEXT = { "text-xs": "12px", "text-sm": "14px", "text-base": "16px", "text-lg": "18px", "text-xl": "20px",
  "text-2xl": "24px", "text-3xl": "30px", "text-4xl": "36px", "text-5xl": "48px", "text-6xl": "60px",
  "text-7xl": "72px", "text-8xl": "96px", "text-9xl": "128px" };
const TW_RADIUS = { "rounded-none": "0px", "rounded-sm": "2px", rounded: "4px", "rounded-md": "6px", "rounded-lg": "8px",
  "rounded-xl": "12px", "rounded-2xl": "16px", "rounded-3xl": "24px", "rounded-full": "9999px" };
const step = (n) => `${(parseFloat(n) * 4)}px`; // tailwind spacing unit = 0.25rem

function walk(dir, files = []) {
  let entries;
  try { entries = readdirSync(dir); } catch { return files; }
  for (const e of entries) {
    if (SKIP_DIR.has(e) || e.startsWith(".") && e !== ".") continue;
    const p = join(dir, e);
    let st; try { st = statSync(p); } catch { continue; }
    if (st.isDirectory()) walk(p, files);
    else if (EXT.has(extname(p))) files.push(p);
  }
  return files;
}

const DIMENSIONS = {
  fontSize:  { label: "type sizes",   good: 6,  ok: 9,  weight: 3 },
  radius:    { label: "corner radii", good: 4,  ok: 6,  weight: 2 },
  spacing:   { label: "spacing steps", good: 8, ok: 12, weight: 2 },
  color:     { label: "colours",      good: 14, ok: 24, weight: 3 },
  fontWeight:{ label: "font weights", good: 3,  ok: 4,  weight: 1 },
  shadow:    { label: "shadows",      good: 3,  ok: 5,  weight: 1 },
};

export function scan(root) {
  const files = walk(root);
  const hits = {};
  for (const k of Object.keys(DIMENSIONS)) hits[k] = new Map();

  const add = (dim, value, file) => {
    if (!value) return;
    const m = hits[dim];
    if (!m.has(value)) m.set(value, { count: 0, files: new Set() });
    const rec = m.get(value);
    rec.count++;
    rec.files.add(relative(root, file) || file);
  };

  for (const file of files) {
    let src; try { src = readFileSync(file, "utf8"); } catch { continue; }

    // --- Tailwind utilities -------------------------------------------------
    for (const [cls, px] of Object.entries(TW_TEXT))
      for (const _ of src.matchAll(new RegExp(`(?<![\\w-])${cls}(?![\\w-])`, "g"))) add("fontSize", px, file);
    for (const m of src.matchAll(/(?<![\w-])text-\[([0-9.]+)(px|rem)\]/g))
      add("fontSize", m[2] === "rem" ? `${parseFloat(m[1]) * 16}px` : `${m[1]}px`, file);

    for (const [cls, px] of Object.entries(TW_RADIUS))
      for (const _ of src.matchAll(new RegExp(`(?<![\\w-])${cls}(?![\\w-])`, "g"))) add("radius", px, file);
    for (const m of src.matchAll(/(?<![\w-])rounded-\[([0-9.]+)px\]/g)) add("radius", `${m[1]}px`, file);

    for (const m of src.matchAll(/(?<![\w-])(?:gap|space-[xy]|p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr)-([0-9.]+)(?![\w-])/g))
      add("spacing", step(m[1]), file);

    for (const m of src.matchAll(/(?<![\w-])font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)(?![\w-])/g))
      add("fontWeight", m[1], file);
    for (const m of src.matchAll(/(?<![\w-])shadow(-(?:sm|md|lg|xl|2xl|inner|none))?(?![\w-[])/g))
      add("shadow", `shadow${m[1] ?? ""}`, file);

    // --- raw CSS and inline style objects -----------------------------------
    for (const m of src.matchAll(/font-?[sS]ize\s*[:=]\s*["']?([0-9.]+)(px|rem|em)/g))
      add("fontSize", m[2] === "px" ? `${m[1]}px` : `${parseFloat(m[1]) * 16}px`, file);
    for (const m of src.matchAll(/border-?[rR]adius\s*[:=]\s*["']?([0-9.]+)(px|rem)/g))
      add("radius", m[2] === "px" ? `${m[1]}px` : `${parseFloat(m[1]) * 16}px`, file);
    for (const m of src.matchAll(/font-?[wW]eight\s*[:=]\s*["']?([0-9]{3}|bold|normal)/g)) add("fontWeight", m[1], file);
    for (const m of src.matchAll(/box-?[sS]hadow\s*[:=]\s*["']([^"']{3,60})/g)) add("shadow", m[1].trim(), file);

    // --- colours ------------------------------------------------------------
    // A palette token is the decision, so count `violet-600` once whether it
    // arrives as a text, bg, border or ring utility, and whatever opacity it
    // carries. Counting raw hex alone misses almost everything in a Tailwind app.
    for (const m of src.matchAll(/(?<![\w-])(?:text|bg|border|ring|fill|stroke|from|via|to|decoration|outline|divide|accent|shadow)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(\d{2,3})(?![\w-])/g))
      add("color", `${m[1]}-${m[2]}`, file);
    for (const m of src.matchAll(/(?<![\w-])(?:text|bg|border|ring|fill|stroke|divide)-(white|black)(?![\w-])/g))
      add("color", m[1], file);
    for (const m of src.matchAll(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})(?![0-9a-fA-F])/g)) {
      let h = m[1].toLowerCase();
      if (h.length === 3) h = h.replace(/(.)/g, "$1$1");
      add("color", `#${h}`, file);
    }
    for (const m of src.matchAll(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/g))
      add("color", `#${[m[1], m[2], m[3]].map((v) => (+v).toString(16).padStart(2, "0")).join("")}`, file);
  }
  return { root, fileCount: files.length, hits };
}

/**
 * Grade the CORE vocabulary, not the raw count.
 *
 * Ten type sizes where two carry 82% of uses is a disciplined system with a tail.
 * Ten type sizes used evenly is chaos. The raw distinct count cannot tell those
 * apart, and scoring them the same would make this tool wrong about exactly the
 * dashboards worth learning from. So: the core is the smallest set of values
 * covering 90% of uses, and that is what gets graded. The tail is reported
 * separately, because folding it in is the actual cleanup work.
 */
const CORE_COVERAGE = 0.9;

export function grade({ hits }) {
  const rows = [];
  let earned = 0, possible = 0;
  for (const [dim, spec] of Object.entries(DIMENSIONS)) {
    const m = hits[dim];
    const distinct = m.size;
    if (distinct === 0) continue;

    const sorted = [...m.entries()].sort((a, b) => b[1].count - a[1].count);
    const total = sorted.reduce((n, [, v]) => n + v.count, 0);
    let acc = 0, core = 0;
    for (const [, v] of sorted) { core++; acc += v.count; if (acc / total >= CORE_COVERAGE) break; }
    const tail = sorted.slice(core).map(([k, v]) => ({ value: k, count: v.count }));

    const band = core <= spec.good ? "good" : core <= spec.ok ? "ok" : "sprawl";
    const score = band === "good" ? 1 : band === "ok" ? 0.6 : 0.2;
    earned += score * spec.weight; possible += spec.weight;
    rows.push({ dim, label: spec.label, distinct, core, budget: spec.good, band, tail,
      coverage: Math.round((acc / total) * 100), uses: total,
      top: sorted.slice(0, 8).map(([k, v]) => ({ value: k, count: v.count })) });
  }
  return { rows, score: possible ? Math.round((earned / possible) * 100) : 0 };
}

function render(res, { verbose }) {
  const g = grade(res);
  const B = (t) => `\x1b[1m${t}\x1b[0m`, D = (t) => `\x1b[2m${t}\x1b[0m`;
  const TAG = { good: "\x1b[32mgood\x1b[0m  ", ok: "\x1b[33mok\x1b[0m    ", sprawl: "\x1b[31msprawl\x1b[0m" };
  const out = [`\n${B("Design vocabulary")}  ${res.fileCount} files under ${res.root}\n`];
  for (const r of g.rows) {
    out.push(`  ${TAG[r.band]}  core ${String(r.core).padStart(2)} ${D(`of ${String(r.distinct).padStart(2)}`)}  ${r.label.padEnd(14)} ${D(`budget ${r.budget}`)}`);
    out.push(`         ${D(r.top.map((t) => `${t.value}\u00d7${t.count}`).join("  "))}`);
    if (r.tail.length)
      out.push(`         ${D(`tail (${r.tail.length}, ${100 - r.coverage}% of uses):`)} ${r.tail.slice(0, 12).map((t) => t.value).join(" ")}${r.tail.length > 12 ? ` +${r.tail.length - 12}` : ""}`);
    if (verbose) for (const [v, rec] of res.hits[r.dim].entries())
      out.push(`           ${D(`${v}  x${rec.count}  ${[...rec.files].slice(0, 3).join(", ")}`)}`);
    out.push("");
  }
  const band = g.score >= 85 ? "\x1b[32mdisciplined\x1b[0m" : g.score >= 65 ? "\x1b[33mloosening\x1b[0m" : "\x1b[31maccreted\x1b[0m";
  out.push(`  ${B("Restraint score")} ${g.score}/100  ${band}`);
  out.push(D("  Core = smallest set covering 90% of uses; that is what is graded."));
  out.push(D("  The tail is the cleanup list: fold each value into its nearest core neighbour.\n"));
  return out.join("\n");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const root = args.find((a) => !a.startsWith("--")) ?? ".";
  const res = scan(root);
  if (args.includes("--json")) {
    const g = grade(res);
    console.log(JSON.stringify({ root: res.root, fileCount: res.fileCount, score: g.score, rows: g.rows }, null, 2));
  } else process.stdout.write(render(res, { verbose: args.includes("--verbose") }));
}
