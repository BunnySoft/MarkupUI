# Legacy Grid

**Plan: Intentionally omitted as a legacy API. Current baseline: modern grid/row primitives.**

## Baseline and target

[B1: foundation.ts](../../../src/components/foundation.ts) supports `mui-grid`; [B2: styles.ts](../../../src/components/styles.ts) provides row layout.

- **HTML:** ordinary containers preserving reading order.
- **JS:** no legacy Row/Col compatibility engine.
- **CSS:** use modern grid spans/gaps and responsive media/container queries.
- **Placement:** migrate to [Grid](grid.md), not a new legacy bundle.

## Acceptance and gaps

Record each Row/Col property disposition; verify equivalent layout examples rather than copying a fixed-column abstraction. Official category remains Layout, despite this plan's deliberate omission.

## Migration steps

**Delivery lane:** deferred/exclusions — legacy Row/Col API. **Task state:** 🔵 Planned for replacement guidance; API disposition ⏭️ Intentionally omitted.
**Prerequisites:** P2 modern Grid and P0 compatibility policy in the [master plan](../migration-plan.md).
**Next task:** translate each retained legacy layout use case into modern grid spans/gaps without creating a legacy controller.

1. [ ] **Record Row/Col dispositions.** Preserve each old property in the tracker with its modern CSS equivalent or explicit exclusion.
2. [ ] **Author conversion examples.** Show native containers, responsive grid tracks and item spans instead of fixed legacy column machinery.
3. [ ] **Check existing wrappers.** Keep current mui-grid/mui-row usage compatible without exposing the upstream legacy API.
4. [ ] **Verify replacement layouts.** Test responsive sizing, offsets and reading order; do not count omission as implementation.

### Native primitives and fallback

- **Native path:** modern CSS grid/flex on authored containers replaces the old Row/Col abstraction; native templates are optional application authoring aids only.
- **Small enhancement:** none is required. Guard container queries and optional modern selectors, retaining media-query or block-flow layouts. Do not create custom-element compatibility controllers, legacy breakpoint engines or grid polyfills to revive the omitted API.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/legacy-grid)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-grid/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-grid)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **5 local table rows + 0 supplementary declarations + 0 inherited rows = 5 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### Row Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`gutter`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-grid/demos/enUS/index.demo-entry.md#L26) | Prop | Use the modern linked alternative; no legacy compatibility contract. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### Col Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`span`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-grid/demos/enUS/index.demo-entry.md#L32) | Prop | Use the modern linked alternative; no legacy compatibility contract. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`offset`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-grid/demos/enUS/index.demo-entry.md#L33) | Prop | Use the modern linked alternative; no legacy compatibility contract. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`push`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-grid/demos/enUS/index.demo-entry.md#L34) | Prop | Use the modern linked alternative; no legacy compatibility contract. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`pull`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-grid/demos/enUS/index.demo-entry.md#L35) | Prop | Use the modern linked alternative; no legacy compatibility contract. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

<!-- END PINNED API INVENTORY -->
