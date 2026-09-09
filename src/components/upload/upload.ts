import { ownedWrites } from "../popover/position.js"

export type UploadStatus = "pending" | "queued" | "uploading" | "cancelling" | "cancelled" | "finished" | "error" | "removed"
export interface UploadResponse { readonly status: "finished"; readonly response?: unknown }
export interface UploadContext {
  readonly id: string
  readonly attempt: number
  readonly generation: number
  readonly signal: AbortSignal
  reportProgress(loaded: number, total?: number | null): boolean
}
export type UploadTransport = (file: File, context: UploadContext) => UploadResponse | Promise<UploadResponse>
export interface UploadOptions {
  transport?: UploadTransport
  selection?: "replace" | "append"
  maxFiles?: number
  maxFileBytes?: number
  concurrency?: number
  autoUpload?: boolean
  drop?: boolean
  onChange?: (change: UploadChange) => void
}
export interface UploadFile {
  readonly id: string
  readonly batchId: string
  readonly file: File
  readonly name: string
  readonly type: string
  readonly fullPath: string
  readonly size: number
  readonly status: UploadStatus
  readonly attempt: number
  readonly loaded: number
  readonly total: number | null
  readonly percentage: number | null
  readonly error: unknown
  readonly result: UploadResponse | null
}
export interface UploadRejection { readonly file: File; readonly reason: string }
export interface UploadSelection {
  readonly accepted: boolean
  readonly added: readonly UploadFile[]
  readonly rejected: readonly UploadRejection[]
  readonly rejectedCount: number
  readonly reason: string | null
}
export interface UploadState {
  readonly connected: boolean
  readonly disabled: boolean
  readonly synchronized: boolean
  readonly total: number
  readonly active: number
  readonly cancelling: number
  readonly queued: number
  readonly resetPending: boolean
  readonly lastError: unknown
}
export interface UploadChange {
  readonly reason: string
  readonly file: UploadFile | null
  readonly files: readonly UploadFile[]
  readonly state: UploadState
  readonly selection: UploadSelection | null
}
export interface UploadController {
  readonly element: HTMLElement
  readonly input: HTMLInputElement
  readonly list: HTMLElement
  readonly connected: boolean
  readonly files: readonly UploadFile[]
  readonly state: UploadState
  add(files: readonly File[] | FileList, mode?: "append" | "replace"): UploadSelection
  start(id?: string): void
  retry(id: string): void
  cancel(id?: string): void
  remove(id: string): void
  clear(): void
  refresh(): UploadSelection | null
  whenIdle(): Promise<void>
  disconnect(): void
}
interface Row {
  node: HTMLLIElement
  name: HTMLElement
  size: HTMLElement
  status: HTMLElement
  progress: HTMLProgressElement
  buttons: Map<string, HTMLButtonElement>
}
interface Entry {
  id: string
  batchId: string
  file: File
  status: UploadStatus
  attempt: number
  loaded: number
  total: number | null
  error: unknown
  result: UploadResponse | null
  job: Job | null
  row: Row
}
interface Job {
  entry: Entry
  abort: AbortController
  generation: number
  attempt: number
  invoked: boolean
  failure: unknown
}
const owner = Symbol.for("markup-ui.upload.owner")
type Owned = HTMLElement & { [owner]?: object }
const actions = ["start", "cancel", "retry", "remove"] as const
const labels: Record<UploadStatus, string> = {
  pending: "Ready to start", queued: "Queued", uploading: "Sending; server completion pending",
  cancelling: "Cancelling; transport still pending", cancelled: "Cancelled", finished: "Finished",
  error: "Failed; retry available", removed: "Removed",
}

/** Owns a bounded queue and real FileList membership, never a backend or transport policy. */
export function createUpload(element: HTMLElement, options: UploadOptions = {}): UploadController {
  const document = element?.ownerDocument, view = document?.defaultView
  if (!view || !(element instanceof view.HTMLElement) || !["div", "section"].includes(element.localName)
    || !element.matches(".mui-upload[data-upload]") || !element.isConnected || element.getRootNode() !== document
    || (element as Owned)[owner] || element.closest("mui-upload") || element.getAttribute("tabindex") !== "-1") {
    throw new TypeError("Use an unowned connected native .mui-upload[data-upload][tabindex='-1'] scope.")
  }
  const win = view, doc = document!, token = {}, writes = ownedWrites()
  function named(node: HTMLElement) {
    return !!(node.getAttribute("aria-label")?.trim() || node.getAttribute("aria-labelledby")?.trim().split(/\s+/).every(id => doc.getElementById(id)?.textContent?.trim()))
  }
  const own = (node: Element) => node.closest("[data-upload]") === element
  function one(selector: string) {
    const nodes = [...element.querySelectorAll<HTMLElement>(selector)].filter(own)
    if (nodes.length !== 1) throw new TypeError(`Author exactly one ${selector}.`)
    return nodes[0]!
  }
  const nativeInput = one("input[data-upload-input]"), list = one("[data-upload-list]"),
    templateNode = one("template[data-upload-row]"), readout = one("[data-upload-status]"),
    controls = one("[data-upload-actions]")
  if (!(nativeInput instanceof win.HTMLInputElement) || nativeInput.type !== "file" || (nativeInput as Owned)[owner]
    || !([...nativeInput.labels ?? []].some(label => label.textContent?.trim()) || named(nativeInput)) || nativeInput.hidden || !named(element)
    || !["ul", "ol"].includes(list.localName) || list.children.length || !list.hidden
    || !(templateNode instanceof win.HTMLTemplateElement) || !controls.hidden
    || !["p", "div", "span"].includes(readout.localName) || readout.childElementCount
    || list.contains(nativeInput) || controls.contains(nativeInput)) throw new TypeError("Author a labelled file input, empty hidden native list, row template, hidden actions and plain-text readout.")
  const input = nativeInput, template = templateNode
  const dropNodes = [...element.querySelectorAll<HTMLElement>("[data-upload-drop]")].filter(own)
  if (dropNodes.length > 1 || dropNodes.some(node => !node.hidden || node.hasAttribute("role") && node.getAttribute("role") === "button")) throw new TypeError("The optional drop region starts hidden and is not a fake button.")
  const drop = dropNodes[0]
  const topButtons = [...controls.querySelectorAll<HTMLButtonElement>("button")]
  const authoredDisabled = new WeakMap<HTMLButtonElement, boolean>(topButtons.map(button => [button, button.disabled]))
  if (topButtons.some(button => !validButton(button) || !["start", "cancel", "clear"].includes(button.dataset.uploadAction ?? ""))
    || new Set(topButtons.map(button => button.dataset.uploadAction)).size !== topButtons.length) throw new TypeError("Use distinct labelled type=button top actions: start, cancel, clear.")
  function validButton(button: HTMLElement): button is HTMLButtonElement {
    return button instanceof win.HTMLButtonElement && button.getAttribute("type") === "button"
      && !button.hasAttribute("role") && !button.hasAttribute("popovertarget") && !button.hasAttribute("commandfor")
      && !button.closest("label,summary") && !button.querySelector("button,a,input,select,textarea,[tabindex],[contenteditable]")
      && !!(button.textContent?.trim() || named(button))
  }
  function rowTemplate(): HTMLLIElement {
    const node = template.content.firstElementChild
    if (template.content.children.length !== 1 || !(node instanceof win.HTMLLIElement)
      || node.querySelector("[id],[name],script,style,iframe,object,embed,a,input,textarea,select,form,[contenteditable],[tabindex]")
      || node.hasAttribute("id") || node.hasAttribute("name")) throw new TypeError("Use one native li row template without IDs, form fields, scripts or navigable previews.")
    for (const part of ["name", "size", "status"]) {
      const fields = node.querySelectorAll<HTMLElement>(`[data-upload-${part}]`)
      if (fields.length !== 1 || !["span", "p", "div"].includes(fields[0]!.localName) || fields[0]!.childElementCount) throw new TypeError("Row name/size/status are distinct plain-text fields.")
    }
    const progress = node.querySelectorAll("[data-upload-progress]")
    if (progress.length !== 1 || !(progress[0] instanceof win.HTMLProgressElement)) throw new TypeError("Author one native progress element.")
    const buttons = [...node.querySelectorAll("button")]
    if (buttons.length !== 4 || buttons.some(button => !validButton(button))
      || actions.some(action => buttons.filter(button => button.dataset.uploadAction === action).length !== 1)) throw new TypeError("Each row needs real start/cancel/retry/remove buttons.")
    return node
  }
  rowTemplate()
  if (!options || typeof options !== "object" || Array.isArray(options)
    || Object.keys(options).some(key => !["transport", "selection", "maxFiles", "maxFileBytes", "concurrency", "autoUpload", "drop", "onChange"].includes(key))) throw new TypeError("Unsupported Upload options.")
  const settings = { selection: "replace", maxFiles: 20, maxFileBytes: 25 * 1024 * 1024, concurrency: 2, autoUpload: false, drop: true, ...options }
  if (!["replace", "append"].includes(settings.selection) || !Number.isInteger(settings.maxFiles) || settings.maxFiles < 1 || settings.maxFiles > 100
    || !Number.isSafeInteger(settings.maxFileBytes) || settings.maxFileBytes < 0 || settings.maxFileBytes > Number.MAX_SAFE_INTEGER
    || !Number.isInteger(settings.concurrency) || settings.concurrency < 1 || settings.concurrency > 4
    || typeof settings.autoUpload !== "boolean" || typeof settings.drop !== "boolean"
    || settings.transport !== undefined && typeof settings.transport !== "function"
    || settings.onChange !== undefined && typeof settings.onChange !== "function"
    || settings.autoUpload && !settings.transport) throw new TypeError("Use bounded file/count/concurrency settings and explicit function transport/callbacks.")
  // Probe a detached input only: unsupported synchronization leaves the original chooser untouched.
  try {
    const probe = doc.createElement("input"); probe.type = "file"
    const transfer = new win.DataTransfer(), file = new win.File([], "markup-ui-probe")
    transfer.items.add(file); probe.files = transfer.files
    if (probe.files.length !== 1 || probe.files[0] !== file) throw new Error()
  } catch { throw new Error("Native DataTransfer/FileList assignment is required. Leave enhancement controls hidden and use the original file input.") }
  const prefix = win.crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)
  let sequence = 0, batch = 0, generation = 0, version = 0, connected = true, resetting = false
  let resetTimer = 0, resetEvent: Event | null = null
  const resetCompletions: (() => void)[] = []
  let mutating = false, notifying = false, invoking = false, pumping = false, lastError: unknown = null
  let entries: Entry[] = []
  const flights = new Set<Job>(), idle = new Set<() => void>(), listeners: (() => void)[] = []
  const originalText = readout.textContent
  let lastText = originalText, notice = "", lastBlocked = false
  function synchronized() { return input.files?.length === entries.length && entries.every((entry, i) => input.files![i] === entry.file) }
  function blocked() {
    if (input.matches(":disabled") || !element.isConnected) return true
    for (let node: HTMLElement | null = input; node; node = node.parentElement) {
      const css = win.getComputedStyle(node)
      if (node.hidden || node.hasAttribute("inert") || css.display === "none" || css.visibility === "hidden"
        || node.localName === "dialog" && !(node as HTMLDialogElement).open
        || node.localName === "details" && !(node as HTMLDetailsElement).open && !node.firstElementChild?.contains(input)) return true
    }
    return false
  }
  function snapshot(entry: Entry): UploadFile {
    return Object.freeze({ id: entry.id, batchId: entry.batchId, file: entry.file, name: entry.file.name,
      type: entry.file.type, fullPath: entry.file.webkitRelativePath || "", size: entry.file.size, status: entry.status,
      attempt: entry.attempt, loaded: entry.loaded, total: entry.total,
      percentage: entry.total && entry.total > 0 ? entry.loaded / entry.total * 100 : null, error: entry.error, result: entry.result })
  }
  function files() { return Object.freeze(entries.map(snapshot)) }
  function state(): UploadState {
    return Object.freeze({ connected, disabled: blocked(), synchronized: synchronized(), total: entries.length, active: flights.size,
      cancelling: [...flights].filter(job => job.abort.signal.aborted).length, queued: entries.filter(entry => entry.status === "queued").length,
      resetPending: resetting, lastError })
  }
  function enable(button: HTMLButtonElement, enabled: boolean, owned = true) {
    const disabled = !enabled || authoredDisabled.get(button) === true, attribute = (name: string, value: string | null) => {
      if (owned) writes.attr(button, name, value)
      else if (value === null) button.removeAttribute(name)
      else button.setAttribute(name, value)
    }
    attribute("disabled", disabled && doc.activeElement !== button ? "" : null)
    attribute("aria-disabled", disabled ? "true" : null)
  }
  function render(progressOnly = false) {
    if (!connected) return
    const available = !blocked() && !resetting && synchronized()
    for (const entry of entries) {
      const row = entry.row
      row.node.dataset.uploadState = entry.status
      row.status.textContent = labels[entry.status]
      row.progress.hidden = !["uploading", "cancelling"].includes(entry.status)
      row.progress.max = 100
      if (entry.total && entry.total > 0) row.progress.value = entry.loaded / entry.total * 100
      else row.progress.removeAttribute("value")
      enable(row.buttons.get("start")!, available && !!settings.transport && entry.status === "pending", false)
      enable(row.buttons.get("retry")!, available && !!settings.transport && ["error", "cancelled"].includes(entry.status) && !entry.job, false)
      enable(row.buttons.get("cancel")!, available && ["queued", "uploading"].includes(entry.status), false)
      enable(row.buttons.get("remove")!, available, false)
    }
    for (const button of topButtons) {
      const action = button.dataset.uploadAction
      enable(button, available && (action === "start" ? !!settings.transport && entries.some(e => e.status === "pending")
        : action === "cancel" ? entries.some(e => ["queued", "uploading"].includes(e.status)) : entries.length > 0))
    }
    if (!progressOnly) {
      const current = state()
      lastText = `${entries.length} file(s) selected; ${current.active} active, ${current.cancelling} cancelling, ${current.queued} queued.${settings.transport ? "" : " No transport configured."}${notice ? ` ${notice}` : ""}`
      if (readout.textContent !== lastText) readout.textContent = lastText
    }
  }
  function report(error: unknown, phase: string, entry: Entry | null = null) {
    lastError = error
    if (!connected || !element.isConnected) return
    if (phase === "callback") notice = "Notification callback failed; queue/request state was not rolled back."
    else if (phase === "progress") notice = "Invalid progress; cancellation requested."
    else if (phase === "transport") notice = "Transport failed; review the file status."
    render()
    const previous = notifying; notifying = true
    try { element.dispatchEvent(new win.CustomEvent("mui:upload-error", { bubbles: true, detail: Object.freeze({ error, phase, file: entry ? snapshot(entry) : null }) })) }
    finally { notifying = previous }
  }
  function emit(reason: string, entry: Entry | null = null, selection: UploadSelection | null = null) {
    if (!connected || !element.isConnected) return
    if (reason === "finished") notice = "Upload finished."
    else if (reason === "cancelled") notice = "Cancelled; server effects are not undone."
    else if (reason === "remove") notice = "File removed from native selection."
    else if (reason === "reset") notice = "Native file selection reset."
    ++version; render()
    const detail: UploadChange = Object.freeze({ reason, file: entry ? snapshot(entry) : null, files: files(), state: state(), selection })
    const stamp = version, previous = notifying; notifying = true
    try {
      element.dispatchEvent(new win.CustomEvent("mui:upload-change", { bubbles: true, detail }))
      if (connected && element.isConnected && version === stamp) {
        try {
          const result: unknown = settings.onChange?.(detail)
          if (result && typeof (result as PromiseLike<unknown>).then === "function") {
            void Promise.resolve(result).catch(() => {})
            throw new TypeError("onChange is a synchronous notification, not an async veto.")
          }
        } catch (error) { report(error, "callback", entry) }
      }
    } finally { notifying = previous }
  }
  function live(edit = false) {
    if (!connected) throw new Error("Upload is disconnected.")
    if (mutating || notifying || invoking || resetting) throw new Error("Do not reenter Upload mutations during callbacks/reset; defer the operation. disconnect is allowed.")
    if (!element.isConnected || element.getRootNode() !== doc || !element.contains(input) || input.type !== "file") { disconnect(); throw new Error("Upload anatomy was removed or changed.") }
    if (edit && blocked()) throw new Error("The native Upload scope is disabled.")
  }
  function aligned() { if (!synchronized()) throw new Error("Call refresh() after external FileList/value changes; old files will not be restored.") }
  function find(id: string) {
    const entry = entries.find(item => item.id === id)
    if (!entry) throw new RangeError("Unknown or removed Upload file ID.")
    return entry
  }
  function handoff() {
    if (!connected && !flights.size) for (const node of [element, input]) if ((node as Owned)[owner] === token) delete (node as Owned)[owner]
    if (!flights.size && !entries.some(entry => entry.status === "queued")) { idle.forEach(resolve => resolve()); idle.clear() }
  }
  function focusBefore(rows: readonly Entry[]) {
    if (!rows.some(entry => entry.row.node.contains(doc.activeElement)) || !element.isConnected || element.closest("[hidden],[inert]")) return
    if (!input.matches(":disabled") && !input.hidden) input.focus({ preventScroll: true })
    if (rows.some(entry => entry.row.node.contains(doc.activeElement))) element.focus({ preventScroll: true })
  }
  function cancelEntry(entry: Entry) {
    if (entry.job) {
      if (entry.status !== "removed") entry.status = "cancelling"
      entry.job.abort.abort("cancelled")
    } else if (entry.status === "queued") entry.status = "cancelled"
  }
  function detach(removed: readonly Entry[]) {
    focusBefore(removed)
    for (const entry of removed) { entry.status = "removed"; entry.row.node.remove(); cancelEntry(entry) }
  }
  function writeFiles(next: readonly File[]) {
    try {
      if (!next.length) input.value = ""
      else {
        const transfer = new win.DataTransfer()
        next.forEach(file => transfer.items.add(file))
        input.files = transfer.files
      }
      if (input.files?.length !== next.length || next.some((file, i) => input.files![i] !== file)) throw new Error("FileList assignment did not preserve real File membership.")
    } catch (error) {
      // Fail closed rather than leave removed/rejected queue entries in native FormData.
      input.value = ""; lastError = error; disconnect()
      element.dispatchEvent(new win.CustomEvent("mui:upload-error", { bubbles: true, detail: Object.freeze({ error, phase: "synchronization", cleared: true }) }))
      throw error
    }
  }
  function inspect(source: readonly File[] | FileList, base: number) {
    if (!Array.isArray(source) && !(source instanceof win.FileList)) throw new TypeError("Use a real File array or native FileList, not URL metadata or an iterable crawler.")
    const sample = Array.from({ length: Math.min(source.length, 100) }, (_, i) => source[i]!)
    if (sample.some(file => !(file instanceof win.File))) throw new TypeError("Every selection entry must be a real File from this realm.")
    let reason: string | null = source.length + base > settings.maxFiles ? `Selection exceeds the ${settings.maxFiles}-file limit.`
      : !input.multiple && source.length + base > 1 ? "The native input does not allow multiple files." : null
    const errors = sample.map(file => !Number.isSafeInteger(file.size) || file.size < 0 || file.size > settings.maxFileBytes
      ? `File exceeds the ${settings.maxFileBytes}-byte per-file limit.`
      : file.name.length > 4096 || file.type.length > 255 || (file.webkitRelativePath || "").length > 4096 ? "File metadata exceeds the supported text bound." : null)
    if (!reason && errors.some(Boolean)) reason = "Selection rejected; at least one file exceeds metadata limits."
    return { sample, count: source.length, reason, errors }
  }
  function createEntry(file: File, batchId: string): Entry {
    const node = rowTemplate().cloneNode(true) as HTMLLIElement
    const row: Row = { node, name: node.querySelector("[data-upload-name]")!, size: node.querySelector("[data-upload-size]")!,
      status: node.querySelector("[data-upload-status]")!, progress: node.querySelector("[data-upload-progress]")!,
      buttons: new Map(actions.map(action => [action, node.querySelector(`[data-upload-action="${action}"]`)!])) }
    const id = `${prefix}-${++sequence}`
    row.buttons.forEach(button => authoredDisabled.set(button, button.disabled))
    node.dataset.uploadId = id; row.name.textContent = file.name; row.size.textContent = `${file.size} bytes`
    row.progress.setAttribute("aria-label", `${file.name}: bytes sent, not server success`)
    return { id, batchId, file, status: "pending", attempt: 0, loaded: 0, total: null, error: null, result: null, job: null, row }
  }
  function select(source: readonly File[] | FileList, mode: "append" | "replace", reason: string, authoritative = false, preserve = false): UploadSelection {
    const checked = inspect(source, mode === "append" ? entries.length : 0)
    if (checked.reason) {
      const result: UploadSelection = Object.freeze({ accepted: false, added: Object.freeze([]),
        rejected: Object.freeze(checked.sample.map((file, i) => Object.freeze({ file, reason: checked.errors[i] ?? checked.reason! }))),
        rejectedCount: checked.count, reason: checked.reason })
      if (authoritative && mode === "replace") { writeFiles([]); const old = entries; entries = []; ++generation; detach(old) }
      else if (authoritative) writeFiles(entries.map(entry => entry.file))
      notice = checked.reason; emit("rejected", null, result); handoff(); return result
    }
    const batchId = `${prefix}:batch:${++batch}`, old = entries, pool = preserve ? [...old] : []
    const next = checked.sample.map(file => {
      const at = pool.findIndex(entry => entry.file === file)
      return at >= 0 ? pool.splice(at, 1)[0]! : createEntry(file, batchId)
    })
    const combined = mode === "append" ? [...old, ...next] : next
    writeFiles(combined.map(entry => entry.file))
    const added = next.filter(entry => !old.includes(entry))
    entries = combined
    if (mode === "replace" && !preserve) ++generation
    detach(old.filter(entry => !combined.includes(entry)))
    if (!connected) return Object.freeze({ accepted: false, added: Object.freeze([]), rejected: Object.freeze([]), rejectedCount: checked.count, reason: "Upload was disconnected." })
    const focused = doc.activeElement instanceof win.HTMLElement ? doc.activeElement : null
    entries.forEach((entry, i) => { if (list.children[i] !== entry.row.node) list.insertBefore(entry.row.node, list.children[i] ?? null) })
    if (focused && doc.activeElement === doc.body && entries.some(entry => entry.row.node.contains(focused))) focused.focus({ preventScroll: true })
    if (settings.autoUpload && !blocked()) for (const entry of added) entry.status = "queued"
    notice = ""
    const result: UploadSelection = Object.freeze({ accepted: true, added: Object.freeze(added.map(snapshot)), rejected: Object.freeze([]), rejectedCount: 0, reason: null })
    emit(reason, null, result); handoff(); return result
  }
  function current(job: Job) {
    return connected && entries.includes(job.entry) && job.entry.job === job && job.generation === generation
      && !job.abort.signal.aborted && flights.has(job) && synchronized() && !resetting && !blocked()
  }
  function progress(job: Job, loaded: number, total: number | null = null) {
    if (!current(job)) return false
    if (!Number.isSafeInteger(loaded) || loaded < job.entry.loaded || loaded < 0
      || total !== null && (!Number.isSafeInteger(total) || total < 0 || loaded > total)) {
      const error = new RangeError("Progress needs monotonic nonnegative safe-integer bytes and null or valid total.")
      job.failure = error; job.entry.error = error; cancelEntry(job.entry); report(error, "progress", job.entry); emit("cancelling", job.entry)
      return false
    }
    job.entry.loaded = loaded; job.entry.total = total; render(true)
    const previous = notifying; notifying = true
    try { element.dispatchEvent(new win.CustomEvent("mui:upload-progress", { bubbles: true, detail: snapshot(job.entry) })) }
    finally { notifying = previous }
    return true
  }
  function finish(job: Job, result: unknown, failure: unknown = undefined, failed = false) {
    if (connected && resetting) { resetCompletions.push(() => finish(job, result, failure, failed)); return }
    const entry = job.entry
    const relevant = () => connected && element.isConnected && entries.includes(entry) && entry.job === job && job.generation === generation
    let response: UploadResponse | null = null
    if (relevant() && !job.abort.signal.aborted && synchronized() && !blocked() && !failed) {
      invoking = true
      try {
        if (!result || typeof result !== "object" || (result as UploadResponse).status !== "finished"
          || Object.keys(result).some(key => !["status", "response"].includes(key))) throw new TypeError("Transport must resolve an explicit {status:'finished', response?} result.")
        response = Object.freeze({ ...(result as UploadResponse) })
      } catch (error) { failed = true; failure = error }
      finally { invoking = false }
      if (connected && resetting) {
        resetCompletions.push(() => finish(job, response, failure, failed))
        return
      }
    }
    flights.delete(job)
    const applies = relevant()
    if (entry.job === job) entry.job = null
    if (applies) {
      if (blocked() && !job.abort.signal.aborted) job.abort.abort("disabled")
      if (job.abort.signal.aborted) {
        entry.status = job.failure ? "error" : "cancelled"; entry.error = job.failure
      } else if (!synchronized() || resetting) {
        entry.status = "cancelled"; entry.result = null
      } else {
        entry.status = failed ? "error" : "finished"; entry.error = failed ? failure : null
        entry.result = failed ? null : response
        if (failed) { entry.result = null; report(failure, "transport", entry) }
      }
      emit(entry.status, entry)
    } else if (connected) emit("settled")
    handoff(); pump()
  }
  function pump() {
    if (pumping || !connected || resetting || mutating || notifying || blocked() || !synchronized() || !settings.transport) return
    pumping = true
    try {
      while (connected && !resetting && !blocked() && synchronized() && flights.size < settings.concurrency) {
        const entry = entries.find(item => item.status === "queued")
        if (!entry) break
        const job: Job = { entry, generation, attempt: ++entry.attempt, abort: new win.AbortController(), invoked: false, failure: null }
        entry.job = job; entry.status = "uploading"; flights.add(job); emit("start", entry)
        if (!current(job)) { job.abort.abort("not-started"); finish(job, null); continue }
        job.invoked = true
        let result: UploadResponse | Promise<UploadResponse>
        invoking = true
        try {
          result = settings.transport(entry.file, Object.freeze({ id: entry.id, attempt: job.attempt, generation: job.generation,
            signal: job.abort.signal, reportProgress: (loaded: number, total?: number | null) => progress(job, loaded, total ?? null) }))
        } catch (error) { result = Promise.reject(error) }
        finally { invoking = false }
        Promise.resolve(result).then(value => finish(job, value), error => finish(job, null, error, true))
      }
    } finally { pumping = false }
  }
  function transaction<T>(work: () => T, edit = false, requireAligned = true): T {
    live(edit); if (requireAligned) aligned()
    mutating = true
    try { return work() } finally { mutating = false; pump() }
  }
  function add(source: readonly File[] | FileList, mode: "append" | "replace" = settings.selection as "append" | "replace") {
    if (!["append", "replace"].includes(mode)) throw new TypeError("Use append or replace selection.")
    return transaction(() => select(source, mode, "selection"), true)
  }
  function start(id?: string, retry = false) {
    transaction(() => {
      if (!settings.transport) throw new Error("Provide an explicit transport before starting uploads.")
      const targets = id === undefined ? entries : [find(id)]
      for (const entry of targets) {
        if (entry.status === "pending" || retry && ["error", "cancelled"].includes(entry.status) && !entry.job) {
          entry.status = "queued"; entry.loaded = 0; entry.total = null; entry.error = null; entry.result = null
        }
      }
      notice = ""; emit(retry ? "retry" : "queued", id === undefined ? null : targets[0]!)
    }, true)
  }
  function cancel(id?: string) { transaction(() => { (id === undefined ? entries : [find(id)]).forEach(cancelEntry); emit("cancel"); handoff() }, false, false) }
  function remove(id: string) {
    transaction(() => {
      const entry = find(id), next = entries.filter(item => item !== entry)
      writeFiles(next.map(item => item.file)); entries = next; detach([entry]); emit("remove", entry); handoff()
    }, true)
  }
  function clear() { transaction(() => { writeFiles([]); const old = entries; entries = []; ++generation; detach(old); notice = ""; emit("clear"); handoff() }, false, false) }
  function refresh() {
    return transaction(() => {
      if (blocked()) entries.forEach(cancelEntry)
      if (!synchronized() || !input.multiple && entries.length > 1) return select(input.files ?? [], "replace", "refresh", true, true)
      render(); handoff(); return null
    }, false, false)
  }
  function listen(node: EventTarget, type: string, callback: EventListener, capture = false) {
    node.addEventListener(type, callback, capture); listeners.push(() => node.removeEventListener(type, callback, capture))
  }
  function handleError(error: unknown) {
    notice = error instanceof Error ? error.message.slice(0, 512) : "Upload operation failed."
    report(error, "operation"); render()
  }
  const observer = new win.MutationObserver(() => {
    if (!connected) return
    if (!element.isConnected || element.getRootNode() !== doc || !element.contains(input) || input.type !== "file" || !element.contains(list) || !element.contains(controls)) { disconnect(); return }
    const disabled = blocked()
    if (disabled !== lastBlocked) {
      lastBlocked = disabled
      if (disabled) entries.forEach(cancelEntry)
      emit("disabled"); handoff(); pump()
    }
  })
  function disconnect() {
    if (!connected) return
    focusBefore(entries); connected = false; ++generation; ++version; resetting = false
    win.clearTimeout(resetTimer); resetTimer = 0; resetEvent = null
    observer.disconnect(); listeners.forEach(remove => remove())
    const old = entries; entries = []; detach(old)
    writes.restore()
    if (readout.textContent === lastText) readout.textContent = originalText
    resetCompletions.splice(0).forEach(finish => finish())
    handoff()
  }
  const initial = inspect(input.files ?? [], 0)
  if (initial.reason) throw new RangeError(`Cannot adopt initial FileList: ${initial.reason}`)
  ;(element as Owned)[owner] = token; (input as Owned)[owner] = token
  const firstBatch = `${prefix}:batch:${++batch}`
  entries = initial.sample.map(file => createEntry(file, firstBatch))
  entries.forEach(entry => list.append(entry.row.node))
  writes.attr(list, "hidden", null); writes.attr(controls, "hidden", null)
  writes.attr(readout, "aria-live", "polite"); writes.attr(readout, "aria-atomic", "true")
  if (drop && settings.drop) writes.attr(drop, "hidden", null)
  lastBlocked = blocked(); render()
  listen(input, "change", () => {
    if (!connected || resetting) return
    try { transaction(() => select(input.files ?? [], input.files?.length ? settings.selection as "append" | "replace" : "replace", "selection", true), false, false) }
    catch (error) { handleError(error) }
  })
  listen(element, "click", event => {
    const button = event.target instanceof win.Element ? event.target.closest("button") : null
    if (!(button instanceof win.HTMLButtonElement) || !own(button) || button.matches(":disabled") || button.getAttribute("aria-disabled") === "true") return
    const row = button.closest<HTMLLIElement>("[data-upload-id]")
    if (!row && !topButtons.includes(button)) return
    const id = row?.dataset.uploadId, action = button.dataset.uploadAction
    try {
      if (action === "start") start(id)
      else if (action === "cancel") cancel(id)
      else if (action === "retry" && id) start(id, true)
      else if (action === "remove" && id) remove(id)
      else if (action === "clear" && !id) clear()
    } catch (error) { handleError(error) }
  })
  listen(element, "focusout", () => { win.queueMicrotask(() => { if (connected) render(true) }) })
  listen(doc, "reset", event => {
    if (event.target !== input.form) return
    resetEvent = event
    if (resetting) return
    resetting = true
    // A native reset-button activation can run a microtask checkpoint before the
    // browser clears FileList. One task, not a microtask, observes the final default action.
    resetTimer = win.setTimeout(() => {
      resetTimer = 0
      if (!connected) return
      resetting = false
      const cancelled = resetEvent?.defaultPrevented; resetEvent = null
      try { if (!cancelled || !synchronized()) transaction(() => select(input.files ?? [], "replace", "reset", true), false, false); else render() }
      catch (error) { handleError(error) }
      finally { resetCompletions.splice(0).forEach(finish => finish()); pump() }
    }, 0)
  }, true)
  if (drop && settings.drop) {
    const fileDrag = (event: DragEvent) => event.dataTransfer?.types.includes("Files")
    for (const type of ["dragenter", "dragover"]) listen(drop, type, event => {
      const drag = event as DragEvent
      if (!fileDrag(drag)) return
      drag.preventDefault(); if (drag.dataTransfer) drag.dataTransfer.dropEffect = blocked() ? "none" : "copy"
      writes.attr(drop, "data-upload-dragover", blocked() ? null : "")
    })
    listen(drop, "dragleave", () => writes.attr(drop, "data-upload-dragover", null))
    listen(drop, "drop", event => {
      const drag = event as DragEvent
      if (!fileDrag(drag)) return
      drag.preventDefault(); writes.attr(drop, "data-upload-dragover", null)
      try {
        const items = drag.dataTransfer?.items
        if (items && items.length > 100) throw new Error("Drop contains too many items; no directory crawl or partial import was performed.")
        if ([...(items ?? [])].some(item => item.webkitGetAsEntry?.()?.isDirectory)) throw new Error("Directory drops are not crawled; use the native chooser or flat Files.")
        if (!drag.dataTransfer?.files.length) throw new Error("No flat Files are available from this drop; selection was not changed.")
        add(drag.dataTransfer!.files)
      } catch (error) { handleError(error) }
    })
  }
  observer.observe(doc.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["disabled", "hidden", "inert", "type", "open", "style", "class"] })
  if (settings.autoUpload) win.queueMicrotask(() => { if (connected && !blocked()) { try { start() } catch (error) { handleError(error) } } })
  return {
    element, input, list, get connected() { return connected }, get files() { return files() }, get state() { return state() },
    add, start, retry: id => start(id, true), cancel, remove, clear, refresh,
    whenIdle() { return !flights.size && !entries.some(entry => entry.status === "queued") ? Promise.resolve() : new Promise(resolve => idle.add(resolve)) },
    disconnect,
  }
}
