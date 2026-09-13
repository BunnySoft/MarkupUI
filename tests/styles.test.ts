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
  styles,
  normalizeLines,
  styleModule,
  themeModule,
  themeStylesheet,
  validateThemes,
} from "../scripts/styles.mjs"

const read = (path: string): string => readFileSync(resolve(path), "utf8")
const hash = (value: string): string => createHash("sha256").update(value).digest("hex")
const runtimeStyles = [builtInStyles, advancedStyles, widgetStyles]

describe("CSS and theme sources", () => {
  it("generates the checked-in runtime modules from standalone CSS", () => {
    styles.forEach((style, index) => {
      const css = read(style.css)
      expect(runtimeStyles[index]).toBe(normalizeLines(css))
      expect(normalizeLines(read(style.module))).toBe(styleModule(style, css))
    })
  })

  it("preserves the approved runtime CSS baselines exactly", () => {
    // Core includes Avatar/Button corrections; migrated Divider/Icon/Typography/Input/Checkbox/Radio/Switch/Select styles are family-owned.
    // Grid is family-owned; pending Layout hooks no longer override Grid's item alignment.
    // Widgets no longer includes competing Carousel/InputNumber styles; they ship with their canonical families.
    expect(runtimeStyles.map(hash)).toEqual([
      "0efd1ca1ed76246cb9f2ded7693206a14cd501bca40fb902f9a82f173d95fad6",
      "6fd15d4f89081eaad05bc6391936ead49357aa4bd990202327146d93811957fd",
      "4637afb81d2725d398c54c328378aacd8ac6ee2f8818085dc674c0532f089e07",
    ])
  })

  it("keeps approved built-in theme baselines and generated registrations in sync", () => {
    // Only the light Button text/border tokens changed in the rendered Button audit.
    expect(hash(JSON.stringify(builtInThemeTokens.light))).toBe("fee147d6edd693cb4f0b34eb79061c8546ec1a7050c155072e585addba435863")
    expect(hash(JSON.stringify(builtInThemeTokens.dark))).toBe("85c12e00ef529e54d1c8b07df9847d593dc053eae48b3880e1dcddcbef4d28eb")
    expect(builtInThemeTokens).toEqual(JSON.parse(read("src/theme/presets.json")))
    expect(normalizeLines(read("src/theme/presets.ts"))).toBe(themeModule(builtInThemeTokens))
  })

  it("retains native registration and inline-theme API behavior", () => {
    const styleCount = document.querySelectorAll("style").length
    const root = document.createElement("section")
    for (const name of ["light", "dark"] as const) {
      theme.apply(name, root)
      expect(theme.current(root)).toBe(name)
      for (const [key, value] of Object.entries(builtInThemeTokens[name])) {
        expect(root.style.getPropertyValue(`--m-${key}`)).toBe(value)
      }
    }
    expect(document.querySelectorAll("style")).toHaveLength(styleCount)
  })

  it("exports actual external CSS and CSS-only preset files", () => {
    const pkg = JSON.parse(read("package.json"))
    expect(pkg.exports["./style.css"]).toBe("./dist/markup-ui.css")
    expect(pkg.exports["./advanced/style.css"]).toBe("./dist/markup-ui-advanced.css")
    expect(pkg.exports["./widgets/style.css"]).toBe("./dist/markup-ui-widgets.css")
    expect(pkg.exports["./themes.css"]).toBe("./dist/markup-ui-themes.css")
    for (const style of styles) {
      expect(read(`dist/${style.output}`)).toBe(normalizeLines(read(style.css)))
    }
    expect(read("dist/markup-ui-themes.css")).toBe(themeStylesheet(builtInThemeTokens))
  })

  it("provides attribute-scoped presets with native color schemes and no global auto-theme", () => {
    const css = themeStylesheet(builtInThemeTokens)
    expect(css).toContain(':root[data-m-theme="dark"]')
    expect(css).toContain('[data-m-theme="light"]')
    expect(css).toContain("color-scheme: dark")
    expect(css).toContain("--m-bg-surface: #1c1c1f")
    expect(css).not.toContain("@import")
    expect(css).not.toMatch(/(?:^|\n)body\s*\{/)
    expect(css).not.toContain("localStorage")
  })

  it("accounts for one runtime format plus CSS without inventing runtimes for CSS-only scopes", () => {
    const manifest = JSON.parse(read("dist/manifest.json"))
    const input = manifest.componentPayloads.input
    expect(input.esm.totalGzipBytes).toBe(
      manifest.bundles["markup-ui-input.js"].gzipBytes + manifest.bundles["markup-ui-core.js"].gzipBytes + manifest.bundles["markup-ui-native-input.js"].gzipBytes + manifest.bundles["markup-ui-input.css"].gzipBytes,
    )
    expect(input.classic.totalGzipBytes).toBe(
      manifest.bundles["markup-ui-input.global.js"].gzipBytes + manifest.bundles["markup-ui-core.global.js"].gzipBytes + manifest.bundles["markup-ui-native-input.global.js"].gzipBytes + manifest.bundles["markup-ui-input.css"].gzipBytes,
    )
    expect(manifest.componentPayloads.typography.esm.dependencies).toEqual(["markup-ui-core.js"])
    expect(manifest.componentPayloads.typography.classic.dependencies).toEqual(["markup-ui-core.global.js"])
    expect(manifest.componentPayloads.typography.esm.runtimeGzipBytes).toBe(
      manifest.bundles["markup-ui-typography.js"].gzipBytes + manifest.bundles["markup-ui-core.js"].gzipBytes,
    )
    expect(manifest.componentPayloads.code.esm).toBeUndefined()
    expect(manifest.componentPayloads.list.classic).toBeUndefined()
    expect(manifest.componentPayloads.equation).toBeUndefined()
  })

  it("normalizes checkout line endings without changing CSS escapes", () => {
    const css = ':root {\r\n  --test: "\\\\a";\r\n}\r\n'
    const style = styles[0]
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
