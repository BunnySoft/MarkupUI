# Breadcrumb

**Plan: 🟢 Verified for retained native Breadcrumb/BreadcrumbItem scope; three explicit theme omissions.**

## Baseline and target

[B1: widgets.ts](../../../src/plugins/widgets.ts) retains its legacy host label and separator
styles. The accepted native navigation is separate and does not redefine those optional
plugin elements.

- **HTML:** named native `nav`, direct `ol`/`ul` and `li`, real destination anchors, explicit current-page or unavailable text.
- **JS:** none in the component or demo; native navigation and optional application listeners only.
- **CSS:** isolated decorative separators, wrapping, focus and logical direction.
- **Placement:** [breadcrumb.css](../../../src/components/breadcrumb/breadcrumb.css), stylesheet export and [native demo](../../../demo/components/breadcrumb.html); no router integration.

## Acceptance and gaps

The [canonical acceptance record](../../components/breadcrumb.md) reports 443 passing tests
(12 Breadcrumb cases), build/budget gates and Chromium navigation/current-attribute/
disabled-keyboard/separator/hidden/narrow/RTL/zoom/print/forced-colors/legacy/no-JS evidence.
CSS is 928 gzip bytes; component/demo JS is zero. Core remains 14,611/15,000 and widgets
2,779/4,000 gzip bytes. Native attributes/accessibility structure were inspected; current-page
screen-reader speech and all-browser/framework parity were not certified.

## Migration steps

**Delivery phase:** P2 — static navigation composition. **Task state:** 🟢 Verified retained scope.
**Prerequisites:** P2 native links/list anatomy and external CSS in the [master plan](../migration-plan.md).
**Next task:** Thing is the suggested next P2 component after the complete residual-index
review in the master plan; it has not started. Full P2 is not complete.

1. [x] **Preserve real navigation.** Native href/target/rel behavior and application click listeners, without a router or pseudo-links.
2. [x] **Define item regions.** Authored default/separator regions and decorative icons within valid list items; no invented icon slot.
3. [x] **Extract wrapping rules.** External long-label/logical wrapping and guarded visible-sibling separators, with no measurement.
4. [x] **Verify path semantics.** Native current-page attributes, nav/list accessibility structure, disabled-keyboard behavior, RTL and no-JS navigation.

### Native primitives and fallback

- **Native path:** named `nav` containing a real ordered/unordered list and anchors/passive text; explicit aria-current and native hidden/template states stay author-owned.
- **Small enhancement:** CSS flex/wrap/logical gaps and guarded `:has()` separator boundaries. Unsupported engines retain navigation/list content without separators. No router, pseudo-link controller, generated headings, announcement engine or Shadow DOM slot layer.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/breadcrumb)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/breadcrumb/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/breadcrumb)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **8 original local table rows + 4 explicit source-only supplements + 0 inherited rows = 12 tracker rows**.
All original owner/row/pinned identities remain: **9 Verified ADAPTED native targets and
3 Intentionally omitted contracts**. Breadcrumb/BreadcrumbItem and presentation source
were reviewed for retained behavior, not every framework edge case. The canonical record
defines native defaults, omissions and actual acceptance evidence.


### Breadcrumb Props

| Upstream item · source | Kind | Retained MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`separator`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/breadcrumb/demos/enUS/index.demo-entry.md#L20) | Prop | Repeated authored separator spans; empty default draws a non-text slash, custom shared content is authored per item. | 🟢 Verified ADAPTED target | No root string forwarding/provider. Valid list items, decorative semantics and guarded last-visible boundaries. |

### BreadcrumbItem Props

| Upstream item · source | Kind | Retained MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`clickable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/breadcrumb/demos/enUS/index.demo-entry.md#L26) | Prop | Native destination anchor versus passive span/placeholder; no clickable parser or pointer-only disabling. | 🟢 Verified ADAPTED target | Keyboard skips unavailable/current spans; real anchors navigate. Source flag is styling, not disabled semantics. |
| [`href`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/breadcrumb/demos/enUS/index.demo-entry.md#L27) | Prop | Authored native a[href], target/rel and browser navigation. | 🟢 Verified ADAPTED target | Real fragments and new-tab noopener verified; no router/history interception or auto current-URL comparison. |
| [`separator`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/breadcrumb/demos/enUS/index.demo-entry.md#L28) | Prop | This item's authored separator text/SVG replaces the empty CSS shape. | 🟢 Verified ADAPTED target | Custom glyph/SVG preserved and explicitly decorative; no string rendering or inherited prop precedence. |
| [`show-separator`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/breadcrumb/demos/enUS/index.demo-entry.md#L29) | Prop | Default visible-sibling rule; exact item data-show-separator="false" opts out. | 🟢 Verified ADAPTED target | Live opt-out/restore; last visible item remains separator-free, including hidden/template endings. |

### Breadcrumb Slots

| Upstream item · source | Kind | Retained MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/breadcrumb/demos/enUS/index.demo-entry.md#L35) | Slot | Named nav with direct native list/items/templates. | 🟢 Verified ADAPTED target | Real landmarks/listitems, original order/nodes and explicit markerless-role caveat; no VNode renderer. |

### Breadcrumb Item Slots

| Upstream item · source | Kind | Retained MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/breadcrumb/demos/enUS/index.demo-entry.md#L41) | Slot | Actual native link/text content inside an authored row. | 🟢 Verified ADAPTED target | Names, icons, current-page attributes and listeners preserved; no generated heading or pseudo-link. |
| [`separator`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/breadcrumb/demos/enUS/index.demo-entry.md#L42) | Slot | Decorative separator span inside the same li row, with authored contents. | 🟢 Verified ADAPTED target | Never an invalid direct ol child; custom text/SVG hidden from duplicate accessibility output. |

### Explicit source-only supplements

These four entries supplement, rather than replace, the original eight rows.
Automatic `aria-current="location"` URL comparison and last-child visual emphasis are
implementation observations, not extra props: the native target instead requires explicit
`aria-current="page"`. No target/style/disabled/overflow-menu/router/icon-slot API is invented.

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`onClick`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/breadcrumb/src/BreadcrumbItem.tsx) | Source-only BreadcrumbItem callback prop | Application native click listener on the actual action. | 🟢 Verified ADAPTED target | Native MouseEvent-compatible event, once per activation; default navigation remains unless application cancels it. No library listener/wrapper. |
| [`theme`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts) | Source-only mixed-in Breadcrumb prop | External CSS instead of a theme/provider object. | ⏭️ Intentionally omitted | Breadcrumb spreads useTheme.props; CSS-only native navigation needs no provider. |
| [`themeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts) | Source-only mixed-in Breadcrumb prop | CSS tokens replace runtime override merging. | ⏭️ Intentionally omitted | No style-object adapter or theme execution. |
| [`builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts) | Source-only mixed-in Breadcrumb prop | No built-in override object. | ⏭️ Intentionally omitted | Author-owned external styles and zero runtime dependencies. |

<!-- END PINNED API INVENTORY -->
