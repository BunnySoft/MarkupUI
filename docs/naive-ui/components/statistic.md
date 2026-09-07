# Statistic

**Migration status: 🟢 Verified for the retained passive native scope in this component change.**
Verified rows are **ADAPTED targets**, not formatter/provider or pixel parity.
All seven original pinned rows remain individually present; source supplements are explicit.

## Baseline and target

[A1: retained contract and evidence](../../components/statistic.md), [S1: controller](../../../src/components/statistic/statistic.ts),
[S2: external CSS](../../../src/components/statistic/statistic.css) and [S3: registration](../../../src/components/statistic/index.ts)
implement the standalone slice. [B1: legacy navigation.ts](../../../src/components/navigation.ts)
keeps its original label/value/prefix/suffix attribute implementation unchanged.

- **HTML:** native label/value/prefix/suffix regions and preserved headings/actions; a static dl pair needs no controller.
- **JS:** safe literal text updates and native region adoption only; optional Intl runs in application code.
- **CSS:** external hierarchy, logical spacing and tabular numeric typography.
- **Placement:** standalone `src/components/statistic/`, no provider/formatter/animation dependency.

## Acceptance and gaps

A1 records **290 passing tests** (20 Statistic-focused), build/budget gates and Chromium
literal values, authored precedence, native actions/forms/names, Intl-string presentation,
tabular typography, reconnect and load-order acceptance. Core stays 14,611/15,000 gzip bytes.
Statistic ESM/classic/CSS are 1,540/1,745/577 gzip bytes. Formatting options and Number Animation
are not part of the pinned API and are not silently added.

## Migration steps

**Delivery phase:** P2 — numeric display. **Task state:** 🟢 Verified retained scope.
**Prerequisites:** P0 child ownership/native CSS contracts in the [master plan](../migration-plan.md); no Typography runtime import is required.
**Next task:** coordinator selection of Typography (P2-01), then Icon and remaining content/layout.

1. [x] **Choose semantic output.** A1 defines literal zero/blank/missing/nonfinite values, native labelled regions and static dl markup without auto-live output roles.
2. [x] **Resolve formatting.** Statistic preserves strings verbatim; applications can pass native Intl output. No formatter or currency/precision prop is invented.
3. [x] **Extract visual hierarchy.** S2 owns label/value/affix styling and tabular figures; no inline styles or Number Animation dependency.
4. [x] **Accept native updates.** A1 covers authored nodes/headings/ARIA, reversible overrides, native actions/forms, quiet updates, templates, pre-upgrade/reconnect and load ordering.

### Native primitives and fallback

- **Native path:** a labelled native text/dl pair with explicit prefix/suffix content.
  Static `.mui-statistic` CSS needs no Custom Element. Native output/live semantics are
  author choices, not generated just to display a number.
- **Small enhancement:** the controller adopts four native regions and changes only safe
  text/owned visibility. It never parses formatted strings, clones templates, generates
  user events or infers group/heading/progress/loading roles.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/statistic)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/statistic/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/statistic)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`;
historical baseline **5dcb190 / 0.11.0**, retained implementation/evidence in A1/S1–S3.
Inventory: **7 original public-document rows + 3 explicit source theme supplements = 10 rows**:
**7 Verified ADAPTED targets and 3 Intentionally omitted contracts**.
Legacy prefix/suffix attributes remain target extensions; `.valuePrefix`/`.valueSuffix`
avoid shadowing native readonly `Element.prefix`. There are no formatter/animation props,
events, methods or companion APIs to invent as upstream rows.


### Statistic Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`label`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/statistic/demos/enUS/index.demo-entry.md#L17) | Prop | ADAPTED string attribute/property with nonempty-prop precedence. | 🟢 Verified | Native authored label/heading nodes return when the override is cleared; no inferred heading or group role. |
| [`tabular-nums`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/statistic/demos/enUS/index.demo-entry.md#L18) | Prop | ADAPTED Boolean `.tabularNums` / attribute and CSS font-variant-numeric. | 🟢 Verified | False by default; numeric typography only, not parsing/formatting. |
| [`value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/statistic/demos/enUS/index.demo-entry.md#L19) | Prop | ADAPTED literal string/finite-number attribute/property. | 🟢 Verified | Zero/blank/missing distinct; no NaN/zero coercion, formatter or automatic animation. |

### Statistic Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/statistic/demos/enUS/index.demo-entry.md#L25) | Slot | ADAPTED default/value-region native content. | 🟢 Verified | Present value prop overrides reversibly, including explicit empty; nodes/listeners are not discarded. |
| [`label`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/statistic/demos/enUS/index.demo-entry.md#L26) | Slot | ADAPTED `data-mui-statistic-label` native region. | 🟢 Verified | Authored headings/IDs/ARIA preserved under defined prop precedence. |
| [`prefix`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/statistic/demos/enUS/index.demo-entry.md#L27) | Slot | ADAPTED native `data-mui-statistic-prefix`. | 🟢 Verified | Native SVG/text/actions retained, preferred over legacy text fallback; no renderer. |
| [`suffix`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/statistic/demos/enUS/index.demo-entry.md#L28) | Slot | ADAPTED native `data-mui-statistic-suffix`. | 🟢 Verified | Units/links/buttons stay native with preserved form types/listeners. |

### Explicit source-only supplements

These inherited source declarations are separate from the seven pinned public rows.

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / scope |
| --- | --- | --- | --- | --- |
| [`theme`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/statistic/src/Statistic.tsx) | Inherited source prop | External CSS/custom properties. | ⏭️ Intentionally omitted | No framework theme object/provider injection. |
| [`themeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/statistic/src/Statistic.tsx) | Inherited source prop | External scoped CSS. | ⏭️ Intentionally omitted | No runtime object-shape compatibility. |
| [`builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/statistic/src/Statistic.tsx) | Inherited source prop | External CSS source of truth. | ⏭️ Intentionally omitted | No internal framework override machinery. |

<!-- END PINNED API INVENTORY -->
