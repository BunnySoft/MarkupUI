# Pagination

**Plan: Planned. Current baseline: partial page/count core pager.**

## Baseline and target

[B1: navigation.ts](../../../src/components/navigation.ts) renders every page, clamps page setters and emits change.

- **HTML:** labelled navigation with native links/buttons and `aria-current`.
- **JS:** bounded page window, page-size/quick-jump validation and explicit change events.
- **CSS:** external compact/disabled/current layout.
- **Placement:** proposed `src/components/pagination/`.

## Acceptance and gaps

Test zero results, shrinking counts, large page counts, invalid quick jumps and keyboard. Current `count` means page count, not upstream item count; mapping must not silently conflate them.

## Migration steps

**Delivery phase:** P3 — navigation. **Task state:** 🔵 Planned.
**Prerequisites:** P1 native buttons and P0 numeric/event contracts in the [master plan](../migration-plan.md).
**Next task:** reconcile existing `count` as page count and keep it distinct from item count.

1. [ ] **Define pagination math.** Resolve page/page-size/count defaults, zero-result behavior and bounds after data shrinks.
2. [ ] **Bound rendered controls.** Implement a stable page window, previous/next controls and accessible current-page indication.
3. [ ] **Scope auxiliary entry.** Add page-size and quick-jump controls only with explicit input validation and event ownership.
4. [ ] **Test changing counts.** Cover huge page totals, invalid jumps, locale labels and keyboard focus as visible page buttons change.

### Native primitives and fallback

- **Native path:** labelled navigation with real links/buttons, native page-size select and numeric quick-jump input. A native template may create a bounded keyed page-button window.
- **Small enhancement:** a small custom element handles page arithmetic and cleans listeners; CSS flex/gap/container queries provide layout with wrapping fallback. When enhancement is absent, server-backed links/forms still paginate. No router, reactive pager renderer or browser-control polyfill is required.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/pagination)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **32 local table rows + 10 supplementary declarations + 0 inherited rows = 42 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.

Referenced public component types (composition, not automatic API inheritance): [Select](select.md), [Scrollbar](scrollbar.md). Opaque types without local member definitions remain unreviewed.


### Pagination Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default-page`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L29) | Prop | Candidate native default/reset state for `default-page`; distinguish live state and defaults. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`default-page-size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L30) | Prop | Candidate native default/reset state for `default-page-size`; distinguish live state and defaults. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L31) | Prop | Candidate presence attribute `disabled`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`display-order`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L32) | Prop | Candidate JS `displayOrder` data property or authored children; shape and identity not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`goto`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L33) | Prop | Candidate authored `goto` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`item-count`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L34) | Prop | Candidate `item-count` attribute or JS `itemCount`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`next`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L35) | Prop | Candidate authored `next` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`prev`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L36) | Prop | Candidate authored `prev` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`label`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L37) | Prop | Candidate `label` attribute or JS `label`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`page-count`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L38) | Prop | Retain current count as page count; explicit alias/migration, distinct from item-count. | 🔵 Planned | B1 count attribute means page count; partial only, verify this row. |
| [`page-sizes`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L39) | Prop | Candidate JS `pageSizes` data property or authored children; shape and identity not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`page-size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L40) | Prop | Candidate `page-size` attribute or JS `pageSize`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`page-slot`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L41) | Prop | Candidate `page-slot` attribute or JS `pageSlot`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`page`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L42) | Prop | Candidate `page` attribute or JS `page`; exact target contract not reviewed. | ⚪ Not reviewed | B1 clamped page and mui:change; partial only, verify this row. |
| [`prefix`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L43) | Prop | Candidate authored `prefix` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`scrollbar-props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L44) | Prop | Candidate explicit native-child configuration for `scrollbar-props`; no unrestricted prop forwarding. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`select-props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L45) | Prop | Candidate explicit native-child configuration for `select-props`; no unrestricted prop forwarding. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`show-quick-jumper`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L46) | Prop | Candidate live JS `showQuickJumper` state; native value/default/event contract needs review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`show-quick-jump-dropdown`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L47) | Prop | Candidate live JS `showQuickJumpDropdown` state; native value/default/event contract needs review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L48) | Prop | External CSS token/class for `size`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`simple`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L49) | Prop | Candidate presence attribute `simple`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`suffix`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L50) | Prop | Candidate authored `suffix` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`show-size-picker`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L51) | Prop | Candidate live JS `showSizePicker` state; native value/default/event contract needs review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`to`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L52) | Prop | Candidate explicit JS `to` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-update:page`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L53) | Callback | Candidate DOM `mui:change:page` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-update:page-size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L54) | Callback | Candidate DOM `mui:change:page-size` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Pagination Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`goto`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L91) | Slot | Candidate authored `goto` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`label`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L92) | Slot | Candidate authored `label` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`next`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L93) | Slot | Candidate authored `next` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`prev`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L94) | Slot | Candidate authored `prev` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`prefix`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L95) | Slot | Candidate authored `prefix` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`suffix`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L96) | Slot | Candidate authored `suffix` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### PaginationRenderLabel input

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`type`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L62) | Record field | Candidate plain-JS `type` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`node`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L63) | Record field | Candidate plain-JS `node` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`active`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L64) | Record field | Candidate plain-JS `active` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Render callback type

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`PaginationRenderLabel`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L59) | Render hook | Candidate authored `PaginationRenderLabel` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### PaginationInfo

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`startIndex`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L78) | Record field | Candidate plain-JS `startIndex` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`endIndex`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L79) | Record field | Candidate plain-JS `endIndex` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`page`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L80) | Record field | Candidate plain-JS `page` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`pageSize`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L81) | Record field | Candidate plain-JS `pageSize` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`pageCount`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L82) | Record field | Retain current count as page count; explicit alias/migration, distinct from item-count. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`itemCount`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L83) | Record field | Candidate plain-JS `itemCount` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
