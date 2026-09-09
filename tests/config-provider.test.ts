import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { afterEach, describe, expect, it, vi } from "vitest"
import { mountExample } from "../demo/components/config-provider.js"
import { theme } from "../src/theme/index.js"

const html = readFileSync(resolve("demo", "components", "config-provider.html"), "utf8")
const scopes: ReturnType<typeof mountExample>[] = []
function fixture() {
  const parsed = new DOMParser().parseFromString(html, "text/html")
  const root = document.importNode(parsed.querySelector("#config-example")!, true) as HTMLElement
  document.body.append(root)
  return root
}
function mount(root = fixture()) {
  scopes.push(mountExample(root))
  return root
}
function choose(root: HTMLElement, selector: string, value: string) {
  const input = root.querySelector<HTMLSelectElement>(selector)!
  input.value = value
  input.dispatchEvent(new Event("change", { bubbles: true }))
}
function click(root: HTMLElement, selector: string) { root.querySelector<HTMLElement>(selector)!.click() }
function words(root: HTMLElement, selector = "[data-outer-loading]") {
  return root.querySelector(`${selector} [data-loading-bar-status]`)!.textContent
}
afterEach(() => {
  for (const scope of scopes.splice(0)) scope.dispose()
  document.body.replaceChildren()
  document.body.removeAttribute("style")
  vi.restoreAllMocks()
})

describe("ConfigProvider resolution through native composition", () => {
  it("adds no config runtime, registration, export, distribution or dependency", () => {
    const pkg = JSON.parse(readFileSync(resolve("package.json"), "utf8"))
    const manifest = JSON.parse(readFileSync(resolve("dist", "manifest.json"), "utf8"))
    expect(pkg.dependencies).toEqual({})
    expect(pkg.exports["./config-provider"]).toBeUndefined()
    expect(pkg.exports["./config-provider/style.css"]).toBeUndefined()
    expect(existsSync(resolve("src", "components", "config-provider"))).toBe(false)
    expect(existsSync(resolve("dist", "markup-ui-config-provider.js"))).toBe(false)
    expect(Object.keys(manifest.bundles).some(key => key.includes("config-provider"))).toBe(false)
    const js = readFileSync(resolve("demo", "components", "config-provider.js"), "utf8")
    expect(js.match(/^import .+$/gm)).toEqual(['import { createLoadingBar } from "../../dist/markup-ui-loading-bar.js"'])
    expect(js).not.toMatch(/localStorage|createApp|customElements|MutationObserver|setInterval|\.style\b/)
    expect(html).not.toMatch(/\sstyle=|\sonclick=|<style>/)
  })
  it("keeps authored native controls, progress and inherited nesting without JS", () => {
    const root = fixture()
    expect(root.querySelector<HTMLElement>("[data-enhanced]")!.hidden).toBe(true)
    expect(root.querySelector("#config-scope")!.getAttribute("lang")).toBe("en")
    expect(root.querySelector("#config-nested")!.hasAttribute("data-example-palette")).toBe(false)
    expect(root.querySelector("input")!.value).toBe("2026-09-09")
    expect([...root.querySelectorAll("progress")].map(node => node.value)).toEqual([25, 40, 60])
    expect(root.querySelector("#config-scope")!.contains(root.querySelector("dialog"))).toBe(true)
    expect(root.querySelector("dialog")!.contains(root.querySelector("[data-sibling-loading]"))).toBe(false)
  })
  it("constructs three explicit owners and restores authored progress on disconnect", () => {
    const root = mount()
    expect([...root.querySelectorAll("[data-loading-bar-state]")].map(node => node.getAttribute("data-loading-bar-state"))).toEqual(["loading", "loading", "loading"])
    scopes[0].dispose()
    expect(root.querySelector("[data-loading-bar-state]")).toBeNull()
    expect(words(root)).toBe("Authored outer progress: 25 of 100.")
    expect([...root.querySelectorAll("progress")].map(node => node.value)).toEqual([25, 40, 60])
    scopes[0].dispose()
    expect(words(root)).toContain("Authored")
  })
  it("changes native lang metadata without translating helper snapshots or sibling content", () => {
    const root = mount()
    choose(root, "[data-language-control]", "ar")
    expect(root.querySelector("#config-scope")!.getAttribute("lang")).toBe("ar")
    expect(root.querySelector("#config-sibling")!.getAttribute("lang")).toBe("en")
    expect(words(root)).toBe("Loading")
    expect(words(root, "[data-modal-loading]")).toBe("Loading")
  })
  it("explicitly recreates only the chosen helper labels and restores their authored language", () => {
    const root = mount()
    for (let i = 0; i < 4; i++) click(root, "[data-french-labels]")
    expect(words(root)).toBe("Chargement")
    expect(words(root, "[data-modal-loading]")).toBe("Loading")
    expect(words(root, "[data-sibling-loading]")).toBe("Loading")
    expect(root.querySelector("[data-outer-loading] [data-loading-bar-status]")!.getAttribute("lang")).toBe("fr")
    scopes[0].dispose()
    expect(words(root)).toBe("Authored outer progress: 25 of 100.")
    expect(root.querySelector("[data-outer-loading] [data-loading-bar-status]")!.getAttribute("lang")).toBe("en")
  })
  it("uses native direction and theme attributes without mutating nested or independent roots", () => {
    const root = mount()
    choose(root, "[data-direction-control]", "rtl")
    choose(root, "[data-palette-control]", "system")
    expect(root.querySelector("#config-scope")!.getAttribute("dir")).toBe("rtl")
    expect(root.querySelector("#config-nested")!.hasAttribute("dir")).toBe(false)
    expect(root.querySelector("#config-sibling")!.getAttribute("dir")).toBe("ltr")
    expect(root.querySelector("#config-sibling")!.getAttribute("data-example-palette")).toBe("light")
    choose(root, "[data-nested-control]", "light")
    choose(root, "[data-nested-control]", "inherit")
    expect(root.querySelector("#config-nested")!.hasAttribute("data-example-palette")).toBe(false)
  })
  it("leaves author settings, controls, listeners and DOM identities intact", () => {
    const root = mount()
    const input = root.querySelector("input")!
    const button = root.querySelector<HTMLButtonElement>("[data-mui-button-control]")!
    const listener = vi.fn()
    button.addEventListener("click", listener)
    input.value = "2027-01-02"
    choose(root, "[data-palette-control]", "light")
    root.querySelector<HTMLElement>("#config-scope")!.style.setProperty("--mui-color-primary", "rebeccapurple")
    scopes[0].dispose()
    button.click()
    expect(listener).toHaveBeenCalledOnce()
    expect(root.querySelector("input")).toBe(input)
    expect(input.value).toBe("2027-01-02")
    expect(root.querySelector<HTMLElement>("#config-scope")!.style.getPropertyValue("--mui-color-primary")).toBe("rebeccapurple")
    expect(root.querySelector("#config-scope")!.getAttribute("data-example-palette")).toBe("light")
    choose(root, "[data-palette-control]", "dark")
    expect(root.querySelector("#config-scope")!.getAttribute("data-example-palette")).toBe("light")
  })
  it("does not overwrite a later authored label-language edit on disposal", () => {
    const root = mount()
    click(root, "[data-french-labels]")
    const label = root.querySelector<HTMLElement>("[data-outer-loading] [data-loading-bar-status]")!
    label.lang = "de"
    scopes[0].dispose()
    expect(label.lang).toBe("de")
  })
  it("supports independent mounted examples and explicit teardown before removal", () => {
    const first = mount(), second = mount()
    click(first, "[data-french-labels]")
    scopes[0].dispose()
    first.remove()
    expect(words(second)).toBe("Loading")
    choose(second, "[data-direction-control]", "rtl")
    expect(second.querySelector("#config-scope")!.getAttribute("dir")).toBe("rtl")
  })
  it("cleans earlier helpers when a later application setup fails", () => {
    const root = fixture()
    root.querySelector("[data-sibling-loading] progress")!.removeAttribute("aria-label")
    expect(() => mountExample(root)).toThrow(/Name/)
    expect(root.querySelector("[data-loading-bar-state]")).toBeNull()
    expect(words(root)).toContain("Authored")
    expect(words(root, "[data-modal-loading]")).toContain("Authored")
  })
  it("preserves legacy theme.apply/register, unrelated body state and storage", () => {
    const store = vi.spyOn(Storage.prototype, "setItem")
    document.body.style.padding = "7px"
    const root = mount()
    const scope = root.querySelector<HTMLElement>("#config-scope")!
    theme.register("config-test", { "color-primary": "#123456" })
    theme.apply("config-test", scope)
    choose(root, "[data-palette-control]", "light")
    expect(scope.style.getPropertyValue("--mui-color-primary")).toBe("#123456")
    scopes[0].dispose()
    expect(theme.current(scope)).toBe("config-test")
    expect(scope.style.getPropertyValue("--mui-color-primary")).toBe("#123456")
    expect(document.body.style.padding).toBe("7px")
    expect(store).not.toHaveBeenCalled()
  })
  it("hands focus off before hiding its application controls", () => {
    const root = mount()
    const button = root.querySelector<HTMLButtonElement>("[data-dispose]")!
    button.focus()
    button.click()
    expect(document.activeElement).toBe(root.querySelector("[data-example-status]"))
    expect(root.querySelector<HTMLElement>("[data-enhanced]")!.hidden).toBe(true)
  })
})
