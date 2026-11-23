// Shared page behavior. Markup lives in HTML; MarkupUI supplies the DOM helpers.
window.Fieldnotes = (() => {
  const siteUrl = new URL(".", document.currentScript.src)
  const pageFiles = {
    "index.html": "overview",
    "projects.html": "projects",
    "team.html": "team",
    "insights.html": "insights",
    "library.html": "library",
    "settings.html": "settings",
  }
  const dependencies = {
    insights: "../vendor/echarts.global.js",
    library: "./catalog.js",
  }
  const initializers = new Map()
  const scripts = new Map([...document.querySelectorAll("script[src]")]
    .map(script => [script.src, Promise.resolve()]))
  let currentUrl = new URL(location.href)
  let navigation
  let disposePage
  let pageReady = false

  function notify(content, type = "success") {
    const message = new MarkupUIAll.message.Message()
    message.type = type
    message.content = content
    message.duration = 4500
    document.getElementById("toast-region").replaceChildren(message)
  }

  function showError(error) {
    console.error(error)
    const region = document.getElementById("site-error")
    region.hidden = false
    region.textContent = `The demo could not complete this action: ${error?.message ?? String(error)}`
  }

  function saveLocal(key, value) {
    localStorage.setItem(`fieldnotes:${key}`, JSON.stringify(value))
  }

  function readLocal(key, fallback) {
    const savedValue = localStorage.getItem(`fieldnotes:${key}`)
    return savedValue === null ? fallback : JSON.parse(savedValue)
  }

  function updateNavigation() {
    const currentPage = document.body.dataset.page
    m("#current-page").text(document.title.replace(" - Fieldnotes", ""))
    m("#desktop-navigation m-menu, #mobile-navigation m-menu").each(menu => {
      menu.value = currentPage
      for (const item of menu.querySelectorAll("m-menu-item")) {
        if (item.value === currentPage) item.setAttribute("aria-current", "page")
        else item.removeAttribute("aria-current")
      }
    })
  }

  function initializeShell() {
    updateNavigation()
    m("#desktop-navigation m-menu, #mobile-navigation m-menu").on("m:change", event => {
      const item = [...event.currentTarget.querySelectorAll("m-menu-item")]
        .find(item => item.value === event.detail.value)
      if (item?.href) navigate(item.href)
    })

    m("#mobile-nav-toggle").on("click", () => {
      document.getElementById("mobile-nav").open = true
    })
    m("#notifications-toggle").on("click", () => {
      document.getElementById("notifications").open = true
    })
    m("#read-notifications").on("click", () => {
      document.getElementById("notifications").open = false
      notify("You're all caught up.")
    })

    const preferences = readLocal("preferences", null)
    if (preferences) {
      m(".workspace-picker m-strong").text(preferences.name)
      document.querySelector(".workspace-picker").style.borderLeft = `3px solid ${preferences.color}`
    }
  }

  function findPage(href) {
    const url = new URL(href, location.href)
    if (url.origin !== siteUrl.origin) return
    const file = url.pathname === siteUrl.pathname ? "index.html"
      : Object.keys(pageFiles).find(file => new URL(file, siteUrl).pathname === url.pathname)
    if (file) return { url, id: pageFiles[file] }
  }

  function loadScript(path) {
    const url = new URL(path, siteUrl).href
    if (!scripts.has(url)) {
      const script = document.createElement("script")
      const loaded = new Promise((resolve, reject) => {
        script.src = url
        script.onload = resolve
        script.onerror = () => {
          scripts.delete(url)
          script.remove()
          reject(new Error(`Could not load page script: ${url}`))
        }
      })
      scripts.set(url, loaded)
      document.head.append(script)
    }
    return scripts.get(url)
  }

  function initializePage(id) {
    pageReady = false
    disposePage = initializers.get(id)()
    pageReady = true
    document.body.dataset.ready = "true"
  }

  function focusPage(url) {
    document.getElementById("main").focus({ preventScroll: true })
    const target = url.hash && document.getElementById(decodeURIComponent(url.hash.slice(1)))
    if (target) target.scrollIntoView()
    else window.scrollTo(0, 0)
  }

  async function navigate(href, { fromHistory = false } = {}) {
    const destination = findPage(href)
    if (!destination) {
      showError(new Error("Only Fieldnotes pages can be loaded into this workspace."))
      return
    }
    navigation?.abort()
    const controller = navigation = new AbortController()
    const main = document.getElementById("main")
    const errorRegion = document.getElementById("site-error")
    errorRegion.hidden = true
    errorRegion.textContent = ""
    main.setAttribute("aria-busy", "true")
    document.body.dataset.ready = "false"
    try {
      // Fetch only our authored pages. Never copy or execute scripts from the response.
      const response = await fetch(destination.url, {
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]),
        redirect: "error",
      })
      if (!response.ok) throw new Error(`Page request failed with HTTP ${response.status}.`)
      const next = new DOMParser().parseFromString(await response.text(), "text/html")
      const content = next.querySelector("main#main")
      if (!content || !next.title || next.body.dataset.page !== destination.id) {
        throw new Error("The requested page is not a Fieldnotes document.")
      }
      for (const script of content.querySelectorAll("script")) script.remove()
      if (dependencies[destination.id]) await loadScript(dependencies[destination.id])
      await loadScript(`${destination.id}.js`)
      if (!initializers.has(destination.id)) throw new Error("The page did not register its initializer.")
      if (controller.signal.aborted) return

      // Upgrade the detached tree before containers validate their child components.
      const imported = document.importNode(content, true)
      disposePage?.()
      disposePage = undefined
      main.replaceChildren(...imported.childNodes)
      document.body.dataset.page = destination.id
      document.title = next.title
      if (!fromHistory && destination.url.href !== location.href) {
        history.pushState(null, "", destination.url)
      }
      currentUrl = destination.url
      updateNavigation()
      document.getElementById("mobile-nav").open = false
      document.getElementById("account-menu").close()
      initializePage(destination.id)
      focusPage(destination.url)
    } catch (error) {
      if (!controller.signal.aborted) {
        if (fromHistory) history.replaceState(null, "", currentUrl)
        document.body.dataset.ready = String(pageReady)
        updateNavigation()
        showError(error)
      }
    } finally {
      if (navigation === controller) {
        navigation = undefined
        main.removeAttribute("aria-busy")
      }
    }
  }

  document.addEventListener("click", event => {
    if (event.defaultPrevented || event.button !== 0 ||
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const link = event.target.closest("a[href]")
    if (!link || link.hasAttribute("download") || link.target && link.target !== "_self") return
    const destination = findPage(link.href)
    if (!destination) return
    if (destination.url.pathname === location.pathname &&
      destination.url.search === location.search && destination.url.hash) return
    event.preventDefault()
    navigate(destination.url)
  })
  window.addEventListener("popstate", () => {
    const url = new URL(location.href)
    if (url.pathname === currentUrl.pathname && url.search === currentUrl.search) {
      navigation?.abort()
      navigation = undefined
      document.getElementById("main").removeAttribute("aria-busy")
      document.body.dataset.ready = String(pageReady)
      currentUrl = url
      updateNavigation()
      return
    }
    navigate(url, { fromHistory: true })
  })
  window.addEventListener("pagehide", event => {
    if (!event.persisted) {
      navigation?.abort()
      disposePage?.()
    }
  })
  window.addEventListener("error", event => showError(event.error ?? event.message))
  window.addEventListener("unhandledrejection", event => showError(event.reason))

  const shellReady = Promise.all([
    m("#site-sidebar").load("./partials/sidebar.html", { allowMarkupUI: true }),
    m("#site-header").load("./partials/header.html", { allowMarkupUI: true }),
    m("#site-overlays").load("./partials/overlays.html", { allowMarkupUI: true }),
  ]).then(() => {
    return m("#desktop-navigation, #mobile-navigation").load("./partials/navigation.html", { allowMarkupUI: true })
  }).then(initializeShell)

  function page(id, initialize) {
    initializers.set(id, initialize)
    if (!pageReady && !navigation && document.body.dataset.page === id) {
      shellReady.then(() => initializePage(id)).catch(showError)
    }
  }

  return { page, navigate, notify, showError, readLocal, saveLocal }
})()
