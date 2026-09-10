# Config Provider

**🟢 Verified retained native composition; no new ConfigProvider runtime or export.**

## Baseline and target

[Canonical contract and acceptance](../../components/config-provider.md) resolves useful
configuration through native ancestors, external CSS tokens/media queries, `lang`/`dir`
and explicit existing helper options. [Legacy theme API](../../../src/theme/index.ts)
remains unchanged; [Discrete](../../components/discrete.md) is the no-new-runtime precedent.
The [2026-09-11 style review](../../style-audit/components/config-provider.md) records
why a component-default comparison is not applicable.

- **HTML:** real ancestors and authored children, language hints, native direction and modal hosts.
- **JS:** explicit per-helper options/lifetime; no config-root helper, injection or reactive bridge.
- **CSS:** original application token subsets and explicit media queries, not duplicated legacy palettes.
- **Placement:** separate [demo HTML](../../../demo/components/config-provider.html),
  [CSS](../../../demo/components/config-provider.css), [JS](../../../demo/components/config-provider.js)
  and [composition tests](../../../tests/config-provider.test.ts). No source/bundle/export/budget added.

## Acceptance and gaps

86 targeted tests, unchanged declarations/build/budgets and Chromium scope/media/RTL/
native-modal/no-JS/strict-CSP/legacy/independent-document evidence pass. All 1,142 previous
distribution files byte-match. Native `lang` is not translation or OS picker localization;
custom properties inherit only through actual DOM ancestry. Helper options do not become
reactive. Provider objects, component defaults, renderer/style mounting and adapters are omitted.

## Upstream implementation evidence

Reviewed pinned English API, ConfigProvider.ts, interface.ts, internal-interface.ts,
context.ts and config.ts. The English table has no general RTL prop; source-only `rtl`
is an array of component/style descriptors, **not a boolean direction API**. The explicit
supplement below records that distinction. Source-only `bordered`, `hljs`, `icons`, deprecated
`as`, and the default slot are separately identified. No SSR/hydration control appears in
the provider props; do not invent such a row. Native composition does not implement Vue
refs, theme hashes/merges, dependency injection, CSS-render mounting or SSR machinery.

## Migration steps

**Delivery phase:** P0 — scoped native configuration only. **Task state:** 🟢 Verified.
**Prerequisites:** zero-dependency/CSP constraints and ownership decisions in the [master plan](../migration-plan.md).
**Next task:** Element, then Global Style; P0 remains incomplete and P6 is independent.

1. [x] **Define native inheritance.** Actual ancestors, external tokens, nested/independent roots and author overrides.
2. [x] **Reconcile current theme APIs.** Preserve legacy inline calls; demonstrate external light/dark/system/native policies and strict-CSP boundaries.
3. [x] **Resolve provider-only fields.** All original rows and explicit source/type supplements have named dispositions.
4. [x] **Test configuration scope.** Verify lang/dir versus labels, nested/modal/document scope, no-JS/CSP and explicit owner teardown.

### Native primitives and fallback

- **Native path:** inherited lang/dir and supported custom properties; media queries and explicit native hosts/options. No theme attribute on a nested scope means no local light reset.
- **Small enhancement:** demo controls change only application attributes or explicitly recreate one existing Loading Bar owner with supplied labels. Without JS, authored controls/progress and external CSS remain usable. Native modal control is hidden when unsupported; ordinary inline content remains available. No config custom element or provider polyfill.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/config-provider)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **14 local table rows + 103 supplementary declarations + 0 inherited rows = 117 tracker rows**.
All **95 original owner/name/kind/source identities** remain; **22 source supplements**
are explicit below. **Eight adapted capabilities + 109 omissions; zero unresolved rows**.
🟢 Verified means the narrowly described native capability, not upstream prop/type compatibility.
⏭️ Intentionally omitted means no implementation credit. Canonical evidence above governs.

Referenced public component types (composition, not automatic API inheritance): [Button](button.md), [Card](card.md), [Dropdown](dropdown.md), [Tag](tag.md), [AutoComplete](auto-complete.md), [Cascader](cascader.md), [ColorPicker](color-picker.md), [Checkbox](checkbox.md), [DatePicker](date-picker.md), [DynamicTags](dynamic-tags.md), [Form](form.md), [Input](input.md), [InputNumber](input-number.md), [InputOtp](input-otp.md), [Mention](mention.md), [Radio](radio.md), [Rate](rate.md), [Select](select.md), [Switch](switch.md), [TimePicker](time-picker.md), [Transfer](transfer.md), [TreeSelect](tree-select.md), [DataTable](data-table.md), [Descriptions](descriptions.md), [Empty](empty.md), [Table](table.md), [Pagination](pagination.md), [Tabs](tabs.md), [Popselect](popselect.md), [Result](result.md), [Skeleton](skeleton.md), [Space](space.md). Referenced framework locale/theme/prop/render types are omitted in this provider scope, not inferred native contracts.


### ConfigProvider Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`abstract`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L26) | Prop | ADAPTED: use an existing native ancestor without an added wrapper; no wrapperless injected context. | 🟢 Verified | Authored DOM identities/ancestry and no-JS composition accepted. |
| [`breakpoints`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L27) | Prop | ADAPTED: explicit author media queries; no root breakpoint map or automatic Grid propagation. | 🟢 Verified | Demo one/two-column layouts at native widths and zoom. |
| [`cls-prefix`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L28) | Prop | External scoped CSS/tokens replace framework style-engine configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`component-options`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L29) | Prop | No framework component-prop bag for `component-options`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`date-locale`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L30) | Prop | No DateLocale dictionary/date-format engine injection; native controls or explicit application Intl formatting instead. | ⏭️ Intentionally omitted | Native lang does not guarantee OS picker language; no null/default date-locale semantics. |
| [`inline-theme-disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L31) | Prop | External scoped CSS/tokens replace framework style-engine configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`katex`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L32) | Prop | No math-rendering runtime dependency. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`locale`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L33) | Prop | ADAPTED: native lang hint, authored text and explicit per-helper labels, not Locale objects or translation. | 🟢 Verified | Changing lang leaves helper snapshots unchanged; explicit French labels affect only one recreated owner. |
| [`namespace`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L34) | Prop | External scoped CSS/tokens replace framework style-engine configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`preflight-style-disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L35) | Prop | No provider preflight flag; scoped recipe adds no document reset. Global Style is separately opt-in and unresolved here. | ⏭️ Intentionally omitted | No global body/style mutation in this recipe. |
| [`style-mount-target`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L36) | Prop | External scoped CSS/tokens replace framework style-engine configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`tag`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L37) | Prop | ADAPTED: author the actual semantic ancestor; no dynamic tag prop/renderer. | 🟢 Verified | Stable section/dialog/control nodes and listeners preserved. |
| [`theme`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L38) | Prop | ADAPTED: scoped external token choices and optional color-scheme; no Theme object merge or null-reset API. | 🟢 Verified | Actual Card/Button/Loading Bar light/dark/system/native appearances and no local reset on unthemed nested scope. |
| [`theme-overrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L39) | Prop | ADAPTED: authored CSS custom properties and real cascade precedence; no ThemeOverrides graph or null-clearing semantics. | 🟢 Verified | Nested/author class/inline/removal behavior and unchanged legacy theme.apply/register. |

### GlobalComponentConfig

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`AutoComplete?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L45) | Configuration field | No framework component-prop bag for `AutoComplete?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig.AutoComplete

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`size?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L46) | Configuration field | No framework component-prop bag for `size?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`Button?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L48) | Configuration field | No framework component-prop bag for `Button?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig.Button

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`size?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L49) | Configuration field | No framework component-prop bag for `size?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`Card?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L51) | Configuration field | No framework component-prop bag for `Card?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig.Card

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`size?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L52) | Configuration field | No framework component-prop bag for `size?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`Cascader?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L54) | Configuration field | No framework component-prop bag for `Cascader?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig.Cascader

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`size?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L55) | Configuration field | No framework component-prop bag for `size?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`renderEmpty?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L56) | Configuration field | No framework component-prop bag for `renderEmpty?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`Checkbox?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L58) | Configuration field | No framework component-prop bag for `Checkbox?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig.Checkbox

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`size?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L59) | Configuration field | No framework component-prop bag for `size?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`ColorPicker?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L61) | Configuration field | No framework component-prop bag for `ColorPicker?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig.ColorPicker

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`size?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L62) | Configuration field | No framework component-prop bag for `size?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`DataTable?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L64) | Configuration field | No framework component-prop bag for `DataTable?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig.DataTable

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`size?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L65) | Configuration field | No framework component-prop bag for `size?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`renderFilter?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L66) | Configuration field | No framework component-prop bag for `renderFilter?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`renderSorter?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L67) | Configuration field | No framework component-prop bag for `renderSorter?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`renderEmpty?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L68) | Configuration field | No framework component-prop bag for `renderEmpty?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`DatePicker?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L70) | Configuration field | No framework component-prop bag for `DatePicker?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig.DatePicker

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`size?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L71) | Configuration field | No framework component-prop bag for `size?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`timePickerSize?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L72) | Configuration field | No framework component-prop bag for `timePickerSize?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`Descriptions?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L74) | Configuration field | No framework component-prop bag for `Descriptions?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig.Descriptions

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`size?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L75) | Configuration field | No framework component-prop bag for `size?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`Dialog?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L77) | Configuration field | No framework component-prop bag for `Dialog?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig.Dialog

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`iconPlacement?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L78) | Configuration field | No framework component-prop bag for `iconPlacement?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`Dropdown?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L80) | Configuration field | No framework component-prop bag for `Dropdown?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig.Dropdown

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`size?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L81) | Configuration field | No framework component-prop bag for `size?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`DynamicInput?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L83) | Configuration field | No framework component-prop bag for `DynamicInput?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig.DynamicInput

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`buttonSize?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L84) | Configuration field | No framework component-prop bag for `buttonSize?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`DynamicTags?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L86) | Configuration field | No framework component-prop bag for `DynamicTags?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig.DynamicTags

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`size?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L87) | Configuration field | No framework component-prop bag for `size?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`Empty?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L89) | Configuration field | No framework component-prop bag for `Empty?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig.Empty

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`description`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L89) | Configuration field | No framework component-prop bag for `description`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`renderIcon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L89) | Render hook | No injected Empty VNode icon callback; author supported native Empty icon/content nodes instead. | ⏭️ Intentionally omitted | Preserve this Pick-expanded identity; no provider render-hook propagation. |

### GlobalComponentConfig

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`Form?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L90) | Configuration field | No framework component-prop bag for `Form?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig.Form

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`size?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L91) | Configuration field | No framework component-prop bag for `size?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`Input?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L93) | Configuration field | No framework component-prop bag for `Input?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig.Input

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`size?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L94) | Configuration field | No framework component-prop bag for `size?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`InputNumber?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L96) | Configuration field | No framework component-prop bag for `InputNumber?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig.InputNumber

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`size?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L97) | Configuration field | No framework component-prop bag for `size?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`InputOtp?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L99) | Configuration field | No framework component-prop bag for `InputOtp?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig.InputOtp

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`size?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L100) | Configuration field | No framework component-prop bag for `size?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`Mention?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L102) | Configuration field | No framework component-prop bag for `Mention?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig.Mention

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`size?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L103) | Configuration field | No framework component-prop bag for `size?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`Pagination?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L105) | Configuration field | No framework component-prop bag for `Pagination?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig.Pagination

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`size?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L106) | Configuration field | No framework component-prop bag for `size?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`inputSize?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L107) | Configuration field | No framework component-prop bag for `inputSize?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`selectSize?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L108) | Configuration field | No framework component-prop bag for `selectSize?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`Popselect?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L110) | Configuration field | No framework component-prop bag for `Popselect?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig.Popselect

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`size?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L111) | Configuration field | No framework component-prop bag for `size?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`Radio?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L113) | Configuration field | No framework component-prop bag for `Radio?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig.Radio

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`size?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L114) | Configuration field | No framework component-prop bag for `size?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`Rate?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L116) | Configuration field | No framework component-prop bag for `Rate?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig.Rate

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`size?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L117) | Configuration field | No framework component-prop bag for `size?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`Result?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L119) | Configuration field | No framework component-prop bag for `Result?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig.Result

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`size?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L120) | Configuration field | No framework component-prop bag for `size?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`Select?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L122) | Configuration field | No framework component-prop bag for `Select?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig.Select

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`size?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L123) | Configuration field | No framework component-prop bag for `size?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`renderEmpty?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L124) | Configuration field | No framework component-prop bag for `renderEmpty?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`Skeleton?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L126) | Configuration field | No framework component-prop bag for `Skeleton?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig.Skeleton

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`size?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L127) | Configuration field | No framework component-prop bag for `size?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`Space?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L129) | Configuration field | No framework component-prop bag for `Space?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig.Space

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`size?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L130) | Configuration field | No framework component-prop bag for `size?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`Switch?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L132) | Configuration field | No framework component-prop bag for `Switch?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig.Switch

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`size?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L133) | Configuration field | No framework component-prop bag for `size?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`Table?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L135) | Configuration field | No framework component-prop bag for `Table?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig.Table

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`size?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L136) | Configuration field | No framework component-prop bag for `size?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`Tabs?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L138) | Configuration field | No framework component-prop bag for `Tabs?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig.Tabs

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`size?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L139) | Configuration field | No framework component-prop bag for `size?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`Tag?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L141) | Configuration field | No framework component-prop bag for `Tag?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig.Tag

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`size?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L142) | Configuration field | No framework component-prop bag for `size?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`TimePicker?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L144) | Configuration field | No framework component-prop bag for `TimePicker?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig.TimePicker

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`size?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L145) | Configuration field | No framework component-prop bag for `size?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`Transfer?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L147) | Configuration field | No framework component-prop bag for `Transfer?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig.Transfer

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`size?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L148) | Configuration field | No framework component-prop bag for `size?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`renderEmpty?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L149) | Configuration field | No framework component-prop bag for `renderEmpty?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`Tree?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L151) | Configuration field | No framework component-prop bag for `Tree?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig.Tree

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`renderEmpty?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L152) | Configuration field | No framework component-prop bag for `renderEmpty?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`TreeSelect?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L154) | Configuration field | No framework component-prop bag for `TreeSelect?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### GlobalComponentConfig.TreeSelect

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`size?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L155) | Configuration field | No framework component-prop bag for `size?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`renderEmpty?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L156) | Configuration field | No framework component-prop bag for `renderEmpty?`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

## Explicit source supplements (22)

These identities come from pinned implementation/type source, **not** extra English API
table rows. Grouped type-boundary rows do not enumerate all transitive component styles,
locale dictionaries or Vue internals as new native APIs. Original owner sections above
remain untouched. There is no additional public SSR/hydration prop inferred from style flags.

### ConfigProvider Props — source-only

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`bordered`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/src/ConfigProvider.ts#L26-L29) | Source prop | No injected boolean default; author supported component attributes or CSS individually. | ⏭️ Intentionally omitted | Not in the English API table; no global prop bag. |
| [`rtl`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/src/ConfigProvider.ts#L34) | Source prop | ADAPTED: native dir and logical CSS, not an RtlProp array or component-style enablement graph. | 🟢 Verified | Chromium inherited RTL/nested/modal and independent LTR sibling; no blanket JS keyboard parity. |
| [`hljs`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/src/ConfigProvider.ts#L39) | Source prop | No highlight.js provider adapter; authored code content uses existing Code contract. | ⏭️ Intentionally omitted | Zero runtime dependencies. |
| [`icons`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/src/ConfigProvider.ts#L44) | Source prop | No injected GlobalIconConfig VNode factories; author supported native icon/content nodes. | ⏭️ Intentionally omitted | No renderer or asset dependency. |
| [`as`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/src/ConfigProvider.ts#L52-L60) | Deprecated source prop | No deprecated dynamic-tag alias; use actual native HTML. | ⏭️ Intentionally omitted | Source deprecation kept explicit, not promoted to new API. |

### ConfigProvider Slots — source-only

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/src/ConfigProvider.ts#L233-L242) | Source slot | ADAPTED: actual authored children under the chosen ancestor; no Vue slot callback/projection. | 🟢 Verified | Stable native child identity, listeners, value, modal parent and no-JS anatomy. |

### GlobalTheme — source fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`name`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/src/interface.ts#L10) | Source type field | No GlobalTheme identity/hash contract; author classes or unchanged legacy theme names instead. | ⏭️ Intentionally omitted | CSS capability does not imply type compatibility. |
| [`common?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/src/interface.ts#L11) | Source type field | No ThemeCommonVars graph; supported --mui-* CSS properties are a different contract. | ⏭️ Intentionally omitted | Only actual demo consumers verified. |

### GlobalThemeOverrides — source fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`common?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/src/interface.ts#L15) | Source type field | No Partial common/custom-theme object merger; native cascade overrides instead. | ⏭️ Intentionally omitted | No null-clearing or deep-merge semantics. |
| [`[key in keyof GlobalThemeWithoutCommon]?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/src/interface.ts#L17-L19) | Source mapped field | No per-component extracted theme/peer graph forwarding. | ⏭️ Intentionally omitted | Author only each component's documented CSS hooks. |

### Source type and internal boundaries

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`CustomThemeCommonVars`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/src/interface.ts#L7) | Source extension interface | No framework theme declaration-merging extension; author CSS names instead. | ⏭️ Intentionally omitted | Not a ThemeTokens alias. |
| [`ConfigProviderInjection`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/src/internal-interface.ts#L381-L400) | Internal source interface boundary | No computed refs, theme hash, injected options or nonreactive mounting/preflight controls. | ⏭️ Intentionally omitted | Explicit native hosts/options and external styles, no global app/SSR/hydration manager. |
| [`RtlProp`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/src/internal-interface.ts#L373) | Source type alias | No RtlItem array acceptance; native dir is not this source type. | ⏭️ Intentionally omitted | Source-only rtl capability above is deliberately narrower. |
| [`GlobalIconConfig`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/src/internal-interface.ts#L347-L366) | Source interface boundary | All 18 optional VNode icon callbacks omitted as a group; authored nodes instead. | ⏭️ Intentionally omitted | No injected icon factory bag or renderer. |
| [`Breakpoints`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/src/internal-interface.ts#L379) | Source type alias | No Record mapping/type export; author media/container queries explicitly. | ⏭️ Intentionally omitted | Responsive native capability does not expose this object. |
| [`ThemeCommonVars`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/src/interface.ts#L5) | Source re-export boundary | No transitive framework common-style interface; native supported CSS tokens instead. | ⏭️ Intentionally omitted | Do not infer full palette parity. |
| [`GlobalThemeWithoutCommon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/src/internal-interface.ts#L136) | Source interface boundary | No transitive per-component theme registry/peer styling objects. | ⏭️ Intentionally omitted | Existing component CSS stays independently owned. |
| [`ConfigProviderProps`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/src/ConfigProvider.ts#L63-L65) | Source type alias | No Vue ExtractPropTypes/Partial provider props export. | ⏭️ Intentionally omitted | No new config runtime/types entry. |

### RtlItem — source fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`name`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/src/internal-interface.ts#L369) | Source type field | No component-key RTL registration; use native dir where appropriate. | ⏭️ Intentionally omitted | Direction behavior remains component-specific. |
| [`style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/src/internal-interface.ts#L370) | Source type field | No CSS-render CNode injection; external logical-property CSS instead. | ⏭️ Intentionally omitted | No runtime style mounting. |
| [`peers?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/src/internal-interface.ts#L371) | Source type field | No recursive peer component-style graph. | ⏭️ Intentionally omitted | Native inheritance is DOM-based, not a component graph. |

### config.ts — source constant

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`defaultBreakpoints`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/src/config.ts#L1-L8) | Source constant | No xs/s/m/l/xl/xxl map export; choose application layout breakpoints explicitly. | ⏭️ Intentionally omitted | Demo uses its own 56rem media query, not upstream numerical parity. |

<!-- END PINNED API INVENTORY -->
