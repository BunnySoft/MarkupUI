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
const components = ["avatar", "button", "card", "tag", "badge", "alert", "empty", "skeleton", "spin", "progress", "statistic", "highlight", "image", "popover", "tooltip", "popconfirm", "dropdown", "menu", "tabs", "collapse", "anchor", "back-top", "pagination", "steps", "loading-bar", "dialog", "modal", "drawer", "message", "notification", "collapse-transition", "input", "checkbox", "radio", "switch", "select", "input-number", "slider", "rate", "form"]
const classicEntries = { progress: "global.ts", popover: "global.ts", tooltip: "global.ts", popconfirm: "global.ts", dropdown: "global.ts", menu: "global.ts", tabs: "global.ts", collapse: "global.ts", anchor: "global.ts", "back-top": "global.ts", pagination: "global.ts", steps: "global.ts", "loading-bar": "global.ts", dialog: "global.ts", modal: "global.ts", drawer: "global.ts", message: "global.ts", notification: "global.ts", "collapse-transition": "global.ts", input: "global.ts", checkbox: "global.ts", radio: "global.ts", switch: "global.ts", select: "global.ts", "input-number": "global.ts", slider: "global.ts", rate: "global.ts" }
const styleOnlyComponents = ["typography", "icon", "gradient-text", "ellipsis", "page-header", "divider", "flex", "space", "grid", "layout", "list", "descriptions", "timeline", "breadcrumb", "thing", "table", "affix", "result", "code", "scrollbar", "float-button", "global-style"]
classicEntries.form = "global.ts"
components.push("auto-complete")
classicEntries["auto-complete"] = "global.ts"
components.push("input-otp")
classicEntries["input-otp"] = "global.ts"
components.push("dynamic-input")
classicEntries["dynamic-input"] = "global.ts"
components.push("dynamic-tags")
classicEntries["dynamic-tags"] = "global.ts"
components.push("mention")
classicEntries.mention = "global.ts"
components.push("color-picker")
classicEntries["color-picker"] = "global.ts"
components.push("date-picker")
classicEntries["date-picker"] = "global.ts"
components.push("time-picker")
classicEntries["time-picker"] = "global.ts"
components.push("virtual-list")
classicEntries["virtual-list"] = "global.ts"
components.push("tree")
classicEntries.tree = "global.ts"
components.push("cascader")
classicEntries.cascader = "global.ts"
components.push("tree-select")
classicEntries["tree-select"] = "global.ts"
components.push("transfer")
classicEntries.transfer = "global.ts"
components.push("data-table")
classicEntries["data-table"] = "global.ts"
components.push("log")
classicEntries.log = "global.ts"
components.push("infinite-scroll")
classicEntries["infinite-scroll"] = "global.ts"
components.push("popselect")
classicEntries.popselect = "global.ts"
components.push("split")
classicEntries.split = "global.ts"
components.push("carousel")
classicEntries.carousel = "global.ts"
components.push("watermark")
classicEntries.watermark = "global.ts"

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
  } else if (name === "dialog" || name === "modal" || name === "drawer") {
    const base = await readFile(resolve(root, "src", "components", "dialog", "native.css"), "utf8")
    await writeFile(output, `${base}\n${await readFile(source, "utf8")}`)
  } else if (name === "message" || name === "notification") {
    const base = await readFile(resolve(root, "src", "components", "feedback", "feedback.css"), "utf8")
    await writeFile(output, `${base}\n${await readFile(source, "utf8")}`)
  } else if (name === "data-table") {
    const base = await readFile(resolve(root, "src", "components", "table", "table.css"), "utf8")
    await writeFile(output, `${base}\n${await readFile(source, "utf8")}`)
  } else if (name === "log") {
    const base = await readFile(resolve(root, "src", "components", "code", "code.css"), "utf8")
    await writeFile(output, `${base}\n${await readFile(source, "utf8")}`)
  } else if (name === "popselect") {
    const popover = await readFile(resolve(root, "src", "components", "popover", "popover.css"), "utf8")
    const select = await readFile(resolve(root, "src", "components", "select", "select.css"), "utf8")
    await writeFile(output, `${popover}\n${select}\n${await readFile(source, "utf8")}`)
  } else await copyFile(source, output)
}))

const packageJson = JSON.parse(await readFile(resolve(root, "package.json"), "utf8"))
const bundleBudgets = {
  "markup-ui-watermark.js": 7_000,
  "markup-ui-watermark.global.js": 7_000,
  "markup-ui-watermark.css": 1_000,
  "markup-ui-carousel.js": 7_000,
  "markup-ui-carousel.global.js": 7_000,
  "markup-ui-carousel.css": 1_500,
  "markup-ui-global-style.css": 500,
  "markup-ui-split.js": 8_000,
  "markup-ui-split.global.js": 8_000,
  "markup-ui-split.css": 1_500,
  "markup-ui-popselect.js": 10_000,
  "markup-ui-popselect.global.js": 10_000,
  "markup-ui-popselect.css": 2_500,
  "markup-ui-infinite-scroll.js": 7_000,
  "markup-ui-infinite-scroll.global.js": 7_000,
  "markup-ui-infinite-scroll.css": 1_000,
  "markup-ui-log.js": 6_000,
  "markup-ui-log.global.js": 6_000,
  "markup-ui-log.css": 1_750,
  "markup-ui-data-table.js": 9_000,
  "markup-ui-data-table.global.js": 9_000,
  "markup-ui-data-table.css": 2_000,
  "markup-ui-transfer.js": 8_000,
  "markup-ui-transfer.global.js": 8_000,
  "markup-ui-transfer.css": 1_250,
  "markup-ui-tree-select.js": 9_000,
  "markup-ui-tree-select.global.js": 9_000,
  "markup-ui-tree-select.css": 1_250,
  "markup-ui-cascader.js": 10_000,
  "markup-ui-cascader.global.js": 10_000,
  "markup-ui-cascader.css": 1_250,
  "markup-ui-tree.js": 9_000,
  "markup-ui-tree.global.js": 9_000,
  "markup-ui-tree.css": 1_250,
  "markup-ui-virtual-list.js": 5_000,
  "markup-ui-virtual-list.global.js": 5_000,
  "markup-ui-virtual-list.css": 1_000,
  "markup-ui-time-picker.js": 4_000,
  "markup-ui-time-picker.global.js": 4_000,
  "markup-ui-time-picker.css": 1_000,
  "markup-ui-date-picker.js": 4_500,
  "markup-ui-date-picker.global.js": 4_500,
  "markup-ui-date-picker.css": 1_000,
  "markup-ui-color-picker.js": 4_500,
  "markup-ui-color-picker.global.js": 4_500,
  "markup-ui-color-picker.css": 1_000,
  "markup-ui-mention.js": 6_500,
  "markup-ui-mention.global.js": 6_500,
  "markup-ui-mention.css": 1_250,
  "markup-ui-dynamic-tags.js": 10_000,
  "markup-ui-dynamic-tags.global.js": 10_000,
  "markup-ui-dynamic-tags.css": 1_500,
  "markup-ui-dynamic-input.js": 6_500,
  "markup-ui-dynamic-input.global.js": 6_500,
  "markup-ui-dynamic-input.css": 1_000,
  "markup-ui-input-otp.js": 3_000,
  "markup-ui-input-otp.global.js": 3_000,
  "markup-ui-input-otp.css": 1_000,
  "markup-ui-auto-complete.js": 4_500,
  "markup-ui-auto-complete.global.js": 4_500,
  "markup-ui-auto-complete.css": 1_000,
  "markup-ui-form.js": 5_000,
  "markup-ui-form.global.js": 5_000,
  "markup-ui-form.css": 1_250,
  "markup-ui-rate.js": 4_000,
  "markup-ui-rate.global.js": 4_000,
  "markup-ui-rate.css": 1_500,
  "markup-ui-slider.js": 3_500,
  "markup-ui-slider.global.js": 3_500,
  "markup-ui-slider.css": 1_000,
  "markup-ui-input-number.js": 3_500,
  "markup-ui-input-number.global.js": 3_500,
  "markup-ui-input-number.css": 1_000,
  "markup-ui-select.js": 4_000,
  "markup-ui-select.global.js": 4_000,
  "markup-ui-select.css": 1_000,
  "markup-ui-switch.js": 3_500,
  "markup-ui-switch.global.js": 3_500,
  "markup-ui-switch.css": 1_250,
  "markup-ui-radio.js": 3_000,
  "markup-ui-radio.global.js": 3_000,
  "markup-ui-radio.css": 1_250,
  "markup-ui-checkbox.js": 3_500,
  "markup-ui-checkbox.global.js": 3_500,
  "markup-ui-checkbox.css": 1_000,
  "markup-ui-input.js": 4_000,
  "markup-ui-input.global.js": 4_000,
  "markup-ui-input.css": 1_750,
  "markup-ui-collapse-transition.js": 4_500,
  "markup-ui-collapse-transition.global.js": 4_500,
  "markup-ui-collapse-transition.css": 750,
  "markup-ui-notification.js": 6_500,
  "markup-ui-notification.global.js": 6_500,
  "markup-ui-notification.css": 2_000,
  "markup-ui-message.js": 6_000,
  "markup-ui-message.global.js": 6_000,
  "markup-ui-message.css": 1_750,
  "markup-ui-drawer.js": 4_750,
  "markup-ui-drawer.global.js": 4_750,
  "markup-ui-drawer.css": 1_500,
  "markup-ui-modal.js": 4_000,
  "markup-ui-modal.global.js": 4_000,
  "markup-ui-modal.css": 1_250,
  "markup-ui-dialog.js": 5_500,
  "markup-ui-dialog.global.js": 5_500,
  "markup-ui-dialog.css": 1_500,
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
