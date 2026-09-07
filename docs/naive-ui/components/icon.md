# Icon

**Migration status: 🟢 Verified retained CSS-only native Icon/IconWrapper scope.**
No icon package, asset loader, component-constructor adapter, Custom Element or synthetic
ESM/classic runtime is introduced. Every pinned public row is retained.

## Baseline and target

[A1: retained contract and acceptance](../../components/icon.md) and
[S1: native Icon/IconWrapper CSS](../../../src/components/icon/icon.css) implement the slice.
[B1: legacy registry](../../../src/components/elements.ts) remains unchanged, with no new icon integration.

- **HTML:** authored inline SVG or an image with an explicit accessible name/decorative policy.
- **JS:** none; no icon-library import or framework component constructor.
- **CSS:** inherited sizing/color, depth and native wrapper geometry; no fill/stroke or nested SVG reset.
- **Placement:** `src/components/icon/icon.css`, exported as `@dataengine/markup-ui/icon/style.css` only.

## Acceptance and gaps

A1 records **308 passing tests** (8 Icon-focused), CSS-only build/export checks and Chromium
native paint/aspect/viewport, names/actions/focus, depth/wrapper, forced-color, RTL/zoom and
legacy-coexistence acceptance. CSS is 609 gzip bytes under a 1,000-byte CSS ceiling; core
stays 14,611/15,000 gzip bytes. Consumers supply assets and accessible ownership explicitly.

## Migration steps

**Delivery phase:** P2 — primitives. **Task state:** 🟢 Verified retained CSS-only scope.
**Prerequisites:** P0 authored-content policy and P1 Button accessible naming in the [master plan](../migration-plan.md).
**Next task:** coordinator selection of Gradient Text; P2-01/P2 are not complete.

1. [x] **Define authored assets.** A1/S1 retain native SVG/image/glyph content and explicit names/decorative policy; no package/asset fetch or renderer.
2. [x] **Map IconWrapper.** Native wrapper CSS has independent 24px size, 6px radius, background and inherited icon-color defaults.
3. [x] **Extract icon CSS.** CurrentColor is opt-in through authored paints; no fill/stroke reset or recursive SVG sizing. Native aspect metadata remains intact.
4. [x] **Accept native contexts.** A1 records named actions, native keyboard/focus, multicolor/stroke preservation, forced colors, nested viewport sizing, RTL/zoom and no-runtime coexistence.

### Native primitives and fallback

- **Native path:** authored SVG/img/text in neutral spans or actual native actions, with one
  accessible owner. Templates/asset fallback remain application-owned.
- **Small enhancement:** opt-in `.mui-icon` / `.mui-icon-wrapper` CSS only. It preserves
  native paints/viewBoxes/attributes and introduces no roles, event handlers, Shadow DOM,
  lifecycle, asset lookup, ESM/classic entry or registration-order rule.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/icon)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/icon/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/icon)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`;
historical baseline **5dcb190 / 0.11.0**, retained CSS-only implementation/evidence in A1/S1.
Inventory: **9 original public rows + 8 explicit source supplements = 17 rows**:
**10 Verified ADAPTED native targets and 7 Intentionally omitted framework contracts**.
Source supplements identify the Depth type, IconWrapper default content and six per-owner
theme declarations. No nonexistent tag prop is added; author-selected native tags/roles
replace source automatic i/div/img-role defaults without a renderer.


### Icon Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`color`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/icon/demos/enUS/index.demo-entry.md#L20) | Prop | ADAPTED external `--mui-icon-color` / inherited currentColor. | 🟢 Verified | No forced fill/stroke; explicit native paints remain authoritative. |
| [`depth`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/icon/demos/enUS/index.demo-entry.md#L21) | Prop | ADAPTED data-depth 1–5 and CSS opacity tokens. | 🟢 Verified | Whole-graphic de-emphasis, no forced base paint; forced colors restore visibility. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/icon/demos/enUS/index.demo-entry.md#L22) | Prop | ADAPTED CSS length in `--mui-icon-size`, inherited 1em default. | 🟢 Verified | No JS number/unit parser, attribute mutation or nested viewport reset. |
| [`component`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/icon/demos/enUS/index.demo-entry.md#L23) | Prop | Author native SVG/img/glyph content. | ⏭️ Intentionally omitted | No framework constructor/render adapter or icon-library dependency. |

### IconWrapper Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`border-radius`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/icon/demos/enUS/index.demo-entry.md#L29) | Prop | ADAPTED `--mui-icon-wrapper-radius`, default 6px. | 🟢 Verified | Native CSS shape, no inline style object. |
| [`color`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/icon/demos/enUS/index.demo-entry.md#L30) | Prop | ADAPTED `--mui-icon-wrapper-background`. | 🟢 Verified | Native background with primary default and forced-color accommodation. |
| [`icon-color`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/icon/demos/enUS/index.demo-entry.md#L31) | Prop | ADAPTED `--mui-icon-wrapper-color`. | 🟢 Verified | Inherited color, not rewriting fixed multicolor/stroke assets. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/icon/demos/enUS/index.demo-entry.md#L32) | Prop | ADAPTED `--mui-icon-wrapper-size`, default 24px. | 🟢 Verified | Wrapper and icon dimensions independent; not an automatic touch-target contract. |

### Icon Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/icon/demos/enUS/index.demo-entry.md#L38) | Slot | ADAPTED original native icon content. | 🟢 Verified | SVG/img/text nodes, ARIA/title/desc and native actions preserved; no renderer or cloning. |

### Explicit source-only supplements

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / scope |
| --- | --- | --- | --- | --- |
| [`Icon.Depth`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/icon/src/Icon.ts) | Source type alias | ADAPTED native CSS data-depth strings 1–5 or absence. | 🟢 Verified | Source numeric/string forms clarified; no fictional runtime/type export. |
| [`IconWrapper.default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/icon-wrapper/src/IconWrapper.tsx) | Source companion slot | ADAPTED original native wrapper children. | 🟢 Verified | Normal HTML composition; wrapper itself has no automatic semantic role. |
| [`Icon.theme`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/icon/src/Icon.ts) | Source theme prop | External CSS/tokens. | ⏭️ Intentionally omitted | No provider/theme object. |
| [`Icon.themeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/icon/src/Icon.ts) | Source theme prop | External scoped CSS. | ⏭️ Intentionally omitted | No runtime object adapter. |
| [`Icon.builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/icon/src/Icon.ts) | Source theme prop | External CSS source. | ⏭️ Intentionally omitted | No internal framework plumbing. |
| [`IconWrapper.theme`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/icon-wrapper/src/IconWrapper.tsx) | Source companion theme prop | External CSS/tokens. | ⏭️ Intentionally omitted | No provider/theme object. |
| [`IconWrapper.themeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/icon-wrapper/src/IconWrapper.tsx) | Source companion theme prop | External scoped CSS. | ⏭️ Intentionally omitted | No runtime object adapter. |
| [`IconWrapper.builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/icon-wrapper/src/IconWrapper.tsx) | Source companion theme prop | External CSS source. | ⏭️ Intentionally omitted | No internal framework plumbing. |

<!-- END PINNED API INVENTORY -->
