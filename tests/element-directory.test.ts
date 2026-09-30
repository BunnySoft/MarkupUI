import { existsSync, readdirSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import { builtInElementNames } from "../src/components/elements.js"
import { advancedElementNames } from "../src/plugins/advanced.js"
import { widgetElementNames } from "../src/plugins/widgets.js"

const directory = readFileSync(resolve("docs/elements/05-element-index.md"), "utf8")
const inventory = readFileSync(resolve("docs/elements/03-inventory.md"), "utf8")
const apiFiles = readdirSync(resolve("demo/api")).filter(file => file.endsWith(".json")).sort()
const rows = [...directory.matchAll(/^\| \[([a-z-]+)\]\(([^)]+)\) \| ([^|]+) \|$/gm)]
const tags = (text: string): string[] => [...text.matchAll(/`(m-[a-z-]+)`/g)].map(match => match[1]!)

describe("public element directory", () => {
  it("keeps inventory families and declared companion names aligned with generated source", () => {
    const inventoryRows = [...inventory.matchAll(/^\| [^|]+ \| ([^|]+) \| \[Demo and API\]\(\.\.\/\.\.\/demo\/components\/([a-z-]+)\.html\)/gm)]
    expect(inventoryRows.map(row => `${row[2]}.json`).sort()).toEqual(apiFiles)
    for (const [, scope, family] of inventoryRows) {
      const api = JSON.parse(readFileSync(resolve("demo/api", `${family}.json`), "utf8"))
      const names = api.elements.map((element: { type: string }) => element.type)
      for (const [, name] of scope!.matchAll(/`([A-Z][A-Za-z]+)`/g)) expect(names, family).toContain(name)
    }
    for (const [family, companion] of [["list", "ListTemplate"], ["upload", "UploadFileList"]]) {
      expect(inventoryRows.find(row => row[2] === family)?.[1], family).toContain(`\`${companion}\``)
    }
  })

  it("lists exactly the source-generated families and their actual tags", () => {
    expect(rows.map(row => `${row[1]}.json`).sort()).toEqual(apiFiles)
    const allTags: string[] = []
    for (const [, family, link, listed] of rows) {
      const api = JSON.parse(readFileSync(resolve("demo/api", `${family}.json`), "utf8"))
      const expected = api.elements.map((element: { web: { primary: string } }) => element.web.primary)
      expect(tags(listed!), family).toEqual(expected)
      expect(link).toBe(`../../demo/components/${family}.html`)
      expect(existsSync(resolve("docs/elements", link!))).toBe(true)
      allTags.push(...expected)
    }
    expect(new Set(allTags).size).toBe(allTags.length)
    expect(directory).toContain(`**${rows.length} selectable families**`)
    expect(directory).toContain(`**${allTags.length} distinct tags**`)
  })

  it("keeps optional root tags separate from selectable families", () => {
    const root = directory.match(/^\| root \| ([^|]+) \|$/m)
    expect(root).not.toBeNull()
    expect(tags(root![1]!)).toEqual(builtInElementNames)
    expect(directory).toContain(`**${builtInElementNames.length} root-facade tags**`)
    const familyTags = new Set(rows.flatMap(row => tags(row[3]!)))
    expect(builtInElementNames.some(tag => familyTags.has(tag))).toBe(false)
  })

  it("lists the distinct optional plugin registrations", () => {
    const all = [...builtInElementNames, ...rows.flatMap(row => tags(row[3]!))]
    for (const [entry, names] of [["advanced", advancedElementNames], ["widgets", widgetElementNames]] as const) {
      const row = directory.split("\n").find(line => line.startsWith(`| ${entry} |`))
      expect(row).toBeDefined()
      expect(tags(row!).sort()).toEqual([...names].sort())
      all.push(...names)
    }
    expect(new Set(all).size).toBe(all.length)
    expect(directory).toContain(`**${advancedElementNames.length + widgetElementNames.length} optional plugin tags**`)
  })
})
