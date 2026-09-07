# Card

**Migration status: 🟢 Verified for the retained native scope in `cebc6d7`.**
Framework-specific and deliberately reduced contracts are not counted as upstream parity.

## Baseline and target

[A1: accepted implementation and evidence](../../components/card.md) defines the retained
contract. [S1: controller](../../../src/components/card/card.ts),
[S2: external CSS](../../../src/components/card/card.css), and
[S3: standalone registration](../../../src/components/card/index.ts) implement it.
The legacy aggregate remains unchanged; its basic Card is the historical comparison baseline.

- **HTML:** authored cover/header/header-extra/content/footer/action regions, preserving native
  headings, controls, nodes and listeners. Free-form content is adopted without cloning.
- **JS:** synchronize retained attributes/regions and emit close intent from a native button.
- **CSS:** external `card.css` owns padding, borders, segmentation, scrolling and hover appearance.
- **Placement:** standalone `src/components/card/`; not added to the aggregate core.

## Acceptance and gaps

A1 records a successful build, **92 passing tests** and Chromium keyboard/focus, form-safety,
scrolling and load-order acceptance. Core remains 14,611/15,000 gzip bytes. Enhanced Card
registers before the legacy aggregate; the reverse order reports a conflict.
The close control emits intent only: removal and any resulting focus restoration belong to
the application. `close-focusable` deliberately defaults true. No arbitrary host-tag
replacement, VNode callback, theme object or runtime style-object forwarding is supplied.

## Migration steps

**Delivery phase:** P1 — pilot. **Task state:** 🟢 Verified for the retained scope.
**Prerequisites:** P0 authored-child/CSS contracts and pilot loading conventions in the [master plan](../migration-plan.md).
**Next task:** continue to P2 Tag; reopen omitted Card scope only through a separate decision.

1. [x] **Specify card anatomy.** A1/S1 define six native regions, preserve free-form content and keep heading/landmark decisions explicit.
2. [x] **Separate card styling.** S2 implements padding, segmentation, borders, size, scroll and hover states without runtime style objects.
3. [x] **Add close intent only.** A native button emits one cancellable event; application removal/focus policy is not silently executed.
4. [x] **Accept retained layouts.** A1 records late/changed children, node identity, native controls, build/test/browser evidence and payload limits.

### Native primitives and fallback

- **Native path:** authored sections/headings/footer remain light DOM; passive regions need
  no Custom Element registration. Templates remain inert and application-owned.
- **Small enhancement:** the Card controller adopts regions and creates a native close button
  only when requested. External CSS flex layout, scrolling and state selectors handle
  presentation. These are authored-child conventions, not native Shadow DOM slots.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/card)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/card/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/card)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`;
original baseline **5dcb190 / 0.11.0**, retained implementation **cebc6d7**.
Inventory: **30 public-document rows + 4 explicit source-only supplements = 34 tracker rows**.
There are **26 Verified adapted native targets and 8 Intentionally omitted contracts**.
Verification refers to A1's retained implementation, not every upstream internal behavior or
all-browser/pixel parity. Return-value/render overloads and defaults may differ as stated.


### Card Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`action`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/card/demos/enUS/index.demo-entry.md#L29) | Prop | Authored action region, not a render callback. | 🟢 Verified | A1/S1 preserve native controls and content. |
| [`bordered`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/card/demos/enUS/index.demo-entry.md#L30) | Prop | Attribute/property; true default, explicit `"false"` opt-out. | 🟢 Verified | A1/S2 retain geometry with a transparent border. |
| [`closable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/card/demos/enUS/index.demo-entry.md#L31) | Prop | Presence attribute / `.closable`; native button. | 🟢 Verified | A1/S1; close intent without removal or form submission. |
| [`close-focusable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/card/demos/enUS/index.demo-entry.md#L32) | Prop | Attribute / `.closeFocusable`; explicit false removes Tab focus. | 🟢 Verified | Intentional accessible true default; A1 describes pointer/programmatic focus. |
| [`content`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/card/demos/enUS/index.demo-entry.md#L33) | Prop | Authored free-form or content-region nodes. | 🟢 Verified | Native content equivalent; string/function prop omitted. |
| [`content-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/card/demos/enUS/index.demo-entry.md#L34) | Prop | Native class/classList on content region. | 🟢 Verified | No host string-forwarding API; A1/S1 preserve authored classes. |
| [`content-scrollable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/card/demos/enUS/index.demo-entry.md#L35) | Prop | Presence attribute / `.contentScrollable` and native overflow. | 🟢 Verified | Requires author-supplied height/max-height; A1 browser evidence. |
| [`content-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/card/demos/enUS/index.demo-entry.md#L36) | Prop | Use external content CSS. | ⏭️ Intentionally omitted | No runtime style-string/object passthrough. |
| [`cover`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/card/demos/enUS/index.demo-entry.md#L37) | Prop | Authored cover region and native image/picture. | 🟢 Verified | Native content equivalent; render overload omitted. |
| [`embedded`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/card/demos/enUS/index.demo-entry.md#L38) | Prop | Presence attribute / `.embedded` and muted-background token. | 🟢 Verified | No automatic provider/modal theme-context detection. |
| [`footer`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/card/demos/enUS/index.demo-entry.md#L39) | Prop | Authored footer region. | 🟢 Verified | Native content equivalent; render overload omitted. |
| [`footer-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/card/demos/enUS/index.demo-entry.md#L40) | Prop | Native class/classList on footer. | 🟢 Verified | No host class-forwarding adapter. |
| [`footer-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/card/demos/enUS/index.demo-entry.md#L41) | Prop | External footer CSS. | ⏭️ Intentionally omitted | Style object/string API omitted. |
| [`header-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/card/demos/enUS/index.demo-entry.md#L42) | Prop | Native class/classList on header. | 🟢 Verified | A1/S1 preserve authored classes and regions. |
| [`header-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/card/demos/enUS/index.demo-entry.md#L43) | Prop | External header CSS. | ⏭️ Intentionally omitted | Style object/string API omitted. |
| [`header-extra`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/card/demos/enUS/index.demo-entry.md#L44) | Prop | Authored extra region, inside header or adopted from direct child. | 🟢 Verified | Native content equivalent; render overload omitted. |
| [`header-extra-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/card/demos/enUS/index.demo-entry.md#L45) | Prop | Native class/classList on extra region. | 🟢 Verified | No host class-forwarding adapter. |
| [`header-extra-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/card/demos/enUS/index.demo-entry.md#L46) | Prop | External header-extra CSS. | ⏭️ Intentionally omitted | Style object/string API omitted. |
| [`hoverable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/card/demos/enUS/index.demo-entry.md#L47) | Prop | Presence attribute / `.hoverable`; CSS shadow/border. | 🟢 Verified | Does not introduce a click target or Tab stop. |
| [`segmented`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/card/demos/enUS/index.demo-entry.md#L48) | Prop | Boolean plus per-region segmented attributes. | 🟢 Verified | Full/inset/off separators; upstream object shape replaced, see A1. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/card/demos/enUS/index.demo-entry.md#L49) | Prop | Small/medium/large/huge attribute / `.size` and external CSS. | 🟢 Verified | A1 records 16/24/32/40px padding; medium default. |
| [`tag`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/card/demos/enUS/index.demo-entry.md#L50) | Prop | Author native semantic regions or a wrapper. | ⏭️ Intentionally omitted | Custom Element host is not replaced by an arbitrary tag. |
| [`title`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/card/demos/enUS/index.demo-entry.md#L51) | Prop | Plain-text native title fallback; authored header wins. | 🟢 Verified | Render-function overload omitted; native tooltip semantics retained. |
| [`on-close`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/card/demos/enUS/index.demo-entry.md#L52) | Callback | Bubbling cancellable `mui:close` with `detail.originalEvent`. | 🟢 Verified | One intent per activation; no function/array callback adapter or removal. |

### Card Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`cover`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/card/demos/enUS/index.demo-entry.md#L58) | Slot | Direct authored cover region. | 🟢 Verified | A1/S1 preserve native image/content nodes. |
| [`header`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/card/demos/enUS/index.demo-entry.md#L59) | Slot | Direct header with explicit native heading. | 🟢 Verified | No inferred heading level or duplicate heading role. |
| [`header-extra`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/card/demos/enUS/index.demo-entry.md#L60) | Slot | Extra child inside header, or direct extra adopted into it. | 🟢 Verified | A1/S1 preserve controls and listeners. |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/card/demos/enUS/index.demo-entry.md#L61) | Slot | Free-form or explicit content-region nodes. | 🟢 Verified | Native wrapper adoption, not cloning/rendering. |
| [`footer`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/card/demos/enUS/index.demo-entry.md#L62) | Slot | Direct authored footer region. | 🟢 Verified | Native actions remain author-owned. |
| [`action`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/card/demos/enUS/index.demo-entry.md#L63) | Slot | Direct authored action region. | 🟢 Verified | Native controls and their listeners preserved. |

### Explicit source-only supplements

These are additions from the implementation review, not rows from the public Markdown table.

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / scope |
| --- | --- | --- | --- | --- |
| [`role`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/card/src/Card.tsx) | Source prop | Native host role and author-supplied ARIA name. | 🟢 Verified | Preserved rather than inferred; A1. |
| [`theme`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/card/src/Card.tsx) | Inherited source prop | External CSS/theme tokens instead of framework objects. | ⏭️ Intentionally omitted | No provider injection or runtime theme adapter. |
| [`themeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/card/src/Card.tsx) | Inherited source prop | External scoped CSS/custom properties. | ⏭️ Intentionally omitted | Object-shape compatibility not implemented. |
| [`builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/card/src/Card.tsx) | Inherited source prop | External CSS source of truth. | ⏭️ Intentionally omitted | No framework-internal override plumbing. |

<!-- END PINNED API INVENTORY -->
