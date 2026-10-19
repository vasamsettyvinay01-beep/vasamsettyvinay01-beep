import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];

function fail(message) {
  errors.push(message);
}

function walk(dir, found = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".git") continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, found);
    else found.push(full);
  }
  return found;
}

const readme = readFileSync(join(root, "README.md"), "utf8");
if (readme.trim().length < 500) fail("README.md is too small");

const refs = new Set();
for (const match of readme.matchAll(/(?:src|srcset)="(\.\/[^"]+)"/g)) refs.add(match[1]);
for (const match of readme.matchAll(/!\[[^\]]*]\((\.\/[^)]+)\)/g)) refs.add(match[1]);
if (refs.size === 0) fail("README has no local image references");

for (const ref of refs) {
  const relative = ref.replace(/^\.\//, "");
  const full = join(root, relative);
  try {
    const size = statSync(full).size;
    if (size < 100) fail(`${relative} is unexpectedly small (${size} bytes)`);
    if (size > 2_500_000) fail(`${relative} is larger than 2.5 MB (${size} bytes)`);
  } catch {
    fail(`missing README asset ${relative}`);
  }
}

const files = walk(root);
for (const file of files) {
  if (file.endsWith(".svg")) {
    const result = execFileSync("python", ["-c", "import sys, xml.etree.ElementTree as ET; ET.parse(sys.argv[1])", file], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    void result;
  }
}

const text = files
  .filter((file) => /\.(md|mjs|yml|yaml|json|svg|py|txt)$/i.test(file))
  .map((file) => readFileSync(file, "utf8"))
  .join("\n");

const secretPatterns = [
  [/ghp_[A-Za-z0-9]{20,}/, "GitHub personal token"],
  [/gho_[A-Za-z0-9]{20,}/, "GitHub OAuth token"],
  [/github_pat_[A-Za-z0-9_]{20,}/, "GitHub fine-grained token"],
  [/sk_live_[A-Za-z0-9]+/, "Stripe live secret"],
  [/sk_test_[A-Za-z0-9]+/, "Stripe test secret"],
  [/AKIA[0-9A-Z]{16}/, "AWS access key"],
  [/-----BEGIN [A-Z ]+PRIVATE KEY-----/, "private key"],
];
for (const [pattern, label] of secretPatterns) {
  if (pattern.test(text)) fail(`possible ${label} found in repository text`);
}
if (/\b\d{3}[-.\s)]\d{3}[-.\s]\d{4}\b/.test(readme)) fail("README contains a phone-number pattern");

const workflow = readFileSync(join(root, ".github/workflows/update-activity.yml"), "utf8");
for (const required of ["workflow_dispatch:", 'cron: "15 11 * * *"', "contents: write", "vasamsettyvinay01-beep", "actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1", "Platane/snk@d8f6715049803e982ee5ff501b6b9b7d5deeb09b", "yoshi389111/github-profile-3d-contrib@7d95e7d4cdc028dd1e1cbd957d65f35efb12ae39"]) {
  if (!workflow.includes(required)) fail(`workflow missing ${required}`);
}

const gifInfo = execFileSync("python", ["-c", "import sys; from PIL import Image; im=Image.open(sys.argv[1]); print(im.n_frames, im.size[0], im.size[1])", join(root, "assets/terminal.gif")], { encoding: "utf8" });
const [frames, width, height] = gifInfo.trim().split(/\s+/).map(Number);
if (frames < 10) fail(`terminal gif has only ${frames} frames`);
if (width < 800 || height < 400) fail(`terminal gif canvas is ${width}x${height}`);

const data = JSON.parse(readFileSync(join(root, "assets/activity/public-data.json"), "utf8"));
if (data.login !== "vasamsettyvinay01-beep") fail("telemetry login mismatch");
if (!Number.isInteger(data.publicRepos) || data.publicRepos < 0) fail("public repo count is not a real integer");
if (!Number.isInteger(data.contributionsLastYear)) fail("contribution count missing");
if (!Array.isArray(data.languages) || data.languages.length === 0) fail("language stats missing");

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}
console.log(`validated ${refs.size} readme assets, ${files.filter((file) => file.endsWith(".svg")).length} svgs, terminal gif ${frames} frames`);
