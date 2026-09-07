# Flex

**Migration status: 🟢 Verified retained CSS-only native Flex scope.**
No runtime, child wrapping/traversal, reverse-order helper or automatic role is introduced.

## Baseline and target

[A1: retained contract and acceptance](../../components/flex.md) and
[S1: native Flex CSS](../../../src/components/flex/flex.css) implement the new slice.
[B1: styles.ts](../../../src/components/styles.ts) still styles unchanged legacy row/stack/wrap wrappers.

- **HTML:** ordinary containers in logical reading order.
- **JS:** none for layout.
- **CSS:** external flex direction, wrap, gap, alignment and responsive rules.
- **Placement:** `src/components/flex/flex.css`; stylesheet-only export `@dataengine/markup-ui/flex/style.css`.

## Acceptance and gaps

A1 records **362 passing tests** (11 focused), build/export gates and Chromium preset/
tuple gap dimensions, wrap/vertical/inline/alignment, native list markers/forms/focus/hidden,
narrow/grid/RTL/zoom/print and legacy coexistence. CSS is **390 gzip bytes / 1,000 ceiling**;
core stays 14,611/15,000. Source-only reverse is omitted; native DOM order stays authoritative.
Old-browser flex-gap spacing has no detector/polyfill; no renderer or theme object is transplanted.

## Migration steps

**Delivery phase:** P2 — layout. **Task state:** 🟢 Verified retained native scope.
**Prerequisites:** P0 external CSS/logical-direction conventions in the [master plan](../migration-plan.md).
**Next task:** coordinator selection of Space, then Grid and Layout; P2 remains incomplete.

1. [x] **Define child layout.** A1/S1 preserve original nodes, order, list markers and native controls without role changes, wrappers, flattening or empty-container removal.
2. [x] **Resolve CSS properties.** Exact preset row/column gaps, [horizontal,vertical] tuple mapping, native align/justify and source-compatible vertical nowrap; no parser or reverse helper.
3. [x] **Specify responsive behavior.** Native flex/wrap/min-inline-size and application CSS handle responsive layout; no observer, breakpoint state or gap-support detection.
4. [x] **Test layout extremes.** A1 verifies nested gaps/hidden roots/items, narrow grid text, native GET/reset/focus, RTL/zoom/print and unchanged legacy composition.

### Native primitives and fallback

- **Native path:** ordinary authored elements with CSS flexbox, gap, wrap and logical properties. No custom element, template cloning or layout controller is required.
- **Small enhancement:** none. Native gap/layout and explicit classes/tokens are sufficient;
  applications may add media rules. Old browsers may lose gap spacing or fall back to native
  flow; no JS detector, generic query framework or layout polyfill is promised.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/flex)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/flex/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/flex)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Inventory: **7 original public rows + 6 explicit source supplements = 13 rows**:
**9 Verified ADAPTED native targets and 4 Intentionally omitted contracts**.
A1/S1 establish native CSS evidence, not Vue prop/slot/type, renderer or theme parity.
Source supplements identify reverse, two native CSS type aliases and three theme declarations.
The target does not invent a tag prop, swap tuple axes in columns or hide empty authored containers.


### Flex Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`align`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/flex/demos/enUS/index.demo-entry.md#L28) | Prop | ADAPTED --mui-flex-align / native align-items. | 🟢 Verified | Browser CSS grammar, default normal/stretch behavior; no JS string adapter. |
| [`inline`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/flex/demos/enUS/index.demo-entry.md#L29) | Prop | ADAPTED presence of data-inline. | 🟢 Verified | Native inline-flex; no generated role or element. |
| [`justify`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/flex/demos/enUS/index.demo-entry.md#L30) | Prop | ADAPTED --mui-flex-justify / native justify-content. | 🟢 Verified | Default start; native axis/distributed-space behavior without measurement. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/flex/demos/enUS/index.demo-entry.md#L31) | Prop | ADAPTED data-size presets or external CSS row/column gaps. | 🟢 Verified | Presets 4/8, 8/12, 12/16px row/column; tuple [H,V] maps column=H,row=V. Native scalar/invalid-value behavior, no parser. |
| [`vertical`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/flex/demos/enUS/index.demo-entry.md#L32) | Prop | ADAPTED presence of data-vertical. | 🟢 Verified | Column and source-compatible nowrap; gaps do not swap. |
| [`wrap`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/flex/demos/enUS/index.demo-entry.md#L33) | Prop | ADAPTED data-wrap=false opt-out for a row. | 🟢 Verified | Default wrap; vertical always nowrap. No reverse wrapping or automatic overflow clipping. |

### Flex Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/flex/demos/enUS/index.demo-entry.md#L39) | Slot | ADAPTED original native children/order. | 🟢 Verified | No wrapping/traversal/flattening or empty-container removal; lists, controls, hidden items and templates remain native. |

### Explicit source-only supplements

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / scope |
| --- | --- | --- | --- | --- |
| [`reverse`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/flex/src/Flex.tsx) | Source prop | Author meaningful DOM order; use native justification for alignment. | ⏭️ Intentionally omitted | No visual-order reversal that disagrees with reading/focus order. |
| [`FlexAlign`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/flex/src/type.ts) | Source CSS type alias | ADAPTED native align-items vocabulary. | 🟢 Verified | CSS owns supported values; no fictional library type or csstype dependency. |
| [`FlexJustify`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/flex/src/type.ts) | Source CSS type alias | ADAPTED native justify-content vocabulary. | 🟢 Verified | CSS owns supported values/axes; no runtime/type export. |
| [`theme`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/flex/src/Flex.tsx) | Source theme prop | External CSS/presets. | ⏭️ Intentionally omitted | No provider/theme object or generated inline style. |
| [`themeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/flex/src/Flex.tsx) | Source theme prop | Native CSS cascade/tokens. | ⏭️ Intentionally omitted | No object adapter, gap parser or style renderer. |
| [`builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/flex/src/Flex.tsx) | Source theme prop | Maintained external CSS. | ⏭️ Intentionally omitted | No internal framework theme plumbing. |

<!-- END PINNED API INVENTORY -->
