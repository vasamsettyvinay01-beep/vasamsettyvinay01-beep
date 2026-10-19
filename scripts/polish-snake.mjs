import { readFileSync, writeFileSync } from "node:fs";

const target = new URL("../assets/activity/contribution-snake.svg", import.meta.url);
const svg = readFileSync(target, "utf8");
if (svg.includes("data-bg")) {
  console.log("snake background already present");
  process.exit(0);
}
const viewBox = svg.match(/viewBox="([^"]+)"/);
if (!viewBox) {
  console.error("snake svg is missing a viewBox");
  process.exit(1);
}
const [x, y, width, height] = viewBox[1].split(/\s+/).map(Number);
const rect = `<rect data-bg="1" x="${x}" y="${y}" width="${width}" height="${height}" fill="#070B14"/>`;
const next = svg.replace(/(<svg\b[^>]*>)/, `$1${rect}`);
writeFileSync(target, next);
console.log("added snake background");
