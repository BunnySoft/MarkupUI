# Legacy Grid

**Resolved deprecated-API lane / verified native replacement.** Already shipped
Grid/Flex/Space CSS supplies the explicitly mapped capabilities; no Row/Col
constructor, prop parser, renderer or compatibility facade is introduced.

## Baseline and resolution

The unchanged [Grid stylesheet](../../../src/components/grid/grid.css),
[Flex stylesheet](../../../src/components/flex/flex.css) and
[Space stylesheet](../../../src/components/space/space.css) are the real target.
See [canonical migration/evidence](../../components/legacy-grid.md),
[separate HTML](../../../demo/components/legacy-grid.html),
[application CSS](../../../demo/components/legacy-grid.css) and
[tests](../../../tests/legacy-grid.test.ts). Modern [Grid acceptance](../../components/grid.md)
remains intact; existing MarkupUI wrappers are not Naive UI NRow/NCol aliases.

Reviewed pinned [Row](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-grid/src/Row.tsx),
[Col](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-grid/src/Col.tsx),
[Span type](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-grid/src/interface.ts#L1-L49),
[public exports](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-grid/index.ts#L1-L4),
[fixed 24-way styles](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-grid/src/styles/index.cssr.ts#L4-L44)
and [RTL physical positioning](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-grid/src/styles/rtl.cssr.ts#L4-L31).
There are no source named breakpoint props/objects to preserve or invent. Application
media/container examples are supplements to the migration guidance, not source API rows.

## Migration steps

**Delivery lane:** deferred/exclusions — deprecated Row/Col API.
**Task state:** resolved migration / 🟢 Verified native replacement.
**Prerequisites:** accepted modern Grid/Flex/Space; broad P0 foundations remain
parent-owned and are neither changed nor completed here.
**Next task:** Legacy Transfer replacement/exclusion resolution, separately.

1. [x] **Record Row/Col dispositions.** Original five identities, source-only props/
   slots/types and implementation boundaries each have explicit native mapping or omission.
2. [x] **Author conversions.** Real shipped stylesheets, valid responsive spans/gaps,
   nested defaults, explicit spacer/start comparison and native container queries.
3. [x] **Preserve existing wrappers.** Legacy MarkupUI coexistence without adopting
   Naive Row/Col syntax or changing the modern Grid implementation/acceptance.
4. [x] **Verify replacement layouts.** Actual browser geometry/thresholds/order/
   forms/hidden/media/no-JS plus tests/build, not old-framework parity.

### Native primitives and fallback

Semantic authored containers and children use .mui-grid/.mui-flex/.mui-space CSS.
No extra wrapper is generated; no grid role or keyboard model is implied by visual
layout. Compact defaults are valid without query support. Media/container rules are
application CSS, with an actual separate query ancestor. Original forms/labels/order
stay native. Relative offset/push/pull engines and legacy prop coercion remain omitted.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/legacy-grid)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-grid/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-grid)
- [Catalog/provenance](../index.md) · [Architecture/statuses](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`;
historical MarkupUI baseline **5dcb190 / 0.11.0**.
Inventory: **five original public rows + three grouped type/export supplements +
seven source supplements = 15 rows**, no inherited rows. Source useConfig/useStyle
does not spread theme props; no theme or breakpoint identities are invented.
**Six verified native replacements + nine omissions; zero unresolved.**
Verified means the documented target capability, not unchanged legacy API syntax.

### Row Props

| Upstream item · source | Kind | Explicit native replacement / omission | Status |
| --- | --- | --- | --- |
| [`gutter`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-grid/demos/enUS/index.demo-entry.md#L26) | Prop | Author Grid x/y gap or Flex/Space column/row gaps. Horizontal/vertical values become explicit CSS lengths; no legacy tuple/string coercion or half-gutter box algorithm. | 🟢 Verified |

### Col Props

| Upstream item · source | Kind | Explicit native replacement / omission | Status |
| --- | --- | --- | --- |
| [`span`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-grid/demos/enUS/index.demo-entry.md#L32) | Prop | --mui-grid-span on the real direct item, valid for the authored track count. Measured 8/16-of-24 and compact one-span layouts; no span prop/attribute facade. | 🟢 Verified |
| [`offset`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-grid/demos/enUS/index.demo-entry.md#L33) | Prop | Relative margin/wrapping contract omitted. Known empty spacers or explicit placement are bounded compositions; grid-column-start is absolute, not offset. | ⏭️ Intentionally omitted |
| [`push`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-grid/demos/enUS/index.demo-entry.md#L34) | Prop | No physical relative shift or visual reorder over unchanged reading/tab order. Author meaningful DOM order. | ⏭️ Intentionally omitted |
| [`pull`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-grid/demos/enUS/index.demo-entry.md#L35) | Prop | No inverse shift/overlap engine; native inline direction does not implement push/pull. | ⏭️ Intentionally omitted |

### Explicit grouped type/export supplements

| Upstream item · source | Kind | Explicit native replacement / omission | Status |
| --- | --- | --- | --- |
| [`RowProps / rowProps / NRow`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-grid/index.ts#L3-L4) | Source type/export group | No Vue prop extractor, Row constructor or alias; actual native container plus explicit CSS. | ⏭️ Intentionally omitted |
| [`ColProps / colProps / NCol`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-grid/index.ts#L1-L2) | Source type/export group | No Col constructor or generated wrapper/property interface. | ⏭️ Intentionally omitted |
| [`Span`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-grid/src/interface.ts#L1-L49) | Source type | No 1..24 number/string union export/parser. CSS integers are authored directly; no named breakpoints, implicit clamp or zero-span hiding promise. | ⏭️ Intentionally omitted |

### Explicit source props, slots and behavior supplements

These seven identities were absent from the original table inventory.

| Upstream item · source | Kind | Explicit native replacement / omission | Status |
| --- | --- | --- | --- |
| [`Row.alignItems`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-grid/src/Row.tsx#L25) | Source prop | --mui-flex-align on the actual flex container; no runtime prop forwarding. | 🟢 Verified |
| [`Row.justifyContent`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-grid/src/Row.tsx#L26) | Source prop | --mui-flex-justify for main-axis distribution, not Grid justify-items. | 🟢 Verified |
| [`Row.default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-grid/src/Row.tsx#L88) | Source slot | Original semantic native child nodes, form/label/order/identity retained; no slot callback. | 🟢 Verified |
| [`Col.default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-grid/src/Col.tsx#L75) | Source slot | Original native content; author needed grouping explicitly instead of source's gutter-dependent inner div. | 🟢 Verified |
| [`half-gutter margins / expanded width / item padding`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-grid/src/Row.tsx#L40-L71) | Source behavior | No compensation/coercion algorithm. Native gaps have their own box geometry, measured and documented. | ⏭️ Intentionally omitted |
| [`required Row injection`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-grid/src/Col.tsx#L35-L45) | Source behavior | No Row provider dependency or missing-parent exception. Real DOM/CSS ancestry determines layout. | ⏭️ Intentionally omitted |
| [`24-way physical offset / push / pull / RTL`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-grid/src/styles/rtl.cssr.ts#L4-L31) | Source behavior | No generated physical-margin/relative-shift classes. Native RTL inline-start and safe DOM order replace only the useful direction policy. | ⏭️ Intentionally omitted |

<!-- END PINNED API INVENTORY -->

## Acceptance and next route

**51 tests passed** (12 replacement + 12 unchanged modern Grid + 27 native/legacy),
declarations/build and all budgets. **1,316 distribution files byte-matched**.
No core/plugin/build/package/P0 foundation edits or new distribution.

Chromium measured real spans/gaps, 767/768px viewport and 479/480px container
thresholds, nested independence, spacer versus absolute start, RTL DOM/tab order,
native forms/reset/hidden FormData, 360px/200% zoom, media/no-JS/strict CSP and legacy
wrapper coexistence. Full local HTML/CSS plus existing Grid/Flex/Space CSS costs
**4,583 gzip bytes**; new demo-only portion **3,243**. No framework/breakpoint-parser
or all-browser/AT parity is claimed.

**Legacy Transfer is next**, not started here. Modern Grid remains accepted;
main P6 retained scopes remain complete and broader P0 foundations stay parent-owned.
