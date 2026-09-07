# Progress

**Migration status: 🟢 Verified for the retained native scope in this component change.**
Verified rows are **ADAPTED targets**, not full source rendering/theme parity.
All original pinned rows remain individually present, including the documented offset typo.

## Baseline and target

[A1: retained contract and evidence](../../components/progress.md), [S1: native controller](../../../src/components/progress/progress.ts),
[S2: external CSS](../../../src/components/progress/progress.css), [S3: SVG geometry](../../../src/components/progress/geometry.ts)
and [S4: validation/data helpers](../../../src/components/progress/values.ts) implement the standalone slice.
[B1: legacy content.ts](../../../src/components/content.ts) remains unchanged.

- **HTML:** labelled native progress for completion; explicit text alternative for circular/multiple measures.
- **JS:** validated percentage/legacy/native values and bounded data, one native semantic owner per measure, isolated SVG updates.
- **CSS:** native track/fill, status/indicator/radius, processing/indeterminate and reduced-motion presentation.
- **Placement:** standalone `src/components/progress/`, ESM/classic plus CSS; no charting/runtime dependency.

## Acceptance and gaps

A1 records **270 passing tests** (29 Progress-focused), build/budget gates and Chromium native
range/naming, scalar/multiple SVG geometry, gradient/rail, validation, motion and loading-order
acceptance. Core stays 14,611/15,000 gzip bytes. Progress ESM/classic/CSS are 5,936/5,968/1,497 gzip bytes.
Legacy value/max is an explicit ratio alias, not silently replaced by percentage. Nonpositive
max and invalid data are diagnosed; finite out-of-range normalization is marked and never
infers success. Native range owners—not the wrapper or SVG—carry semantics.

## Migration steps

**Delivery phase:** P2 — feedback primitives. **Task state:** 🟢 Verified retained scope.
**Prerequisites:** P0 numeric/ARIA contracts and external CSS in the [master plan](../migration-plan.md).
**Next task:** coordinator selection of Statistic (P2-03); it is not started by this Progress change.

1. [x] **Define completion state.** A1/S1 define native percentage/value-max/indeterminate sources, labels, explicit clamping and invalid-state diagnosis.
2. [x] **Extract linear presentation.** S2 styles native tracks/fills, indicators, heights/radii and motion; isolated validated data values have an explicit CSP boundary.
3. [x] **Accept circular variants.** S3 uses native SVG circles/gradients with actual angular gaps and bounded multi-ring fit; each measure has one native semantic owner.
4. [x] **Verify unusual values.** A1 records max-zero/nonfinite/array/geometry errors, native names/restoration, unique gradients, scalar/multiple states, reduced motion and load-order acceptance.

### Native primitives and fallback

- **Native path:** ordinary labelled `<progress>` is sufficient for a simple static display.
  Enhanced line uses it directly; radial/multiple visuals retain one native owner per measure
  and a separate decorative/inert SVG, without duplicate progressbar roles.
- **Small enhancement:** validated data/aliases and specific native SVG geometry only. Original
  labels/indicators/controls survive updates; templates remain inert. No charting, measurement,
  animation runtime, framework renderer or automatic busy/announcement provider is added.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/progress)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`;
historical baseline **5dcb190 / 0.11.0**, retained implementation/evidence in A1/S1–S4.
Inventory: **20 original table rows + 1 original inline field + 6 explicit source supplements
= 27 rows: 23 Verified ADAPTED targets and 4 Intentionally omitted contracts**.
The `offset-degress` typo is preserved as its own pinned row; the source spelling and aliases
are separately identified. Validation, native ownership and geometry differences are explicit
in A1; verification is not an all-browser/pixel/theme or announcement certification.


### Progress Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`border-radius`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/demos/enUS/index.demo-entry.md#L27) | Prop | ADAPTED validated numeric/native CSS radius or external token. | 🟢 Verified | Native track styling; explicit style/CSP boundary and no object renderer. |
| [`circle-gap`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/demos/enUS/index.demo-entry.md#L28) | Prop | ADAPTED nonnegative `.circleGap` / attribute. | 🟢 Verified | Native ring spacing; all rings must fit rather than silently dropping invalid geometry. |
| [`color`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/demos/enUS/index.demo-entry.md#L29) | Prop | ADAPTED string/two-stop gradient/bounded per-ring color data. | 🟢 Verified | Native CSS/SVG gradients with unique IDs; no generic style/render object. |
| [`fill-border-radius`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/demos/enUS/index.demo-entry.md#L30) | Prop | ADAPTED native fill-radius attribute/property/token. | 🟢 Verified | Independent fill radius with rail fallback and validation. |
| [`gap-degree`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/demos/enUS/index.demo-entry.md#L31) | Prop | ADAPTED actual 0–360 angular gap. | 🟢 Verified | Circle zero/dashboard 75 defaults; not copied source path-length quirks. |
| [`gap-offset-degree`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/demos/enUS/index.demo-entry.md#L32) | Prop | ADAPTED finite angle attribute/property. | 🟢 Verified | Native transforms normalized modulo 360. |
| [`height`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/demos/enUS/index.demo-entry.md#L33) | Prop | ADAPTED nonnegative pixel attribute/property or external CSS. | 🟢 Verified | Native linear geometry including zero; default inside label is readable. |
| [`indicator-placement`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/demos/enUS/index.demo-entry.md#L34) | Prop | ADAPTED inside/outside linear indicator. | 🟢 Verified | Centered track overlay, not source zero-fill clipping; radial placement separately documented. |
| [`indicator-text-color`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/demos/enUS/index.demo-entry.md#L35) | Prop | ADAPTED validated native text color/token. | 🟢 Verified | No arbitrary style string/object forwarding. |
| [`offset-degress`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/demos/enUS/index.demo-entry.md#L36) | Prop | ADAPTED documented typo alias to `offset-degree` / `.offsetDegree`. | 🟢 Verified | Original pinned spelling preserved; current spelling wins when both exist. |
| [`percentage`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/demos/enUS/index.demo-entry.md#L37) | Prop | ADAPTED finite scalar/bounded arrays with explicit value/max/native alternatives. | 🟢 Verified | Native semantics, marked clamping, max-zero/invalid diagnosis, no inferred success. |
| [`processing`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/demos/enUS/index.demo-entry.md#L38) | Prop | ADAPTED Boolean CSS linear-fill effect. | 🟢 Verified | Distinct from native indeterminate/busy state; reduced motion respected. |
| [`rail-color`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/demos/enUS/index.demo-entry.md#L39) | Prop | ADAPTED validated scalar/per-ring native rail colors. | 🟢 Verified | Arrays bounded/matched to measures; per-ring paints verified. |
| [`rail-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/demos/enUS/index.demo-entry.md#L40) | Prop | Use external CSS against native rails/tracks. | ⏭️ Intentionally omitted | No string/object/array style passthrough. |
| [`show-indicator`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/demos/enUS/index.demo-entry.md#L41) | Prop | ADAPTED `.showIndicator` / `show-indicator="false"`. | 🟢 Verified | Hides only the visual/custom indicator, not native range semantics or labels. |
| [`status`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/demos/enUS/index.demo-entry.md#L42) | Prop | ADAPTED explicit status palette/decorative glyph. | 🟢 Verified | Numeric context retained; no automatic success/announcement. |
| [`stroke-width`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/demos/enUS/index.demo-entry.md#L43) | Prop | ADAPTED nonnegative native SVG thickness, default 7. | 🟢 Verified | Ring-fit validation and zero-cap handling in A1/S3. |
| [`type`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/demos/enUS/index.demo-entry.md#L44) | Prop | ADAPTED line/circle/dashboard/multiple-circle. | 🟢 Verified | Native owner per measure with separate decorative graphics; no chart dependency. |
| [`unit`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/demos/enUS/index.demo-entry.md#L45) | Prop | ADAPTED safe indicator suffix, default `%`. | 🟢 Verified | Does not alter the numeric range basis or native semantics. |

### Progress Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/demos/enUS/index.demo-entry.md#L51) | Slot | ADAPTED authored custom indicator content. | 🟢 Verified | Preserved nodes/listeners outside native progress and decorative SVG; no template/VNode renderer. |

### Progress Props: color inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`color.stops`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/demos/enUS/index.demo-entry.md#L29) | Inline record field | ADAPTED exactly two validated native CSS colors. | 🟢 Verified | Native gradient stops; unique SVG IDs and no arbitrary renderer object. |

### Explicit source-only supplements

These additions come from the pinned implementation, not the public Markdown table.

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / scope |
| --- | --- | --- | --- | --- |
| [`viewBoxWidth`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/src/Progress.tsx) | Source prop | ADAPTED `view-box-width` / `.viewBoxWidth`, positive finite, default 100. | 🟢 Verified | Native bounded-ring geometry; no JS measurements. |
| [`offsetDegree`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/src/Progress.tsx) | Source spelling | ADAPTED current `offset-degree` / `.offsetDegree`. | 🟢 Verified | Correct source spelling plus preserved public-doc typo alias. |
| [`indicatorPosition`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/src/Progress.tsx) | Source alias | ADAPTED `indicator-position` / `.indicatorPosition`. | 🟢 Verified | Fallback only when current indicator-placement is absent. |
| [`theme`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/src/Progress.tsx) | Inherited source prop | External CSS/custom properties. | ⏭️ Intentionally omitted | No framework theme object/provider. |
| [`themeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/src/Progress.tsx) | Inherited source prop | External scoped CSS. | ⏭️ Intentionally omitted | No runtime object-shape compatibility. |
| [`builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/src/Progress.tsx) | Inherited source prop | External CSS source of truth. | ⏭️ Intentionally omitted | No internal framework override machinery. |

<!-- END PINNED API INVENTORY -->
