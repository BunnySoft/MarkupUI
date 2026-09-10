import { afterEach, describe, expect, it, vi } from "vitest"
import {
  bind,
  builtInElementNames,
  createStore,
  installActions,
  installStyles,
  mui,
  registerAction,
  registerElements,
  sanitizeHtml,
  setHtml,
  theme,
} from "../src/index.js"
import { advancedElementNames, advancedPlugin } from "../src/plugins/advanced.js"
import { widgetElementNames, widgetsPlugin } from "../src/plugins/widgets.js"

afterEach(() => {
  document.body.replaceChildren()
  document.documentElement.removeAttribute("data-mui-theme")
  vi.restoreAllMocks()
})

describe("native elements", () => {
  it("registers and upgrades mui elements", () => {
    installStyles(document)
    registerElements(customElements)
    document.body.innerHTML = `
      <mui-stack gap="sm">
        <mui-input value="Ada"></mui-input>
        <mui-button>Save</mui-button>
      </mui-stack>`
    const input = document.querySelector("mui-input") as HTMLElement & { value: string }
    expect(input.value).toBe("Ada")
    expect(document.getElementById("mui-styles")).not.toBeNull()
    expect(mui.elements.names).toEqual(builtInElementNames)
    expect(new Set(builtInElementNames).size).toBe(builtInElementNames.length)
    const styles = document.getElementById("mui-styles")?.textContent ?? ""
    expect(styles).toContain("--mui-control-height")
    expect(styles).toContain(":focus-visible")
    expect(styles).toContain("prefers-reduced-motion")
    expect(styles).toContain("mui-card[hoverable]:hover")
    expect(styles).not.toContain("translateY(1px)")
  })

  it("provides semantic content primitives", () => {
    document.body.innerHTML = `
      <mui-main>
        <mui-heading level="1">Title</mui-heading>
        <mui-text>Read the <mui-link href="#more">details</mui-link>.</mui-text>
        <mui-field label="Name"><mui-input></mui-input></mui-field>
      </mui-main>`
    expect(document.querySelector("mui-main")?.getAttribute("role")).toBe("main")
    expect(document.querySelector("mui-heading")?.getAttribute("aria-level")).toBe("1")
    expect(document.querySelector("mui-link > a")?.getAttribute("href")).toBe("#more")
    expect(document.querySelector("mui-field > [data-mui-label]")?.textContent).toBe("Name")
    expect(document.querySelector("mui-input input")?.getAttribute("aria-label")).toBe("Name")
  })

  it("supports compound card and dialog anatomy", async () => {
    document.body.innerHTML = `
      <mui-app>
        <mui-card>
          <mui-card-header>Header</mui-card-header>
          <mui-card-content>Content</mui-card-content>
          <mui-card-footer>Footer</mui-card-footer>
        </mui-card>
        <mui-dialog id="dialog">
          <mui-dialog-header>Dialog</mui-dialog-header>
          <mui-dialog-content>Body</mui-dialog-content>
          <mui-dialog-footer><mui-button mui-action="close">Close</mui-button></mui-dialog-footer>
        </mui-dialog>
      </mui-app>`
    await Promise.resolve()
    const card = document.querySelector("mui-card")
    const dialog = document.querySelector("mui-dialog") as HTMLElement & {
      open(): void
      close(): void
    }
    const closeEvents = vi.fn()
    dialog.addEventListener("mui:close", closeEvents)
    expect(card?.hasAttribute("structured")).toBe(true)
    dialog.open()
    expect(document.querySelector("mui-dialog dialog")?.hasAttribute("open")).toBe(true)
    document.querySelector("mui-dialog mui-button")?.dispatchEvent(
      new MouseEvent("click", { bubbles: true }),
    )
    await Promise.resolve()
    expect(document.querySelector("mui-dialog dialog")?.hasAttribute("open")).toBe(false)
    expect(closeEvents).toHaveBeenCalledOnce()
  })

  it("provides common display and feedback elements", () => {
    document.body.innerHTML = `
      <mui-avatar alt="Ada">A</mui-avatar>
      <mui-divider></mui-divider>
      <mui-progress value="25" max="50"></mui-progress>
      <mui-skeleton width="100px" height="20px"></mui-skeleton>
      <mui-empty description="No rows"></mui-empty>
      <mui-tag closable>Ready</mui-tag>
      <mui-button-group><mui-button>One</mui-button><mui-button>Two</mui-button></mui-button-group>`
    expect(document.querySelector("mui-avatar")?.getAttribute("role")).toBe("img")
    expect(document.querySelector("mui-divider")?.getAttribute("role")).toBe("separator")
    expect(document.querySelector("mui-progress")?.getAttribute("aria-valuenow")).toBe("25")
    expect(
      (document.querySelector("mui-progress > [data-mui-bar]") as HTMLElement | null)?.style.width,
    ).toBe("50%")
    expect(document.querySelector("mui-skeleton")?.getAttribute("aria-hidden")).toBe("true")
    expect(document.querySelector("mui-empty")?.textContent).toContain("No rows")
    expect(document.querySelector("mui-tag > [data-mui-close]")).not.toBeNull()
    expect(document.querySelector("mui-button-group")?.getAttribute("role")).toBe("group")
  })

  it("supports Naive-style button variants, sizes, shapes and loading", () => {
    document.body.innerHTML = `
      <mui-button type="primary" secondary size="large" round>Action</mui-button>
      <mui-button type="info" ghost>Info</mui-button>
      <mui-button dashed>Dashed</mui-button>
      <mui-button type="text">Text</mui-button>
      <mui-button loading>Loading</mui-button>
      <mui-button circle aria-label="Add">+</mui-button>`
    const loading = document.querySelector("mui-button[loading]") as HTMLElement
    expect(loading.getAttribute("aria-busy")).toBe("true")
    expect(loading.getAttribute("aria-disabled")).toBe("true")
    expect(loading.tabIndex).toBe(-1)
    expect(loading.querySelector("[data-mui-button-spinner]")).not.toBeNull()
    loading.removeAttribute("loading")
    expect(loading.getAttribute("aria-busy")).toBe("false")
    expect(loading.querySelector("[data-mui-button-spinner]")).toBeNull()
    const styles = document.getElementById("mui-styles")?.textContent ?? ""
    expect(styles).toContain('mui-button[type=warning]')
    expect(styles).toContain('mui-button[secondary]')
    expect(styles).toContain('mui-button[size=large]')
    expect(styles).toContain('mui-button[circle]')
  })

  it("supports drawer, tooltip and popover overlays", async () => {
    document.body.innerHTML = `
      <mui-app>
        <mui-drawer id="drawer">
          <mui-drawer-header>Drawer</mui-drawer-header>
          <mui-drawer-content>Body</mui-drawer-content>
          <mui-drawer-footer><mui-button mui-action="close">Close</mui-button></mui-drawer-footer>
        </mui-drawer>
        <mui-tooltip text="Helpful"><mui-button>Help</mui-button></mui-tooltip>
        <mui-popover>
          <mui-popover-trigger><mui-button>Open</mui-button></mui-popover-trigger>
          <mui-popover-content>Popover body</mui-popover-content>
        </mui-popover>
      </mui-app>`
    await Promise.resolve()
    const drawer = document.querySelector("mui-drawer") as HTMLElement & { open(): void }
    drawer.open()
    expect(document.querySelector("mui-drawer dialog")?.hasAttribute("open")).toBe(true)
    document.querySelector("mui-drawer mui-button")?.dispatchEvent(
      new MouseEvent("click", { bubbles: true }),
    )
    await Promise.resolve()
    expect(document.querySelector("mui-drawer dialog")?.hasAttribute("open")).toBe(false)

    const tooltip = document.querySelector("mui-tooltip")
    tooltip?.dispatchEvent(new MouseEvent("mouseenter"))
    expect(document.querySelector("[data-mui-tooltip]")?.hasAttribute("hidden")).toBe(false)

    document.querySelector("mui-popover-trigger")?.dispatchEvent(
      new MouseEvent("click", { bubbles: true }),
    )
    expect(document.querySelector("mui-popover-content")?.hasAttribute("hidden")).toBe(false)
  })

  it("provides managed message and notification services", () => {
    const message = mui.message.show("Saved", { duration: 0, type: "success" })
    const notification = mui.notification.show({
      title: "Complete",
      content: "The operation finished.",
      duration: 0,
    })
    expect(message.element.textContent).toBe("Saved")
    expect(notification.element.textContent).toContain("Complete")
    expect(document.querySelectorAll("mui-overlay-host")).toHaveLength(2)
    mui.message.clear()
    expect(document.querySelector("mui-overlay-host")).toBeNull()
  })

  it("supports form validation and advanced selection controls", async () => {
    document.body.innerHTML = `
      <mui-form>
        <mui-form-item label="Name" required minlength="3">
          <mui-input></mui-input>
        </mui-form-item>
      </mui-form>
      <mui-radio-group value="b">
        <mui-radio value="a">A</mui-radio>
        <mui-radio value="b">B</mui-radio>
      </mui-radio-group>
      <mui-slider value="25" min="0" max="100"></mui-slider>
      <mui-autocomplete value="Ada">
        <mui-option value="Ada">Ada</mui-option>
        <mui-option value="Grace">Grace</mui-option>
      </mui-autocomplete>`
    await Promise.resolve()
    const form = document.querySelector("mui-form") as HTMLElement & { validate(): boolean }
    const input = document.querySelector("mui-input") as HTMLElement & { value: string }
    expect(form.validate()).toBe(false)
    expect(document.querySelector("mui-form-item")?.hasAttribute("invalid")).toBe(true)
    input.value = "Ada"
    expect(form.validate()).toBe(true)
    const radios = [...document.querySelectorAll("mui-radio")] as Array<HTMLElement & {
      checked: boolean
    }>
    expect(radios[0]?.checked).toBe(false)
    expect(radios[1]?.checked).toBe(true)
    expect((document.querySelector("mui-slider") as HTMLElement & { value: number }).value).toBe(25)
    expect(document.querySelectorAll("mui-autocomplete datalist option")).toHaveLength(2)
  })

  it("supports navigation and data display components", () => {
    document.body.innerHTML = `
      <mui-menu value="reports">
        <mui-menu-item value="home">Home</mui-menu-item>
        <mui-menu-item value="reports">Reports</mui-menu-item>
      </mui-menu>
      <mui-pagination page="2" count="4"></mui-pagination>
      <mui-steps current="2">
        <mui-step>Start</mui-step>
        <mui-step>Review</mui-step>
        <mui-step>Finish</mui-step>
      </mui-steps>
      <mui-list><mui-list-item>One</mui-list-item></mui-list>
      <mui-descriptions columns="2">
        <mui-description-item label="Name">Ada</mui-description-item>
      </mui-descriptions>
      <mui-statistic label="Revenue" value="42" prefix="$" suffix="K"></mui-statistic>`
    expect(document.querySelector("mui-menu-item[selected]")?.getAttribute("value")).toBe("reports")
    expect(document.querySelector("mui-pagination [aria-current=page]")?.textContent).toBe("2")
    expect(document.querySelector("mui-step[current]")?.textContent).toBe("Review")
    expect(document.querySelector("mui-list")?.getAttribute("role")).toBe("list")
    expect(document.querySelector("[data-mui-label]")?.textContent).toBe("Name")
    expect(document.querySelector("[data-mui-statistic-value]")?.textContent).toBe("$42K")
    const pagination = document.querySelector("mui-pagination") as HTMLElement & { page: number }
    const steps = document.querySelector("mui-steps") as HTMLElement & { current: number }
    pagination.page = 4
    steps.current = 3
    expect(document.querySelector("mui-pagination [aria-current=page]")?.textContent).toBe("4")
    expect(document.querySelector("mui-step[current]")?.textContent).toBe("Finish")
  })

  it("reflects dynamic attributes and keyboard navigation", () => {
    theme.register("reflection-light", { "color-primary": "#111111" })
    theme.register("reflection-dark", { "color-primary": "#eeeeee" })
    document.body.innerHTML = `
      <mui-button>Action</mui-button>
      <mui-theme name="reflection-light"></mui-theme>
      <mui-tabs>
        <mui-tab title="One">One</mui-tab>
        <mui-tab title="Two">Two</mui-tab>
      </mui-tabs>
      <mui-menu>
        <mui-menu-item value="a">A</mui-menu-item>
        <mui-menu-item value="b">B</mui-menu-item>
      </mui-menu>`
    const button = document.querySelector("mui-button") as HTMLElement
    button.toggleAttribute("disabled", true)
    expect(button.tabIndex).toBe(-1)
    expect(button.getAttribute("aria-disabled")).toBe("true")
    button.toggleAttribute("disabled", false)
    expect(button.tabIndex).toBe(0)

    const scopedTheme = document.querySelector("mui-theme") as HTMLElement
    scopedTheme.setAttribute("name", "reflection-dark")
    expect(scopedTheme.style.getPropertyValue("--mui-color-primary")).toBe("#eeeeee")

    const tabs = [...document.querySelectorAll<HTMLElement>("[role=tab]")]
    tabs[0]?.focus()
    tabs[0]?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }))
    expect(document.activeElement).toBe(tabs[1])
    expect(tabs[1]?.getAttribute("aria-selected")).toBe("true")

    const menuItems = [...document.querySelectorAll<HTMLElement>("mui-menu-item")]
    menuItems[0]?.focus()
    menuItems[0]?.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
    )
    expect(document.activeElement).toBe(menuItems[1])
  })

  it("supports tree expansion and selection", () => {
    document.body.innerHTML = `
      <mui-tree>
        <mui-tree-node label="Analytics" value="analytics" expanded>
          <mui-tree-node label="Reports" value="reports"></mui-tree-node>
          <mui-tree-node label="Metrics" value="metrics"></mui-tree-node>
        </mui-tree-node>
      </mui-tree>`
    const root = document.querySelector("mui-tree-node") as HTMLElement & { expanded: boolean }
    const reports = document.querySelector('mui-tree-node[value="reports"]')
    expect(root.expanded).toBe(true)
    reports?.querySelector<HTMLElement>("[data-mui-tree-row]")?.click()
    expect(document.querySelector("mui-tree") as HTMLElement & { value: string }).toHaveProperty(
      "value",
      "reports",
    )
    expect(reports?.hasAttribute("selected")).toBe(true)
    root.querySelector<HTMLElement>(":scope > [data-mui-tree-row]")?.click()
    expect(root.expanded).toBe(false)
  })

  it("provides a small DOM helper", () => {
    document.body.innerHTML = `<div class="item">One</div>`
    expect(mui(".item").addClass("active").text()).toBe("One")
    expect(document.querySelector(".item")?.classList.contains("active")).toBe(true)
  })

  it("supports tabs, accordion and form controls", () => {
    document.body.innerHTML = `
      <mui-tabs>
        <mui-tab title="One">First</mui-tab>
        <mui-tab title="Two">Second</mui-tab>
      </mui-tabs>
      <mui-accordion><mui-accordion-item title="Details">Body</mui-accordion-item></mui-accordion>
      <mui-select value="b">
        <mui-option value="a">A</mui-option>
        <mui-option value="b">B</mui-option>
      </mui-select>`
    const tabs = document.querySelector("mui-tabs") as HTMLElement & { select(index: number): void }
    const panels = [...document.querySelectorAll("mui-tab")] as HTMLElement[]
    expect(panels[0]?.hidden).toBe(false)
    expect(panels[1]?.hidden).toBe(true)
    expect(document.getElementById("mui-styles")?.textContent).toContain(
      "[hidden]{display:none!important}",
    )
    tabs.select(1)
    expect(panels[1]?.hidden).toBe(false)
    const select = document.querySelector("mui-select") as HTMLElement & { value: string }
    expect(select.value).toBe("b")
  })

  it("loads sanitized dynamic HTML through mui-include", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(
      `<mui-card>Loaded<script>unsafe()</script></mui-card>`,
      { status: 200 },
    )))
    document.body.innerHTML = `<mui-include src="/views/example.html"></mui-include>`
    await vi.waitFor(() => {
      expect(document.querySelector("mui-include mui-card")?.textContent).toContain("Loaded")
    })
    expect(document.querySelector("mui-include script")).toBeNull()
  })
})

describe("unified API and plugins", () => {
  it("exposes namespaced services without requiring the query helper", () => {
    expect(mui.actions.register).toBe(registerAction)
    expect(mui.state.create).toBe(createStore)
    expect(mui.theme).toBe(theme)
    expect(mui.elements.registerAll).toBe(registerElements)
  })

  it("installs plugins once and supports optional query extensions", () => {
    const install = vi.fn((api: typeof mui) => {
      api.queryExtensions.register("testMark", function () {
        return this.addClass("plugin-mark")
      })
    })
    const plugin = { name: "test.query-extension", install }
    mui.use(plugin).use(plugin)
    document.body.innerHTML = `<mui-card></mui-card>`
    const result = mui("mui-card")
    const extension = Reflect.get(result, "testMark")
    expect(typeof extension).toBe("function")
    Reflect.apply(extension as (...args: unknown[]) => unknown, result, [])
    expect(document.querySelector("mui-card")?.classList.contains("plugin-mark")).toBe(true)
    expect(install).toHaveBeenCalledOnce()
    expect(mui.plugins.installed(plugin.name)).toBe(true)
  })

  it("installs the optional advanced component plugin", async () => {
    mui.use(advancedPlugin)
    expect(advancedElementNames).toHaveLength(6)
    expect(new Set(advancedElementNames).size).toBe(advancedElementNames.length)
    document.body.innerHTML = `
      <mui-data-grid>
        <mui-data-column key="name" label="Name" sortable></mui-data-column>
        <mui-data-column key="score" label="Score"></mui-data-column>
      </mui-data-grid>
      <mui-date-picker value="2026-08-26"></mui-date-picker>
      <mui-time-picker value="18:30"></mui-time-picker>
      <mui-upload accept=".csv"></mui-upload>
      <mui-virtual-list height="100px" item-height="25"></mui-virtual-list>`
    const grid = document.querySelector("mui-data-grid") as HTMLElement & {
      rows: ReadonlyArray<Record<string, unknown>>
    }
    grid.rows = [
      { name: "Grace", score: 2 },
      { name: "Ada", score: 1 },
    ]
    expect(document.querySelectorAll("mui-data-grid tbody tr")).toHaveLength(2)
    document.querySelector<HTMLElement>("mui-data-grid th[sortable]")?.click()
    expect(document.querySelector("mui-data-grid tbody td")?.textContent).toBe("Ada")
    expect((document.querySelector("mui-date-picker") as HTMLElement & { value: string }).value)
      .toBe("2026-08-26")
    expect((document.querySelector("mui-time-picker") as HTMLElement & { value: string }).value)
      .toBe("18:30")
    const virtual = document.querySelector("mui-virtual-list") as HTMLElement & {
      items: readonly unknown[]
    }
    virtual.items = Array.from({ length: 100 }, (_, index) => `Row ${index + 1}`)
    await Promise.resolve()
    expect(document.querySelectorAll("[data-mui-virtual-item]").length).toBeLessThan(20)
    expect(document.querySelector("mui-upload input")?.getAttribute("accept")).toBe(".csv")
  })

  it("installs the optional widgets plugin", () => {
    mui.use(widgetsPlugin)
    expect(widgetElementNames).toHaveLength(11)
    document.body.innerHTML = `
      <mui-breadcrumb><mui-breadcrumb-item>Home</mui-breadcrumb-item></mui-breadcrumb>
      <mui-timeline><mui-timeline-item>Created</mui-timeline-item></mui-timeline>
      <mui-input-number value="2" min="0" max="5"></mui-input-number>
      <mui-color-picker value="#ff0000"></mui-color-picker>
      <mui-rating value="3"></mui-rating>
      <mui-carousel>
        <mui-carousel-item>One</mui-carousel-item>
        <mui-carousel-item>Two</mui-carousel-item>
      </mui-carousel>
      <mui-transfer></mui-transfer>
      <mui-cascader></mui-cascader>`
    expect(document.querySelector("mui-breadcrumb")?.getAttribute("aria-label")).toBe("Breadcrumb")
    const number = document.querySelector("mui-input-number") as HTMLElement & { value: number }
    document.querySelector<HTMLElement>('mui-input-number [aria-label="Increase"]')?.click()
    expect(number.value).toBe(3)
    expect((document.querySelector("mui-color-picker") as HTMLElement & { value: string }).value)
      .toBe("#ff0000")
    expect(document.querySelectorAll("mui-rating button[data-active]")).toHaveLength(3)
    expect(document.querySelectorAll("mui-rating button[selected]")).toHaveLength(1)
    const carousel = document.querySelector("mui-carousel") as HTMLElement & { next(): void }
    carousel.next()
    expect(document.querySelectorAll("mui-carousel-item:not([hidden])")).toHaveLength(1)

    const transfer = document.querySelector("mui-transfer") as HTMLElement & {
      options: readonly { label: string; value: string }[]
      value: string[]
    }
    transfer.options = [
      { label: "One", value: "one" },
      { label: "Two", value: "two" },
    ]
    transfer.querySelector<HTMLElement>("[data-mui-transfer-list] button")?.click()
    transfer.querySelector<HTMLElement>('[aria-label="Move to selected"]')?.click()
    expect(transfer.value).toEqual(["one"])

    const cascader = document.querySelector("mui-cascader") as HTMLElement & {
      options: readonly unknown[]
      value: string[]
    }
    cascader.options = [{
      label: "Data",
      value: "data",
      children: [{ label: "Reports", value: "reports" }],
    }]
    expect(cascader.value).toEqual(["data", "reports"])
    expect(document.querySelectorAll("mui-cascader select")).toHaveLength(2)
  })
})

describe("safe HTML", () => {
  it("removes executable content and unsafe URLs", () => {
    const target = document.createElement("div")
    setHtml(target, `
      <mui-card onclick="alert(1)">
        <script>alert(1)</script>
        <style>body { display: none }</style>
        <a href="javascript:alert(1)">Unsafe</a>
        <img src="//evil.example/image.png">
        Safe
      </mui-card>`)
    expect(target.querySelector("script")).toBeNull()
    expect(target.querySelector("style")).toBeNull()
    expect(target.querySelector("mui-card")?.hasAttribute("onclick")).toBe(false)
    expect(target.querySelector("a")?.hasAttribute("href")).toBe(false)
    expect(target.querySelector("img")?.hasAttribute("src")).toBe(false)
    expect(target.textContent).toContain("Safe")
  })

  it("returns a reusable document fragment", () => {
    const fragment = sanitizeHtml("<mui-row><span>Ready</span></mui-row>")
    expect(fragment.querySelector("mui-row")?.textContent).toBe("Ready")
  })
})

describe("themes", () => {
  it("switches tokens without rerendering components", () => {
    theme.register("test", { "color-primary": "#ff0000" })
    theme.set("test")
    expect(document.documentElement.dataset.muiTheme).toBe("test")
    expect(document.documentElement.style.getPropertyValue("--mui-color-primary")).toBe("#ff0000")
  })

  it("clears stale tokens when switching to a partial custom theme", () => {
    theme.register("partial", { "color-primary": "#123456" })
    theme.set("dark")
    expect(document.documentElement.style.getPropertyValue("--mui-text-secondary")).not.toBe("")
    theme.set("partial")
    expect(document.documentElement.style.getPropertyValue("--mui-color-primary")).toBe("#123456")
    expect(document.documentElement.style.getPropertyValue("--mui-text-secondary")).toBe("")
  })
})

describe("optional state and actions", () => {
  it("binds state to native custom elements", () => {
    const store = createStore({ customer: { name: "Ada" } })
    document.body.innerHTML = `
      <mui-input mui-bind="customer.name"></mui-input>
      <span mui-text="customer.name"></span>`
    const dispose = bind(document.body, store)
    const input = document.querySelector("mui-input") as HTMLElement & { value: string }
    expect(input.value).toBe("Ada")
    store.set("customer.name", "Grace")
    expect(input.value).toBe("Grace")
    expect(document.querySelector("span")?.textContent).toBe("Grace")
    dispose()
  })

  it("dispatches named actions through event delegation", async () => {
    const invoked = vi.fn()
    registerAction("test.save", invoked)
    document.body.innerHTML = `<mui-button mui-action="test.save">Save</mui-button>`
    const dispose = installActions(document.body)
    document.querySelector("mui-button")?.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    await Promise.resolve()
    expect(invoked).toHaveBeenCalledOnce()
    dispose()
  })

  it("initializes state and actions from mui-app", async () => {
    registerAction("app.save", ({ store }) => {
      store?.set("saved", true)
    })
    document.body.innerHTML = `
      <mui-app>
        <script type="application/json" data-mui-state>{"name":"Ada","saved":false}</script>
        <span mui-text="name"></span>
        <mui-button mui-action="app.save">Save</mui-button>
      </mui-app>`
    await Promise.resolve()
    const app = document.querySelector("mui-app") as HTMLElement & { store: { get(path: string): unknown } }
    expect(document.querySelector("span")?.textContent).toBe("Ada")
    document.querySelector("mui-button")?.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    await Promise.resolve()
    expect(app.store.get("saved")).toBe(true)
  })

  it("binds elements added after mui-app connects", async () => {
    document.body.innerHTML = `
      <mui-app>
        <script type="application/json" data-mui-state>{"name":"Ada"}</script>
      </mui-app>`
    await Promise.resolve()
    const app = document.querySelector("mui-app") as HTMLElement & {
      store: { set(path: string, value: unknown): void }
    }
    const text = document.createElement("span")
    text.setAttribute("mui-text", "name")
    app.append(text)
    await Promise.resolve()
    expect(text.textContent).toBe("Ada")
    app.store.set("name", "Grace")
    expect(text.textContent).toBe("Grace")
  })

  it("two-way binds checked controls without handling bubbled child events", async () => {
    document.body.innerHTML = `
      <mui-app>
        <script type="application/json" data-mui-state>
          {"enabled":true,"choice":"b"}
        </script>
        <mui-switch mui-bind="enabled">Enabled</mui-switch>
        <mui-radio-group mui-bind="choice">
          <mui-radio value="a">A</mui-radio>
          <mui-radio value="b">B</mui-radio>
        </mui-radio-group>
      </mui-app>`
    await Promise.resolve()
    const app = document.querySelector("mui-app") as HTMLElement & {
      store: { get(path: string): unknown }
    }
    const toggle = document.querySelector("mui-switch") as HTMLElement & { checked: boolean }
    expect(toggle.checked).toBe(true)
    toggle.querySelector("input")?.click()
    expect(app.store.get("enabled")).toBe(false)
    const firstRadio = document.querySelector("mui-radio")
    firstRadio?.querySelector("input")?.click()
    expect(app.store.get("choice")).toBe("a")
  })
})
