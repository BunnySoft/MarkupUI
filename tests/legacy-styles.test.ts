import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import { builtInStyles } from "../src/components/styles.js"
import { advancedStyles } from "../src/plugins/advanced.styles.js"
import { widgetStyles } from "../src/plugins/widgets.styles.js"
import { builtInThemeTokens } from "../src/theme/presets.js"
import { theme } from "../src/theme/index.js"
import {
  legacyStyles,
  normalizeLines,
  styleModule,
  themeModule,
  themeStylesheet,
  validateThemes,
} from "../scripts/legacy-styles.mjs"

const read = (path: string): string => readFileSync(resolve(path), "utf8")
const hash = (value: string): string => createHash("sha256").update(value).digest("hex")
const runtimeStyles = [builtInStyles, advancedStyles, widgetStyles]

describe("canonical legacy CSS and theme sources", () => {
  it("generates the checked-in compatibility modules from standalone CSS", () => {
    legacyStyles.forEach((style, index) => {
      const css = read(style.css)
      expect(runtimeStyles[index]).toBe(normalizeLines(css))
      expect(normalizeLines(read(style.module))).toBe(styleModule(style, css))
    })
  })

  it("preserves the pre-extraction runtime CSS exactly", () => {
    // These baselines protect the legacy visual contract during source separation.
    expect(runtimeStyles.map(hash)).toEqual([
      "9f62233fa6a57d57682110d9d487a7569d79ead4cb398af24df27b6422308d29",
      "191b9b19d5ab85393ddfa50a537b911133685fb87304c71b6c0eb478c1b9c1e7",
      "2eef3afb63382e8a64c34740c6d9afec38b552640239d2e9e19fac7b6d33c24d",
    ])
  })

  it("keeps all built-in theme tokens identical to the legacy registrations", () => {
    expect(hash(JSON.stringify(builtInThemeTokens.light))).toBe("207e2b0aabc35c662ee89d1d35258d13c37d6023f15bf47218dd15b6fb9d0f31")
    expect(hash(JSON.stringify(builtInThemeTokens.dark))).toBe("85c12e00ef529e54d1c8b07df9847d593dc053eae48b3880e1dcddcbef4d28eb")
    expect(builtInThemeTokens).toEqual(JSON.parse(read("src/theme/presets.json")))
    expect(normalizeLines(read("src/theme/presets.ts"))).toBe(themeModule(builtInThemeTokens))
  })

  it("retains native registration and inline-theme API behavior", () => {
    const root = document.createElement("section")
    for (const name of ["light", "dark"] as const) {
      theme.apply(name, root)
      expect(theme.current(root)).toBe(name)
      for (const [key, value] of Object.entries(builtInThemeTokens[name])) {
        expect(root.style.getPropertyValue(`--mui-${key}`)).toBe(value)
      }
    }
    expect(document.querySelector('style[data-legacy-generated]')).toBeNull()
  })

  it("exports actual external CSS and CSS-only preset files", () => {
    const pkg = JSON.parse(read("package.json"))
    expect(pkg.exports["./style.css"]).toBe("./dist/markup-ui.css")
    expect(pkg.exports["./advanced/style.css"]).toBe("./dist/markup-ui-advanced.css")
    expect(pkg.exports["./widgets/style.css"]).toBe("./dist/markup-ui-widgets.css")
    expect(pkg.exports["./themes.css"]).toBe("./dist/markup-ui-themes.css")
    for (const style of legacyStyles) {
      expect(read(`dist/${style.output}`)).toBe(normalizeLines(read(style.css)))
    }
    expect(read("dist/markup-ui-themes.css")).toBe(themeStylesheet(builtInThemeTokens))
  })

  it("provides attribute-scoped presets with native color schemes and no global auto-theme", () => {
    const css = themeStylesheet(builtInThemeTokens)
    expect(css).toContain(':root[data-mui-theme="dark"]')
    expect(css).toContain('[data-mui-theme="light"]')
    expect(css).toContain("color-scheme: dark")
    expect(css).toContain("--mui-bg-surface: #1c1c1f")
    expect(css).not.toContain("@import")
    expect(css).not.toMatch(/(?:^|\n)body\s*\{/)
    expect(css).not.toContain("localStorage")
  })

  it("accounts for one runtime format plus CSS without inventing runtimes for CSS-only scopes", () => {
    const manifest = JSON.parse(read("dist/manifest.json"))
    const input = manifest.componentPayloads.input
    expect(input.esm.totalGzipBytes).toBe(
      manifest.bundles["markup-ui-input.js"].gzipBytes + manifest.bundles["markup-ui-input.css"].gzipBytes,
    )
    expect(input.classic.totalGzipBytes).toBe(
      manifest.bundles["markup-ui-input.global.js"].gzipBytes + manifest.bundles["markup-ui-input.css"].gzipBytes,
    )
    expect(manifest.componentPayloads.typography.esm).toBeUndefined()
    expect(manifest.componentPayloads.typography.classic).toBeUndefined()
    expect(manifest.componentPayloads.equation).toBeUndefined()
  })

  it("normalizes checkout line endings without changing CSS escapes", () => {
    const css = ':root {\r\n  --test: "\\\\a";\r\n}\r\n'
    const style = legacyStyles[0]
    expect(styleModule(style, css)).toBe(styleModule(style, normalizeLines(css)))
    expect(normalizeLines(css)).toContain('"\\\\a"')
  })

  it("rejects malformed generated palette keys and values instead of emitting CSS", () => {
    expect(() => validateThemes(null)).toThrow(TypeError)
    expect(() => validateThemes({ light: {}, dark: {}, other: {} })).toThrow(TypeError)
    expect(() => validateThemes({ light: [], dark: {} })).toThrow(TypeError)
    expect(() => validateThemes({ light: { "bad:key": "red" }, dark: {} })).toThrow(TypeError)
    expect(() => validateThemes({ light: { color: "red; } body {" }, dark: {} })).toThrow(TypeError)
    expect(() => validateThemes({ light: { color: 1 }, dark: {} })).toThrow(TypeError)
  })
})
