import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUIInputOtp
  if (!api) throw new Error("InputOtp runtime did not load.")
  void loadComponentApi(document.getElementById("input-otp-api"), new URL("../api/input-otp.json", import.meta.url))

  const basicOtp = document.getElementById("basic-otp")
  const basicStatus = document.getElementById("basic-status")
  const completeStatus = document.getElementById("complete-status")
  function presentBasic() {
    basicStatus.textContent = `${basicOtp.value.length} native characters entered.`
    completeStatus.textContent = basicOtp.complete ? "Format complete; not authenticated." : "Status: Incomplete"
  }
  basicOtp.addEventListener("input", presentBasic)
  basicOtp.addEventListener("change", presentBasic)
  basicOtp.addEventListener("m:input-otp-complete", presentBasic)
  document.getElementById("clear-basic").addEventListener("click", () => { basicOtp.clear(); presentBasic() })
  document.getElementById("fill-basic").addEventListener("click", () => { basicOtp.value = "123456"; presentBasic() })
  presentBasic()

  const maskOtp = document.getElementById("mask-otp")
  document.getElementById("toggle-mask").addEventListener("click", () => { maskOtp.mask = !maskOtp.mask })
  const disabledOtp = document.getElementById("disabled-otp")
  document.getElementById("toggle-disabled").addEventListener("click", () => { disabledOtp.disabled = !disabledOtp.disabled })

  const form = document.getElementById("otp-form")
  function presentForm() {
    const values = new FormData(form).getAll("code[0].text")
    document.getElementById("form-status").textContent = `FormData has ${values.length} named field; ${String(values[0] ?? "").length} native characters.`
  }
  form.addEventListener("input", presentForm)
  form.addEventListener("reset", () => queueMicrotask(presentForm))
  presentForm()

  const owner = api.createInputOtp(document.getElementById("enhance-code"), {
    length: 4, status: document.getElementById("enhance-status"),
  })
  window.addEventListener("pagehide", () => owner.disconnect(), { once: true })
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()
