import { execFileSync } from "node:child_process"
import { gzipSync } from "node:zlib"
import { copyFile, readFile, rm, writeFile } from "node:fs/promises"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { build } from "esbuild"

const root = resolve(fileURLToPath(new URL("..", import.meta.url)))
const dist = resolve(root, "dist")
const tsc = resolve(root, "node_modules", "typescript", "bin", "tsc")

await rm(dist, { force: true, recursive: true })
execFileSync(process.execPath, [tsc, "-p", resolve(root, "tsconfig.json")], {
  cwd: root,
  stdio: "inherit",
})

const shared = {
  bundle: true,
  legalComments: "none",
  logLevel: "warning",
  sourcemap: true,
  target: ["es2022"],
}

await Promise.all([
  build({
    ...shared,
    entryPoints: [resolve(root, "src", "index.ts")],
    format: "esm",
    outfile: resolve(dist, "markup-ui.js"),
  }),
  build({
    ...shared,
    entryPoints: [resolve(root, "src", "index.ts")],
    format: "esm",
    minify: true,
    outfile: resolve(dist, "markup-ui.min.js"),
  }),
  build({
    ...shared,
    entryPoints: [resolve(root, "src", "global.ts")],
    format: "iife",
    minify: true,
    outfile: resolve(dist, "markup-ui.global.js"),
  }),
  build({
    ...shared,
    entryPoints: [resolve(root, "src", "plugins", "advanced.ts")],
    format: "esm",
    minify: true,
    outfile: resolve(dist, "markup-ui-advanced.js"),
  }),
  build({
    ...shared,
    entryPoints: [resolve(root, "src", "plugins", "widgets.ts")],
    format: "esm",
    minify: true,
    outfile: resolve(dist, "markup-ui-widgets.js"),
  }),
  build({
    ...shared,
    entryPoints: [resolve(root, "src", "components", "button", "index.ts")],
    format: "esm",
    minify: true,
    outfile: resolve(dist, "markup-ui-button.js"),
  }),
  build({
    ...shared,
    entryPoints: [resolve(root, "src", "components", "button", "index.ts")],
    format: "iife",
    globalName: "MarkupUIButton",
    minify: true,
    outfile: resolve(dist, "markup-ui-button.global.js"),
  }),
  build({
    ...shared,
    entryPoints: [resolve(root, "src", "components", "avatar", "index.ts")],
    format: "esm",
    minify: true,
    outfile: resolve(dist, "markup-ui-avatar.js"),
  }),
  build({
    ...shared,
    entryPoints: [resolve(root, "src", "components", "avatar", "index.ts")],
    format: "iife",
    globalName: "MarkupUIAvatar",
    minify: true,
    outfile: resolve(dist, "markup-ui-avatar.global.js"),
  }),
])

await copyFile(resolve(root, "src", "components", "avatar", "avatar.css"), resolve(dist, "markup-ui-avatar.css"))
await copyFile(resolve(root, "src", "components", "button", "button.css"), resolve(dist, "markup-ui-button.css"))

const packageJson = JSON.parse(await readFile(resolve(root, "package.json"), "utf8"))
const bundleBudgets = {
  "markup-ui.min.js": 15_000,
  "markup-ui-advanced.js": 3_000,
  "markup-ui-widgets.js": 4_000,
  "markup-ui-avatar.js": 4_000,
  "markup-ui-avatar.global.js": 4_000,
  "markup-ui-avatar.css": 1_500,
  "markup-ui-button.js": 4_000,
  "markup-ui-button.global.js": 4_000,
  "markup-ui-button.css": 2_500,
}
const bundles = {}

for (const [name, budget] of Object.entries(bundleBudgets)) {
  const content = await readFile(resolve(dist, name))
  const gzipBytes = gzipSync(content, { level: 9 }).length
  bundles[name] = { bytes: content.length, gzipBytes, budget }
  if (gzipBytes > budget) {
    throw new Error(`${name} is ${gzipBytes} gzip bytes; budget is ${budget}.`)
  }
}

await writeFile(
  resolve(dist, "manifest.json"),
  `${JSON.stringify({
    name: packageJson.name,
    version: packageJson.version,
    bundles,
  }, null, 2)}\n`,
)
