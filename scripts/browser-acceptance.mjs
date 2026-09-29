import assert from "node:assert/strict"
import { spawn } from "node:child_process"
import { mkdir, writeFile } from "node:fs/promises"
import { resolve } from "node:path"
import { cpus, totalmem, platform, release } from "node:os"
import { chromium, firefox, webkit } from "playwright"

const output = resolve(process.argv.find(arg => arg.startsWith("--output="))?.slice(9) ?? ".vite/browser/first-five")
const selected = process.argv.find(arg => arg.startsWith("--browser="))?.slice(10)
if (selected) assert(["chromium", "firefox", "webkit"].includes(selected))
await mkdir(output, { recursive: true })
const server = spawn(process.execPath, ["demo/server.mjs"], {
  env: { ...process.env, PORT: "0" }, windowsHide: true, stdio: ["ignore", "pipe", "pipe"],
})
const results = { date: new Date().toISOString(), conditions: [], resources: [], plugins: [], charts: [], memory: [],
  environment: { node: process.version, platform: platform(), release: release(), cpu: cpus()[0]?.model, logicalCpus: cpus().length, memoryBytes: totalmem() },
  versions: {},
  limits: ["No real IME, device, screen reader or browser-zoom acceptance.",
    "Synthetic timing and forced-GC observations are not production approval.",
    "Chart timings measure state-ready and synchronous refresh, not completed progressive rendering or final paint."] }
const save = () => writeFile(resolve(output, "acceptance.json"), JSON.stringify(results, null, 2))

async function conditions(page, origin, mode, browser, layout) {
  const url = `${origin}/demo/acceptance-${mode}.html`
  await page.route(url, route => route.fulfill({ contentType: "text/html", body: `<!doctype html>
    <html lang="en"><head><meta name="viewport" content="width=device-width"><title>Conditional report</title>
    ${["box", "input", "button", "form", "list"].map(name => `<link rel="stylesheet" href="/dist/markup-ui-${name}.css">`).join("")}
    <style>body{font:16px system-ui;margin:16px;color:#222;background:white}m-input{max-width:100%}input{max-width:100%;box-sizing:border-box}</style></head><body>
    <m-box id="workspace" display="flex" direction="column" gap="12">
      <m-form><m-button id="return">Close editor</m-button>
        <m-if data-if="editing" focus-target="return"><m-box display="flex" direction="column" gap="8">
          <m-label for="report-field">Report title</m-label>
          <m-input id="report-field" name="report" data-model-value="title" data-model-event="input change" data-model-target="native"></m-input>
          <m-if data-if="details"><m-span data-bind-text="title"></m-span></m-if>
          <m-button m-action="accept-save" m-arg-title="$root.title">Save report</m-button>
        </m-box></m-if>
      </m-form>
      <m-list><m-list-template data-each="rows" data-each-key="id" label="Tasks" focus-on-remove>
        <m-list-item><m-if data-if="$item.editable"><m-input aria-label="Task" data-model-value="$item.name"
          data-model-event="input" data-model-target="native"></m-input></m-if></m-list-item>
      </m-list-template></m-list>
    </m-box></body></html>` }))
  await page.goto(url)
  if (mode === "classic") {
    for (const name of ["core", "state", "box", "native-input", "input", "button", "form", "list"]) {
      await page.addScriptTag({ url: `${origin}/dist/markup-ui-${name}.global.js` })
    }
    await page.addScriptTag({ url: `${origin}/dist/markup-ui.global.js` })
    await page.evaluate(() => { window.acceptState = MarkupUIState; window.acceptApi = m })
  } else await page.evaluate(async () => {
    window.acceptState = await import("/dist/markup-ui-state.js")
    for (const name of ["box", "input", "button", "form", "list"]) await import(`/dist/markup-ui-${name}.js`)
    window.acceptApi = (await import("/dist/markup-ui.min.js")).m
  })
  await page.evaluate(() => {
    const root = document.getElementById("workspace")
    window.acceptStore = acceptState.createStore({ editing: true, details: true, title: "Quarterly report",
      rows: [{ id: "a", editable: true, name: "Alpha" }, { id: "b", editable: false, name: "Beta" }] })
    window.acceptBinding = acceptState.bind(root, acceptStore)
    window.actionCalls = 0
    acceptApi.actions.register("accept-save", ({ arguments: args }) => { window.actionCalls++; window.savedTitle = args.title })
    window.releaseActions = acceptApi.actions.install(root, acceptBinding)
    document.getElementById("return").addEventListener("click", () => acceptStore.set("editing", !acceptStore.get("editing")))
  })
  const field = page.getByRole("textbox", { name: "Report title", exact: true })
  await page.getByText("Report title", { exact: true }).click()
  assert(await field.evaluate(node => node === document.activeElement), JSON.stringify(await page.evaluate(() => ({
    active: document.activeElement?.outerHTML, form: document.querySelector("m-form").outerHTML,
  }))))
  await field.fill("Edited report")
  await page.getByRole("button", { name: "Save report", exact: true }).press("Enter")
  assert.deepEqual(await page.evaluate(() => [savedTitle, actionCalls]), ["Edited report", 1])
  await field.focus()
  await page.evaluate(() => acceptStore.set("editing", false))
  assert(await page.locator("#return button").evaluate(node => node === document.activeElement))
  assert.equal(await page.evaluate(() => new FormData(document.querySelector("m-form").native).getAll("report").length), 0)
  await page.locator("#return button").press("Space")
  assert.equal(await field.inputValue(), "Edited report")
  assert.deepEqual(await page.evaluate(() => new FormData(document.querySelector("m-form").native).getAll("report")), ["Edited report"])
  const task = page.getByRole("textbox", { name: "Task", exact: true })
  await task.evaluate(node => { window.originalTask = node; node.focus(); node.value = "Draft"; node.setSelectionRange(1, 3) })
  await page.evaluate(() => acceptStore.set("rows", [...acceptStore.get("rows")].reverse()))
  assert.deepEqual(await task.evaluate(node => [node === window.originalTask, document.activeElement === node, node.value, node.selectionStart, node.selectionEnd]),
    [true, true, "Draft", 1, 3])
  await task.evaluate(node => {
    node.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true, data: "" }))
    node.value = "\u4efb\u52a1"
    node.dispatchEvent(new InputEvent("input", { bubbles: true, isComposing: true, data: "\u4efb\u52a1" }))
    node.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true, data: "\u4efb\u52a1" }))
    node.dispatchEvent(new InputEvent("input", { bubbles: true, data: "\u4efb\u52a1" }))
  })
  assert.equal(await page.evaluate(() => acceptStore.get("rows.1.name")), "\u4efb\u52a1")
  await page.evaluate(() => acceptStore.set("rows.1.editable", false))
  assert(await page.getByRole("list", { name: "Tasks" }).evaluate(node => node === document.activeElement))
  await page.evaluate(() => {
    for (let index = 0; index < 10; index++) {
      releaseActions(); acceptBinding()
      acceptBinding = acceptState.bind(document.getElementById("workspace"), acceptStore)
      releaseActions = acceptApi.actions.install(document.getElementById("workspace"), acceptBinding)
    }
  })
  await page.getByRole("button", { name: "Save report", exact: true }).press("Space")
  assert.equal(await page.evaluate(() => actionCalls), 2)
  const profiles = []
  for (const profile of ["rtl", "forced-colors", "text-200"]) {
    await page.evaluate(profile => {
      document.documentElement.dir = profile === "rtl" ? "rtl" : "ltr"
      document.body.style.fontSize = profile === "text-200" ? "32px" : "16px"
    }, profile)
    await page.emulateMedia({ forcedColors: profile === "forced-colors" ? "active" : "none", reducedMotion: "reduce" })
    await field.fill(`Report ${profile}`)
    await page.getByRole("button", { name: "Save report", exact: true }).press("Enter")
    assert.equal(await page.evaluate(() => savedTitle), `Report ${profile}`)
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${browser}/${layout}/${profile} overflow`)
    profiles.push({ profile, forcedColors: await page.evaluate(() => matchMedia("(forced-colors: active)").matches) })
    await page.screenshot({ path: resolve(output, `${browser}-${layout}-${mode}-${profile}.png`) })
  }
  await page.emulateMedia({ forcedColors: "none", reducedMotion: "reduce" })
  await page.evaluate(() => { releaseActions(); acceptBinding() })
  results.conditions.push({ browser, layout, mode, profiles, status: "passed" })
}

async function resources(page, browser, layout, mode) {
  const samples = await page.evaluate(async () => {
    document.getElementById("workspace").remove()
    const samples = []
    const measure = action => { const start = performance.now(); action(); return performance.now() - start }
    for (const portable of [false, true]) for (const count of [0, 1, 100, 1000]) {
      for (let repetition = 0; repetition < 5; repetition++) {
        const root = document.createElement("div")
        root.innerHTML = `<template data-each="rows" data-each-key="id"><div>
          ${portable ? '<m-if data-if="$item.editable">' : '<template data-if="$item.editable">'}
            <div><label data-bind-html-for="$item.field" data-bind-text="$item.name"></label>
              <input data-bind-id="$item.field" data-model-value="$item.name" data-model-event="input"></div>
          ${portable ? "</m-if>" : "</template>"}</div></template>`
        const store = acceptState.createStore({ rows: Array.from({ length: count }, (_, id) => ({ id, editable: true, field: `field-${id}`, name: `Row ${id}` })) })
        document.body.append(root)
        let stop
        const mount = measure(() => { stop = acceptState.bind(root, store) })
        const input = root.querySelector("input")
        const reorder = measure(() => store.set("rows", [...store.get("rows")].reverse()))
        if (input && root.querySelectorAll("input")[count - 1] !== input) throw new Error("Resource fixture lost identity")
        const update = measure(() => { if (count) store.set("rows.0.name", "Updated") })
        const rebind = measure(() => { stop(); stop = acceptState.bind(root, store) })
        const remove = measure(() => store.set("rows", []))
        if (root.querySelector("input")) throw new Error("Resource fixture retained removed instances")
        stop()
        root.remove()
        samples.push({ portable, count, repetition, mount, reorder, update, rebind, remove })
        await new Promise(resolve => setTimeout(resolve, 0))
      }
    }
    return samples
  })
  results.resources.push({ browser, layout, mode, unit: "ms", samples })
}

async function memory(page, context, browser, layout) {
  if (browser !== "chromium") return
  const cdp = await context.newCDPSession(page)
  try {
    await cdp.send("HeapProfiler.collectGarbage")
    const before = await cdp.send("Memory.getDOMCounters")
    const heapBefore = await cdp.send("Runtime.getHeapUsage")
    await page.evaluate(async () => {
      for (let cycle = 0; cycle < 30; cycle++) {
        const root = document.createElement("div")
        root.innerHTML = '<m-if data-if="visible"><div><template data-each="rows" data-each-key="id"><input data-model-value="$item.name" data-model-event="input"></template></div></m-if>'
        const store = acceptState.createStore({ visible: true, rows: Array.from({ length: 100 }, (_, id) => ({ id, name: "Memory" })) })
        document.body.append(root)
        const stop = acceptState.bind(root, store)
        store.set("visible", false)
        store.set("visible", true)
        stop()
        root.remove()
        await new Promise(resolve => setTimeout(resolve, 0))
      }
    })
    await cdp.send("HeapProfiler.collectGarbage")
    const after = await cdp.send("Memory.getDOMCounters")
    const heapAfter = await cdp.send("Runtime.getHeapUsage")
    results.memory.push({ browser, layout, cycles: 30, rows: 100, before, after,
      delta: { nodes: after.nodes - before.nodes, listeners: after.jsEventListeners - before.jsEventListeners,
        usedHeap: heapAfter.usedSize - heapBefore.usedSize },
      note: "Forced-GC synthetic observation; no process-memory or leak-free guarantee." })
  } finally { await cdp.detach() }
}

async function plugins(page, origin, browser, layout) {
  await page.goto(`${origin}/demo/components/plugins.html`)
  const grid = page.locator("#scores")
  const name = grid.getByRole("button", { name: "Name", exact: true })
  await name.press("Enter")
  assert.equal(await name.locator("..").getAttribute("aria-sort"), "ascending")
  await name.press("Space")
  assert.equal(await name.locator("..").getAttribute("aria-sort"), "descending")
  const rating = page.locator("#review-score")
  await rating.getByRole("button", { name: "2 of 5", exact: true }).press("Enter")
  assert.equal(await rating.getAttribute("value"), "2")
  await page.getByRole("button", { name: "Toggle disabled", exact: true }).click()
  assert(await rating.getByRole("button", { name: "3 of 5", exact: true }).isDisabled())
  await page.getByRole("button", { name: "Toggle disabled", exact: true }).click()
  for (let index = 0; index < 10; index++) {
    await page.getByRole("button", { name: "Reconnect grid", exact: true }).click()
    await page.getByRole("button", { name: "Reconnect rating", exact: true }).click()
  }
  assert.equal(await grid.locator("table").count(), 1)
  assert.equal(await rating.locator("button").count(), 5)
  await rating.getByRole("button", { name: "4 of 5", exact: true }).press("Space")
  assert.equal(await rating.getAttribute("value"), "4")
  await page.evaluate(() => { document.documentElement.dir = "rtl" })
  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" })
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), "Plugin overflow")
  await page.screenshot({ path: resolve(output, `${browser}-${layout}-plugins.png`) })
  await page.emulateMedia({ forcedColors: "none", reducedMotion: "reduce" })
  results.plugins.push({ browser, layout, status: "passed" })
}

async function charts(page, origin, browser, layout) {
  await page.goto(`${origin}/demo/components/chart.html`)
  await page.waitForFunction(() => document.querySelectorAll("m-chart").length === 6
    && [...document.querySelectorAll("m-chart")].every(chart => chart.state === "ready"))
  const chart = page.locator("m-chart").first()
  assert(await chart.locator("svg path").count() > 0)
  await chart.locator("summary").press("Enter")
  assert(await chart.locator("table").isVisible())
  const samples = await page.evaluate(async () => {
    const samples = []
    for (const renderer of ["svg", "canvas"]) for (const count of [1, 100, 1000, 10000]) {
      for (let repetition = 0; repetition < 3; repetition++) {
        const chart = document.createElement("m-chart")
        chart.setAttribute("aria-label", "Resource sample")
        chart.renderer = renderer
        chart.tableSource = Array.from({ length: count }, (_, i) => [i, i % 100])
        chart.option = { animation: false, dataset: { source: chart.tableSource }, xAxis: { type: "value" },
          yAxis: { type: "value" }, series: [{ type: "scatter" }] }
        const start = performance.now()
        document.body.append(chart)
        await new Promise(resolve => setTimeout(resolve, 0))
        if (chart.state !== "ready") throw chart.error ?? new Error("Chart not ready")
        const mount = performance.now() - start
        const updateStart = performance.now()
        chart.refresh()
        const update = performance.now() - updateStart
        if (chart.querySelectorAll("tbody tr").length > 50) throw new Error("Unbounded accessible table")
        const removeStart = performance.now()
        chart.remove()
        const remove = performance.now() - removeStart
        if (chart.native.childElementCount) throw new Error("Chart engine retained rendered DOM after disposal")
        samples.push({ renderer, count, repetition, mount, update, remove })
      }
    }
    return samples
  })
  await chart.evaluate(chart => { chart.renderer = "canvas" })
  await page.waitForFunction(() => document.querySelector("m-chart").state === "ready" && document.querySelector("m-chart canvas"))
  const pixels = await chart.evaluate(chart => {
    let count = 0
    for (const canvas of chart.native.querySelectorAll("canvas")) {
      const rgba = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height).data
      for (let i = 3; i < rgba.length; i += 4) if (rgba[i]) count++
    }
    return count
  })
  assert(pixels > 100, "Blank Chart canvas")
  await chart.evaluate(chart => { chart.renderer = "svg" })
  await page.waitForFunction(() => document.querySelector("m-chart").state === "ready" && document.querySelector("m-chart svg path"))
  await page.screenshot({ path: resolve(output, `${browser}-${layout}-chart.png`) })
  results.charts.push({ browser, layout, samples, canvasPixels: pixels, status: "passed" })
}

try {
  const origin = await new Promise((resolveOrigin, reject) => {
    const timer = setTimeout(() => reject(new Error("Demo server did not start")), 10000)
    server.once("error", reject)
    server.once("exit", code => { clearTimeout(timer); reject(new Error(`Server exited (${code})`)) })
    server.stdout.on("data", chunk => {
      const match = String(chunk).match(/http:\/\/localhost:\d+/)
      if (match) { clearTimeout(timer); resolveOrigin(match[0]) }
    })
    server.stderr.on("data", chunk => process.stderr.write(chunk))
  })
  for (const [name, engine] of Object.entries({ chromium, firefox, webkit })) {
    if (selected && selected !== name) continue
    const browser = await engine.launch({ headless: true })
    results.versions[name] = browser.version()
    try {
      for (const [layout, viewport] of Object.entries({ desktop: { width: 1280, height: 900 }, mobile: { width: 375, height: 812 } })) {
        const context = await browser.newContext({ viewport, reducedMotion: "reduce" })
        context.setDefaultTimeout(20000)
        try {
          const page = await context.newPage()
          const errors = []
          page.on("pageerror", error => errors.push(error.stack ?? error.message))
          for (const mode of ["esm", "classic"]) {
            await conditions(page, origin, mode, name, layout)
            await resources(page, name, layout, mode)
            await save()
            console.log(`${name}/${layout}/${mode}: conditions and resource samples passed`)
          }
          await memory(page, context, name, layout)
          await plugins(page, origin, name, layout)
          await charts(page, origin, name, layout)
          await page.goto(`${origin}/demo/components/box.html#condition-heading`)
          await page.getByRole("textbox", { name: "Report title", exact: true }).fill("Demo report")
          await page.getByRole("button", { name: "Close editor", exact: true }).click()
          assert.equal(await page.getByRole("textbox", { name: "Report title", exact: true }).count(), 0)
          await page.getByRole("button", { name: "Edit report", exact: true }).click()
          assert.equal(await page.getByRole("textbox", { name: "Report title", exact: true }).inputValue(), "Demo report")
          await page.locator('[data-demo-example="condition"]').screenshot({ path: resolve(output, `${name}-${layout}-condition-demo.png`) })
          assert.deepEqual(errors, [])
          results.conditions.push({ browser: name, version: browser.version(), layout, mode: "demo", status: "passed" })
          await save()
          console.log(`${name}/${layout}: plugin, Chart and demo checks passed`)
        } finally { await context.close() }
      }
    } finally { await browser.close() }
  }
} catch (error) {
  results.failure = String(error.stack ?? error)
  await save()
  throw error
} finally {
  server.kill()
  await new Promise(resolveExit => {
    if (server.exitCode !== null || server.signalCode !== null) resolveExit()
    else server.once("exit", resolveExit)
  })
}
