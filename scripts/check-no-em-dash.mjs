import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import process from "node:process";

const roots = ["src"];
const extensions = new Set([".ts", ".tsx", ".js", ".jsx", ".css", ".md", ".html"]);
const forbidden = ["\u2014"];
const violations = [];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(path);
      continue;
    }
    if (!extensions.has(extname(entry.name))) continue;
    const text = await readFile(path, "utf8");
    const lines = text.split(/\r?\n/);
    lines.forEach((line, index) => {
      for (const mark of forbidden) {
        if (line.includes(mark)) {
          violations.push(`${relative(process.cwd(), path)}:${index + 1}: ${line.trim()}`);
        }
      }
    });
  }
}

for (const root of roots) {
  await walk(root);
}

if (violations.length) {
  console.error("Em dash characters are not permitted in the frontend source:\n");
  console.error(violations.join("\n"));
  process.exit(1);
}

console.log("Frontend punctuation check passed: no em dash characters found in src.");
