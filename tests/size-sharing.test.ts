// @vitest-environment node
import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { expect, it } from "vitest"

it("measures explicit sharing without modifying shipped artifacts or the frozen baseline", () => {
  const files = ["dist/manifest.json", ".vite/size/build.json", "docs/architecture/size-baseline.json"]
  const before = files.map(file => readFileSync(file, "utf8"))
  execFileSync(process.execPath, ["scripts/size-sharing.mjs"], { stdio: "pipe" })
  expect(files.map(file => readFileSync(file, "utf8"))).toEqual(before)
  const report = JSON.parse(readFileSync(".vite/size/sharing.json", "utf8"))
  expect(report.results).toHaveLength(12)
  for (const result of report.results) {
    expect(result.families.length).toBeGreaterThan(1)
    expect(result.sharedSize.gzipBytes).toBeGreaterThan(0)
    expect(result.selections.grid.after).toBe(result.selections.grid.before + result.selections.grid.delta)
    expect(result.accepted).toBe(result.families.every((family: { passes: boolean }) => family.passes) && result.totalDelta < 0)
  }
}, 30_000)
