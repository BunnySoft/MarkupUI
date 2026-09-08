import { readFileSync } from "node:fs"
import { join } from "node:path"
import { afterEach, describe, expect, it, vi } from "vitest"
import { createPagination } from "../src/components/pagination/index.js"
import { pageWindow, paginationState } from "../src/components/pagination/model.js"
import type { PaginationOptions, PaginationController } from "../src/components/pagination/index.js"

const controllers: PaginationController[] = []
function fixture() {
  const html = readFileSync(join("demo", "components", "pagination.html"), "utf8")
  const parsed = new DOMParser().parseFromString(html, "text/html")
  const nav = document.importNode(parsed.querySelector("#pager")!, true) as HTMLElement
  nav.querySelector<HTMLElement>("[data-pagination-enhancement]")!.hidden = false
  document.body.append(nav)
  return {
    nav,
    region: nav.querySelector<HTMLElement>("[data-pagination-pages]")!,
    previous: nav.querySelector<HTMLButtonElement>("[data-pagination-previous]")!,
    next: nav.querySelector<HTMLButtonElement>("[data-pagination-next]")!,
    size: nav.querySelector<HTMLSelectElement>("[data-pagination-size]")!,
    jump: nav.querySelector<HTMLInputElement>("[data-pagination-jump]")!,
    go: nav.querySelector<HTMLButtonElement>("[data-pagination-go]")!,
    fallback: nav.querySelector<HTMLElement>("[data-pagination-fallback]")!,
  }
}
function bind(options: PaginationOptions = {}) {
  const pair = fixture(), controller = createPagination(pair.nav, options)
  controllers.push(controller)
  return { ...pair, controller }
}
const flush = () => new Promise(resolve => setTimeout(resolve, 20))
afterEach(() => { controllers.splice(0).forEach(c => c.disconnect()); document.body.replaceChildren(); vi.restoreAllMocks() })

describe("bounded pagination arithmetic", () => {
  it("uses item count precedence, clamped current page and zero-based record bounds", () => {
    const state = paginationState({ itemCount: 237, pageCount: 999, pageSize: 25, page: 99 })
    expect(state).toMatchObject({ page: 10, pageCount: 10, pageSize: 25, startIndex: 225, endIndex: 236 })
  })
  it("defines zero as one empty page and distinguishes unknown records from page count", () => {
    expect(paginationState({ itemCount: 0 })).toMatchObject({ page: 1, pageCount: 1, empty: true, startIndex: 0, endIndex: -1 })
    expect(paginationState({ pageCount: 0 })).toMatchObject({ empty: true, itemCount: null, startIndex: null })
  })
  it("bounds all windows, preserves endpoints/current and uses no duplicate keys", () => {
    for (const count of [1, 2, 5, 9, 10, 20, 100, 1e12, Number.MAX_SAFE_INTEGER]) {
      for (const slots of [5, 6, 9, 31]) for (const page of [1, 2, 3, Math.ceil(count / 2), count - 1, count].filter(n => n > 0 && n <= count)) {
        const state = paginationState({ page, pageCount: count, pageSlot: slots }), items = pageWindow(state)
        expect(items.length).toBeLessThanOrEqual(slots)
        expect(items[0]!.page).toBe(1)
        expect(items.at(-1)!.page).toBe(count)
        expect(items.some(item => !item.gap && item.page === page)).toBe(true)
        expect(new Set(items.map(item => item.key)).size).toBe(items.length)
        expect(items.every(item => item.page >= 1 && item.page <= count)).toBe(true)
      }
    }
  })
  it("keeps maximum-safe known item indices accurate", () => {
    const state = paginationState({ itemCount: Number.MAX_SAFE_INTEGER, pageSize: 10, page: Number.MAX_SAFE_INTEGER })
    expect(state.endIndex).toBe(Number.MAX_SAFE_INTEGER - 1)
    expect(Number.isSafeInteger(state.startIndex)).toBe(true)
  })
  it.each([{ page: 0 }, { page: NaN }, { pageSize: 0 }, { itemCount: -1 }, { pageCount: Infinity }, { pageSlot: 4 }, { pageSlot: 32 }, { page: 1.5 }, { pageCount: Number.MAX_SAFE_INTEGER + 1 }])("rejects unsafe values %j", values => {
    expect(() => paginationState(values)).toThrow()
  })
})

describe("native controls and local requests", () => {
  it("uses default seeds and an authored selected page size without firing events", () => {
    const { nav, size } = fixture()
    size.value = "25"
    const changed = vi.fn()
    nav.addEventListener("mui:pagination-change", changed)
    const c = createPagination(nav, { defaultPage: 3, pageCount: 9 })
    controllers.push(c)
    expect(c.state).toMatchObject({ page: 3, pageSize: 25 })
    expect(changed).not.toHaveBeenCalled()
  })
  it("changes a native page once and preserves nav/control/child identity", async () => {
    const { nav, region, next, controller } = bind({ pageCount: 20 })
    const prefix = nav.querySelector("#prefix"), page = region.children[2]
    const listener = vi.fn()
    page!.addEventListener("click", listener)
    ;(page as HTMLButtonElement).click()
    await flush()
    expect(controller.page).toBe(3)
    expect(region.children[2]).toBe(page)
    expect(nav.querySelector("#prefix")).toBe(prefix)
    expect(nav.querySelector("[data-pagination-next]")).toBe(next)
    expect(listener).toHaveBeenCalledTimes(1)
    expect(region.querySelectorAll('[aria-current="page"]')).toHaveLength(1)
  })
  it("honors late native cancellation and explicit request cancellation", async () => {
    const { nav, next, controller } = bind({ pageCount: 9 })
    nav.addEventListener("click", e => e.preventDefault(), { once: true })
    next.click(); await flush()
    expect(controller.page).toBe(1)
    nav.addEventListener("mui:pagination-request", e => e.preventDefault(), { once: true })
    next.click(); await flush()
    expect(controller.page).toBe(1)
  })
  it("never fabricates user requests on assignments or total shrink", () => {
    const { nav, controller } = bind({ itemCount: 237, page: 24 })
    const event = vi.fn()
    nav.addEventListener("mui:pagination-request", event); nav.addEventListener("mui:pagination-change", event)
    controller.set({ itemCount: 12 })
    expect(controller.page).toBe(2)
    controller.page = 1
    expect(event).not.toHaveBeenCalled()
  })
  it("clamps rather than resetting after size changes and emits one combined snapshot", async () => {
    const { nav, size, controller } = bind({ itemCount: 237, page: 20 })
    const changed = vi.fn()
    nav.addEventListener("mui:pagination-change", changed)
    size.value = "25"; size.dispatchEvent(new Event("change", { bubbles: true }))
    await flush()
    expect(controller.state).toMatchObject({ page: 10, pageSize: 25 })
    expect(changed).toHaveBeenCalledTimes(1)
    expect(changed.mock.calls[0]![0].detail).toMatchObject({ source: "size", previous: { page: 20, pageSize: 10 }, state: { page: 10, pageSize: 25 } })
  })
  it("restores a cancelled native select to the accepted page size", async () => {
    const { nav, size, controller } = bind({ itemCount: 237 })
    nav.addEventListener("mui:pagination-request", e => e.preventDefault(), { once: true })
    size.value = "100"; size.dispatchEvent(new Event("change", { bubbles: true }))
    await flush()
    expect(controller.pageSize).toBe(10)
    expect(size.value).toBe("10")
  })
  it.each(["", "0", "1.5", "999"])("uses native validity for invalid jump %s without requests", async draft => {
    const { jump, go, controller } = bind({ pageCount: 9 })
    jump.value = draft
    const validity = vi.spyOn(jump, "reportValidity")
    go.click(); await flush()
    expect(validity).toHaveBeenCalled()
    expect(jump.checkValidity()).toBe(false)
    expect(controller.page).toBe(1)
  })
  it("commits valid Enter without submitting an enclosing form", async () => {
    const { nav, jump, controller } = bind({ pageCount: 9 })
    const form = document.createElement("form"); document.body.append(form); form.append(nav)
    const submit = vi.fn(e => e.preventDefault()); form.addEventListener("submit", submit)
    jump.value = "5"
    const key = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true })
    jump.dispatchEvent(key); await flush()
    expect(key.defaultPrevented).toBe(true)
    expect(controller.page).toBe(5)
    expect(submit).not.toHaveBeenCalled()
    expect([...nav.querySelectorAll("button")].every(b => b.type === "button")).toBe(true)
  })
  it("keeps an untouched enclosing form valid and clears commit-only required feedback on input", async () => {
    const { nav, jump, go } = bind({ pageCount: 9 })
    const form = document.createElement("form"); document.body.append(form); form.append(nav)
    expect(form.checkValidity()).toBe(true)
    go.click(); await flush()
    expect(jump.validity.valueMissing).toBe(true)
    jump.dispatchEvent(new Event("input", { bubbles: true }))
    expect(jump.required).toBe(false)
    expect(form.checkValidity()).toBe(true)
  })
  it.each([{ shiftKey: true }, { ctrlKey: true }, { altKey: true }, { metaKey: true }, { isComposing: true }])("prevents implicit submit without paging for Enter %j", async modifiers => {
    const { jump, controller } = bind({ pageCount: 9 })
    jump.value = "3"
    const event = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true, ...modifiers })
    jump.dispatchEvent(event); await flush()
    expect(event.defaultPrevented).toBe(true)
    expect(controller.page).toBe(1)
  })
  it("does not synthesize Enter/Space clicks on native page buttons", async () => {
    const { next, controller } = bind({ pageCount: 9 })
    next.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }))
    next.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }))
    await flush(); expect(controller.page).toBe(1)
  })
  it("disables empty paging but leaves size selection useful", () => {
    const { region, previous, next, jump, size } = bind({ itemCount: 0 })
    expect(previous.disabled && next.disabled && jump.disabled).toBe(true)
    expect((region.firstElementChild as HTMLButtonElement).disabled).toBe(true)
    expect(size.disabled).toBe(false)
  })
  it("preserves native server links/modifiers without navigation interception", () => {
    const { nav, fallback, controller } = bind({ pageCount: 9 })
    controller.disconnect()
    const link = fallback.querySelector("a")!, event = new MouseEvent("click", { ctrlKey: true, cancelable: true, bubbles: true })
    nav.addEventListener("click", e => { expect(e.defaultPrevented).toBe(false); e.preventDefault() }, { once: true })
    link.dispatchEvent(event)
    expect(link.getAttribute("href")).toBe("#local-one")
    expect(fallback.hidden).toBe(false)
  })
})

describe("focus, ownership and lifecycle", () => {
  it("retains focus on stable keyed pages and recovers after focused page removal", async () => {
    const { region, controller } = bind({ pageCount: 100, page: 50 })
    const current = region.querySelector<HTMLButtonElement>('[aria-current="page"]')!
    current.focus()
    controller.page = 51
    expect(document.activeElement).toBe(current)
    controller.set({ pageCount: 2 })
    expect(document.activeElement).toBe(region.querySelector('[aria-current="page"]'))
  })
  it("does not steal external focus when shrinking or disabling", () => {
    const { controller } = bind({ pageCount: 100, page: 50 })
    const outside = document.createElement("input"); document.body.append(outside); outside.focus()
    controller.set({ pageCount: 0, disabled: true })
    expect(document.activeElement).toBe(outside)
  })
  it("uses a named nav fallback when the focused control becomes disabled", () => {
    const { nav, next, controller } = bind({ pageCount: 9 })
    next.focus(); controller.set({ disabled: true })
    expect(document.activeElement).toBe(nav)
    expect(nav.tabIndex).toBe(-1)
    controller.disconnect()
    expect(nav.hasAttribute("tabindex")).toBe(false)
  })
  it("recovers focus when an author disables the focused control before refresh", () => {
    const { region, next, controller } = bind({ pageCount: 9 })
    next.focus()
    next.disabled = true
    next.blur()
    controller.refresh()
    expect(document.activeElement).toBe(region.querySelector('[aria-current="page"]'))
  })
  it("keeps simple pages natively hidden and focuses an enabled auxiliary control", () => {
    const { region, jump, controller } = bind({ pageCount: 9 })
    ;(region.children[2] as HTMLButtonElement).focus()
    controller.set({ simple: true })
    expect(region.hidden).toBe(true)
    expect(document.activeElement).toBe(jump)
  })
  it("preserves author disabled before, during identical writes, and on disposal", async () => {
    const pair = fixture()
    pair.previous.disabled = true
    const controller = createPagination(pair.nav, { pageCount: 9, page: 2 })
    controllers.push(controller)
    expect(pair.previous.disabled).toBe(true)
    controller.set({ disabled: true })
    pair.next.disabled = true
    controller.set({ disabled: false })
    expect(pair.next.disabled).toBe(true)
    pair.previous.disabled = false
    controller.refresh()
    expect(pair.previous.disabled).toBe(false)
    controller.disconnect()
    expect(pair.next.disabled).toBe(true)
  })
  it("restores original attributes/values/text but preserves external author updates", () => {
    const { nav, jump, size, controller } = bind({ pageCount: 9 })
    jump.value = "author draft"
    jump.setAttribute("min", "7")
    size.setAttribute("aria-label", "Author label")
    controller.disconnect()
    expect(jump.getAttribute("min")).toBe("7")
    expect(jump.hasAttribute("max")).toBe(false)
    expect(size.getAttribute("aria-label")).toBe("Author label")
    expect(nav.querySelector("[data-pagination-count]")!.textContent).toBe("0")
  })
  it("invalidates queued clicks on set/refresh/disconnect and survives reconnect", async () => {
    const { next, controller } = bind({ pageCount: 9 })
    next.click(); controller.page = 5; await flush(); expect(controller.page).toBe(5)
    next.click(); controller.refresh(); await flush(); expect(controller.page).toBe(5)
    next.click(); controller.disconnect(); await flush(); expect(controller.page).toBe(5)
    controller.connect(); next.click(); await flush(); expect(controller.page).toBe(6)
  })
  it("does not apply or emit after a request listener reconfigures or disposes", async () => {
    const { nav, next, controller } = bind({ pageCount: 9 })
    const changed = vi.fn(); nav.addEventListener("mui:pagination-change", changed)
    nav.addEventListener("mui:pagination-request", () => { controller.page = 7 }, { once: true })
    next.click(); await flush(); expect(controller.page).toBe(7); expect(changed).not.toHaveBeenCalled()
    nav.addEventListener("mui:pagination-request", () => controller.disconnect(), { once: true })
    next.click(); await flush(); expect(controller.connected).toBe(false); expect(changed).not.toHaveBeenCalled()
  })
  it("does not restore a stale select after request-time reconnect and author edits", async () => {
    const { nav, size, controller } = bind({ pageCount: 9 })
    nav.addEventListener("mui:pagination-request", () => {
      controller.disconnect(); controller.connect(); size.value = "100"
    }, { once: true })
    size.value = "25"; size.dispatchEvent(new Event("change", { bubbles: true }))
    await flush()
    expect(controller.pageSize).toBe(10)
    expect(size.value).toBe("100")
  })
  it("returns focus to restored native links when disposing a generated focused page", () => {
    const { region, fallback, controller } = bind({ pageCount: 9 })
    ;(region.children[2] as HTMLButtonElement).focus(); controller.disconnect()
    expect(document.activeElement).toBe(fallback.querySelector("a"))
    expect(region.children.length).toBe(0)
  })
  it("refresh adopts explicit replacements and preserves focused removal recovery", () => {
    const { region, next, nav, controller } = bind({ pageCount: 9 })
    next.focus(); const replacement = next.cloneNode(true) as HTMLButtonElement; next.replaceWith(replacement)
    controller.refresh()
    expect(document.activeElement).toBe(region.querySelector('[aria-current="page"]'))
    expect(nav.querySelector("[data-pagination-next]")).toBe(replacement)
  })
  it("scopes nested pagers independently", async () => {
    const outer = bind({ pageCount: 9 }), inner = bind({ pageCount: 3 })
    outer.nav.append(inner.nav)
    inner.next.click(); await flush()
    expect(inner.controller.page).toBe(2); expect(outer.controller.page).toBe(1)
  })
  it("rejects duplicate controllers and invalid anatomy without replacing author nodes", () => {
    const { nav, controller } = bind()
    expect(() => createPagination(nav)).toThrow(/active/)
    controller.disconnect()
    nav.querySelector("[data-pagination-next]")!.removeAttribute("type")
    expect(() => createPagination(nav)).toThrow(/type=button/)
    expect(nav.querySelector("#prefix")).not.toBeNull()
  })
  it.each([{ page: null }, { defaultPage: 0 }, { pageSlot: 100 }, { extra: true }, { pageSize: 15 }])("rejects invalid public options %j", options => {
    const { nav } = fixture()
    expect(() => createPagination(nav, options as PaginationOptions)).toThrow()
  })
  it("rejects external generated-region edits clearly and preserves foreign nodes on dispose", () => {
    const { region, controller } = bind()
    const foreign = document.createElement("span"); foreign.textContent = "Author addition"; region.append(foreign)
    expect(() => controller.page = 1).toThrow(/exclusively/)
    expect(region.contains(foreign)).toBe(true)
  })
})
