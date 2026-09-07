# Ellipsis

**Migration status: 🟢 Verified retained CSS-only native truncation/disclosure scope.**
No runtime, overflow observer, Tooltip dependency or PerformantEllipsis remount wrapper.

## Baseline and target

[A1: retained contract and acceptance](../../components/ellipsis.md) and
[S1: native Ellipsis CSS](../../../src/components/ellipsis/ellipsis.css) implement the slice.
[B1: registry](../../../src/components/elements.ts) remains unchanged.

- **HTML:** keep complete readable text in light DOM.
- **JS:** none; native details/summary and application-owned open/toggle replace click interception.
- **CSS:** `text-overflow` and line clamping with readable fallback.
- **Placement:** `src/components/ellipsis/ellipsis.css`, exported only as `@dataengine/markup-ui/ellipsis/style.css`.

## Acceptance and gaps

A1 records **327 passing tests** (11 focused), budget/export gates and Chromium overflow,
keyboard/pointer expansion, original selection/names, native-control safety, font/width changes,
RTL/zoom, print and CSS/legacy coexistence. CSS is **676 gzip bytes / 1,500 ceiling**; core stays
14,611/15,000. Noninteractive phrasing content only; native details supplies the visible full-text
route. Tooltip overlays/measurement and source hover-remount behavior are not retained.

## Migration steps

**Delivery phase:** P2 — text presentation; P3 native disclosure slice only. **Task state:** 🟢 Verified retained native scope.
**Prerequisites:** P0 external CSS/native-control conventions in the [master plan](../migration-plan.md); Tooltip is not a dependency for native details.
**Next task:** coordinator selection of Page Header; P2/P3 are not complete.

1. [x] **Build the CSS baseline.** Native overflow/clamp, logical min-width and full-text unsupported/invalid/print fallbacks are verified in A1/S1.
2. [x] **Choose disclosure policy.** Visible native summary/hint, keyboard/pointer activation and one original complete text/name owner; no title-as-tooltip substitute.
3. [x] **Scope measurement.** Explicitly omit overflow detection/Tooltip; CSS layout and native open/toggle need no observer or cleanup. Native controls defensively disable truncation.
4. [x] **Reject remount shortcuts.** A1 verifies node/selection/ARIA/listener identity, font/width/RTL/zoom changes, hidden-state regression and both CSS/legacy orders; no hover remount.

### Native primitives and fallback

- **Native path:** full text stays in a normal element; CSS text-overflow/line clamping provides optional truncation without JavaScript.
- **Small enhancement:** native details/summary provides visible keyboard/pointer expansion without
  a controller. Guard clamp and safety-selector support; otherwise show complete text. Real
  overlays/overflow measurement remain outside this scope, not hidden runtime dependencies.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/ellipsis)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/ellipsis/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/ellipsis)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Inventory: **5 original public rows + 5 explicit source supplements = 10 rows**:
**4 Verified ADAPTED native targets and 6 Intentionally omitted overlay/framework contracts**.
A1/S1 establish retained implementation/evidence, not Vue prop/slot, tooltip or pixel parity.
Source supplements identify two forwarded PerformantEllipsis slots and three shared grouped
theme declarations. No public methods/expand callback or new catalog route are invented.

Referenced public component types (composition, not automatic API inheritance): [Tooltip](tooltip.md).
TooltipProps is explicitly not transplanted; native disclosure is not a Tooltip-compatible overlay.


### Ellipsis, PerformantEllipsis Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`expand-trigger`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/ellipsis/demos/enUS/index.demo-entry.md#L25) | Prop | ADAPTED explicit native details/summary; native open/toggle. | 🟢 Verified | Visible keyboard/pointer control with one complete text owner; no arbitrary click interceptor or overflow-only affordance. |
| [`line-clamp`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/ellipsis/demos/enUS/index.demo-entry.md#L26) | Prop | ADAPTED data-multiline and --mui-ellipsis-lines CSS integer. | 🟢 Verified | Native one-line default, multiline default 2; invalid/unsupported values show full text without JS coercion. |
| [`tooltip`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/ellipsis/demos/enUS/index.demo-entry.md#L27) | Prop | Use an explicit visible native full-content route instead. | ⏭️ Intentionally omitted | No Boolean/TooltipProps overlay, default-on tooltip or automatic overflow measurement; title is not parity. |

### Ellipsis Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/ellipsis/demos/enUS/index.demo-entry.md#L33) | Slot | ADAPTED original native noninteractive phrasing content. | 🟢 Verified | Full original text/name/selection and nodes stay native; no hidden duplicate or clipped native controls. |
| [`tooltip`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/ellipsis/demos/enUS/index.demo-entry.md#L34) | Slot | Application-owned distinct content/overlay, if separately implemented. | ⏭️ Intentionally omitted | No tooltip slot renderer or native-title equivalence claim. |

### Explicit source-only supplements

PerformantEllipsis imports the same ellipsisProps object and forwards its slots to Ellipsis.
The three shared theme rows therefore retain the public page's grouped-owner convention.
Its first-hover promotion/remount is intentionally not implemented; no new lifecycle API is invented.

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / scope |
| --- | --- | --- | --- | --- |
| [`PerformantEllipsis.default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/ellipsis/src/PerformantEllipsis.tsx) | Source forwarded slot | ADAPTED same native content. | 🟢 Verified | No hover-remount, measurement or separate renderer. |
| [`PerformantEllipsis.tooltip`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/ellipsis/src/PerformantEllipsis.tsx) | Source forwarded slot | No forwarded tooltip rendering. | ⏭️ Intentionally omitted | Native visible disclosure does not reproduce custom overlay content. |
| [`Ellipsis, PerformantEllipsis.theme`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/ellipsis/src/Ellipsis.tsx) | Shared source theme prop | External scoped CSS. | ⏭️ Intentionally omitted | ellipsisProps theme mixin reused by both owners; no provider object. |
| [`Ellipsis, PerformantEllipsis.themeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/ellipsis/src/Ellipsis.tsx) | Shared source theme prop | External CSS cascade/tokens. | ⏭️ Intentionally omitted | No runtime style/theme adapter or Tooltip peer override. |
| [`Ellipsis, PerformantEllipsis.builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/ellipsis/src/Ellipsis.tsx) | Shared source theme prop | Maintained external CSS. | ⏭️ Intentionally omitted | No framework internal theme plumbing. |

<!-- END PINNED API INVENTORY -->
