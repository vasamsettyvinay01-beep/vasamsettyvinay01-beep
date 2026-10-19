import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { C, MONO, doc, rect, t, wrap } from "./lib/draw.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const LOGIN = "vasamsettyvinay01-beep";

const LABELS = {
  myportfolio: "Immersive AI-native portfolio",
  onemorewebsite: "Cinematic brand site and ticketing",
};

const LEVELS = ["#0B1323", "#123044", "#1A6F8A", "#00C2D6", "#00E5FF"];
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

function gh(args) {
  const env = { ...process.env };
  if (!env.GH_TOKEN && env.GITHUB_TOKEN) env.GH_TOKEN = env.GITHUB_TOKEN;
  try {
    return execFileSync("gh", args, {
      encoding: "utf8",
      maxBuffer: 20_000_000,
      env,
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (error) {
    const stderr = error.stderr ? error.stderr.toString() : error.message;
    throw new Error(`GitHub API request failed: ${stderr}`);
  }
}

function fetchJson(args) {
  const raw = gh(args);
  const parsed = JSON.parse(raw);
  if (parsed.errors) {
    throw new Error(parsed.errors.map((error) => error.message).join("; "));
  }
  return parsed;
}

function quartileBreaks(values) {
  if (values.length === 0) return [1, 1, 1];
  const sorted = [...values].sort((a, b) => a - b);
  const at = (p) => sorted[Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * p))];
  return [at(0.25), at(0.5), at(0.75)];
}

function levelFor(count, breaks) {
  if (count <= 0) return 0;
  if (count <= breaks[0]) return 1;
  if (count <= breaks[1]) return 2;
  if (count <= breaks[2]) return 3;
  return 4;
}

function formatInt(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

function shares(entries) {
  const total = entries.reduce((sum, entry) => sum + entry.bytes, 0);
  if (total === 0) return [];
  const raw = entries.map((entry) => {
    const exact = (entry.bytes / total) * 1000;
    return { ...entry, pct: Math.floor(exact), remainder: exact - Math.floor(exact) };
  });
  let leftover = 1000 - raw.reduce((sum, entry) => sum + entry.pct, 0);
  const order = [...raw].sort((a, b) => b.remainder - a.remainder);
  for (const entry of order) {
    if (leftover <= 0) break;
    entry.pct += 1;
    leftover -= 1;
  }
  return raw
    .map((entry) => ({ ...entry, percent: entry.pct / 10 }))
    .sort((a, b) => b.bytes - a.bytes);
}

function collect() {
  const user = fetchJson(["api", `users/${LOGIN}`]);
  const repos = fetchJson([
    "api",
    `users/${LOGIN}/repos?per_page=100&type=owner&sort=pushed`,
    "--paginate",
  ]);
  const publicRepos = repos.filter((repo) => repo.private !== true && repo.fork !== true);
  const languages = new Map();
  for (const repo of publicRepos) {
    const stats = fetchJson(["api", `repos/${LOGIN}/${repo.name}/languages`]);
    for (const [name, bytes] of Object.entries(stats)) {
      languages.set(name, (languages.get(name) || 0) + bytes);
    }
  }
  const query = `query { user(login: "${LOGIN}") { contributionsCollection { contributionCalendar { totalContributions weeks { contributionDays { date contributionCount } } } } } }`;
  const calendar = fetchJson(["api", "graphql", "-f", `query=${query}`]);
  const weeks = calendar.data.user.contributionsCollection.contributionCalendar.weeks;
  const totalContributions = calendar.data.user.contributionsCollection.contributionCalendar.totalContributions;
  const activity = [...publicRepos]
    .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
    .slice(0, 3)
    .map((repo) => ({
      repo: repo.name,
      pushedAt: repo.pushed_at,
      label: LABELS[repo.name] || "Public repository updated",
    }));
  const languageEntries = [...languages.entries()].map(([name, bytes]) => ({ name, bytes }));
  return {
    login: LOGIN,
    fetchedAt: new Date().toISOString(),
    publicRepos: user.public_repos,
    inspectedPublicRepos: publicRepos.length,
    publicStars: publicRepos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0),
    contributionsLastYear: totalContributions,
    languageBytes: languageEntries.reduce((sum, entry) => sum + entry.bytes, 0),
    languages: shares(languageEntries),
    weeks,
    activity,
  };
}

function heatmap(data, originX, originY, cell) {
  const gap = Math.max(2, Math.round(cell * 0.28));
  const pitch = cell + gap;
  const counts = data.weeks.flatMap((week) => week.contributionDays.map((day) => day.contributionCount));
  const breaks = quartileBreaks(counts.filter((count) => count > 0));
  const parts = [];
  data.weeks.forEach((week, weekIndex) => {
    week.contributionDays.forEach((day, dayIndex) => {
      const level = levelFor(day.contributionCount, breaks);
      const x = originX + weekIndex * pitch;
      const y = originY + dayIndex * pitch;
      parts.push(rect(x, y, cell, cell, { fill: LEVELS[level], rx: 1 }));
    });
  });
  return { svg: parts.join("\n"), width: data.weeks.length * pitch, height: 7 * pitch };
}

function stat(x, y, w, h, value, label) {
  return [
    rect(x, y, w, h, { fill: C.surface, stroke: C.line, sw: 1, rx: 4 }),
    t(x + 18, y + 42, value, { size: 28, weight: 700, fill: C.text, family: MONO }),
    t(x + 18, y + 70, label, { size: 13, fill: C.muted, family: MONO }),
  ].join("\n");
}

function languageRows(data, x, y, width, rowH, labelSize, barH) {
  const top = data.languages.slice(0, 4);
  const rest = data.languages.slice(4).reduce((sum, entry) => sum + entry.bytes, 0);
  const rows = [...top];
  if (rest > 0) {
    const known = top.reduce((sum, entry) => sum + entry.percent, 0);
    rows.push({ name: "Other", percent: Math.round((100 - known) * 10) / 10 });
  }
  const max = Math.max(...rows.map((row) => row.percent), 1);
  const parts = [];
  rows.forEach((row, index) => {
    const yy = y + index * rowH;
    parts.push(t(x, yy, row.name.toUpperCase(), { size: labelSize, fill: C.text, family: MONO }));
    parts.push(t(x + width, yy, `${row.percent.toFixed(1)}%`, { size: labelSize, fill: C.cyan, family: MONO, anchor: "end" }));
    parts.push(rect(x, yy + 10, width, barH, { fill: "#102033", rx: 2 }));
    parts.push(rect(x, yy + 10, Math.max(4, (width * row.percent) / max), barH, { fill: C.cyan, rx: 2 }));
  });
  return parts.join("\n");
}

function desktop(data) {
  const w = 1160;
  const h = 760;
  const parts = [
    t(40, 56, "LIVE ENGINEERING TELEMETRY", { size: 28, weight: 700 }),
    t(40, 88, "Public GitHub data, refreshed daily. Not a realtime monitor.", { size: 16, fill: C.muted }),
    stat(40, 116, 255, 92, String(data.publicRepos), "PUBLIC REPOSITORIES"),
    stat(315, 116, 255, 92, String(data.publicStars), "PUBLIC STARS"),
    stat(590, 116, 255, 92, String(data.contributionsLastYear), "CONTRIBUTIONS / YEAR"),
    stat(865, 116, 255, 92, formatInt(data.languageBytes), "LANGUAGE BYTES"),
    t(40, 252, "CONTRIBUTION CALENDAR", { size: 13, fill: C.cyan, family: MONO }),
    t(1120, 252, data.fetchedAt.slice(0, 10), { size: 13, fill: C.muted, family: MONO, anchor: "end" }),
  ];
  const map = heatmap(data, 40, 272, 12);
  parts.push(map.svg);
  parts.push(t(40, 430, "LANGUAGE SHARE", { size: 13, fill: C.cyan, family: MONO }));
  parts.push(t(620, 430, "RECENT PUBLIC ACTIVITY", { size: 13, fill: C.cyan, family: MONO }));
  parts.push(languageRows(data, 40, 468, 520, 52, 14, 8));
  data.activity.forEach((item, index) => {
    const y = 468 + index * 78;
    const date = new Date(item.pushedAt);
    const stamp = `${MONTHS[date.getUTCMonth()]} ${String(date.getUTCDate()).padStart(2, "0")}`;
    parts.push(rect(620, y - 22, 500, 66, { fill: C.surface, stroke: C.line, sw: 1, rx: 4 }));
    parts.push(t(638, y, stamp, { size: 13, fill: C.cyan, family: MONO }));
    parts.push(t(720, y, item.repo, { size: 14, fill: C.text, family: MONO }));
    parts.push(t(638, y + 24, item.label, { size: 15, fill: C.muted }));
  });
  const note = "Language share is GitHub Linguist bytes summed across public repositories. Contributions are the last-year profile calendar. Stars are stargazer counts on those public repositories.";
  wrap(note, 120).forEach((row, index) => {
    parts.push(t(40, 690 + index * 18, row, { size: 13, fill: C.muted }));
  });
  return doc({
    w,
    h,
    id: "telemetry",
    title: "Live engineering telemetry",
    desc: `${data.publicRepos} public repositories, ${data.publicStars} public stars, ${data.contributionsLastYear} contributions in the last year.`,
    body: parts.join("\n"),
  });
}

function mobile(data) {
  const w = 720;
  const parts = [
    t(32, 58, "LIVE ENGINEERING", { size: 30, weight: 700 }),
    t(32, 96, "TELEMETRY", { size: 30, weight: 700 }),
    t(32, 132, "Public GitHub data, refreshed daily.", { size: 16, fill: C.muted }),
  ];
  const stats = [
    [String(data.publicRepos), "PUBLIC REPOS"],
    [String(data.publicStars), "PUBLIC STARS"],
    [String(data.contributionsLastYear), "CONTRIBUTIONS"],
    [formatInt(data.languageBytes), "LANGUAGE BYTES"],
  ];
  stats.forEach((entry, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    parts.push(stat(32 + col * 336, 160 + row * 108, 320, 96, entry[0], entry[1]));
  });
  parts.push(t(32, 400, "CONTRIBUTION CALENDAR", { size: 14, fill: C.cyan, family: MONO }));
  const map = heatmap(data, 32, 420, 8);
  parts.push(map.svg);
  let y = 420 + map.height + 36;
  parts.push(t(32, y, "LANGUAGE SHARE", { size: 14, fill: C.cyan, family: MONO }));
  y += 36;
  parts.push(languageRows(data, 32, y, 656, 48, 16, 8));
  y += 48 * Math.min(5, data.languages.length) + 20;
  parts.push(t(32, y, "RECENT PUBLIC ACTIVITY", { size: 14, fill: C.cyan, family: MONO }));
  y += 28;
  for (const item of data.activity) {
    const date = new Date(item.pushedAt);
    const stamp = `${MONTHS[date.getUTCMonth()]} ${String(date.getUTCDate()).padStart(2, "0")}`;
    parts.push(rect(32, y, 656, 78, { fill: C.surface, stroke: C.line, sw: 1, rx: 4 }));
    parts.push(t(48, y + 30, `${stamp}   ${item.repo}`, { size: 16, fill: C.cyan, family: MONO }));
    parts.push(t(48, y + 56, item.label, { size: 16, fill: C.muted }));
    y += 92;
  }
  y += 8;
  const note = "Language share is GitHub Linguist bytes across public repositories. Contributions are the last-year profile calendar.";
  for (const row of wrap(note, 48)) {
    parts.push(t(32, y, row, { size: 15, fill: C.muted }));
    y += 22;
  }
  return doc({
    w,
    h: y + 28,
    id: "telemetry-m",
    title: "Live engineering telemetry",
    desc: `${data.publicRepos} public repositories, ${data.publicStars} public stars, ${data.contributionsLastYear} contributions in the last year.`,
    body: parts.join("\n"),
  });
}

const data = collect();
const activityDir = join(root, "assets", "activity");
mkdirSync(activityDir, { recursive: true });
writeFileSync(join(activityDir, "public-data.json"), JSON.stringify(data, null, 2));
writeFileSync(join(activityDir, "telemetry.svg"), desktop(data));
writeFileSync(join(activityDir, "telemetry-mobile.svg"), mobile(data));
console.log(`public repos ${data.publicRepos}`);
console.log(`stars ${data.publicStars}`);
console.log(`contributions ${data.contributionsLastYear}`);
console.log(`language bytes ${data.languageBytes}`);
for (const language of data.languages) {
  console.log(`${language.name} ${language.percent}% ${language.bytes}`);
}
