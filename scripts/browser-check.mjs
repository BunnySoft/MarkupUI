import assert from "node:assert/strict"
import { spawn } from "node:child_process"
import { mkdir, writeFile } from "node:fs/promises"
import { resolve } from "node:path"
import { chromium, firefox, webkit } from "playwright"
import { components } from "../demo/catalog.js"
import { verifyTemplates, verifyListTemplates, verifyTemplateSources, verifyPairedIds, verifyScopedActions } from "./browser-templates.mjs"

const engines = { chromium, firefox, webkit }
const selectedBrowser = process.argv.find(arg => arg.startsWith("--browser="))?.slice("--browser=".length)
if (selectedBrowser) assert(Object.hasOwn(engines, selectedBrowser), `Unknown browser: ${selectedBrowser}`)
const selectedPage = process.argv.find(arg => arg.startsWith("--page="))?.slice("--page=".length)
if (selectedPage) assert(components.some(component => component.slug === selectedPage), `Unknown page: ${selectedPage}`)
const output = resolve(process.argv.find(arg => arg.startsWith("--output="))?.slice("--output=".length) ?? ".vite/browser")
await mkdir(output, { recursive: true })
const server = spawn(process.execPath, ["demo/server.mjs"], {
  env: { ...process.env, PORT: "0" }, windowsHide: true, stdio: ["ignore", "pipe", "pipe"],
})
const results = []
const catalogResults = []
const templateResults = []
const listTemplateResults = []
const sourceResults = []
const idResults = []
const actionResults = []
async function verifyRoot(page, origin, mode, engine, layout) {
  const url = `${origin}/demo/root-${mode}-check.html`
  await page.route(url, route => route.fulfill({
    contentType: "text/html",
    body: `<!doctype html><meta name="viewport" content="width=device-width"><title>Root lifecycle</title>
      <link rel="stylesheet" href="/dist/markup-ui-input.css">
      <link rel="stylesheet" href="/dist/markup-ui-checkbox.css">
      <link rel="stylesheet" href="/dist/markup-ui-button.css">
      <link rel="stylesheet" href="/dist/markup-ui-box.css"><body>
      <m-app id="root-app">
        <m-box padding="16" display="flex" direction="column" gap="16">
          <m-field id="name-field" label="Account name">
            <m-input name="account" data-model-value="name" data-model-event="input change" data-model-target="native"></m-input>
          </m-field>
          <m-span id="root-readout" data-bind-text="name"></m-span>
          <m-accordion-item id="root-details" title="Preferences">
            <m-field label="Consent"><m-checkbox id="root-consent"></m-checkbox></m-field>
          </m-accordion-item>
          <m-theme id="root-theme"><m-span>Scoped appearance</m-span></m-theme>
          <m-button id="root-action" m-action="root-capture">Save account</m-button>
        </m-box>
      </m-app></body>`,
  }))
  await page.goto(url)
  if (mode === "classic") {
    for (const name of ["core", "state", "native-input", "input", "checkbox", "box", "button"]) {
      await page.addScriptTag({ url: `${origin}/dist/markup-ui-${name}.global.js` })
    }
    await page.evaluate(() => {
      window.rootStore = MarkupUIState.createStore({ name: "Initial account" })
      document.getElementById("root-app").store = window.rootStore
    })
    await page.addScriptTag({ url: `${origin}/dist/markup-ui.global.js` })
    await page.evaluate(() => { window.rootApi = m })
  } else {
    await page.evaluate(async () => {
      const state = await import("/dist/markup-ui-state.js")
      for (const name of ["input", "checkbox", "box", "button"]) await import(`/dist/markup-ui-${name}.js`)
      window.rootStore = state.createStore({ name: "Initial account" })
      document.getElementById("root-app").store = window.rootStore
      window.rootApi = (await import("/dist/markup-ui.min.js")).m
    })
  }
  await page.waitForFunction(() => document.getElementById("root-readout").textContent === "Initial account")
  assert.equal(await page.evaluate(() => document.getElementById("root-app").store === window.rootStore), true)
  await page.evaluate(() => window.rootApi.actions.register("root-capture", ({ store }) => { window.actionStore = store }))
  await page.getByText("Account name", { exact: true }).click()
  const input = page.getByRole("textbox", { name: "Account name", exact: true })
  assert.equal(await input.evaluate(control => document.activeElement === control), true)
  await input.fill("Edited account")
  assert.equal(await page.locator("#root-readout").textContent(), "Edited account")
  await page.getByRole("button", { name: "Save account", exact: true }).click()
  assert.equal(await page.evaluate(() => window.actionStore === window.rootStore), true)
  assert.equal(await page.locator("#root-action").evaluate(host => getComputedStyle(host, "::after").content), "none",
    "The root stylesheet must not add obsolete Button chrome")

  const header = page.getByRole("button", { name: "Preferences", exact: true })
  await header.press("Enter")
  assert.equal(await header.getAttribute("aria-expanded"), "true")
  const consent = page.getByRole("checkbox", { name: "Consent", exact: true })
  await page.getByText("Consent", { exact: true }).click()
  assert.equal(await consent.isChecked(), true)
  await page.locator("#root-consent").evaluate(host => { host.disabled = true })
  // Exercise native disabled-label activation instead of Playwright's enabled precondition.
  await page.getByText("Consent", { exact: true }).click({ force: true })
  assert.equal(await consent.isChecked(), true)
  await header.press("Space")
  assert.equal(await header.getAttribute("aria-expanded"), "false")
  assert.equal(await page.locator("#root-details").evaluate(item => {
    const header = item.querySelector("button"), content = item.querySelector("[data-m-content]")
    item.open = true
    item.title = "Updated preferences"
    return header.textContent === item.title && !content.hidden && header.getAttribute("aria-expanded") === "true"
  }), true)
  await page.getByRole("button", { name: "Updated preferences", exact: true }).press("Space")

  assert.deepEqual(await page.locator("#root-theme").evaluate(root => {
    window.rootApi.theme.register("root-browser", { accent: "red", surface: "white", border: "black" })
    root.dataset.mTheme = "authored"
    root.style.setProperty("--m-accent", "blue", "important")
    root.setAttribute("name", "root-browser")
    root.style.setProperty("--m-border", "black", "important")
    root.removeAttribute("name")
    return {
      accent: root.style.getPropertyValue("--m-accent"),
      accentPriority: root.style.getPropertyPriority("--m-accent"),
      borderPriority: root.style.getPropertyPriority("--m-border"),
      surface: root.style.getPropertyValue("--m-surface"),
      marker: root.dataset.mTheme,
    }
  }), { accent: "blue", accentPriority: "important", borderPriority: "important", surface: "", marker: "authored" })

  assert.equal(await page.locator("#root-app").evaluate(app => {
    const parent = app.parentElement, header = app.querySelector("#root-details > button")
    app.remove()
    header.click()
    const released = !app.querySelector("#root-details").open
    window.rootStore.set("name", "Reconnected account")
    parent.append(app)
    return released
  }), true)
  await page.waitForFunction(() => document.getElementById("root-readout").textContent === "Reconnected account")
  await page.getByRole("button", { name: "Updated preferences", exact: true }).press("Enter")
  assert.equal(await page.locator("#root-details").getAttribute("open"), "")
  await page.locator("#name-field").evaluate(field => {
    const replacement = document.createElement("m-input")
    replacement.setAttribute("value", "Replacement account")
    field.querySelector("m-input").replaceWith(replacement)
    field.label = "Replacement name"
  })
  await page.getByText("Replacement name", { exact: true }).click()
  assert.equal(await page.getByRole("textbox", { name: "Replacement name", exact: true }).evaluate(control => document.activeElement === control), true)
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${engine}/${layout}: root overflow`)
  await page.screenshot({ path: resolve(output, `${engine}-${layout}-root-${mode}.png`) })
}
async function verifyAll(page, origin, mode, engine, layout) {
  const url = `${origin}/demo/all-${mode}-check.html`
  await page.route(url, route => route.fulfill({
    contentType: "text/html",
    body: `<!doctype html><meta name="viewport" content="width=device-width"><title>All components</title>
      <link rel="stylesheet" href="/dist/markup-ui-all.css"><body>
      <m-form id="all-form">
        <m-input name="title" value="Initial"></m-input>
        <m-data-table id="all-table" label="Scores"
          options='{"columns":[{"key":"score","label":"Score","sort":"number"}],"selection":{"name":"keys","scope":"all"}}'
          data='[{"key":"a","values":[10]},{"key":"b","values":[2],"checked":true}]'></m-data-table>
        <m-button attr-type="reset">Reset all</m-button>
      </m-form>
      <m-dropdown id="all-dropdown"><m-dropdown-trigger>Actions</m-dropdown-trigger><m-dropdown-menu label="Actions">
        <m-dropdown-item key="edit">Edit</m-dropdown-item></m-dropdown-menu></m-dropdown>
      <m-chart id="all-chart" aria-label="Aggregate chart"></m-chart>
      </body>`,
  }))
  await page.goto(url)
  if (mode === "classic") {
    for (const name of ["core", "chart-renderer", "all"]) await page.addScriptTag({ url: `${origin}/dist/markup-ui-${name}.global.js` })
    await page.addScriptTag({ url: `${origin}/demo/vendor/echarts.global.js` })
    await page.evaluate(() => MarkupUIAll.chart.configureChartEngine(echarts))
  } else await page.evaluate(async () => {
    const all = await import("/dist/markup-ui-all.js")
    const engine = await import("/demo/vendor/echarts.js")
    all.chart.configureChartEngine(engine)
  })
  await page.evaluate(() => {
    const chart = document.getElementById("all-chart")
    chart.tableSource = [["x", "y"], ["A", 2], ["B", 4]]
    chart.option = { dataset: { source: chart.tableSource }, xAxis: { type: "category" }, yAxis: { type: "value" }, series: [{ type: "bar" }] }
    chart.refresh()
  })
  await page.waitForFunction(() => document.getElementById("all-chart").state === "ready")
  assert(await page.locator("#all-chart svg path").count() > 0)
  const table = page.locator("#all-table")
  await table.getByRole("button", { name: "Score", exact: true }).press("Enter")
  await page.waitForFunction(() => document.getElementById("all-table").state.visibleKeys[0] === "b")
  assert.deepEqual(await page.locator("#all-form").evaluate(form => new FormData(form.native).getAll("keys")), ["b"])
  await page.locator("m-input input").fill("Edited")
  await page.getByRole("button", { name: "Reset all", exact: true }).click()
  await page.waitForFunction(() => document.getElementById("all-table").state.sort === null)
  assert.equal(await page.locator("m-input input").inputValue(), "Initial")
  await page.locator("#all-dropdown m-dropdown-trigger > button").press("ArrowDown")
  await page.waitForFunction(() => document.activeElement.matches('#all-dropdown m-dropdown-item > button'))
  await page.keyboard.press("Enter")
  await page.waitForFunction(() => document.getElementById("all-dropdown").value === "edit")
  assert.equal(await table.evaluate(node => {
    const native = node.native, parent = node.parentElement
    node.remove(); parent.append(node)
    return native === node.native
  }), true)
  await page.screenshot({ path: resolve(output, `${engine}-${layout}-all-${mode}.png`) })
}
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
          for (const mode of ["esm", "classic"]) {
            const samples = await verifyTemplates(page, origin, mode, name, layout, output)
            templateResults.push({ browser: name, version: browser.version(), layout, mode, samples })
            await writeFile(resolve(output, "templates-results.json"), JSON.stringify({ date: new Date().toISOString(), results: templateResults }, null, 2))
            const listSamples = await verifyListTemplates(page, origin, mode, name, layout, output)
            listTemplateResults.push({ browser: name, version: browser.version(), layout, mode, samples: listSamples })
            await writeFile(resolve(output, "list-templates-results.json"), JSON.stringify({ date: new Date().toISOString(), results: listTemplateResults }, null, 2))
            const sources = await verifyTemplateSources(page, origin, mode, name, layout, output)
            sourceResults.push({ browser: name, version: browser.version(), layout, mode, ...sources })
            await writeFile(resolve(output, "template-sources-results.json"), JSON.stringify({ date: new Date().toISOString(), results: sourceResults }, null, 2))
            const ids = await verifyPairedIds(page, origin, mode, name, layout, output)
            idResults.push({ browser: name, version: browser.version(), layout, mode, ...ids })
            await writeFile(resolve(output, "binding-ids-results.json"), JSON.stringify({ date: new Date().toISOString(), results: idResults }, null, 2))
            const actions = await verifyScopedActions(page, origin, mode, name, layout, output)
            actionResults.push({ browser: name, version: browser.version(), layout, mode, ...actions })
            await writeFile(resolve(output, "scoped-actions-results.json"), JSON.stringify({ date: new Date().toISOString(), results: actionResults }, null, 2))
          }
          if (process.argv.includes("--templates")) {
            for (const mode of ["esm", "classic"]) await verifyRoot(page, origin, mode, name, layout)
            await page.goto(`${origin}/demo/components/list.html`)
            const tasks = page.getByRole("list", { name: "Tasks", exact: true })
            await page.locator("#task-list m-label > label").filter({ hasText: "Report" }).click()
            assert(await page.getByRole("textbox", { name: "Report", exact: true }).evaluate(node => node === document.activeElement), "Demo label did not focus input")
            assert.equal(await page.getByRole("textbox", { name: "Report", exact: true }).getAttribute("aria-describedby"), "task-help-a")
            await page.getByRole("textbox", { name: "Report", exact: true }).fill("Demo edit")
            await page.getByRole("button", { name: "Reverse order", exact: true }).click()
            assert.equal(await page.getByRole("textbox", { name: "Report", exact: true }).inputValue(), "Demo edit")
            await page.getByRole("button", { name: "Add task", exact: true }).click()
            assert.equal(await tasks.getByRole("listitem").count(), 3)
            await page.getByRole("button", { name: "Remove first task", exact: true }).click()
            assert.equal(await tasks.getByRole("listitem").count(), 2)
            const reportRow = tasks.getByRole("listitem").filter({ has: page.getByRole("textbox", { name: "Report", exact: true }) })
            await reportRow.getByRole("button", { name: "Remove task", exact: true }).click()
            assert.equal(await tasks.getByRole("listitem").count(), 1)
            assert.equal(await page.locator("#task-status").textContent(), "1 tasks")
            assert(await tasks.evaluate(list => document.activeElement === list), "Demo scoped removal lost focus policy")
            await page.getByRole("button", { name: "Add task", exact: true }).click()
            assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), "List demo overflow")
            await page.locator('[data-demo-example="template"]').screenshot({ path: resolve(output, `${name}-${layout}-list-template-demo.png`) })
            const primary = page.getByRole("list", { name: "Primary tasks", exact: true }).getByRole("textbox", { name: "Shared task", exact: true })
            await primary.fill("Shared source edit")
            assert.equal(await page.getByRole("list", { name: "Mirrored tasks", exact: true }).getByRole("textbox", { name: "Shared task", exact: true }).inputValue(), "Shared source edit")
            await page.locator('[data-demo-example="sources"]').screenshot({ path: resolve(output, `${name}-${layout}-list-source-demo.png`) })
            assert.deepEqual(errors, [])
            console.log(`${name}/${layout}: template and root ESM/classic checks passed`)
            continue
          }
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
          for (const mode of ["esm", "classic"]) await verifyAll(page, origin, mode, name, layout)
          for (const mode of ["esm", "classic"]) await verifyRoot(page, origin, mode, name, layout)
          assert.deepEqual(errors, [], `${name}/${layout}: browser errors`)
          results.push({ browser: name, version: browser.version(), layout, readyMs: Math.round(readyMs), charts: geometry, canvasColoredPixels: colored, performance: performanceSample,
            form: "passed", plugins: "passed", all: "ESM/classic passed", root: "ESM/classic passed", htmlPolicy: "passed", trustedTypes: name === "chromium" ? "fail-closed verified" : "not tested" })
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
                if (slug === "tree") {
                  const selected = page.locator("#selectable-tree")
                  await selected.getByRole("button", { name: "Report.docx", exact: true }).click()
                  await page.waitForFunction(() => document.getElementById("selectable-tree").selectedKeys[0] === "doc-2")
                  assert.equal(await page.locator("#selection-status").textContent(), "Selected: doc-2")
                  await selected.getByRole("button", { name: "Proposal.pdf", exact: true }).focus()
                  await page.keyboard.press("ArrowDown")
                  assert.equal(await page.evaluate(() => document.activeElement.textContent), "Report.docx")
                  await page.keyboard.press("Enter")
                  await page.waitForFunction(() => document.getElementById("selectable-tree").selectedKeys.length === 0)
                  await selected.scrollIntoViewIfNeeded()
                  await page.screenshot({ path: resolve(output, `${name}-${layout}-tree.png`) })
                  const checks = page.locator("#checkable-tree")
                  await checks.getByRole("checkbox", { name: "Include src", exact: true }).check()
                  assert.deepEqual(await checks.evaluate(tree => tree.getCheckedData("child").keys), ["tree", "button", "core"])
                  await checks.getByRole("checkbox", { name: "Include tree", exact: true }).uncheck()
                  assert.equal(await checks.getByRole("checkbox", { name: "Include src", exact: true }).evaluate(input => input.indeterminate), true)
                  await checks.scrollIntoViewIfNeeded()
                  await page.screenshot({ path: resolve(output, `${name}-${layout}-tree-checks.png`) })
                  const form = page.locator("#tree-form"), formTree = page.locator("#form-tree")
                  await form.getByRole("checkbox", { name: "Include LICENSE", exact: true }).check()
                  await form.getByRole("button", { name: "LICENSE", exact: true }).click()
                  await page.waitForFunction(() => document.getElementById("form-tree").selectedKeys.length === 2)
                  await form.getByRole("button", { name: "Read checked files", exact: true }).click()
                  assert.equal(await page.locator("#form-status").textContent(), "Files: readme, license")
                  await form.getByRole("button", { name: "Reset files", exact: true }).click()
                  assert.deepEqual(await formTree.evaluate(tree => tree.checkedKeys), ["readme"])
                  assert.deepEqual(await formTree.evaluate(tree => tree.selectedKeys), ["readme", "license"])
                  const reconnect = await formTree.evaluate(tree => {
                    const parent = tree.parentElement, input = tree.nodes[0].checkbox
                    tree.remove(); parent.append(tree)
                    return { same: tree.nodes[0].checkbox === input, connected: tree.connected, keys: tree.selectedKeys }
                  })
                  assert.deepEqual(reconnect, { same: true, connected: true, keys: ["readme", "license"] })
                  const detachedEdit = await formTree.evaluate(tree => {
                    const parent = tree.parentElement
                    tree.remove(); tree.querySelector('m-tree-node[value="license"]').remove(); parent.append(tree)
                    return { connected: tree.connected, keys: tree.selectedKeys }
                  })
                  assert.deepEqual(detachedEdit, { connected: true, keys: ["readme"] })
                  const lazy = page.locator("#lazy-tree")
                  await lazy.locator("summary").focus()
                  await page.keyboard.press("Enter")
                  await lazy.getByRole("button", { name: "Remote README", exact: true }).waitFor()
                  assert.equal(await page.locator("#lazy-status").textContent(), "Remote files loaded")
                  await lazy.getByRole("button", { name: "Remote README", exact: true }).click()
                  await page.waitForFunction(() => document.getElementById("lazy-tree").selectedKeys[0] === "remote-readme")
                  await lazy.scrollIntoViewIfNeeded()
                  await page.screenshot({ path: resolve(output, `${name}-${layout}-tree-lazy.png`) })
                  assert.equal(await page.locator("m-tree[role],m-tree-node[role],m-tree[tabindex],m-tree-node[tabindex]").count(), 0)
                  assert.equal(await page.evaluate(() => !!customElements.get("m-cascader") || !!customElements.get("m-tree-select")), false)
                }
                if (slug === "cascader") {
                  const basic = page.locator("#basic-cascader")
                  await basic.getByRole("combobox", { name: "Destination 1", exact: true }).selectOption("eu")
                  assert.deepEqual(await basic.evaluate(element => element.path), ["eu"])
                  assert.equal(await basic.evaluate(element => element.value), null)
                  await basic.getByRole("combobox", { name: "Destination 2", exact: true }).selectOption("fr")
                  await basic.getByRole("combobox", { name: "Destination 3", exact: true }).selectOption("paris")
                  assert.equal(await basic.evaluate(element => element.value), "paris")
                  await basic.scrollIntoViewIfNeeded()
                  await page.screenshot({ path: resolve(output, `${name}-${layout}-cascader.png`) })
                  const form = page.locator("#cascader-form"), field = page.locator("#form-cascader")
                  await field.getByRole("combobox", { name: "Place 1", exact: true }).selectOption("us")
                  assert.equal(await form.locator("form").evaluate(form => form.checkValidity()), false)
                  await field.getByRole("combobox", { name: "Place 2", exact: true }).selectOption("nyc")
                  await form.getByRole("button", { name: "Read path", exact: true }).click()
                  assert.equal(await page.locator("#form-value").textContent(), "Path: us / nyc")
                  const reconnect = await field.evaluate(element => {
                    const parent = element.parentElement, control = element.controls[0]
                    element.remove(); parent.append(element)
                    return { same: element.controls[0] === control, value: element.value, defaultValue: element.defaultValue }
                  })
                  assert.deepEqual(reconnect, { same: true, value: "nyc", defaultValue: "paris" })
                  await form.getByRole("button", { name: "Reset path", exact: true }).click()
                  await page.waitForFunction(() => document.getElementById("form-cascader").value === "paris")
                  await field.getByRole("button", { name: "Clear", exact: true }).click()
                  await page.waitForFunction(() => document.getElementById("form-cascader").path.length === 0)
                  assert.equal(await form.locator("form").evaluate(form => form.checkValidity()), false)
                  const lazy = page.locator("#lazy-cascader")
                  await lazy.getByRole("combobox", { name: "Remote destination 1", exact: true }).selectOption("remote")
                  await lazy.getByRole("combobox", { name: "Remote destination 2", exact: true }).locator("option[value=remote-city]").waitFor({ state: "attached" })
                  assert.equal(await lazy.evaluate(element => element.value), null)
                  await lazy.getByRole("combobox", { name: "Remote destination 2", exact: true }).selectOption("remote-city")
                  assert.equal(await lazy.evaluate(element => element.value), "remote-city")
                  await lazy.scrollIntoViewIfNeeded()
                  await page.screenshot({ path: resolve(output, `${name}-${layout}-cascader-lazy.png`) })
                  assert.equal(await page.locator("m-cascader[role],m-cascader[tabindex]").count(), 0)
                  assert.equal(await page.evaluate(() => !!customElements.get("m-tree") || !!customElements.get("m-select") || !!customElements.get("m-tree-select")), false)
                }
                if (slug === "upload") {
                  const basic = page.locator("#basic-upload")
                  await basic.locator('input[type="file"]').setInputFiles({ name: "report.txt", mimeType: "text/plain", buffer: Buffer.from("local report") })
                  assert.equal(await basic.evaluate(element => element.files[0].status), "pending")
                  const actions = basic.locator("[data-upload-actions]")
                  await actions.getByRole("button", { name: "Start", exact: true }).click()
                  await page.waitForFunction(() => document.getElementById("basic-upload").files[0].loaded > 0)
                  assert.equal(await basic.locator("progress").isVisible(), true)
                  await basic.scrollIntoViewIfNeeded()
                  await page.screenshot({ path: resolve(output, `${name}-${layout}-upload.png`) })
                  await actions.getByRole("button", { name: "Cancel", exact: true }).click()
                  await page.waitForFunction(() => document.getElementById("basic-upload").files[0].status === "cancelled")
                  await basic.getByRole("button", { name: "Retry", exact: true }).click()
                  await page.waitForFunction(() => document.getElementById("basic-upload").files[0].status === "finished")
                  const reconnected = await basic.evaluate(element => {
                    const parent = element.parentElement, input = element.native
                    element.remove(); parent.append(element)
                    return { same: element.native === input, status: element.files[0].status }
                  })
                  assert.deepEqual(reconnected, { same: true, status: "pending" })
                  const chooser = page.waitForEvent("filechooser")
                  await basic.getByRole("button", { name: "Select File", exact: true }).focus()
                  await page.keyboard.press("Enter")
                  await (await chooser).setFiles({ name: "keyboard.txt", mimeType: "text/plain", buffer: Buffer.from("keyboard") })
                  assert.equal(await basic.evaluate(element => element.files[0].name), "keyboard.txt")
                  const form = page.locator("#upload-form"), field = page.locator("#form-upload")
                  await field.locator('input[type="file"]').setInputFiles({ name: "attachment.txt", mimeType: "text/plain", buffer: Buffer.from("attachment") })
                  await form.getByRole("button", { name: "Read files", exact: true }).click()
                  assert.equal(await page.locator("#form-value").textContent(), "Files: attachment.txt")
                  await form.getByRole("button", { name: "Reset files", exact: true }).click()
                  await page.waitForFunction(() => document.getElementById("form-upload").files.length === 0)
                  await page.locator("#dragger-upload").evaluate(element => {
                    const transfer = new DataTransfer(); transfer.items.add(new File(["flat"], "dropped.txt"))
                    element.querySelector("m-upload-dragger").dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: transfer }))
                    if (element.files[0]?.name !== "dropped.txt") throw new Error("Portable Upload drop did not reach its queue")
                  })
                  await page.locator("#dragger-upload").scrollIntoViewIfNeeded()
                  await page.screenshot({ path: resolve(output, `${name}-${layout}-upload-drop.png`) })
                  assert.equal(await page.locator("#disabled-upload input").isDisabled(), true)
                  assert.equal(await page.locator("m-upload[role],m-upload[tabindex],m-upload-dragger[role=button]").count(), 0)
                  assert.equal(await page.evaluate(() => !!customElements.get("m-popover") || !!customElements.get("m-progress")), false)
                }
                if (slug === "calendar") {
                  const basic = page.locator("#basic-calendar")
                  assert.equal(await page.getByRole("group", { name: "Schedule", exact: true }).count(), 1)
                  assert.equal(await page.evaluate(() => !!customElements.get("m-date-picker")), false)
                  assert.equal(await basic.locator("[data-calendar-day]").count(), 42)
                  const day = basic.locator('[data-calendar-date="2026-09-15"]')
                  await day.focus()
                  await day.press("ArrowRight")
                  assert.equal(await page.evaluate(() => document.activeElement.dataset.calendarDate), "2026-09-16")
                  assert.equal(await basic.evaluate(element => element.value), "2026-09-13")
                  await page.keyboard.press("Enter")
                  assert.equal(await basic.evaluate(element => element.value), "2026-09-16")
                  assert.equal(await page.locator("#basic-value").textContent(), "Selected date: 2026-09-16")
                  await page.keyboard.press("PageDown")
                  assert.equal(await basic.evaluate(element => element.panel), "2026-10")
                  await basic.getByRole("button", { name: "Today", exact: true }).click()
                  assert.equal(await basic.evaluate(element => element.panel), "2026-09")
                  await basic.getByRole("button", { name: "Clear selection", exact: true }).click()
                  assert.equal(await basic.evaluate(element => element.value), null)
                  await basic.scrollIntoViewIfNeeded()
                  await page.screenshot({ path: resolve(output, `${name}-${layout}-calendar.png`) })

                  const year = page.locator("#year-calendar")
                  assert.equal(await year.locator("[data-calendar-day]").count(), 12)
                  const month = year.locator('[data-calendar-date="2026-09"]')
                  await month.focus()
                  await month.press("ArrowDown")
                  assert.equal(await page.evaluate(() => document.activeElement.dataset.calendarDate), "2026-12")
                  await page.keyboard.press("Space")
                  assert.equal(await year.evaluate(element => element.value), "2026-12")
                  await page.keyboard.press("PageDown")
                  assert.equal(await year.evaluate(element => element.panel), "2027-12")
                  await year.scrollIntoViewIfNeeded()
                  await page.screenshot({ path: resolve(output, `${name}-${layout}-calendar-year.png`) })
                  assert.equal(await year.evaluate(element => {
                    const previous = element.value
                    for (const value of ["0000-01-01", "1900-02-29", "2024-02-30", "2024-00-01", "2024-01-01Z"]) {
                      try { element.value = value; return false } catch { /* Must reject without changing state. */ }
                      if (element.value !== previous) return false
                    }
                    element.value = "0001-01"
                    element.prev()
                    if (element.panel !== "0001-01") return false
                    element.value = "9999-12"
                    element.next()
                    if (element.panel !== "9999-12") return false
                    element.value = previous
                    return true
                  }), true, "Calendar validates Gregorian dates without requiring native date inputs")

                  const bounded = page.locator("#bounded-calendar")
                  assert.equal(await bounded.locator('[data-calendar-date="2026-09-16"]').getAttribute("aria-disabled"), "true")
                  await bounded.locator('[data-calendar-date="2026-09-17"]').click()
                  assert.equal(await bounded.evaluate(element => element.value), "2026-09-17")
                  await page.locator("#reset-calendar").click()
                  assert.equal(await bounded.evaluate(element => element.value), "2026-09-15")
                  await page.locator("#toggle-disabled").click()
                  assert.equal(await bounded.evaluate(element => element.state.disabled), true)
                  assert.equal(await bounded.locator('[data-calendar-action="next-month"]').isDisabled(), true)
                  await page.locator("#toggle-disabled").click()
                  assert.equal(await bounded.evaluate(element => element.state.disabled), false)
                  assert(await page.locator("#toggle-disabled").evaluate(element => element.contains(document.activeElement) || document.activeElement === document.body),
                    "Calendar updates must not steal the external button focus")
                  const identity = await bounded.evaluate(element => {
                    const table = element.table, parent = element.parentNode, next = element.nextSibling
                    element.remove()
                    parent.insertBefore(element, next)
                    return { connected: element.connected, same: element.table === table, value: element.value,
                      controls: element.querySelectorAll("[data-calendar-controls]").length }
                  })
                  assert.deepEqual(identity, { connected: true, same: true, value: "2026-09-15", controls: 1 })
                  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
                    `${name}/${layout}: Calendar page overflow`)
                  await bounded.scrollIntoViewIfNeeded()
                  await page.screenshot({ path: resolve(output, `${name}-${layout}-calendar-bounded.png`) })
                }
                if (slug === "dropdown") {
                  const basic = page.locator("#basic-dropdown"), trigger = basic.locator("m-dropdown-trigger > button")
                  await trigger.focus()
                  await page.keyboard.press("ArrowDown")
                  await page.waitForFunction(() => document.getElementById("basic-dropdown").show)
                  await page.waitForFunction(() => document.activeElement.matches('#basic-dropdown m-dropdown-item[key="edit"] > button'))
                  await page.keyboard.press("ArrowDown")
                  assert.equal(await page.evaluate(() => document.activeElement.textContent.trim()), "Preview")
                  await page.keyboard.press("Escape")
                  assert.equal(await trigger.evaluate(node => node === document.activeElement), true)
                  await trigger.press("Enter")
                  await page.waitForFunction(() => document.activeElement.matches('#basic-dropdown m-dropdown-item[key="edit"] > button'))
                  await page.keyboard.press("Enter")
                  await page.waitForFunction(() => document.getElementById("basic-dropdown").value === "edit")
                  assert.match(await page.locator("#basic-result").textContent(), /Selected edit/)
                  const cascade = page.locator("#cascade-dropdown")
                  await cascade.locator("m-dropdown-trigger > button").scrollIntoViewIfNeeded()
                  await cascade.locator("m-dropdown-trigger > button").focus()
                  await page.keyboard.press("ArrowDown")
                  await page.waitForFunction(() => document.activeElement.matches('#cascade-dropdown m-dropdown-item[key="edit"] > button'))
                  await page.keyboard.press("ArrowDown")
                  await page.keyboard.press("ArrowRight")
                  await page.waitForFunction(() => document.activeElement.matches('#cascade-dropdown m-dropdown-item[key="rename"] > button'))
                  await page.waitForFunction(() => {
                    const menu = document.querySelector('#cascade-dropdown m-dropdown-item[key="more"] > m-dropdown-menu')
                    const style = getComputedStyle(menu)
                    return menu.matches(":popover-open") && style.visibility === "visible" && Number(style.opacity) === 1
                  })
                  const bounds = await cascade.locator('m-dropdown-item[key="more"] > m-dropdown-menu').boundingBox()
                  assert(bounds && bounds.width > 0 && bounds.height > 0
                    && bounds.x >= 0 && bounds.y >= 0
                    && bounds.x + bounds.width <= page.viewportSize().width
                    && bounds.y + bounds.height <= page.viewportSize().height,
                  `Submenu must be visible inside viewport: ${JSON.stringify(bounds)}`)
                  await page.screenshot({ path: resolve(output, `${name}-${layout}-dropdown.png`) })
                  await page.keyboard.press("Escape")
                  await page.keyboard.press("Escape")
                  await page.getByRole("button", { name: "Add a native item", exact: true }).click()
                  assert.equal(await page.locator('#lifecycle-dropdown m-dropdown-item[key^="added-"] > button').count(), 1)
                  const retained = await basic.evaluate(root => {
                    const action = root.querySelector('m-dropdown-item[key="edit"] > button'), parent = root.parentElement
                    root.remove(); parent.append(root)
                    return action === root.querySelector('m-dropdown-item[key="edit"] > button')
                  })
                  assert(retained)
                  assert.equal(await page.locator("m-dropdown[role],m-dropdown-trigger[tabindex],m-dropdown-item[tabindex]").count(), 0)
                }
                if (slug === "data-table") {
                  const table = page.locator("#demo-data-table")
                  assert.deepEqual(await table.evaluate(element => Array.from(element.state.visibleKeys)), ["alpha", "bravo"])
                  await table.getByRole("button", { name: "Score", exact: true }).focus()
                  await page.keyboard.press("Enter")
                  await page.waitForFunction(() => document.querySelector("#demo-data-table").state.sort?.order === "ascending")
                  assert.deepEqual(await table.evaluate(element => Array.from(element.state.visibleKeys)), ["bravo", "charlie"])
                  await table.getByRole("button", { name: "Next", exact: true }).click()
                  assert.deepEqual(await table.evaluate(element => Array.from(element.state.visibleKeys)), ["alpha", "delta"])
                  await table.getByRole("checkbox", { name: "Select alpha", exact: true }).check()
                  await page.getByRole("button", { name: "Submit selection", exact: true }).click()
                  assert.equal(await page.locator("#submission").textContent(), '[["keys","charlie"],["keys","alpha"]]')
                  await table.getByRole("searchbox", { name: "Filter Name", exact: true }).fill("Bravo")
                  await table.getByRole("searchbox", { name: "Filter Name", exact: true }).press("Tab")
                  await page.waitForFunction(() => document.querySelector("#demo-data-table").state.visibleKeys.join() === "bravo")
                  await page.getByRole("button", { name: "Reset", exact: true }).click()
                  await page.waitForFunction(() => document.querySelector("#demo-data-table").state.sort === null)
                  assert.equal(await table.getByRole("searchbox", { name: "Filter Name", exact: true }).inputValue(), "")
                  assert.deepEqual(await table.evaluate(element => Array.from(element.state.visibleKeys)), ["alpha", "bravo"])
                  assert.deepEqual(await table.evaluate(element => Array.from(element.checkedKeys)), ["charlie", "delta"])
                  const stable = await table.evaluate(element => {
                    const native = element.native, row = native.querySelector('[data-data-key="alpha"]'), parent = element.parentElement
                    element.set({ sort: { key: "score", order: "descending" } })
                    element.remove(); parent.prepend(element)
                    return { table: element.native === native, row: native.querySelector('[data-data-key="alpha"]') === row,
                      visible: Array.from(element.state.visibleKeys) }
                  })
                  assert.deepEqual(stable, { table: true, row: true, visible: ["delta", "alpha"] })
                  await page.locator("#update-data").click()
                  assert.equal(await table.locator('[data-data-key="alpha"] td').last().textContent(), "12")
                  await table.scrollIntoViewIfNeeded()
                  await page.screenshot({ path: resolve(output, `${name}-${layout}-data-table.png`) })
                  assert.equal(await page.locator("m-data-table[role],m-data-table[tabindex]").count(), 0)
                  assert.equal(await page.evaluate(() => !!customElements.get("m-table") || !!customElements.get("m-checkbox")), false)
                }
                if (slug === "tree-select") {
                  const basic = page.locator("#basic-select"), control = basic.locator("select")
                  assert.equal(await control.inputValue(), "readme")
                  await control.selectOption("notes")
                  assert.equal(await page.locator("#basic-value").textContent(), "Selected value: notes")
                  await page.getByRole("button", { name: "Submit", exact: true }).click()
                  assert.equal(await page.locator("#form-value").textContent(), '[["file","notes"]]')
                  await page.getByRole("button", { name: "Reset", exact: true }).click()
                  await page.waitForFunction(() => document.querySelector("#basic-select").value === "readme")
                  const clear = basic.getByRole("button", { name: "Clear", exact: true })
                  await clear.focus(); await page.keyboard.press("Enter")
                  await page.waitForFunction(() => document.querySelector("#basic-select").value === null)
                  assert.equal(await control.evaluate(node => document.activeElement === node), true)
                  const multiple = page.locator("#multiple-select")
                  await multiple.locator("select").selectOption(["readme", "notes"])
                  await multiple.getByRole("searchbox").fill("Standalone")
                  assert.deepEqual(await multiple.evaluate(element => Array.from(element.value)), ["readme", "notes"])
                  assert.equal(await multiple.locator('option[value="readme"]').evaluate(option => option.hidden), false)
                  const stable = await multiple.evaluate(element => {
                    const control = element.native, option = control.querySelector('option[value="notes"]'), parent = element.parentElement
                    element.defaultValue = ["readme"]
                    element.options = [{ value: "notes", label: "Updated notes" }]
                    element.remove(); parent.append(element)
                    return { control: element.native === control, option: control.querySelector('option[value="notes"]') === option,
                      value: Array.from(element.value), missing: Array.from(element.state.unavailableDefaultKeys) }
                  })
                  assert.deepEqual(stable, { control: true, option: true, value: ["notes"], missing: ["readme"] })
                  assert.equal(await page.locator("#disabled-select select").isDisabled(), true)
                  await page.locator("#toggle-disabled").click()
                  assert.equal(await page.locator("#disabled-select select").isDisabled(), false)
                  await basic.scrollIntoViewIfNeeded()
                  await page.screenshot({ path: resolve(output, `${name}-${layout}-tree-select.png`) })
                  assert.equal(await page.locator("[data-tree-select-source], m-tree-select[role], m-tree-select[tabindex]").count(), 0)
                  assert.equal(await page.evaluate(() => !!customElements.get("m-tree") || !!customElements.get("m-select")), false)
                }
                if (slug === "heatmap") {
                  const data = await page.evaluate(() => {
                    const { buildHeatmap } = window.MarkupUIHeatmap
                    const model = buildHeatmap({ data: [{ date: "2024-02-28", value: 0 }, { date: "2024-03-01", value: null }] })
                    const rejected = ["0000-01-01", "1900-02-29", "2024-02-30", "2024-13-01", "2024-01-01Z"].every(date => {
                      try { buildHeatmap({ data: [{ date }] }); return false } catch { return true }
                    })
                    return {
                      empty: buildHeatmap().weeks,
                      cells: model.cells.filter(Boolean).map(({ date, value, supplied }) => ({ date, value, supplied })),
                      first: buildHeatmap({ range: ["0001-01-01", "0001-01-01"] }).start,
                      last: buildHeatmap({ range: ["9999-12-31", "9999-12-31"] }).end,
                      rejected,
                    }
                  })
                  assert.deepEqual(data, {
                    empty: 0,
                    cells: [
                      { date: "2024-02-28", value: 0, supplied: true },
                      { date: "2024-02-29", value: null, supplied: false },
                      { date: "2024-03-01", value: null, supplied: true },
                    ],
                    first: "0001-01-01", last: "9999-12-31", rejected: true,
                  }, "Heatmap date model needs no Document argument or native date input")
                  const basic = page.locator("#basic-heatmap"), day = basic.locator('button[data-heatmap-date="2024-02-10"]')
                  assert.equal(await day.evaluate(element => getComputedStyle(element).fontSize), "12px")
                  assert.equal(await basic.locator("tbody tr").count(), 7)
                  assert.equal(await basic.locator("button[data-heatmap-date]").count(), 29)
                  assert.equal(await basic.locator('td[data-heatmap-missing] button[data-heatmap-date="2024-02-11"]').count(), 1)
                  await day.focus()
                  await page.keyboard.press("Enter")
                  assert.equal(await page.locator("#heatmap-value").textContent(), "2024-02-10: 0")
                  await page.keyboard.press("ArrowRight")
                  assert.equal(await page.evaluate(() => document.activeElement.dataset.heatmapDate), "2024-02-17")
                  await page.keyboard.press("Control+End")
                  assert.equal(await page.evaluate(() => document.activeElement.dataset.heatmapDate), "2024-02-29")
                  const stable = await basic.evaluate(element => {
                    const button = element.querySelector('button[data-heatmap-date="2024-02-29"]')
                    element.settings = { loading: true, domain: [-2, 4] }
                    return { same: element.querySelector('button[data-heatmap-date="2024-02-29"]') === button,
                      focus: document.activeElement === button, clamped: element.model.cells.find(cell => cell?.date === "2024-02-29").clamped }
                  })
                  assert.deepEqual(stable, { same: true, focus: true, clamped: "high" })
                  await page.getByRole("button", { name: "Update values", exact: true }).click()
                  assert.equal(await basic.evaluate(element => element.model.cells.find(cell => cell?.date === "2024-02-10").value), 4)
                  const reconnect = await basic.evaluate(element => {
                    const parent = element.parentElement, table = element.native
                    element.explore("2024-02-10"); element.remove(); parent.append(element)
                    return { table: element.native === table, date: element.state.currentDate, cells: element.state.cells }
                  })
                  assert.deepEqual(reconnect, { table: true, date: "2024-02-10", cells: 29 })
                  await basic.scrollIntoViewIfNeeded()
                  await page.screenshot({ path: resolve(output, `${name}-${layout}-heatmap.png`) })
                  assert.equal(await page.locator("#year-heatmap").evaluate(element => element.state.cells), 366)
                  assert.equal(await page.locator("m-heatmap[role],m-heatmap[tabindex]").count(), 0)
                  assert.equal(await page.evaluate(() => !!customElements.get("m-calendar") || !!customElements.get("m-chart")), false)
                }
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
              } catch (error) {
                failure = [...new Set([error.stack ?? error.message, ...errors, ...failedResources])].join("\n")
                await page.screenshot({ path: resolve(output, `${name}-${layout}-${slug}-failure.png`) })
              }
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
  if (!process.argv.includes("--templates")) await writeFile(resolve(output, "results.json"), JSON.stringify({ date: new Date().toISOString(), results }, null, 2))
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
