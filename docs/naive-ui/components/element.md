# Element

**Plan: Planned as native composition. Current baseline: native custom-element base/registration.**

## Baseline and target

[B1: element.ts](../../../src/core/element.ts) provides the base; [B2: registry](../../../src/components/elements.ts) registers existing elements.

- **HTML:** author the needed semantic native element directly.
- **JS:** no generic framework tag renderer or arbitrary prop forwarding.
- **CSS:** apply explicit classes/tokens to authored elements.
- **Placement:** no extra runtime controller; document native equivalents alongside existing base APIs.

## Acceptance and gaps

Test that semantic element choice remains authored and stable. A generic `tag` prop does not justify replacing arbitrary light-DOM subtrees.

## Migration steps

**Delivery phase:** P0 — native authoring conventions. **Task state:** 🔵 Planned.
**Prerequisites:** architecture's semantic HTML/light-DOM rules in the [master plan](../migration-plan.md).
**Next task:** document author-chosen native elements instead of a generic dynamic tag renderer.

1. [ ] **Map the tag surface.** Show semantic native equivalents and record why runtime tag replacement is excluded.
2. [ ] **Define content preservation.** Keep authored nodes, listeners and semantics intact when enhanced by a custom-element controller.
3. [ ] **Specify styling hooks.** Use explicit classes/tokens rather than framework props or injected style objects.
4. [ ] **Verify authoring examples.** Check heading/list/link semantics, pre-upgrade content and no-JS use without adding another runtime component.

### Native primitives and fallback

- **Native path:** authors choose semantic native elements directly. Use customElements and a small lifecycle controller only when adding behavior; native template cloning can repeat structure without rendering a dynamic tag schema.
- **Small enhancement:** detect custom-element/template support in the agreed browser matrix and retain authored static markup when absent. Light DOM remains default; native slot projection requires Shadow DOM and is not supplied by child naming. Avoid tag-renderer, Shadow DOM and custom-element polyfill requirements.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/element)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/element/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/element)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **2 local table rows + 0 supplementary declarations + 0 inherited rows = 2 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### Element Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`tag`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/element/demos/enUS/index.demo-entry.md#L17) | Prop | Author the semantic native element directly; no dynamic generic tag renderer. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### Element Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/element/demos/enUS/index.demo-entry.md#L23) | Slot | Candidate authored `default` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
