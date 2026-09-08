# Space

**Migration status: 🟢 Verified retained CSS-only native Space/item scope.**
Author-owned groups/styles replace runtime wrappers; no Flex import, renderer or gap detector.

## Baseline and target

[A1: retained contract and acceptance](../../components/space.md) and
[S1: native Space CSS](../../../src/components/space/space.css) implement the new slice.
[B1: styles.ts](../../../src/components/styles.ts) still supplies unchanged legacy spacing selectors.

- **HTML:** original native children and optional explicit item groups/classes; no anonymous wrappers.
- **JS:** none.
- **CSS:** external gap, alignment, wrap and direction with logical axes.
- **Placement:** `src/components/space/space.css`; independent stylesheet export `@dataengine/markup-ui/space/style.css`.

## Acceptance and gaps

A1 records **373 passing tests** (11 focused), build/export gates and Chromium authored
groups/styles/separators, preset/tuple gaps, native lists/GET forms/focus/hidden, narrow/grid/
RTL/zoom/print and independent Flex/legacy coexistence. CSS is **423 gzip bytes / 1,000 ceiling**;
Flex stays 390 and core 14,611/15,000. Old-browser gap fallback, reverse and automatic wrapper/style
contracts are not shipped. The pinned API/source has no separator prop or slot.

## Migration steps

**Delivery phase:** P2 — CSS spacing. **Task state:** 🟢 Verified retained native scope.
**Prerequisites:** P2 Flex and P0 CSS-token conventions in the [master plan](../migration-plan.md).
**Next task:** coordinator selection of Grid, then Layout; P2 remains incomplete.

1. [x] **Define gap equivalents.** Exact native presets/tuple axes, align/justify, vertical nowrap and inline modes; no size parser or anonymous wrapper insertion.
2. [x] **Specify wrapping.** Explicit item boxes preserve mixed content, original classes and empty/hidden unit behavior; native separators remain authored composition, not an API.
3. [x] **Record framework exclusions.** Native markup/classes replace wrap-item/item-class/item-style adapters; reverse, internal gap override/fallback and themes remain explicit omissions.
4. [x] **Test CSS-only use.** A1 verifies grouping/gaps/items/separators, native lists/forms/focus/hidden, RTL/zoom/print and independent Flex/legacy composition without demo JS.

### Native primitives and fallback

- **Native path:** CSS flex/grid gap, wrap and alignment on existing authored containers; no anonymous item wrappers or dedicated custom element are needed.
- **Small enhancement:** none. Use explicit native groups and application CSS. Modern flex-gap
  is the retained baseline; old browsers may lose spacing/native flow decoration. No query system,
  :has() traversal, measurement detector, negative-margin fallback or slot/polyfill framework is supplied.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/space)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/space/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/space)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Inventory: **11 original public rows + 7 explicit source supplements = 18 rows**:
**13 Verified ADAPTED native targets and 5 Intentionally omitted contracts**.
A1/S1 establish native composition evidence, not Vue wrapper/prop/type, provider or old-browser parity.
Source supplements identify internalUseGap, alignment aliases, SpaceSize/Justify types and
three theme contracts. No separator API is invented; authored separators are ordinary native items/groups.


### Space Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`align`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/space/demos/enUS/index.demo-entry.md#L25) | Prop | ADAPTED --mui-space-align / native align-items. | 🟢 Verified | CSS grammar and native axes; no runtime enum/string adapter. |
| [`inline`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/space/demos/enUS/index.demo-entry.md#L26) | Prop | ADAPTED presence of data-inline. | 🟢 Verified | Native inline-flex, no synthetic element or role. |
| [`wrap-item`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/space/demos/enUS/index.demo-entry.md#L27) | Prop | ADAPTED explicit authored item/group or direct native children. | 🟢 Verified | Markup choice, not a Boolean parser/generator; original nodes and content models remain authoritative. |
| [`item-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/space/demos/enUS/index.demo-entry.md#L28) | Prop | ADAPTED actual class on an authored item. | 🟢 Verified | No root-string propagation or generated wrapper classes. |
| [`item-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/space/demos/enUS/index.demo-entry.md#L29) | Prop | ADAPTED external CSS for the actual item class. | 🟢 Verified | No string/object adapter or inline style merging; existing native attributes preserved. |
| [`justify`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/space/demos/enUS/index.demo-entry.md#L30) | Prop | ADAPTED --mui-space-justify / native justify-content. | 🟢 Verified | Default flex-start matches source start mapping; native distribution, no margin fallback. |
| [`reverse`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/space/demos/enUS/index.demo-entry.md#L31) | Prop | Keep meaningful native DOM/reading/tab order. | ⏭️ Intentionally omitted | No visual reversal helpers; native RTL is not node reversal. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/space/demos/enUS/index.demo-entry.md#L32) | Prop | ADAPTED presets or explicit CSS row/column gaps. | 🟢 Verified | Presets 4/8,8/12,12/16 row/column; tuple [H,V] maps column=H,row=V. No numeric parser/provider defaults. |
| [`vertical`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/space/demos/enUS/index.demo-entry.md#L33) | Prop | ADAPTED presence of data-vertical. | 🟢 Verified | Column forces nowrap; tuple axes do not swap. |
| [`wrap`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/space/demos/enUS/index.demo-entry.md#L34) | Prop | ADAPTED data-wrap=false row opt-out. | 🟢 Verified | Default wrap; vertical remains nowrap. No automatic clipping or reverse wrapping. |

### Space Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/space/demos/enUS/index.demo-entry.md#L40) | Slot | ADAPTED original native items/groups/mixed content. | 🟢 Verified | No flattening, text dropping or empty-item removal; native lists/forms/separators and templates remain authored. |

### Explicit source-only supplements

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / scope |
| --- | --- | --- | --- | --- |
| [`internalUseGap`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/space/src/Space.tsx) | Internal source prop, not public | No internal override or detector/polyfill. | ⏭️ Intentionally omitted | Modern native gap baseline; wrapper/margin compatibility machinery not shipped. |
| [`align: flex-start/flex-end`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/space/src/Space.tsx) | Source compatibility values | ADAPTED native CSS alignment aliases. | 🟢 Verified | Additional source values accepted through normal CSS, not an invented public prop. |
| [`SpaceSize`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/space/src/public-types.ts) | Source public type alias | ADAPTED presets and external scalar/tuple gap declarations. | 🟢 Verified | No library type export or array/size parser. |
| [`Justify`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/space/src/Space.tsx) | Source type alias | ADAPTED native CSS justification vocabulary. | 🟢 Verified | No library runtime/type export or style engine. |
| [`theme`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/space/src/Space.tsx) | Source theme prop | External CSS/presets. | ⏭️ Intentionally omitted | No provider/theme object. |
| [`themeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/space/src/Space.tsx) | Source theme prop | Native CSS cascade/tokens. | ⏭️ Intentionally omitted | No runtime style object or gap parser. |
| [`builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/space/src/Space.tsx) | Source theme prop | Maintained external CSS. | ⏭️ Intentionally omitted | No framework internal theme plumbing. |

<!-- END PINNED API INVENTORY -->
