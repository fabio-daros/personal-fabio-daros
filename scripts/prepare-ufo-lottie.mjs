#!/usr/bin/env node
/**
 * Prepares a raw Lottie JSON for lottie-web on the 404 page.
 * Usage: node scripts/prepare-ufo-lottie.mjs [input.json]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DEFAULT_TR = {
  ty: "tr",
  p: { a: 0, k: [0, 0], ix: 2 },
  a: { a: 0, k: [0, 0], ix: 1 },
  s: { a: 0, k: [100, 100], ix: 3 },
  r: { a: 0, k: 0, ix: 6 },
  o: { a: 0, k: 100, ix: 7 },
  sk: { a: 0, k: 0, ix: 4 },
  sa: { a: 0, k: 0, ix: 5 },
  nm: "Transform",
};

function fixGroups(obj) {
  if (Array.isArray(obj)) obj.forEach(fixGroups);
  else if (obj && typeof obj === "object") {
    if (obj.ty === "gr" && Array.isArray(obj.it)) {
      if (!obj.it.some((i) => i && i.ty === "tr")) obj.it.push({ ...DEFAULT_TR });
    }
    Object.values(obj).forEach(fixGroups);
  }
}

function fixKeyframes(prop) {
  if (!prop || prop.a !== 1 || !Array.isArray(prop.k)) return;
  if (prop.k.length === 0 || typeof prop.k[0] !== "object" || !("t" in prop.k[0])) return;

  prop.k = prop.k.map((kf, i, arr) => {
    const next = arr[i + 1];
    const fixed = { t: kf.t };

    if (Array.isArray(kf.s)) {
      fixed.s = [...kf.s];
    } else if (kf.s !== undefined) {
      fixed.s = [kf.s];
    }

    if (next) {
      fixed.i = kf.i ?? { x: [0.667], y: [1] };
      fixed.o = kf.o ?? { x: [0.333], y: [0] };
    } else {
      fixed.h = 1;
    }

    return fixed;
  });
}

function fixAllAnimatedProps(obj) {
  if (Array.isArray(obj)) {
    obj.forEach(fixAllAnimatedProps);
    return;
  }
  if (!obj || typeof obj !== "object") return;

  if (obj.a === 1 && Array.isArray(obj.k) && obj.k[0]?.t !== undefined) {
    fixKeyframes(obj);
  }

  Object.values(obj).forEach(fixAllAnimatedProps);
}

function offsetProp(prop, dx, dy) {
  if (!prop) return;
  if (prop.a === 0 && Array.isArray(prop.k)) {
    prop.k = [prop.k[0] + dx, prop.k[1] + dy, prop.k[2] ?? 0];
    return;
  }
  if (prop.a === 1 && Array.isArray(prop.k)) {
    prop.k.forEach((kf) => {
      if (Array.isArray(kf.s) && kf.s.length >= 2) {
        kf.s = [kf.s[0] + dx, kf.s[1] + dy, kf.s[2] ?? 0];
      }
    });
  }
}

const input =
  process.argv[2] ||
  path.join(process.env.HOME || "", "Downloads/ufo-site-style-windows-beam.json");
const root = path.join(__dirname, "..");
const data = JSON.parse(fs.readFileSync(input, "utf8"));

fixGroups(data);
fixAllAnimatedProps(data);

const minX = 136;
const maxX = 376;
const minY = 122;
const maxY = 403;
const cx = (minX + maxX) / 2;
const cy = (minY + maxY) / 2;
const pad = 24;
const size = Math.ceil(Math.max(maxX - minX, maxY - minY) + pad * 2);
const offsetX = size / 2 - cx;
const offsetY = size / 2 - cy;

data.w = size;
data.h = size;
data.layers.forEach((layer) => {
  if (layer.ks?.p) offsetProp(layer.ks.p, offsetX, offsetY);
});

const json = JSON.stringify(data, null, 2) + "\n";
fs.writeFileSync(path.join(root, "lib/lottie/ufo.json"), json);
fs.writeFileSync(path.join(root, "public/assets/lottie/ufo.json"), json);
console.log(`Prepared ${data.nm} (${size}x${size})`);
