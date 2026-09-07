# Skeleton

**Migration status: 🟢 Verified for the retained native/CSS scope in this component change.**
Verified rows are **ADAPTED targets**, not Fragment/theme or exact legacy-wrapper parity.
All nine original pinned rows are preserved; source-only theme supplements are explicit.

## Baseline and target

[A1: retained contract and evidence](../../components/skeleton.md), [S1: controller/validation](../../../src/components/skeleton/skeleton.ts),
[S2: external CSS](../../../src/components/skeleton/skeleton.css) and [S3: registration](../../../src/components/skeleton/index.ts)
define the optional implementation. [B1: legacy content.ts](../../../src/components/content.ts)
keeps its original host-hidden/initial geometry behavior unchanged.

- **HTML:** owned decorative/inert placeholder group; meaningful author content is not silently hidden.
- **JS:** bounded native row construction, validated dimension forwarding and lifecycle cleanup only.
- **CSS:** external shapes, text alignment, presets, native relative geometry and reduced-motion pulse.
- **Placement:** standalone `src/components/skeleton/`; static spans can use CSS alone.

## Acceptance and gaps

A1 records **213 passing tests** (23 Skeleton-focused), build/budget gates and Chromium
geometry, inertness/ownership, validation, reduced-motion, busy-state ownership and loading-order
acceptance. Core stays 14,611/15,000 gzip bytes. Skeleton ESM/classic/CSS are 1,802/2,007/786 gzip bytes.
External CSS/presets are preferred. Attribute geometry uses only isolated validated custom
property values (plus a bounded relative-height count), with an explicit CSP boundary.
Invalid attributes are diagnosed and suppress the group; invalid setters throw before mutation.

## Migration steps

**Delivery phase:** P2 — loading presentation. **Task state:** 🟢 Verified retained scope.
**Prerequisites:** P0 external CSS and loading-announcement policy in the [master plan](../migration-plan.md).
**Next task:** coordinator selection of Spin; it is not started by this Skeleton change.

1. [x] **Define placeholder anatomy.** S1 creates an aria-hidden/inert group and preserves authored nodes outside it; no blanket host hiding or template cloning.
2. [x] **Extract size/shape rules.** S2 owns layout/shape/pulse; S1 validates finite geometry and 0–100 repeat, with isolated style/CSP policy in A1.
3. [x] **Specify owner transitions.** The application owns actual busy/status/content state; no loading inference or automatic announcements.
4. [x] **Accept native replacement behavior.** A1 covers preserved nodes/rows, invalid recovery, percentages, circle geometry, reduced motion, inert focus blocking, reconnect and registration order.

### Native primitives and fallback

- **Native path:** an ordinary `.mui-skeleton` span with authored `aria-hidden`/`inert` and
  external CSS needs no controller. Real loading status remains outside decorative bars.
- **Small enhancement:** the Custom Element repeats only its own native spans and forwards
  validated dimensions; CSS handles geometry and motion. No animation runtime, Houdini
  registration, provider, data fetching, keyboard listener or generic template renderer.
  Templates remain inert; applications can build/clone their own static placeholder layouts.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/skeleton)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/skeleton/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/skeleton)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`;
historical baseline **5dcb190 / 0.11.0**, retained implementation/evidence in A1/S1–S3.
Inventory: **9 original public-document rows + 3 explicit source supplements = 12 rows**:
**9 Verified ADAPTED native targets and 3 Intentionally omitted framework contracts**.
The source has no public slots/events/methods/companion API. Target validation getters and
preserved author-node behavior are extensions, not invented upstream inventory rows.
Zero/bounds, native group layout, CSS/circle resolution and host ARIA policy differ as A1 states.


### Skeleton Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`text`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/skeleton/demos/enUS/index.demo-entry.md#L19) | Prop | ADAPTED Boolean attribute/property, inline-block and native baseline offset. | 🟢 Verified | A1/S2; no text renderer or owner-content hiding. |
| [`round`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/skeleton/demos/enUS/index.demo-entry.md#L20) | Prop | ADAPTED Boolean attribute/property and pill radius. | 🟢 Verified | Wins over sharp/soft; circle has higher precedence. |
| [`circle`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/skeleton/demos/enUS/index.demo-entry.md#L21) | Prop | ADAPTED width/height/size side selection and native aspect ratio. | 🟢 Verified | True-square geometry including percentage widths; CSS containing-block rules remain relevant. |
| [`height`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/skeleton/demos/enUS/index.demo-entry.md#L22) | Prop | ADAPTED validated native dimension attribute/property or external token. | 🟢 Verified | Per-row height; finite/nonnegative direct values, native CSS syntax, explicit errors and percentage-height basis. Isolated style/CSP trade-off in A1. |
| [`width`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/skeleton/demos/enUS/index.demo-entry.md#L23) | Prop | ADAPTED validated width and native CSS/token geometry. | 🟢 Verified | Numeric pixels, lengths, percentage and math; invalid input never silently becomes a guessed width. CSS-wide attribute keywords excluded explicitly. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/skeleton/demos/enUS/index.demo-entry.md#L24) | Prop | ADAPTED small/medium/large or absence. | 🟢 Verified | 28/34/40px; absence uses 1em; invalid enums are rejected/diagnosed. |
| [`repeat`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/skeleton/demos/enUS/index.demo-entry.md#L25) | Prop | ADAPTED bounded integer 0–100 native rows, default one. | 🟢 Verified | Zero means zero; invalid getter is undefined with diagnostics; no Fragment/VNode or authored-node cloning. |
| [`animated`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/skeleton/demos/enUS/index.demo-entry.md#L26) | Prop | ADAPTED `.animated` / `animated="false"`, true default. | 🟢 Verified | CSS pulse/reduced-motion only; no animation/Houdini runtime or loading-state implication. |
| [`sharp`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/skeleton/demos/enUS/index.demo-entry.md#L27) | Prop | ADAPTED `.sharp` / `sharp="false"`, true default. | 🟢 Verified | Native square/soft corner treatment; shape precedence in A1. |

### Explicit source-only supplements

These source theme declarations are separate from the original nine public rows.

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / scope |
| --- | --- | --- | --- | --- |
| [`theme`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/skeleton/src/Skeleton.tsx) | Inherited source prop | External CSS/custom properties. | ⏭️ Intentionally omitted | No framework theme object/provider injection. |
| [`themeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/skeleton/src/Skeleton.tsx) | Inherited source prop | External scoped CSS. | ⏭️ Intentionally omitted | No runtime object-shape compatibility. |
| [`builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/skeleton/src/Skeleton.tsx) | Inherited source prop | External CSS source of truth. | ⏭️ Intentionally omitted | No internal framework override machinery. |

<!-- END PINNED API INVENTORY -->
