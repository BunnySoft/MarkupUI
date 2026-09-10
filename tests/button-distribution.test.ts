import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { gzipSync } from "node:zlib"
import { describe, expect, it } from "vitest"

describe("Button CSS distribution", () => {
  it("ships the whitespace-only transform and accounts for its actual payload", () => {
    const expected = execFileSync(process.execPath, ["-e", `
      const fs = require("node:fs"), { transformSync } = require("esbuild");
      process.stdout.write(transformSync(fs.readFileSync("src/components/button/button.css", "utf8"), {
        loader: "css", minifyWhitespace: true, minifySyntax: false, legalComments: "none"
      }).code);
    `], { encoding: "utf8" })
    const actual = readFileSync("dist/markup-ui-button.css")
    const manifest = JSON.parse(readFileSync("dist/manifest.json", "utf8"))
    const gzipBytes = gzipSync(actual, { level: 9 }).length
    expect(actual.toString()).toBe(expected)
    expect(gzipBytes).toBeLessThanOrEqual(2500)
    expect(manifest.bundles["markup-ui-button.css"]).toEqual({
      bytes: actual.length, gzipBytes, budget: 2500,
    })
  })

  it("does not normalize unrelated standalone CSS", () => {
    expect(readFileSync("dist/markup-ui-avatar.css", "utf8"))
      .toBe(readFileSync("src/components/avatar/avatar.css", "utf8"))
  })
})
