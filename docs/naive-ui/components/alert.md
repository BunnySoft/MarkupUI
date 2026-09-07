# Alert

**Migration status: 🟢 Verified for the retained native scope in this component change.**
Verified rows are **ADAPTED native targets**, not upstream lifecycle/framework parity.
All ten original pinned rows remain present; source-only supplements are explicit.

## Baseline and target

[A1: retained contract and acceptance](../../components/alert.md), [S1: native controller](../../../src/components/alert/alert.ts),
[S2: external CSS](../../../src/components/alert/alert.css) and [S3: registration](../../../src/components/alert/index.ts)
define the new standalone slice. [B1: legacy registry](../../../src/components/elements.ts)
and [B2: legacy styles](../../../src/components/styles.ts) remain the unchanged historical baseline.

- **HTML:** heading/body and optional close button; alert/status role selected for actual urgency.
- **JS:** safe title/region updates and native cancellable close intent; no automatic removal, announcement or focus recovery.
- **CSS:** external semantic variants, HTML/SVG icons, borders, logical layout and reduced motion.
- **Placement:** standalone `src/components/alert/`; CSS-only native notices need no controller.

## Acceptance and gaps

A1 records **167 passing tests** (26 Alert-focused), build/budget gates and Chromium native
keyboard/focus/forms, explicit roles, DOM stability, CSS and load-order acceptance.
Core remains 14,611/15,000 gzip bytes. Alert ESM/classic/CSS are 1,770/1,981/1,233 gzip bytes.
Static notices receive no forced live role; author `status`/`alert` semantics for actual intent.
Unlike upstream, close never hides/removes content or awaits Boolean/promise callback results.
No leave/hide event is fabricated. Actual spoken announcement timing is not certified.

## Migration steps

**Delivery phase:** P2 — feedback primitives. **Task state:** 🟢 Verified retained scope.
**Prerequisites:** P1 Button and P0 announcement/child-ownership rules in the [master plan](../migration-plan.md).
**Next task:** coordinator selection of Empty, then Skeleton/Spin; none are started by this Alert change.

1. [x] **Define authored regions.** S1 preserves native header/content/icon/action nodes, headings, controls and clear close labels; templates stay inert.
2. [x] **Specify close ownership.** Native close emits intent only; Boolean/promise-result removal, after-leave and post-removal focus policy are explicitly not provided.
3. [x] **Extract alert variants.** S2 owns color, borders, glyph/SVG sizing, spacing and RTL; A1 requires readable severity text rather than color alone.
4. [x] **Accept native announcement boundaries.** A1 verifies static versus explicit live roles, unchanged ARIA/control identity on text updates and native keyboard close. Actual assistive-technology speech timing remains a downstream check, not claimed verification.

### Native primitives and fallback

- **Native path:** an ordinary `.mui-alert` section with authored header/body/icon is styled
  without a controller. Live-region semantics are opt-in native attributes, not severity inference.
- **Small enhancement:** the Custom Element adopts regions and creates one named native close
  button when requested. CSS grid/logical properties provide layout without measurements.
  Unenhanced authored text remains readable; no fake close action, renderer/provider or
  duplicate announcer is introduced.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/alert)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/alert/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/alert)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`;
historical baseline **5dcb190 / 0.11.0**, retained implementation/evidence linked in A1/S1–S3.
Inventory: **10 original public-document rows + 4 explicit source supplements = 14 rows**:
**9 Verified ADAPTED native targets and 5 Intentionally omitted contracts**.
Default static semantics and intent-without-removal differ deliberately from source
`role="alert"` and asynchronous auto-hide. Verification is A1's retained scope, not exact
callback/default behavior, pixel parity or all-browser/assistive-technology certification.


### Alert Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`bordered`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/alert/demos/enUS/index.demo-entry.md#L22) | Prop | ADAPTED `.bordered` / `bordered="false"`, true default. | 🟢 Verified | S2 makes borders transparent without geometry shifts; no runtime styles. |
| [`closable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/alert/demos/enUS/index.demo-entry.md#L23) | Prop | ADAPTED native close control and intent event. | 🟢 Verified | A1/S1; no automatic hiding/removal or form submission. |
| [`show-icon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/alert/demos/enUS/index.demo-entry.md#L24) | Prop | ADAPTED `.showIcon` / `show-icon="false"`, true default. | 🟢 Verified | Custom HTML/SVG preserved; generated glyphs decorative; default type has no empty icon. |
| [`title`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/alert/demos/enUS/index.demo-entry.md#L25) | Prop | ADAPTED native string title fallback or authored header. | 🟢 Verified | Safe text; authored header wins; native tooltip retained and heading level not inferred. |
| [`type`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/alert/demos/enUS/index.demo-entry.md#L26) | Prop | ADAPTED default/info/success/warning/error CSS and glyphs. | 🟢 Verified | Appearance does not infer an assertive role or rewrite authored severity text. |
| [`on-after-leave`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/alert/demos/enUS/index.demo-entry.md#L27) | Callback | Application owns completion of its own hiding/removal. | ⏭️ Intentionally omitted | No auto-hide or transition lifecycle exists; no fabricated after-leave event. |
| [`on-close`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/alert/demos/enUS/index.demo-entry.md#L28) | Callback | ADAPTED cancellable bubbling `mui:close`, `detail.originalEvent`. | 🟢 Verified | Intent only. Boolean/promise callback results and upstream default auto-hide are explicitly not implemented. |

### Alert Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/alert/demos/enUS/index.demo-entry.md#L34) | Slot | ADAPTED native default/content-region nodes and actions. | 🟢 Verified | Original nodes/listeners/native form behavior retained; no VNode renderer or invented action slot. |
| [`header`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/alert/demos/enUS/index.demo-entry.md#L35) | Slot | ADAPTED `data-mui-alert-header` with native headings. | 🟢 Verified | Authored hierarchy preserved; no duplicate heading/landmark/live semantics. |
| [`icon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/alert/demos/enUS/index.demo-entry.md#L36) | Slot | ADAPTED HTML/SVG `data-mui-alert-icon`. | 🟢 Verified | Nodes, listeners and authored ARIA retained; CSS controls visibility and size. |

### Explicit source-only supplements

These four source-declared additions are distinct from the pinned public Markdown rows.

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / scope |
| --- | --- | --- | --- | --- |
| [`onAfterHide`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/alert/src/Alert.tsx) | Deprecated source callback | Application-owned removal/hide policy. | ⏭️ Intentionally omitted | No deprecated alias, warning machinery or automatic leave lifecycle. |
| [`theme`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/alert/src/Alert.tsx) | Inherited source prop | External CSS/custom properties. | ⏭️ Intentionally omitted | No framework theme object or provider injection. |
| [`themeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/alert/src/Alert.tsx) | Inherited source prop | External scoped CSS. | ⏭️ Intentionally omitted | No runtime object-shape compatibility. |
| [`builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/alert/src/Alert.tsx) | Inherited source prop | External CSS source of truth. | ⏭️ Intentionally omitted | No internal framework override pipeline. |

<!-- END PINNED API INVENTORY -->
