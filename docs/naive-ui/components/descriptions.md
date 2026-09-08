# Descriptions

**Plan: 🟢 Verified for retained native Descriptions/DescriptionItem scope; ten explicit omissions.**

## Baseline and target

[B1: navigation.ts](../../../src/components/navigation.ts) creates legacy label/value spans
and updates a columns style. That compatibility path remains unchanged, not silently
redefined as native terms/definitions.

- **HTML:** valid native `dl` with direct `div` groups containing `dt` then `dd`; title/header outside the list.
- **JS:** none in the component; values, controls and application actions remain author-owned.
- **CSS:** scoped grid columns/spans, density, independent group borders, term placement/alignment and logical wrapping.
- **Placement:** [descriptions.css](../../../src/components/descriptions/descriptions.css), stylesheet package export and [native demo](../../../demo/components/descriptions.html).

## Acceptance and gaps

The [canonical acceptance record](../../components/descriptions.md) reports 419 passing
tests (12 Descriptions cases), build/budget gates and Chromium terms/definitions,
spans, forms/focus, narrow/RTL/zoom/hidden/print/legacy/no-JS evidence. CSS is 880 gzip
bytes, component JS is zero and core remains 14,611/15,000 gzip bytes.
Native spans are not upstream table colspan packing or automatic final-item expansion;
framework styles/themes/types and the compatibility alias have explicit omissions.

## Migration steps

**Delivery phase:** P2 — compound display. **Task state:** 🟢 Verified retained scope.
**Prerequisites:** P0 child preservation and P2 Grid/typography rules in the [master plan](../migration-plan.md).
**Next task:** Timeline, then Breadcrumb; full P2 still needs residual-index review.

1. [x] **Define DescriptionItem.** Native term/definition groups, rich/empty terms and shared external heading.
2. [x] **Resolve spans and columns.** Native grid columns/spans, positive-integer author constraints and no implicit table packing.
3. [x] **Extract responsive presentation.** Independent borders, label placement/alignment/density CSS and authored media-query column/span resets.
4. [x] **Check reading order.** Tests and Chromium cover long labels, rich values, spans, nested/hidden/templates, native controls and live/narrow layouts.

### Native primitives and fallback

- **Native path:** real `dl`/`dt`/`dd` pairs, optionally grouped in valid native `div` children, with authored values and native controls. Application-owned templates stay inert until explicitly cloned.
- **Small enhancement:** native grid/gap/logical spacing and authored media queries provide layout; no table/grid roles, column parser, runtime renderer, measurement, provider or custom-element lifecycle. The static content and native forms work without JavaScript.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/descriptions)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/descriptions/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/descriptions)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **21 original local table rows + 6 explicit source-only supplements + 0 inherited rows = 27 tracker rows**.
Every original owner, row and pinned identity remains: **17 Verified ADAPTED native targets
and 10 Intentionally omitted contracts**. Descriptions, its companion and presentation
source were reviewed for this retained scope, not certified for every framework edge case.
The canonical record defines defaults, constraints, omissions and actual acceptance evidence.


### Descriptions Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`bordered`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/descriptions/demos/enUS/index.demo-entry.md#L24) | Prop | Presence `data-bordered`; independent group borders and term/value separator. | 🟢 Verified ADAPTED target | Native CSS/Chromium borders; not collapsed table borders. |
| [`column`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/descriptions/demos/enUS/index.demo-entry.md#L25) | Prop | `--mui-descriptions-columns` on `dl`; positive integer, default 3. | 🟢 Verified ADAPTED target | Live two/three columns and authored narrow reset; no `columns` parser or table subcolumns. |
| [`content-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/descriptions/demos/enUS/index.demo-entry.md#L26) | Prop | Native classes/classList or direct-child scoped CSS on actual `dd` nodes. | 🟢 Verified ADAPTED target | Authored content and form classes survive; no class-forwarding runtime. |
| [`content-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/descriptions/demos/enUS/index.demo-entry.md#L27) | Prop | External CSS instead of runtime string/object forwarding. | ⏭️ Intentionally omitted | No CSS-in-JS or style-object bridge; native content alignment token available. |
| [`label-align`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/descriptions/demos/enUS/index.demo-entry.md#L28) | Prop | `data-label-align="left"` / `"center"` / `"right"`; default logical start. | 🟢 Verified ADAPTED target | Physical requested text alignment retained; native default deliberately adapts upstream left. |
| [`label-placement`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/descriptions/demos/enUS/index.demo-entry.md#L29) | Prop | Default top; `data-label-placement="left"` means logical start-side term. | 🟢 Verified ADAPTED target | RTL geometry, native pairs and logical separators; no DOM reordering. |
| [`label-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/descriptions/demos/enUS/index.demo-entry.md#L30) | Prop | Native classes/classList or direct-child scoped CSS on actual `dt` nodes. | 🟢 Verified ADAPTED target | Author-owned terms and classes, no host-to-child forwarding. |
| [`label-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/descriptions/demos/enUS/index.demo-entry.md#L31) | Prop | External CSS replaces runtime string/object forwarding. | ⏭️ Intentionally omitted | No runtime styling adapter; apply styles to actual terms. |
| [`separator`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/descriptions/demos/enUS/index.demo-entry.md#L32) | Prop | Authored `.mui-descriptions-separator` span in `dt`, usually `:`; no generated text. | 🟢 Verified ADAPTED target | Only visible for unbordered left/start placement; colon/custom text and hidden decoration exercised. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/descriptions/demos/enUS/index.demo-entry.md#L33) | Prop | `data-size="small"` / `"medium"` / `"large"`; missing/invalid defaults medium. | 🟢 Verified ADAPTED target | Native density measured at 8/12/16px block padding; no provider or pixel-parity promise. |
| [`title`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/descriptions/demos/enUS/index.demo-entry.md#L34) | Prop | Real authored heading outside `dl`; plain-text changes use textContent. | 🟢 Verified ADAPTED target | Native heading/name; no native title-tooltip mapping or precedence engine. |

### DescriptionItem Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`content-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/descriptions/demos/enUS/index.demo-entry.md#L40) | Prop | Native classes/classList on this group's actual `dd`. | 🟢 Verified ADAPTED target | Independent authored styling, not framework prop forwarding. |
| [`content-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/descriptions/demos/enUS/index.demo-entry.md#L41) | Prop | Use external CSS on the actual definition. | ⏭️ Intentionally omitted | No runtime string/object style evaluation or inherited override merging. |
| [`label`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/descriptions/demos/enUS/index.demo-entry.md#L42) | Prop | Actual `dt` text/nodes; no label attribute renderer. | 🟢 Verified ADAPTED target | Empty/long terms preserved, rich values and native labelled forms exercised. |
| [`label-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/descriptions/demos/enUS/index.demo-entry.md#L43) | Prop | Native classes/classList on this group's actual `dt`. | 🟢 Verified ADAPTED target | Terms remain original nodes; parent/item forwarding quirks are not reproduced. |
| [`label-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/descriptions/demos/enUS/index.demo-entry.md#L44) | Prop | Use external CSS on the actual term. | ⏭️ Intentionally omitted | No runtime style-object/string bridge. |
| [`span`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/descriptions/demos/enUS/index.demo-entry.md#L45) | Prop | `--mui-description-span` on a group; default 1, positive integer no greater than active columns. | 🟢 Verified ADAPTED target | Two-track and explicit full-width geometry; author resets spans at breakpoints. No table colspan/final-item fill algorithm. |

### Descriptions Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/descriptions/demos/enUS/index.demo-entry.md#L51) | Slot | Native `dl` and valid direct term/definition groups. | 🟢 Verified ADAPTED target | No fake table/grid role, renderer or reordered term/value rows; no-JS semantics retained. |
| [`header`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/descriptions/demos/enUS/index.demo-entry.md#L52) | Slot | Authored heading/header content outside `dl`. | 🟢 Verified ADAPTED target | No illegal list child or automatic title/slot precedence. |

### DescriptionItem Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/descriptions/demos/enUS/index.demo-entry.md#L58) | Slot | Actual rich `dd` children. | 🟢 Verified ADAPTED target | Original nodes/listeners, nested descriptions, forms, actions and templates remain owned by the author. |
| [`label`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/descriptions/demos/enUS/index.demo-entry.md#L59) | Slot | Actual authored `dt` children. | 🟢 Verified ADAPTED target | Term semantics and order; no VNode slot projection or generated label. |

### Explicit source-only supplements

These six independently identified declarations supplement, rather than replace, the
21 public Markdown rows. The reviewed source declares no component-specific events or
methods. Native content-alignment CSS does not invent a `content-align` prop. Upstream's
companion is exported as `NDescriptionsItem`; the public table's DescriptionItem owner
identity remains unchanged above.

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`columns`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/descriptions/src/Descriptions.tsx) | Source-only compatibility prop | Use the single `--mui-descriptions-columns` token; no compatibility alias parser. | ⏭️ Intentionally omitted | Source resolves columns/column through `useCompitable`; old MarkupUI's separate legacy columns behavior remains unchanged. |
| [`DescriptionProps`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/descriptions/src/Descriptions.tsx) | Source-only deprecated type alias | No framework prop-object export. | ⏭️ Intentionally omitted | Alias of DescriptionsProps; CSS-only target has no runtime/type wrapper. |
| [`DescriptionsSize`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/descriptions/src/public-types.ts) | Source-only exported type | No exported TypeScript alias; native size vocabulary is accounted for in the size row. | ⏭️ Intentionally omitted | Source union is small/medium/large, not an additional feature credited twice. |
| [`theme`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts) | Source-only mixed-in prop | External CSS instead of a runtime theme/provider object. | ⏭️ Intentionally omitted | Descriptions spreads `useTheme.props`; no framework theme evaluation. |
| [`themeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts) | Source-only mixed-in prop | CSS tokens, not runtime override merging. | ⏭️ Intentionally omitted | Native cascade/inheritance, no provider or automatic modal/popover detection. |
| [`builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts) | Source-only mixed-in prop | No built-in override object. | ⏭️ Intentionally omitted | External presentation and zero runtime dependencies. |

<!-- END PINNED API INVENTORY -->
