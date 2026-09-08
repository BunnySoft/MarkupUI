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
const components = ["avatar", "button", "card", "tag", "badge", "alert", "empty", "skeleton", "spin", "progress", "statistic", "highlight", "image", "popover", "tooltip", "popconfirm", "dropdown", "menu", "tabs", "collapse", "anchor", "back-top", "pagination", "steps", "loading-bar"]
const classicEntries = { progress: "global.ts", popover: "global.ts", tooltip: "global.ts", popconfirm: "global.ts", dropdown: "global.ts", menu: "global.ts", tabs: "global.ts", collapse: "global.ts", anchor: "global.ts", "back-top": "global.ts", pagination: "global.ts", steps: "global.ts", "loading-bar": "global.ts" }
const styleOnlyComponents = ["typography", "icon", "gradient-text", "ellipsis", "page-header", "divider", "flex", "space", "grid", "layout", "list", "descriptions", "timeline", "breadcrumb", "thing", "table", "affix", "result", "code", "scrollbar", "float-button"]

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
  ...components.flatMap((name) => [
    build({
      ...shared,
      entryPoints: [resolve(root, "src", "components", name, "index.ts")],
      format: "esm",
      minify: true,
      outfile: resolve(dist, `markup-ui-${name}.js`),
    }),
    build({
      ...shared,
      entryPoints: [resolve(root, "src", "components", name, classicEntries[name] ?? "index.ts")],
      format: "iife",
      globalName: classicEntries[name] ? undefined : `MarkupUI${name[0].toUpperCase()}${name.slice(1)}`,
      minify: true,
      outfile: resolve(dist, `markup-ui-${name}.global.js`),
    }),
  ]),
])

await Promise.all([...components, ...styleOnlyComponents].map(async (name) => {
  const source = resolve(root, "src", "components", name, `${name}.css`)
  const output = resolve(dist, `markup-ui-${name}.css`)
  if (name === "tooltip" || name === "popconfirm" || name === "dropdown") {
    const base = await readFile(resolve(root, "src", "components", "popover", "popover.css"), "utf8")
    await writeFile(output, `${base}\n${await readFile(source, "utf8")}`)
  } else await copyFile(source, output)
}))

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
  "markup-ui-card.js": 3_000,
  "markup-ui-card.global.js": 3_000,
  "markup-ui-card.css": 2_500,
  "markup-ui-tag.js": 3_500,
  "markup-ui-tag.global.js": 3_500,
  "markup-ui-tag.css": 2_500,
  "markup-ui-badge.js": 2_500,
  "markup-ui-badge.global.js": 2_500,
  "markup-ui-badge.css": 2_000,
  "markup-ui-alert.js": 2_500,
  "markup-ui-alert.global.js": 2_500,
  "markup-ui-alert.css": 2_000,
  "markup-ui-empty.js": 2_500,
  "markup-ui-empty.global.js": 2_500,
  "markup-ui-empty.css": 1_500,
  "markup-ui-skeleton.js": 2_500,
  "markup-ui-skeleton.global.js": 2_500,
  "markup-ui-skeleton.css": 1_500,
  "markup-ui-spin.js": 3_500,
  "markup-ui-spin.global.js": 3_500,
  "markup-ui-spin.css": 2_000,
  "markup-ui-progress.js": 6_000,
  "markup-ui-progress.global.js": 6_000,
  "markup-ui-progress.css": 2_500,
  "markup-ui-statistic.js": 2_000,
  "markup-ui-statistic.global.js": 2_000,
  "markup-ui-statistic.css": 1_500,
  "markup-ui-typography.css": 2_500,
  "markup-ui-icon.css": 1_000,
  "markup-ui-gradient-text.css": 1_500,
  "markup-ui-ellipsis.css": 1_500,
  "markup-ui-page-header.css": 1_500,
  "markup-ui-divider.css": 1_500,
  "markup-ui-flex.css": 1_000,
  "markup-ui-space.css": 1_000,
  "markup-ui-grid.css": 1_500,
  "markup-ui-layout.css": 1_500,
  "markup-ui-list.css": 1_500,
  "markup-ui-descriptions.css": 1_500,
  "markup-ui-timeline.css": 1_500,
  "markup-ui-breadcrumb.css": 1_500,
  "markup-ui-thing.css": 1_000,
  "markup-ui-table.css": 1_500,
  "markup-ui-highlight.js": 2_000,
  "markup-ui-highlight.global.js": 2_000,
  "markup-ui-highlight.css": 750,
  "markup-ui-affix.css": 500,
  "markup-ui-result.css": 1_000,
  "markup-ui-code.css": 1_500,
  "markup-ui-scrollbar.css": 750,
  "markup-ui-float-button.css": 1_500,
  "markup-ui-image.js": 4_000,
  "markup-ui-image.global.js": 4_000,
  "markup-ui-image.css": 1_000,
  "markup-ui-popover.js": 4_000,
  "markup-ui-popover.global.js": 4_000,
  "markup-ui-popover.css": 1_000,
  "markup-ui-tooltip.js": 5_000,
  "markup-ui-tooltip.global.js": 5_000,
  "markup-ui-tooltip.css": 1_250,
  "markup-ui-popconfirm.js": 6_500,
  "markup-ui-popconfirm.global.js": 6_500,
  "markup-ui-popconfirm.css": 1_250,
  "markup-ui-dropdown.js": 9_000,
  "markup-ui-dropdown.global.js": 9_000,
  "markup-ui-dropdown.css": 1_750,
  "markup-ui-menu.js": 6_000,
  "markup-ui-menu.global.js": 6_000,
  "markup-ui-menu.css": 1_250,
  "markup-ui-tabs.js": 6_000,
  "markup-ui-tabs.global.js": 6_000,
  "markup-ui-tabs.css": 1_750,
  "markup-ui-collapse.js": 4_000,
  "markup-ui-collapse.global.js": 4_000,
  "markup-ui-collapse.css": 1_000,
  "markup-ui-anchor.js": 4_500,
  "markup-ui-anchor.global.js": 4_500,
  "markup-ui-anchor.css": 1_000,
  "markup-ui-back-top.js": 3_500,
  "markup-ui-back-top.global.js": 3_500,
  "markup-ui-back-top.css": 1_000,
  "markup-ui-pagination.js": 5_500,
  "markup-ui-pagination.global.js": 5_500,
  "markup-ui-pagination.css": 1_250,
  "markup-ui-steps.js": 4_000,
  "markup-ui-steps.global.js": 4_000,
  "markup-ui-steps.css": 1_250,
  "markup-ui-loading-bar.js": 3_500,
  "markup-ui-loading-bar.global.js": 3_500,
  "markup-ui-loading-bar.css": 1_250,
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
