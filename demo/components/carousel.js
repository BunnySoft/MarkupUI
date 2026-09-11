import { createCarousel } from "../../dist/markup-ui-carousel.js"

const controllers = new Map()

for (const root of document.querySelectorAll("[data-demo-carousel]")) {
  const controller = createCarousel(root, {
    autoplay: root.hasAttribute("data-autoplay"),
    interval: 3000,
    direction: root.dataset.direction ?? "horizontal",
    keyboard: root.hasAttribute("data-keyboard") || !root.hasAttribute("data-keyboard-disabled"),
  })
  controllers.set(root, controller)

  if (root.hasAttribute("data-hover-dots")) {
    for (const indicator of root.querySelectorAll("[data-carousel-to]")) {
      const show = () => controller.to(Number(indicator.dataset.carouselTo))
      indicator.addEventListener("pointerenter", show)
      indicator.addEventListener("focus", show)
    }
  }

  if (root.hasAttribute("data-custom-readout")) {
    const count = root.querySelector("[data-custom-count]")
    const update = () => { count.textContent = `${controller.getCurrentIndex() + 1} / ${controller.slides.length}` }
    root.addEventListener("mui:carousel-change", update)
    update()
  }
}

function selectButton(group, selected) {
  for (const button of group.querySelectorAll("mui-button")) {
    button.setAttribute("type", button === selected ? "primary" : "default")
  }
}

const dotsRoot = document.querySelector(".dots-demo")
const dotsController = controllers.get(dotsRoot)
const dotsOptions = document.querySelector("[data-dots-options]")

dotsOptions.addEventListener("click", event => {
  const button = event.target.closest("mui-button")
  if (!button) return
  if (button.hasAttribute("data-dot-type")) {
    dotsRoot.dataset.dotType = button.dataset.dotType
    selectButton(button.closest("mui-button-group"), button)
  } else if (button.hasAttribute("data-dot-placement")) {
    dotsRoot.dataset.dotPlacement = button.dataset.dotPlacement
    selectButton(button.closest("mui-button-group"), button)
  } else if (button.hasAttribute("data-dot-direction")) {
    const direction = button.dataset.dotDirection
    dotsController.set({ direction })
    selectButton(button.closest("mui-button-group"), button)
  } else if (button.hasAttribute("data-toggle-arrows")) {
    dotsRoot.toggleAttribute("data-show-arrows")
    button.querySelector("[data-toggle-label]").textContent = dotsRoot.hasAttribute("data-show-arrows")
      ? "Hide arrow"
      : "Show arrow"
  }
})

const effectStatus = document.querySelector("[data-effect-status]")
for (const button of document.querySelectorAll("[data-effect]")) {
  button.addEventListener("click", () => {
    selectButton(button.closest("mui-button-group"), button)
    effectStatus.textContent = button.dataset.effect === "slide"
      ? "Slide uses native scroll-snap."
      : `${button.textContent.trim()} remains an intentionally omitted transform/transition effect.`
  })
}

const keyboardRoot = document.querySelector(".keyboard-carousel")
const keyboardController = controllers.get(keyboardRoot)
for (const button of document.querySelectorAll("[data-keyboard-direction]")) {
  button.addEventListener("click", () => {
    keyboardController.set({ direction: button.dataset.keyboardDirection })
    selectButton(button.closest("mui-button-group"), button)
  })
}

window.carouselParity = { controllers }
