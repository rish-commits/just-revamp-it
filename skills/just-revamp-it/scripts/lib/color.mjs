/**
 * Colour maths for just-revamp-it.
 *
 * Everything a brand needs is derived from one accent hex, so the derivation
 * has to hold up for any hue a sister brand brings. That rules out HSL: equal
 * lightness steps in HSL look even for violet and fall apart for yellow and
 * cyan. OKLCH is perceptually uniform, so one ladder works for every brand.
 *
 * No dependencies on purpose. This runs from a skill script with plain node.
 */

// ---------------------------------------------------------------------------
// sRGB <-> linear
// ---------------------------------------------------------------------------

const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const toGamma = (c) => (c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);

// ---------------------------------------------------------------------------
// hex <-> rgb (0..255)
// ---------------------------------------------------------------------------

export function parseHex(hex) {
  const h = String(hex).trim().replace(/^#/, "");
  const full = h.length === 3 ? h.replace(/(.)/g, "$1$1") : h;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) throw new Error(`not a hex colour: ${hex}`);
  const n = parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function toHex({ r, g, b }) {
  const cl = (v) => Math.max(0, Math.min(255, Math.round(v)));
  return "#" + [cl(r), cl(g), cl(b)].map((v) => v.toString(16).padStart(2, "0")).join("");
}

// ---------------------------------------------------------------------------
// OKLab / OKLCH  (Björn Ottosson's transform)
// ---------------------------------------------------------------------------

export function rgbToOklab({ r, g, b }) {
  const lr = toLinear(r / 255), lg = toLinear(g / 255), lb = toLinear(b / 255);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return {
    L: 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s,
  };
}

export function oklabToRgb({ L, a, b }) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3;
  return {
    r: 255 * toGamma(+4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    g: 255 * toGamma(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    b: 255 * toGamma(-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s),
  };
}

export const oklabToOklch = ({ L, a, b }) => ({
  L,
  C: Math.sqrt(a * a + b * b),
  h: ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360,
});

export const oklchToOklab = ({ L, C, h }) => ({
  L,
  a: C * Math.cos((h * Math.PI) / 180),
  b: C * Math.sin((h * Math.PI) / 180),
});

export const hexToOklch = (hex) => oklabToOklch(rgbToOklab(parseHex(hex)));

const inGamut = ({ r, g, b }) =>
  r >= -0.5 && r <= 255.5 && g >= -0.5 && g <= 255.5 && b >= -0.5 && b <= 255.5;

/**
 * OKLCH -> hex, reducing chroma until the colour fits in sRGB. Clipping RGB
 * directly shifts hue (a too-saturated blue clips toward purple); walking
 * chroma down keeps the hue the brand actually chose.
 */
export function oklchToHex({ L, C, h }) {
  let lo = 0, hi = C;
  if (inGamut(oklabToRgb(oklchToOklab({ L, C, h })))) return toHex(oklabToRgb(oklchToOklab({ L, C, h })));
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut(oklabToRgb(oklchToOklab({ L, C: mid, h })))) lo = mid;
    else hi = mid;
  }
  return toHex(oklabToRgb(oklchToOklab({ L, C: lo, h })));
}

// ---------------------------------------------------------------------------
// WCAG contrast
// ---------------------------------------------------------------------------

export function luminance(hex) {
  const { r, g, b } = parseHex(hex);
  return 0.2126 * toLinear(r / 255) + 0.7152 * toLinear(g / 255) + 0.0722 * toLinear(b / 255);
}

export function contrast(a, b) {
  const la = luminance(a), lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Ink that clears the best contrast on a solid fill. Chosen per fill, never globally. */
export function inkOn(hex, dark = "#171717", light = "#ffffff") {
  return contrast(hex, dark) >= contrast(hex, light) ? dark : light;
}

/** Flatten a translucent fill onto an opaque ground so it can be contrast-tested. */
export function composite(hex, alpha, ground = "#ffffff") {
  const f = parseHex(hex), g = parseHex(ground);
  return toHex({
    r: f.r * alpha + g.r * (1 - alpha),
    g: f.g * alpha + g.g * (1 - alpha),
    b: f.b * alpha + g.b * (1 - alpha),
  });
}

// ---------------------------------------------------------------------------
// Colour-vision deficiency simulation (Machado et al. 2009, severity 1.0)
// ---------------------------------------------------------------------------

const CVD = {
  protanopia:   [0.152286, 1.052583, -0.204868, 0.114503, 0.786281, 0.099216, -0.003882, -0.048116, 1.051998],
  deuteranopia: [0.367322, 0.860646, -0.227968, 0.280085, 0.672501, 0.047413, -0.011820, 0.042940, 0.968881],
  tritanopia:   [1.255528, -0.076749, -0.178779, -0.078411, 0.930809, 0.147602, 0.004733, 0.691367, 0.303900],
};

export function simulate(hex, kind) {
  const m = CVD[kind];
  if (!m) throw new Error(`unknown CVD type: ${kind}`);
  const { r, g, b } = parseHex(hex);
  const lr = toLinear(r / 255), lg = toLinear(g / 255), lb = toLinear(b / 255);
  return toHex({
    r: 255 * toGamma(Math.max(0, Math.min(1, m[0] * lr + m[1] * lg + m[2] * lb))),
    g: 255 * toGamma(Math.max(0, Math.min(1, m[3] * lr + m[4] * lg + m[5] * lb))),
    b: 255 * toGamma(Math.max(0, Math.min(1, m[6] * lr + m[7] * lg + m[8] * lb))),
  });
}

/** Perceptual distance in OKLab. ~0.02 is a just-noticeable step; 0.05+ reads as different. */
export function deltaE(a, b) {
  const x = rgbToOklab(parseHex(a)), y = rgbToOklab(parseHex(b));
  return Math.sqrt((x.L - y.L) ** 2 + (x.a - y.a) ** 2 + (x.b - y.b) ** 2);
}
