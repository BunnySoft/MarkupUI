import assert from "node:assert/strict"
import { spawn } from "node:child_process"
import { mkdir, writeFile } from "node:fs/promises"
import { resolve } from "node:path"
import { chromium, firefox, webkit } from "playwright"

const output = resolve(".vite/browser")
await mkdir(output, { recursive: true })
const server = spawn(process.execPath, ["demo/server.mjs"], {
  env: { ...process.env, PORT: "0" }, windowsHide: true, stdio: ["ignore", "pipe", "pipe"],
})
const results = []
try {
  const origin = await new Promise((resolveOrigin, reject) => {
    const timeout = setTimeout(() => reject(new Error("Demo server did not start.")), 10_000)
    server.once("error", reject)
    server.once("exit", code => { clearTimeout(timeout); reject(new Error(`Demo server exited (${code}).`)) })
    server.stdout.on("data", chunk => {
      const match = String(chunk).match(/http:\/\/localhost:\d+/)
      if (match) { clearTimeout(timeout); resolveOrigin(match[0]) }
    })
    server.stderr.on("data", chunk => process.stderr.write(chunk))
  })
  for (const [name, engine] of Object.entries({ chromium, firefox, webkit })) {
    console.log(`Starting ${name}`)
    const browser = await engine.launch({ headless: true, timeout: 30_000 })
    try {
      for (const [layout, viewport] of Object.entries({ desktop: { width: 1280, height: 900 }, mobile: { width: 375, height: 812 } })) {
        const context = await browser.newContext({ viewport, reducedMotion: "reduce" })
        context.setDefaultTimeout(15_000)
        try {
          const page = await context.newPage()
          const errors = []
          page.on("pageerror", error => errors.push(error.message))
          const start = performance.now()
          await page.goto(`${origin}/demo/components/chart.html`)
          await page.waitForFunction(() => document.querySelectorAll("m-chart").length === 6 && [...document.querySelectorAll("m-chart")].every(chart => chart.state === "ready"), null, { timeout: 20_000 })
          await page.waitForFunction(() => [...document.querySelectorAll("m-chart")].every(chart => {
            const svg = chart.native.querySelector("svg")
            return svg && Math.abs(Number(svg.getAttribute("width")) - chart.native.clientWidth) <= 1
          }))
          const readyMs = performance.now() - start
          const geometry = await page.locator("m-chart").evaluateAll(charts => charts.map(chart => ({
            width: chart.native.clientWidth, height: chart.native.clientHeight,
            paths: chart.native.querySelectorAll("svg path").length,
          })))
          assert(geometry.every(chart => chart.width > 0 && chart.height > 0 && chart.paths > 0), `${name}/${layout}: blank SVG`)
          assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${name}/${layout}: horizontal page overflow`)
          await page.screenshot({ path: resolve(output, `${name}-${layout}-chart.png`) })
          await page.getByRole("button", { name: "Update revenue", exact: true }).click()
          await page.waitForFunction(() => document.querySelector("#bound-chart m-chart-dataset").source[0].sales === 160 && document.querySelector("#bound-chart").state === "ready")
          await page.getByRole("button", { name: "Reload data", exact: true }).click()
          await page.waitForFunction(() => document.querySelector("#remote-chart").state === "ready")

          const first = page.locator('m-chart[aria-label="Monthly sales and costs"]')
          await first.evaluate(chart => {
            chart.addEventListener("m:chart-select", event => { chart.dataset.selected = String(event.detail.dataIndex) }, { once: true })
          })
          const bar = first.locator('svg path').filter({ visible: true })
          const target = await bar.evaluateAll(paths => paths.findIndex(path => {
            const box = path.getBoundingClientRect()
            return path.getAttribute("fill") !== "none" && box.width > 20 && box.height > 50
          }))
          assert(target >= 0, `${name}/${layout}: missing selectable bar`)
          await bar.nth(target).click()
          await page.waitForFunction(() => document.querySelector('m-chart[aria-label="Monthly sales and costs"]').dataset.selected !== undefined)
          await first.evaluate(chart => { chart.hidden = true; chart.renderer = "canvas" })
          await first.evaluate(chart => { chart.hidden = false })
          await page.waitForFunction(() => document.querySelector('m-chart[aria-label="Monthly sales and costs"]').state === "ready" && document.querySelector('m-chart[aria-label="Monthly sales and costs"] canvas'))
          const colored = await first.evaluate(chart => {
            let count = 0
            for (const canvas of chart.native.querySelectorAll("canvas")) {
              const pixels = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height).data
              for (let i = 0; i < pixels.length; i += 4) if (pixels[i + 3] > 0 && Math.max(pixels[i], pixels[i + 1], pixels[i + 2]) - Math.min(pixels[i], pixels[i + 1], pixels[i + 2]) > 30) count++
            }
            return count
          })
          assert(colored > 100, `${name}/${layout}: blank Canvas`)
          await first.evaluate(chart => { chart.theme = "dark"; chart.renderer = "svg" })
          await page.waitForFunction(() => document.querySelector('m-chart[aria-label="Monthly sales and costs"]').state === "ready")
          await first.locator(":scope > details > summary").focus()
          await page.keyboard.press("Enter")
          assert(await first.locator(":scope > details").evaluate(details => details.open), `${name}/${layout}: inaccessible data disclosure`)

          let performanceSample
          if (layout === "desktop") {
            const cdp = name === "chromium" ? await context.newCDPSession(page) : null
            const memory = async () => {
              if (!cdp) return undefined
              await cdp.send("HeapProfiler.collectGarbage")
              return { ...await cdp.send("Memory.getDOMCounters"), ...await cdp.send("Runtime.getHeapUsage") }
            }
            const runCycles = count => page.evaluate(async count => {
              const rows = Array.from({ length: 10_000 }, (_, index) => [index, Math.sin(index / 100)])
              let mountMs = 0, updateMs = 0
              const begin = performance.now()
              for (let i = 0; i < count; i++) {
                const chart = document.createElement("m-chart")
                chart.setAttribute("aria-label", "Performance sample")
                chart.tableSource = rows
                chart.option = {
                  dataset: { source: rows, sourceHeader: false },
                  xAxis: { type: "value" }, yAxis: { type: "value" },
                  series: [{ type: "line", showSymbol: false, encode: { x: 0, y: 1 } }],
                }
                const mountStart = performance.now()
                document.body.append(chart)
                await Promise.resolve()
                if (chart.state !== "ready") throw chart.error ?? new Error("Performance chart did not render")
                mountMs += performance.now() - mountStart
                const updateStart = performance.now()
                chart.refresh()
                updateMs += performance.now() - updateStart
                chart.remove()
                if (chart.native.childElementCount) throw new Error("Disposed renderer retained its DOM")
              }
              return { rows: rows.length, cycles: count, totalMs: Math.round(performance.now() - begin), averageMountMs: Math.round(mountMs / count), averageUpdateMs: Math.round(updateMs / count) }
            }, count)
            await runCycles(2)
            const before = await memory()
            performanceSample = { ...await runCycles(20), memoryBefore: before, memoryAfter: await memory() }
            await cdp?.detach()
          }

          await page.goto(`${origin}/demo/components/box.html`)
          await page.getByText("Report name", { exact: true }).click()
          assert(await page.getByLabel("Report name", { exact: true }).evaluate(control => control === document.activeElement), `${name}/${layout}: portable label did not focus input`)
          const summary = page.locator("m-details > details > summary").filter({ hasText: "Report details" })
          await summary.focus()
          await page.keyboard.press("Enter")
          assert(await summary.evaluate(node => node.parentElement.open), `${name}/${layout}: disclosure keyboard activation failed`)
          await page.keyboard.press("Space")
          assert.equal(await summary.evaluate(node => node.parentElement.open), false)
          assert.deepEqual(errors, [], `${name}/${layout}: browser errors`)
          results.push({ browser: name, version: browser.version(), layout, readyMs: Math.round(readyMs), charts: geometry, canvasColoredPixels: colored, performance: performanceSample })
          console.log(`${name} ${browser.version()} ${layout}: passed (${Math.round(readyMs)} ms to six ready charts)`)
        } finally { await context.close() }
      }
    } finally { await browser.close() }
  }
  await writeFile(resolve(output, "results.json"), JSON.stringify({ date: new Date().toISOString(), results }, null, 2))
} finally {
  server.kill()
  await new Promise(resolveExit => {
    if (server.exitCode !== null || server.signalCode !== null) resolveExit()
    else server.once("exit", resolveExit)
  })
}
