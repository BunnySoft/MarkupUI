import { ViewElement } from "../../core/index.js"
import { pathParts, readPath } from "../../state/path.js"
import { validateDimensions, validateSource, type ChartSource } from "./data.js"

const responseLimit = 1_048_576

export class ChartDataset extends ViewElement {
  public static readonly tag = "m-chart-dataset"
  public static readonly observedAttributes = ["id", "source", "src", "source-path", "source-header", "dimensions", "data-bind-source"]
  private value: ChartSource | undefined
  private remote: ChartSource = []
  private request: AbortController | undefined
  private requestKey: string | undefined
  private pending: Promise<void> | undefined
  private generation = 0
  private timeout: ReturnType<typeof setTimeout> | undefined
  private failure: Error | null = null
  private busy = false
  private changing = false
  private readonly observer = new MutationObserver(() => this.refresh())

  public connectedCallback(): void {
    this.upgradeProperties()
    this.observer.observe(this, { childList: true, subtree: true, characterData: true })
    this.refresh()
  }
  public disconnectedCallback(): void {
    this.observer.disconnect()
    this.cancel()
  }
  public attributeChangedCallback(): void { if (this.isConnected && !this.changing) this.refresh() }
  public get loading(): boolean { return this.busy }
  public get error(): Error | null { return this.failure }
  public get source(): ChartSource {
    this.validateChannels()
    if (this.value !== undefined) return this.value
    if (this.hasAttribute("source")) return this.parse(this.getAttribute("source")!)
    const script = this.jsonScript()
    if (script) return this.parse(script.textContent ?? "")
    return this.src === null ? [] : this.remote
  }
  public set source(value: ChartSource | undefined) {
    if (value !== undefined) validateSource(value)
    this.validateChannels(value !== undefined)
    this.value = value
    this.failure = null
    this.notify()
  }
  public get src(): string | null { return this.getAttribute("src") }
  public set src(value: string | null) {
    if (value !== null) {
      this.url(value)
      if (this.value !== undefined || this.hasAttribute("source") || this.jsonScript() || this.hasAttribute("data-bind-source")) throw new TypeError("Conflicting chart dataset sources.")
    }
    this.setStringAttribute("src", value)
  }
  public get sourcePath(): string | null { return this.getAttribute("source-path") }
  public set sourcePath(value: string | null) {
    if (value !== null) pathParts(value)
    this.setStringAttribute("source-path", value)
  }
  public get dimensions(): string[] | null {
    const value: unknown = this.hasAttribute("dimensions") ? JSON.parse(this.getAttribute("dimensions")!) : null
    validateDimensions(value)
    return value
  }
  public set dimensions(value: string[] | null) {
    validateDimensions(value)
    this.setStringAttribute("dimensions", value === null ? null : JSON.stringify(value))
  }
  public get sourceHeader(): boolean | "auto" {
    return this.getAttribute("source-header") === null || this.getAttribute("source-header") === "auto" ? "auto" : this.booleanAttribute("source-header", false)
  }
  public set sourceHeader(value: boolean | "auto") {
    if (value === "auto") this.setAttribute("source-header", "auto")
    else this.setBooleanAttribute("source-header", value, false)
  }

  /** Revalidate explicit in-place data edits and synchronize the selected source. */
  public refresh(): void {
    try {
      this.validateChannels()
      this.dimensions
      this.sourceHeader
      if (this.sourcePath !== null) pathParts(this.sourcePath)
      if (this.src !== null) {
        const key = JSON.stringify([this.url(this.src).href, this.sourcePath])
        if (this.isConnected && key !== this.requestKey) void this.reload().catch(() => {})
      } else {
        this.cancel()
        validateSource(this.source)
        this.failure = null
      }
    } catch (error) { this.failure = error instanceof Error ? error : new Error(String(error)); this.cancel() }
    this.notify()
  }

  /** Clear declarations before explicitly selecting a different source kind. */
  public clearSource(): void {
    this.cancel()
    this.value = undefined
    this.remote = []
    this.failure = null
    this.changing = true
    try {
      for (const name of ["source", "src", "source-path", "data-bind-source"]) this.removeAttribute(name)
      for (const script of this.querySelectorAll(":scope > script")) script.remove()
    } finally { this.changing = false }
    this.notify()
  }

  /** Same-origin JSON only. Caller authentication stays in application code. */
  public reload(): Promise<void> {
    this.validateChannels()
    if (this.src === null) return Promise.reject(new TypeError("Remote src is required."))
    if (!this.isConnected) return Promise.reject(new Error("Dataset must be connected to load."))
    const url = this.url(this.src), path = this.sourcePath
    if (path !== null) pathParts(path)
    this.cancel()
    const generation = this.generation
    const controller = new AbortController()
    this.request = controller
    this.requestKey = JSON.stringify([url.href, path])
    this.busy = true
    this.failure = null
    this.notify()
    const timeout = setTimeout(() => controller.abort(new Error("Chart request timed out.")), 15_000)
    this.timeout = timeout
    const task = (async () => {
      try {
        const response = await fetch(url.href, { signal: controller.signal, credentials: "omit", redirect: "error", headers: { Accept: "application/json" } })
        if (!response.ok) throw new Error(`Chart request failed (${response.status}).`)
        if (!/^application\/(?:[\w.-]+\+)?json(?:\s*;|$)/i.test(response.headers.get("content-type") ?? "")) throw new TypeError("Chart response must have a JSON content type.")
        if (Number(response.headers.get("content-length")) > responseLimit) throw new RangeError("Chart response exceeds 1 MiB.")
        const reader = response.body?.getReader()
        if (!reader) throw new TypeError("Chart response has no readable body.")
        let bytes = 0, text = ""
        const decoder = new TextDecoder()
        try {
          while (true) {
            const chunk = await reader.read()
            if (chunk.done) break
            bytes += chunk.value.byteLength
            if (bytes > responseLimit) throw new RangeError("Chart response exceeds 1 MiB.")
            text += decoder.decode(chunk.value, { stream: true })
          }
          text += decoder.decode()
        } finally { await reader.cancel(); reader.releaseLock() }
        let value: unknown = JSON.parse(text)
        if (controller.signal.aborted) throw controller.signal.reason
        if (path !== null) value = readPath(value, path)
        validateSource(value)
        if (generation === this.generation && this.isConnected) this.remote = value
      } catch (error) {
        controller.abort()
        if (generation === this.generation && this.isConnected) {
          this.failure = error instanceof Error ? error : new Error(String(error))
          this.emit("m:chart-data-error", { error: this.failure })
        }
        throw error
      } finally {
        clearTimeout(timeout)
        if (generation === this.generation) { this.busy = false; this.request = undefined; this.pending = undefined; this.timeout = undefined; this.notify() }
      }
    })()
    this.pending = task
    return task
  }

  public async settled(): Promise<void> { await this.pending }

  private parse(text: string): ChartSource {
    const value: unknown = JSON.parse(text)
    validateSource(value)
    return value
  }
  private jsonScript(): HTMLScriptElement | null {
    const scripts = this.querySelectorAll<HTMLScriptElement>(":scope > script")
    if (scripts.length > 1 || scripts[0] && scripts[0].type !== "application/json") throw new TypeError("Dataset accepts one application/json script.")
    return scripts[0] ?? null
  }
  private validateChannels(property = this.value !== undefined): void {
    const script = this.jsonScript()
    if ([...this.children].some(child => child !== script)) throw new TypeError("Dataset accepts only its JSON script.")
    const channels = Number(property || this.hasAttribute("data-bind-source")) + Number(this.hasAttribute("source")) + Number(this.hasAttribute("src")) + Number(!!script)
    if (channels > 1) throw new TypeError("Conflicting chart dataset sources.")
    if (this.sourcePath !== null && this.src === null) throw new TypeError("source-path requires src.")
  }
  private url(value: string): URL {
    const url = new URL(value, this.ownerDocument.baseURI)
    if (!value.trim() || !["http:", "https:"].includes(url.protocol) || url.origin !== new URL(this.ownerDocument.URL).origin || url.username || url.password) {
      throw new TypeError("Chart src requires a same-origin HTTP(S) URL without credentials.")
    }
    return url
  }
  private cancel(): void {
    ++this.generation
    clearTimeout(this.timeout)
    this.timeout = undefined
    this.request?.abort()
    this.request = undefined
    this.requestKey = undefined
    this.pending = undefined
    this.busy = false
  }
  private notify(): void { if (this.isConnected) this.emit("m:chart-data-change", { loading: this.loading, error: this.error }) }
}
