# Divider

**Migration status: 🟢 Verified retained CSS-only native Divider scope.**
The legacy tag remains unchanged; the new native composition has no runtime or automatic roles.

## Baseline and target

[A1: retained contract and acceptance](../../components/divider.md) and
[S1: native Divider CSS](../../../src/components/divider/divider.css) implement the new slice.
[B1: registry](../../../src/components/elements.ts) still assigns legacy separator role and initial orientation;
[B2: styles.ts](../../../src/components/styles.ts) still styles `mui-divider`, unchanged.

- **HTML:** native `hr` for thematic breaks; decorative separators remain hidden from accessibility APIs.
- **JS:** none for basic separation.
- **CSS:** logical borders, vertical/horizontal layout and optional caption alignment.
- **Placement:** `src/components/divider/divider.css`; stylesheet-only export `@dataengine/markup-ui/divider/style.css`.

## Acceptance and gaps

A1 records **351 passing tests** (11 focused), budget/export gates and Chromium horizontal/
vertical/dashed/caption/placement geometry, named versus decorative AX ownership, native heading/
action behavior, narrow/grid/RTL/zoom/forced-colors/print and legacy coexistence. CSS is
**765 gzip bytes / 1,500 ceiling**; core stays 14,611/15,000. Native orientation is authoritative;
real headings stay outside a separator's presentational descendants. AX evidence is not all-AT speech certification.

## Migration steps

**Delivery phase:** P2 — primitives/layout. **Task state:** 🟢 Verified retained native scope.
**Prerequisites:** P0 semantic/decorative distinctions and external CSS in the [master plan](../migration-plan.md).
**Next task:** coordinator selection of Flex, then Space, Grid and Layout; P2 remains incomplete.

1. [x] **Choose semantics.** A1 separates native hr, explicit named/vertical separators, decorative rules and real headings; one named-caption owner verified in Chromium AX.
2. [x] **Extract border layout.** Logical borders/caption flex layout with authoritative authored ARIA orientation; legacy tag behavior remains unchanged rather than silently upgraded.
3. [x] **Resolve size and placement rows.** Physical left/right/center and logical start/end, dashed rules and native CSS geometry tokens; no nonexistent public size prop or controller.
4. [x] **Check rendering contexts.** A1 verifies narrow/grid/RTL/zoom/forced-colors/print, original text/selection, ignored decoration and both CSS/legacy orders; scope limits remain explicit.

### Native primitives and fallback

- **Native path:** use `hr` for thematic separation or a decorative CSS border; captioned layouts use ordinary authored text and flex/grid.
- **Small enhancement:** none is required. Explicit caption classes, logical borders and
  authored orientation provide the retained composition; native :dir() handles physical
  left/right placement with centered fallback. No observer, :has() discovery or wrapper lifecycle exists.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/divider)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/divider/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/divider)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Inventory: **4 original public rows + 3 explicit source theme supplements = 7 rows**:
**4 Verified ADAPTED native targets and 3 Intentionally omitted framework contracts**.
A1/S1 establish native evidence, not a Vue prop/slot, all-AT or pixel-parity claim.
There is no documented size prop; native CSS dimension tokens are target presentation.
Vertical caption preservation and vertical dashed borders are deliberate native composition
differences from the source's omitted vertical slot/solid background branch.


### Divider Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`dashed`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/divider/demos/enUS/index.demo-entry.md#L19) | Prop | ADAPTED presence of data-dashed and native border style. | 🟢 Verified | Horizontal/vertical borders; no Boolean parser. Vertical dashing is an explicit native composition difference. |
| [`title-placement`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/divider/demos/enUS/index.demo-entry.md#L20) | Prop | ADAPTED data-placement left/right/center; logical start/end also available. | 🟢 Verified | Physical versus logical RTL contract, 28px edge preference and wrapped labels; no runtime layout state. |
| [`vertical`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/divider/demos/enUS/index.demo-entry.md#L21) | Prop | ADAPTED semantic aria-orientation or guarded decorative data-orientation. | 🟢 Verified | Visual orientation follows explicit ARIA; no automatic role, focusability or legacy Boolean-attribute adapter. |

### Divider Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/divider/demos/enUS/index.demo-entry.md#L27) | Slot | ADAPTED original caption or real heading in a neutral decorative wrapper. | 🟢 Verified | No children in void hr or hidden duplicate strings; plain named caption and meaningful heading have distinct semantics. Vertical DOM is retained, not silently discarded. |

### Explicit source-only supplements

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / scope |
| --- | --- | --- | --- | --- |
| [`theme`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/divider/src/Divider.tsx) | Source theme prop | External CSS/tokens. | ⏭️ Intentionally omitted | No provider/theme object or inline style generation. |
| [`themeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/divider/src/Divider.tsx) | Source theme prop | Native CSS cascade. | ⏭️ Intentionally omitted | No object/style renderer. |
| [`builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/divider/src/Divider.tsx) | Source theme prop | Maintained external stylesheet. | ⏭️ Intentionally omitted | No internal framework theme plumbing. |

<!-- END PINNED API INVENTORY -->
