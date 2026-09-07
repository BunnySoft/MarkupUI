# Spin

**Migration status: 🟢 Verified for the retained native scope in this component change.**
Verified rows are **ADAPTED native targets**, not provider/pointer-blocking or announcement parity.
All fourteen original pinned rows are retained; source-only supplements are explicit.

## Baseline and target

[A1: retained contract and evidence](../../components/spin.md), [S1: controller/timing](../../../src/components/spin/spin.ts),
[S2: external CSS](../../../src/components/spin/spin.css) and [S3: registration](../../../src/components/spin/index.ts)
define the optional component. [B1: legacy registry](../../../src/components/elements.ts)
and [B2: legacy styles](../../../src/components/styles.ts) remain unchanged.

- **HTML:** native target/description/icon regions, original decorative SVG and readable label fallback.
- **JS:** validated geometry and real wrapped-display delay with cancellation/generation cleanup.
- **CSS:** scoped default/custom motion, size and nonblocking visual overlay with reduced motion.
- **Placement:** standalone `src/components/spin/`; no provider or mandatory icon dependency.

## Acceptance and gaps

A1 records **241 passing tests** (28 Spin-focused), build/budget gates and Chromium timing,
native control/focus, app-owned blocking, SVG/CSS/naming and load-order acceptance.
Core stays 14,611/15,000 gzip bytes. Spin ESM/classic/CSS measure 3,077/3,284/966 gzip bytes.
Wrapped content stays usable; Spin never mutates its busy/inert/hidden/disabled state.
Visual dimming is removed on hide/disconnect. Native blocking and announcements, if wanted,
are explicit application policy, not inferred from delayed indicator visibility.

## Migration steps

**Delivery phase:** P2 — loading feedback. **Task state:** 🟢 Verified retained scope.
**Prerequisites:** P0 status labels/timer disposal and external motion CSS in the [master plan](../migration-plan.md).
**Next task:** coordinator selection of Progress (P2-03), then Statistic; P2-02 retained scope is closed, not all of P2.

1. [x] **Define busy anatomy.** A1 separates standalone/wrapped display from actual application busy state; content remains native and operable.
2. [x] **Extract spinner CSS.** S2 and native SVG attributes provide size/stroke/radius/scale/rotation, original graphics and reduced motion without an icon package.
3. [x] **Scope optional delay.** S1 cancels on hide/hidden/invalid/disconnect/mode changes, preserves pending deadlines for unrelated updates and guards stale callbacks.
4. [x] **Accept short and long loads.** A1 records fake/real timer, native submit/reset/focus, naming, explicit app-owned inert restoration, reconnect and load-order evidence; no speech-timing certification is claimed.

### Native primitives and fallback

- **Native path:** readable description/fallback text and decorative SVG; native roles/live
  regions/busy attributes belong to the application. Static `.mui-spin` markup can use CSS alone.
- **Small enhancement:** one scoped display-delay timer and native region adoption, not an
  application loading store. CSS handles motion/centering. No automatic content blocking,
  focus trapping, announcing provider, VDOM or SVG animation runtime is introduced.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/spin)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/spin/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/spin)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`;
historical baseline **5dcb190 / 0.11.0**, retained implementation/evidence in A1/S1–S3.
Inventory: **14 original public-document rows + 4 explicit source supplements = 18 rows**:
**13 Verified ADAPTED native targets and 5 Intentionally omitted contracts**.
The shared loading radius/scale/stroke declarations are already public rows and are not
double-counted. There are no public events/methods/companion components. Native node/visibility/
validation accessors and the legacy label convenience are target extensions, not upstream rows.


### Spin Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`content-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/spin/demos/enUS/index.demo-entry.md#L21) | Prop | ADAPTED native class/classList on an authored content region. | 🟢 Verified | Classes and nodes preserved; no host class-string forwarding adapter. |
| [`content-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/spin/demos/enUS/index.demo-entry.md#L22) | Prop | Use external scoped content CSS. | ⏭️ Intentionally omitted | No style-string/object prop or runtime stylesheet adapter. |
| [`description`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/spin/demos/enUS/index.demo-entry.md#L23) | Prop | ADAPTED safe string attribute/property with native slot fallback. | 🟢 Verified | Nonblank property wins without destroying authored description; blank text treated as absent. |
| [`rotate`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/spin/demos/enUS/index.demo-entry.md#L24) | Prop | ADAPTED `.rotate` / `rotate="false"`, true default. | 🟢 Verified | Applies to custom icons only; reduced motion stops default and custom motion. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/spin/demos/enUS/index.demo-entry.md#L25) | Prop | ADAPTED 28/34/40px presets or nonnegative finite numeric size. | 🟢 Verified | Numeric custom-property sizing has an explicit CSP boundary; invalid values diagnosed/rejected. |
| [`show`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/spin/demos/enUS/index.demo-entry.md#L26) | Prop | ADAPTED `.show` / `show="false"`, true default, wrapped mode only. | 🟢 Verified | Standalone distinction retained; native hidden/removal still works. No actual busy-state inference. |
| [`stroke-width`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/spin/demos/enUS/index.demo-entry.md#L27) | Prop | ADAPTED validated native SVG stroke width. | 🟢 Verified | 20/18/16 preset defaults, 18 for numeric size; combined radius must remain valid. |
| [`radius`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/spin/demos/enUS/index.demo-entry.md#L28) | Prop | ADAPTED positive numeric outer radius, default 100. | 🟢 Verified | Native circle/viewBox geometry; no copied vendor asset or SMIL runtime. |
| [`scale`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/spin/demos/enUS/index.demo-entry.md#L29) | Prop | ADAPTED positive native viewBox scale, default 1. | 🟢 Verified | Derived geometry must be finite/positive; zoom/cropping scope in A1. |
| [`stroke`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/spin/demos/enUS/index.demo-entry.md#L30) | Prop | ADAPTED validated SVG paint color or external CSS token. | 🟢 Verified | Default graphic only; no inline color style-object rendering. |
| [`delay`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/spin/demos/enUS/index.demo-entry.md#L31) | Prop | ADAPTED integer milliseconds 0–2,147,483,647. | 🟢 Verified | One real wrapped timer, reliable cancellation, fresh reconnect and stale-generation guard. |

### Spin Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/spin/demos/enUS/index.demo-entry.md#L37) | Slot | ADAPTED native targets / `data-mui-spin-content`. | 🟢 Verified | Nodes/listeners/forms/ARIA preserved; intentionally usable rather than pointer-blocked content. |
| [`description`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/spin/demos/enUS/index.demo-entry.md#L38) | Slot | ADAPTED authored `data-mui-spin-description`. | 🟢 Verified | Original content/ARIA survives temporary property precedence and show/hide. |
| [`icon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/spin/demos/enUS/index.demo-entry.md#L39) | Slot | ADAPTED authored HTML/SVG `data-mui-spin-icon`. | 🟢 Verified | Native identity/hidden/ARIA retained, scoped custom rotation, no dependency or VNode renderer. |

### Explicit source-only supplements

These additions are source-declared deprecated/theme contracts, not extra public-doc rows.

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / scope |
| --- | --- | --- | --- | --- |
| [`spinning`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/spin/src/Spin.tsx) | Deprecated source prop | Use `show`. | ⏭️ Intentionally omitted | No deprecated precedence/compatibility/warning layer. |
| [`theme`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/spin/src/Spin.tsx) | Inherited source prop | External CSS/custom properties. | ⏭️ Intentionally omitted | No framework theme/provider object. |
| [`themeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/spin/src/Spin.tsx) | Inherited source prop | External scoped CSS. | ⏭️ Intentionally omitted | No runtime object-shape compatibility. |
| [`builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/spin/src/Spin.tsx) | Inherited source prop | External CSS source of truth. | ⏭️ Intentionally omitted | No internal framework override machinery. |

<!-- END PINNED API INVENTORY -->
