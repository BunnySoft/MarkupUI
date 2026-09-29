import { dirname, resolve } from "node:path"

export function corePlugin(root, format, { bundleNative = false } = {}) {
  return {
    name: "shared-element-core",
    setup(builder) {
      builder.onResolve({ filter: /\/chart\/renderer\.js$|^\.\/renderer\.js$/ }, args => {
        if (resolve(dirname(args.importer), args.path) !== resolve(root, "src/components/chart/renderer.js")) return
        return format === "esm" ? { path: "./markup-ui-chart-renderer.js", external: true }
          : { path: "chart-renderer", namespace: "markupui-chart-renderer" }
      })
      builder.onLoad({ filter: /.*/, namespace: "markupui-chart-renderer" }, () => ({
        loader: "js",
        contents: `
          const renderer = globalThis.MarkupUIChartRenderer;
          if (!renderer) throw new Error("Load markup-ui-chart-renderer.global.js before Chart.");
          export const { createChartRenderer, configureChartEngine } = renderer;
        `,
      }))
      if (!bundleNative) builder.onResolve({ filter: /native-select\.js$/ }, () =>
        format === "esm" ? { path: "./markup-ui-native-select.js", external: true }
          : { path: "native-select", namespace: "markupui-native-select" })
      builder.onLoad({ filter: /.*/, namespace: "markupui-native-select" }, () => ({
        loader: "js",
        contents: `
          const native = globalThis[Symbol.for("markup-ui.native-select")];
          if (!native || typeof native.createSelect !== "function") throw new Error("Load markup-ui-native-select.global.js before Select, TreeSelect or Popselect.");
          export const { createSelect, selectOptions, selectValue, setSelectValue } = native;
        `,
      }))
      builder.onResolve({ filter: /(?:^|\/)(?:view-element|index)\.js$/ }, args => {
        const path = resolve(dirname(args.importer), args.path)
        if (path === resolve(root, "src/state/index.js")) {
          return format === "esm" ? { path: "./markup-ui-state.js", external: true }
            : { path: "state", namespace: "markupui-state" }
        }
        if (path !== resolve(root, "src/core/index.js") && path !== resolve(root, "src/core/view-element.js")) return
        return format === "esm" ? { path: "./markup-ui-core.js", external: true }
          : { path: "core", namespace: "markupui-core" }
      })
      builder.onLoad({ filter: /.*/, namespace: "markupui-state" }, () => ({
        loader: "js",
        contents: `
          const state = globalThis.MarkupUIState;
          if (!state) throw new Error("Load markup-ui-state.global.js before the root facade.");
          export const { bind, createStore, MStore } = state;
        `,
      }))
      builder.onLoad({ filter: /.*/, namespace: "markupui-core" }, () => ({
        loader: "js",
        contents: `
          export const ViewElement = globalThis.MarkupUICore?.ViewElement;
          if (typeof ViewElement !== "function") {
            throw new Error("Load compatible markup-ui-core.global.js first.");
          }
        `,
      }))
      if (!bundleNative) builder.onResolve({ filter: /native-input\.js$/ }, () =>
        format === "esm" ? { path: "./markup-ui-native-input.js", external: true }
          : { path: "native-input", namespace: "markupui-native-input" })
      builder.onLoad({ filter: /.*/, namespace: "markupui-native-input" }, () => ({
        loader: "js",
        contents: `
          const native = globalThis[Symbol.for("markup-ui.native-input")];
          if (!native || typeof native.createInput !== "function") throw new Error("Load markup-ui-native-input.global.js before Input.");
          export const { createInput } = native;
        `,
      }))
      if (!bundleNative) builder.onResolve({ filter: /native-radio\.js$/ }, () =>
        format === "esm" ? { path: "./markup-ui-native-radio.js", external: true }
          : { path: "native-radio", namespace: "markupui-native-radio" })
      builder.onLoad({ filter: /.*/, namespace: "markupui-native-radio" }, () => ({
        loader: "js",
        contents: `
          const native = globalThis[Symbol.for("markup-ui.native-radio")];
          if (!native || typeof native.createRadioGroup !== "function") throw new Error("Load markup-ui-native-radio.global.js before Radio or Rate.");
          export const { createRadioGroup, radioMembers, setRadioValue } = native;
        `,
      }))
    },
  }
}
