# Virtual List: a bounded, fixed-height native collection

**🟢 Verified retained scope.** Explicit native HTML/CSS/JS; no runtime dependencies,
Vue/JSX/VDOM, generic data renderer, global store, provider, custom scrollbar or fetcher.
This is the first main P5 collection foundation, **not completion of P5**.

**2026-09-11 default-style audit:** [matched component-neutral geometry](../style-audit/components/virtual-list.md).
The stylesheet owns only fixed window/row layout and focus visibility; row paint,
typography and the native scrollbar remain outside component styling.

## Loading and authored anatomy

| Asset | Contract |
| --- | --- |
| `@dataengine/markup-ui/virtual-list` | ESM `createVirtualList`, controller/options/context/key/scroll/state types and geometry limits |
| `dist/markup-ui-virtual-list.js` | Independent minified ESM |
| `dist/markup-ui-virtual-list.global.js` | Classic `MarkupUIVirtualList`; refuses namespace replacement |
| `@dataengine/markup-ui/virtual-list/style.css` | External `dist/markup-ui-virtual-list.css` |
| [Demo](../../demo/components/virtual-list.html) | Separate local HTML/CSS/JS; 100k fixture and native editable rows |
| [Reference tracker](../naive-ui/components/virtual-list.md) | Every original identity plus explicit type/source supplements |

The optional helper registers **no custom elements**. It neither depends on nor replaces
the basic `MuiVirtualList` in the legacy advanced plugin. No fake registration order is
needed for native markup; one owner per viewport/list is checked across module copies.

```html
<h2 id="items-title">Items</h2>
<p>Static example or application pagination remains available without JavaScript.</p>
<ul><li>First sample item</li><li>Second sample item</li></ul>
<div class="mui-virtual-list" id="items" aria-labelledby="items-title" hidden>
  <ol class="mui-virtual-list__items" aria-labelledby="items-title" role="list"></ol>
</div>
<template id="item-template"><li><span></span></li></template>
```

```css
#items { --mui-virtual-list-height: 320px; }
```

```js
import { createVirtualList } from "@dataengine/markup-ui/virtual-list"
const viewport = document.querySelector("#items")
const template = document.querySelector("#item-template")
viewport.hidden = false
const list = createVirtualList(viewport, {
  items: Array.from({ length: 100000 }, (_, id) => ({ id, label: `Item ${id + 1}` })),
  rowSize: 32,
  overscan: 3,
  key: item => item.id,
  render(item) {
    const row = document.importNode(template.content.firstElementChild, true)
    row.firstElementChild.textContent = item.label
    return row
  },
  update(row, item) { row.firstElementChild.textContent = item.label },
})
list.scrollTo({ key: 50000, align: "center" })
```

Use `document.importNode` for template rows: inert template documents are not the active
document. Factories must return a **fresh, detached, parentless native li in the viewport's
document**, with no competing owner or role/customized-built-in override. Connected rows,
fragment-owned children and reused staged rows are rejected, never stolen. Do not return
strings. Set plain text with `textContent`; caller-authored controls keep native behavior.
Callers own unique IDs, labels, ID references, literal field names and listener binding.

The viewport must be a connected native div/section, with exactly one initially empty
ul/ol using the classes above. The helper does not adopt/delete a preexisting static list.
Keep fallback content and enhancement actions outside it; hide dead actions without JS.
`role=list` may be authored on ul/ol to retain list semantics in browsers that suppress
unstyled-list semantics. No listbox/grid/selection keyboard behavior is invented.

## Exact fixed-size and scale contract

- Required authored `--mui-virtual-list-height`: a **positive px length <= 16,384px**.
  Use external CSS/media rules to change it. Percent, auto, calc and unconstrained heights
  are not accepted by this first implementation. `clientHeight` is the actual metric.
- `rowSize`: finite **1..65,536 CSS pixels**, exact border-box size, not a minimum or estimate.
  The external stylesheet fixes min/height/max, positioning, zero row margin and clipping.
  Design content that fits. Expanded text, row-height transitions and content growth are
  **not** supported merely because overflow is clipped.
- At most **1,000,000 items** and **8,000,000 total CSS pixels** (`count * rowSize`).
  Browser native scroll extent is finite. Larger datasets require application pagination
  or a different reviewed design, not an silently overflowing spacer.
- Integer `overscan` **0..50**, default 3; computed window must contain **<=512 rows**.
  An additional **one** currently focused row may be pinned. Very small row sizes in a
  very tall viewport reject instead of allocating thousands of rows.
- Native ul/ol height is the spacer: no invisible focusable padding nodes. Mounted li
  elements are absolutely positioned and ordered by their **global dataset index**,
  including a pinned row. Each receives `aria-posinset` and `aria-setsize`.
- Empty/small/end/negative elastic offsets clamp. Hidden/zero-height viewports mount no
  window rows, optionally one focused pin; no fake fallback viewport size is substituted.
  Hiding may reset the browser's scroll offset: no keep-alive position guarantee.
- CSS/browser metrics use native CSS pixels (`clientHeight`, `scrollTop`, `offsetHeight`),
  not scaled bounding rectangles. A visible window also validates real list/scroll extent
  within 1px rounding tolerance. Unsupported zoom/native extent caps or geometry overrides
  fail closed instead of announcing reachable rows.

Do not override the geometry classes with padding, row margins, transitions, alternate
writing modes or container positioning. Native vertical padding must be zero. Presentation
(colors, focus, fonts, borders, media) belongs in external CSS. Only numeric list height,
row top and row-size custom property are written by JS. These geometry writes are an
explicit CSP/style-policy consideration; no CSS-in-JS presentation system is introduced.
RTL keeps the same vertical coordinates. Horizontal/tree/grid/variable-height modes are
deliberately omitted.

## Data and update ownership

`key(item,index)` is required, pure and stable: unique nonempty strings of at most 256
characters or finite numbers. Numeric `0` differs from string `"0"`. Avoid index keys for
reorderable data. Arrays are copied; objects remain caller-owned and are not made reactive.
All item count/total-pixel/key validity and uniqueness are checked across the **entire**
dataset before native mutation. Invalid data/scroll arguments throw without changing an
existing healthy window. Do not mutate key identity in-place; call `setItems` explicitly.

`update` is **required**, not an optional promise that stale same-key data somehow refreshes.
Every retained mounted/pinned row is updated on `setItems`, including same-object mutation
and changed index. New/remounted rows are initialized by `render`; unchanged scroll/resize
windows do not rerun bindings or reconstruct their nodes. `refresh` refreshes geometry, not
data. Callers must update any closures/listeners when an item object changes.

Only native DOM nodes and domain item/key arrays/maps are retained. There is no parallel
virtual DOM or schema-to-control renderer. Helpers are never automatically instantiated
for every row; explicitly initialize/dispose any needed child helper yourself.

## Focus, controls and native forms

Scrolling cannot evict the row containing `document.activeElement`. It stays connected as
one bounded pin, with actual controls, edits and listeners intact. Focusout schedules a
prune. Reordering leaves the focused row in place while moving siblings around it.
`moveBefore` preserves other moved nodes' browser state where available; `insertBefore`
fallback preserves node/listener identity but can restart animations, iframe/custom-element
lifecycles or non-focused browser state. This is not a framework keep-alive promise.

Removing the focused data key focuses the viewport **before** removal; if focus cannot
leave the row, the operation fails. The viewport gets a leased `tabindex=0` only when none
was authored. Focus outside the list is never stolen by ordinary updates. Disconnect also
moves focus from an owned row to the connected viewport before cleanup. Do not use this
native-list helper as a complex focus-managed grid or listbox.

Offscreen unmounted input/select/textarea controls **do not participate in native
FormData**, validation, tab order, browser find or accessibility traversal. Unmounted
unsaved state is not retained by magic. The demo saves input/change drafts into caller
data and remounts from those data; its updater does not overwrite the active editor.
Native form reset only resets currently mounted fields and does not reset the whole
dataset. Full-data serialization/reset/validation must be an explicit application operation.
Fixed-height textarea examples do not imply auto-growing or multiline-layout support.
No assertion of screen-reader or all-browser parity follows from native semantics.

## API, scheduling and failure contract

| Member | Contract |
| --- | --- |
| `viewport`, `list` | Original authored native nodes |
| `connected`, `error`, `state` | Lifetime/error and frozen `{count,start,end,mounted,pinnedKey}`; end is exclusive |
| `setItems(array)` | Full validation then retained-node update and bounded repaint |
| `refresh()` | Cancel pending work and synchronize current geometry without rebinding stable content |
| `scrollTo({index \| key, align?})` | One item target; start (default), center, end, nearest; rejects missing/out-of-range targets |
| `scrollTo({position:"top" \| "bottom"})` | Native beginning/end |
| `scrollTo({top:number})` | Finite clamped vertical CSS-pixel offset |
| `disconnect()` | Idempotent cleanup, except first cleanup failures are surfaced |

No x/y overload, left, debounce, smooth behavior, return promise, scrolling-completion event
or implicit default/reset coordinate. Call an explicit scroll method after initialization
for initial navigation. The caller may use native viewport scrolling; browser scroll events
drive the window. No wheel, drag or keyboard interception.

One scoped passive scroll listener and one focusout listener schedule at most one animation
frame. A feature-detected ResizeObserver watches only the viewport. There is no per-frame
layout polling, document-wide mutation observer or automatic fetch. Without ResizeObserver,
call `refresh` after size/visibility changes. Call `disconnect` before removing the root or
rebinding; observed geometry changes/explicit refresh detect detached/foreign anatomy.
Parent row disposal must explicitly disconnect a nested controller.

Dataset replacement, refresh and disconnect cancel queued frames. All key/render/update/dispose
hooks must be synchronous; promise/thenable results reject (not an async loading feature).
Already-started async side effects cannot be cancelled or rolled back. Hooks may not
reenter mutation APIs; reentry throws. Disconnect may interrupt hooks; the
interrupted operation throws rather than committing a stale window. A returned fresh row
is still released if its factory disconnected the old owner. Separate roots remain independent.

Factory/update/DOM/geometry/disposal failures during an operation **fail closed**:
disconnect, cancel/observe no further work, attempt every owned row's disposal once,
remove all helper-owned rows, release ownership, restore geometry/attributes, set `error`,
emit `mui:virtual-list-error` with `{error}`, and throw from direct APIs. Scheduled failures
emit the same error instead of manufacturing success. Multiple failures use AggregateError.
Factories that throw before returning must clean up their own unreturned allocations.
Arbitrary hook side effects on application data, unrelated DOM, global resources or other
components cannot be rolled back. Hooks must not transfer/remove owned rows or hide
errors; normal DOM-dispatched listener exceptions follow browser reporting rules.

On release, original row top/class/ARIA are restored; generated nodes are removed, not
cached. Original list height/priority and viewport row-size/tabindex are conditionally
restored if still helper-owned; later external overrides survive. Large CSS lengths are
compared using **browser serialization**, including Chromium exponent notation. The
authored viewport/list/classes/labels/fallback remain. Scroll position is browser state,
not an attribute restored by cleanup.

## Four acceptance steps and evidence

1. [x] Reviewed pinned Markdown, wrapper/exports and live 2.45.3 reference. **29 original
   identities + twelve explicit supplements = 41 rows: 26 adapted, 15 omitted**.
2. [x] Implemented native fixed-size window, full key validation, mandatory updater,
   focus pin, safe-node ownership, lifecycle/error cleanup and separate assets.
3. [x] Tested bounds, scroll targets, updates, callback failures/reentry, focus/order,
   nested/separate roots, template import, extent caps, cancellation and teardown.
4. [x] Built declarations/assets with unchanged legacy budgets and measured real Chromium
   DOM/geometry/keyboard/zoom/forms/coexistence. See measured acceptance below.

### Measured acceptance — 2026-09-09

Chromium **151.0.7922.174**, dedicated `localhost:4188/demo/components/virtual-list.html`
tab; no other user's/demo tab was altered. All four demo resource requests were local.
The reference page was reviewed in a separate tab.

| 100,000 items, 32px rows, 320px viewport, overscan 3 | Actual result |
| --- | --- |
| Start | 13 rows, indices 0..12, offset 0 |
| Middle | 16 rows, indices 49,997..50,012, offset 1,600,000 |
| End | 13 rows, indices 99,987..99,999, offset 3,199,680; Item 100000 visible |
| Native extent / final-row bottom error | 3,200,000px / 0px |
| 101 sampled offsets | Maximum 17 mounted rows, never proportional to 100k |
| 160px resize / hidden | 11 rows / zero window rows; ResizeObserver-driven |
| CSS zoom 125% / 200% | CSS clientHeight 320 and row offsetHeight 32; rect heights 40 / 64; correct end offset |
| RTL center key 50,000 | Offset 1,599,856; 17 rows; unchanged vertical identity |
| Native PageDown / End | Offset 280 with viewport focused / last item at 3,199,680 |
| Focused 100k row pinned offscreen | 17 mounted (16 + one pin), original focused input/value retained; 16 after focus leaves |
| Stable-key updates | Original first node received changed text; no replacement |
| Editable reverse/remove | Original focus/value survived reverse; removed key moved focus to viewport |
| 250,000 × 32px ceiling probe | 8,000,000px extent, end 7,999,680, key 249999 reachable; 250001 items rejected |
| Legacy coexistence | Old plugin constructor unchanged, seven legacy rows; native helper independently mounted 16 |
| Native input/select/textarea FormData | 18 fields from six mounted rows, not all 200 data items; key 0 absent offscreen; saved draft/mode/note remounted |
| CDP visual viewport scale 2 | CSS height 320, end 3,199,680, last item reachable; not browser-toolbar zoom certification |
| 320px narrow viewport | 305px layout/scroll width (native scrollbar); no horizontal document overflow |
| 8-million-pixel teardown | Zero rows after pending-frame cancellation; list height, row-size and leased tabindex restored |
| Throwing updater | One error event, all three disposals, disconnected, zero rows and restored height |
| Classic namespace collision | Rejected; original API identity preserved |
| JavaScript disabled | Three static sample items; empty enhancement lists and hidden enhancement actions |
| Nested focused lists | Outer one-row window + one pin, inner four-row window + one pin; both disconnected explicitly without leaked rows |
| moveBefore unavailable | Original focused input/value survived keyed reverse through the insertBefore fallback |
| Oversized 640px-row nearest alignment | Already-contained offset 100 retained; partial trailing edge aligned to 320; next row aligned to 640 |

The initial 101-offset measurement was p95 **1.5ms**, maximum **1.9ms** for synchronous
scroll/window updates on this machine; the final post-review sample was p95 **1.6ms**,
maximum **5.0ms**, again at most 17 rows. These are observations, not a latency SLA.
Native popup/assistive-technology interaction and other browser engines were not tested.

### Validation and payload

`pnpm exec vitest run tests\virtual-list.test.ts tests\native.test.ts`:
**71 tests passed**, 44 focused cases plus 27 existing native/legacy cases.
`pnpm build`: TypeScript declarations, ESM/classic/style assets and all budgets passed.
No dependencies were added or restored, and existing ceilings were not increased.

| Asset | Bytes | gzip bytes | gzip ceiling |
| --- | ---: | ---: | ---: |
| Virtual List ESM | 10,391 | 4,149 | 5,000 |
| Virtual List classic | 10,690 | 4,289 | 5,000 |
| Virtual List CSS | 859 | 376 | 1,000 |
| Existing core | 62,558 | 14,611 | 15,000 |
| Existing advanced | 6,554 | 2,181 | 3,000 |
| Existing widgets | 10,858 | 2,779 | 4,000 |

Combined optional payload: **4,525 gzip bytes ESM + CSS**, or **4,665 classic + CSS**.
Core/plugin sources and payloads are unchanged. Generated dist assets are built locally;
normal repository ignore policy remains intact.

Review found and fixed native template-document import, large CSS exponent-serialization
cleanup, unsupported native scroll-extent handling, thrown-undefined/promise hook failures,
oversized-row nearest alignment and narrow demo metrics overflow. Invalid factories do not take ownership of foreign nodes;
accepted staged rows are disposed on later failure. Documentation audit preserved all
**29 original source/section/kind identities in order**, verified 41 final dispositions and
recounted **3,682 catalog rows / 284 accepted tasks / 71 accepted pages**.

**Next: Tree.** P5 remains active with nine unfinished routes, not complete. No later
component is implemented in this isolated Virtual List change.
