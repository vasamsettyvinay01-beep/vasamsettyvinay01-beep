import { readFileSync, writeFileSync } from "node:fs";
import { Resvg } from "@resvg/resvg-js";

const svgPath = new URL("../assets/activity/profile-3d.svg", import.meta.url);
const pngPath = new URL("../assets/activity/profile-3d.png", import.meta.url);
const svg = readFileSync(svgPath);
const png = new Resvg(svg, { fitTo: { mode: "width", value: 1280 } }).render().asPng();
if (png.length < 1000) {
  throw new Error("3D graph PNG is unexpectedly small");
}
writeFileSync(pngPath, png);
console.log(`profile-3d.png ${png.length} bytes`);
