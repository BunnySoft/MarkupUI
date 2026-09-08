# List

**Plan: 🟢 Verified for the retained native List/ListItem scope; three explicit framework-theme omissions.**

## Baseline and target

[B1: elements.ts](../../../src/components/elements.ts) still assigns legacy list/listitem roles;
[B2: styles.ts](../../../src/components/styles.ts) still supplies legacy presentation.
The accepted native composition is separate and does not redefine those elements.

- **HTML:** native ordered/unordered list with direct `li` children and authored prefix/content/suffix/action regions; header/footer stay outside the list.
- **JS:** none in the component; native controls and optional application listeners own actions.
- **CSS:** isolated borders/dividers, density, hover, logical alignment and wrapping.
- **Placement:** [list.css](../../../src/components/list/list.css), stylesheet package export and [native demo](../../../demo/components/list.html).

## Acceptance and gaps

The [canonical implementation and acceptance record](../../components/list.md) reports
407 passing tests (11 List cases), build/budget validation and Chromium structure, action,
form, focus, narrow/RTL/zoom/hidden/print/legacy/no-JS evidence. CSS is 1,054 gzip bytes,
component JavaScript is zero, and core remains 14,611/15,000 gzip bytes. Safari/screen-reader
speech and framework/pixel parity are not certified.

## Migration steps

**Delivery phase:** P2 — compound display. **Task state:** 🟢 Verified retained scope.
**Prerequisites:** P0 semantic children and P2 Typography in the [master plan](../migration-plan.md).
**Next task:** Descriptions, then Timeline and Breadcrumb; full P2 still needs residual-index review.

1. [x] **Specify item regions.** Native items preserve prefix/content/suffix/action reading order; header/footer are outside `ul`/`ol`.
2. [x] **Separate action semantics.** Explicit single-action controls and independent multi-action rows; passive `li` stays non-focusable.
3. [x] **Extract list presentation.** Isolated external border/divider/size/hover/wrapping CSS ships without a renderer.
4. [x] **Validate list contexts.** Tests and Chromium exercise nesting, empty/hidden/template nodes, long content, keyboard/forms and no-JS behavior.

### Native primitives and fallback

- **Native path:** authored `ul`/`ol`/`li` and actual action links/buttons. Default native markers remain; explicit markerless lists document the author-controlled `role="list"` Safari workaround. Templates may be cloned by application code, not by a list renderer.
- **Small enhancement:** CSS flex/wrap/gap arranges authored regions without reordering or measurement. No custom element, generated ARIA, row-selection model, virtualization, provider, runtime renderer or Shadow DOM slot layer.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/list)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/list/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/list)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **10 original local table rows + 4 explicit source-only supplements + 0 inherited rows = 14 tracker rows**.
The original ten rows and pinned identities remain below: **11 Verified ADAPTED native
targets and 3 Intentionally omitted contracts**. List/ListItem and presentation source were
reviewed for this retained scope. No broad upstream edge-case or framework parity claim is made.
Detailed mappings, defaults, omissions and actual evidence are in the canonical record.


### List Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`bordered`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/list/demos/enUS/index.demo-entry.md#L21) | Prop | Presence `data-bordered` on shell; absent is false. | 🟢 Verified ADAPTED target | External border/radius CSS; native demo/build/Chromium evidence. |
| [`clickable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/list/demos/enUS/index.demo-entry.md#L22) | Prop | `data-clickable` styles only explicit direct button/link row actions, not passive items. | 🟢 Verified ADAPTED target | Native Enter/Space/Tab and names; no generated row listener, role, selection or nested controls. |
| [`hoverable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/list/demos/enUS/index.demo-entry.md#L23) | Prop | Presence `data-hoverable`; pointer-hover background, default off. | 🟢 Verified ADAPTED target | Chromium hover styling; hover is presentation, not action semantics. |
| [`show-divider`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/list/demos/enUS/index.demo-entry.md#L24) | Prop | Default on; exact `data-show-divider="false"` opts out of item borders. | 🟢 Verified ADAPTED target | Live CSS change; hidden/template siblings create no leading divider. Header/footer separators independent. |

### List Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/list/demos/enUS/index.demo-entry.md#L30) | Slot | Native `.mui-list-items` list with direct authored `li` items. | 🟢 Verified ADAPTED target | Real lists/listitems, nested/empty/template cases, stable nodes and no-JS GET forms. |
| [`footer`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/list/demos/enUS/index.demo-entry.md#L31) | Slot | `.mui-list-footer` outside `ul`/`ol`, after the list. | 🟢 Verified ADAPTED target | Author-owned content; not an illegal list child or synthetic listitem. |
| [`header`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/list/demos/enUS/index.demo-entry.md#L32) | Slot | `.mui-list-header` outside `ul`/`ol`, before the list. | 🟢 Verified ADAPTED target | Native heading/name in Chromium; no generated landmark or heading. |

### ListItem Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/list/demos/enUS/index.demo-entry.md#L38) | Slot | Ordinary item content or `.mui-list-content` inside `.mui-list-row`. | 🟢 Verified ADAPTED target | Text/nodes/listeners/forms preserved; long content wraps at 280px and 200% CSS zoom. |
| [`prefix`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/list/demos/enUS/index.demo-entry.md#L39) | Slot | Optional authored `.mui-list-prefix` before content. | 🟢 Verified ADAPTED target | DOM reading order, logical RTL position; author owns media/icon alternatives. |
| [`suffix`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/list/demos/enUS/index.demo-entry.md#L40) | Slot | Optional authored `.mui-list-suffix` after content. | 🟢 Verified ADAPTED target | Native independent actions and wrapping; no automatic overflow, action or extra slot. |

### Explicit source-only supplements

These four entries were absent from the ten-row public Markdown inventory. They do not
replace original rows. The source declares no ListItem props or component events/methods.
`extra`, `action` and `content` are not additional List/ListItem slots; local content/actions
classes are native anatomy helpers, not upstream feature claims.

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/list/src/List.tsx) | Source-only prop | `data-size="small"` / `"medium"` / `"large"`; missing/invalid values use medium. | 🟢 Verified ADAPTED target | Source declares medium default but does not consume size in render/styles. Native density presets explicitly adapt it; Chromium measured 8/12/16px block padding. |
| [`theme`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts) | Source-only mixed-in prop | Use external CSS; runtime theme/provider object omitted. | ⏭️ Intentionally omitted | List spreads `useTheme.props`; no framework theme evaluator or automatic modal/popover detection. |
| [`themeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts) | Source-only mixed-in prop | Explicit CSS tokens replace runtime override merging. | ⏭️ Intentionally omitted | Native inheritance, not a style-object bridge or framework override contract. |
| [`builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts) | Source-only mixed-in prop | No built-in override object. | ⏭️ Intentionally omitted | Author-owned external CSS; zero runtime dependencies. |

<!-- END PINNED API INVENTORY -->
