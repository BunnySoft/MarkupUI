import { LoadingBar } from "./loading-bar-element.js"

function getOrCreateLoadingBar(): LoadingBar {
  let bar = document.querySelector<LoadingBar>("m-loading-bar")
  if (!bar || !bar.isConnected) {
    bar = document.createElement("m-loading-bar") as LoadingBar
    bar.classList.add("m-loading-bar--fixed")
    document.body.append(bar)
  }
  return bar
}

export const loadingBar = {
  start(): void {
    getOrCreateLoadingBar().start()
  },
  finish(): void {
    getOrCreateLoadingBar().finish()
  },
  error(): void {
    getOrCreateLoadingBar().error()
  },
}
