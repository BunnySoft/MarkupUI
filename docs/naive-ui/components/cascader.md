# Cascader

**Plan: Planned. Current baseline: partial widgets plugin; not parity-verified.**

## Baseline and target

[B1: widgets.ts](../../../src/plugins/widgets.ts) renders cascading native selects from `options` and maintains a selected path.

- **HTML:** labelled native select per hierarchy level, with static hierarchical fallback.
- **JS:** stable keys, clearing descendants and optional cancellable lazy loading.
- **CSS:** responsive level arrangement; richer popup styling is independent.
- **Placement:** proposed `src/optional/cascader/`.

## Acceptance and gaps

Test empty levels, changed parents, duplicate keys, disabled nodes and async races. Search, check strategies, multi-select and virtual rendering need separate decisions rather than assuming the current path array is equivalent.

## Upstream implementation evidence

Only shared selection/floating internals received targeted review; see [select-menu behavior](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_internal/select-menu/src/SelectMenu.tsx#L140-L340). This informs enabled-option/focus tests but does not verify Cascader's hierarchical loading or checking rules. Keep its controller-level and per-property implementation review **Not reviewed** rather than inferring parity from a shared helper.

## Migration steps

**Delivery phase:** P5 — hierarchical collections. **Task state:** 🔵 Planned.
**Prerequisites:** P4 Select, P5 stable keys and P3 popup focus if enhanced in the [master plan](../migration-plan.md).
**Next task:** define the path-value contract and parent-change behavior for the existing cascading native selects.

1. [ ] **Stabilize hierarchy identity.** Specify option keys, labels, disabled nodes and descendant clearing when a parent changes.
2. [ ] **Preserve the native fallback.** Keep one labelled select per level and make empty levels and partial paths explicit.
3. [ ] **Stage richer selection.** Separate lazy loading, search, multiple selection and checking strategies; cancel obsolete branch requests.
4. [ ] **Verify path mutations.** Test duplicate keys, replaced parents, loading failures and keyboard/focus transitions before adding popup-only features.

### Native primitives and fallback

- **Native path:** labelled native selects per level, adopted by a small light-DOM custom element, replace a complex hierarchy popup for the baseline. Option nodes/templates are created only for changed levels.
- **Small enhancement:** use AbortController for optional branch requests and clean up on disconnect. CSS grid/flex/container queries arrange levels with ordinary stacked-select fallback. Feature-detect any richer popover path; unsupported capability means retaining native selects, not loading a cascader framework.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/cascader)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **54 local table rows + 15 supplementary declarations + 0 inherited rows = 69 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.

Referenced public component types (composition, not automatic API inheritance): [Tree](tree.md), [Popover](popover.md), [Scrollbar](scrollbar.md). Opaque types without local member definitions remain unreviewed.


### Cascader Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`allow-checking-not-loaded`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L28) | Prop | Candidate presence attribute `allow-checking-not-loaded`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`cascade`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L29) | Prop | Candidate explicit JS `cascade` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`check-strategy`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L30) | Prop | Candidate explicit JS `checkStrategy` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`children-field`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L31) | Prop | Candidate `children-field` attribute or JS `childrenField`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`clearable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L32) | Prop | Candidate presence attribute `clearable`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`clear-filter-after-select`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L33) | Prop | Candidate explicit JS `clearFilterAfterSelect` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`default-value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L34) | Prop | Candidate native default/reset state for `default-value`; distinguish live state and defaults. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L35) | Prop | Candidate presence attribute `disabled`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`disabled-field`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L36) | Prop | Candidate `disabled-field` attribute or JS `disabledField`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`ellipsis-tag-popover-props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L37) | Prop | Candidate explicit native-child configuration for `ellipsis-tag-popover-props`; no unrestricted prop forwarding. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`expand-trigger`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L38) | Prop | Candidate `expand-trigger` attribute or JS `expandTrigger`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`filterable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L39) | Prop | Candidate explicit JS `filterable` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`filter`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L40) | Prop | Candidate explicit JS `filter` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`filter-menu-props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L41) | Prop | Candidate explicit native-child configuration for `filter-menu-props`; no unrestricted prop forwarding. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`get-column-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L42) | Prop | External CSS class/custom property for `get-column-style`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`value-field`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L43) | Prop | Candidate live JS `valueField` state; native value/default/event contract needs review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`label-field`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L44) | Prop | Candidate `label-field` attribute or JS `labelField`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`max-tag-count`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L45) | Prop | Candidate `max-tag-count` attribute or JS `maxTagCount`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`menu-props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L46) | Prop | Candidate explicit native-child configuration for `menu-props`; no unrestricted prop forwarding. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`multiple`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L47) | Prop | Candidate presence attribute `multiple`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`options`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L48) | Prop | Candidate JS `options` data property or authored children; shape and identity not reviewed. | ⚪ Not reviewed | B1 nested native-select options; partial only, verify this row. |
| [`placeholder`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L49) | Prop | Candidate `placeholder` attribute or JS `placeholder`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`placement`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L50) | Prop | Candidate explicit JS `placement` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`remote`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L51) | Prop | Candidate presence attribute `remote`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render-prefix`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L52) | Prop | Candidate authored `render-prefix` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render-label`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L53) | Prop | Candidate authored `render-label` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render-suffix`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L54) | Prop | Candidate authored `render-suffix` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`scrollbar-props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L55) | Prop | Candidate explicit native-child configuration for `scrollbar-props`; no unrestricted prop forwarding. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`separator`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L56) | Prop | Candidate `separator` attribute or JS `separator`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`show`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L57) | Prop | Candidate live JS `show` state; native value/default/event contract needs review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`show-path`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L58) | Prop | Candidate live JS `showPath` state; native value/default/event contract needs review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L59) | Prop | External CSS token/class for `size`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`spin-props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L60) | Prop | Candidate explicit native-child configuration for `spin-props`; no unrestricted prop forwarding. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`status`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L61) | Prop | Candidate `status` attribute or JS `status`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`to`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L62) | Prop | Candidate explicit JS `to` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L63) | Prop | Candidate JS `value` data property or authored children; shape and identity not reviewed. | ⚪ Not reviewed | B1 path string array; semantics differ; partial only, verify this row. |
| [`virtual-scroll`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L64) | Prop | Candidate explicit JS `virtualScroll` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-blur`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L65) | Callback | Candidate DOM `mui:blur` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-focus`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L66) | Callback | Candidate DOM `mui:focus` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-load`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L67) | Callback | Explicit `on-load` function/before-event contract needed; preserve return/cancellation semantics. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-update:show`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L68) | Callback | Candidate DOM `mui:change:show` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-update:value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L69) | Callback | Candidate DOM `mui:change` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### CascaderOption Properties

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`label`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L75) | Record field | Candidate plain-JS `label` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L76) | Record field | Candidate plain-JS `value` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`disabled?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L77) | Record field | Candidate plain-JS `disabled?` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`children?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L78) | Record field | Candidate plain-JS `children?` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Cascader Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`action`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L84) | Slot | Candidate authored `action` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`arrow`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L85) | Slot | Candidate authored `arrow` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`empty`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L86) | Slot | Candidate authored `empty` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`not-found`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L87) | Slot | Candidate authored `not-found` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Cascader Methods

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`blur`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L93) | Method | Candidate plain-JS `blur` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`focus`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L94) | Method | Candidate plain-JS `focus` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`getCheckedData`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L95) | Method | Candidate plain-JS `getCheckedData` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`getIndeterminateData`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L96) | Method | Candidate plain-JS `getIndeterminateData` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Cascader Props: get-column-style inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`get-column-style.level`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L42) | Inline record field | External CSS class/custom property for `get-column-style.level`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |

### Cascader Props: render-prefix inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`render-prefix.option`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L52) | Inline record field | Candidate authored `render-prefix.option` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render-prefix.node`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L52) | Inline record field | Candidate authored `render-prefix.node` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render-prefix.checked`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L52) | Inline record field | Candidate authored `render-prefix.checked` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Cascader Props: render-suffix inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`render-suffix.option`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L54) | Inline record field | Candidate authored `render-suffix.option` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render-suffix.node`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L54) | Inline record field | Candidate authored `render-suffix.node` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render-suffix.checked`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L54) | Inline record field | Candidate authored `render-suffix.checked` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Cascader Props: spin-props inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`spin-props.strokeWidth?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L60) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`spin-props.stroke?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L60) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`spin-props.scale?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L60) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`spin-props.radius?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L60) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Cascader Methods: getCheckedData inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`getCheckedData.keys`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L95) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`getCheckedData.options`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L95) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Cascader Methods: getIndeterminateData inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`getIndeterminateData.keys`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L96) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`getIndeterminateData.options`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md#L96) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
