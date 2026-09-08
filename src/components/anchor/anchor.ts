import { ownedWrites } from "../popover/position.js"
import { createScrollContext, fragmentId } from "./scroll.js"
import type { NativeScrollBehavior, NativeScrollRoot } from "./scroll.js"

export interface AnchorOptions {
  root?: NativeScrollRoot
  bound?: number
  offset?: number
  ignoreGap?: boolean
}
export interface AnchorIssue {
  link: HTMLAnchorElement
  href: string
  reason: "invalid-url" | "missing-target" | "duplicate-id" | "outside-root" | "nested-scroll-root" | "unsupported-target"
}
export interface AnchorLocation {
  href: string | null
  link: HTMLAnchorElement | null
  target: HTMLElement | null
}
export interface AnchorController {
  readonly connected: boolean
  readonly activeHref: string | null
  readonly activeTarget: HTMLElement | null
  readonly issues: readonly AnchorIssue[]
  update(): void
  refresh(): void
  scrollTo(href: string, options?: { behavior?: NativeScrollBehavior }): boolean
  connect(): void
  disconnect(): void
}
interface Entry { href: string; link: HTMLAnchorElement; target: HTMLElement }
const owners = new WeakMap<HTMLElement, AnchorController>()
interface LinkOwner { nav: HTMLElement; writes: ReturnType<typeof ownedWrites> }
const linkOwners = new WeakMap<HTMLAnchorElement, LinkOwner>()

export function createAnchor(nav: HTMLElement, options: AnchorOptions = {}): AnchorController {
  const document = nav?.ownerDocument
  const view = document?.defaultView
  if (!view || !(nav instanceof view.HTMLElement) || nav.localName !== "nav"
    || !nav.matches(".mui-anchor[data-anchor]")) throw new TypeError("Anchor needs an authored nav.mui-anchor[data-anchor].")
  for (const key of Object.keys(options)) if (!["root", "bound", "offset", "ignoreGap"].includes(key)) throw new TypeError(`Unsupported Anchor option: ${key}.`)
  const bound = options.bound ?? 12, offset = options.offset ?? 0
  for (const value of [bound, offset]) if (!Number.isFinite(value) || value < 0 || value > 60_000) throw new RangeError("Anchor bound/offset must be finite from 0 to 60000.")
  if (options.ignoreGap !== undefined && typeof options.ignoreGap !== "boolean") throw new TypeError("ignoreGap must be boolean.")
  const ignoreGap = options.ignoreGap ?? false
  const context = createScrollContext(document!, options.root)
  const claims = new Map<HTMLAnchorElement, LinkOwner>()
  let connected = false
  let frame = 0
  let entries: Entry[] = []
  let resolvedEntries: Entry[] = []
  let baseIssues: AnchorIssue[] = []
  let issues: AnchorIssue[] = []
  let location: AnchorLocation = { href: null, link: null, target: null }
  let documentUrl = document!.URL
  let resize: ResizeObserver | undefined
  const removers: (() => void)[] = []
  const own = (node: Element) => node.closest("[data-anchor]") === nav
  function validateNav() {
    if (nav.ownerDocument !== document || nav.getRootNode() !== document || !nav.matches(".mui-anchor[data-anchor]")
      || ![null, "navigation"].includes(nav.getAttribute("role"))) throw new TypeError("Anchor requires its original native navigation boundary.")
  }
  function visible(element: HTMLElement) {
    if (!element.isConnected || element.closest("[hidden], [inert]") || !element.getClientRects().length) return false
    const style = view!.getComputedStyle(element)
    return style.visibility !== "hidden" && style.visibility !== "collapse" && style.display !== "none"
  }
  function parseUrl(href: string): URL | null {
    let url: URL
    try { url = new view!.URL(href, document!.baseURI) } catch (error) {
      if (error instanceof TypeError || error instanceof view!.TypeError) return null
      throw error
    }
    return url
  }
  function sameDocument(url: URL) {
    const current = new view!.URL(document!.URL)
    return url.origin === current.origin && url.pathname === current.pathname && url.search === current.search && url.hash.length > 1
  }
  function rootIssue(target: HTMLElement): AnchorIssue["reason"] | null {
    if (!context.page && (target === context.element || !context.element.contains(target))) return "outside-root"
    for (let parent = target.parentElement; parent && parent !== context.element; parent = parent.parentElement) {
      const style = view!.getComputedStyle(parent)
      if (parent !== document!.body && /^(auto|scroll|hidden|clip|overlay)$/.test(style.overflowY || style.overflow)
        && parent.scrollHeight > parent.clientHeight + 1) return "nested-scroll-root"
    }
    return null
  }
  function targetFor(url: URL, checkRoot = true): { target: HTMLElement | null; reason: AnchorIssue["reason"] | null } {
    const id = fragmentId(url.hash)
    const target = document!.getElementById(id)
    if (!target) return { target: null, reason: "missing-target" }
    if (!(target instanceof view!.HTMLElement)) return { target: null, reason: "unsupported-target" }
    if ([...document!.querySelectorAll("[id]")].filter(node => node.id === id).length !== 1) return { target: null, reason: "duplicate-id" }
    const reason = checkRoot ? rootIssue(target) : null
    return { target: reason ? null : target, reason }
  }
  function release(link: HTMLAnchorElement, claim: LinkOwner) {
    if (linkOwners.get(link) === claim) { claim.writes.restore(); linkOwners.delete(link) }
    claims.delete(link)
  }
  function reconcileEntries() {
    issues = [...baseIssues]
    entries = resolvedEntries.filter(entry => {
      if (!entry.link.isConnected || !own(entry.link)) return false
      const reason = rootIssue(entry.target)
      if (reason) { issues.push({ link: entry.link, href: entry.href, reason }); return false }
      return true
    })
    for (const [link, claim] of claims) if (!entries.some(entry => entry.link === link) || linkOwners.get(link) !== claim) release(link, claim)
    for (const { link } of entries) {
      if (claims.has(link)) continue
      const previous = linkOwners.get(link)
      previous?.writes.restore()
      const claim = { nav, writes: ownedWrites() }
      claims.set(link, claim)
      linkOwners.set(link, claim)
    }
  }
  function mark(next: Entry | null) {
    for (const entry of entries) {
      const claim = claims.get(entry.link)
      if (!claim || linkOwners.get(entry.link) !== claim || !own(entry.link)) continue
      claim.writes.attr(entry.link, "aria-current", entry === next ? "location" : null)
      claim.writes.attr(entry.link, "data-anchor-active", entry === next ? "" : null)
    }
    const changed = location.link !== (next?.link ?? null) || location.target !== (next?.target ?? null) || location.href !== (next?.href ?? null)
    location = { href: next?.href ?? null, link: next?.link ?? null, target: next?.target ?? null }
    if (changed) nav.dispatchEvent(new view!.CustomEvent<AnchorLocation>("mui:anchor-change", { detail: { ...location } }))
  }
  function schedule() {
    if (connected && !frame) frame = view!.requestAnimationFrame(() => {
      frame = 0
      try { controller.update() } catch (error) { controller.disconnect(); nav.dispatchEvent(new view!.CustomEvent("mui:anchor-error", { detail: { error } })) }
    })
  }
  function listen(target: EventTarget, type: string, capture = false) {
    target.addEventListener(type, schedule, { passive: true, capture })
    removers.push(() => target.removeEventListener(type, schedule, capture))
  }
  const observer = new view.MutationObserver(records => {
    if (!connected) return
    if (!nav.isConnected || !context.connected) { controller.disconnect(); return }
    if (records.some(record => record.type === "childList" || ["id", "href", "target", "download", "data-anchor"].includes(record.attributeName ?? ""))) {
      try { controller.refresh() } catch (error) { controller.disconnect(); nav.dispatchEvent(new view!.CustomEvent("mui:anchor-error", { detail: { error } })) }
    } else schedule()
  })
  const controller: AnchorController = {
    get connected() { return connected },
    get activeHref() { return location.href },
    get activeTarget() { return location.target },
    get issues() { return [...issues] },
    update() {
      if (!connected) return
      if (!nav.isConnected || !context.connected) { controller.disconnect(); return }
      if (documentUrl !== document!.URL) { controller.refresh(); return }
      let metrics: ReturnType<typeof context.metrics>
      try { validateNav(); metrics = context.metrics() } catch (error) { controller.disconnect(); throw error }
      reconcileEntries()
      if (metrics.height <= 0 || !visible(nav) || !context.page && !visible(context.element)) { mark(null); return }
      const line = Math.min(offset, Math.max(0, metrics.height - 1))
      const threshold = Math.min(metrics.height, line + bound)
      const seen = new Set<HTMLElement>()
      const candidates = entries.filter(entry => {
        if (seen.has(entry.target) || !visible(entry.link) || !visible(entry.target)) return false
        seen.add(entry.target)
        return true
      }).map(entry => {
        const rect = entry.target.getBoundingClientRect()
        return { entry, top: (rect.top - metrics.top) / metrics.scale, height: rect.height / metrics.scale }
      })
      if (candidates.some(item => !Number.isFinite(item.top) || !Number.isFinite(item.height))) throw new RangeError("Invalid Anchor target geometry.")
      candidates.sort((a, b) => a.top - b.top || b.height - a.height
        || (a.entry.target.compareDocumentPosition(b.entry.target) & 4 ? -1 : 1))
      let active: Entry | null = null
      for (const candidate of candidates) {
        if (candidate.top <= threshold && (ignoreGap || candidate.top + candidate.height >= line)) active = candidate.entry
      }
      const last = candidates.at(-1)
      if (metrics.bottom && last && last.top < metrics.height && last.top + last.height > 0) active = last.entry
      mark(active)
    },
    refresh() {
      if (!connected) throw new Error("Connect Anchor before refreshing.")
      for (const [link, claim] of claims) release(link, claim)
      resize?.disconnect()
      entries = []
      resolvedEntries = []
      baseIssues = []
      issues = []
      documentUrl = document!.URL
      for (const link of [...nav.querySelectorAll<HTMLAnchorElement>("a[href]")].filter(own)) {
        const href = link.getAttribute("href")!
        if (link.hasAttribute("download") || link.target && link.target !== "_self") continue
        const url = parseUrl(href)
        if (!url) { baseIssues.push({ link, href, reason: "invalid-url" }); continue }
        if (!sameDocument(url)) continue
        const resolved = targetFor(url, false)
        if (resolved.target) resolvedEntries.push({ link, href, target: resolved.target })
        else baseIssues.push({ link, href, reason: resolved.reason! })
      }
      if (view!.ResizeObserver) {
        resize = new view!.ResizeObserver(schedule)
        const observed = new Set<Element>([context.element])
        for (const entry of resolvedEntries) {
          for (let node: HTMLElement | null = entry.target; node; node = node.parentElement) {
            observed.add(node)
            if (node === context.element) break
          }
        }
        for (const node of observed) resize.observe(node)
      }
      controller.update()
    },
    scrollTo(href, scrollOptions = {}) {
      if (typeof href !== "string") throw new TypeError("Anchor scrollTo needs a same-document fragment string.")
      for (const key of Object.keys(scrollOptions)) if (key !== "behavior") throw new TypeError(`Unsupported scroll option: ${key}.`)
      if (scrollOptions.behavior !== undefined && !["auto", "instant", "smooth"].includes(scrollOptions.behavior)) throw new TypeError("Invalid native scroll behavior.")
      const url = parseUrl(href)
      if (!url || !sameDocument(url)) throw new TypeError("Anchor scrollTo only accepts nonempty same-document fragments.")
      if (!connected) return false
      if (!context.connected) { controller.disconnect(); return false }
      let metrics: ReturnType<typeof context.metrics>
      try { validateNav(); metrics = context.metrics() } catch (error) { controller.disconnect(); throw error }
      const resolved = targetFor(url)
      if (resolved.reason === "missing-target") return false
      if (!resolved.target) throw new TypeError(`Anchor target is invalid: ${resolved.reason}.`)
      if (!visible(resolved.target)) return false
      const top = metrics.scrollTop + (resolved.target.getBoundingClientRect().top - metrics.top) / metrics.scale
        - Math.min(offset, Math.max(0, metrics.height - 1))
      const moved = context.scrollTo(top, scrollOptions.behavior)
      schedule()
      return moved
    },
    connect() {
      if (connected) return
      if (!nav.isConnected || nav.getRootNode() !== document || !context.connected
        || ![null, "navigation"].includes(nav.getAttribute("role"))) throw new TypeError("Anchor needs connected native navigation, not menu/tab roles.")
      const labels = nav.getAttribute("aria-labelledby")?.trim().split(/\s+/).filter(Boolean)
      if (!(labels?.length ? labels.every(id => document!.getElementById(id)?.textContent?.trim()) : nav.getAttribute("aria-label")?.trim())) throw new TypeError("Name the authored Anchor navigation.")
      if (owners.has(nav)) throw new Error("Anchor root already has an active controller.")
      owners.set(nav, controller)
      connected = true
      try {
        listen(context.target, "scroll")
        listen(view!, "resize")
        listen(view!, "hashchange")
        listen(view!, "popstate")
        listen(document!, "load", true)
        if (view!.visualViewport) { listen(view!.visualViewport, "resize"); listen(view!.visualViewport, "scroll") }
        observer.observe(document!, { subtree: true, childList: true, attributes: true,
          attributeFilter: ["id", "href", "target", "download", "data-anchor", "hidden", "inert", "class", "style", "role"] })
        controller.refresh()
      } catch (error) { controller.disconnect(); throw error }
    },
    disconnect() {
      connected = false
      view!.cancelAnimationFrame(frame)
      frame = 0
      observer.disconnect()
      resize?.disconnect()
      resize = undefined
      for (const remove of removers.splice(0)) remove()
      for (const [link, claim] of claims) release(link, claim)
      entries = []
      resolvedEntries = []
      baseIssues = []
      issues = []
      location = { href: null, link: null, target: null }
      if (owners.get(nav) === controller) owners.delete(nav)
    },
  }
  controller.connect()
  return controller
}
