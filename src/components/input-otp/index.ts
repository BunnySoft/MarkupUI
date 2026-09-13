export { InputOtp, inputOtpSizes } from "./input-otp-element.js"
export type { InputOtpSize } from "./input-otp-element.js"
export { createInputOtp } from "./input-otp.js"
export type { InputOtpCharacters, InputOtpController, InputOtpOptions } from "./input-otp.js"

import { ViewElement } from "../../core/index.js"
import { InputOtp } from "./input-otp-element.js"

export function registerInputOtp(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([InputOtp], registry)
}

if (typeof customElements !== "undefined" && !customElements.get(InputOtp.tag)) registerInputOtp()

