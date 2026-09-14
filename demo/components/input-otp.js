import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUIInputOtp
  if (!api) throw new Error("InputOtp runtime did not load.")
  void loadComponentApi(document.getElementById("input-otp-api"), new URL("../api/input-otp.json", import.meta.url))

  const basicOtp = document.getElementById("basic-otp")
  const basicStatus = document.getElementById("basic-status")
  const completeStatus = document.getElementById("complete-status")
  const clearBasic = document.getElementById("clear-basic")
  const fillBasic = document.getElementById("fill-basic")

  if (basicOtp) {
    basicOtp.addEventListener("m:change", event => {
      const detail = event.detail
      if (basicStatus) basicStatus.textContent = `Current value: ${detail?.value || "(empty)"}`
      if (completeStatus && !detail?.value) completeStatus.textContent = "Status: Incomplete"
    })
    basicOtp.addEventListener("m:complete", event => {
      const detail = event.detail
      if (completeStatus) completeStatus.textContent = `Status: Complete (${detail?.value})`
    })
  }

  clearBasic?.addEventListener("click", () => {
    if (basicOtp) {
      basicOtp.clear()
      if (basicStatus) basicStatus.textContent = "Current value: (empty)"
      if (completeStatus) completeStatus.textContent = "Status: Incomplete"
    }
  })

  fillBasic?.addEventListener("click", () => {
    if (basicOtp) {
      basicOtp.value = "123456"
      if (basicStatus) basicStatus.textContent = "Current value: 123456"
      if (completeStatus) completeStatus.textContent = "Status: Complete (123456)"
    }
  })

  const maskOtp = document.getElementById("mask-otp")
  const toggleMask = document.getElementById("toggle-mask")
  toggleMask?.addEventListener("click", () => {
    if (maskOtp) maskOtp.mask = !maskOtp.mask
  })

  const disabledOtp = document.getElementById("disabled-otp")
  const toggleDisabled = document.getElementById("toggle-disabled")
  toggleDisabled?.addEventListener("click", () => {
    if (disabledOtp) disabledOtp.disabled = !disabledOtp.disabled
  })
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()

