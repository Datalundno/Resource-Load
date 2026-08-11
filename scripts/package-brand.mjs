#!/usr/bin/env node
"use strict";

/**
 * Apply a brand overlay, run pbiviz package, copy the .pbiviz, restore prior files.
 *
 * Usage:
 *   node scripts/package-brand.mjs branded
 *   node scripts/package-brand.mjs whitelabel
 */

import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const brandId = process.argv[2] || "branded";
const brandPath = path.join(root, "branding", `${brandId}.json`);

if (!fs.existsSync(brandPath)) {
    console.error(`Unknown brand "${brandId}". Expected branding/${brandId}.json`);
    process.exit(1);
}

const brand = JSON.parse(fs.readFileSync(brandPath, "utf8"));

const paths = {
    pbiviz: path.join(root, "pbiviz.json"),
    packageJson: path.join(root, "package.json"),
    strings: path.join(root, "stringResources", "en-US", "resources.resjson"),
    visual: path.join(root, "src", "visual.ts")
};

const backups = {};

function read(file) {
    return fs.readFileSync(file, "utf8");
}

function write(file, contents) {
    fs.writeFileSync(file, contents);
}

function backup() {
    for (const [key, file] of Object.entries(paths)) {
        backups[key] = read(file);
    }
}

function restore() {
    for (const [key, file] of Object.entries(paths)) {
        if (backups[key] != null) {
            write(file, backups[key]);
        }
    }
}

function applyBrand(config) {
    const pbiviz = JSON.parse(read(paths.pbiviz));
    pbiviz.visual = { ...pbiviz.visual, ...config.pbiviz.visual };
    pbiviz.author = { ...config.pbiviz.author };
    // Keep a single version under visual.version (do not reintroduce a top-level duplicate).
    if (Object.prototype.hasOwnProperty.call(pbiviz, "version")) {
        delete pbiviz.version;
    }
    write(paths.pbiviz, `${JSON.stringify(pbiviz, null, 2)}\n`);

    const pkg = JSON.parse(read(paths.packageJson));
    Object.assign(pkg, config.packageJson);
    write(paths.packageJson, `${JSON.stringify(pkg, null, 2)}\n`);

    const strings = JSON.parse(read(paths.strings));
    Object.assign(strings, config.strings);
    write(paths.strings, `${JSON.stringify(strings, null, 4)}\n`);

    let visual = read(paths.visual);
    visual = visual
        .replace(
            /this\.t\("Landing_Title", "[^"]*"\)/,
            `this.t("Landing_Title", "${config.codeFallbacks.Landing_Title}")`
        )
        .replace(
            /this\.t\("Landing_Subtitle", "[^"]*"\)/,
            `this.t("Landing_Subtitle", "${config.codeFallbacks.Landing_Subtitle}")`
        );
    write(paths.visual, visual);
}

function cleanBuildArtifacts() {
    // pbiviz reuses .tmp/drop/pbiviz.json across runs — wipe it when switching brands.
    for (const dir of [".tmp", "dist"]) {
        const full = path.join(root, dir);
        if (fs.existsSync(full)) {
            fs.rmSync(full, { recursive: true, force: true });
        }
    }
}

function runPackage() {
    cleanBuildArtifacts();
    const result = spawnSync("npx", ["pbiviz", "package"], {
        cwd: root,
        stdio: "inherit",
        shell: process.platform === "win32"
    });
    if (result.status !== 0) {
        throw new Error(`pbiviz package failed with status ${result.status}`);
    }
}

function copyOutput(config) {
    const distDir = path.join(root, "dist");
    const built = fs.readdirSync(distDir).find((f) => f.endsWith(".pbiviz"));
    if (!built) {
        throw new Error("No .pbiviz found in dist/");
    }
    const dest = path.join(root, config.outputFile);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(path.join(distDir, built), dest);
    console.log(`Wrote ${config.outputFile}`);

    if (config.syncWebsite) {
        // Optional: copy into a sibling Website checkout when syncWebsite is enabled in branding/*.json.
        // Default branded/whitelabel overlays leave this false so the visual repo stays cert-clean.
        const relative = config.websiteSyncPath
            || path.join("downloads", path.basename(config.outputFile));
        const websiteRoot = config.websiteRoot
            || path.resolve(root, "..", "Website");
        const websiteDest = path.join(websiteRoot, "public", relative);
        fs.mkdirSync(path.dirname(websiteDest), { recursive: true });
        fs.copyFileSync(path.join(distDir, built), websiteDest);
        console.log(`Synced ${websiteDest}`);
    }
}

function assertNoBrandLeak(config) {
    if (config.id !== "whitelabel") {
        return;
    }
    const dest = path.join(root, config.outputFile);
    const zip = spawnSync("unzip", ["-p", dest, "package.json"], { encoding: "utf8" });
    if (zip.status !== 0) {
        throw new Error("Could not read packaged package.json for brand audit");
    }
    const pkg = JSON.parse(zip.stdout);
    const blob = JSON.stringify(pkg).toLowerCase();
    if (blob.includes("datalund")) {
        throw new Error("Whitelabel package still contains DataLund branding in package.json");
    }
    if (pkg.visual.guid !== config.pbiviz.visual.guid) {
        throw new Error(`Whitelabel GUID mismatch: ${pkg.visual.guid}`);
    }
    if (pkg.visual.displayName !== "Resource Load") {
        throw new Error(`Unexpected displayName: ${pkg.visual.displayName}`);
    }

    const innerName = pkg.resources[0].file;
    const innerZip = spawnSync("unzip", ["-p", dest, innerName], { encoding: "buffer" });
    if (innerZip.status !== 0) {
        throw new Error("Could not read inner pbiviz.json for brand audit");
    }
    const innerText = innerZip.stdout.toString("utf8");
    if (/datalund/i.test(innerText)) {
        throw new Error("Whitelabel package still contains DataLund branding in visual payload");
    }
    console.log("Whitelabel brand audit passed");
}

backup();
try {
    applyBrand(brand);
    runPackage();
    copyOutput(brand);
    assertNoBrandLeak(brand);
    console.log(`Done: ${brand.id}`);
} catch (error) {
    console.error(error);
    restore();
    process.exit(1);
} finally {
    restore();
}
