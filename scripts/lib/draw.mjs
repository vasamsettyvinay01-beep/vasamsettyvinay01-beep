export const C = {
  bg: "#070B14",
  surface: "#0B1323",
  surface2: "#101D30",
  cyan: "#00E5FF",
  blue: "#398BFF",
  violet: "#9470FF",
  text: "#EDF7FF",
  muted: "#93A9BF",
  line: "#2A4A68",
  lineSoft: "#17304A",
};

export const SANS = "Segoe UI, Helvetica Neue, Helvetica, Arial, sans-serif";
export const MONO = "Cascadia Mono, Cascadia Code, Consolas, Menlo, monospace";

export function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function doc({ w, h, title, desc, body, id = "g" }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img">
<title>${esc(title)}</title>
<desc>${esc(desc)}</desc>
<rect width="${w}" height="${h}" fill="${C.bg}"/>
<defs>
  <pattern id="${id}" width="32" height="32" patternUnits="userSpaceOnUse">
    <path d="M32 0 H0 V32" fill="none" stroke="${C.cyan}" stroke-opacity="0.075" stroke-width="1"/>
  </pattern>
</defs>
<rect width="${w}" height="${h}" fill="url(#${id})"/>
<rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="none" stroke="${C.line}" stroke-width="1"/>
${body}
</svg>
`;
}

export function t(x, y, value, options = {}) {
  const {
    size = 16,
    fill = C.text,
    weight = 400,
    anchor = "start",
    family = SANS,
    spacing = 0,
    opacity = 1,
  } = options;
  const spacingAttr = spacing ? ` letter-spacing="${spacing}"` : "";
  const opacityAttr = opacity === 1 ? "" : ` fill-opacity="${opacity}"`;
  return `<text x="${round(x)}" y="${round(y)}" fill="${fill}" font-family="${family}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}"${spacingAttr}${opacityAttr}>${esc(value)}</text>`;
}

export function round(n) {
  return Math.round(n * 100) / 100;
}

export function wrap(text, maxChars) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (current && next.length > maxChars) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function rect(x, y, w, h, options = {}) {
  const {
    fill = "none",
    stroke = "none",
    sw = 1,
    rx = 0,
    opacity = 1,
  } = options;
  const opacityAttr = opacity === 1 ? "" : ` opacity="${opacity}"`;
  return `<rect x="${round(x)}" y="${round(y)}" width="${round(w)}" height="${round(h)}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${opacityAttr}/>`;
}

export function line(x1, y1, x2, y2, options = {}) {
  const { stroke = C.cyan, sw = 1.25, opacity = 1, dash = "" } = options;
  const dashAttr = dash ? ` stroke-dasharray="${dash}"` : "";
  return `<line x1="${round(x1)}" y1="${round(y1)}" x2="${round(x2)}" y2="${round(y2)}" stroke="${stroke}" stroke-width="${sw}" stroke-opacity="${opacity}" stroke-linecap="square"${dashAttr}/>`;
}

export function circle(cx, cy, r, options = {}) {
  const { fill = "none", stroke = C.cyan, sw = 1.25, opacity = 1 } = options;
  return `<circle cx="${round(cx)}" cy="${round(cy)}" r="${round(r)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-opacity="${opacity}"/>`;
}

export function path(d, options = {}) {
  const { stroke = C.cyan, sw = 1.25, fill = "none", opacity = 1 } = options;
  return `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-opacity="${opacity}" stroke-linejoin="miter" stroke-linecap="square"/>`;
}

export function chip(x, y, label, options = {}) {
  const { size = 13, padX = 12, h = 30, fill = C.surface, stroke = C.line, color = C.text } = options;
  const width = Math.max(72, Math.round(label.length * size * 0.62) + padX * 2);
  const baseline = y + h / 2 + size * 0.34;
  return {
    width,
    height: h,
    svg: [
      rect(x, y, width, h, { fill, stroke, sw: 1, rx: 2 }),
      t(x + padX, baseline, label, { size, fill: color, family: MONO, weight: 500 }),
    ].join("\n"),
  };
}

export function rail(x, y, h) {
  return rect(x, y, 2, h, { fill: C.cyan });
}
