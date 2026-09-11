const controllers = new Map()

for (const trigger of document.querySelectorAll("[data-dropdown-trigger]")) {
  const menu = document.getElementById(trigger.getAttribute("popovertarget"))
  const controller = MarkupUIDropdown.createDropdown(trigger, menu, {
    placement: trigger.dataset.placement ?? "bottom",
  })
  controllers.set(trigger, controller)

  if (trigger.hasAttribute("data-hover-trigger")) {
    trigger.addEventListener("pointerenter", () => controller.open())
    trigger.addEventListener("focus", () => controller.open())
  }
}

for (const menu of document.querySelectorAll("[data-dropdown-menu]")) {
  menu.addEventListener("mui:dropdown-select", event => {
    const status = menu.closest("[data-demo-example]")?.querySelector("[data-dropdown-status]")
    if (status) status.textContent = `Selected ${event.detail.path.join(" > ")}`
  })
}

for (const trigger of document.querySelectorAll("[data-manual-toggle]")) {
  trigger.addEventListener("click", event => {
    event.preventDefault()
    const controller = controllers.get(trigger)
    controller.setShow(!controller.show)
  })
}

const manualArea = document.querySelector("[data-manual-area]")
const manualAnchor = document.querySelector(".manual-anchor")
manualArea.addEventListener("contextmenu", event => {
  event.preventDefault()
  manualAnchor.style.left = `${event.clientX}px`
  manualAnchor.style.top = `${event.clientY}px`
  controllers.get(manualAnchor).open()
})

for (const item of document.querySelectorAll("[data-option-message]")) {
  item.addEventListener("click", () => {
    item.closest("[data-demo-example]").querySelector("[data-dropdown-status]").textContent =
      item.dataset.optionMessage
  })
}

for (const item of document.querySelectorAll("[data-option-pointer-message]")) {
  item.addEventListener("pointerdown", () => {
    item.closest("[data-demo-example]").querySelector("[data-dropdown-status]").textContent =
      item.dataset.optionPointerMessage
  })
}

window.dropdownParity = { controllers }
