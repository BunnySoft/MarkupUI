import { ViewElement } from "../../core/index.js"
import {
  createInputOtp, inputOtpCharacters, inputOtpPattern, validateInputOtpPattern,
  type InputOtpCharacters, type InputOtpController, type InputOtpSchema,
} from "./input-otp.js"

export type InputOtpSize = "small" | "medium" | "large"
export const inputOtpSizes: readonly InputOtpSize[] = ["small", "medium", "large"] as const

/**
 * One native input owns editing, selection, IME, focus, validity, defaults and forms.
 * Native input/change events are not intercepted. Completion is metadata only, never authentication.
 * @event {"name":"Input","web":"input","bubbles":true,"cancelable":false,"composed":true}
 * @event {"name":"Change","web":"change","bubbles":true,"cancelable":false,"composed":false}
 * @event {"name":"Complete","web":"m:input-otp-complete","bubbles":true,"cancelable":false,"composed":false,"detail":{"length":"number","characters":"InputOtpCharacters"}}
 * @region {"name":"content","accepts":["input","phrasing"],"min":0,"max":null}
 */
export class InputOtp extends ViewElement {
  public static readonly tag = "m-input-otp"
  public static readonly observedAttributes = [
    "value", "length", "characters", "pattern", "disabled", "mask", "size", "name", "form",
    "required", "readonly", "aria-label", "aria-labelledby", "aria-describedby",
  ]

  #initialized = false
  #input: HTMLInputElement | null = null
  #controller: InputOtpController | null = null
  #status: HTMLElement | null = null
  #mapped = new Map<string, string | null>()
  #sizeLease: { before: string | null; last: string } | null = null
  #lengthLease: { before: string; priority: string; last: string } | null = null
  #addedClass = false
  #inputMode: string | null = null

  public connectedCallback(): void {
    const first = !this.#initialized
    this.#ensureInput()
    this.#syncSchema()
    this.#syncAttributes(first)
    if (first) {
      this.upgradeProperties()
      this.#syncSchema()
      this.#syncAttributes(true)
      this.#initialized = true
    }
    this.connect()
  }

  public disconnectedCallback(): void {
    this.disconnect()
    this.#releasePresentation()
  }

  public attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue || !this.#initialized) return
    if (["length", "characters", "pattern"].includes(name)) this.#syncSchema(name === "pattern" && newValue === null)
    else if (name !== "size") this.#mapAttribute(name)
    if (["size", "length"].includes(name)) this.#present()
    this.refresh()
  }

  /** Web inspection/interop: the original native field, not a proxy. */
  public get native(): HTMLInputElement | null {
    return this.#input ?? this.#authoredInput()
  }

  /** Live native string, including invalid drafts. Silent writes never change the reset default. */
  public get value(): string {
    return this.native?.value ?? ""
  }

  public set value(value: string) {
    if (typeof value !== "string") throw new TypeError("Input OTP value must be a string.")
    this.#ensureInput().value = value
    this.refresh()
  }

  /** The value attribute maps to the native reset default, not the live/dirty value. */
  public get defaultValue(): string {
    return this.native?.defaultValue ?? this.getAttribute("value") ?? ""
  }

  public set defaultValue(value: string) {
    if (typeof value !== "string") throw new TypeError("Input OTP defaultValue must be a string.")
    this.setAttribute("value", value)
    if (!this.#initialized) this.#ensureInput().defaultValue = value
  }

  /**
   * Native authored maxlength is adopted when the logical attribute is absent.
   * @integer
   * @min 1
   * @max 12
   */
  public get length(): number {
    const nativeLength = this.native?.getAttribute("maxlength")
    const configured = this.numberAttribute("length", 6)
    const length = this.hasAttribute("length") ? configured
      : nativeLength !== undefined && nativeLength !== null ? Number(nativeLength) : configured
    if (!this.hasAttribute("length") && nativeLength !== null && nativeLength !== undefined
      && (!nativeLength.trim() || length !== this.native?.maxLength)) {
      throw new RangeError("Invalid native maxlength.")
    }
    inputOtpPattern(length, "digits")
    return length
  }

  public set length(value: number) {
    inputOtpPattern(value, "digits")
    this.setAttribute("length", String(value))
  }

  public get characters(): InputOtpCharacters {
    const configured = this.choiceAttribute("characters", inputOtpCharacters, "digits")
    if (this.hasAttribute("characters")) return configured
    return this.native?.pattern.startsWith("[A-Za-z0-9]") ? "alphanumeric" : "digits"
  }

  public set characters(value: InputOtpCharacters) {
    this.setChoiceAttribute("characters", value, inputOtpCharacters)
  }

  /** Optional Web constraint. Null removes the override and restores the ASCII preset. */
  public get pattern(): string {
    const pattern = this.getAttribute("pattern") ?? this.native?.getAttribute("pattern")
    if (pattern !== null && pattern !== undefined) return pattern
    return inputOtpPattern(this.length, this.characters)
  }

  public set pattern(value: string | null) {
    if (value !== null) validateInputOtpPattern(value)
    const changed = this.hasAttribute("pattern") || value !== null
    this.setStringAttribute("pattern", value)
    if (!changed && this.#initialized) this.#syncSchema(true)
  }

  public get disabled(): boolean {
    return this.native?.disabled ?? this.hasAttribute("disabled")
  }

  public set disabled(value: boolean) {
    this.setBooleanAttribute("disabled", value)
    if (this.native) this.#ensureInput().disabled = value
    this.refresh()
  }

  public get mask(): boolean {
    const configured = this.hasAttribute("mask")
    return this.native ? this.native.type === "password" : configured
  }

  public set mask(value: boolean) {
    this.setBooleanAttribute("mask", value)
    if (this.native) this.#ensureInput().type = value ? "password" : "text"
    this.refresh()
  }

  public get size(): InputOtpSize {
    return this.choiceAttribute("size", inputOtpSizes, "medium")
  }

  public set size(value: InputOtpSize) {
    this.setChoiceAttribute("size", value, inputOtpSizes)
  }

  public get name(): string {
    return this.native?.name ?? this.getAttribute("name") ?? ""
  }

  public set name(value: string) {
    if (typeof value !== "string") throw new TypeError("Input OTP name must be a string.")
    this.setAttribute("name", value)
  }

  public get form(): HTMLFormElement | null {
    return this.native?.form ?? null
  }

  public get required(): boolean {
    return this.native?.required ?? this.hasAttribute("required")
  }

  public set required(value: boolean) {
    this.setBooleanAttribute("required", value)
    if (this.native) this.#ensureInput().required = value
    this.refresh()
  }

  public get readOnly(): boolean {
    return this.native?.readOnly ?? this.hasAttribute("readonly")
  }

  public set readOnly(value: boolean) {
    this.setBooleanAttribute("readonly", value)
    if (this.native) this.#ensureInput().readOnly = value
    this.refresh()
  }

  /** Web-only optional original plain nonlive status node; change while disconnected. */
  public get status(): HTMLElement | null {
    return this.#status
  }

  public set status(value: HTMLElement | null) {
    if (value !== null && !(value instanceof this.ownerDocument.defaultView!.HTMLElement)) {
      throw new TypeError("Input OTP status must be a native HTMLElement or null.")
    }
    if (this.connected) throw new Error("Disconnect Input OTP before changing its status node.")
    this.#status = value
  }

  public get connected(): boolean {
    return this.#controller?.connected ?? false
  }

  public get complete(): boolean {
    return this.#controller?.complete ?? false
  }

  public override focus(options?: FocusOptions): void {
    this.native?.focus(options)
  }

  public override blur(): void {
    this.native?.blur()
  }

  public clear(): void {
    this.value = ""
  }

  /** Explicitly attach/re-attach the existing native owner after restoring invalidated anatomy. */
  public connect(): void {
    if (this.connected) { this.refresh(); return }
    const input = this.#ensureInput()
    if (!this.isConnected) throw new Error("Connect the Input OTP element to its document first.")
    this.#present()
    const length = this.length, characters = this.characters
    const preset = inputOtpPattern(length, characters)
    this.#controller = createInputOtp(input, {
      length, characters, ...(input.pattern !== preset ? { pattern: input.pattern } : {}),
      ...(this.#status ? { status: this.#status } : {}),
    })
  }

  /** Classify silent native writes without emitting completion or recreating an owner. */
  public refresh(): void {
    this.#controller?.refresh()
  }

  public disconnect(): void {
    this.#controller?.disconnect()
  }

  #authoredInput(): HTMLInputElement | null {
    const inputs = [...this.querySelectorAll<HTMLInputElement>("input")].filter(input => input.closest("m-input-otp") === this)
    if (inputs.length > 1) throw new TypeError("Input OTP needs one native input, not mirrored per-cell fields.")
    return inputs[0] ?? null
  }

  #ensureInput(): HTMLInputElement {
    const authored = this.#authoredInput()
    if (this.#input && authored !== this.#input) {
      throw new Error("Input OTP native identity changed; restore the original field before connecting.")
    }
    if (!this.#input) {
      this.#input = authored ?? this.ownerDocument.createElement("input")
      if (!authored) {
        this.#input.autocomplete = "one-time-code"
        this.#input.inputMode = "numeric"
        this.#inputMode = "numeric"
        this.append(this.#input)
      }
    }
    return this.#input
  }

  #syncSchema(resetPattern = false): void {
    const input = this.#ensureInput(), length = this.length, characters = this.characters
    this.size
    const nativePattern = input.getAttribute("pattern")
    const custom = !resetPattern && nativePattern !== null
      && !/^(?:\[0-9\]|\[A-Za-z0-9\])\{(?:[1-9]|1[0-2])\}$/.test(nativePattern) ? nativePattern : null
    const pattern = resetPattern ? null : this.getAttribute("pattern") ?? custom
    const schema: InputOtpSchema = { length, characters, pattern }
    const resolved = pattern ?? inputOtpPattern(length, characters)
    validateInputOtpPattern(resolved)
    if (this.connected) this.#controller!.configure(schema)
    else {
      input.maxLength = length
      input.pattern = resolved
    }
    if (!input.hasAttribute("autocomplete")) input.autocomplete = "one-time-code"
    if (!input.hasAttribute("inputmode") || input.inputMode === this.#inputMode) {
      input.inputMode = characters === "digits" ? "numeric" : "text"
      this.#inputMode = input.inputMode
    }
  }

  #syncAttributes(first: boolean): void {
    for (const name of InputOtp.observedAttributes) {
      if (["length", "characters", "pattern", "size"].includes(name)) continue
      const current = this.getAttribute(name)
      if (first ? current !== null : this.#mapped.has(name) && this.#mapped.get(name) !== current) this.#mapAttribute(name)
    }
  }

  #mapAttribute(name: string): void {
    const input = this.#ensureInput(), value = this.getAttribute(name)
    if (name === "value") input.defaultValue = value ?? ""
    else if (name === "mask") input.type = value === null ? "text" : "password"
    else if (name === "disabled") input.disabled = value !== null
    else if (name === "required") input.required = value !== null
    else if (name === "readonly") input.readOnly = value !== null
    else if (value === null) input.removeAttribute(name)
    else input.setAttribute(name, value)
    this.#mapped.set(name, value)
  }

  #present(): void {
    const input = this.#ensureInput(), size = this.size, length = String(this.length)
    if (!input.classList.contains("m-input-otp")) { input.classList.add("m-input-otp"); this.#addedClass = true }
    const beforeSize = input.getAttribute("data-size")
    if (!this.#sizeLease || beforeSize !== this.#sizeLease.last) this.#sizeLease = { before: beforeSize, last: size }
    input.dataset.size = size; this.#sizeLease.last = size
    const beforeLength = input.style.getPropertyValue("--m-input-otp-length")
    if (!this.#lengthLease || beforeLength !== this.#lengthLease.last) {
      this.#lengthLease = { before: beforeLength, priority: input.style.getPropertyPriority("--m-input-otp-length"), last: length }
    }
    input.style.setProperty("--m-input-otp-length", length); this.#lengthLease.last = length
  }

  #releasePresentation(): void {
    const input = this.#input
    if (!input) return
    if (this.#addedClass) input.classList.remove("m-input-otp")
    if (this.#sizeLease && input.getAttribute("data-size") === this.#sizeLease.last) {
      if (this.#sizeLease.before === null) input.removeAttribute("data-size")
      else input.setAttribute("data-size", this.#sizeLease.before)
    }
    if (this.#lengthLease && input.style.getPropertyValue("--m-input-otp-length") === this.#lengthLease.last
      && input.style.getPropertyPriority("--m-input-otp-length") === "") {
      input.style.setProperty("--m-input-otp-length", this.#lengthLease.before, this.#lengthLease.priority)
    }
    this.#addedClass = false; this.#sizeLease = this.#lengthLease = null
  }
}
