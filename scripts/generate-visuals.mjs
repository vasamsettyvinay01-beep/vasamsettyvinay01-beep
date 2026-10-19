import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  C,
  MONO,
  SANS,
  chip,
  circle,
  doc,
  line,
  path,
  rect,
  round,
  t,
  wrap,
} from "./lib/draw.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function write(rel, svg) {
  const target = join(root, rel);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, svg, "utf8");
  console.log(`${rel}  ${svg.length} bytes`);
}

function network(cx, cy, scale = 1) {
  const nodes = [
    { label: "ORCH", x: 0, y: 8, r: 28 },
    { label: "RAG", x: -138, y: -78, r: 16 },
    { label: "AGENTS", x: 146, y: -64, r: 16 },
    { label: "TOOLS", x: 132, y: 112, r: 16 },
    { label: "EVAL", x: -124, y: 118, r: 16 },
    { label: "API", x: 8, y: -138, r: 13 },
  ];
  const parts = [];
  const center = nodes[0];
  for (const node of nodes.slice(1)) {
    const ang = Math.atan2(node.y - center.y, node.x - center.x);
    const x1 = cx + (center.x + Math.cos(ang) * (center.r + 4)) * scale;
    const y1 = cy + (center.y + Math.sin(ang) * (center.r + 4)) * scale;
    const x2 = cx + (node.x - Math.cos(ang) * (node.r + 4)) * scale;
    const y2 = cy + (node.y - Math.sin(ang) * (node.r + 4)) * scale;
    parts.push(line(x1, y1, x2, y2, { stroke: C.blue, sw: 1.25, opacity: 0.9 }));
  }
  parts.push(
    path(
      `M ${round(cx - 210 * scale)} ${round(cy + 20 * scale)} H ${round(cx - 168 * scale)} V ${round(cy - 36 * scale)} H ${round(cx - 142 * scale)}`,
      { stroke: C.cyan, sw: 1, opacity: 0.35 },
    ),
  );
  parts.push(
    path(
      `M ${round(cx + 214 * scale)} ${round(cy + 36 * scale)} H ${round(cx + 176 * scale)} V ${round(cy + 78 * scale)} H ${round(cx + 148 * scale)}`,
      { stroke: C.violet, sw: 1, opacity: 0.45 },
    ),
  );
  for (const node of nodes) {
    const x = cx + node.x * scale;
    const y = cy + node.y * scale;
    const r = node.r * scale;
    const core = node.label === "ORCH";
    parts.push(circle(x, y, r, { fill: core ? "#10243A" : C.surface, stroke: core ? C.cyan : C.line, sw: core ? 1.75 : 1.25 }));
    parts.push(circle(x, y, Math.max(2.5, r * 0.16), { fill: core ? C.cyan : C.blue, stroke: "none" }));
    parts.push(
      t(x, y + r + 16 * scale, node.label, {
        size: Math.max(11, 12 * scale),
        fill: core ? C.cyan : C.muted,
        family: MONO,
        anchor: "middle",
        weight: 500,
      }),
    );
  }
  return parts.join("\n");
}

function heroDesktop() {
  const w = 1200;
  const h = 520;
  const chips = ["SYSTEM ONLINE", "AGENTIC INTELLIGENCE", "BUILD MODE: ACTIVE"];
  let x = 56;
  const chipSvg = chips
    .map((label, index) => {
      const drawn = chip(x, 92, label, {
        size: 13,
        h: 32,
        color: index === 0 ? C.cyan : C.text,
        stroke: index === 0 ? "#145E6B" : C.line,
      });
      x += drawn.width + 10;
      return drawn.svg;
    })
    .join("\n");
  const body = [
    t(56, 68, "VINAY  //  AI SYSTEMS COMMAND CENTER", { size: 13, fill: C.muted, family: MONO, spacing: 1.4 }),
    t(1088, 68, "HOUSTON", { size: 13, fill: C.muted, family: MONO, anchor: "end" }),
    chipSvg,
    t(56, 214, "VINAY VASAMSETTY", { size: 64, weight: 700, fill: C.text }),
    t(56, 258, "FOUNDER  //  AI SYSTEMS ENGINEER", { size: 18, fill: C.cyan, family: MONO, spacing: 1.2 }),
    t(56, 306, "Engineering Intelligence Into Reality.", { size: 26, fill: C.text, weight: 400 }),
    line(56, 348, 430, 348, { stroke: C.line, sw: 1 }),
    t(56, 382, "01  TERMINAL", { size: 13, fill: C.muted, family: MONO }),
    t(210, 382, "02  SYSTEMS", { size: 13, fill: C.muted, family: MONO }),
    t(360, 382, "03  TELEMETRY", { size: 13, fill: C.muted, family: MONO }),
    rect(742, 78, 402, 380, { fill: C.surface, stroke: C.line, sw: 1, rx: 6 }),
    rect(742, 78, 402, 36, { fill: C.surface2, stroke: "none" }),
    t(760, 101, "NODE FIELD  /  REFERENCE", { size: 12, fill: C.muted, family: MONO }),
    network(944, 286, 0.92),
  ].join("\n");
  return doc({
    w,
    h,
    id: "hero",
    title: "Vinay Vasamsetty, Founder and AI Systems Engineer",
    desc: "Engineering Intelligence Into Reality. System online. Agentic intelligence. Build mode active.",
    body,
  });
}

function heroMobile() {
  const w = 720;
  const h = 920;
  const labels = ["SYSTEM ONLINE", "AGENTIC INTELLIGENCE", "BUILD MODE: ACTIVE"];
  let x = 36;
  let yChip = 118;
  const chipParts = [];
  for (const [index, label] of labels.entries()) {
    const probe = chip(x, yChip, label, { size: 15, h: 38 });
    if (x > 36 && x + probe.width > w - 36) {
      x = 36;
      yChip += 46;
    }
    const drawn = chip(x, yChip, label, {
      size: 15,
      h: 38,
      color: index === 0 ? C.cyan : C.text,
      stroke: index === 0 ? "#145E6B" : C.line,
    });
    chipParts.push(drawn.svg);
    x += drawn.width + 8;
  }
  const body = [
    t(36, 64, "VINAY  //  AI SYSTEMS COMMAND CENTER", { size: 15, fill: C.muted, family: MONO }),
    chipParts.join("\n"),
    t(36, 292, "VINAY", { size: 68, weight: 700 }),
    t(36, 366, "VASAMSETTY", { size: 68, weight: 700 }),
    t(36, 422, "FOUNDER  //  AI SYSTEMS ENGINEER", { size: 20, fill: C.cyan, family: MONO }),
    t(36, 470, "Engineering Intelligence", { size: 28, fill: C.text }),
    t(36, 508, "Into Reality.", { size: 28, fill: C.text }),
    rect(36, 560, 648, 320, { fill: C.surface, stroke: C.line, sw: 1, rx: 6 }),
    t(54, 592, "NODE FIELD  /  REFERENCE", { size: 14, fill: C.muted, family: MONO }),
    network(360, 730, 0.86),
  ].join("\n");
  return doc({
    w,
    h,
    id: "hero-m",
    title: "Vinay Vasamsetty, Founder and AI Systems Engineer",
    desc: "Engineering Intelligence Into Reality. System online. Agentic intelligence. Build mode active.",
    body,
  });
}

function terminalFrame(mode) {
  const mobile = mode === "mobile";
  const w = mobile ? 720 : 1040;
  const lines = mobile
    ? [
        ["prompt", "whoami"],
        ["out", "Vinay Vasamsetty"],
        ["out", "Founder & AI Systems Engineer"],
        ["gap"],
        ["prompt", "focus"],
        ["item", "Agentic AI Systems"],
        ["item", "Retrieval-Augmented Generation"],
        ["item", "AI Infrastructure"],
        ["item", "Intelligent Automation"],
        ["item", "Full-Stack Engineering"],
        ["gap"],
        ["prompt", "mission"],
        ["out", "Engineering intelligent systems"],
        ["out", "that transform complex problems"],
        ["out", "into practical software."],
        ["gap"],
        ["prompt", "status"],
        ["status", "SYSTEMS ONLINE"],
        ["ready", "READY TO BUILD"],
      ]
    : [
        ["prompt", "whoami"],
        ["out", "Vinay Vasamsetty"],
        ["out", "Founder & AI Systems Engineer"],
        ["gap"],
        ["prompt", "focus"],
        ["item", "Agentic AI Systems"],
        ["item", "Retrieval-Augmented Generation"],
        ["item", "AI Infrastructure"],
        ["item", "Intelligent Automation"],
        ["item", "Full-Stack Engineering"],
        ["gap"],
        ["prompt", "mission"],
        ["out", "Engineering intelligent systems that transform"],
        ["out", "complex problems into practical software."],
        ["gap"],
        ["prompt", "status"],
        ["status", "SYSTEMS ONLINE"],
        ["ready", "READY TO BUILD"],
      ];
  const header = 52;
  const size = mobile ? 22 : 18;
  const lh = mobile ? 34 : 28;
  const h = header + 28 + lines.length * lh + 28;
  const parts = [
    rect(0, 0, w, header, { fill: C.surface }),
    line(0, header, w, header, { stroke: C.line, sw: 1 }),
    circle(28, 26, 5, { fill: C.muted, stroke: "none" }),
    circle(46, 26, 5, { fill: C.cyan, stroke: "none" }),
    circle(64, 26, 5, { fill: C.blue, stroke: "none" }),
    t(w / 2, 32, "ai-lab   ·   session 01", { size: mobile ? 16 : 14, fill: C.muted, family: MONO, anchor: "middle" }),
    t(w - 24, 32, "SYS.OK", { size: mobile ? 15 : 13, fill: C.cyan, family: MONO, anchor: "end" }),
  ];
  let y = header + 36;
  for (const [kind, text] of lines) {
    if (kind === "gap") {
      y += lh * 0.45;
      continue;
    }
    if (kind === "prompt") {
      const prompt = "vinay@ai-lab:~$ ";
      parts.push(t(28, y, prompt, { size, fill: C.cyan, family: MONO }));
      const offset = prompt.length * size * 0.6;
      parts.push(t(28 + offset, y, text, { size, fill: C.text, family: MONO }));
    } else if (kind === "item") {
      parts.push(t(28, y, ">", { size, fill: C.violet, family: MONO }));
      parts.push(t(28 + size, y, text, { size, fill: C.muted, family: MONO }));
    } else if (kind === "status") {
      parts.push(t(28, y, text, { size, fill: C.cyan, family: MONO, weight: 700 }));
    } else if (kind === "ready") {
      parts.push(t(28, y, text, { size, fill: C.text, family: MONO, weight: 700 }));
      const offset = text.length * size * 0.6 + 8;
      parts.push(rect(28 + offset, y - size + 4, Math.max(10, size * 0.55), size - 2, { fill: C.cyan }));
    } else {
      parts.push(t(28, y, text, { size, fill: C.muted, family: MONO }));
    }
    y += lh;
  }
  return doc({
    w,
    h,
    id: mobile ? "term-m" : "term",
    title: "AI lab terminal",
    desc: "Terminal transcript for Vinay Vasamsetty, Founder and AI Systems Engineer. Focus areas include agentic AI systems, retrieval-augmented generation, AI infrastructure, intelligent automation, and full-stack engineering.",
    body: parts.join("\n"),
  });
}

const projects = [
  {
    file: "myportfolio",
    index: "01",
    kicker: "IMMERSIVE INTERFACE",
    title: "AI-Native Portfolio",
    summary: "A Next.js experience built as an operational interface, with a 3D system core and architecture views.",
    stack: ["Next.js", "React", "TypeScript", "Three.js", "Tailwind"],
    highlight: "3D system core and exploded architecture in one App Router app.",
    meta: "vasamsettyvinay01-beep/myportfolio",
    diagram: "core",
  },
  {
    file: "onemorewebsite",
    index: "02",
    kicker: "BRAND  +  TICKETING",
    title: "The One More Company",
    summary: "A cinematic brand and event site with campaign sections, checkout, and QR ticket check-in.",
    stack: ["Next.js", "TypeScript", "Supabase", "PostgreSQL", "Stripe"],
    highlight: "Server-priced checkout and one-time QR check-in. Public site is live.",
    meta: "theonemorecompany.com",
    diagram: "ticket",
  },
];

function diagram(kind, x, y, w, h) {
  const parts = [rect(x, y, w, h, { fill: "#08101C", stroke: C.lineSoft, sw: 1, rx: 4 })];
  if (kind === "core") {
    const cx = x + w / 2;
    const cy = y + h / 2 + 6;
    parts.push(circle(cx, cy, Math.min(w, h) * 0.28, { fill: "none", stroke: C.line, sw: 1 }));
    parts.push(circle(cx, cy, Math.min(w, h) * 0.16, { fill: "#10243A", stroke: C.cyan, sw: 1.5 }));
    parts.push(circle(cx, cy, 4, { fill: C.cyan, stroke: "none" }));
    for (const [dx, dy] of [[-0.28, -0.22], [0.3, -0.12], [0.02, 0.3]]) {
      parts.push(circle(cx + dx * w, cy + dy * h, 5, { fill: C.blue, stroke: "none" }));
      parts.push(line(cx, cy, cx + dx * w, cy + dy * h, { stroke: C.blue, sw: 1, opacity: 0.8 }));
    }
    parts.push(t(x + 16, y + 24, "R3F CORE", { size: 12, fill: C.muted, family: MONO }));
  } else if (kind === "realtime") {
    const boxes = [
      [x + 24, y + h * 0.22, "WEB"],
      [x + w / 2 - 46, y + h * 0.48, "SOCKET"],
      [x + w - 116, y + h * 0.22, "ROOM"],
    ];
    parts.push(line(x + 70, y + h * 0.36, x + w / 2, y + h * 0.55, { stroke: C.cyan, sw: 1.25 }));
    parts.push(line(x + w / 2, y + h * 0.55, x + w - 70, y + h * 0.36, { stroke: C.violet, sw: 1.25 }));
    for (const [bx, by, label] of boxes) {
      parts.push(rect(bx, by, 92, 36, { fill: C.surface2, stroke: C.line, sw: 1, rx: 3 }));
      parts.push(t(bx + 46, by + 23, label, { size: 13, fill: C.text, family: MONO, anchor: "middle" }));
    }
    parts.push(t(x + 16, y + 24, "IN-MEMORY ROOMS", { size: 12, fill: C.muted, family: MONO }));
  } else {
    const tx = x + w * 0.18;
    const ty = y + h * 0.28;
    const tw = w * 0.64;
    const th = h * 0.46;
    parts.push(rect(tx, ty, tw, th, { fill: C.surface2, stroke: C.cyan, sw: 1.25, rx: 8 }));
    parts.push(line(tx + 18, ty + th * 0.42, tx + tw - 18, ty + th * 0.42, { stroke: C.line, sw: 1 }));
    parts.push(t(tx + tw / 2, ty + 28, "ONE MORE", { size: 16, fill: C.text, family: MONO, anchor: "middle", spacing: 1.5 }));
    parts.push(t(tx + tw / 2, ty + th * 0.42 + 26, "ADMIT ONE", { size: 12, fill: C.cyan, family: MONO, anchor: "middle" }));
    parts.push(t(x + 16, y + 24, "PUBLIC SITE", { size: 12, fill: C.muted, family: MONO }));
  }
  return parts.join("\n");
}

function projectCard(project, mode) {
  const mobile = mode === "mobile";
  const w = mobile ? 720 : 1160;
  const h = mobile ? 640 : 430;
  const pad = mobile ? 32 : 36;
  const titleSize = mobile ? 40 : 36;
  const bodySize = mobile ? 22 : 18;
  const maxChars = mobile ? 34 : 46;
  const summary = wrap(project.summary, maxChars);
  const highlight = wrap(project.highlight, maxChars);
  const parts = [];
  parts.push(rect(0, pad, 3, 84, { fill: C.cyan }));
  parts.push(t(pad, 58, `${project.index}   /   ${project.kicker}`, { size: mobile ? 15 : 13, fill: C.cyan, family: MONO }));
  parts.push(t(pad, mobile ? 118 : 112, project.title, { size: titleSize, weight: 700 }));
  let y = mobile ? 162 : 150;
  for (const row of summary) {
    parts.push(t(pad, y, row, { size: bodySize, fill: C.muted }));
    y += mobile ? 32 : 28;
  }
  y += 8;
  let x = pad;
  const maxX = mobile ? w - pad : 700;
  for (const item of project.stack) {
    const drawn = chip(x, y, item, { size: mobile ? 14 : 13, h: mobile ? 32 : 28 });
    if (x > pad && x + drawn.width > maxX) {
      x = pad;
      y += (mobile ? 40 : 36);
      const wrapped = chip(x, y, item, { size: mobile ? 14 : 13, h: mobile ? 32 : 28 });
      parts.push(wrapped.svg);
      x += wrapped.width + 8;
    } else {
      parts.push(drawn.svg);
      x += drawn.width + 8;
    }
  }
  y += mobile ? 56 : 52;
  parts.push(t(pad, y, "HIGHLIGHT", { size: 12, fill: C.violet, family: MONO }));
  y += mobile ? 28 : 24;
  for (const row of highlight) {
    parts.push(t(pad, y, row, { size: mobile ? 18 : 16, fill: C.text }));
    y += mobile ? 26 : 22;
  }
  parts.push(t(pad, h - 28, project.meta, { size: mobile ? 15 : 14, fill: C.muted, family: MONO }));
  if (mobile) {
    parts.push(diagram(project.diagram, pad, 430, w - pad * 2, 150));
  } else {
    parts.push(diagram(project.diagram, 760, 36, 364, 358));
  }
  return doc({
    w,
    h,
    id: `${project.file}-${mode}`,
    title: project.title,
    desc: `${project.summary} ${project.highlight}`,
    body: parts.join("\n"),
  });
}

function architecture(mode) {
  const mobile = mode === "mobile";
  const w = mobile ? 720 : 1160;
  const nodes = [
    ["01", "User / Application", "People and product surfaces"],
    ["02", "API / Interface Layer", "Requests, sessions, contracts"],
    ["03", "AI Orchestrator", "Plans the work and routes it"],
    ["04", "Retrieval / RAG", "Search and grounded context"],
    ["05", "Specialized AI Agents", "Focused reasoning steps"],
    ["06", "Tools / External Systems", "Actions outside the model"],
    ["07", "Validation + Evaluation", "Checks before anything ships"],
    ["08", "Grounded Output / Actions", "Answers and side effects"],
  ];
  const parts = [];
  parts.push(t(mobile ? 32 : 48, 58, "HOW I THINK ABOUT INTELLIGENT SYSTEMS", { size: mobile ? 26 : 28, weight: 700 }));
  const subtitle = wrap("An illustrative reference model. Not a diagram of a specific private system.", mobile ? 42 : 80);
  let y = 92;
  for (const row of subtitle) {
    parts.push(t(mobile ? 32 : 48, y, row, { size: mobile ? 16 : 16, fill: C.muted }));
    y += 24;
  }
  if (!mobile) {
    const boxes = [
      { i: 0, x: 430, y: 150, w: 300 },
      { i: 1, x: 330, y: 246, w: 500 },
      { i: 2, x: 390, y: 342, w: 380, accent: C.cyan },
      { i: 3, x: 48, y: 470, w: 330 },
      { i: 4, x: 415, y: 470, w: 330 },
      { i: 5, x: 782, y: 470, w: 330 },
      { i: 6, x: 330, y: 600, w: 500 },
      { i: 7, x: 390, y: 696, w: 380, accent: C.blue },
    ];
    const center = (b) => b.x + b.w / 2;
    parts.push(line(center(boxes[0]), 214, center(boxes[1]), 246, { stroke: C.blue, sw: 1.25 }));
    parts.push(line(center(boxes[1]), 310, center(boxes[2]), 342, { stroke: C.blue, sw: 1.25 }));
    parts.push(line(center(boxes[2]), 406, center(boxes[2]), 438, { stroke: C.blue, sw: 1.25 }));
    parts.push(line(center(boxes[3]), 438, center(boxes[5]), 438, { stroke: C.blue, sw: 1.25 }));
    parts.push(line(center(boxes[3]), 438, center(boxes[3]), 470, { stroke: C.blue, sw: 1.25 }));
    parts.push(line(center(boxes[4]), 438, center(boxes[4]), 470, { stroke: C.blue, sw: 1.25 }));
    parts.push(line(center(boxes[5]), 438, center(boxes[5]), 470, { stroke: C.blue, sw: 1.25 }));
    parts.push(line(center(boxes[3]), 534, center(boxes[3]), 566, { stroke: C.blue, sw: 1.25 }));
    parts.push(line(center(boxes[4]), 534, center(boxes[4]), 566, { stroke: C.blue, sw: 1.25 }));
    parts.push(line(center(boxes[5]), 534, center(boxes[5]), 566, { stroke: C.blue, sw: 1.25 }));
    parts.push(line(center(boxes[3]), 566, center(boxes[5]), 566, { stroke: C.blue, sw: 1.25 }));
    parts.push(line(center(boxes[6]), 566, center(boxes[6]), 600, { stroke: C.blue, sw: 1.25 }));
    parts.push(line(center(boxes[6]), 664, center(boxes[7]), 696, { stroke: C.blue, sw: 1.25 }));
    for (const b of boxes) {
      const [num, title, sub] = nodes[b.i];
      const accent = b.accent || C.line;
      parts.push(rect(b.x, b.y, b.w, 64, { fill: C.surface, stroke: accent, sw: b.accent ? 1.5 : 1, rx: 4 }));
      parts.push(t(b.x + 16, b.y + 26, num, { size: 12, fill: C.cyan, family: MONO }));
      parts.push(t(b.x + 48, b.y + 27, title, { size: 16, weight: 700 }));
      parts.push(t(b.x + 16, b.y + 48, sub, { size: 13, fill: C.muted }));
    }
    return doc({
      w,
      h: 800,
      id: "arch",
      title: "How I think about intelligent systems",
      desc: "Illustrative flow from user and application through an API layer, AI orchestrator, retrieval, agents, tools, validation, and grounded output.",
      body: parts.join("\n"),
    });
  }
  let cursor = 150;
  nodes.forEach((node, index) => {
    const [num, title, sub] = node;
    const accent = index === 2 ? C.cyan : index === 7 ? C.blue : C.line;
    parts.push(rect(32, cursor, 656, 72, { fill: C.surface, stroke: accent, sw: index === 2 || index === 7 ? 1.5 : 1, rx: 4 }));
    parts.push(t(48, cursor + 30, `${num}   ${title}`, { size: 20, weight: 700 }));
    parts.push(t(48, cursor + 54, sub, { size: 15, fill: C.muted }));
    cursor += 72;
    if (index < nodes.length - 1) {
      parts.push(line(360, cursor, 360, cursor + 22, { stroke: C.blue, sw: 1.25 }));
      cursor += 22;
    }
  });
  return doc({
    w,
    h: cursor + 36,
    id: "arch-m",
    title: "How I think about intelligent systems",
    desc: "Illustrative flow from user and application through an API layer, AI orchestrator, retrieval, agents, tools, validation, and grounded output.",
    body: parts.join("\n"),
  });
}

function skills(mode) {
  const mobile = mode === "mobile";
  const groups = [
    {
      index: "01",
      title: "AI ENGINEERING",
      label: "DIRECTION",
      note: "Focus areas. Model SDKs are omitted until they appear in public code.",
      items: ["Agentic workflows", "Knowledge systems", "Orchestration", "Evaluation"],
    },
    {
      index: "02",
      title: "FRONTEND",
      label: "PUBLIC REPOS",
      note: "Interfaces in the public repositories.",
      items: ["TypeScript", "React", "Next.js", "Tailwind CSS", "Motion", "Three.js"],
    },
    {
      index: "03",
      title: "BACKEND & DATA",
      label: "PUBLIC REPOS",
      note: "Services and data layers in public code.",
      items: ["Node.js", "Supabase", "PostgreSQL", "Stripe"],
    },
    {
      index: "04",
      title: "CLOUD & DEVOPS",
      label: "PUBLIC REPOS",
      note: "Delivery tooling present in public code.",
      items: ["GitHub Actions", "Hostinger"],
    },
  ];
  if (!mobile) {
    const w = 1160;
    const h = 620;
    const parts = [
      t(40, 58, "TOOLS", { size: 28, weight: 700 }),
      t(40, 90, "Grouped from public repositories, with AI direction labeled separately from verified tools.", { size: 16, fill: C.muted }),
    ];
    groups.forEach((group, index) => {
      const x = 40 + index * 280;
      parts.push(rect(x, 124, 264, 456, { fill: C.surface, stroke: C.line, sw: 1, rx: 4 }));
      parts.push(rect(x, 124, 264, 3, { fill: index === 0 ? C.violet : C.cyan }));
      parts.push(t(x + 18, 160, group.index, { size: 13, fill: C.cyan, family: MONO }));
      parts.push(t(x + 18, 192, group.title, { size: 16, weight: 700 }));
      parts.push(t(x + 18, 216, group.label, { size: 12, fill: C.violet, family: MONO }));
      let y = 258;
      for (const item of group.items) {
        parts.push(rect(x + 18, y - 10, 8, 8, { fill: C.cyan }));
        parts.push(t(x + 36, y, item, { size: 16, fill: C.text }));
        y += 32;
      }
      const noteLines = wrap(group.note, 28);
      let ny = 500;
      for (const row of noteLines) {
        parts.push(t(x + 18, ny, row, { size: 13, fill: C.muted }));
        ny += 18;
      }
    });
    return doc({
      w,
      h,
      id: "skills",
      title: "Tools in public repositories",
      desc: "AI engineering direction plus frontend, backend, and cloud tools verified in public repositories.",
      body: parts.join("\n"),
    });
  }
  const parts = [
    t(32, 64, "TOOLS", { size: 32, weight: 700 }),
    t(32, 100, "Public repositories, with AI", { size: 18, fill: C.muted }),
    t(32, 126, "direction labeled separately.", { size: 18, fill: C.muted }),
  ];
  let y = 160;
  for (const group of groups) {
    const block = 78 + group.items.length * 32 + 36;
    parts.push(rect(32, y, 656, block, { fill: C.surface, stroke: C.line, sw: 1, rx: 4 }));
    parts.push(rect(32, y, 656, 3, { fill: group.index === "01" ? C.violet : C.cyan }));
    parts.push(t(50, y + 36, `${group.index}   ${group.title}`, { size: 20, weight: 700 }));
    parts.push(t(50, y + 60, group.label, { size: 13, fill: C.violet, family: MONO }));
    let iy = y + 98;
    for (const item of group.items) {
      parts.push(rect(50, iy - 10, 8, 8, { fill: C.cyan }));
      parts.push(t(70, iy, item, { size: 18 }));
      iy += 32;
    }
    y += block + 16;
  }
  return doc({
    w: 720,
    h: y + 16,
    id: "skills-m",
    title: "Tools in public repositories",
    desc: "AI engineering direction plus frontend, backend, and cloud tools verified in public repositories.",
    body: parts.join("\n"),
  });
}

function icon(kind, x, y) {
  if (kind === "agent") {
    return [
      circle(x, y, 3, { fill: C.cyan, stroke: "none" }),
      circle(x - 16, y + 12, 3, { fill: C.blue, stroke: "none" }),
      circle(x + 16, y + 12, 3, { fill: C.violet, stroke: "none" }),
      line(x, y, x - 16, y + 12, { stroke: C.blue, sw: 1.25 }),
      line(x, y, x + 16, y + 12, { stroke: C.violet, sw: 1.25 }),
    ].join("\n");
  }
  if (kind === "knowledge") {
    return [0, 8, 16]
      .map((offset) => line(x - 16, y + offset, x + 16, y + offset, { stroke: offset === 0 ? C.cyan : C.blue, sw: 1.5 }))
      .join("\n");
  }
  if (kind === "platform") {
    return [0, 1, 2]
      .map((layer) => rect(x - 18 + layer * 4, y - 8 + layer * 7, 28, 8, { fill: "none", stroke: layer === 1 ? C.cyan : C.blue, sw: 1.25, rx: 1 }))
      .join("\n");
  }
  return path(`M ${x - 18} ${y + 6} H ${x - 8} L ${x - 2} ${y - 10} L ${x + 6} ${y + 8} H ${x + 18}`, {
    stroke: C.cyan,
    sw: 1.5,
  });
}

function engineer(mode) {
  const areas = [
    ["01", "AGENTIC SYSTEMS", "agent", "Multi-step workflows, orchestration, agent tools, reasoning pipelines, and reliable execution."],
    ["02", "KNOWLEDGE INTELLIGENCE", "knowledge", "RAG systems, document retrieval, embeddings, vector databases, search, and grounded answers."],
    ["03", "AI PLATFORMS", "platform", "Full-stack intelligent applications, AI infrastructure, backend APIs, and cloud systems."],
    ["04", "REAL-TIME SOFTWARE", "signal", "Interactive applications, modern frontend systems, event-driven infrastructure, and production tools."],
  ];
  const mobile = mode === "mobile";
  const parts = [
    t(mobile ? 32 : 40, mobile ? 58 : 56, "WHAT I ENGINEER", { size: mobile ? 30 : 28, weight: 700 }),
    t(mobile ? 32 : 40, mobile ? 92 : 88, "Capability areas. Not claims about a specific deployment.", { size: mobile ? 16 : 16, fill: C.muted }),
  ];
  if (!mobile) {
    areas.forEach((area, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = 40 + col * 560;
      const y = 124 + row * 200;
      const [num, title, kind, copy] = area;
      parts.push(rect(x, y, 536, 180, { fill: C.surface, stroke: C.line, sw: 1, rx: 4 }));
      parts.push(rect(x, y, 536, 3, { fill: index === 0 ? C.violet : C.cyan }));
      parts.push(icon(kind, x + 36, y + 42));
      parts.push(t(x + 70, y + 40, num, { size: 13, fill: C.cyan, family: MONO }));
      parts.push(t(x + 24, y + 84, title, { size: 20, weight: 700 }));
      wrap(copy, 52).forEach((lineText, lineIndex) => {
        parts.push(t(x + 24, y + 118 + lineIndex * 24, lineText, { size: 16, fill: C.muted }));
      });
    });
    return doc({
      w: 1160,
      h: 540,
      id: "eng",
      title: "What I engineer",
      desc: "Agentic systems, knowledge intelligence, AI platforms, and real-time software.",
      body: parts.join("\n"),
    });
  }
  let y = 120;
  for (const [index, area] of areas.entries()) {
    const [num, title, kind, copy] = area;
    const lines = wrap(copy, 40);
    const block = 118 + lines.length * 26;
    parts.push(rect(32, y, 656, block, { fill: C.surface, stroke: C.line, sw: 1, rx: 4 }));
    parts.push(rect(32, y, 656, 3, { fill: index === 0 ? C.violet : C.cyan }));
    parts.push(icon(kind, 64, y + 40));
    parts.push(t(96, y + 36, num, { size: 14, fill: C.cyan, family: MONO }));
    parts.push(t(50, y + 78, title, { size: 22, weight: 700 }));
    lines.forEach((lineText, lineIndex) => {
      parts.push(t(50, y + 112 + lineIndex * 26, lineText, { size: 17, fill: C.muted }));
    });
    y += block + 16;
  }
  return doc({
    w: 720,
    h: y + 12,
    id: "eng-m",
    title: "What I engineer",
    desc: "Agentic systems, knowledge intelligence, AI platforms, and real-time software.",
    body: parts.join("\n"),
  });
}

function footer(mode) {
  const mobile = mode === "mobile";
  const w = mobile ? 720 : 1160;
  const h = mobile ? 220 : 180;
  const body = [
    t(mobile ? 32 : 48, mobile ? 78 : 72, "LET'S BUILD WHAT'S NEXT.", { size: mobile ? 32 : 28, weight: 700 }),
    t(mobile ? 32 : 48, mobile ? 124 : 112, "VINAY  //  SYSTEMS ONLINE", { size: mobile ? 16 : 15, fill: C.cyan, family: MONO }),
    line(mobile ? 32 : 48, mobile ? 156 : 140, mobile ? 280 : 360, mobile ? 156 : 140, { stroke: C.line, sw: 1 }),
  ].join("\n");
  return doc({
    w,
    h,
    id: mobile ? "foot-m" : "foot",
    title: "Vinay, systems online",
    desc: "Closing mark for Vinay Vasamsetty.",
    body,
  });
}

write("assets/hero.svg", heroDesktop());
write("assets/hero-mobile.svg", heroMobile());
write("assets/terminal.svg", terminalFrame("desktop"));
write("assets/terminal-mobile.svg", terminalFrame("mobile"));
write("assets/architecture.svg", architecture("desktop"));
write("assets/architecture-mobile.svg", architecture("mobile"));
write("assets/engineer.svg", engineer("desktop"));
write("assets/engineer-mobile.svg", engineer("mobile"));
write("assets/skills.svg", skills("desktop"));
write("assets/skills-mobile.svg", skills("mobile"));
write("assets/footer.svg", footer("desktop"));
write("assets/footer-mobile.svg", footer("mobile"));
for (const project of projects) {
  write(`assets/projects/${project.file}.svg`, projectCard(project, "desktop"));
  write(`assets/projects/${project.file}-mobile.svg`, projectCard(project, "mobile"));
}
