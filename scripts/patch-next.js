#!/usr/bin/env node
/**
 * Patches Next.js generate-build-id.js to handle undefined generate function.
 * This is a workaround for a bug where config.generateBuildId is stripped
 * by normalizeConfig but still called as a function.
 */
const fs = require("fs");
const path = require("path");

const filePath = path.join(
  __dirname,
  "..",
  "node_modules",
  "next",
  "dist",
  "build",
  "generate-build-id.js"
);

try {
  let content = fs.readFileSync(filePath, "utf8");

  if (content.includes("typeof generate")) {
    console.log("  next: generate-build-id.js already patched");
    return;
  }

  content = content.replace(
    "let buildId = await generate();",
    'let buildId = typeof generate === "function" ? await generate() : null;'
  );

  fs.writeFileSync(filePath, content);
  console.log("  next: patched generate-build-id.js");
} catch (e) {
  console.warn("  next: could not patch generate-build-id.js:", e.message);
}
