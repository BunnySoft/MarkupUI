import assert from "node:assert/strict"
import { spawn } from "node:child_process"
import { mkdir, writeFile } from "node:fs/promises"
import { resolve } from "node:path"
import { chromium, firefox, webkit } from "playwright"
import { components } from "../demo/catalog.js"

const engines = { chromium, firefox, webkit }
const selectedBrowser = process.argv.find(arg => arg.startsWith("--browser="))?.slice("--browser=".length)
if (selectedBrowser) assert(Object.hasOwn(engines, selectedBrowser), `Unknown browser: ${selectedBrowser}`)
const selectedPage = process.argv.find(arg => arg.startsWith("--page="))?.slice("--page=".length)
if (selectedPage) assert(components.some(component => component.slug === selectedPage), `Unknown page: ${selectedPage}`)
const output = resolve(".vite/browser")
await mkdir(output, { recursive: true })
const server = spawn(process.execPath, ["demo/server.mjs"], {
  env: { ...process.env, PORT: "0" }, windowsHide: true, stdio: ["ignore", "pipe", "pipe"],
})
const results = []
const catalogResults = []
async function verifyExternalChartEngine(page, origin, mode) {
  const url = `${origin}/demo/chart-engine-${mode}-check.html`
  await page.route(url, route => route.fulfill({
    contentType: "text/html",
    body: '<!doctype html><meta name="viewport" content="width=device-width"><title>External chart engine</title><link rel="stylesheet" href="/dist/markup-ui-chart.css"><body></body>',
  }))
  const requests = []
  const record = request => requests.push(request.url())
  page.on("request", record)
  try {
    await page.goto(url)
    if (mode === "classic") {
      for (const entry of ["core", "chart-renderer", "chart"]) {
        await page.addScriptTag({ url: `${origin}/dist/markup-ui-${entry}.global.js` })
      }
    } else await page.evaluate(() => import("/dist/markup-ui-chart.js"))
    const missing = await page.evaluate(() => {
      const chart = document.createElement("m-chart")
      chart.id = "external-chart"
      chart.setAttribute("aria-label", "External engine sample")
      chart.tableSource = [["x", "y"], ["A", 2], ["B", 4]]
      chart.option = {
        dataset: { source: chart.tableSource },
        xAxis: { type: "category" }, yAxis: { type: "value" },
        series: [{ type: "bar" }],
      }
      let reportedError
      chart.addEventListener("m:chart-error", event => { reportedError = event.detail.error.message })
      document.body.append(chart)
      chart.refresh()
      return { state: chart.state, error: chart.error?.message, event: reportedError }
    })
    assert.equal(missing.state, "error")
    assert.match(missing.error, /configureChartEngine/)
    assert.equal(missing.event, missing.error)
    assert(!requests.some(url => /echarts|vendor|cdn/.test(url)), "Missing engine must not trigger a download")
    if (mode === "classic") {
      await page.addScriptTag({ url: `${origin}/demo/vendor/echarts.global.js` })
      await page.evaluate(() => {
        MarkupUIChart.configureChartEngine(echarts)
        document.getElementById("external-chart").refresh()
      })
    } else await page.evaluate(async () => {
      const echarts = await import("/demo/vendor/echarts.js")
      const { configureChartEngine } = await import("/dist/markup-ui-chart.js")
      configureChartEngine(echarts)
      document.getElementById("external-chart").refresh()
    })
    await page.waitForFunction(() => {
      const chart = document.getElementById("external-chart")
      return chart.state === "ready" && chart.native.querySelectorAll("svg path").length > 0
    })
    assert.equal(await page.locator("#external-chart").evaluate(chart => chart.error), null)
    await page.locator("#external-chart").evaluate(chart => {
      chart.remove()
      if (chart.native.childElementCount) throw new Error("External engine retained disposed DOM")
    })
  } finally { page.off("request", record) }
}
async function verifyPlugins(page, origin, name, layout) {
  await page.goto(`${origin}/demo/components/plugins.html`)
  const sort = page.getByRole("button", { name: "Score", exact: true })
  await sort.waitFor()
  await sort.focus()
  await page.keyboard.press("Enter")
  assert.equal(await page.locator("#scores tbody tr:first-child td:last-child").textContent(), "2")
  assert.equal(await sort.evaluate(element => document.activeElement === element), true)
  await page.keyboard.press("Space")
  assert.equal(await page.locator("#scores th[aria-sort=descending]").textContent(), "Score")
  assert.equal(await page.locator("#grid-status").textContent(), "score: desc")
  await page.getByRole("button", { name: "Replace rows", exact: true }).click()
  assert.equal(await page.locator("#scores tbody tr:first-child td:last-child").textContent(), "25")
  await page.getByRole("button", { name: "Toggle score column", exact: true }).click()
  await page.waitForFunction(() => document.querySelectorAll("#scores th").length === 1)
  await page.getByRole("button", { name: "Toggle score column", exact: true }).click()
  await sort.waitFor()
  await page.getByRole("button", { name: "Reconnect grid", exact: true }).click()
  await sort.focus()
  await page.keyboard.press("Enter")
  assert.equal(await page.locator("#scores tbody tr:first-child td:last-child").textContent(), "4")
  assert.equal(await page.locator("#grid-note").textContent(), "Team scores")
  assert.equal(await page.locator("#scores table").count(), 1)
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${name}/${layout}: plugin overflow`)
  await page.locator("#scores").scrollIntoViewIfNeeded()
  await page.screenshot({ path: resolve(output, `${name}-${layout}-plugins.png`) })
  const score = page.getByRole("button", { name: "4 of 5", exact: true })
  await score.focus()
  await page.keyboard.press("Space")
  assert.equal(await score.getAttribute("aria-pressed"), "true")
  assert.equal(await score.evaluate(element => document.activeElement === element), true)
  assert.equal(await page.locator("#rating-status").textContent(), "Score 4; user changes: 1")
  await page.keyboard.press("Enter")
  assert.equal(await page.locator("#rating-status").textContent(), "Score 4; user changes: 1")
  await page.getByRole("button", { name: "Set score to 2", exact: true }).click()
  assert.equal(await page.getByRole("button", { name: "2 of 5", exact: true }).getAttribute("aria-pressed"), "true")
  assert.equal(await page.locator("#rating-status").textContent(), "Score 4; user changes: 1")
  await page.getByRole("button", { name: "Toggle disabled", exact: true }).click()
  assert.equal(await score.isDisabled(), true)
  await page.getByRole("button", { name: "Toggle disabled", exact: true }).click()
  await page.getByRole("button", { name: "Toggle maximum", exact: true }).click()
  assert.equal(await page.locator('#review-score button[data-part="score"]').count(), 3)
  await page.getByRole("button", { name: "Reconnect rating", exact: true }).click()
  await page.getByRole("button", { name: "3 of 3", exact: true }).focus()
  await page.keyboard.press("Enter")
  assert.equal(await page.locator("#rating-status").textContent(), "Score 3; user changes: 2")
  assert.equal(await page.locator("#rating-note").textContent(), "Review:")
  assert.equal(await page.locator("#review-score").getAttribute("role"), "group")
  await page.locator("#review-score").scrollIntoViewIfNeeded()
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${name}/${layout}: rating overflow`)
  await page.screenshot({ path: resolve(output, `${name}-${layout}-rating.png`) })
}
async function verifyForm(page, origin, name, layout) {
  await page.goto(`${origin}/demo/components/form.html`)
  await page.waitForFunction(() => document.querySelector("#form-api").classList.contains("component-api"))
  await page.locator("#name").fill("reserved")
  await page.locator("#validate").click()
  await page.waitForFunction(() => document.querySelector("#status").textContent.startsWith("Validation failed:"))
  assert(await page.locator("#name-error").isVisible(), `${name}/${layout}: portable feedback not visible`)
  assert.match(await page.locator("#name-error").textContent(), /reserved/)
  assert.equal(await page.locator("#name").getAttribute("aria-invalid"), "true")
  await page.locator("#name").scrollIntoViewIfNeeded()
  await page.screenshot({ path: resolve(output, `${name}-${layout}-form-invalid.png`) })

  await page.locator("#name").fill("Ada")
  await page.locator("#validate").click()
  await page.waitForFunction(() => document.querySelector("#status").textContent === "Validation passed. No data sent.")
  assert.equal(await page.locator("#name-error").isVisible(), false)
  assert.equal(await page.locator("#name").getAttribute("aria-invalid"), null)
  assert.equal(await page.locator('input[name="locked"]').isDisabled(), true)
  assert.equal(await page.locator('input[name="legend"]').isEnabled(), true)
  assert.equal(await page.locator('input[name="reference"]').isEditable(), false)
  await page.locator("#note").fill("Browser acceptance")
  await page.getByRole("button", { name: "Validate and inspect save", exact: true }).click()
  await page.waitForFunction(() => document.querySelector("#submission").textContent.startsWith("{"))
  const submitted = JSON.parse(await page.locator("#submission").textContent())
  assert.equal(submitted.submissions, 1)
  assert.deepEqual(submitted.entries, [
    ["profile.name", "Ada"], ["consent", "yes"],
    ["contact[email]", "ada@example.test"], ["contact[confirm]", "ada@example.test"],
    ["topics[]", "html"], ["legend", "included"], ["reference", "local-only"],
    ["intent", "save"], ["notes[0].text", "Browser acceptance"],
  ])

  const consent = page.getByRole("switch", { name: "Required native Switch consent", exact: true })
  assert.equal(await consent.isChecked(), true)
  await consent.focus()
  await page.keyboard.press("Space")
  assert.equal(await consent.isChecked(), false)
  await page.locator("#name").fill("Changed")
  await page.getByRole("button", { name: "Native reset", exact: true }).click()
  assert.equal(await consent.isChecked(), true)
  assert.equal(await page.locator("#name").inputValue(), "Ada")
  assert.equal(await page.locator("#note").inputValue(), "outside")

  await page.locator("#name").fill("Keep cancelled reset")
  await page.getByRole("button", { name: "Cancel next reset", exact: true }).click()
  await page.getByRole("button", { name: "Native reset", exact: true }).click()
  assert.equal(await page.locator("#name").inputValue(), "Keep cancelled reset")
  await page.getByRole("button", { name: "Native reset", exact: true }).click()
  assert.equal(await page.locator("#name").inputValue(), "Ada")
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${name}/${layout}: form horizontal overflow`)
}
async function verifyHtmlPolicy(page, origin, name) {
  const url = `${origin}/demo/security-check.html`
  await page.route(url, route => route.fulfill({ contentType: "text/html", body: "<!doctype html><title>Security check</title><body></body>" }))
  await page.goto(url)
  const filtered = await page.evaluate(async () => {
    const { sanitizeHtml } = await import("/dist/markup-ui.js")
    window.markupuiExecuted = 0
    customElements.define("x-executable", class extends HTMLElement {
      constructor() { super(); window.markupuiExecuted++ }
    })
    const fragment = sanitizeHtml('<svg><a href="javascript:window.markupuiExecuted++">Unsafe</a></svg><x-executable></x-executable><m-include src="/unexpected"></m-include><template><button onclick="window.markupuiExecuted++">Test</button><script>window.markupuiExecuted++</script></template>')
    const template = fragment.querySelector("template")
    const clean = !fragment.querySelector("svg,x-executable,m-include") && !template.content.querySelector("script,[onclick]")
    document.body.append(fragment)
    document.body.append(template.content.cloneNode(true))
    document.querySelector("button").click()
    return clean && window.markupuiExecuted === 0
  })
  assert(filtered, `${name}: unsafe HTML reached the live document`)
  if (name === "chromium") {
    const strict = `${origin}/demo/trusted-types-check.html`
    await page.route(strict, route => route.fulfill({
      contentType: "text/html", body: "<!doctype html><title>Trusted Types check</title><body></body>",
      headers: { "Content-Security-Policy": "require-trusted-types-for 'script'; trusted-types 'none'" },
    }))
    await page.goto(strict)
    assert(await page.evaluate(async () => {
      const { sanitizeHtml } = await import("/dist/markup-ui.js")
      try { sanitizeHtml("<p>Blocked</p>"); return false } catch (error) { return error instanceof TypeError }
    }), "String HTML must fail closed under Trusted Types enforcement")
  }
}
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
  for (const [name, engine] of Object.entries(engines)) {
    if (selectedBrowser && selectedBrowser !== name) continue
    console.log(`Starting ${name}`)
    const browser = await engine.launch({ headless: true, timeout: 30_000 })
    try {
      for (const [layout, viewport] of Object.entries({ desktop: { width: 1280, height: 900 }, mobile: { width: 375, height: 812 } })) {
        const context = await browser.newContext({ viewport, reducedMotion: "reduce" })
        context.setDefaultTimeout(15_000)
        try {
          const page = await context.newPage()
          const errors = []
          page.on("pageerror", error => errors.push(error.stack ?? error.message))
          await verifyExternalChartEngine(page, origin, "esm")
          await verifyExternalChartEngine(page, origin, "classic")
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
          await verifyForm(page, origin, name, layout)
          await verifyPlugins(page, origin, name, layout)
          await verifyHtmlPolicy(page, origin, name)
          assert.deepEqual(errors, [], `${name}/${layout}: browser errors`)
          results.push({ browser: name, version: browser.version(), layout, readyMs: Math.round(readyMs), charts: geometry, canvasColoredPixels: colored, performance: performanceSample,
            form: "passed", plugins: "passed", htmlPolicy: "passed", trustedTypes: name === "chromium" ? "fail-closed verified" : "not tested" })
          console.log(`${name} ${browser.version()} ${layout}: passed (${Math.round(readyMs)} ms to six ready charts)`)
          if (process.argv.includes("--catalog")) {
            const failedResources = []
            page.on("response", response => {
              const path = response.url().slice(origin.length)
              // The Image fallback example deliberately requests this missing local fixture.
              if (response.status() === 404 && path === "/demo/components/image.missing.svg"
                && new URL(page.url()).pathname === "/demo/components/image.html") return
              if (response.url().startsWith(origin) && response.status() >= 400) failedResources.push(`${response.status()} ${path}`)
            })
            page.on("requestfailed", request => {
              if (request.url().startsWith(origin)) failedResources.push(`${request.failure()?.errorText} ${request.url().slice(origin.length)}`)
            })
            for (const { slug } of components.filter(component => !selectedPage || selectedPage === component.slug)) {
              errors.length = 0
              failedResources.length = 0
              let failure
              try {
                await page.goto(`${origin}/demo/components/${slug}.html`)
                const api = page.locator(`#${slug}-api`)
                if (await api.count()) await page.waitForFunction(id => document.getElementById(id).classList.contains("component-api"), `${slug}-api`)
                assert.deepEqual(errors, [])
                if (slug === "dynamic-input") {
                  const basic = page.locator("#basic-dynamic-input")
                  const add = basic.locator("[data-dynamic-add]")
                  await add.click()
                  await page.waitForFunction(() => document.querySelector("#basic-dynamic-input").rows.length === 2)
                  const second = basic.getByRole("textbox", { name: "Item", exact: true }).nth(1)
                  assert.equal(await second.evaluate(element => document.activeElement === element), true, "Add focuses its new field")
                  await second.fill("Second item")
                  await basic.locator('[data-dynamic-action="up"]').nth(1).click()
                  await page.waitForFunction(() => document.querySelector("#basic-dynamic-input input").value === "Second item")
                  await basic.locator('[data-dynamic-action="remove"]').first().click()
                  await page.waitForFunction(() => document.querySelector("#basic-dynamic-input").rows.length === 1)
                  assert.equal(await page.locator("#basic-value").textContent(), "Rows: 1")
                  const locked = page.locator("#disabled-dynamic-input").getByRole("textbox")
                  assert.equal(await locked.isDisabled(), true)
                  await page.locator("#toggle-disabled").click()
                  assert.equal(await locked.isDisabled(), false)
                  const form = page.locator("#entries-form"), entries = page.locator("#entries-input")
                  await entries.getByRole("textbox", { name: "Title", exact: true }).fill("Edited, intact")
                  await entries.locator("[data-dynamic-add]").click()
                  await page.waitForFunction(() => document.querySelector("#entries-input").rows.length === 2)
                  await form.getByRole("button", { name: "Save entries", exact: true }).click()
                  assert.equal(await page.locator("#entries-value").textContent(),
                    '[["titles[]","Edited, intact"],["notes[]","Default note"],["titles[]","First item"],["notes[]","Default note"]]')
                  await form.getByRole("button", { name: "Reset fields", exact: true }).click()
                  assert.deepEqual(await entries.getByRole("textbox", { name: "Title", exact: true }).evaluateAll(fields => fields.map(field => field.value)), ["First item", "First item"])
                  const identity = await entries.evaluate(element => {
                    const row = element.rows[0], input = row.element.querySelector("input"), parent = element.parentNode, before = element.nextSibling
                    input.value = "Reconnect"
                    element.remove()
                    parent.insertBefore(element, before)
                    return new Promise(resolve => queueMicrotask(() => resolve({
                      connected: element.connected, same: element.rows[0].element === row.element,
                      value: input.value, count: element.rows.length,
                    })))
                  })
                  assert.deepEqual(identity, { connected: true, same: true, value: "Reconnect", count: 2 })
                  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
                    `${name}/${layout}: Dynamic Input overflow`)
                  await basic.scrollIntoViewIfNeeded()
                  await page.screenshot({ path: resolve(output, `${name}-${layout}-dynamic-input.png`) })
                  await entries.scrollIntoViewIfNeeded()
                  await page.screenshot({ path: resolve(output, `${name}-${layout}-dynamic-input-template.png`) })
                }
                if (slug === "dynamic-tags") {
                  assert.equal(await page.evaluate(() => !!customElements.get("m-dynamic-input")), false,
                    "Dynamic Tags must not register Dynamic Input")
                  const tags = page.locator("#basic-tags")
                  const editor = tags.getByRole("textbox", { name: "New tag", exact: true })
                  await editor.fill("Distribution check")
                  await editor.press("Enter")
                  await page.waitForFunction(() => document.querySelector("#basic-status").textContent.includes("Distribution check"))
                  assert.equal(await editor.inputValue(), "")
                  assert.equal(await editor.evaluate(element => document.activeElement === element), true, "Enter preserves editor focus")
                  await tags.getByRole("button", { name: "Remove Distribution check", exact: true }).click()
                  await page.waitForFunction(() => document.querySelector("#basic-status").textContent === "Tags: MarkupUI, Web Components")
                  await editor.fill("Button check")
                  await tags.getByRole("button", { name: "Add", exact: true }).click()
                  await page.waitForFunction(() => document.querySelector("#basic-status").textContent.includes("Button check"))
                  assert.equal(await editor.evaluate(element => document.activeElement === element), true, "Add click restores editor focus")
                  const formTags = page.locator("#form-tags")
                  const formEditor = formTags.getByRole("textbox", { name: "New topic", exact: true })
                  await formEditor.fill("alpha")
                  await formEditor.press("Enter")
                  await page.waitForFunction(() => document.querySelector("#form-feedback").textContent.includes("already exists"))
                  assert.equal(await formEditor.inputValue(), "alpha")
                  await formEditor.fill("beta")
                  await formEditor.press("Enter")
                  await page.waitForFunction(() => document.querySelector("#form-feedback").textContent.includes("BETA"))
                  await page.locator("#tags-form").getByRole("button", { name: "Submit", exact: true }).click()
                  await page.waitForFunction(() => document.querySelector("#form-feedback").textContent === '[["topics","ALPHA"],["topics","BETA"]]')
                  await formEditor.fill("unsubmitted")
                  await page.locator("#tags-form").getByRole("button", { name: "Reset fields", exact: true }).click()
                  assert.equal(await formEditor.inputValue(), "")
                  assert.deepEqual(await formTags.evaluate(element => element.values), ["ALPHA", "BETA"])
                  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
                    `${name}/${layout}: Dynamic Tags overflow`)
                  await tags.scrollIntoViewIfNeeded()
                  await page.screenshot({ path: resolve(output, `${name}-${layout}-dynamic-tags.png`) })
                }
                if (slug === "virtual-list") {
                  await page.waitForFunction(() => document.querySelector("#large").clientHeight === 320)
                  await page.locator("#end").click()
                  await page.waitForFunction(() => document.querySelector("#large").textContent.includes("Item 100000"))
                  await page.locator("#resize").click()
                  await page.waitForFunction(() => document.querySelector("#large").clientHeight === 160)
                  await page.screenshot({ path: resolve(output, `${name}-${layout}-virtual-list.png`) })
                }
                await page.evaluate(() => new Promise(resolveFrame => requestAnimationFrame(() => requestAnimationFrame(resolveFrame))))
                const unregistered = await page.evaluate(() => [...new Set([...document.querySelectorAll("*")]
                  // Mention parses these hidden configuration nodes; they have no independent renderer.
                  .filter(node => !node.matches("m-mention > m-option[hidden]"))
                  .map(node => node.localName).filter(tag => tag.startsWith("m-") && !customElements.get(tag)))])
                if (unregistered.length) errors.push(`Unregistered: ${unregistered.join(", ")}`)
                assert.deepEqual([...errors, ...failedResources], [])
              } catch (error) { failure = [...new Set([error.message, ...errors, ...failedResources])].join("\n") }
              if (failure && slug === "virtual-list") {
                failure += "\n" + JSON.stringify(await page.locator(".m-virtual-list").evaluateAll(nodes => nodes.map(node => {
                  const css = getComputedStyle(node)
                  return { id: node.id, hidden: node.hidden, size: css.getPropertyValue("--m-virtual-list-height"), overflow: css.overflowY, padding: [css.paddingTop, css.paddingBottom], display: css.display }
                })))
              }
              catalogResults.push({ browser: name, layout, slug, passed: !failure, failure })
              if (failure) console.log(`${name}/${layout}/${slug}: FAILED ${failure}`)
            }
            await writeFile(resolve(output, "catalog-results.json"), JSON.stringify({ date: new Date().toISOString(), results: catalogResults }, null, 2))
          }
        } finally { await context.close() }
      }
    } finally { await browser.close() }
  }
  await writeFile(resolve(output, "results.json"), JSON.stringify({ date: new Date().toISOString(), results }, null, 2))
  if (catalogResults.length) {
    await writeFile(resolve(output, "catalog-results.json"), JSON.stringify({ date: new Date().toISOString(), results: catalogResults }, null, 2))
    console.log(`Catalog: ${catalogResults.filter(result => result.passed).length}/${catalogResults.length} checks passed`)
    assert(catalogResults.every(result => result.passed), `${catalogResults.filter(result => !result.passed).length} catalog checks failed; see .vite/browser/catalog-results.json`)
  }
} finally {
  server.kill()
  await new Promise(resolveExit => {
    if (server.exitCode !== null || server.signalCode !== null) resolveExit()
    else server.once("exit", resolveExit)
  })
}
