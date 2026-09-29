import assert from "node:assert/strict"
import { resolve } from "node:path"

/** Explicit action scopes through native activation, keyed moves and App reconnect. */
export async function verifyScopedActions(page, origin, mode, engine, layout, output) {
  const url = `${origin}/demo/scoped-actions-${mode}-check.html`
  await page.route(url, route => route.fulfill({
    contentType: "text/html",
    body: `<!doctype html><meta name="viewport" content="width=device-width"><title>Task actions</title>
      <link rel="stylesheet" href="/dist/markup-ui-list.css"><link rel="stylesheet" href="/dist/markup-ui-input.css">
      <link rel="stylesheet" href="/dist/markup-ui-box.css"><link rel="stylesheet" href="/dist/markup-ui-button.css">
      <style>body{font:16px system-ui;margin:24px;color:#202124}main{max-width:640px}h1{font-size:24px}
      m-input{display:block;max-width:100%}input{box-sizing:border-box;max-width:100%}</style>
      <main><h1>Task actions</h1><m-app id="action-app">
        <m-list><m-list-template data-each="rows" data-each-key="key" label="Tasks" focus-on-remove>
          <m-list-item><m-box display="flex" direction="column" gap="8">
            <m-input aria-label="Task" data-model-value="$item.name" data-model-event="input" data-model-target="native"></m-input>
            <m-box display="flex" wrap gap="8">
              <m-button m-action="row.save" m-arg-key="$key" m-arg-index="$index" m-arg-name="$item.name" m-param-mode="save">Save task</m-button>
              <m-button m-action="row.remove" m-arg-key="$key">Remove task</m-button>
            </m-box>
          </m-box></m-list-item>
        </m-list-template></m-list>
        <m-text id="action-status" role="status">Ready</m-text>
      </m-app></main>`,
  }))
  await page.goto(url)
  if (mode === "classic") {
    for (const name of ["core", "state", "box", "list", "native-input", "input", "button"]) await page.addScriptTag({ url: `${origin}/dist/markup-ui-${name}.global.js` })
    await page.evaluate(() => {
      window.actionState = MarkupUIState
      window.actionStore = actionState.createStore({ rows: [{ key: "a", name: "Report" }, { key: "b", name: "Review" }] })
      document.getElementById("action-app").store = actionStore
    })
    await page.addScriptTag({ url: `${origin}/dist/markup-ui.global.js` })
    await page.evaluate(() => { window.actionApi = m.actions })
  } else await page.evaluate(async () => {
    window.actionState = await import("/dist/markup-ui-state.js")
    for (const name of ["box", "list", "input", "button"]) await import(`/dist/markup-ui-${name}.js`)
    window.actionStore = actionState.createStore({ rows: [{ key: "a", name: "Report" }, { key: "b", name: "Review" }] })
    document.getElementById("action-app").store = actionStore
    window.actionApi = (await import("/dist/markup-ui.min.js")).m.actions
  })
  await page.evaluate(() => {
    window.actionCalls = []
    window.actionErrors = []
    document.getElementById("action-app").addEventListener("m:error", event => actionErrors.push(event.detail.message))
    actionApi.register("row.save", ({ store, arguments: args, parameters }) => {
      if (store !== actionStore) throw new Error("Wrong action store")
      actionCalls.push({ ...args, mode: parameters.mode })
      document.getElementById("action-status").textContent = `Saved ${args.name}`
    })
    actionApi.register("row.remove", ({ store, arguments: args }) => {
      store.set("rows", store.get("rows").filter(row => row.key !== args.key))
    })
    window.actionFirst = document.querySelector("m-list-item")
  })
  const saves = page.getByRole("button", { name: "Save task", exact: true })
  assert.equal(await saves.count(), 2)
  await saves.nth(0).press("Enter")
  assert.deepEqual(await page.evaluate(() => actionCalls), [{ key: "a", index: 0, name: "Report", mode: "save" }])
  await page.evaluate(() => actionStore.set("rows", [{ key: "b", name: "Revised review" }, { key: "a", name: "Revised report" }]))
  assert(await page.evaluate(() => document.querySelectorAll("m-list-item")[1] === actionFirst))
  const fields = page.getByRole("textbox", { name: "Task", exact: true })
  assert.equal(await fields.count(), 2)
  await fields.nth(1).fill("Edited report")
  await saves.nth(1).press("Space")
  assert.deepEqual(await page.evaluate(() => actionCalls.at(-1)), { key: "a", index: 1, name: "Edited report", mode: "save" })
  await page.evaluate(() => { actionFirst.querySelector('m-button[m-action="row.save"]').disabled = true })
  await page.evaluate(() => actionFirst.querySelector('m-button[m-action="row.save"] button').click())
  assert.equal(await page.evaluate(() => actionCalls.length), 2)
  await page.evaluate(() => { actionFirst.querySelector('m-button[m-action="row.save"]').disabled = false })
  const removes = page.getByRole("button", { name: "Remove task", exact: true })
  assert.equal(await removes.count(), 2)
  await removes.nth(1).press("Enter")
  assert.deepEqual(await page.evaluate(() => actionStore.get("rows").map(row => row.key)), ["b"])
  assert(await page.evaluate(() => document.activeElement === document.querySelector("m-list").itemsContainer))
  await page.evaluate(async () => {
    const app = document.getElementById("action-app"), parent = app.parentNode
    const button = app.querySelector('m-button[m-action="row.save"] button')
    for (let index = 0; index < 10; index++) {
      app.remove()
      button.click()
      parent.append(app)
      await Promise.resolve()
      button.click()
    }
  })
  assert.equal(await page.evaluate(() => actionCalls.length), 12)
  assert.deepEqual(await page.evaluate(() => actionCalls.at(-1)), { key: "b", index: 0, name: "Revised review", mode: "save" })
  await page.evaluate(() => {
    actionApi.register("row.save", () => { throw new Error("Expected action failure") })
    document.querySelector('m-button[m-action="row.save"] button').click()
  })
  assert.deepEqual(await page.evaluate(() => actionErrors), ["Expected action failure"])
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${engine}/${layout}: actions overflow`)
  await page.screenshot({ path: resolve(output, `${engine}-${layout}-scoped-actions-${mode}.png`) })
  const samples = await page.evaluate(() => {
    const samples = []
    for (const count of [0, 1, 100, 1000]) {
      const root = document.createElement("div")
      root.innerHTML = '<template data-each="rows" data-each-key="key"><button m-action="measured.read" m-arg-key="$key" m-arg-index="$index">Read</button></template>'
      document.body.append(root)
      const store = actionState.createStore({ rows: Array.from({ length: count }, (_, key) => ({ key })) })
      const binding = actionState.bind(root, store), stop = actionApi.install(root, binding)
      const first = root.querySelector("button")
      store.set("rows", [...store.get("rows")].reverse())
      let calls = 0
      actionApi.register("measured.read", ({ arguments: args }) => {
        if (args.key !== 0 || args.index !== count - 1) throw new Error("Stale measured arguments")
        calls++
      })
      const start = performance.now()
      for (let index = 0; index < 10; index++) first?.click()
      samples.push({ count, tenActivationsMs: performance.now() - start, calls })
      stop()
      binding()
      root.remove()
    }
    return samples
  })
  assert(samples.every(sample => sample.calls === (sample.count ? 10 : 0)))
  return { typedArguments: true, keyboard: true, disabled: true, currentKeys: true, focusRemoval: true, reconnects: 10, errors: true, samples }
}

/** Application-owned ID pairs, including native label activation after keyed moves. */
export async function verifyPairedIds(page, origin, mode, engine, layout, output) {
  const url = `${origin}/demo/paired-ids-${mode}-check.html`
  await page.route(url, route => route.fulfill({
    contentType: "text/html",
    body: `<!doctype html><meta name="viewport" content="width=device-width"><title>Task details</title>
      <link rel="stylesheet" href="/dist/markup-ui-list.css"><link rel="stylesheet" href="/dist/markup-ui-input.css">
      <link rel="stylesheet" href="/dist/markup-ui-box.css">
      <style>body{font:16px system-ui;margin:24px;color:#202124}main{max-width:640px}h1{font-size:24px}
      m-input{display:block;max-width:100%}input{box-sizing:border-box;max-width:100%}</style>
      <main id="workspace"><h1>Task details</h1>
        <m-list><m-list-template data-each="rows" data-each-key="key" data-template="#row"
          label="Tasks" focus-on-remove></m-list-template></m-list>
        <template id="row"><m-list-item><m-box display="flex" direction="column" gap="8">
          <m-label data-bind-html-for="$item.field" data-bind-text="$item.title"></m-label>
          <m-input data-bind-id="$item.field" data-bind-attr-aria-describedby="$item.help"
            data-model-value="$item.value" data-model-event="input change" data-model-target="native"></m-input>
          <m-small data-bind-id="$item.help">Task description</m-small>
        </m-box></m-list-item></template>
      </main>`,
  }))
  await page.goto(url)
  if (mode === "classic") {
    for (const name of ["core", "state", "box", "list", "native-input", "input"]) await page.addScriptTag({ url: `${origin}/dist/markup-ui-${name}.global.js` })
    await page.evaluate(() => { window.idApi = MarkupUIState })
  } else await page.evaluate(async () => {
    window.idApi = await import("/dist/markup-ui-state.js")
    for (const name of ["box", "list", "input"]) await import(`/dist/markup-ui-${name}.js`)
  })
  await page.evaluate(() => {
    window.idStore = idApi.createStore({ rows: [
      { key: "a", field: "field-a", help: "help-a", title: "Report", value: "Quarterly report" },
      { key: "b", field: "field-b", help: "help-b", title: "Review", value: "Release review" },
    ] })
    window.idBinding = idApi.bind(document.getElementById("workspace"), idStore)
    window.idField = document.getElementById("field-a")
    window.idNative = idField.native
    window.idSource = document.getElementById("row").innerHTML
  })
  const input = page.getByRole("textbox", { name: "Report", exact: true })
  await page.locator("m-label > label").filter({ hasText: "Report" }).click()
  assert(await input.evaluate(node => node === document.activeElement), "Paired label did not focus its native input")
  assert.equal(await input.getAttribute("aria-describedby"), "help-a")
  assert.equal(await page.locator("#help-a").textContent(), "Task description")
  await input.fill("Edited report")
  assert.equal(await page.evaluate(() => idStore.get("rows.0.value")), "Edited report")
  assert.deepEqual(await page.evaluate(() => {
    idNative.value = "Draft"
    idNative.setSelectionRange(1, 3)
    idStore.set("rows", [...idStore.get("rows")].reverse())
    return { identity: document.querySelectorAll("m-input")[1] === idField, focus: document.activeElement === idNative,
      draft: idNative.value, selection: [idNative.selectionStart, idNative.selectionEnd] }
  }), { identity: true, focus: true, draft: "Draft", selection: [1, 3] })
  await page.locator("m-label > label").filter({ hasText: "Review" }).click()
  await page.locator("m-label > label").filter({ hasText: "Report" }).click()
  assert(await input.evaluate(node => node === document.activeElement), "Reordered label did not retain association")
  await page.evaluate(() => {
    idStore.set("rows", idStore.get("rows").map(row => ({ ...row, field: row.key === "a" ? "field-b" : "field-a" })))
  })
  assert(await page.evaluate(() => [...document.querySelectorAll("m-label")]
    .every(label => label.control === label.parentElement.querySelector("m-input").native)), "Swapped IDs lost their labels")
  assert.deepEqual(await page.evaluate(() => {
    const valid = idStore.get("rows")
    let rejected = false
    try { idStore.set("rows", valid.map(row => ({ ...row, field: "duplicate" }))) } catch { rejected = true }
    const preserved = idField.id === "field-b" && idNative.isConnected
    idStore.set("rows", valid)
    idBinding()
    idBinding = idApi.bind(document.getElementById("workspace"), idStore)
    return { rejected, preserved, rebound: document.querySelectorAll("m-input")[1] === idField,
      untouched: document.getElementById("row").innerHTML === idSource }
  }), { rejected: true, preserved: true, rebound: true, untouched: true })
  await page.locator("m-label > label").filter({ hasText: "Report" }).click()
  assert(await input.evaluate(node => node === document.activeElement), "Rebound label did not retain association")
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${engine}/${layout}: paired IDs overflow`)
  await page.screenshot({ path: resolve(output, `${engine}-${layout}-paired-ids-${mode}.png`) })
  const samples = await page.evaluate(() => {
    idNative.blur()
    idStore.set("rows", [])
    idBinding()
    const relations = document.createElement("div")
    relations.innerHTML = '<div data-bind-text="text"><span id="static-help">Help</span></div><input data-bind-attr-aria-describedby="help">'
    document.body.append(relations)
    const relationStore = idApi.createStore({ text: "Help", help: "static-help" })
    const relationBinding = idApi.bind(relations, relationStore)
    let rejected = false
    try { relationStore.set("text", "Replacement") } catch { rejected = true }
    if (!rejected || !relations.querySelector("#static-help")) throw new Error("Root text write destroyed its ID target")
    relationBinding()
    relations.remove()
    const samples = []
    for (const count of [0, 1, 100, 1000]) {
      const root = document.createElement("div")
      root.innerHTML = '<template data-each="rows" data-each-key="key"><div><label data-bind-html-for="$item.field">Name</label><input data-bind-id="$item.field" data-model-value="$item.value" data-model-event="input"></div></template>'
      document.body.append(root)
      const store = idApi.createStore({ rows: Array.from({ length: count }, (_, key) => ({ key, field: `measured-${key}`, value: String(key) })) })
      const start = performance.now()
      let stop = idApi.bind(root, store)
      const mountMs = performance.now() - start
      const first = root.querySelector("input")
      const reorderStart = performance.now()
      store.set("rows", [...store.get("rows")].reverse())
      const reorderMs = performance.now() - reorderStart
      const updateStart = performance.now()
      if (count) store.set(`rows.${count - 1}.value`, "Updated")
      const updateMs = performance.now() - updateStart
      const lifecycleStart = performance.now()
      for (let index = 0; index < 10; index++) { stop(); stop = idApi.bind(root, store) }
      const lifecycleMs = performance.now() - lifecycleStart
      const stable = !count || root.querySelectorAll("input")[count - 1] === first && first.value === "Updated"
      const paired = [...root.querySelectorAll("label")].every(label => label.control === label.nextElementSibling)
      stop()
      samples.push({ count, mountMs, reorderMs, updateMs, lifecycleMs, stable, paired })
      root.remove()
    }
    return samples
  })
  assert(samples.every(sample => sample.stable && sample.paired), "Paired-ID lifecycle check failed")
  return { labelActivation: true, descriptionTargets: true, swaps: true, duplicatePreflight: true, rebind: true, samples }
}

/** Reusable Web definitions with portable List content and explicit named sources. */
export async function verifyTemplateSources(page, origin, mode, engine, layout, output) {
  const url = `${origin}/demo/template-sources-${mode}-check.html`
  await page.route(url, route => route.fulfill({
    contentType: "text/html",
    body: `<!doctype html><meta name="viewport" content="width=device-width"><title>Reusable task sources</title>
      <link rel="stylesheet" href="/dist/markup-ui-list.css"><link rel="stylesheet" href="/dist/markup-ui-input.css">
      <style>body{font:16px system-ui;margin:24px;color:#202124}main{max-width:640px}h1{font-size:24px}
      m-input{display:block;max-width:100%}section{margin:16px 0}input{box-sizing:border-box;max-width:100%}</style>
      <main id="workspace"><h1>Reusable task sources</h1>
        <m-list><m-list-template data-each="rows" data-each-key="id" data-template="#row"
          label="Tasks" focus-on-remove></m-list-template></m-list>
        <section aria-label="Task mirror"><template data-each="rows" data-each-key="id" data-template="field"></template></section>
        <template id="row"><m-list-item><m-input data-bind-attr-aria-label="$item.name"
          data-model-value="$item.value" data-model-event="input change" data-model-target="native"></m-input></m-list-item></template>
      </main>`,
  }))
  await page.goto(url)
  if (mode === "classic") {
    for (const name of ["core", "state", "list", "native-input", "input"]) await page.addScriptTag({ url: `${origin}/dist/markup-ui-${name}.global.js` })
    await page.evaluate(() => { window.sourceApi = MarkupUIState })
  } else await page.evaluate(async () => {
    window.sourceApi = await import("/dist/markup-ui-state.js")
    await import("/dist/markup-ui-list.js")
    await import("/dist/markup-ui-input.js")
  })
  await page.evaluate(() => {
    const field = document.createElement("template")
    field.innerHTML = '<input aria-label="Task mirror" data-model-value="$item.value" data-model-event="input">'
    window.sourceOptions = { templates: new Map([["field", field]]) }
    window.sourceStore = sourceApi.createStore({ rows: [
      { id: "a", name: "Alpha", value: "Alpha value" }, { id: "b", name: "Beta", value: "Beta value" },
    ] })
    window.sourceBinding = sourceApi.bind(document.getElementById("workspace"), sourceStore, sourceOptions)
    window.sourceFirst = document.querySelector("m-input").native
    window.sourceOriginal = document.getElementById("row").innerHTML
  })
  await page.getByRole("textbox", { name: "Alpha", exact: true }).fill("Source edit")
  assert.equal(await page.evaluate(() => sourceStore.get("rows.0.value")), "Source edit")
  assert.deepEqual(await page.evaluate(() => {
    sourceFirst.value = "Draft"
    sourceFirst.setSelectionRange(1, 3)
    sourceStore.set("rows", [...sourceStore.get("rows")].reverse())
    const result = { stable: document.querySelectorAll("m-input")[1].native === sourceFirst,
      focus: document.activeElement === sourceFirst, draft: sourceFirst.value,
      selection: [sourceFirst.selectionStart, sourceFirst.selectionEnd] }
    sourceBinding()
    sourceBinding = sourceApi.bind(document.getElementById("workspace"), sourceStore, sourceOptions)
    result.rebound = document.querySelectorAll("m-input")[1].native === sourceFirst
    result.untouched = document.getElementById("row").innerHTML === sourceOriginal
    return result
  }), { stable: true, focus: true, draft: "Draft", selection: [1, 3], rebound: true, untouched: true })
  assert.deepEqual(await page.evaluate(() => {
    sourceFirst.focus()
    const definition = document.getElementById("row")
    const content = definition.content.firstElementChild
    content.setAttribute("id", "invalid")
    let rejected = false
    try { sourceBinding.refresh() } catch { rejected = true }
    const preserved = sourceFirst.isConnected && document.activeElement === sourceFirst
    content.removeAttribute("id")
    content.setAttribute("title", "Updated source")
    sourceBinding.refresh()
    const result = { rejected, preserved, replaced: !sourceFirst.isConnected,
      focusedList: document.activeElement === document.querySelector("m-list").itemsContainer }
    sourceStore.set("rows", [])
    result.empty = document.querySelector("m-list").items.length === 0
    sourceStore.set("rows", [{ id: "c", name: "Gamma", value: "New task" }])
    return result
  }), { rejected: true, preserved: true, replaced: true, focusedList: true, empty: true })
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${engine}/${layout}: source overflow`)
  await page.screenshot({ path: resolve(output, `${engine}-${layout}-template-sources-${mode}.png`) })
  await page.evaluate(() => sourceBinding())
  return { references: true, programmatic: true, immutableSource: true, focus: true, rebind: true }
}

/** Explicitly Web-only fixtures; these do not approve a portable List API. */
export async function verifyTemplates(page, origin, mode, engine, layout, output) {
  const url = `${origin}/demo/templates-${mode}-check.html`
  await page.route(url, route => route.fulfill({
    contentType: "text/html",
    body: `<!doctype html><meta name="viewport" content="width=device-width"><title>Template editing</title>
      <link rel="stylesheet" href="/dist/markup-ui-input.css">
      <style>body{font:16px system-ui;margin:24px;color:#202124}main{max-width:640px}h1{font-size:24px}
      section{margin:16px 0}label{display:block;margin:12px 0}m-input{display:block;max-width:100%}
      button{padding:8px 12px}span{display:block;margin-bottom:4px}</style>
      <main id="workspace"><h1>Template editing</h1><button id="fallback">Add entry</button>
      <template data-each="groups" data-each-key="id"><section>
        <h2 data-bind-text="$item.title"></h2><template data-if="$item.show"><div>
          <template data-each="$item.rows" data-each-key="id"><label>
            <span data-bind-text="$item.name"></span>
            <m-input data-bind-attr-aria-label="$item.name" data-model-value="$item.value" data-model-event="input change" data-model-target="native"></m-input>
          </label></template>
        </div></template>
      </section></template></main>`,
  }))
  await page.goto(url)
  if (mode === "classic") {
    for (const name of ["core", "state", "native-input", "input"]) await page.addScriptTag({ url: `${origin}/dist/markup-ui-${name}.global.js` })
    await page.evaluate(() => { window.templateApi = MarkupUIState })
  } else await page.evaluate(async () => {
    window.templateApi = await import("/dist/markup-ui-state.js")
    await import("/dist/markup-ui-input.js")
  })
  await page.evaluate(() => {
    const groups = [
      { id: "g", title: "Primary", show: true, rows: [{ id: "a", name: "Alpha", value: "Alpha value" }, { id: "b", name: "Beta", value: "Beta value" }] },
      { id: "h", title: "Secondary", show: true, rows: [] },
    ]
    window.templateStore = templateApi.createStore({ groups })
    window.templateBinding = templateApi.bind(document.getElementById("workspace"), templateStore)
    window.originalField = document.querySelector("m-input")
    window.originalNative = originalField.native
  })
  const alpha = page.getByRole("textbox", { name: "Alpha", exact: true })
  await alpha.fill("Edited alpha")
  assert.equal(await page.evaluate(() => templateStore.get("groups.0.rows.0.value")), "Edited alpha")
  assert.deepEqual(await page.evaluate(() => {
    const field = originalNative
    field.focus()
    field.value = "Uncommitted draft"
    field.setSelectionRange(2, 8, "backward")
    templateStore.set("groups", [...templateStore.get("groups")].reverse())
    templateStore.set("groups.1.rows", [...templateStore.get("groups.1.rows")].reverse())
    return {
      identity: originalField.native === field,
      focus: document.activeElement === field,
      value: field.value,
      selection: [field.selectionStart, field.selectionEnd, field.selectionDirection],
    }
  }), { identity: true, focus: true, value: "Uncommitted draft", selection: [2, 8, "backward"] })
  assert.equal(await page.evaluate(() => {
    originalNative.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true, data: "" }))
    originalNative.value = "Composition edit"
    originalNative.dispatchEvent(new InputEvent("input", { bubbles: true, isComposing: true, data: "edit", inputType: "insertCompositionText" }))
    originalNative.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true, data: "edit" }))
    return templateStore.get("groups.1.rows.1.value")
  }), "Composition edit")
  assert.deepEqual(await page.evaluate(() => {
    const previous = [...document.querySelectorAll("m-input")]
    let rejected = false
    try { templateStore.set("groups.1.rows", [{ id: "a", name: "Duplicate", value: "x" }, { id: "a", name: "Duplicate", value: "y" }]) }
    catch { rejected = true }
    const unchanged = [...document.querySelectorAll("m-input")].every((node, index) => node === previous[index])
    templateStore.set("groups.1.rows", [{ id: "b", name: "Beta", value: "Beta value" }, { id: "a", name: "Alpha", value: "Composition edit" }])
    templateBinding()
    templateStore.set("groups", [...templateStore.get("groups")].reverse())
    templateBinding = templateApi.bind(document.getElementById("workspace"), templateStore)
    return { rejected, unchanged, count: document.querySelectorAll("m-input").length, identity: originalField.native === originalNative }
  }), { rejected: true, unchanged: true, count: 2, identity: true })
  // Also exercise insertion fallback even on engines with state-preserving moves.
  assert.deepEqual(await page.evaluate(() => {
    const parent = originalField.parentElement.parentElement
    Object.defineProperty(parent, "moveBefore", { configurable: true, value: undefined })
    originalNative.focus()
    originalNative.value = "Fallback draft"
    originalNative.setSelectionRange(1, 4, "forward")
    templateStore.set("groups.0.rows", [...templateStore.get("groups.0.rows")].reverse())
    delete parent.moveBefore
    return { focus: document.activeElement === originalNative, value: originalNative.value, selection: [originalNative.selectionStart, originalNative.selectionEnd] }
  }), { focus: true, value: "Fallback draft", selection: [1, 4] })
  assert.deepEqual(await page.evaluate(() => {
    let rejected = false
    try { templateStore.set("groups.0.show", false) } catch { rejected = true }
    const preserved = originalNative.isConnected
    templateBinding()
    templateBinding = templateApi.bind(document.getElementById("workspace"), templateStore, {
      focusFallback: () => document.getElementById("fallback"),
    })
    const result = { rejected, preserved, removed: !originalNative.isConnected, focus: document.activeElement.id }
    templateStore.set("groups.0.show", true)
    return result
  }), { rejected: true, preserved: true, removed: true, focus: "fallback" })
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${engine}/${layout}: templates overflow`)
  await page.screenshot({ path: resolve(output, `${engine}-${layout}-templates-${mode}.png`) })
  const samples = await page.evaluate(() => {
    templateBinding()
    const samples = []
    for (const count of [0, 1, 100, 1000]) {
      const root = document.createElement("div")
      root.innerHTML = '<template data-each="rows" data-each-key="id"><input data-model-value="$item.value" data-model-event="input"></template>'
      document.body.append(root)
      const state = templateApi.createStore({ rows: Array.from({ length: count }, (_, id) => ({ id, value: String(id) })) })
      const start = performance.now()
      let stop = templateApi.bind(root, state)
      const mountMs = performance.now() - start
      const first = root.querySelector("input")
      const reverseStart = performance.now()
      state.set("rows", [...state.get("rows")].reverse())
      const reorderMs = performance.now() - reverseStart
      const updateStart = performance.now()
      if (count) state.set(`rows.${count - 1}.value`, "Updated")
      const updateMs = performance.now() - updateStart
      const stable = !count || root.querySelectorAll("input")[count - 1] === first && first.value === "Updated"
      const lifecycleStart = performance.now()
      for (let index = 0; index < 10; index++) { stop(); stop = templateApi.bind(root, state) }
      const lifecycleMs = performance.now() - lifecycleStart
      stop()
      samples.push({ count, mountMs, reorderMs, updateMs, lifecycleMs, stable, finalCount: root.querySelectorAll("input").length })
      root.remove()
    }
    return samples
  })
  assert(samples.every(sample => sample.stable && sample.finalCount === sample.count), "Large-list identity/lifecycle check failed")
  return samples
}

/** Portable List authoring exercised against the selected Web renderer. */
export async function verifyListTemplates(page, origin, mode, engine, layout, output) {
  const url = `${origin}/demo/list-templates-${mode}-check.html`
  await page.route(url, route => route.fulfill({
    contentType: "text/html",
    body: `<!doctype html><meta name="viewport" content="width=device-width"><title>Task list</title>
      <link rel="stylesheet" href="/dist/markup-ui-list.css">
      <link rel="stylesheet" href="/dist/markup-ui-input.css">
      <link rel="stylesheet" href="/dist/markup-ui-box.css">
      <style>body{font:16px system-ui;margin:24px;color:#202124}m-box{max-width:640px}
      m-list{width:100%}m-input{display:block;max-width:100%}</style>
      <m-box id="workspace" display="flex" direction="column" gap="16">
        <m-heading level="1">Task list</m-heading>
        <m-list id="tasks">
          <m-list-template data-each="rows" data-each-key="id" label="Tasks" focus-on-remove>
            <m-list-item><m-box display="flex" direction="column" gap="8">
              <m-text data-bind-text="$item.title"></m-text>
              <m-input data-bind-attr-aria-label="$item.title" data-model-value="$item.name"
                data-model-event="input change" data-model-target="native"></m-input>
            </m-box></m-list-item>
          </m-list-template>
        </m-list>
      </m-box>`,
  }))
  await page.goto(url)
  if (mode === "classic") {
    for (const name of ["core", "list", "box", "native-input", "input", "state"]) {
      await page.addScriptTag({ url: `${origin}/dist/markup-ui-${name}.global.js` })
    }
    await page.evaluate(() => { window.listStateApi = MarkupUIState })
  } else await page.evaluate(async () => {
    for (const name of ["list", "box", "input"]) await import(`/dist/markup-ui-${name}.js`)
    window.listStateApi = await import("/dist/markup-ui-state.js")
  })
  await page.evaluate(() => {
    window.portableList = document.getElementById("tasks")
    window.portableStore = listStateApi.createStore({ rows: [
      { id: "a", title: "Report", name: "Quarterly report" },
      { id: "b", title: "Review", name: "Review release notes" },
    ] })
    window.portableBinding = listStateApi.bind(document.getElementById("workspace"), portableStore)
    window.portableItem = portableList.items[0]
    window.portableField = portableItem.querySelector("m-input").native
  })
  const list = page.getByRole("list", { name: "Tasks", exact: true })
  assert.equal(await list.count(), 1)
  assert.equal(await list.getByRole("listitem").count(), 2)
  const input = page.getByRole("textbox", { name: "Report", exact: true })
  await input.fill("Edited report")
  assert.equal(await page.evaluate(() => portableStore.get("rows.0.name")), "Edited report")
  assert.deepEqual(await page.evaluate(() => {
    portableField.focus()
    portableField.value = "Portable draft"
    portableField.setSelectionRange(2, 6, "backward")
    portableStore.set("rows", [...portableStore.get("rows")].reverse())
    return {
      identity: portableList.items[1] === portableItem,
      native: portableItem.querySelector("m-input").native === portableField,
      focus: document.activeElement === portableField,
      draft: portableField.value,
      selection: [portableField.selectionStart, portableField.selectionEnd, portableField.selectionDirection],
    }
  }), { identity: true, native: true, focus: true, draft: "Portable draft", selection: [2, 6, "backward"] })
  assert.equal(await page.evaluate(() => {
    portableField.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }))
    portableField.value = "Composed report"
    portableField.dispatchEvent(new InputEvent("input", { bubbles: true, isComposing: true, data: "report", inputType: "insertCompositionText" }))
    portableField.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true, data: "report" }))
    return portableStore.get("rows.1.name")
  }), "Composed report")
  assert.deepEqual(await page.evaluate(() => {
    const items = [...portableList.items]
    let rejected = false
    try { portableStore.set("rows", [{ id: "a", title: "One", name: "One" }, { id: "a", title: "Two", name: "Two" }]) }
    catch { rejected = true }
    const unchanged = portableList.items.every((item, index) => item === items[index])
    portableStore.set("rows", [
      { id: "b", title: "Review", name: "Review release notes" },
      { id: "a", title: "Report", name: "Composed report" },
    ])
    portableBinding()
    portableBinding = listStateApi.bind(document.getElementById("workspace"), portableStore)
    return { rejected, unchanged, count: portableList.items.length, native: portableItem.querySelector("m-input").native === portableField }
  }), { rejected: true, unchanged: true, count: 2, native: true })
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${engine}/${layout}: portable list overflow`)
  await page.screenshot({ path: resolve(output, `${engine}-${layout}-list-templates-${mode}.png`) })
  assert.deepEqual(await page.evaluate(() => {
    portableField.focus()
    portableStore.set("rows", [])
    return { count: portableList.items.length, focus: document.activeElement === portableList.itemsContainer, tabIndex: portableList.itemsContainer.tabIndex }
  }), { count: 0, focus: true, tabIndex: -1 })
  const samples = await page.evaluate(() => {
    portableBinding()
    const samples = []
    for (const count of [0, 1, 100, 1000]) {
      const root = document.createElement("m-list")
      root.innerHTML = '<m-list-template data-each="rows" data-each-key="id" label="Measured tasks"><m-list-item data-bind-text="$item.name"></m-list-item></m-list-template>'
      document.body.append(root)
      const state = listStateApi.createStore({ rows: Array.from({ length: count }, (_, id) => ({ id, name: String(id) })) })
      const start = performance.now()
      let stop = listStateApi.bind(root, state)
      const mountMs = performance.now() - start
      const first = root.items[0]
      const reorderStart = performance.now()
      state.set("rows", [...state.get("rows")].reverse())
      const reorderMs = performance.now() - reorderStart
      const updateStart = performance.now()
      if (count) state.set(`rows.${count - 1}.name`, "Updated")
      const updateMs = performance.now() - updateStart
      const lifecycleStart = performance.now()
      for (let index = 0; index < 10; index++) { stop(); stop = listStateApi.bind(root, state) }
      const lifecycleMs = performance.now() - lifecycleStart
      const stable = !count || root.items[count - 1] === first && first.textContent === "Updated"
      stop()
      samples.push({ count, mountMs, reorderMs, updateMs, lifecycleMs, stable, finalCount: root.items.length })
      root.remove()
    }
    return samples
  })
  assert(samples.every(sample => sample.stable && sample.finalCount === sample.count), "Portable list lifecycle check failed")
  return samples
}
