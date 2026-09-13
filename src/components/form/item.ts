import { ViewElement } from "../../core/index.js"
import type { FormValidator, FormControl } from "./controller.js"
import type { Form } from "./form.js"

export abstract class FormLayout extends ViewElement {
  /** Null inherits geometry; absent family geometry is medium (26px label, 34px content, 24px feedback). */
  public get size(): "small" | "medium" | "large" | null { return this.choiceAttribute("size", ["small", "medium", "large"], null) }
  public set size(value: "small" | "medium" | "large" | null) { this.setNullableChoiceAttribute("size", value, ["small", "medium", "large"]) }
  public get labelPlacement(): "top" | "left" | null { return this.choiceAttribute("label-placement", ["top", "left"], null) }
  public set labelPlacement(value: "top" | "left" | null) { this.setNullableChoiceAttribute("label-placement", value, ["top", "left"]) }
}

/**
 * Layout and explicit feedback mapping. Use real label/for or a fieldset's first legend.
 * Native controls own required, pattern, custom validity and accessible names; no duplicate label is generated.
 * One mapped item/feedback has one Form owner; native association determines its participating controls.
 * @region {"name":"content","accepts":["native labels and controls","native fieldset with legend","nested FormItem","plain uniquely identified .m-form-item__feedback"],"min":0,"max":null}
 */
export class FormItem extends FormLayout {
  public static readonly tag: string = "m-form-item"
  public static readonly observedAttributes = ["key", "size", "label-placement"]
  #initialized = false
  #validator: FormValidator | null = null
  #observer?: MutationObserver
  public connectedCallback(): void {
    if (!this.#initialized) { this.upgradeProperties(); this.#initialized = true }
    queueMicrotask(() => { if (this.isConnected) this.refresh() })
    this.#observer ??= new MutationObserver(() => this.refresh())
    this.#observer.observe(this, { childList: true, subtree: true })
  }
  public disconnectedCallback(): void { this.#observer?.disconnect() }
  public attributeChangedCallback(): void { if (this.#initialized) this.refresh() }
  /** Literal validation key, initially ""; unkeyed items are layout only. */
  public get key(): string { return this.getAttribute("key") ?? "" }
  public set key(value: string) { if (typeof value !== "string") throw new TypeError("Expected a string."); this.setStringAttribute("key", value) }
  /** Optional local validator, initially null. Native errors run first; warnings do not block custom results. */
  public get validator(): FormValidator | null { return this.#validator }
  public set validator(value: FormValidator | null) {
    if (value !== null && typeof value !== "function") throw new TypeError("Expected a validator or null.")
    this.#validator = value
    const forms = new Set([...this.querySelectorAll<FormControl>("input,select,textarea")]
      .map(control => control.form?.closest<Form>("m-form")).filter(form => !!form))
    for (const form of forms) form.refresh()
  }
  /** Original direct native fieldset, otherwise the item itself; no form or fieldset is simulated. */
  public get native(): HTMLElement {
    const fields = [...this.children].filter(node => node.localName === "fieldset")
    if (fields.length > 1) throw new TypeError("Expected at most one direct fieldset.")
    return fields[0] as HTMLFieldSetElement | undefined ?? this
  }
  /** Authored plain feedback; null when absent. Text, hidden and ARIA are reversibly leased during validation. */
  public get feedback(): HTMLElement | null {
    const nodes = [...this.querySelectorAll<HTMLElement>(".m-form-item__feedback")]
      .filter(node => node.closest("m-form-item,m-form-item-gi") === this)
    if (nodes.length > 1) throw new TypeError("Expected at most one item feedback.")
    return nodes[0] ?? null
  }
  /** Reconcile late native fieldsets and feedback without moving controls, labels or legends. */
  public refresh(): void {
    const native = this.native
    native.classList.add("m-form-item")
    if (native !== this) this.classList.remove("m-form-item")
    void this.size; void this.labelPlacement
  }
}

/** Existing two-column .m-form-grid item, collapsing to full width at 40rem. No Grid renderer/dependency. */
export class FormItemGi extends FormItem {
  public static override readonly tag = "m-form-item-gi"
  public static override readonly observedAttributes = ["key", "size", "label-placement", "span"]
  /** Positive integer span or full. Initially 1; narrow layouts occupy the full row.
   * @min 1
   * @integer
   */
  public get span(): number | "full" {
    if (this.getAttribute("span") === "full") return "full"
    const value = this.numberAttribute("span", 1)
    if (!Number.isSafeInteger(value) || value < 1) throw new RangeError("Expected a positive integer span or full.")
    return value
  }
  public set span(value: number | "full") {
    if (value !== "full" && (!Number.isSafeInteger(value) || value < 1)) throw new RangeError("Expected a positive integer span or full.")
    this.setAttribute("span", String(value))
  }
  public override refresh(): void {
    super.refresh()
    const span = this.span
    this.classList.add("m-form-item-gi")
    if (span === "full") this.setAttribute("data-form-span", "full")
    else { this.removeAttribute("data-form-span"); this.style.setProperty("--_f-span", String(span)) }
  }
}
