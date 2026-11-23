Fieldnotes.page("settings", function initialize() {
  const { notify, readLocal, saveLocal, showError } = Fieldnotes
  const settingsForm = document.getElementById("settings-form")
  const nameInput = document.getElementById("workspace-name")
  const seatsInput = document.getElementById("workspace-seats")
  const languageSelect = document.getElementById("workspace-language")
  const startTimePicker = document.getElementById("workday-start")
  const colorPicker = document.getElementById("workspace-color")
  const weeklySummary = document.getElementById("weekly-summary")
  const quietMode = document.getElementById("quiet-mode")
  const reviewCadence = document.getElementById("review-cadence")
  const workspaceNotes = document.getElementById("workspace-notes")
  const assetUpload = document.getElementById("studio-assets")
  const sampleCode = document.getElementById("sample-code")
  const verificationResult = document.getElementById("verification-result")
  const codeStatus = document.getElementById("code-status")
  const resetDialog = document.getElementById("reset-dialog")

  const savedPreferences = readLocal("preferences", null)
  if (savedPreferences) {
    nameInput.value = savedPreferences.name
    seatsInput.value = savedPreferences.seats
    languageSelect.value = savedPreferences.language
    startTimePicker.value = savedPreferences.start
    colorPicker.value = savedPreferences.color
    weeklySummary.checked = savedPreferences.summary
    quietMode.checked = savedPreferences.quiet

    for (const radio of reviewCadence.querySelectorAll("m-radio")) {
      radio.checked = radio.value === savedPreferences.cadence
    }
  }

  const notes = savedPreferences?.notes ?? [
    "Leave room to think.",
    "Share early, and listen well.",
  ]
  for (const note of notes) {
    const row = workspaceNotes.add()
    row.element.querySelector("input").value = note
  }

  function previewAccent() {
    document.getElementById("accent-preview").style.borderLeftColor = colorPicker.value
  }

  function saveSettings(event) {
    event.preventDefault()

    const name = nameInput.value.trim()
    if (!name) {
      nameInput.setCustomValidity("Use a workspace name, not only spaces.")
      nameInput.reportValidity()
      return
    }

    try {
      const formData = new FormData(settingsForm.native)
      const preferences = {
        name,
        seats: seatsInput.value,
        language: languageSelect.value,
        start: startTimePicker.value,
        color: colorPicker.value,
        summary: weeklySummary.checked,
        quiet: quietMode.checked,
        cadence: reviewCadence.value,
        notes: formData.getAll("notes[]"),
      }
      saveLocal("preferences", preferences)

      m(".workspace-picker m-strong").text(name)
      document.querySelector(".workspace-picker").style.borderLeft = `3px solid ${preferences.color}`
      notify("Your preferences are saved in this browser.")
    } catch (error) {
      showError(error)
    }
  }

  function updateAssetStatus() {
    const files = assetUpload.files
    document.getElementById("asset-status").textContent = files.length
      ? `${files.length} file${files.length === 1 ? "" : "s"} selected. Preview only; nothing uploaded.`
      : "No files selected."
  }

  function verifySampleCode() {
    const isValid = sampleCode.value === "123456"
    verificationResult.hidden = !isValid
    codeStatus.textContent = isValid
      ? "The sample code matched."
      : "Use the six-digit sample code 123456."

    if (!isValid) {
      sampleCode.focus()
    }
  }

  function clearVerification() {
    verificationResult.hidden = true
    codeStatus.textContent = "Press Check sample code to verify the preview."
  }

  function resetWorkspace() {
    try {
      localStorage.removeItem("fieldnotes:projects")
      localStorage.removeItem("fieldnotes:preferences")
      window.location.reload()
    } catch (error) {
      showError(error)
    }
  }

  assetUpload.options = {
    autoUpload: false,
    maxFiles: 3,
    maxFileBytes: 5 * 1024 * 1024,
    selection: "append",
  }

  m(colorPicker).on("m:change", previewAccent)
  m(settingsForm).on("submit", saveSettings)
  m(nameInput).on("input", () => {
    nameInput.setCustomValidity("")
  })
  m("#save-settings").on("click", () => {
    settingsForm.requestSubmit()
  })
  m(assetUpload).on("m:upload-change", updateAssetStatus)
  m(sampleCode).on("input", clearVerification)
  m("#verify-code").on("click", verifySampleCode)
  m("#reset-workspace").on("click", () => {
    resetDialog.showModal()
  })
  m("#cancel-reset").on("click", () => {
    resetDialog.close()
  })
  m("#confirm-reset").on("click", resetWorkspace)

  previewAccent()
})
