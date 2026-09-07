# Skeleton

**Plan: Planned. Current baseline: partial core size/hidden treatment; not parity-verified.**

## Baseline and target

[B1: content.ts](../../../src/components/content.ts) marks skeletons aria-hidden and applies initial width/height.

- **HTML:** decorative placeholder while real content retains a meaningful loading status.
- **JS:** none for static placeholders; owner controls loading state.
- **CSS:** external shape, repeated lines and reduced-motion animation.
- **Placement:** proposed `src/components/skeleton/`.

## Acceptance and gaps

Test layout stability, reduced motion, content replacement and no-JS fallback. Inline sizing must move to documented external CSS tokens/classes in the separated distribution.

## Migration steps

**Delivery phase:** P2 — loading presentation. **Task state:** 🔵 Planned.
**Prerequisites:** P0 external CSS and loading-announcement policy in the [master plan](../migration-plan.md).
**Next task:** separate decorative placeholders from the actual loading status and content owner.

1. [ ] **Define placeholder anatomy.** Preserve aria-hidden decorative regions and avoid replacing meaningful no-JS content.
2. [ ] **Extract size/shape rules.** Move width/height, lines, rounding and animation into external CSS tokens/classes.
3. [ ] **Specify owner transitions.** Let the data/content owner toggle loading rather than adding a second skeleton state store.
4. [ ] **Test replacement behavior.** Check layout shift, reduced motion, delayed content and removal without duplicate announcements or lingering placeholders.

### Native primitives and fallback

- **Native path:** decorative aria-hidden placeholders alongside a meaningful loading status; native template cloning is optional for repeated placeholder rows.
- **Small enhancement:** CSS shapes, logical sizes and reduced-motion media queries provide the entire effect. Feature-detect advanced visual selectors only as decoration and keep a static placeholder/text status fallback. The content owner controls loading; no skeleton custom-element lifecycle, animation library or generic template runtime is necessary.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/skeleton)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/skeleton/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/skeleton)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **9 local table rows + 0 supplementary declarations + 0 inherited rows = 9 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### Skeleton Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`text`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/skeleton/demos/enUS/index.demo-entry.md#L19) | Prop | Candidate presence attribute `text`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`round`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/skeleton/demos/enUS/index.demo-entry.md#L20) | Prop | External CSS token/class for `round`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`circle`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/skeleton/demos/enUS/index.demo-entry.md#L21) | Prop | External CSS token/class for `circle`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`height`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/skeleton/demos/enUS/index.demo-entry.md#L22) | Prop | External CSS token/class for `height`; define supported values and responsive behavior. | 🔵 Planned | B1 initial height style; partial only, verify this row. |
| [`width`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/skeleton/demos/enUS/index.demo-entry.md#L23) | Prop | External CSS token/class for `width`; define supported values and responsive behavior. | 🔵 Planned | B1 initial width style; partial only, verify this row. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/skeleton/demos/enUS/index.demo-entry.md#L24) | Prop | External CSS token/class for `size`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`repeat`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/skeleton/demos/enUS/index.demo-entry.md#L25) | Prop | Candidate `repeat` attribute or JS `repeat`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`animated`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/skeleton/demos/enUS/index.demo-entry.md#L26) | Prop | Candidate presence attribute `animated`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`sharp`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/skeleton/demos/enUS/index.demo-entry.md#L27) | Prop | Candidate presence attribute `sharp`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
