import { readFile, writeFile } from "node:fs/promises"
import { resolve } from "node:path"

export const legacyStyles = [
  { css: "src/components/styles.css", module: "src/components/styles.ts", name: "builtInStyles", output: "markup-ui.css" },
  { css: "src/plugins/advanced.css", module: "src/plugins/advanced.styles.ts", name: "advancedStyles", output: "markup-ui-advanced.css" },
  { css: "src/plugins/widgets.css", module: "src/plugins/widgets.styles.ts", name: "widgetStyles", output: "markup-ui-widgets.css" },
]

export function normalizeLines(value) {
  return value.replace(/\r\n?/g, "\n")
}

export function styleModule(style, css) {
  return `// Generated from ${style.css} by scripts/legacy-styles.mjs. Edit the CSS source.\nexport const ${style.name} = ${JSON.stringify(normalizeLines(css))}\n`
}

export function validateThemes(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)
    || Object.keys(value).sort().join(",") !== "dark,light") {
    throw new TypeError("Built-in themes must contain exactly light and dark token maps.")
  }
  for (const [name, tokens] of Object.entries(value)) {
    if (!tokens || typeof tokens !== "object" || Array.isArray(tokens)) {
      throw new TypeError(`Theme '${name}' must be a token map.`)
    }
    for (const [key, token] of Object.entries(tokens)) {
      if (!/^[a-z][a-z0-9-]*$/.test(key) || typeof token !== "string"
        || token.length === 0 || /[;{}\r\n]/.test(token)) {
        throw new TypeError(`Invalid built-in theme token '${name}.${key}'.`)
      }
    }
  }
  return value
}

export function themeModule(themes) {
  return `// Generated from src/theme/presets.json by scripts/legacy-styles.mjs. Edit the JSON source.\nexport const builtInThemeTokens = ${JSON.stringify(validateThemes(themes), null, 2)}\n`
}

export function themeStylesheet(themes) {
  validateThemes(themes)
  return ["light", "dark"].map(name => {
    const tokens = Object.entries(themes[name]).map(([key, value]) => `  --mui-${key}: ${value};`)
    return `[data-mui-theme="${name}"],\n:root[data-mui-theme="${name}"] {\n  color-scheme: ${name};\n${tokens.join("\n")}\n}\n`
  }).join("\n")
}

async function writeChanged(path, content) {
  let current
  try {
    current = await readFile(path, "utf8")
  } catch (error) {
    if (!(error instanceof Error) || !("code" in error) || error.code !== "ENOENT") throw error
  }
  if (current === undefined || normalizeLines(current) !== content) await writeFile(path, content)
}

export async function generateLegacyStyleModules(root) {
  for (const style of legacyStyles) {
    const css = await readFile(resolve(root, style.css), "utf8")
    await writeChanged(resolve(root, style.module), styleModule(style, css))
  }
  const themes = JSON.parse(await readFile(resolve(root, "src/theme/presets.json"), "utf8"))
  await writeChanged(resolve(root, "src/theme/presets.ts"), themeModule(themes))
}

export async function emitLegacyStylesheets(root, dist) {
  for (const style of legacyStyles) {
    const css = normalizeLines(await readFile(resolve(root, style.css), "utf8"))
    await writeFile(resolve(dist, style.output), css)
  }
  const themes = JSON.parse(await readFile(resolve(root, "src/theme/presets.json"), "utf8"))
  await writeFile(resolve(dist, "markup-ui-themes.css"), themeStylesheet(themes))
}
