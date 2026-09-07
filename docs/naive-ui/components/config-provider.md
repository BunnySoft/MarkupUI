# Config Provider

**Plan: Planned for scoped native configuration; framework/theme-engine surfaces intentionally omitted. Current baseline: theme API.**

## Baseline and target

[B1: theme API](../../../src/theme/index.ts) manages themes and writes CSS properties; [B2: foundation.ts](../../../src/components/foundation.ts) supplies `mui-theme`.

- **HTML:** inherited `lang`/`dir`, root classes and optional explicit config root.
- **JS:** small scoped locale/service configuration, not dependency injection or component-prop passthrough.
- **CSS:** external themes/tokens and breakpoints; remove mandatory CSS-in-JS.
- **Placement:** proposed `src/core/` configuration plus `src/styles/`; no new provider framework.

## Acceptance and gaps

Test nested roots, locale/direction changes, strict CSP and disposal. KaTeX, generated class prefixes, style-mount targets and upstream theme-object graphs are not required compatibility surfaces.

## Upstream implementation evidence

Targeted review of [configuration source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider) and RTL plumbing found framework-scoped configuration; the English API table does not expose a stable general RTL prop. Do not invent one from internal source. MarkupUI should inherit native `dir` and use logical CSS from the first retained implementation, while per-component keyboard/direction behavior remains subject to acceptance tests.

## Migration steps

**Delivery phase:** P0 — scoped configuration; framework-provider APIs remain excluded. **Task state:** 🔵 Planned.
**Prerequisites:** zero-dependency/CSP constraints and ownership decisions in the [master plan](../migration-plan.md).
**Next task:** separate inherited lang/dir/theme CSS from optional explicit service configuration.

1. [ ] **Define native inheritance.** Use root lang/dir/classes and scoped CSS tokens rather than framework injection.
2. [ ] **Reconcile current theme APIs.** Preserve compatibility while adding external named themes and clear strict-CSP boundaries.
3. [ ] **Resolve provider-only fields.** Explicitly omit KaTeX, generated class/style-mount machinery and component-prop bags.
4. [ ] **Test configuration scope.** Cover nested roots, locale/direction changes, multiple documents and disposal without an imported provider runtime.

### Native primitives and fallback

- **Native path:** inherited lang/dir, root classes and external CSS custom properties/media queries replace framework configuration injection. Explicit services receive ordinary root/document options.
- **Small enhancement:** feature-detect retained Intl/CSS capabilities and use supplied locale labels/basic styles when unavailable. If a config custom element is justified, it owns only scoped listeners and disposes them; no Shadow DOM requirement, component-prop bag, template evaluator or provider polyfill is introduced.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/config-provider)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **14 local table rows + 81 supplementary declarations + 0 inherited rows = 95 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.

Referenced public component types (composition, not automatic API inheritance): [Button](button.md), [Card](card.md), [Dropdown](dropdown.md), [Tag](tag.md), [AutoComplete](auto-complete.md), [Cascader](cascader.md), [ColorPicker](color-picker.md), [Checkbox](checkbox.md), [DatePicker](date-picker.md), [DynamicTags](dynamic-tags.md), [Form](form.md), [Input](input.md), [InputNumber](input-number.md), [InputOtp](input-otp.md), [Mention](mention.md), [Radio](radio.md), [Rate](rate.md), [Select](select.md), [Switch](switch.md), [TimePicker](time-picker.md), [Transfer](transfer.md), [TreeSelect](tree-select.md), [DataTable](data-table.md), [Descriptions](descriptions.md), [Empty](empty.md), [Table](table.md), [Pagination](pagination.md), [Tabs](tabs.md), [Popselect](popselect.md), [Result](result.md), [Skeleton](skeleton.md), [Space](space.md). Opaque types without local member definitions remain unreviewed.


### ConfigProvider Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`abstract`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L26) | Prop | Candidate presence attribute `abstract`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`breakpoints`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L27) | Prop | Candidate JS `breakpoints` data property or authored children; shape and identity not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`cls-prefix`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L28) | Prop | External scoped CSS/tokens replace framework style-engine configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`component-options`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L29) | Prop | No framework component-prop bag for `component-options`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`date-locale`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L30) | Prop | Candidate explicit JS `dateLocale` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`inline-theme-disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L31) | Prop | External scoped CSS/tokens replace framework style-engine configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`katex`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L32) | Prop | No math-rendering runtime dependency. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`locale`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L33) | Prop | Candidate explicit JS `locale` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`namespace`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L34) | Prop | External scoped CSS/tokens replace framework style-engine configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`preflight-style-disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L35) | Prop | External CSS class/custom property for `preflight-style-disabled`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`style-mount-target`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L36) | Prop | External scoped CSS/tokens replace framework style-engine configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`tag`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L37) | Prop | Candidate `tag` attribute or JS `tag`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`theme`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L38) | Prop | External scoped CSS/tokens replace framework style-engine configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`theme-overrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L39) | Prop | External scoped CSS/tokens replace framework style-engine configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

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
| [`renderIcon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/demos/enUS/index.demo-entry.md#L89) | Render hook | Candidate authored `renderIcon` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

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

<!-- END PINNED API INVENTORY -->
