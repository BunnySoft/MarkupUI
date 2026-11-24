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
        const marquee = page.locator("#library-marquee")
        const motion = marquee.locator("[data-marquee-toggle]")
        await page.mouse.move(0, 0)
        const motionStyle = await motion.evaluate(button => {
          const css = getComputedStyle(button)
          return { appearance: css.appearance, height: css.minBlockSize, padding: css.paddingInlineStart,
            border: css.borderTopStyle, radius: css.borderRadius, native: button instanceof HTMLButtonElement }
        })
        assert.deepEqual(motionStyle, { appearance: "none", height: "44px", padding: "14px", border: "solid", radius: "3px", native: true })
        const lightColor = await motion.evaluate(button => getComputedStyle(button).color)
        await page.evaluate(() => document.documentElement.dataset.mTheme = "dark")
        assert.equal(await motion.evaluate(button => getComputedStyle(button).colorScheme), "dark")
        assert.notEqual(await motion.evaluate(button => getComputedStyle(button).color), lightColor)
        await page.evaluate(() => document.documentElement.dataset.mTheme = "light")
        await motion.hover()
        assert.notEqual(await motion.evaluate(button => getComputedStyle(button).color), lightColor)
        await page.mouse.move(0, 0)
        await motion.press("Enter")
        assert.equal(await motion.textContent(), "Pause motion and use static view")
        assert.equal(await motion.evaluate(button => getComputedStyle(button).outlineWidth), "3px")
        assert.equal(await marquee.getAttribute("data-marquee-running"), null, "Reduced motion must still prevent animation.")
        await motion.press("Enter")
        assert.equal(await motion.textContent(), "Play motion")
        await motion.evaluate(button => button.disabled = true)
        assert.equal(await motion.evaluate(button => getComputedStyle(button).cursor), "not-allowed")
        assert.equal(await motion.evaluate(button => getComputedStyle(button).opacity), "0.5")
        await page.emulateMedia({ forcedColors: "active" })
        assert.equal(await motion.evaluate(button => getComputedStyle(button).opacity), "1")
        await motion.evaluate(button => button.disabled = false)
        await page.emulateMedia({ forcedColors: "none" })
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
        const color = page.locator("#workspace-color")
        const apply = color.locator("[data-color-apply]")
        const mode = color.locator("[data-color-mode]")
        const draft = color.locator("[data-color-hex]")
        const language = page.locator("#workspace-language select")
        const originalColor = await color.evaluate(element => element.value)
        await page.mouse.move(0, 0)
        const controlStyles = await color.locator("button, [data-color-mode]").evaluateAll(controls => controls.map(control => {
          const css = getComputedStyle(control)
          return { border: css.borderTopStyle, thickness: css.borderTopWidth, radius: css.borderRadius, padding: css.paddingInlineStart }
        }))
        assert.deepEqual(controlStyles, Array(4).fill({ border: "solid", thickness: "1px", radius: "3px", padding: "10px" }))
        assert.equal(await apply.evaluate(button => getComputedStyle(button).appearance), "none")
        assert.notEqual(await color.locator("[data-color-control]").evaluate(input => getComputedStyle(input).appearance), "none",
          "The RGB chooser must retain its native appearance.")
        const lightColor = await apply.evaluate(button => getComputedStyle(button).color)
        await page.evaluate(() => document.documentElement.dataset.mTheme = "dark")
        assert.equal(await apply.evaluate(button => getComputedStyle(button).colorScheme), "dark")
        assert.notEqual(await apply.evaluate(button => getComputedStyle(button).color), lightColor)
        await page.evaluate(() => document.documentElement.dataset.mTheme = "light")
        await apply.hover()
        assert.notEqual(await apply.evaluate(button => getComputedStyle(button).color), lightColor)
        await page.mouse.move(0, 0)
        const fields = [
          ["draft", draft], ["language", language], ["color mode", mode],
          ["RGB chooser", color.locator("[data-color-control]")],
          ["time", page.locator("#workday-start input")],
          ["team principle", page.locator("#workspace-notes input").first()],
          ["OTP", page.locator("#sample-code input")],
        ]
        for (const select of [language, mode]) {
          assert.notEqual(await select.evaluate(control => getComputedStyle(control).appearance), "none",
            "The selects must retain native arrows and picker behavior.")
        }
        for (const theme of ["light", "dark"]) {
          await page.evaluate(theme => document.documentElement.dataset.mTheme = theme, theme)
          for (const [label, field] of fields) {
            await field.evaluate(control => control.blur())
            await page.mouse.move(0, 0)
            const fieldWidth = await field.evaluate(control => control.getBoundingClientRect().width)
            const restingBorder = await field.evaluate(control => getComputedStyle(control).borderColor)
            await field.hover()
            const hoverBorder = await field.evaluate(control => getComputedStyle(control).borderColor)
            assert.notEqual(hoverBorder, restingBorder, `${theme}: ${label} needs a themed hover border.`)
            await page.mouse.move(0, 0)
            await page.keyboard.press("Tab")
            await field.focus()
            const focused = await field.evaluate(control => {
              const css = getComputedStyle(control)
              return { border: css.borderColor, thickness: css.borderTopWidth, shadow: css.boxShadow, outline: css.outlineStyle, width: control.getBoundingClientRect().width }
            })
            assert.equal(focused.border, hoverBorder)
            assert.equal(focused.thickness, "1px", `${theme}: ${label} must keep a thin focused border.`)
            assert.equal(focused.shadow, "none", `${theme}: ${label} must not add an outer glow.`)
            assert.equal(focused.outline, "none", "Bordered fields must not stack an outline over their focus border.")
            assert.equal(focused.width, fieldWidth, `Focus styling must not change the ${label} field's width.`)
          }
          await page.keyboard.press("Tab")
          for (const control of await page.locator("#main button:enabled, #main input:enabled, #main select:enabled, #main textarea:enabled").all()) {
            if (!await control.isVisible()) continue
            await control.focus()
            const focus = await control.evaluate(element => {
              const layers = []
              for (let node = element, depth = 0; node && depth < 3; node = node.parentElement, depth++) {
                for (const pseudo of [null, "::before", "::after"]) {
                  const css = getComputedStyle(node, pseudo)
                  if (pseudo && ["none", "normal"].includes(css.content)) continue
                  layers.push({
                    part: `${node.localName}.${node.className}${pseudo ?? ""}`,
                    numberFrame: node.matches(".m-input-number") && !pseudo,
                    shadow: css.boxShadow, outline: css.outlineStyle, thickness: css.outlineWidth,
                  })
                }
              }
              return {
                focused: element.matches(":focus"), visible: element.matches(":focus-visible"),
                action: element.matches("button, [type=checkbox], [type=radio], [type=file]"), layers,
              }
            })
            assert.equal(focus.focused, true, "The actual native control must retain focus.")
            for (const layer of focus.layers) {
              if (layer.outline !== "none") assert.equal(layer.thickness, "1px", `${theme}: thick outline on ${layer.part}`)
              if (layer.numberFrame) assert.match(layer.shadow, / 0px 0px 0px 1px inset$/, "InputNumber keeps only its 1px inset border.")
              else assert.equal(layer.shadow, "none", `${theme}: stacked focus shadow on ${layer.part}`)
            }
            if (focus.action) {
              assert.equal(focus.visible, true)
              assert.equal(focus.layers[0].outline, "solid", "Actions and native toggles need a visible keyboard indicator.")
              assert.equal(focus.layers[0].thickness, "1px")
            }
          }
        }
        await page.evaluate(() => document.documentElement.dataset.mTheme = "light")
        const form = page.locator("#settings-form")
        const originalStyle = await form.evaluate(element => {
          const previous = element.style.cssText
          element.style.setProperty("--m-color-primary", "#804080")
          element.style.setProperty("--m-color-primary-hover", "#804080")
          return previous
        })
        for (const [label, field] of fields) {
          await field.focus()
          assert.equal(await field.evaluate(control => getComputedStyle(control).borderColor), "rgb(128, 64, 128)",
            `${label} must follow the supplied theme instead of a hardcoded green or blue.`)
        }
        for (const selector of ["#weekly-summary input", "#review-cadence input:checked", "#studio-assets input[type=file]", "#workspace-color [data-color-apply]"]) {
          const action = page.locator(selector)
          await action.focus()
          assert.equal(await action.evaluate(control => getComputedStyle(control).outlineColor), "rgb(128, 64, 128)")
        }
        await form.evaluate((element, style) => element.style.cssText = style, originalStyle)
        await page.emulateMedia({ forcedColors: "active" })
        for (const [label, field] of fields) {
          await field.focus()
          assert.equal(await field.evaluate(control => getComputedStyle(control).outlineStyle), "solid", `${label}: forced-colors focus`)
          assert.equal(await field.evaluate(control => getComputedStyle(control).outlineWidth), "2px", `${label}: forced-colors width`)
          assert.equal(await field.evaluate(control => getComputedStyle(control).boxShadow), "none", `${label}: forced-colors shadow`)
        }
        for (const [selector, surface, pseudo] of [
          ["#workspace-name input", "#workspace-name", "::before"],
          ["#workspace-seats input", "#workspace-seats", null],
          ["#save-settings button", "#save-settings button", null],
          ["#weekly-summary input", "#weekly-summary input", null],
          ["#review-cadence input:checked", "#review-cadence input:checked", null],
          ["#studio-assets input[type=file]", "#studio-assets input[type=file]", null],
          ["#workspace-color [data-color-apply]", "#workspace-color [data-color-apply]", null],
        ]) {
          await page.locator(selector).focus()
          assert.deepEqual(await page.locator(surface).evaluate((element, pseudo) => {
            const css = getComputedStyle(element, pseudo)
            return { outline: css.outlineStyle, thickness: css.outlineWidth, shadow: css.boxShadow }
          }, pseudo), { outline: "solid", thickness: "2px", shadow: "none" },
          `${selector} must retain an unstacked system focus indicator in forced colors.`)
        }
        await page.emulateMedia({ forcedColors: "none" })
        await language.focus()
        const normalBorder = await language.evaluate(select => getComputedStyle(select).borderColor)
        await page.locator("#workspace-language").evaluate(element => element.status = "error")
        assert.notEqual(await language.evaluate(select => getComputedStyle(select).borderColor), normalBorder,
          "Select's focus border must follow its status color.")
        await page.locator("#workspace-language").evaluate(element => { element.status = null; element.borderless = true })
        assert.equal(await language.evaluate(select => getComputedStyle(select).borderColor), "rgba(0, 0, 0, 0)")
        assert.equal(await language.evaluate(select => getComputedStyle(select).outlineStyle), "solid",
          "A borderless select must still have a visible focus indicator.")
        assert.equal(await language.evaluate(select => getComputedStyle(select).outlineWidth), "1px")
        assert.equal(await language.evaluate(select => getComputedStyle(select).outlineOffset), "-1px")
        assert.equal(await language.evaluate(select => getComputedStyle(select).boxShadow), "none")
        await page.locator("#workspace-language").evaluate(element => element.borderless = false)
        await page.locator("#workspace-language").evaluate(element => element.disabled = true)
        assert.equal(await language.isDisabled(), true)
        assert.equal(await language.evaluate(select => getComputedStyle(select).cursor), "not-allowed")
        assert.equal(await language.evaluate(select => getComputedStyle(select).boxShadow), "none")
        await page.locator("#workspace-language").evaluate(element => element.disabled = false)
        await language.selectOption("fr")
        assert.equal(await page.locator("#workspace-language").evaluate(element => element.value), "fr")
        await language.selectOption("en")
        const seats = page.locator("#workspace-seats")
        for (const status of [null, "warning", "error"]) {
          await seats.evaluate((element, status) => { element.status = status; element.borderless = status === null }, status)
          await seats.locator("input").evaluate(input => input.blur())
          await page.mouse.move(0, 0)
          const resting = await seats.evaluate(element => getComputedStyle(element).boxShadow)
          await seats.locator("input").focus()
          const focused = await seats.evaluate(element => getComputedStyle(element).boxShadow)
          assert.notEqual(focused, resting, `InputNumber must show focus with ${status ?? "borderless"} styling.`)
          assert.match(focused, / 0px 0px 0px 1px inset$/, "InputNumber must retain only a thin inset border.")
          assert.doesNotMatch(focused, /rgba\(0, 0, 0, 0\)/, "The borderless focused boundary must not be transparent.")
        }
        await seats.evaluate(element => { element.status = null; element.borderless = false })
        await color.evaluate(element => { element.showAlpha = true; element.value = "rgba(255, 128, 64, 0.333)" })
        for (const viewportWidth of new Set([width, 1016])) {
          await page.setViewportSize({ width: viewportWidth, height: 1000 })
          for (const value of ["hex", "rgb", "hsl"]) {
            await mode.selectOption(value)
            const overflow = await color.evaluate(element => {
              const bounds = element.closest("m-form-item").getBoundingClientRect()
              return [...element.querySelectorAll("input, button, select, [data-color-output]")].filter(control => control.checkVisibility())
                .filter(control => {
                  const rect = control.getBoundingClientRect()
                  return rect.left < bounds.left - 1 || rect.right > bounds.right + 1
                    || control.matches("[data-color-output]") && control.scrollWidth > control.clientWidth + 1
                }).map(control => control.localName)
            })
            assert.deepEqual(overflow, [], `ColorPicker ${value} controls overflow their Settings column at ${viewportWidth}px.`)
          }
        }
        await page.setViewportSize({ width, height: 1000 })
        await mode.selectOption("hex")
        await color.evaluate(element => { element.showAlpha = false; element.value = "#226b57"; element.restoreDraft() })
        await draft.fill("#112233")
        await apply.press("Enter")
        await page.waitForFunction(() => document.getElementById("workspace-color").value === "#112233")
        assert.equal(await apply.evaluate(button => getComputedStyle(button).outlineStyle), "solid")
        await draft.fill("#445566")
        await color.locator("[data-color-revert]").press("Enter")
        await page.waitForFunction(() => document.getElementById("workspace-color").draft === "#112233")
        await color.locator("[data-color-clear]").press("Enter")
        await page.waitForFunction(() => document.getElementById("workspace-color").value === "")
        await color.evaluate(element => element.disabled = true)
        assert.equal(await apply.isDisabled(), true)
        assert.equal(await mode.isDisabled(), true)
        assert.equal(await apply.evaluate(button => getComputedStyle(button).opacity), "0.5")
        assert.equal(await draft.evaluate(input => getComputedStyle(input).cursor), "not-allowed")
        assert.equal(await draft.evaluate(input => getComputedStyle(input).backgroundColor),
          await color.locator("[data-color-control]").evaluate(input => getComputedStyle(input).backgroundColor))
        assert.equal(await mode.evaluate(select => getComputedStyle(select).backgroundColor),
          await draft.evaluate(input => getComputedStyle(input).backgroundColor))
        assert.equal(await mode.evaluate(select => getComputedStyle(select).opacity), "1")
        await page.emulateMedia({ forcedColors: "active" })
        assert.equal(await apply.evaluate(button => getComputedStyle(button).opacity), "1")
        await page.emulateMedia({ forcedColors: "none" })
        await color.evaluate((element, value) => { element.disabled = false; element.value = value; element.restoreDraft() }, originalColor)
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
