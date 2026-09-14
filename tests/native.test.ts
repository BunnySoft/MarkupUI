import { afterEach, describe, expect, it, vi } from "vitest"
import {
  bind,
  builtInElementNames,
  createStore,
  installActions,
  installStyles,
  m,
  registerAction,
  registerElements,
  sanitizeHtml,
  setHtml,
  theme,
} from "../src/index.js"
import { advancedElementNames, advancedPlugin } from "../src/plugins/advanced.js"
import { widgetElementNames, widgetsPlugin } from "../src/plugins/widgets.js"
import "../src/components/avatar/index.js"
import { Button } from "../src/components/button/index.js"
import { Card } from "../src/components/card/index.js"
import { Carousel } from "../src/components/carousel/index.js"
import { Collapse } from "../src/components/collapse/index.js"
import { Divider } from "../src/components/divider/index.js"
import { Dropdown } from "../src/components/dropdown/index.js"
import { Heading, Link } from "../src/components/typography/index.js"
import { Input } from "../src/components/input/index.js"
import { Checkbox, CheckboxGroup } from "../src/components/checkbox/index.js"
import { Radio, RadioGroup, RadioButton } from "../src/components/radio/index.js"
import { Switch } from "../src/components/switch/index.js"
import { InputNumber } from "../src/components/input-number/index.js"
import { Select } from "../src/components/select/index.js"
import { Form, FormItem, FormItemGi } from "../src/components/form/index.js"
import { Grid, GridItem } from "../src/components/grid/index.js"
import { Layout, LayoutHeader, LayoutContent, LayoutFooter, LayoutSider } from "../src/components/layout/index.js"
import { Tag } from "../src/components/tag/index.js"
import { Badge } from "../src/components/badge/index.js"
import { Empty } from "../src/components/empty/index.js"
import { Spin } from "../src/components/spin/index.js"
import { Skeleton } from "../src/components/skeleton/index.js"
import { Popover } from "../src/components/popover/index.js"
import { Tooltip } from "../src/components/tooltip/index.js"
import { Alert } from "../src/components/alert/index.js"
import { List, ListItem } from "../src/components/list/index.js"
import { Table } from "../src/components/table/index.js"
import { Descriptions, DescriptionItem } from "../src/components/descriptions/index.js"
import { Breadcrumb, BreadcrumbItem } from "../src/components/breadcrumb/index.js"
import { PageHeader } from "../src/components/page-header/index.js"
import { Ellipsis } from "../src/components/ellipsis/index.js"
import { Tabs, Tab, TabPane } from "../src/components/tabs/index.js"
import { Menu, MenuItem, MenuGroup, MenuDivider, Submenu } from "../src/components/menu/index.js"
import { Pagination } from "../src/components/pagination/index.js"
import { Dialog, DialogHeader, DialogBody, DialogFooter, DialogAction } from "../src/components/dialog/index.js"
import { Modal, ModalHeader, ModalBody, ModalFooter, ModalAction } from "../src/components/modal/index.js"
import { Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter } from "../src/components/drawer/index.js"
import { Popconfirm, PopconfirmTrigger, PopconfirmPanel } from "../src/components/popconfirm/index.js"
import { Message, MessageContainer } from "../src/components/message/index.js"
import { Notification, NotificationContainer } from "../src/components/notification/index.js"
import { Progress } from "../src/components/progress/index.js"
import { Result, ResultHeader, ResultContent, ResultFooter } from "../src/components/result/index.js"
import { Image, ImageGroup } from "../src/components/image/index.js"
import { DatePicker } from "../src/components/date-picker/index.js"
import { TimePicker } from "../src/components/time-picker/index.js"
import { Upload, UploadDragger, UploadTrigger, UploadFileList } from "../src/components/upload/index.js"
import { AutoComplete, AutoCompleteAlias } from "../src/components/auto-complete/index.js"
import { Slider } from "../src/components/slider/index.js"
import { Rate } from "../src/components/rate/index.js"
import { InputOtp } from "../src/components/input-otp/index.js"
import { Popselect, PopselectTrigger, PopselectPanel } from "../src/components/popselect/index.js"
import { Tree, TreeNode } from "../src/components/tree/index.js"
import { TreeSelect } from "../src/components/tree-select/index.js"
import { Cascader } from "../src/components/cascader/index.js"
import { DataTable } from "../src/components/data-table/index.js"
import { Calendar } from "../src/components/calendar/index.js"
import { DynamicInput } from "../src/components/dynamic-input/index.js"
import { DynamicTags } from "../src/components/dynamic-tags/index.js"
import { Steps, Step } from "../src/components/steps/index.js"
import { Timeline, TimelineItem } from "../src/components/timeline/index.js"
import { Statistic } from "../src/components/statistic/index.js"
import { Anchor, AnchorLink } from "../src/components/anchor/index.js"
import { BackTop } from "../src/components/back-top/index.js"
import { Affix } from "../src/components/affix/index.js"
import { LoadingBar } from "../src/components/loading-bar/index.js"
import { InfiniteScroll } from "../src/components/infinite-scroll/index.js"
import { VirtualList } from "../src/components/virtual-list/index.js"
import { Code } from "../src/components/code/index.js"
import { Highlight } from "../src/components/highlight/index.js"
import { Split, SplitPane } from "../src/components/split/index.js"
import { GradientText } from "../src/components/gradient-text/index.js"
import { Watermark } from "../src/components/watermark/index.js"
import { FloatButton, FloatButtonGroup } from "../src/components/float-button/index.js"
import { ColorPicker } from "../src/components/color-picker/index.js"

afterEach(() => {
  document.body.replaceChildren()
  document.documentElement.removeAttribute("data-m-theme")
  vi.restoreAllMocks()
})

describe("native elements", () => {
  it("registers and upgrades m elements", () => {
    installStyles(document)
    registerElements(customElements)
    document.body.innerHTML = `
      <m-stack gap="sm">
        <m-input value="Ada"></m-input>
        <m-button>Save</m-button>
      </m-stack>`
    const input = document.querySelector("m-input") as HTMLElement & { value: string }
    expect(input.value).toBe("Ada")
    expect(document.getElementById("m-styles")).not.toBeNull()
    expect(m.elements.names).toEqual(builtInElementNames)
    expect(new Set(builtInElementNames).size).toBe(builtInElementNames.length)
    expect(builtInElementNames.some(name => name === "m-collapse" || name.startsWith("m-collapse-"))).toBe(false)
    expect(customElements.get("m-collapse")).toBe(Collapse)
    expect(builtInElementNames.some(name => name === "m-dropdown" || name.startsWith("m-dropdown-"))).toBe(false)
    expect(customElements.get("m-dropdown")).toBe(Dropdown)
    expect(customElements.get("m-input")).toBe(Input)
    expect(customElements.get("m-select")).toBe(Select)
    expect(builtInElementNames).not.toContain("m-select")
    for (const Type of [Form, FormItem, FormItemGi, Grid, GridItem, Layout, LayoutHeader, LayoutContent, LayoutFooter, LayoutSider, Tag, Badge, Empty, Spin, Skeleton, Popover, Tooltip, Alert, List, ListItem, Table, Descriptions, DescriptionItem, Breadcrumb, BreadcrumbItem, PageHeader, Ellipsis, Tabs, Tab, TabPane, Menu, MenuItem, MenuGroup, MenuDivider, Submenu, Pagination, Dialog, DialogHeader, DialogBody, DialogFooter, DialogAction, Modal, ModalHeader, ModalBody, ModalFooter, ModalAction, Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter, Popconfirm, PopconfirmTrigger, PopconfirmPanel, Message, MessageContainer, Notification, NotificationContainer, Progress, Result, ResultHeader, ResultContent, ResultFooter, Image, ImageGroup, DatePicker, TimePicker, Upload, UploadDragger, UploadTrigger, UploadFileList, AutoComplete, AutoCompleteAlias, Slider, Rate, InputOtp, Popselect, PopselectTrigger, PopselectPanel, Tree, TreeNode, TreeSelect, Cascader, DataTable, Calendar, DynamicInput, DynamicTags, Steps, Step, Timeline, TimelineItem, Statistic, Anchor, AnchorLink, BackTop, Affix, LoadingBar, InfiniteScroll, VirtualList, Code, Highlight, Split, SplitPane, GradientText, Watermark, FloatButton, FloatButtonGroup, ColorPicker]) {
      expect(customElements.get(Type.tag)).toBe(Type)
      expect(builtInElementNames).not.toContain(Type.tag)
    }
    expect(builtInElementNames).not.toContain("m-popover-trigger")
    expect(builtInElementNames).not.toContain("m-popover-content")
    expect(builtInElementNames).not.toContain("m-tooltip-trigger")
    expect(builtInElementNames).not.toContain("m-tooltip-content")
    expect(customElements.get("m-checkbox")).toBe(Checkbox)
    expect(customElements.get("m-checkbox-group")).toBe(CheckboxGroup)
    expect(builtInElementNames).not.toContain("m-checkbox")
    expect(builtInElementNames).not.toContain("m-switch")
    expect(customElements.get("m-switch")).toBe(Switch)
    for (const Type of [Radio, RadioGroup, RadioButton]) {
      expect(customElements.get(Type.tag)).toBe(Type)
      expect(builtInElementNames).not.toContain(Type.tag)
    }
    for (const tag of ["m-input", "m-textarea", "m-input-group", "m-input-group-label"]) expect(builtInElementNames).not.toContain(tag)
    const styles = document.getElementById("m-styles")?.textContent ?? ""
    expect(styles).toContain("--m-control-height")
    expect(styles).toContain(":focus-visible")
    expect(styles).toContain("prefers-reduced-motion")
    expect(styles).toContain("m-card[hoverable]:hover")
    expect(styles).not.toContain("translateY(1px)")
  })

  it("provides semantic content primitives", async () => {
    document.body.innerHTML = `
      <m-main>
        <m-heading level="1">Title</m-heading>
        <m-text>Read the <m-link href="#more">details</m-link>.</m-text>
        <m-field label="Name"><m-input></m-input></m-field>
      </m-main>`
    await Promise.resolve()
    expect(document.querySelector("m-main")?.getAttribute("role")).toBe("main")
    expect(document.querySelector("m-heading > h1")?.textContent).toBe("Title")
    expect(document.querySelector("m-heading")?.hasAttribute("role")).toBe(false)
    expect(customElements.get("m-heading")).toBe(Heading)
    expect(customElements.get("m-link")).toBe(Link)
    for (const tag of ["m-heading", "m-text", "m-link", "m-strong", "m-code"]) expect(builtInElementNames).not.toContain(tag)
    expect(document.querySelector("m-link > a")?.getAttribute("href")).toBe("#more")
    expect(document.querySelector("m-field > [data-m-label]")?.textContent).toBe("Name")
    expect(document.querySelector("m-input input")?.getAttribute("aria-label")).toBe("Name")
  })

  it("supports compound card and dialog anatomy", async () => {
    document.body.innerHTML = `
      <m-app>
        <m-card>
          <m-card-header>Header</m-card-header>
          <m-card-content>Content</m-card-content>
          <m-card-footer>Footer</m-card-footer>
        </m-card>
        <m-dialog id="dialog">
          <m-dialog-header>Dialog</m-dialog-header>
          <m-dialog-content>Body</m-dialog-content>
          <m-dialog-footer><m-button m-action="close">Close</m-button></m-dialog-footer>
        </m-dialog>
      </m-app>`
    await Promise.resolve()
    const card = document.querySelector("m-card")
    const dialog = document.querySelector("m-dialog") as Dialog
    const closeEvents = vi.fn()
    dialog.addEventListener("m:close", closeEvents)
    expect(card).toBeInstanceOf(Card)
    expect(card?.getAttribute("data-state")).toBe("structured")
    dialog.showModal()
    expect(dialog.open).toBe(true)
    document.querySelector("m-dialog m-button")?.dispatchEvent(
      new MouseEvent("click", { bubbles: true }),
    )
    await Promise.resolve()
    expect(dialog.open).toBe(false)
    expect(closeEvents).toHaveBeenCalledOnce()
  })

  it("provides common display and feedback elements", () => {
    document.body.innerHTML = `
      <m-avatar label="Ada">A</m-avatar>
      <m-divider></m-divider>
      <m-progress value="25" max="50"></m-progress>
      <m-skeleton width="100px" height="20px"></m-skeleton>
      <m-empty description="No rows"></m-empty>
      <m-spin description="Loading rows"></m-spin>
      <m-tag closable>Ready</m-tag>
      <m-button-group><m-button>One</m-button><m-button>Two</m-button></m-button-group>`
    expect(document.querySelector("m-avatar")?.getAttribute("role")).toBe("img")
    expect(customElements.get("m-divider")).toBe(Divider)
    expect(builtInElementNames).not.toContain("m-divider")
    expect(document.querySelector("m-divider")?.hasAttribute("role")).toBe(false)
    expect(document.querySelector("m-divider > hr")?.getAttribute("aria-orientation")).toBe("horizontal")
    expect(customElements.get("m-progress")).toBe(Progress)
    expect(builtInElementNames).not.toContain("m-progress")
    const prog = document.querySelector("m-progress") as Progress
    expect(prog.controls[0]?.value).toBe(25)
    expect(prog.controls[0]?.max).toBe(50)
    expect(customElements.get("m-skeleton")).toBe(Skeleton)
    expect(builtInElementNames).not.toContain("m-skeleton")
    expect(document.querySelector("m-skeleton > [data-m-skeleton-group]")?.getAttribute("aria-hidden")).toBe("true")
    expect(customElements.get("m-empty")).toBe(Empty)
    expect(builtInElementNames).not.toContain("m-empty")
    expect(document.querySelector("m-empty")?.textContent).toContain("No rows")
    expect(customElements.get("m-spin")).toBe(Spin)
    expect(builtInElementNames).not.toContain("m-spin")
    expect(document.querySelector("m-spin")?.textContent).toContain("Loading rows")
    expect(document.querySelector("m-tag > [data-m-close]")).not.toBeNull()
    expect(document.querySelector("m-button-group")?.getAttribute("role")).toBe("group")
  })

  it("composes the standalone Button family with the aggregate", () => {
    document.body.innerHTML = `
      <m-button type="primary" appearance="secondary" size="large" shape="round">Action</m-button>
      <m-button type="info" appearance="ghost">Info</m-button>
      <m-button appearance="dashed">Dashed</m-button>
      <m-button appearance="text">Text</m-button>
      <m-button loading>Loading</m-button>
      <m-button shape="circle" aria-label="Add">+</m-button>`
    const loading = document.querySelector("m-button[loading]") as Button
    expect(loading.control?.getAttribute("aria-busy")).toBe("true")
    expect(loading.control?.getAttribute("aria-disabled")).toBe("true")
    expect(loading.tabIndex).toBe(-1)
    expect(loading.querySelector("[data-part=spinner]")).not.toBeNull()
    loading.removeAttribute("loading")
    expect(loading.control?.hasAttribute("aria-busy")).toBe(false)
    expect(loading.querySelector("[data-part=spinner]")).toBeNull()
    expect(customElements.get("m-button")).toBe(Button)
    expect(builtInElementNames).not.toContain("m-button")
    expect(builtInElementNames).not.toContain("m-button-group")
  })

  it("supports drawer, tooltip and popover overlays", async () => {
    document.body.innerHTML = `
      <m-app>
        <m-drawer id="drawer">
          <m-drawer-header>Drawer</m-drawer-header>
          <m-drawer-content>Body</m-drawer-content>
          <m-drawer-footer><m-button m-action="close">Close</m-button></m-drawer-footer>
        </m-drawer>
        <m-tooltip text="Helpful"><m-button>Help</m-button></m-tooltip>
        <m-popover>
          <m-popover-trigger><m-button>Open</m-button></m-popover-trigger>
          <m-popover-content>Popover body</m-popover-content>
        </m-popover>
      </m-app>`
    await Promise.resolve()
    const drawer = document.querySelector("m-drawer") as Drawer
    drawer.show()
    expect(drawer.open).toBe(true)
    document.querySelector("m-drawer m-button")?.dispatchEvent(
      new MouseEvent("click", { bubbles: true }),
    )
    await Promise.resolve()
    expect(drawer.open).toBe(false)

    const tooltip = document.querySelector("m-tooltip") as Tooltip
    expect(tooltip).toBeInstanceOf(Tooltip)
    expect(customElements.get("m-tooltip")).toBe(Tooltip)
    expect(builtInElementNames).not.toContain("m-tooltip")
    expect(tooltip.placement).toBe("top")
    expect(tooltip.text).toBe("Helpful")
    expect(tooltip.show).toBe(false)

    const popover = document.querySelector("m-popover") as Popover
    expect(popover).toBeInstanceOf(Popover)
    expect(customElements.get("m-popover")).toBe(Popover)
    expect(builtInElementNames).not.toContain("m-popover")
    expect(popover.trigger).toBe("click")
    expect(popover.placement).toBe("bottom")
    expect(popover.show).toBe(false)
  })

  it("provides managed message and notification services", () => {
    const message = m.message.show("Saved", { duration: 0, type: "success" })
    const notification = m.notification.show({
      title: "Complete",
      content: "The operation finished.",
      duration: 0,
    })
    expect(message.element.textContent).toBe("Saved")
    expect(notification.element.textContent).toContain("Complete")
    expect(document.querySelectorAll("m-overlay-host")).toHaveLength(2)
    m.message.clear()
    expect(document.querySelector("m-overlay-host")).toBeNull()
  })

  it("supports form validation and advanced selection controls", async () => {
    document.body.innerHTML = `
      <m-form>
        <m-form-item key="name">
          <label for="native-name">Name</label>
          <m-input required minlength="3"><input id="native-name"></m-input>
          <p class="m-form-item__feedback" id="native-error" hidden></p>
        </m-form-item>
      </m-form>
      <m-radio-group value="b">
        <legend>Selection</legend>
        <m-radio name="selection" value="a">A</m-radio>
        <m-radio name="selection" value="b">B</m-radio>
      </m-radio-group>
      <m-slider value="25" min="0" max="100"></m-slider>
      <m-autocomplete value="Ada">
        <m-option value="Ada">Ada</m-option>
        <m-option value="Grace">Grace</m-option>
      </m-autocomplete>`
    await Promise.resolve()
    await new Promise(resolve => setTimeout(resolve, 0))
    const form = document.querySelector("m-form") as Form
    const input = document.querySelector("m-input") as HTMLElement & { value: string }
    expect((await form.validate()).status).toBe("invalid")
    expect(document.querySelector("m-form-item")?.getAttribute("data-form-status")).toBe("error")
    input.value = "Ada"
    expect((await form.validate()).status).toBe("valid")
    const radios = [...document.querySelectorAll("m-radio")] as Array<HTMLElement & {
      checked: boolean
    }>
    expect(radios[0]?.checked).toBe(false)
    expect(radios[1]?.checked).toBe(true)
    expect((document.querySelector("m-slider") as HTMLElement & { value: number }).value).toBe(25)
    expect(document.querySelectorAll("m-autocomplete datalist option")).toHaveLength(2)
  })

  it("supports navigation and data display components", () => {
    document.body.innerHTML = `
      <m-menu value="reports">
        <m-menu-item value="home">Home</m-menu-item>
        <m-menu-item value="reports">Reports</m-menu-item>
      </m-menu>
      <m-pagination page="2" count="4"></m-pagination>
      <m-steps current="2">
        <m-step>Start</m-step>
        <m-step>Review</m-step>
        <m-step>Finish</m-step>
      </m-steps>
      <m-list><m-list-item>One</m-list-item></m-list>
      <m-descriptions columns="2">
        <m-description-item label="Name">Ada</m-description-item>
      </m-descriptions>
      <m-statistic label="Revenue" value="42" prefix="$" suffix="K"></m-statistic>`
    expect(document.querySelector("m-menu-item[selected]")?.getAttribute("value")).toBe("reports")
    expect(document.querySelector("m-pagination [aria-current=page]")?.textContent).toBe("2")
    expect(document.querySelector("m-step[current]")?.textContent).toContain("Review")
    expect(document.querySelector("m-list")?.getAttribute("role")).toBe("list")
    expect(document.querySelector("[data-m-label]")?.textContent).toBe("Name")
    expect(document.querySelector("[data-m-statistic-value]")?.textContent).toBe("$42K")
    const pagination = document.querySelector("m-pagination") as HTMLElement & { page: number }
    const steps = document.querySelector("m-steps") as HTMLElement & { current: number }
    pagination.page = 4
    steps.current = 3
    expect(document.querySelector("m-pagination [aria-current=page]")?.textContent).toBe("4")
    expect(document.querySelector("m-step[current]")?.textContent).toContain("Finish")
  })

  it("reflects dynamic attributes and keyboard navigation", () => {
    theme.register("reflection-light", { "color-primary": "#111111" })
    theme.register("reflection-dark", { "color-primary": "#eeeeee" })
    document.body.innerHTML = `
      <m-button>Action</m-button>
      <m-theme name="reflection-light"></m-theme>
      <m-tabs>
        <m-tab title="One">One</m-tab>
        <m-tab title="Two">Two</m-tab>
      </m-tabs>
      <m-menu>
        <m-menu-item value="a">A</m-menu-item>
        <m-menu-item value="b">B</m-menu-item>
      </m-menu>`
    const button = document.querySelector("m-button") as Button
    button.toggleAttribute("disabled", true)
    expect(button.tabIndex).toBe(-1)
    expect(button.control?.getAttribute("aria-disabled")).toBe("true")
    button.toggleAttribute("disabled", false)
    expect(button.control?.tabIndex).toBe(0)
    expect(button.tabIndex).toBe(-1)

    const scopedTheme = document.querySelector("m-theme") as HTMLElement
    scopedTheme.setAttribute("name", "reflection-dark")
    expect(scopedTheme.style.getPropertyValue("--m-color-primary")).toBe("#eeeeee")

    const tabs = [...document.querySelectorAll<HTMLElement>("[role=tab]")]
    tabs[0]?.focus()
    tabs[0]?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }))
    expect(document.activeElement).toBe(tabs[1])
    expect(tabs[1]?.getAttribute("aria-selected")).toBe("true")

    const menuItems = [...document.querySelectorAll<HTMLElement>("m-menu-item")]
    menuItems[0]?.focus()
    menuItems[0]?.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
    )
    expect(document.activeElement).toBe(menuItems[1])
  })

  it("supports tree expansion and selection", () => {
    document.body.innerHTML = `
      <m-tree>
        <m-tree-node label="Analytics" value="analytics" expanded>
          <m-tree-node label="Reports" value="reports"></m-tree-node>
          <m-tree-node label="Metrics" value="metrics"></m-tree-node>
        </m-tree-node>
      </m-tree>`
    const root = document.querySelector("m-tree-node") as HTMLElement & { expanded: boolean }
    const reports = document.querySelector('m-tree-node[value="reports"]')
    expect(root.expanded).toBe(true)
    reports?.querySelector<HTMLElement>("[data-m-tree-row]")?.click()
    expect(document.querySelector("m-tree") as HTMLElement & { value: string }).toHaveProperty(
      "value",
      "reports",
    )
    expect(reports?.hasAttribute("selected")).toBe(true)
    root.querySelector<HTMLElement>(":scope > [data-m-tree-row]")?.click()
    expect(root.expanded).toBe(false)
  })

  it("provides a small DOM helper", () => {
    document.body.innerHTML = `<div class="item">One</div>`
    expect(m(".item").addClass("active").text()).toBe("One")
    expect(document.querySelector(".item")?.classList.contains("active")).toBe(true)
  })

  it("supports tabs, accordion and form controls", () => {
    document.body.innerHTML = `
      <m-tabs>
        <m-tab title="One">First</m-tab>
        <m-tab title="Two">Second</m-tab>
      </m-tabs>
      <m-accordion><m-accordion-item title="Details">Body</m-accordion-item></m-accordion>
      <m-select aria-label="Choice">
        <option value="a">A</option>
        <option value="b" selected>B</option>
      </m-select>`
    const tabs = document.querySelector("m-tabs") as HTMLElement & { select(index: number): void }
    const panels = [...document.querySelectorAll("m-tab")] as HTMLElement[]
    expect(panels[0]?.hidden).toBe(false)
    expect(panels[1]?.hidden).toBe(true)
    expect(document.getElementById("m-styles")?.textContent).toContain(
      "[hidden]{display:none!important}",
    )
    tabs.select(1)
    expect(panels[1]?.hidden).toBe(false)
    const select = document.querySelector("m-select") as HTMLElement & { value: string }
    expect(select.value).toBe("b")
  })

  it("loads sanitized dynamic HTML through m-include", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(
      `<m-card>Loaded<script>unsafe()</script></m-card>`,
      { status: 200 },
    )))
    document.body.innerHTML = `<m-include src="/views/example.html"></m-include>`
    await vi.waitFor(() => {
      expect(document.querySelector("m-include m-card")?.textContent).toContain("Loaded")
    })
    expect(document.querySelector("m-include script")).toBeNull()
  })
})

describe("unified API and plugins", () => {
  it("exposes namespaced services without requiring the query helper", () => {
    expect(m.actions.register).toBe(registerAction)
    expect(m.state.create).toBe(createStore)
    expect(m.theme).toBe(theme)
    expect(m.elements.registerAll).toBe(registerElements)
  })

  it("installs plugins once and supports optional query extensions", () => {
    const install = vi.fn((api: typeof m) => {
      api.queryExtensions.register("testMark", function () {
        return this.addClass("plugin-mark")
      })
    })
    const plugin = { name: "test.query-extension", install }
    m.use(plugin).use(plugin)
    document.body.innerHTML = `<m-card></m-card>`
    const result = m("m-card")
    const extension = Reflect.get(result, "testMark")
    expect(typeof extension).toBe("function")
    Reflect.apply(extension as (...args: unknown[]) => unknown, result, [])
    expect(document.querySelector("m-card")?.classList.contains("plugin-mark")).toBe(true)
    expect(install).toHaveBeenCalledOnce()
    expect(m.plugins.installed(plugin.name)).toBe(true)
  })

  it("installs the optional advanced component plugin", async () => {
    m.use(advancedPlugin)
    expect(advancedElementNames).toHaveLength(6)
    expect(new Set(advancedElementNames).size).toBe(advancedElementNames.length)
    document.body.innerHTML = `
      <m-data-grid>
        <m-data-column key="name" label="Name" sortable></m-data-column>
        <m-data-column key="score" label="Score"></m-data-column>
      </m-data-grid>
      <m-date-picker value="2026-08-26"></m-date-picker>
      <m-time-picker value="18:30"></m-time-picker>
      <m-upload accept=".csv"></m-upload>
      <m-virtual-list height="100px" item-height="25"></m-virtual-list>`
    const grid = document.querySelector("m-data-grid") as HTMLElement & {
      rows: ReadonlyArray<Record<string, unknown>>
    }
    grid.rows = [
      { name: "Grace", score: 2 },
      { name: "Ada", score: 1 },
    ]
    expect(document.querySelectorAll("m-data-grid tbody tr")).toHaveLength(2)
    document.querySelector<HTMLElement>("m-data-grid th[sortable]")?.click()
    expect(document.querySelector("m-data-grid tbody td")?.textContent).toBe("Ada")
    expect((document.querySelector("m-date-picker") as HTMLElement & { value: string }).value)
      .toBe("2026-08-26")
    expect((document.querySelector("m-time-picker") as HTMLElement & { value: string }).value)
      .toBe("18:30")
    const virtual = document.querySelector("m-virtual-list") as HTMLElement & {
      items: readonly unknown[]
    }
    virtual.items = Array.from({ length: 100 }, (_, index) => `Row ${index + 1}`)
    await Promise.resolve()
    expect(document.querySelectorAll("[data-m-virtual-item]").length).toBeLessThan(20)
    expect(document.querySelector("m-upload input")?.getAttribute("accept")).toBe(".csv")
  })

  it("installs the optional widgets plugin", () => {
    m.use(widgetsPlugin)
    expect(widgetElementNames).toHaveLength(8)
    expect(widgetElementNames).not.toContain("m-input-number")
    expect(customElements.get("m-input-number")).toBe(InputNumber)
    expect(document.getElementById("m-widgets-styles")?.textContent).not.toContain("m-input-number")
    expect(widgetElementNames.some(name => String(name).startsWith("m-carousel"))).toBe(false)
    expect(builtInElementNames.some(name => name.startsWith("m-carousel"))).toBe(false)
    expect(customElements.get("m-carousel")).toBe(Carousel)
    expect(document.getElementById("m-widgets-styles")?.textContent).not.toContain("m-carousel")
    document.body.innerHTML = `
      <m-breadcrumb><m-breadcrumb-item>Home</m-breadcrumb-item></m-breadcrumb>
      <m-timeline><m-timeline-item>Created</m-timeline-item></m-timeline>
      <m-input-number value="2" min="0" max="5" aria-label="Quantity"></m-input-number>
      <m-color-picker value="#ff0000"></m-color-picker>
      <m-rating value="3"></m-rating>
      <m-transfer></m-transfer>
      <m-cascader></m-cascader>`
    expect(document.querySelector("m-breadcrumb")?.getAttribute("aria-label")).toBe("Breadcrumb")
    const number = document.querySelector("m-input-number") as InputNumber
    number.stepUp()
    expect(number.value).toBe(3)
    expect((document.querySelector("m-color-picker") as HTMLElement & { value: string }).value)
      .toBe("#ff0000")
    expect(document.querySelectorAll("m-rating button[data-active]")).toHaveLength(3)
    expect(document.querySelectorAll("m-rating button[selected]")).toHaveLength(1)
    const transfer = document.querySelector("m-transfer") as HTMLElement & {
      options: readonly { label: string; value: string }[]
      value: string[]
    }
    transfer.options = [
      { label: "One", value: "one" },
      { label: "Two", value: "two" },
    ]
    transfer.querySelector<HTMLElement>("[data-m-transfer-list] button")?.click()
    transfer.querySelector<HTMLElement>('[aria-label="Move to selected"]')?.click()
    expect(transfer.value).toEqual(["one"])

    const cascader = document.querySelector("m-cascader") as HTMLElement & {
      options: readonly unknown[]
      value: string[]
    }
    cascader.options = [{
      label: "Data",
      value: "data",
      children: [{ label: "Reports", value: "reports" }],
    }]
    expect(cascader.value).toEqual(["data", "reports"])
    expect(document.querySelectorAll("m-cascader select")).toHaveLength(2)
  })
})

describe("safe HTML", () => {
  it("removes executable content and unsafe URLs", () => {
    const target = document.createElement("div")
    setHtml(target, `
      <m-card onclick="alert(1)">
        <script>alert(1)</script>
        <style>body { display: none }</style>
        <a href="javascript:alert(1)">Unsafe</a>
        <img src="//evil.example/image.png">
        Safe
      </m-card>`)
    expect(target.querySelector("script")).toBeNull()
    expect(target.querySelector("style")).toBeNull()
    expect(target.querySelector("m-card")?.hasAttribute("onclick")).toBe(false)
    expect(target.querySelector("a")?.hasAttribute("href")).toBe(false)
    expect(target.querySelector("img")?.hasAttribute("src")).toBe(false)
    expect(target.textContent).toContain("Safe")
  })

  it("returns a reusable document fragment", () => {
    const fragment = sanitizeHtml("<m-row><span>Ready</span></m-row>")
    expect(fragment.querySelector("m-row")?.textContent).toBe("Ready")
  })
})

describe("themes", () => {
  it("switches tokens without rerendering components", () => {
    theme.register("test", { "color-primary": "#ff0000" })
    theme.set("test")
    expect(document.documentElement.dataset.mTheme).toBe("test")
    expect(document.documentElement.style.getPropertyValue("--m-color-primary")).toBe("#ff0000")
  })

  it("clears stale tokens when switching to a partial custom theme", () => {
    theme.register("partial", { "color-primary": "#123456" })
    theme.set("dark")
    expect(document.documentElement.style.getPropertyValue("--m-text-secondary")).not.toBe("")
    theme.set("partial")
    expect(document.documentElement.style.getPropertyValue("--m-color-primary")).toBe("#123456")
    expect(document.documentElement.style.getPropertyValue("--m-text-secondary")).toBe("")
  })
})

describe("optional state and actions", () => {
  it("binds canonical native editing and composition without echoing writes or consuming child action events", async () => {
    const store = createStore({ name: "Original" })
    document.body.innerHTML = '<m-input aria-label="Name" m-bind="name" clearable><span>Suffix</span></m-input>'
    const dispose = bind(document.body, store)
    await Promise.resolve()
    const input = document.querySelector<Input>("m-input")!, control = input.native
    control.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }))
    control.value = "日本"; control.setSelectionRange(1, 1)
    control.dispatchEvent(new InputEvent("input", { bubbles: true, isComposing: true }))
    expect(store.get("name")).toBe("日本")
    expect(control.selectionStart).toBe(1)
    control.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true }))
    input.querySelector("span")!.dispatchEvent(new Event("input", { bubbles: true }))
    expect(store.get("name")).toBe("日本")
    input.clear()
    expect(store.get("name")).toBe("")
    dispose()
    control.value = "Unbound"; control.dispatchEvent(new Event("input", { bubbles: true }))
    expect(store.get("name")).toBe("")
  })

  it("binds state to native custom elements", () => {
    const store = createStore({ customer: { name: "Ada" } })
    document.body.innerHTML = `
      <m-input m-bind="customer.name"></m-input>
      <span m-text="customer.name"></span>`
    const dispose = bind(document.body, store)
    const input = document.querySelector("m-input") as HTMLElement & { value: string }
    expect(input.value).toBe("Ada")
    store.set("customer.name", "Grace")
    expect(input.value).toBe("Grace")
    expect(document.querySelector("span")?.textContent).toBe("Grace")
    dispose()
  })

  it("dispatches named actions through event delegation", async () => {
    const invoked = vi.fn()
    registerAction("test.save", invoked)
    document.body.innerHTML = `<m-button m-action="test.save">Save</m-button>`
    const dispose = installActions(document.body)
    document.querySelector("m-button")?.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    await Promise.resolve()
    expect(invoked).toHaveBeenCalledOnce()
    dispose()
  })

  it("initializes state and actions from m-app", async () => {
    registerAction("app.save", ({ store }) => {
      store?.set("saved", true)
    })
    document.body.innerHTML = `
      <m-app>
        <script type="application/json" data-m-state>{"name":"Ada","saved":false}</script>
        <span m-text="name"></span>
        <m-button m-action="app.save">Save</m-button>
      </m-app>`
    await Promise.resolve()
    const app = document.querySelector("m-app") as HTMLElement & { store: { get(path: string): unknown } }
    expect(document.querySelector("span")?.textContent).toBe("Ada")
    document.querySelector("m-button")?.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    await Promise.resolve()
    expect(app.store.get("saved")).toBe(true)
  })

  it("binds elements added after m-app connects", async () => {
    document.body.innerHTML = `
      <m-app>
        <script type="application/json" data-m-state>{"name":"Ada"}</script>
      </m-app>`
    await Promise.resolve()
    const app = document.querySelector("m-app") as HTMLElement & {
      store: { set(path: string, value: unknown): void }
    }
    const text = document.createElement("span")
    text.setAttribute("m-text", "name")
    app.append(text)
    await Promise.resolve()
    expect(text.textContent).toBe("Ada")
    app.store.set("name", "Grace")
    expect(text.textContent).toBe("Grace")
  })

  it("two-way binds checked controls without handling bubbled child events", async () => {
    document.body.innerHTML = `
      <m-app>
        <script type="application/json" data-m-state>
          {"enabled":true,"choice":"b"}
        </script>
        <m-switch m-bind="enabled">Enabled</m-switch>
        <m-radio-group m-bind="choice">
          <legend>Bound selection</legend>
          <m-radio name="bound" value="a">A</m-radio>
          <m-radio name="bound" value="b">B</m-radio>
        </m-radio-group>
      </m-app>`
    await Promise.resolve()
    const app = document.querySelector("m-app") as HTMLElement & {
      store: { get(path: string): unknown }
    }
    const toggle = document.querySelector("m-switch") as HTMLElement & { checked: boolean }
    expect(toggle.checked).toBe(true)
    toggle.querySelector("input")?.click()
    expect(app.store.get("enabled")).toBe(false)
    const firstRadio = document.querySelector("m-radio")
    firstRadio?.querySelector("input")?.click()
    await new Promise(resolve => setTimeout(resolve, 15))
    expect(app.store.get("choice")).toBe("a")
  })
  it("keeps Radio boolean binding and explicit RadioButton submission value native", async () => {
    document.body.innerHTML = '<form><m-radio m-bind="checked" name="consent" value="yes" checked>Consent</m-radio><m-radio-button m-bind="key" m-bind-property="value" name="layout" checked>Layout</m-radio-button></form>'
    const radio = document.querySelector<Radio>("m-radio")!, button = document.querySelector<RadioButton>("m-radio-button")!
    const store = createStore({ checked: false, key: "grid" }), dispose = bind(document.body, store)
    await Promise.resolve()
    expect(radio.checked).toBe(false); expect(radio.value).toBe("yes")
    expect(button.value).toBe("grid"); expect(button.checked).toBe(true)
    const changes = vi.fn(); radio.addEventListener("change", changes)
    store.set("checked", true); expect(radio.checked).toBe(true); expect(changes).not.toHaveBeenCalled()
    radio.checked = false; radio.click(); expect(store.get("checked")).toBe(true)
    button.value = "list"; button.checked = false; button.click(); expect(store.get("key")).toBe("list")
    expect([...new FormData(document.querySelector("form")!)]).toEqual([["consent", "yes"], ["layout", "list"]])
    radio.dispatchEvent(new CustomEvent("m:change", { detail: false })); expect(store.get("checked")).toBe(true)
    dispose(); radio.checked = false; radio.click(); expect(changes).toHaveBeenCalledTimes(2)
  })
  it("validates actual RadioGroup native participants through canonical FormItem", async () => {
    document.body.innerHTML = '<m-form><m-form-item key="plan"><m-radio-group><legend>Plan</legend><m-radio name="plan" value="basic" required>Basic</m-radio></m-radio-group><p class="m-form-item__feedback" id="plan-error" hidden></p></m-form-item></m-form>'
    await new Promise(resolve => setTimeout(resolve, 0))
    const form = document.querySelector("m-form") as Form
    const group = document.querySelector<RadioGroup>("m-radio-group")!
    const control = group.querySelector<Radio>("m-radio")!.native
    expect((await form.validate()).status).toBe("invalid"); expect(control.getAttribute("aria-invalid")).toBe("true")
    expect(control.getAttribute("aria-describedby")).toBe("plan-error")
    expect(group.native.hasAttribute("aria-invalid")).toBe(false)
    group.value = "basic"
    expect((await form.validate()).status).toBe("valid"); expect(control.hasAttribute("aria-invalid")).toBe(false)
  })
  it("binds only the owning RadioGroup and reads native value rather than event detail", async () => {
    document.body.innerHTML = `<m-radio-group m-bind="outer"><legend>Outer</legend>
      <m-radio name="outer" value="a" checked>A</m-radio><m-radio-button name="outer" value="b">B</m-radio-button>
      <m-radio-group m-bind="inner"><legend>Inner</legend><m-radio name="inner" value="x" checked>X</m-radio><m-radio name="inner" value="y">Y</m-radio></m-radio-group>
      </m-radio-group>`
    const group = document.querySelector<RadioGroup>("m-radio-group")!, inner = group.querySelector<RadioGroup>("m-radio-group")!
    const store = createStore({ outer: "a", inner: "x" }), dispose = bind(document.body, store)
    group.refresh(); inner.refresh()
    inner.querySelector<Radio>("m-radio[value=y]")!.click(); await new Promise(resolve => setTimeout(resolve, 15))
    expect(store.get("inner")).toBe("y"); expect(store.get("outer")).toBe("a")
    group.value = "b"; group.dispatchEvent(new CustomEvent("m:radio-group-change", { detail: { value: "stale" } }))
    expect(store.get("outer")).toBe("b")
    store.set("outer", null); expect(group.value).toBeNull()
    dispose(); group.querySelector<Radio>("m-radio[value=a]")!.click(); await new Promise(resolve => setTimeout(resolve, 15))
    expect(store.get("outer")).toBeNull()
  })
  it("keeps legacy Checkbox boolean binding separate from native submission strings", async () => {
    document.body.innerHTML = '<form><m-checkbox m-bind="enabled" name="terms" value="yes" checked>Terms</m-checkbox></form>'
    await Promise.resolve()
    const box = document.querySelector<Checkbox>("m-checkbox")!, store = createStore({ enabled: false })
    const dispose = bind(document.body, store), changes = vi.fn()
    store.subscribe("enabled", changes)
    expect([box.checked, box.defaultChecked, box.value]).toEqual([false, true, "yes"])
    box.click()
    expect(store.get("enabled")).toBe(true)
    expect(changes).toHaveBeenCalledOnce()
    expect(new FormData(document.querySelector("form")!).get("terms")).toBe("yes")
    store.set("enabled", false)
    expect(box.checked).toBe(false); expect(box.defaultChecked).toBe(true)
    box.dispatchEvent(new CustomEvent("m:change", { detail: "not boolean" }))
    expect(store.get("enabled")).toBe(false)
    dispose(); box.click(); expect(store.get("enabled")).toBe(false)
  })
  it("keeps canonical FormItem validation on native checked state and error descriptions", async () => {
    document.body.innerHTML = '<m-form><m-form-item key="consent"><m-checkbox value="yes" required>Consent</m-checkbox><p class="m-form-item__feedback" id="consent-error" hidden></p></m-form-item></m-form>'
    await new Promise(resolve => setTimeout(resolve, 0))
    const form = document.querySelector("m-form") as Form
    const box = document.querySelector<Checkbox>("m-checkbox")!
    expect((await form.validate()).status).toBe("invalid")
    expect(box.native.getAttribute("aria-invalid")).toBe("true")
    expect(box.native.getAttribute("aria-describedby")).toBe("consent-error")
    expect(box.value).toBe("yes")
    box.checked = true
    expect((await form.validate()).status).toBe("valid")
    expect(box.native.hasAttribute("aria-invalid")).toBe(false)
  })
  it("binds explicit Checkbox submission value and computed group selection without child leakage", async () => {
    document.body.innerHTML = `<m-checkbox m-bind="submission" m-bind-property="value" checked>String</m-checkbox>
      <m-checkbox-group m-bind="selection"><legend>Choices</legend>
        <m-checkbox value="a" checked>A</m-checkbox><m-checkbox value="b">B</m-checkbox>
        <m-checkbox-group><legend>Nested</legend><m-checkbox value="n">Nested</m-checkbox></m-checkbox-group>
      </m-checkbox-group>`
    await new Promise(resolve => setTimeout(resolve, 10))
    const store = createStore({ submission: "yes", selection: ["b"] })
    const dispose = bind(document.body, store)
    const box = document.querySelector<Checkbox>("m-checkbox")!, group = document.querySelector<CheckboxGroup>("m-checkbox-group")!
    expect(box.value).toBe("yes")
    expect(group.value).toEqual(["b"])
    group.querySelector<Checkbox>("m-checkbox[value=a]")!.click()
    await new Promise(resolve => setTimeout(resolve, 10))
    expect(store.get("selection")).toEqual(["a", "b"])
    group.querySelector<Checkbox>("m-checkbox[value=n]")!.click()
    await new Promise(resolve => setTimeout(resolve, 10))
    expect(store.get("selection")).toEqual(["a", "b"])
    dispose()
  })
})
