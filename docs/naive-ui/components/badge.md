# Badge

**Migration status: 🟢 Verified for the retained native scope in this component change.**
Verified rows are **ADAPTED native/CSS targets**, not upstream framework-prop parity.
All original pinned rows are preserved and source-only supplements are explicit.

## Baseline and target

[A1: accepted contract and evidence](../../components/badge.md) defines the retained scope.
[S1: controller](../../../src/components/badge/badge.ts), [S2: external CSS](../../../src/components/badge/badge.css)
and [S3: registration](../../../src/components/badge/index.ts) implement it.
The simple Badge in [B1: legacy styles](../../../src/components/styles.ts) and its passive
aggregate registration remain unchanged.

- **HTML:** visible count/status associated with its labelled target; decorative duplicates hidden.
- **JS:** optional safe count/text/cap/visibility updates, preserving native targets and custom values.
- **CSS:** external dot/count positioning, size/colors/offsets and reduced-motion processing.
- **Placement:** standalone `src/components/badge/`; static spans can use CSS alone.

## Acceptance and gaps

A1 records a successful build, **141 tests** (23 Badge-focused) and Chromium target form/focus,
visibility, naming, layout, 200% CSS zoom, motion and load-order acceptance. Core remains
14,611/15,000 gzip bytes. Badge ESM/classic/CSS are 1,452/1,661/963 gzip bytes.
Position offsets are CSS values rather than runtime tuples/style objects. Badge never
invents interactive, disabled, form-field or live-region semantics, changes a target name,
or emits redundant keyboard/change events. Applications own accessible count descriptions.

## Migration steps

**Delivery phase:** P2 — feedback primitives. **Task state:** 🟢 Verified retained scope.
**Prerequisites:** P0 accessible status text and P2 CSS placement in the [master plan](../migration-plan.md).
**Next task:** coordinator selection of Alert; no Alert implementation is started here.

1. [x] **Define readable meaning.** A1 defines target-owned names/descriptions, meaningful text and indicator-only decorative hiding; no duplicate announcer.
2. [x] **Resolve count display.** S1 preserves source value while formatting caps; zero/negative/text/custom/standalone and invalid numeric cases have tests.
3. [x] **Extract positioning.** S2 implements logical corners, CSS offsets, size/type and reduced-motion dot/processing presentation.
4. [x] **Verify updates and zoom.** A1 records target identity, native form/focus behavior, capped accessible names, reconnect, load orders and 200% CSS zoom.

### Native primitives and fallback

- **Native path:** `.mui-badge-value` on a native span is the controller-free static path.
  Authored targets and `data-mui-badge-value` regions preserve content and native semantics.
- **Small enhancement:** the controller changes only derived indicator text/state and adopts
  value regions without cloning. CSS owns placement, offsets and motion. Native targets and
  explicitly authored static text remain usable without scripting; no template/reactive
  framework, measurement engine or added interaction listener is introduced.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/badge)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/badge/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/badge)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`;
historical baseline **5dcb190 / 0.11.0**, retained implementation/evidence linked in A1/S1–S3.
Inventory: **10 original public-document rows + 4 explicit source supplements = 14 rows**:
**11 Verified ADAPTED native targets and 3 Intentionally omitted framework contracts**.
The pinned page has no events, methods, size/placement props or companion component.
MarkupUI's CSS sizing, placement and decorative conveniences are extensions, not new upstream
inventory rows. Verification covers A1's retained behavior, not all-browser/pixel parity.


### Badge Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`color`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/badge/demos/enUS/index.demo-entry.md#L26) | Prop | ADAPTED `--mui-badge-background` in external CSS. | 🟢 Verified | A1/S2; arbitrary CSS colors without runtime color prop/style adapter. |
| [`dot`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/badge/demos/enUS/index.demo-entry.md#L27) | Prop | ADAPTED Boolean attribute/property, circular indicator. | 🟢 Verified | A1/S1 preserve hidden numeric/custom children; dot is visual, not an implicit label. |
| [`max`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/badge/demos/enUS/index.demo-entry.md#L28) | Prop | ADAPTED optional finite nonnegative cap, `max+` display. | 🟢 Verified | Source value stays unchanged; numeric strings also participate, unlike upstream string rendering. |
| [`offset`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/badge/demos/enUS/index.demo-entry.md#L29) | Prop | ADAPTED `--mui-badge-offset-x` and `--mui-badge-offset-y`. | 🟢 Verified | External CSS lengths for attached badges; no JS tuple/inline transform API. Positive X right, Y down. |
| [`processing`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/badge/demos/enUS/index.demo-entry.md#L30) | Prop | ADAPTED Boolean attribute/property and CSS pulse. | 🟢 Verified | Reduced-motion alternative; no forced visibility, timer, busy role or announcer. |
| [`show-zero`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/badge/demos/enUS/index.demo-entry.md#L31) | Prop | ADAPTED Boolean attribute / `.showZero`. | 🟢 Verified | Allows zero and negatives; signed text preserved rather than integer-animation normalization. |
| [`show`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/badge/demos/enUS/index.demo-entry.md#L32) | Prop | ADAPTED `.show` / `show="false"`, true default. | 🟢 Verified | Hides only indicator, not native target; silent assignment. |
| [`type`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/badge/demos/enUS/index.demo-entry.md#L33) | Prop | ADAPTED default/success/error/warning/info CSS palettes. | 🟢 Verified | Default is error/red; native CSS color overrides available. |
| [`value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/badge/demos/enUS/index.demo-entry.md#L34) | Prop | ADAPTED finite number/text attribute/property, safe text output. | 🟢 Verified | A1/S1 cover blanks/nonfinite inputs, caps, decimals and silent updates; no odometer renderer. |

### Badge Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/badge/demos/enUS/index.demo-entry.md#L40) | Slot | ADAPTED native target children, preserved in place. | 🟢 Verified | No cloned target, Shadow DOM projection or name/focus/form rewriting. |

### Explicit source-only supplements

These additions are from the pinned implementation review, not the public Markdown table.

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / scope |
| --- | --- | --- | --- | --- |
| [`value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/badge/src/Badge.tsx) | Source-only slot | ADAPTED authored `data-mui-badge-value` region(s). | 🟢 Verified | A1/S1 preserve content/IDs/ARIA and prioritize custom content over generated counts; dot hides all content explicitly. |
| [`theme`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/badge/src/Badge.tsx) | Inherited source prop | External CSS/custom properties. | ⏭️ Intentionally omitted | No framework theme object or provider injection. |
| [`themeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/badge/src/Badge.tsx) | Inherited source prop | External scoped CSS. | ⏭️ Intentionally omitted | No runtime object-shape compatibility. |
| [`builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/badge/src/Badge.tsx) | Inherited source prop | External CSS source of truth. | ⏭️ Intentionally omitted | No framework-internal override machinery. |

<!-- END PINNED API INVENTORY -->
