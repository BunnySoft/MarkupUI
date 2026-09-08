# Pagination

**Plan: 🟢 Verified retained native paging scope; 19 explicit omissions.**

## Baseline and target

[B1: navigation.ts](../../../src/components/navigation.ts) remains the historical every-page
legacy pager. Its `count` means page count, not item count. The new
[optional helper/model](../../../src/components/pagination/) uses native authored navigation,
keyed page-button templates, real disabled controls, bounded windows and validated auxiliary
controls; [external CSS](../../../src/components/pagination/pagination.css) owns presentation.
No legacy source or registration is changed. See the
[canonical contract and acceptance](../../components/pagination.md).

## Acceptance and gaps

80 targeted tests, build/budgets and Chromium cover safe totals, zero/shrink/huge windows,
native keyboard/forms, size clamp, invalid drafts, focus, ownership and cleanup. Server-authored
links stay native; enhanced numbered actions are buttons, not URL-generating router links.
No range dropdown, VNode renderer, provider or mandatory Select/InputNumber dependency.

## Migration steps

**Delivery phase:** P3 — navigation. **Task state:** 🟢 Verified retained scope.
**Prerequisites:** P1 native buttons and P0 numeric/event contracts in the [master plan](../migration-plan.md).
**Next task:** Steps; remaining P3 inventories are not complete.

1. [x] **Define pagination math.** Safe integers, item-count precedence, defaults, empty state and silent clamp.
2. [x] **Bound rendered controls.** At most 5–31 keyed page/gap buttons, native previous/next and aria-current.
3. [x] **Scope auxiliary entry.** Native size select, commit-only quick-jump validity and precise request/change events.
4. [x] **Test changing counts.** Huge totals, native forms/keyboard, focus after shrink, lifecycle and external labels.

### Native primitives and fallback

- **Native path:** named nav with real server links and authored button/select/input semantics.
- **Small enhancement:** an explicit controller adopts native templates in one owned dynamic
  region. No custom element/renderer framework. Baseline server links stay usable without JS;
  authors reveal initially hidden JS-only controls after successful connection.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/pagination)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination)
- [Catalog and provenance](../index.md) · [Architecture and statuses](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`;
historical MarkupUI baseline **5dcb190 / 0.11.0**.
Inventory: **32 original table rows + 10 original supplementary declarations + 13 explicit
source supplements + 0 inherited rows = 55 tracker rows**. All **42 original owner/name/
source identities** remain. **36 Verified adapted targets; 19 intentionally omitted targets.**
Pinned Markdown, Pagination.tsx, utils.ts, interface.ts and public-types.ts were reviewed.

Source observations inform, but do not define, parity: itemCount takes precedence; effective
count is at least one; page size clamps the current page rather than resetting it. Source
fast-jump dropdowns build omitted-range option arrays; this target intentionally does not.
Its bounded window, stricter native quick-jump validity, state snapshots and single combined
change event are explicit adaptations. Referenced [Select](select.md) and [Scrollbar](scrollbar.md)
types are not inherited runtime contracts.

### Pagination Props

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`default-page`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L29) | Prop | Initial-only defaultPage seed. | 🟢 Verified | Explicit page wins; no automatic form-reset binding. |
| [`default-page-size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L30) | Prop | Initial-only defaultPageSize seed. | 🟢 Verified | Live size, then default, authored select value, then 10. |
| [`disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L31) | Prop | set({ disabled }) with native disabled controls. | 🟢 Verified | Author disabled/fieldset state preserved; focused disabling has safe fallback. |
| [`display-order`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L32) | Prop | Authored DOM order and CSS wrapping. | 🟢 Verified | No runtime array sorting or visual-only order reversal. |
| [`goto`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L33) | Prop | Authored jump label and Go button text. | 🟢 Verified | No VNode callback. |
| [`item-count`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L34) | Prop | Nonnegative safe itemCount, precedence over pageCount. | 🟢 Verified | Zero/MAX_SAFE/index bounds tested; null clears. |
| [`next`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L35) | Prop | Named authored next button children. | 🟢 Verified | Stable native control; no renderer. |
| [`prev`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L36) | Prop | Named authored previous button children. | 🟢 Verified | Native boundary disabling. |
| [`label`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L37) | Prop | Page/gap templates with safe number text. | 🟢 Verified | Author accessible words; numeric/VNode renderer not forwarded. |
| [`page-count`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L38) | Prop | Nonnegative safe pageCount, distinct from itemCount. | 🟢 Verified | Legacy count unchanged; known/unknown item indices explicit. |
| [`page-sizes`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L39) | Prop | Authored unique positive-decimal option values/labels. | 🟢 Verified | No option-object renderer; native disabled options. |
| [`page-size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L40) | Prop | Silent pageSize field/set; native select user changes. | 🟢 Verified | Retain page then clamp; one combined user event. |
| [`page-slot`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L41) | Prop | pageSlot 5–31, default 9, counting page/gap buttons. | 🟢 Verified | O(slot) window and no omitted-range arrays. |
| [`page`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L42) | Prop | Positive safe page field/set, clamped to effective count. | 🟢 Verified | Silent assignment/shrink, not a controlled Vue prop or router. |
| [`prefix`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L43) | Prop | Authored prefix; read controller.state for app-owned text updates. | 🟢 Verified | Original nodes/listeners retained. |
| [`scrollbar-props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L44) | Prop | Native controls/overflow instead. | ⏭️ Intentionally omitted | No popup Scrollbar dependency/prop forwarding. |
| [`select-props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L45) | Prop | Native select attributes directly. | ⏭️ Intentionally omitted | No mandatory Select or unrestricted prop forwarding. |
| [`show-quick-jumper`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L46) | Prop | Include/hide authored jump/go pair, refresh for replacements. | 🟢 Verified | Commit-only native validity and form-safe Enter. |
| [`show-quick-jump-dropdown`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L47) | Prop | Gap buttons jump to omitted boundary. | ⏭️ Intentionally omitted | No hover menu, omitted-range objects or Dropdown dependency. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L48) | Prop | External small/medium/large classes/tokens. | 🟢 Verified | Native wrap, focus, RTL and zoom. |
| [`simple`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L49) | Prop | Native hidden page region, authored jump/count view. | 🟢 Verified | Auxiliary order/presence stays authored; no hidden focusable pages. |
| [`suffix`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L50) | Prop | Authored suffix and state snapshot. | 🟢 Verified | No generated content or renderer. |
| [`show-size-picker`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L51) | Prop | Include/hide native labelled select. | 🟢 Verified | Single select anatomy, validated current size. |
| [`to`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L52) | Prop | Keep controls in authored hierarchy. | ⏭️ Intentionally omitted | No popup teleport/portal. |
| [`on-update:page`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L53) | Callback | Cancelable request then combined mui:pagination-change snapshot. | 🟢 Verified | User-only changed requests; silent programmatic updates. |
| [`on-update:page-size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L54) | Callback | Same combined event with source=size and previous/current state. | 🟢 Verified | No fabricated separate page click during size clamp. |

### Pagination Slots

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`goto`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L91) | Slot | Authored label/Go text. | 🟢 Verified | No native slot projection or callback. |
| [`label`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L92) | Slot | Explicit page/gap templates. | 🟢 Verified | Numeric span text; no VNode parameter object. |
| [`next`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L93) | Slot | Authored typed next button; state snapshot available. | 🟢 Verified | Parameters adapted to explicit reads, not invoked slots. |
| [`prev`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L94) | Slot | Authored typed previous button; state snapshot available. | 🟢 Verified | Nodes/labels/listeners preserved. |
| [`prefix`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L95) | Slot | Author region and explicit state reads. | 🟢 Verified | No reactive renderer. |
| [`suffix`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L96) | Slot | Author region and explicit state reads. | 🟢 Verified | No reactive renderer. |

### PaginationRenderLabel input

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`type`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L62) | Record field | Separate authored page/gap templates instead. | ⏭️ Intentionally omitted | No render input record. |
| [`node`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L63) | Record field | Numeric span text, no VNode values. | ⏭️ Intentionally omitted | Renderer/VNode union not reproduced. |
| [`active`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L64) | Record field | Native current/focus state styling. | ⏭️ Intentionally omitted | No hover/render callback field. |

### Render callback type

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`PaginationRenderLabel`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L59) | Render hook | Native authored templates. | ⏭️ Intentionally omitted | No VNode-producing hook/type compatibility. |

### PaginationInfo

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`startIndex`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L78) | Record field | State zero-based start for known item count; otherwise null. | 🟢 Verified | No unsafe synthetic pageCount × size values. |
| [`endIndex`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L79) | Record field | Inclusive end, -1 when empty; null for unknown records. | 🟢 Verified | Safe maximum integer arithmetic. |
| [`page`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L80) | Record field | Accepted state.page. | 🟢 Verified | Snapshot, not source slot argument invocation. |
| [`pageSize`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L81) | Record field | Accepted state.pageSize. | 🟢 Verified | Native select/programmatic contract above. |
| [`pageCount`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L82) | Record field | Effective count at least 1, separate empty flag. | 🟢 Verified | Distinct from legacy count and raw item count. |
| [`itemCount`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/demos/enUS/index.demo-entry.md#L83) | Record field | Explicit known count or null. | 🟢 Verified | No fabricated unknown record count. |

### Pagination explicit source-only supplements

These thirteen additions retain source-only declarations/aliases without inventing public
Markdown rows or expanding opaque Select types.

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`defaultPageCount`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/src/Pagination.tsx#L76-L79) | Source prop | Use explicit initial pageCount. | ⏭️ Intentionally omitted | Source default declaration is not consumed by its count computation. |
| [`onUpdatePage`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/src/Pagination.tsx#L113-L115) | Source callback alias | One native request/change contract. | ⏭️ Intentionally omitted | No duplicate alias calls. |
| [`onUpdatePageSize`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/src/Pagination.tsx#L119-L121) | Source callback alias | Combined size/page event. | ⏭️ Intentionally omitted | No alias arrays. |
| [`onPageSizeChange`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/src/Pagination.tsx#L123-L125) | Deprecated callback | Use native change event contract. | ⏭️ Intentionally omitted | Deprecated alias not added. |
| [`onChange`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/src/Pagination.tsx#L127) | Deprecated callback | Use native change event contract. | ⏭️ Intentionally omitted | Legacy core event is not changed. |
| [`useTheme.props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/src/Pagination.tsx#L67) | Source theme group | External scoped CSS. | ⏭️ Intentionally omitted | No provider/CSS-in-JS theme objects. |
| [`PaginationProps`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/src/Pagination.tsx#L130) | Source public type | Native options/controller types. | ⏭️ Intentionally omitted | No Vue extracted-prop compatibility. |
| [`PaginationSlots`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/src/Pagination.tsx#L132-L140) | Source slot type | Authored anatomy. | ⏭️ Intentionally omitted | No VNode callback record. |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/src/Pagination.tsx#L133) | Source slot declaration | Arbitrary authored surrounding content. | ⏭️ Intentionally omitted | Source declares but does not invoke a default slot in the inspected render. |
| [`PaginationSizeOption`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/src/interface.ts#L15) | Source option alias | Native option value/label/disabled instead of SelectBaseOption objects. | 🟢 Verified | Strict unique numeric values; authored native option content. |
| [`RenderPrefix` / `RenderSuffix` / `RenderNext` / `RenderPrev` / `RenderGoto`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/src/interface.ts#L6-L19) | Source render type group | Author regions plus explicit state reads. | ⏭️ Intentionally omitted | No VNode return signatures. |
| [`PaginationLabelInfo`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/src/interface.ts#L35) | Source render input alias | Explicit template/current state. | ⏭️ Intentionally omitted | Render record already excluded above. |
| [`PaginationSize`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/pagination/src/public-types.ts#L1) | Source visual type | Small/medium/large external classes. | 🟢 Verified | Native CSS presentation rather than prop forwarding. |

<!-- END PINNED API INVENTORY -->
