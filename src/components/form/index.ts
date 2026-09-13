import { ViewElement } from "../../core/index.js"
import { Form } from "./form.js"
import { FormItem, FormItemGi } from "./item.js"
export { Form } from "./form.js"
export { FormItem, FormItemGi } from "./item.js"
export type { FormControl, FormFieldSnapshot, FormIssue, FormItemOptions,
  FormValidationControl, FormValidationReason, FormValidationResult, FormValidator, FormValidatorContext, FormValidatorResult } from "./controller.js"
export function registerForm(): void { ViewElement.register([Form, FormItem, FormItemGi]) }
registerForm()
