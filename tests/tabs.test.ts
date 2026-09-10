import { readFileSync } from "node:fs"
import { afterEach, describe, expect, it, vi } from "vitest"
import { createTabs } from "../src/components/tabs/index.js"
import type { TabsController, TabsOptions } from "../src/components/tabs/index.js"

const controllers: TabsController[] = []
let sequence = 0
function nodes() {
  const id = `tabs-${sequence++}`
  const root = document.createElement("div")
  root.className = "mui-tabs"
  root.setAttribute("data-tabs", "")
  root.innerHTML = `
    <div data-tabs-bar><span data-tabs-prefix>Prefix</span><div data-tabs-list aria-label="Local views">
      <button type="button" data-tabs-tab data-tabs-key="one" data-tabs-target="${id}-one-pane" data-tabs-closable id="${id}-one-tab">One</button>
      <button type="button" data-tabs-tab data-tabs-key="two" data-tabs-target="${id}-two-pane" id="${id}-two-tab"><span>Two</span></button>
      <button type="button" data-tabs-tab data-tabs-key="three" data-tabs-target="${id}-three-pane" id="${id}-three-tab">Three</button>
    </div><span data-tabs-suffix>Suffix</span></div>
    <div data-tabs-panels>
      <section data-tabs-pane id="${id}-one-pane"><h2>One</h2><input value="Preserved"></section>
      <section data-tabs-pane id="${id}-two-pane"><h2>Two</h2><button type="button">Pane action</button></section>
      <section data-tabs-pane id="${id}-three-pane"><h2>Three</h2><p>Third pane.</p></section>
    </div>
    <div data-tabs-messages><p data-tabs-empty hidden>No available views.</p><p data-tabs-status role="status" hidden>Checking switch.</p><p data-tabs-error role="alert" hidden>Switch failed. Try again.</p></div>
    <div data-tabs-actions><button type="button" data-tabs-add>Add</button><button type="button" data-tabs-close="one">Close One</button></div>`
  document.body.append(root)
  for (const element of [root, ...root.querySelectorAll<HTMLElement>("*")]) {
    const rect = { x: 10, y: 10, left: 10, top: 10, right: 110, bottom: 40, width: 100, height: 30, toJSON() {} } as DOMRect
    element.getBoundingClientRect = () => rect
    element.getClientRects = () => [rect] as unknown as DOMRectList
    element.scrollIntoView = vi.fn()
  }
  const tab = (key: string) => root.querySelector<HTMLButtonElement>(`[data-tabs-key="${key}"]`)!
  const pane = (key: string) => document.getElementById(`${id}-${key}-pane`)!
  return { root, tab, pane, list: root.querySelector<HTMLElement>("[data-tabs-list]")!,
    error: root.querySelector<HTMLElement>("[data-tabs-error]")!, status: root.querySelector<HTMLElement>("[data-tabs-status]")!,
    empty: root.querySelector<HTMLElement>("[data-tabs-empty]")! }
}
function bind(options: TabsOptions = {}) {
  const pair = nodes()
  const controller = createTabs(pair.root, options)
  controllers.push(controller)
  return { ...pair, controller }
}
function key(node: HTMLElement, key: string, extra: KeyboardEventInit = {}) {
  const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true, ...extra })
  node.dispatchEvent(event)
  return event
}
function deferred() {
  let resolve!: (value: boolean) => void
  let reject!: (error: unknown) => void
  const promise = new Promise<boolean>((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}
async function flush() {
  await new Promise(resolve => setTimeout(resolve, 0))
  await new Promise(resolve => setTimeout(resolve, 0))
  for (let index = 0; index < 6; index++) await Promise.resolve()
}
afterEach(() => {
  for (const controller of controllers.splice(0)) controller.disconnect()
  document.body.replaceChildren()
  vi.restoreAllMocks()
})

describe("authored Tabs, Tab and TabPane contracts", () => {
  it("creates one semantic owner and explicit tab/pane associations without replacing nodes or pane state", async () => {
    const { root, list, tab, pane, controller } = bind()
    const content = pane("one").querySelector("input")!
    const text = tab("two").firstChild
    content.value = "Edited state"
    expect(list.getAttribute("role")).toBe("tablist")
    expect(tab("one").getAttribute("role")).toBe("tab")
    expect(tab("one").getAttribute("aria-controls")).toBe(pane("one").id)
    expect(pane("one").getAttribute("aria-labelledby")).toContain(tab("one").id)
    expect(pane("one").getAttribute("role")).toBe("tabpanel")
    expect(tab("one").getAttribute("aria-selected")).toBe("true")
    expect(tab("one").tabIndex).toBe(0)
    expect(tab("two").tabIndex).toBe(-1)
    expect(pane("two").hidden).toBe(true)
    tab("two").click()
    await flush()
    expect(controller.value).toBe("two")
    expect(pane("one").hidden).toBe(true)
    controller.value = "one"
    expect(content.value).toBe("Edited state")
    expect(tab("two").firstChild).toBe(text)
    expect(root.querySelectorAll("[role=tablist]")).toHaveLength(1)
  })
  it("honors value/default precedence and applies defaults only once", async () => {
    const { controller, tab } = bind({ value: "two", defaultValue: "one" })
    expect(controller.value).toBe("two")
    controller.value = "three"
    tab("one").textContent = "Renamed"
    await flush()
    expect(controller.value).toBe("three")
    controller.disconnect()
    controller.connect()
    expect(controller.value).toBe("three")
  })
  it("rejects disabled selection and recovers the transient selected-plus-disabled state", async () => {
    const { controller, tab, pane } = bind()
    tab("one").disabled = true
    expect(tab("one").getAttribute("aria-selected")).toBe("true")
    expect(() => { controller.value = "one" }).toThrow(RangeError)
    await flush()
    expect(controller.value).toBe("two")
    expect(tab("one").getAttribute("aria-selected")).toBe("false")
    expect(pane("one").hidden).toBe(true)
  })
  it("restores only owned roles/tabindex/hidden/ARIA and preserves author additions", () => {
    const pair = nodes()
    pair.tab("one").setAttribute("tabindex", "3")
    pair.tab("one").setAttribute("aria-describedby", "author")
    const heading = pair.pane("one").querySelector("h2")!
    heading.id = "author-heading"
    pair.pane("one").setAttribute("aria-labelledby", heading.id)
    const controller = createTabs(pair.root)
    controllers.push(controller)
    pair.tab("two").setAttribute("tabindex", "7")
    controller.disconnect()
    expect(pair.tab("one").getAttribute("tabindex")).toBe("3")
    expect(pair.tab("two").getAttribute("tabindex")).toBe("7")
    expect(pair.tab("one").getAttribute("aria-describedby")).toBe("author")
    expect(pair.pane("one").getAttribute("aria-labelledby")).toBe("author-heading")
    expect(pair.pane("two").hidden).toBe(false)
    expect(pair.list.hasAttribute("role")).toBe(false)
  })
  it("does not invoke guards or fabricate changes for direct property assignment", async () => {
    const beforeLeave = vi.fn(() => true)
    const { root, controller } = bind({ beforeLeave })
    const change = vi.fn()
    root.addEventListener("mui:tabs-change", change)
    controller.value = "two"
    await flush()
    expect(beforeLeave).not.toHaveBeenCalled()
    expect(change).not.toHaveBeenCalled()
  })
  it("keeps nested tabsets independent, including initialization in an inactive outer pane", async () => {
    const outer = bind()
    const inner = nodes()
    outer.pane("two").append(inner.root)
    await flush()
    const nested = createTabs(inner.root)
    controllers.push(nested)
    expect(nested.value).toBe("one")
    expect(inner.tab("one").tabIndex).toBe(0)
    outer.controller.value = "two"
    inner.tab("two").click()
    await flush()
    expect(nested.value).toBe("two")
    expect(outer.controller.value).toBe("two")
    outer.controller.value = "one"
    expect(nested.value).toBe("two")
  })
  it("uses an explicit empty state for no available tabs and recovers silently when one becomes available", async () => {
    const pair = nodes()
    for (const key of ["one", "two", "three"]) pair.tab(key).disabled = true
    const controller = createTabs(pair.root)
    controllers.push(controller)
    expect(controller.value).toBeNull()
    expect(pair.empty.hidden).toBe(false)
    expect(pair.pane("one").hidden && pair.pane("two").hidden).toBe(true)
    pair.tab("two").disabled = false
    await flush()
    expect(controller.value).toBe("two")
    expect(pair.empty.hidden).toBe(true)
  })
  it("validates native controls, unique IDs, one-to-one order and required messages", () => {
    const { root, tab, pane, list } = nodes()
    tab("one").type = "submit"
    expect(() => createTabs(root)).toThrow("type=button")
    tab("one").type = "button"
    tab("two").setAttribute("data-tabs-target", pane("one").id)
    expect(() => createTabs(root)).toThrow("one unique")
    tab("two").setAttribute("data-tabs-target", pane("two").id)
    pane("two").hidden = true
    expect(() => createTabs(root)).toThrow("visible authored pane")
    pane("two").hidden = false
    list.append(root.querySelector("[data-tabs-add]")!)
    expect(() => createTabs(root)).toThrow("Only tab buttons")
  })
  it.each([{ value: 1 }, { activation: "hover" }, { placement: "bad" }, { beforeLeave: true }, { centerActiveTab: "true" }, { displayDirective: "if" }])("rejects invalid/unsupported input %j", options => {
    const { root } = nodes()
    expect(() => createTabs(root, options as TabsOptions)).toThrow()
  })
})

describe("native keyboard and activation policy", () => {
  it("automatically activates with horizontal arrows/Home/End, skipping disabled and hidden tabs", async () => {
    const { tab, controller } = bind()
    tab("two").disabled = true
    await flush()
    tab("one").focus()
    key(tab("one"), "ArrowRight")
    await flush()
    expect(document.activeElement).toBe(tab("three"))
    expect(controller.value).toBe("three")
    key(tab("three"), "Home")
    await flush()
    expect(controller.value).toBe("one")
    key(tab("one"), "End")
    await flush()
    expect(controller.value).toBe("three")
  })
  it("manual mode moves focus without activation; native click/Enter/Space remain single-owner", async () => {
    const { tab, controller } = bind({ activation: "manual" })
    const clicks = vi.fn()
    tab("two").addEventListener("click", clicks)
    tab("one").focus()
    key(tab("one"), "ArrowRight")
    await flush()
    expect(document.activeElement).toBe(tab("two"))
    expect(controller.value).toBe("one")
    key(tab("two"), "Enter")
    key(tab("two"), " ")
    expect(clicks).not.toHaveBeenCalled()
    tab("two").click()
    await flush()
    expect(clicks).toHaveBeenCalledOnce()
    expect(controller.value).toBe("two")
  })
  it("uses vertical Up/Down and logical horizontal RTL while ignoring IME/modifier keys", async () => {
    const { tab, list, controller } = bind({ placement: "start", activation: "manual" })
    tab("one").focus()
    key(tab("one"), "ArrowDown")
    expect(document.activeElement).toBe(tab("two"))
    expect(list.getAttribute("aria-orientation")).toBe("vertical")
    controller.placement = "bottom"
    list.style.direction = "rtl"
    key(tab("two"), "ArrowLeft")
    expect(document.activeElement).toBe(tab("three"))
    key(tab("three"), "Home", { ctrlKey: true })
    key(tab("three"), "Home", { isComposing: true })
    expect(document.activeElement).toBe(tab("three"))
    await flush()
  })
  it("does not trap Tab and gives only the active pane a native panel entry point", () => {
    const { tab, pane } = bind()
    tab("one").focus()
    expect(key(tab("one"), "Tab").defaultPrevented).toBe(false)
    expect(pane("one").tabIndex).toBe(0)
    expect(pane("two").hidden).toBe(true)
  })
  it("preserves form behavior and later native defaultPrevented on tab activation", async () => {
    const { root, tab, controller } = bind()
    const form = document.createElement("form")
    document.body.append(form)
    form.append(root)
    const submit = vi.fn((event: Event) => event.preventDefault())
    form.addEventListener("submit", submit)
    root.addEventListener("click", event => { if (event.target === tab("two")) event.preventDefault() })
    tab("two").click()
    await flush()
    expect(controller.value).toBe("one")
    expect(submit).not.toHaveBeenCalled()
  })
  it("uses native scrolling and never measures/repositions an animated indicator", () => {
    const { tab, controller } = bind({ centerActiveTab: true })
    expect(controller.scrollToCurrentTab()).toBe(true)
    expect(tab("one").scrollIntoView).toHaveBeenCalledWith({ block: "nearest", inline: "center", behavior: "instant" })
    controller.placement = "start"
    controller.scrollToCurrentTab()
    expect(tab("one").scrollIntoView).toHaveBeenLastCalledWith({ block: "center", inline: "nearest", behavior: "instant" })
  })
})

describe("before-leave guards and stale requests", () => {
  it("keeps the old pane on false and supports guarded silent programmatic selection", async () => {
    const hook = vi.fn(() => false)
    const { root, tab, pane, controller } = bind({ beforeLeave: hook })
    const changes = vi.fn()
    root.addEventListener("mui:tabs-change", changes)
    tab("two").click()
    await flush()
    expect(hook).toHaveBeenCalledWith("two", "one")
    expect(controller.value).toBe("one")
    expect(pane("one").hidden).toBe(false)
    expect(await controller.lastRequest).toBe(false)
    expect(changes).not.toHaveBeenCalled()
    const other = bind({ beforeLeave: () => true })
    const silent = vi.fn()
    other.root.addEventListener("mui:tabs-change", silent)
    expect(await other.controller.select("two")).toBe(true)
    expect(silent).not.toHaveBeenCalled()
  })
  it("shows pending state without disabling rapid requests; newest resolution wins", async () => {
    const first = deferred(), second = deferred()
    const { tab, pane, status, controller } = bind({ beforeLeave: next => next === "two" ? first.promise : second.promise })
    tab("two").click()
    await flush()
    const old = controller.lastRequest
    expect(controller.pending).toBe("two")
    expect(status.hidden).toBe(false)
    expect(tab("two").disabled).toBe(false)
    expect(pane("one").hidden).toBe(false)
    tab("three").click()
    await flush()
    second.resolve(true)
    await flush()
    first.resolve(true)
    await flush()
    expect(await old).toBe(false)
    expect(controller.value).toBe("three")
    expect(status.hidden).toBe(true)
  })
  it.each(["throw", "reject", "invalid"] as const)("reports %s explicitly and keeps the selected pane", async mode => {
    const error = new Error("local guard")
    const guard = () => { if (mode === "throw") throw error; return mode === "reject" ? Promise.reject(error) : "yes" as unknown as boolean }
    const { root, tab, error: region, controller } = bind({ beforeLeave: guard })
    const failures: unknown[] = []
    root.addEventListener("mui:tabs-error", event => failures.push((event as CustomEvent).detail))
    tab("two").click()
    await flush()
    await expect(controller.lastRequest).rejects.toThrow()
    expect(controller.value).toBe("one")
    expect(region.hidden).toBe(false)
    expect(failures).toHaveLength(1)
    expect(failures[0]).toMatchObject({ value: "two", previous: "one", stale: false })
  })
  it("coalesces an identical pending request and clicking the active tab cancels it", async () => {
    const pending = deferred()
    const guard = vi.fn(() => pending.promise)
    const { tab, controller } = bind({ beforeLeave: guard })
    tab("two").click()
    await flush()
    tab("two").click()
    await flush()
    expect(guard).toHaveBeenCalledOnce()
    const old = controller.lastRequest
    tab("one").click()
    await flush()
    pending.resolve(true)
    await flush()
    expect(await old).toBe(false)
    expect(controller.value).toBe("one")
    expect(controller.pending).toBeNull()
  })
  it("direct value assignment supersedes guards without emitting user changes", async () => {
    const pending = deferred()
    const { tab, controller, root } = bind({ beforeLeave: () => pending.promise })
    const change = vi.fn()
    root.addEventListener("mui:tabs-change", change)
    tab("two").click()
    await flush()
    controller.value = "three"
    pending.resolve(true)
    await flush()
    expect(controller.value).toBe("three")
    expect(change).not.toHaveBeenCalled()
  })
  it("late rejection after a newer selection is diagnostic only", async () => {
    const old = deferred()
    const { tab, root, error, controller } = bind({ beforeLeave: next => next === "two" ? old.promise : true })
    const failures: unknown[] = []
    root.addEventListener("mui:tabs-error", event => failures.push((event as CustomEvent).detail))
    tab("two").click()
    await flush()
    const promise = controller.lastRequest
    tab("three").click()
    await flush()
    const before = root.innerHTML
    old.reject(new Error("late"))
    await flush()
    await expect(promise).rejects.toThrow("late")
    expect(root.innerHTML).toBe(before)
    expect(controller.value).toBe("three")
    expect(error.hidden).toBe(true)
    expect(failures[0]).toMatchObject({ stale: true })
  })
  it("removal/refresh invalidates a guard targeting replaced nodes and does not mutate detached UI later", async () => {
    const pending = deferred()
    const { root, tab, pane, controller } = bind({ beforeLeave: () => pending.promise })
    tab("two").click()
    await flush()
    const oldPanel = pane("two")
    tab("two").remove()
    oldPanel.remove()
    await flush()
    expect(controller.pending).toBeNull()
    const before = oldPanel.outerHTML
    pending.resolve(true)
    await flush()
    expect(controller.value).toBe("one")
    expect(oldPanel.outerHTML).toBe(before)
    expect(root.querySelectorAll("[role=tabpanel]")).toHaveLength(2)
  })
  it("keeps valid guard requests through harmless label refreshes", async () => {
    const pending = deferred()
    const { tab, controller } = bind({ beforeLeave: () => pending.promise })
    tab("two").click()
    await flush()
    tab("two").textContent = "Updated label"
    await flush()
    expect(controller.pending).toBe("two")
    pending.resolve(true)
    await flush()
    expect(controller.value).toBe("two")
  })
  it("does not steal outside focus on async completion and repairs focus if its old pane is hidden", async () => {
    const pending = deferred()
    const first = bind({ beforeLeave: () => pending.promise })
    const outside = document.createElement("button")
    document.body.append(outside)
    first.tab("two").click()
    await flush()
    outside.focus()
    pending.resolve(true)
    await flush()
    expect(document.activeElement).toBe(outside)
    const next = deferred()
    const second = bind({ beforeLeave: () => next.promise })
    second.tab("two").click()
    await flush()
    second.pane("one").querySelector("input")!.focus()
    next.resolve(true)
    await flush()
    expect(document.activeElement).toBe(second.tab("two"))
  })
  it("disconnects safely even when the guard itself disposes the root", async () => {
    let controller!: TabsController
    const pair = bind({ beforeLeave: () => { controller.disconnect(); return true } })
    controller = pair.controller
    pair.tab("two").click()
    await flush()
    expect(controller.connected).toBe(false)
    expect(pair.pane("one").hidden || pair.pane("two").hidden).toBe(false)
    expect(pair.tab("two").hasAttribute("tabindex")).toBe(false)
  })
  it("publishes the request before a guard starts a newer guarded selection", async () => {
    const next = deferred()
    let controller!: TabsController
    const pair = bind({ beforeLeave: key => {
      if (key === "two") { void controller.select("three"); return true }
      return next.promise
    } })
    controller = pair.controller
    const old = controller.select("two")
    const latest = controller.lastRequest
    expect(controller.pending).toBe("three")
    expect(latest).not.toBe(old)
    next.reject(new Error("newer rejection"))
    await flush()
    expect(await old).toBe(false)
    await expect(latest).rejects.toThrow("newer rejection")
    expect(pair.error.hidden).toBe(false)
  })
  it("lets newer explicit value or guarded selection supersede an already queued native click", async () => {
    for (const guarded of [false, true]) {
      const { tab, controller } = bind()
      tab("two").addEventListener("click", () => {
        if (guarded) void controller.select("three")
        else controller.value = "three"
      })
      tab("two").click()
      await flush()
      expect(controller.value).toBe("three")
    }
  })
})

describe("add/close, refresh and distribution", () => {
  it("emits add/close intent only, never creates or destroys application DOM", async () => {
    const { root, tab } = bind()
    const add = vi.fn(), close = vi.fn()
    root.addEventListener("mui:tabs-add", add)
    root.addEventListener("mui:tabs-close", close)
    const count = root.querySelectorAll("[data-tabs-tab]").length
    ;(root.querySelector("[data-tabs-add]") as HTMLButtonElement).click()
    ;(root.querySelector("[data-tabs-close]") as HTMLButtonElement).click()
    await flush()
    expect(add).toHaveBeenCalledOnce()
    expect(close).toHaveBeenCalledOnce()
    tab("one").focus()
    key(tab("one"), "Delete")
    expect(close).toHaveBeenCalledTimes(2)
    expect(root.querySelectorAll("[data-tabs-tab]")).toHaveLength(count)
  })
  it("recovers selection/focus when the application removes a closable active pair", async () => {
    const { root, tab, pane, controller } = bind()
    root.addEventListener("mui:tabs-close", () => {
      tab("one").remove()
      pane("one").remove()
      root.querySelector("[data-tabs-close]")!.remove()
      controller.refresh()
    })
    tab("one").focus()
    key(tab("one"), "Delete")
    await flush()
    expect(controller.value).toBe("two")
    expect(document.activeElement).toBe(tab("two"))
  })
  it("refresh keeps a still-focused manual tab rather than resetting it to selected", async () => {
    const { tab, controller } = bind({ activation: "manual" })
    tab("three").focus()
    tab("one").textContent = "Updated"
    await flush()
    expect(controller.value).toBe("one")
    expect(tab("three").tabIndex).toBe(0)
    expect(document.activeElement).toBe(tab("three"))
  })
  it("repairs focused pane content when disabling its selected tab changes the active pane", async () => {
    const { tab, pane, controller } = bind()
    pane("one").querySelector("input")!.focus()
    tab("one").disabled = true
    await flush()
    expect(controller.value).toBe("two")
    expect(document.activeElement).toBe(tab("two"))
  })
  it("detects invalid dynamic associations, disconnects and restores readable panes", async () => {
    const { root, tab, pane, controller } = bind()
    const errors = vi.fn()
    root.addEventListener("mui:tabs-error", errors)
    tab("two").setAttribute("data-tabs-target", "missing")
    await flush()
    expect(controller.connected).toBe(false)
    expect(pane("one").hidden || pane("two").hidden).toBe(false)
    expect(errors).toHaveBeenCalledOnce()
  })
  it("does not retarget a deferred close intent to another pane after an author update", async () => {
    const { root, controller } = bind()
    const close = root.querySelector<HTMLButtonElement>("[data-tabs-close]")!
    const intents = vi.fn()
    root.addEventListener("mui:tabs-close", intents)
    close.addEventListener("click", () => {
      close.setAttribute("data-tabs-close", "two")
      controller.refresh()
    })
    close.click()
    await flush()
    expect(intents).not.toHaveBeenCalled()
  })
  it("recovers outer focus when removing an active pane containing a focused nested tabset", async () => {
    vi.spyOn(document, "hasFocus").mockReturnValue(true)
    const outer = bind()
    const inner = nodes()
    outer.pane("one").append(inner.root)
    await flush()
    const nested = createTabs(inner.root)
    controllers.push(nested)
    inner.tab("one").focus()
    outer.tab("one").remove()
    outer.pane("one").remove()
    outer.root.querySelector("[data-tabs-close]")!.remove()
    outer.controller.refresh()
    await flush()
    expect(outer.controller.value).toBe("two")
    expect(document.activeElement).toBe(outer.tab("two"))
    expect(nested.connected).toBe(false)
  })
  it("preserves replacement ownership and releases queued/native resources on root removal", async () => {
    const { root, controller, pane, tab } = bind()
    controller.disconnect()
    const replacement = createTabs(root)
    controllers.push(replacement)
    controller.disconnect()
    expect(() => createTabs(root)).toThrow("active controller")
    tab("two").click()
    root.remove()
    await flush()
    expect(replacement.connected).toBe(false)
    expect(pane("one")).toBeNull()
    expect(root.querySelector("[data-tabs-pane]")!.hasAttribute("hidden")).toBe(false)
  })
  it("keeps optional entries independent and external CSS covers hidden/print/motion/orientations", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8"))
    expect(pkg.exports["./tabs"].import).toBe("./dist/markup-ui-tabs.js")
    const source = readFileSync("src/components/tabs/tabs.ts", "utf8")
    const css = readFileSync("src/components/tabs/tabs.css", "utf8")
    expect(source).not.toContain("innerHTML")
    expect(source).not.toContain("createPopover")
    expect(source).not.toContain("createMenuKeyboard")
    expect(css.replace(/\s/g, "")).toContain("display:none!important")
    expect(css).toContain("prefers-reduced-motion")
    expect(css).toContain("forced-colors")
    expect(css).toContain("@media print")
    expect(css).not.toContain(":has(")
  })
})
