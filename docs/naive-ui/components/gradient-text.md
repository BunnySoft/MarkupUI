# Gradient Text

**Migration status: 🟢 Verified retained CSS-only native text decoration.**
No runtime gradient object adapter, Custom Element, ESM/classic entry or renderer is introduced.

## Baseline and target

[A1: retained contract and acceptance](../../components/gradient-text.md) and
[S1: native Gradient Text CSS](../../../src/components/gradient-text/gradient-text.css) implement
the slice. [B1: registry](../../../src/components/elements.ts) remains unchanged.

- **HTML:** ordinary text within a semantic element.
- **JS:** none.
- **CSS:** external gradient/background clipping with solid-color fallback and scoped tokens.
- **Placement:** `src/components/gradient-text/gradient-text.css`, exported only as `@dataengine/markup-ui/gradient-text/style.css`.

## Acceptance and gaps

A1 records **316 passing tests** (8 focused), build/export gates and Chromium solid-fallback,
forced-colors/print, selection/native links, nesting, wrapping/RTL/zoom and legacy-coexistence
checks. CSS is **596 gzip bytes / 1,500 ceiling**; core remains 14,611/15,000.
Contrast remains application-owned; unsupported clipping was simulated by removing the
feature rule in Chromium, not tested in a different engine. Print evidence is browser media
and in-memory PDF generation without backgrounds, not physical-output certification.

## Migration steps

**Delivery phase:** P2 — text presentation. **Task state:** 🟢 Verified retained CSS-only scope.
**Prerequisites:** P0 stylesheet/theme-token conventions in the [master plan](../migration-plan.md).
**Next task:** coordinator selection of Ellipsis; P2-01/P2 remain incomplete.

1. [x] **Choose text anatomy.** A1/S1 retain original native text/headings/links and attributes with no renderer, runtime or fabricated roles.
2. [x] **Map gradient options.** Native CSS size/weight/image/from/to/angle tokens and data-type map all retained presentation fields; object/alias prop adapters are not shipped.
3. [x] **Implement CSS fallbacks.** Solid foreground/underpaint, guarded clipping and forced-color/print restoration preserve words without image backgrounds.
4. [x] **Check readability.** A1 records selection, native focus/links, RTL/wrapping/zoom, nested text and fallback acceptance; contrast and physical output remain explicit author responsibilities.

### Native primitives and fallback

- **Native path:** an ordinary semantic text element and external CSS gradient/background clipping; no custom element, template cloning or controller is required.
- **Small enhancement:** guard clipping with `@supports`, keep a solid readable color, and restore it in forced-colors/print contexts. Native CSS inheritance supplies sizing and direction; lack of gradient support reduces decoration rather than triggering a renderer/polyfill.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/gradient-text)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/gradient-text/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/gradient-text)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Inventory: **4 original table rows + 3 original inline fields + 6 explicit source supplements
= 13 rows**: **10 Verified ADAPTED native targets and 3 Intentionally omitted theme contracts**.
A1/S1 establish retained implementation/evidence. Verified mappings are native CSS presentation,
not runtime Vue prop/object/alias precedence or pixel parity. Source supplements are separate
from the pinned public inventory; weight is theme presentation, not an invented public prop.


### GradientText Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`gradient`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/gradient-text/demos/enUS/index.demo-entry.md#L19) | Prop | ADAPTED native CSS image or endpoint/angle tokens. | 🟢 Verified | A1/S1: no object/string runtime adapter; guarded clipping and solid underpaint. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/gradient-text/demos/enUS/index.demo-entry.md#L20) | Prop | ADAPTED native font-size in author CSS. | 🟢 Verified | Explicit CSS units/expressions; absent sizing preserves native headings. |
| [`type`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/gradient-text/demos/enUS/index.demo-entry.md#L21) | Prop | ADAPTED data-type primary/info/success/warning/error. | 🟢 Verified | CSS palette vocabulary; contrast is not automatically certified. |

### GradientText Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/gradient-text/demos/enUS/index.demo-entry.md#L27) | Slot | ADAPTED original native text/inline nodes. | 🟢 Verified | No cloning/renderer; selection, semantics, links and nested solid text preserved. |

### GradientText Props: gradient inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`gradient.from`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/gradient-text/demos/enUS/index.demo-entry.md#L19) | Inline record field | ADAPTED --mui-gradient-text-from native CSS color. | 🟢 Verified | Native declaration, not runtime record evaluation. |
| [`gradient.to`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/gradient-text/demos/enUS/index.demo-entry.md#L19) | Inline record field | ADAPTED --mui-gradient-text-to native CSS color. | 🟢 Verified | Native declaration with solid foreground underpaint. |
| [`gradient.deg`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/gradient-text/demos/enUS/index.demo-entry.md#L19) | Inline record field | ADAPTED --mui-gradient-text-angle with CSS angle units. | 🟢 Verified | Theme default 252deg; explicitly use 0deg for upstream object-default translation. |

### Explicit source-only supplements

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / scope |
| --- | --- | --- | --- | --- |
| [`fontSize`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/gradient-text/src/GradientText.tsx) | Source alias prop | ADAPTED native font-size. | 🟢 Verified | No runtime alias or size-or-fontSize precedence; author CSS owns final size. |
| [`color`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/gradient-text/src/GradientText.tsx) | Source gradient alias prop | ADAPTED native gradient-image/tokens. | 🟢 Verified | Source color-or-gradient object/string adapter omitted; distinct from ordinary foreground CSS color. |
| [`type: danger`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/gradient-text/src/GradientText.tsx) | Source compatibility value | ADAPTED data-type danger as error palette. | 🟢 Verified | Same CSS palette, no extra prop or runtime. |
| [`theme`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/gradient-text/src/GradientText.tsx) | Source theme prop | External CSS/tokens. | ⏭️ Intentionally omitted | No provider/theme object. |
| [`themeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/gradient-text/src/GradientText.tsx) | Source theme prop | External CSS cascade. | ⏭️ Intentionally omitted | No runtime object adapter. |
| [`builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/gradient-text/src/GradientText.tsx) | Source theme prop | Maintained external stylesheet. | ⏭️ Intentionally omitted | No internal framework/Houdini plumbing. |

<!-- END PINNED API INVENTORY -->
