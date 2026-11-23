import assert from "node:assert/strict"
import { spawn } from "node:child_process"
import { readFile } from "node:fs/promises"
import { chromium } from "playwright"
import "../demo/site/catalog.js"

const { pages, coveredFamilies } = globalThis.FieldnotesCatalog

const manifest = JSON.parse(await readFile(new URL("../dist/manifest.json", import.meta.url), "utf8"))
const families = Object.keys(manifest.componentPayloads).filter(name => !["global-style", "scrollbar"].includes(name))
assert.deepEqual(coveredFamilies, families.sort(), "The showcase must account for every selectable runtime family.")
const contracts = await Promise.all(families.map(async family => ({
  family, ...JSON.parse(await readFile(new URL(`../demo/api/${family}.json`, import.meta.url), "utf8")),
})))
const errorsToWatch = [...new Set(contracts.flatMap(contract =>
  contract.elements.flatMap(element => element.events.filter(event => event.web.includes("error")).map(event => event.web)),
))]
const server = spawn(process.execPath, ["demo/server.mjs"], {
  env: { ...process.env, PORT: "0" }, windowsHide: true, stdio: ["ignore", "pipe", "pipe"],
})
let browser
try {
  const origin = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Showcase server did not start.")), 15000)
    server.once("error", error => { clearTimeout(timer); reject(error) })
    server.once("exit", code => { clearTimeout(timer); reject(new Error(`Showcase server exited: ${code}`)) })
    server.stdout.on("data", data => {
      const match = String(data).match(/http:\/\/localhost:\d+/)
      if (match) { clearTimeout(timer); resolve(match[0]) }
    })
    server.stderr.on("data", data => process.stderr.write(data))
  })
  browser = await chromium.launch()
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: "reduce" })
    const page = await context.newPage()
    page.setDefaultTimeout(10000)
    const failures = []
    const usedTags = new Set()
    page.on("pageerror", error => failures.push(error.message))
    page.on("console", message => { if (message.type() === "error") failures.push(message.text()) })
    page.on("response", response => { if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`) })
    await page.addInitScript(events => {
      for (const name of events) document.addEventListener(name, event =>
        console.error(`${name} on ${event.target.localName}#${event.target.id}: ${event.detail?.error?.message ?? event.detail?.message ?? JSON.stringify(event.detail)}`), true)
    }, errorsToWatch)
    async function visit(file) {
      failures.length = 0
      await page.goto(`${origin}/demo/site/${file}`)
      await page.waitForFunction(() => document.body.dataset.ready === "true" || !document.getElementById("site-error").hidden)
      await page.waitForLoadState("networkidle")
      assert.equal(await page.locator("#site-error").textContent(), "", `${file} initialization`)
      assert.deepEqual(failures, [], `${file} browser errors at ${width}px`)
      const delivery = await page.evaluate(() => ({
        modules: document.querySelectorAll('script[type="module"]').length,
        libraries: performance.getEntriesByType("resource")
          .map(entry => new URL(entry.name).pathname)
          .filter(path => path.startsWith("/dist/") && path.endsWith(".js"))
          .sort(),
        missingIcons: [...document.querySelectorAll("#site-sidebar m-icon img")]
          .filter(image => !image.complete || !image.naturalWidth).length,
      }))
      assert.equal(delivery.modules, 0, "Fieldnotes pages must use ordinary scripts.")
      assert.deepEqual(delivery.libraries, [
        "/dist/markup-ui-all.global.js", "/dist/markup-ui-chart-renderer.global.js",
        "/dist/markup-ui-core.global.js", "/dist/markup-ui-state.global.js", "/dist/markup-ui.global.js",
      ], "The classic demo must not mix aggregate and selected/ESM component runtimes.")
      assert.equal(delivery.missingIcons, 0, "Shared-fragment icons must load.")
      const geometry = await page.evaluate(() => ({
        width: innerWidth, actual: document.documentElement.scrollWidth,
        invalid: [...document.querySelectorAll('[data-state="invalid"]')].map(element => element.localName),
      }))
      assert.ok(geometry.actual <= geometry.width + 1, `${file} overflows at ${width}px: ${geometry.actual}px`)
      assert.deepEqual(geometry.invalid, [], `${file} invalid components`)
    }
    const click = selector => page.locator(selector).click()
    const text = selector => page.locator(selector).textContent()
    async function recordTags() {
      for (const tag of await page.evaluate(() => [...new Set([...document.querySelectorAll("*")].map(element => element.localName))])) usedTags.add(tag)
    }
    for (const entry of pages) {
      await visit(entry.file)
      await recordTags()
      if (entry.id === "overview") {
        await click("#complete-review button")
        assert.ok(await page.locator("#review-empty").isVisible())
        await click("#refresh-overview button")
        await page.waitForFunction(() => !document.getElementById("refresh-overview").disabled)
        assert.ok(await page.locator("#overview-stats").isVisible())
        await click("#toggle-note button")
        assert.equal(await page.locator("#toggle-note").getAttribute("aria-expanded"), "false")
        await click('#account-menu > m-dropdown-trigger > button')
        assert.ok(await page.locator('#account-menu m-dropdown-menu').evaluate(element => element.matches(":popover-open")))
        await page.keyboard.press("Escape")
        await click("#notifications-toggle button")
        assert.ok(await page.locator("#notifications").evaluate(element => element.open))
        await click("#read-notifications button")
        if (width === 390) {
          await click("#mobile-nav-toggle button")
          await click('#mobile-nav m-menu-item[value="projects"]')
          await page.waitForURL("**/projects.html")
        }
      } else if (entry.id === "projects") {
        await click("#new-project button")
        await page.locator("#project-name input").fill("Browser-created project")
        await click('#project-form m-button[attr-type="submit"] button')
        await page.waitForFunction(() => !document.getElementById("project-modal").open)
        await page.locator("#project-search input").fill("Browser-created")
        assert.match(await text("#project-table"), /Browser-created project/)
        await page.reload()
        await page.waitForFunction(() => document.body.dataset.ready === "true")
        await page.locator("#project-search input").fill("Browser-created")
        assert.match(await text("#project-table"), /Browser-created project/)
        await page.locator('#project-table tbody input[type="checkbox"]').check()
        await click("#archive-projects m-popconfirm-trigger button")
        await page.getByRole("button", { name: "Archive", exact: true }).click()
        await page.waitForFunction(() => !document.getElementById("project-table").textContent.includes("Browser-created project"))
        await page.locator("#project-search input").fill("<not a project>")
        assert.match(await text("#project-summary"), /0 of/)
        await click("#advance-launch button")
        await click("#advance-launch button")
        assert.ok(await page.locator("#advance-launch button").isDisabled())
        assert.equal(await page.locator("#launch-steps m-step[data-step-state='finish']").count(), 3)
      } else if (entry.id === "team") {
        await page.locator("#people-search input").fill("Morgan")
        assert.equal(await page.locator("#people-grid .person").count(), 1)
        await page.locator("#people-search input").fill("Nobody-by-this-name")
        assert.ok(await page.locator("#people-empty").isVisible())
        await page.locator("#people-search input").fill("")
        await page.locator("#people-pages").getByRole("button", { name: "2", exact: true }).click()
        assert.match(await text("#people-grid"), /Casey Reed/)
        await page.locator("#team-message textarea").fill("Thanks @alex for the thoughtful review.")
        await click("#preview-message button")
        assert.match(await text("#message-copy"), /Thanks @alex/)
      } else if (entry.id === "insights") {
        await page.waitForFunction(() => document.getElementById("delivery-chart").state === "ready")
        await click("#period-label button")
        await page.locator("#report-period select").selectOption("week")
        assert.equal(await text("#period-label"), "By week")
        await page.locator("#focus-target input").fill("30")
        await page.locator("#focus-target input").dispatchEvent("input")
        assert.match(await text("#focus-label"), /30 hours/)
        const downloadPromise = page.waitForEvent("download")
        await click("#export-report button")
        const download = await downloadPromise
        assert.equal(download.suggestedFilename(), "fieldnotes-sample-report.csv")
      } else if (entry.id === "library") {
        assert.equal(await text("#coverage-count"), "89 / 89 families")
        assert.equal(await page.locator("#coverage-grid .coverage-card").count(), 6)
        await click("#last-entry button")
        await page.waitForFunction(() => document.getElementById("notebook").textContent.includes("1000"))
        assert.ok(await page.locator("#notebook li").count() < 30, "The notebook must actually virtualize.")
        await click("#more-notes button")
        assert.match(await text("#feed-status"), /(?:12|18|24|30) of 30/)
        await page.locator("#note-search input").fill("small")
        assert.equal(await page.locator("#studio-mantra mark").first().textContent(), "small")
        await click("#log-entry button")
        assert.match(await text("#activity-log"), /note 1/)
      } else if (entry.id === "settings") {
        await page.locator("#workspace-name input").fill("Browser test studio")
        await click("#save-settings button")
        assert.match(await text("#toast-region"), /saved/)
        await page.reload()
        await page.waitForFunction(() => document.body.dataset.ready === "true")
        assert.equal(await page.locator("#workspace-name input").inputValue(), "Browser test studio")
        await page.locator("#sample-code input").fill("123456")
        await click("#verify-code button")
        assert.ok(await page.locator("#verification-result").isVisible())
        await page.locator("#studio-assets input[type=file]").setInputFiles({
          name: "sample.svg", mimeType: "image/svg+xml",
          buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"></svg>'),
        })
        assert.match(await text("#asset-status"), /1 file selected/)
        await page.evaluate(() => localStorage.setItem("unrelated-test-key", "keep"))
        await click("#reset-workspace button")
        await click("#confirm-reset button")
        await page.waitForFunction(() => document.body.dataset.ready === "true" && document.getElementById("workspace-name").value === "Studio workspace")
        assert.equal(await page.evaluate(() => localStorage.getItem("fieldnotes:projects")), null)
        assert.equal(await page.evaluate(() => localStorage.getItem("unrelated-test-key")), "keep")
      }
      await recordTags()
      assert.deepEqual(failures, [], `${entry.id} interaction errors at ${width}px`)
      console.log(`${width}px ${entry.title}: passed`)
    }
    const unused = contracts.filter(contract => !contract.elements.some(element => usedTags.has(element.web.primary)))
    assert.deepEqual(unused.map(contract => contract.family), [], "Declared coverage must have real elements, not just imports.")

    await visit("index.html")
    await page.evaluate(() => {
      window.shellNodes = ["site-header", "site-sidebar", "site-footer", "site-overlays", "main"]
        .map(id => document.getElementById(id))
      window.shellDocument = document
    })
    const navigationRequests = []
    const recordRequest = request => navigationRequests.push({ url: request.url(), type: request.resourceType() })
    page.on("request", recordRequest)
    async function waitForPage(id) {
      await page.waitForFunction(id => document.body.dataset.page === id && document.body.dataset.ready === "true", id)
      await page.waitForLoadState("networkidle")
      assert.equal(await page.evaluate(() => document === window.shellDocument &&
        window.shellNodes.every(node => node === document.getElementById(node.id))), true,
      "Navigation must retain the actual shared shell nodes and document.")
      assert.equal(await page.locator("#site-error").textContent(), "", `${id} partial initialization`)
      assert.equal(await page.locator("#desktop-navigation [aria-current=page]").getAttribute("value"), id)
      assert.equal(await page.locator("#mobile-navigation [aria-current=page]").getAttribute("value"), id)
      assert.equal(await page.locator("#current-page").textContent(), (await page.title()).replace(" - Fieldnotes", ""))
      assert.deepEqual(failures, [], `${id} partial-navigation errors at ${width}px`)
    }
    async function selectPage(id) {
      const navigation = width === 390 ? "#mobile-navigation" : "#desktop-navigation"
      if (width === 390) await click("#mobile-nav-toggle button")
      await click(`${navigation} m-menu-item[value="${id}"]`)
      await waitForPage(id)
      assert.equal(await page.locator("#mobile-nav").evaluate(element => element.open), false)
    }
    for (const id of ["projects", "team", "insights", "library", "settings", "overview", "library", "insights"]) {
      await selectPage(id)
      if (id === "projects") {
        await click("#new-project button")
        await page.locator("#project-name input").fill("Partial navigation project")
        await click('#project-form m-button[attr-type="submit"] button')
        await page.waitForFunction(() => !document.getElementById("project-modal").open)
        await page.locator("#project-search input").fill("Partial navigation")
        assert.match(await text("#project-table"), /Partial navigation project/)
      } else if (id === "team") {
        await page.locator("#people-search input").fill("Morgan")
        assert.equal(await page.locator("#people-grid .person").count(), 1)
      } else if (id === "insights") {
        await page.waitForFunction(() => document.getElementById("delivery-chart").state === "ready")
        await click("#period-label button")
        await page.locator("#report-period select").selectOption("week")
        assert.equal(await text("#period-label"), "By week")
      } else if (id === "library") {
        assert.equal(await page.locator("#coverage-grid .coverage-card").count(), 6)
        await click("#last-entry button")
        await page.waitForFunction(() => document.getElementById("notebook").textContent.includes("1000"))
        await click("#log-entry button")
        assert.match(await text("#activity-log"), /note 1/)
        assert.doesNotMatch(await text("#activity-log"), /note 2/)
      }
    }
    await page.goBack()
    await waitForPage("library")
    await page.goForward()
    await waitForPage("insights")
    await selectPage("overview")
    await click("#refresh-overview button")
    await click("#explore-projects button")
    await waitForPage("projects")
    await page.waitForTimeout(750)
    assert.doesNotMatch(await text("#toast-region"), /Sample overview refreshed/,
      "Leaving Overview must cancel its pending refresh.")
    await selectPage("library")
    await click('#coverage-grid m-link[href="./team.html"] a')
    await waitForPage("team")
    await click("#account-menu > m-dropdown-trigger > button")
    await click('#account-menu m-dropdown-item[key="settings"] a')
    await waitForPage("settings")
    assert.equal(await page.locator("#account-menu m-dropdown-menu").evaluate(element => element.matches(":popover-open")), false)
    await click('#site-header m-breadcrumb-item[href="./index.html"] a')
    await waitForPage("overview")
    await page.evaluate(() => Fieldnotes.navigate("./library.html#coverage"))
    await waitForPage("library")
    assert.equal(await page.evaluate(() => document.activeElement.id), "main")
    assert.equal(new URL(page.url()).hash, "#coverage")
    await selectPage("team")
    assert.equal(navigationRequests.filter(request => request.type === "document").length, 0)
    assert.equal(navigationRequests.filter(request => request.url.includes("/partials/")).length, 0)
    assert.equal(navigationRequests.filter(request => request.url.includes("/dist/")).length, 0)
    for (const script of ["projects.js", "team.js", "insights.js", "library.js", "settings.js", "catalog.js", "echarts.global.js"]) {
      assert.equal(navigationRequests.filter(request => request.url.endsWith(`/${script}`)).length, 1, `${script} loads once`)
    }
    page.off("request", recordRequest)

    await page.route("**/demo/site/projects.html", route => route.fulfill({ status: 503, body: "Try again later" }))
    await page.evaluate(() => Fieldnotes.navigate("./projects.html"))
    assert.match(await text("#site-error"), /503/)
    assert.match(page.url(), /team\.html$/)
    assert.equal(await page.locator("#people-grid .person").count(), 6)
    assert.equal(await page.locator("#main").getAttribute("aria-busy"), null)
    await page.unroute("**/demo/site/projects.html")
    failures.length = 0
    await selectPage("projects")

    let delayedRoute
    await page.route("**/demo/site/team.html", route => {
      delayedRoute = route
    })
    const requested = page.waitForRequest("**/demo/site/team.html")
    await page.evaluate(() => { window.slowNavigation = Fieldnotes.navigate("./team.html") })
    await requested
    await selectPage("library")
    await delayedRoute.fulfill({
      status: 200, contentType: "text/html",
      body: await readFile(new URL("../demo/site/team.html", import.meta.url), "utf8"),
    })
    await page.evaluate(() => window.slowNavigation)
    await page.unroute("**/demo/site/team.html")
    await waitForPage("library")
    console.log(`${width}px persistent shell, page lifecycles, history, failure/retry and navigation race: passed`)

    await page.route("**/demo/site/partials/header.html", route => route.fulfill({ status: 404, body: "Missing fragment" }))
    await page.goto(`${origin}/demo/site/`)
    await page.locator("#site-error").waitFor({ state: "visible" })
    await page.waitForLoadState("networkidle")
    assert.match(await text("#site-error"), /404/)
    assert.notEqual(await page.locator("body").getAttribute("data-ready"), "true")
    await page.unroute("**/demo/site/partials/header.html")
    failures.length = 0
    await page.goto(`${origin}/demo/ui-api.html`)
    await page.waitForFunction(() => document.body.dataset.ready === "true")
    await page.getByRole("button", { name: "Count a click" }).click()
    assert.equal(await text("#builder-count"), "Clicked 1 time.")
    const actionButton = page.getByRole("button", { name: "Send an action" })
    await actionButton.click()
    assert.match(await text("#agent-example"), /host handled 1 action/)
    assert.equal(JSON.parse(await text("#action-output")).action.context.count, 0)
    await actionButton.press("Enter")
    assert.equal(JSON.parse(await text("#action-output")).action.context.count, 1)
    assert.equal(await actionButton.evaluate(element => element === document.activeElement), true)
    await page.getByRole("button", { name: "Update from host" }).click()
    assert.match(await text("#agent-example"), /Updated by the host/)
    await page.getByRole("button", { name: "Reset surface" }).click()
    assert.equal(await text("#action-output"), "No actions yet.")
    await actionButton.click()
    assert.equal(JSON.parse(await text("#action-output")).action.surfaceId, "example-2")
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true)
    assert.equal(await page.locator("#demo-error").isVisible(), false)
    assert.deepEqual(failures, [], `UI/A2UI browser errors at ${width}px`)
    console.log(`${width}px JavaScript UI and A2UI: passed`)
    await context.close()
  }
  console.log("Fieldnotes: 6 pages, 89 runtime families, desktop/mobile workflows passed.")
} finally {
  await browser?.close()
  server.kill()
}
