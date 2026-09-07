# Empty

**Migration status: 🟢 Verified for the retained native scope in this component change.**
Verified rows are **ADAPTED native targets**, not renderer/provider or pixel parity.
All seven original pinned rows are retained; source-only supplements are identified separately.

## Baseline and target

[A1: retained contract and evidence](../../components/empty.md), [S1: controller and original SVG](../../../src/components/empty/empty.ts),
[S2: external CSS](../../../src/components/empty/empty.css) and [S3: registration](../../../src/components/empty/index.ts)
define the optional implementation. [B1: legacy content.ts](../../../src/components/content.ts)
remains unchanged, including its original element-child fallback gate.

- **HTML:** readable description and optional native recovery action; decorative illustration is hidden.
- **JS:** generated fallback text/illustration, region adoption and live updates only; no action or announcement listener.
- **CSS:** external five-size illustration/text/extra layout and independent region visibility.
- **Placement:** standalone `src/components/empty/`; static native sections can use CSS alone.

## Acceptance and gaps

A1 records **190 passing tests** (23 Empty-focused), build/budget gates and Chromium namespace,
layout, localization, native action/form/focus, template, lifecycle and loading-order acceptance.
Core remains 14,611/15,000 gzip bytes. Empty ESM/classic/CSS are 1,596/1,805/759 gzip bytes.
The default illustration is original two-path decorative SVG, not a vendor asset; show-icon
can disable it. Authored content wins over fallbacks, and native roles/announcements remain
explicitly application-owned. No renderer, provider, mandatory Button or icon dependency exists.

## Migration steps

**Delivery phase:** P2 — feedback primitives. **Task state:** 🟢 Verified retained scope.
**Prerequisites:** P0 authored children and P1 Button for recovery actions in the [master plan](../migration-plan.md).
**Next task:** coordinator selection of Skeleton, then Spin; neither is started by this Empty change.

1. [x] **Preserve author content.** S1 adopts native description/icon/extra regions without cloning; independently missing regions get only their own fallback.
2. [x] **Separate illustration semantics.** Original SVG/path namespaces and decorative/nonfocusable metadata are verified; readable description remains the semantic source.
3. [x] **Extract layout/size rules.** S2 supplies five icon sizes, native layout, visibility and localization-friendly text without style/provider objects.
4. [x] **Accept empty-state transitions.** A1 covers authored/generated/late/replaced content, native submit/reset/link/key actions, focus/reconnect and explicit ARIA preservation; automatic announcements are intentionally not provided.

### Native primitives and fallback

- **Native path:** `.mui-empty` on a native section with authored description/extra regions
  needs no controller. Heading levels, action types and any live-region policy stay native.
- **Small enhancement:** the controller supplies only missing fallbacks and adopts explicit
  regions. Templates remain inert and outside layout; the app may clone them with native
  `document.importNode` and attach native listeners. No JS measurement, action synthesis,
  automatic announcement, icon package or generic template renderer is introduced.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/empty)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/empty/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/empty)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`;
historical baseline **5dcb190 / 0.11.0**, retained implementation/evidence in A1/S1–S3.
Inventory: **7 original public-document rows + 4 explicit source supplements = 11 rows**:
**7 Verified ADAPTED native targets and 4 Intentionally omitted framework contracts**.
The pinned page has no callbacks, methods, title prop or companion API. The legacy MarkupUI
plain-text `icon` convenience is retained as an extension, not invented as an upstream row.
Verification is retained native scope, not provider/default/pixel or all-browser parity.


### Empty Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`description`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/empty/demos/enUS/index.demo-entry.md#L19) | Prop | ADAPTED string attribute/property or authored native description. | 🟢 Verified | Safe localized text; authored content wins; absent means “No Data”, explicit empty stays empty rather than invoking provider locale fallback. |
| [`show-description`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/empty/demos/enUS/index.demo-entry.md#L20) | Prop | ADAPTED `.showDescription` / `show-description="false"`, true default. | 🟢 Verified | CSS visibility without discarding authored nodes or hiding extra actions. |
| [`show-icon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/empty/demos/enUS/index.demo-entry.md#L21) | Prop | ADAPTED `.showIcon` / `show-icon="false"`, true default. | 🟢 Verified | Native generated/custom icon visibility; authored attributes and identity preserved. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/empty/demos/enUS/index.demo-entry.md#L22) | Prop | ADAPTED tiny/small/medium/large/huge attribute/property. | 🟢 Verified | 28/34/40/46/52px icon ladder; medium default and external CSS overrides. |

### Empty Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/empty/demos/enUS/index.demo-entry.md#L28) | Slot | ADAPTED default nodes or `data-mui-empty-description`. | 🟢 Verified | Original headings/text/listeners win over fallback; no VNode renderer or inferred heading role. |
| [`extra`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/empty/demos/enUS/index.demo-entry.md#L29) | Slot | ADAPTED native `data-mui-empty-extra` region. | 🟢 Verified | Native buttons/links and form types remain author-owned; no action generation or mandatory Button module. |
| [`icon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/empty/demos/enUS/index.demo-entry.md#L30) | Slot | ADAPTED HTML/SVG/image `data-mui-empty-icon`. | 🟢 Verified | Native nodes/ARIA preserved; original decorative fallback SVG is not a vendor asset. |

### Explicit source-only supplements

These additions are declarations from the pinned implementation, not public Markdown rows.

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / scope |
| --- | --- | --- | --- | --- |
| [`renderIcon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/empty/src/Empty.tsx) | Source-declared prop | Use the authored native icon region. | ⏭️ Intentionally omitted | No VNode/provider render hook or function-prop adapter; useful native icon content is retained separately. |
| [`theme`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/empty/src/Empty.tsx) | Inherited source prop | External CSS/custom properties. | ⏭️ Intentionally omitted | No framework theme object/provider injection. |
| [`themeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/empty/src/Empty.tsx) | Inherited source prop | External scoped CSS. | ⏭️ Intentionally omitted | No runtime object-shape compatibility. |
| [`builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/empty/src/Empty.tsx) | Inherited source prop | External CSS source of truth. | ⏭️ Intentionally omitted | No internal framework override machinery. |

<!-- END PINNED API INVENTORY -->
