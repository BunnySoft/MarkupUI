export type NativeScrollRoot = Window | Document | HTMLElement
export type NativeScrollBehavior = "auto" | "instant" | "smooth"

/** Native vertical scroll metrics shared with the upcoming Back Top consumer. */
export function createScrollContext(document: Document, requested?: NativeScrollRoot) {
  const view = document.defaultView
  if (!view) throw new TypeError("Scrolling requires a document with a window.")
  const page = requested === undefined || requested === document || requested === view
    || requested === document.scrollingElement || requested === document.documentElement
  if (!page && (!(requested instanceof view.HTMLElement) || requested.ownerDocument !== document
    || !requested.isConnected || requested === document.body)) throw new TypeError("Scroll root must be this window/document or a connected same-document element.")
  const element = page ? document.scrollingElement as HTMLElement | null ?? document.documentElement : requested as HTMLElement
  function validate() {
    if (!element.isConnected || element.ownerDocument !== document) throw new TypeError("Scroll root must remain connected in its original document.")
    if (!page && !/^(auto|scroll|hidden|overlay)$/.test(view!.getComputedStyle(element).overflowY || view!.getComputedStyle(element).overflow)) {
      throw new TypeError("Element scroll roots need native vertical overflow (auto, scroll or hidden).")
    }
  }
  validate()
  return {
    element, view, page,
    target: page ? view : element,
    get connected() { return element.isConnected && element.ownerDocument === document },
    metrics() {
      validate()
      const viewport = page ? view.visualViewport : null
      const rect = element.getBoundingClientRect()
      const scale = !page && element.offsetHeight ? rect.height / element.offsetHeight : 1
      const top = page ? viewport?.offsetTop ?? 0 : rect.top + element.clientTop * scale
      const height = page ? viewport?.height ?? document.documentElement.clientHeight : element.clientHeight
      const scrollTop = page ? view.scrollY : element.scrollTop
      const extent = element.scrollHeight
      const layoutHeight = page ? document.documentElement.clientHeight : height
      if (![scale, top, height, scrollTop, extent, layoutHeight].every(Number.isFinite) || scale <= 0) throw new RangeError("Invalid native scroll geometry.")
      return { top, height, scale, scrollTop, extent, max: Math.max(0, extent - layoutHeight),
        bottom: extent > layoutHeight + 1 && scrollTop + (page ? top : 0) + height >= extent - 1 }
    },
    scrollTo(top: number, behavior: NativeScrollBehavior = "auto") {
      if (!Number.isFinite(top) || !["auto", "instant", "smooth"].includes(behavior)) throw new TypeError("Native scrolling needs a finite position and supported behavior.")
      if (!this.connected) return false
      const metrics = this.metrics()
      if (metrics.height <= 0) return false
      const reduced = view.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false
      const options: ScrollToOptions = {
        top: Math.max(0, Math.min(top, metrics.max)),
        left: page ? view.scrollX : element.scrollLeft,
        behavior: reduced ? "instant" : behavior,
      }
      if (page && typeof view.scrollTo === "function") view.scrollTo(options)
      else if (typeof element.scrollTo === "function") element.scrollTo(options)
      else element.scrollTop = options.top!
      return true
    },
  }
}

/** URL-style UTF-8 percent decoding also preserves literal malformed percent signs. */
export function fragmentId(hash: string): string {
  const decoder = new TextDecoder()
  return hash.slice(1).replace(/(?:%[\da-f]{2})+/gi, encoded =>
    decoder.decode(Uint8Array.from(encoded.match(/%[\da-f]{2}/gi)!, byte => Number.parseInt(byte.slice(1), 16))))
}
