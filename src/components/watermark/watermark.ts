import { ownedWrites } from "../popover/position.js"

export interface WatermarkImageContext {
  readonly signal: AbortSignal
  readonly generation: number
}
export type WatermarkImageLoader = (context: WatermarkImageContext) => HTMLImageElement | Promise<HTMLImageElement>
export interface WatermarkSettings {
  content?: string
  image?: HTMLImageElement | null
  loadImage?: WatermarkImageLoader | null
  width?: number
  height?: number
  xGap?: number
  yGap?: number
  xOffset?: number
  yOffset?: number
  rotate?: number
  cross?: boolean
  debug?: boolean
  fullscreen?: boolean
  zIndex?: number
  opacity?: number
  imageWidth?: number | null
  imageHeight?: number | null
  imageOpacity?: number
  fontSize?: number
  lineHeight?: number
  fontFamily?: string
  fontStyle?: "normal" | "italic" | "oblique"
  fontVariant?: "normal" | "small-caps"
  fontWeight?: number
  fontStretch?: "normal" | "ultra-condensed" | "extra-condensed" | "condensed" | "semi-condensed" | "semi-expanded" | "expanded" | "extra-expanded" | "ultra-expanded"
  fontColor?: string
  textAlign?: "left" | "center" | "right"
  pixelRatio?: number | "auto"
}
export type WatermarkOptions = WatermarkSettings
export type WatermarkResult =
  | { readonly status: "ready"; readonly generation: number; readonly width: number; readonly height: number; readonly pixelWidth: number; readonly pixelHeight: number; readonly pixelRatio: number }
  | { readonly status: "empty"; readonly generation: number }
  | { readonly status: "error"; readonly generation: number; readonly error: unknown }
  | { readonly status: "aborted"; readonly generation: number; readonly reason: string }
export interface WatermarkState {
  readonly phase: "loading" | "ready" | "empty" | "error" | "disconnected"
  readonly generation: number
  readonly hasTile: boolean
  readonly error: unknown
  readonly rendered: Extract<WatermarkResult, { status: "ready" }> | null
}
export interface WatermarkController {
  readonly element: HTMLElement
  readonly overlay: HTMLDivElement
  readonly connected: boolean
  readonly state: WatermarkState
  readonly settings: Readonly<Required<WatermarkSettings>>
  readonly ready: Promise<WatermarkResult>
  update(settings: WatermarkSettings): Promise<WatermarkResult>
  refresh(): Promise<WatermarkResult>
  disconnect(): void
}
interface Job {
  generation: number
  settings: Required<WatermarkSettings>
  abort: AbortController
  promise: Promise<WatermarkResult>
  resolve: (result: WatermarkResult) => void
  canvas: HTMLCanvasElement | null
}
const owner = Symbol.for("markup-ui.watermark.owner")
type Owned = HTMLElement & { [owner]?: object }
const defaults: Required<WatermarkSettings> = {
  content: "", image: null, loadImage: null, width: 160, height: 80,
  xGap: 40, yGap: 40, xOffset: 0, yOffset: 0, rotate: 0, cross: false, debug: false,
  fullscreen: false, zIndex: 10, opacity: 1, imageWidth: null, imageHeight: null, imageOpacity: 1,
  fontSize: 14, lineHeight: 20, fontFamily: "sans-serif", fontStyle: "normal",
  fontVariant: "normal", fontWeight: 400, fontStretch: "normal", fontColor: "rgba(128, 128, 128, .3)",
  textAlign: "left", pixelRatio: "auto",
}

/** Generates one bounded decorative tile; content, images and transport remain caller-owned. */
export function createWatermark(element: HTMLElement, options: WatermarkOptions = {}): WatermarkController {
  const document = element?.ownerDocument, view = document?.defaultView
  if (!view || !(element instanceof view.HTMLElement) || !["div", "section", "article"].includes(element.localName)
    || !element.matches(".mui-watermark[data-watermark]") || !element.isConnected
    || element.getRootNode() !== document || (element as Owned)[owner]) throw new TypeError("Use an unowned connected native .mui-watermark[data-watermark] wrapper.")
  const win = view, doc = document!, token = {}, writes = ownedWrites()
  const layers = [...element.querySelectorAll<HTMLElement>("[data-watermark-overlay]")].filter(node => node.closest("[data-watermark]") === element)
  const candidate = layers[0]
  if (layers.length !== 1 || !(candidate instanceof win.HTMLDivElement) || candidate.parentElement !== element
    || candidate.childNodes.length || !candidate.hidden || candidate.getAttribute("aria-hidden") !== "true"
    || candidate.hasAttribute("tabindex") || candidate.hasAttribute("role") || candidate.hasAttribute("contenteditable")) {
    throw new TypeError("Author one empty direct div[data-watermark-overlay][hidden][aria-hidden=true], without role/tabindex/editing.")
  }
  const overlay = candidate
  let settings = { ...defaults }, connected = true, generation = 0
  let phase: WatermarkState["phase"] = "empty", error: unknown = null, url: string | null = null
  let rendered: WatermarkState["rendered"] = null, active: Job | null = null
  let encoding: Promise<Blob> | null = null
  let latest: Promise<WatermarkResult> = Promise.resolve({ status: "empty", generation: 0 })
  let resolution: MediaQueryList | undefined, resolutionListener: (() => void) | undefined
  let lastRatio = 1
  function ratio(value: WatermarkSettings["pixelRatio"]) {
    const native = Number.isFinite(win.devicePixelRatio) && win.devicePixelRatio > 0 ? win.devicePixelRatio : 1
    return value === "auto" ? Math.min(4, Math.max(.5, native)) : value!
  }
  function placement(next: Required<WatermarkSettings>) {
    if (!element.isConnected || overlay.parentElement !== element || overlay.childNodes.length
      || overlay.getAttribute("aria-hidden") !== "true" || overlay.hasAttribute("tabindex")
      || overlay.hasAttribute("role") || overlay.hasAttribute("contenteditable")) throw new Error("Watermark anatomy changed; disconnect and bind valid native anatomy.")
    if (!next.fullscreen) {
      if (!["relative", "absolute", "fixed", "sticky"].includes(win.getComputedStyle(element).position)) throw new TypeError("Author a positioned wrapper; Watermark never changes an existing containing block.")
    } else {
      if (element.parentElement !== doc.body) throw new TypeError("Fullscreen requires a dedicated wrapper directly under body.")
      for (let node: HTMLElement | null = element; node; node = node.parentElement) {
        const css = win.getComputedStyle(node)
        if (["transform", "filter", "perspective", "backdrop-filter"].some(name => {
          const value = css.getPropertyValue(name); return value && value !== "none"
        }) || /layout|paint|strict|content/.test(css.contain) || /transform|filter|perspective/.test(css.willChange)
          || css.contentVisibility && css.contentVisibility !== "visible") throw new TypeError("Fullscreen cannot escape transformed/filtered/contained root, body or html ancestors.")
      }
    }
  }
  function config(input: WatermarkSettings) {
    if (!input || typeof input !== "object" || Array.isArray(input) || Object.keys(input).some(key => !Object.hasOwn(defaults, key))) throw new TypeError("Unsupported Watermark settings.")
    const next = { ...settings, ...input }
    const bound = (value: unknown, min: number, max: number, name: string) => {
      if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) throw new RangeError(`${name} must be finite in ${min}..${max}.`)
    }
    for (const key of ["width", "height"] as const) bound(next[key], 1, 1024, key)
    for (const key of ["xGap", "yGap"] as const) bound(next[key], 0, 1024, key)
    for (const key of ["xOffset", "yOffset"] as const) bound(next[key], -100000, 100000, key)
    for (const key of ["opacity", "imageOpacity"] as const) bound(next[key], 0, 1, key)
    for (const key of ["imageWidth", "imageHeight"] as const) if (next[key] !== null) bound(next[key], .5, 2048, key)
    bound(next.rotate, -360, 360, "rotate"); bound(next.fontSize, 1, 256, "fontSize"); bound(next.lineHeight, 1, 512, "lineHeight")
    bound(next.zIndex, -2147483647, 2147483647, "zIndex"); bound(next.fontWeight, 100, 900, "fontWeight")
    if (!Number.isInteger(next.zIndex) || next.fontWeight % 100) throw new RangeError("zIndex is an integer; fontWeight uses 100-step weights.")
    if (next.pixelRatio !== "auto") bound(next.pixelRatio, .5, 4, "pixelRatio")
    for (const key of ["cross", "debug", "fullscreen"] as const) if (typeof next[key] !== "boolean") throw new TypeError(`${key} must be boolean.`)
    if (typeof next.content !== "string" || next.content.length > 2048 || /[\u0000-\u0009\u000b-\u001f\u007f]/.test(next.content)
      || next.content.split("\n").length > 16) throw new TypeError("content is literal text: at most 2048 UTF-16 units/16 LF-separated lines, without control characters.")
    if (typeof next.fontFamily !== "string" || !/^[a-zA-Z][a-zA-Z0-9 -]{0,63}$/.test(next.fontFamily)
      || !["normal", "italic", "oblique"].includes(next.fontStyle) || !["normal", "small-caps"].includes(next.fontVariant)
      || !["normal", "ultra-condensed", "extra-condensed", "condensed", "semi-condensed", "semi-expanded", "expanded", "extra-expanded", "ultra-expanded"].includes(next.fontStretch)
      || !["left", "center", "right"].includes(next.textAlign)) throw new TypeError("Use one simple font family and supported native font/alignment keywords.")
    if (typeof next.fontColor !== "string" || next.fontColor.length > 128 || !validColor(next.fontColor)) throw new TypeError("fontColor supports bounded hex, rgb/rgba comma syntax and basic named colors; no variables/currentColor.")
    if (next.image !== null && !(next.image instanceof win.HTMLImageElement)) throw new TypeError("image is a caller-owned native image, not a URL string.")
    if (next.loadImage !== null && typeof next.loadImage !== "function" || next.image && next.loadImage) throw new TypeError("Use either image or loadImage, not both.")
    placement(next)
    return next
  }
  function validColor(color: string) {
    if (/^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i.test(color)
      || /^(black|white|gray|grey|silver|red|maroon|yellow|olive|lime|green|aqua|teal|blue|navy|fuchsia|purple|transparent)$/i.test(color)) return true
    const rgb = /^(rgb|rgba)\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)(?:\s*,\s*(\d*\.?\d+))?\s*\)$/i.exec(color)
    return !!rgb && rgb.slice(2, 5).every(value => Number(value) <= 255)
      && (rgb[1]!.toLowerCase() === "rgb" ? rgb[5] === undefined : rgb[5] !== undefined && Number(rgb[5]) <= 1)
  }
  function state(): WatermarkState { return Object.freeze({ phase, generation, hasTile: url !== null, error, rendered }) }
  function emit() { element.dispatchEvent(new win.CustomEvent("mui:watermark-state", { bubbles: true, detail: state() })) }
  function current(job: Job) { return connected && active === job && generation === job.generation && !job.abort.signal.aborted && element.isConnected && overlay.parentElement === element }
  function release(job: Job) { if (job.canvas) { job.canvas.width = job.canvas.height = 0; job.canvas = null } }
  function abort(job: Job, why: string) {
    job.resolve(Object.freeze({ status: "aborted", generation: job.generation, reason: why }))
    job.abort.abort(why); release(job)
  }
  function wait<T>(promise: PromiseLike<T>, signal: AbortSignal): Promise<T> {
    return new Promise((resolve, reject) => {
      const cancel = () => { cleanup(); reject(new win.DOMException("Watermark generation aborted.", "AbortError")) }
      const cleanup = () => signal.removeEventListener("abort", cancel)
      if (signal.aborted) { cancel(); return }
      signal.addEventListener("abort", cancel, { once: true })
      Promise.resolve(promise).then(value => { cleanup(); resolve(value) }, reason => { cleanup(); reject(reason) })
    })
  }
  function paint(ctx: CanvasRenderingContext2D, next: Required<WatermarkSettings>, image: HTMLImageElement | null) {
    let w: number, h: number, draw: () => void
    if (image) {
      const nw = image.naturalWidth, nh = image.naturalHeight
      if (!Number.isFinite(nw) || !Number.isFinite(nh) || nw <= 0 || nh <= 0 || nw > 8192 || nh > 8192 || nw * nh > 16777216) throw new RangeError("Image intrinsic dimensions exceed the supported bound or decoding failed.")
      const fit = Math.min(1, next.width / nw, next.height / nh)
      w = next.imageWidth ?? (next.imageHeight !== null ? nw * next.imageHeight / nh : nw * fit)
      h = next.imageHeight ?? (next.imageWidth !== null ? nh * next.imageWidth / nw : nh * fit)
      draw = () => { ctx.globalAlpha = next.imageOpacity; ctx.drawImage(image, -w / 2, -h / 2, w, h) }
    } else {
      const font = `${next.fontStyle} ${next.fontVariant} ${next.fontWeight} ${next.fontSize}px ${next.fontFamily}`
      ctx.font = "1px serif"; ctx.font = font; const firstFont = ctx.font
      ctx.font = "2px monospace"; ctx.font = font
      if (ctx.font !== firstFont) throw new TypeError("This Canvas did not accept the requested native font.")
      if (next.fontStretch !== "normal" && !("fontStretch" in ctx)) throw new Error("Native Canvas fontStretch is unavailable.")
      ctx.fontStretch = next.fontStretch
      if (ctx.fontStretch !== next.fontStretch) throw new Error("Native Canvas rejected fontStretch.")
      ctx.fillStyle = "#010203"; ctx.fillStyle = next.fontColor; const first = ctx.fillStyle
      ctx.fillStyle = "#040506"; ctx.fillStyle = next.fontColor
      if (ctx.fillStyle !== first) throw new TypeError("This Canvas did not accept fontColor.")
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic"
      const lines = next.content.split("\n").map(text => ({ text, metrics: ctx.measureText(text) }))
      const max = Math.max(...lines.map(line => line.metrics.width)), factor = next.textAlign === "left" ? 0 : next.textAlign === "center" ? .5 : 1
      const boxes = lines.map(({ text, metrics: m }, i) => {
        const x = (max - m.width) * factor, y = i * next.lineHeight
        const left = Number.isFinite(m.actualBoundingBoxLeft) ? m.actualBoundingBoxLeft : 0
        const right = Number.isFinite(m.actualBoundingBoxRight) ? m.actualBoundingBoxRight : m.width
        const ascent = Number.isFinite(m.actualBoundingBoxAscent) ? m.actualBoundingBoxAscent : next.fontSize
        const descent = Number.isFinite(m.actualBoundingBoxDescent) ? m.actualBoundingBoxDescent : next.fontSize * .3
        return { text, x, y, left: x - left, right: x + right, top: y - ascent, bottom: y + descent }
      })
      const left = Math.min(...boxes.map(b => b.left)), right = Math.max(...boxes.map(b => b.right))
      const top = Math.min(...boxes.map(b => b.top)), bottom = Math.max(...boxes.map(b => b.bottom))
      w = right - left; h = bottom - top
      if (![w, h].every(Number.isFinite) || w <= 0 || h <= 0) throw new Error("Native text metrics produced no drawable text.")
      draw = () => { for (const line of boxes) ctx.fillText(line.text, line.x - (left + right) / 2, line.y - (top + bottom) / 2) }
    }
    const angle = next.rotate * Math.PI / 180, c = Math.abs(Math.cos(angle)), s = Math.abs(Math.sin(angle))
    if (![w, h].every(Number.isFinite) || c * w + s * h > next.width + .01 || s * w + c * h > next.height + .01) throw new RangeError("Rotated text/image exceeds the mark width/height; enlarge the mark or reduce the content.")
    const pw = next.width + next.xGap, ph = next.height + next.yGap
    const centers = [[next.width / 2, next.height / 2]]
    if (next.cross) centers.push([next.width / 2 + pw / 2, next.height / 2 + ph / 2])
    for (const [x, y] of centers) for (const dx of [-pw, 0, pw]) for (const dy of [-ph, 0, ph]) {
      ctx.save(); ctx.translate(x! + dx, y! + dy); ctx.rotate(angle); draw(); ctx.restore()
    }
    if (next.debug) { ctx.strokeStyle = "#b42318"; ctx.lineWidth = 1; ctx.strokeRect(.5, .5, pw - 1, ph - 1); ctx.strokeRect(.5, .5, next.width - 1, next.height - 1) }
  }
  async function run(job: Job) {
    try {
      if (!current(job)) return
      const next = job.settings
      if (!next.image && !next.loadImage && !next.content.trim()) { commit(job, null, null); return }
      const pr = ratio(next.pixelRatio), width = next.width + next.xGap, height = next.height + next.yGap
      const pixelWidth = Math.ceil(width * pr), pixelHeight = Math.ceil(height * pr)
      if (pixelWidth > 4096 || pixelHeight > 4096 || pixelWidth * pixelHeight > 4194304) throw new RangeError("Tile bitmap exceeds 4096 per axis or 4,194,304 pixels; reduce dimensions/gaps/pixelRatio.")
      if (typeof win.URL.createObjectURL !== "function" || typeof win.URL.revokeObjectURL !== "function") throw new Error("Native Blob URLs are unavailable; omit the decoration.")
      let image = next.image
      if (next.loadImage) {
        image = await wait(Promise.resolve().then(() => {
          if (!current(job)) throw new win.DOMException("Watermark generation aborted.", "AbortError")
          return next.loadImage!(Object.freeze({ signal: job.abort.signal, generation: job.generation }))
        }), job.abort.signal)
        if (!(image instanceof win.HTMLImageElement)) throw new TypeError("loadImage must return a caller-owned native HTMLImageElement.")
      }
      if (!current(job)) return
      let imageSource = ""
      if (image !== null) {
        if (!(image instanceof win.HTMLImageElement)) throw new TypeError("loadImage must return a caller-owned native HTMLImageElement.")
        imageSource = image.currentSrc || image.src
        if (!image.complete || !image.naturalWidth) {
          if (typeof image.decode !== "function") throw new Error("Supply a decoded image; native image.decode is unavailable.")
          await wait(image.decode(), job.abort.signal)
        }
        if (!current(job)) return
        if (imageSource !== (image.currentSrc || image.src)) throw new Error("The caller changed image source while decoding; retry explicitly.")
      } else if (doc.fonts?.ready) await wait(doc.fonts.ready, job.abort.signal)
      // Native PNG encoding cannot be cancelled. Serialize it so rapid updates cannot
      // queue an unbounded number of platform-owned pixel buffers.
      if (encoding) await wait(encoding.catch(() => undefined), job.abort.signal)
      if (!current(job)) return
      placement(next)
      const canvas = doc.createElement("canvas"); job.canvas = canvas
      canvas.width = pixelWidth; canvas.height = pixelHeight
      const context = canvas.getContext("2d")
      if (!context) throw new Error("Native Canvas 2D is unavailable; omit the decoration.")
      context.scale(pixelWidth / width, pixelHeight / height)
      paint(context, next, image)
      const encoded = new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(value => value ? resolve(value) : reject(new Error("Canvas PNG encoding returned no image.")), "image/png")
      })
      encoding = encoded
      void encoded.then(() => { if (encoding === encoded) encoding = null }, () => { if (encoding === encoded) encoding = null })
      const blob = await wait(encoded, job.abort.signal)
      if (!current(job)) return
      if (image && imageSource !== (image.currentSrc || image.src)) throw new Error("The caller changed image source during rendering; retry explicitly.")
      placement(next)
      if (blob.type !== "image/png" || !blob.size || blob.size > 16777216) throw new Error("Canvas returned an invalid or oversized PNG.")
      const result = Object.freeze({ status: "ready" as const, generation: job.generation, width, height, pixelWidth, pixelHeight, pixelRatio: pr })
      commit(job, blob, result)
    } catch (failure) {
      if (current(job)) {
        active = null; phase = "error"; error = failure
        job.resolve(Object.freeze({ status: "error", generation: job.generation, error: failure })); emit()
      } else if (active === job) disconnect()
    } finally { release(job) }
  }
  function commit(job: Job, blob: Blob | null, result: WatermarkState["rendered"]) {
    if (!current(job)) return
    const nextUrl = blob ? win.URL.createObjectURL(blob) : null
    if (nextUrl !== null && !/^blob:[a-zA-Z0-9:/._%-]+$/.test(nextUrl)) {
      win.URL.revokeObjectURL(nextUrl); throw new Error("Native object URL contained unsupported URL characters.")
    }
    const next = job.settings, previous = url
    writes.style(overlay, "--mui-watermark-image", nextUrl ? `url("${nextUrl}")` : "none")
    writes.style(overlay, "--mui-watermark-width", `${next.width + next.xGap}px`)
    writes.style(overlay, "--mui-watermark-height", `${next.height + next.yGap}px`)
    writes.style(overlay, "--mui-watermark-x", `${next.xOffset}px`); writes.style(overlay, "--mui-watermark-y", `${next.yOffset}px`)
    writes.style(overlay, "--mui-watermark-opacity", String(next.opacity)); writes.style(overlay, "--mui-watermark-z-index", String(next.zIndex))
    writes.attr(overlay, "data-watermark-fullscreen", next.fullscreen ? "" : null)
    writes.attr(overlay, "hidden", nextUrl ? null : "")
    url = nextUrl; rendered = result; active = null; phase = result ? "ready" : "empty"; error = null
    if (previous) win.URL.revokeObjectURL(previous)
    job.resolve(result ?? Object.freeze({ status: "empty", generation: job.generation })); emit()
  }
  function start(next: Required<WatermarkSettings>) {
    const previous = active
    let resolve!: Job["resolve"]
    const promise = new Promise<WatermarkResult>(finish => { resolve = finish })
    const job: Job = { settings: next, generation: ++generation, abort: new win.AbortController(), promise, resolve, canvas: null }
    settings = next; lastRatio = ratio(next.pixelRatio); active = job; latest = promise; phase = "loading"; error = null
    if (previous) abort(previous, "superseded")
    if (current(job)) { emit(); void Promise.resolve().then(() => run(job)) }
    return promise
  }
  function live() { if (!connected) throw new Error("Watermark is disconnected."); if (!element.isConnected) { disconnect(); throw new Error("Watermark was removed.") } }
  function update(input: WatermarkSettings) { live(); return start(config(input)) }
  function refresh() { return update({}) }
  function watchRatio() {
    if (resolution && resolutionListener) resolution.removeEventListener("change", resolutionListener)
    if (!connected || typeof win.matchMedia !== "function") return
    resolution = win.matchMedia(`(resolution: ${win.devicePixelRatio || 1}dppx)`)
    resolutionListener = () => { resized(); watchRatio() }
    resolution.addEventListener("change", resolutionListener)
  }
  function resized() {
    if (!connected || settings.pixelRatio !== "auto" || ratio("auto") === lastRatio) return
    void start(settings)
  }
  const removal = new win.MutationObserver(() => { if (!element.isConnected || overlay.parentElement !== element) disconnect() })
  function disconnect() {
    if (!connected) return
    connected = false; ++generation
    const previous = active; active = null
    if (previous) abort(previous, "disconnected")
    removal.disconnect(); win.removeEventListener("resize", resized)
    if (resolution && resolutionListener) resolution.removeEventListener("change", resolutionListener)
    writes.restore()
    if (url) win.URL.revokeObjectURL(url)
    url = null; rendered = null; phase = "disconnected"
    if ((element as Owned)[owner] === token) delete (element as Owned)[owner]
    emit()
  }
  settings = config(options)
  ;(element as Owned)[owner] = token
  removal.observe(doc.documentElement, { childList: true, subtree: true })
  win.addEventListener("resize", resized); watchRatio()
  start(settings)
  return {
    element, overlay, get connected() { return connected }, get state() { return state() },
    get settings() { return Object.freeze({ ...settings }) }, get ready() { return latest },
    update, refresh, disconnect,
  }
}
