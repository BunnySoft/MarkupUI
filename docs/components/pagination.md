# Pagination: bounded native paging

**🟢 Verified for the retained local state/native control scope.**
Named native navigation, keyed button templates, native select/number inputs and external CSS
replace neither application data nor routes. The legacy `mui-pagination` and its page-count
`count` attribute are unchanged; this optional helper does not register that tag.

## Loading and authored structure

| Export / asset | Contract |
| --- | --- |
| `@dataengine/markup-ui/pagination` | `createPagination`, options/controller/state/change types |
| `dist/markup-ui-pagination.js` | Self-contained ESM |
| `dist/markup-ui-pagination.global.js` | Classic `MarkupUIPagination.createPagination`; rejects namespace replacement |
| `@dataengine/markup-ui/pagination/style.css` | Independent external `dist/markup-ui-pagination.css` |
| [Native demo](../../demo/components/pagination.html) | Separate HTML/CSS/JS, local state and native fragment fallback only |

```html
<nav class="mui-pagination" data-pagination aria-label="Result pages" id="pager">
  <div data-pagination-fallback>
    <a href="?page=1" aria-current="page">Page 1</a>
    <a href="?page=2">Page 2</a>
  </div>
  <div id="pager-controls" hidden>
    <button type="button" data-pagination-previous>Previous</button>
    <div data-pagination-pages></div>
    <button type="button" data-pagination-next>Next</button>
  </div>
  <template data-pagination-page><button type="button"><span class="mui-pagination__visually-hidden">Page </span><span data-pagination-number></span></button></template>
  <template data-pagination-gap><button type="button"><span aria-hidden="true">…</span><span class="mui-pagination__visually-hidden">Jump to page <span data-pagination-number></span></span></button></template>
</nav>
```

```js
// External setup script, after loading the classic entry and external CSS.
const pager = MarkupUIPagination.createPagination(document.querySelector("#pager"), {
  itemCount: 237, defaultPageSize: 10
})
document.querySelector("#pager-controls").hidden = false
pager.page = 3 // Silent local assignment, no user request or URL rewrite.
pager.set({ itemCount: 12 }) // Silent clamp to page 2.
```

The required nav has a nonempty aria-label or resolvable aria-labelledby. Its owned anatomy is
one empty `div[data-pagination-pages]`, two templates and named typed previous/next buttons.
Templates contain one native type=button, one text-only span[data-pagination-number], and
authored text/decorative children; no IDs/names/hidden/disabled/tabindex, nested controls or
other native commands. Label text belongs in the template, not a callback returning HTML.
Do not put interactive nodes inside page buttons or nest the authored controls in links,
labels or other buttons. Optional prefix/suffix labels and original listeners stay intact.

Optional authored controls:

- One labelled single `select[data-pagination-size]`, with unique canonical positive decimal
  safe-integer option values and author-owned labels/disabled options.
- One labelled `input[type=number][data-pagination-jump]` paired with a named
  `button[type=button][data-pagination-go]`. Names and enclosing form association remain native.
- One text-only `[data-pagination-count]` for the displayed total. Simple mode requires this
  and the jump/go pair. Author the words/separator around it.
- One `[data-pagination-fallback]`, separate from managed controls/region, containing usable
  server-authored links. The helper hides it while connected and restores it on disconnect.

The optional controls' existence and order are authored, not show/render props. Call refresh
after adding/replacing them. Hide JS-only controls in baseline HTML and reveal them only after
successful connection, as in the demo. Static links need no helper, preserve href/targets/
modifiers/defaultPrevented/history, and remain usable without JavaScript. Enhanced numbered
controls are **buttons only**; there is no href generator or enhanced-anchor routing contract.
No menu/tab roles, arrow-key handler, roving tabindex or focus trap.

## Numeric state and bounded rendering

| API | Contract |
| --- | --- |
| Options `page`, `defaultPage` | Initial live value wins over initial-only default, then 1 |
| `pageSize`, `defaultPageSize` | Initial live value wins, then default, then authored select's selected value, then 10 |
| `itemCount`, `pageCount` | Nonnegative safe integers or null/omitted; itemCount takes precedence; null clears that input |
| `pageSlot` | Safe integer **5–31**, default 9; total generated page/gap control limit |
| `disabled`, `simple` | Booleans, default false |
| `controller.state` | Fresh readonly-by-contract snapshot: page/pageSize/pageCount/itemCount/startIndex/endIndex/empty/pageSlot/disabled/simple |
| `page`, `pageSize` fields | Silent validated setters |
| `set(partialValues)` | Atomic option validation and silent state update/clamp; no default-option changes |
| `refresh()` | Explicit anatomy re-adoption and queued-request invalidation, retaining accepted state |
| `connect()`, `disconnect()` | Idempotent lifetime, with `connected`; reconnect retains accepted state rather than rerunning defaults |

Unknown options and non-safe/negative/fractional numeric inputs fail clearly. Page and size
must be positive. Explicit page values above the effective count clamp down. Conflicting
totals are allowed and deterministic: itemCount wins; the ignored pageCount remains configured
for a later `set({ itemCount: null })`. No fabricated inferred item count in page-count-only mode.

Effective pageCount is at least 1. Zero items or zero explicit pages means `{ page: 1,
pageCount: 1, empty: true }`; one current button exists but is disabled, as are previous/next/
jump/go. Size selection remains useful unless globally disabled. The displayed count text is
0 for empty results. Known items use zero-based inclusive indices (0/-1 when empty);
unknown itemCount/startIndex/endIndex are null, deliberately unlike synthetic upstream
pageCount × pageSize indices. Maximum-safe item counts do not overflow index arithmetic.

Page-size changes **retain the numeric page when possible, otherwise clamp**, not reset to
one or preserve a record offset. Both user and programmatic size changes require an option
matching the size when a select exists. Defaults are initialization seeds, not a form-reset
binding. Application-owned form reset/data fetch should call set explicitly.

Window work is O(pageSlot), not O(pageCount): first/last plus a centered bounded interior,
with extra neighboring numbers near the edges. Gaps are named native buttons jumping to the
nearest omitted boundary; a single omitted page is shown as a normal number. Exact upstream
window symmetry is not claimed. No omitted-range option arrays or hover dropdowns are built.
Buttons surviving a window update retain identity/listeners. Changing gap targets updates
their number text safely. Only the explicit page region is generated/owned.

## User requests, validity and native forms

Two nonbubbling DOM events use `{ state, previous, source }` snapshots, where source is
page/previous/next/gap/size/jump:

- **`mui:pagination-request`** is cancelable, before an actual changed user request is accepted.
  `preventDefault()` leaves accepted state unchanged.
- **`mui:pagination-change`** reports the combined accepted page/page-size result once. Size
  clamp is one event, not a misleading independent user page click.

Initialization, setters, total shrink, refresh and reconnect emit neither event. A no-op
selection does not request again. Request listeners may reconfigure/disconnect; generation
checks prevent stale acceptance/change events. No async guard, network callback or router is
included. Application code can keep data-loading state outside this local pager.

Native page/previous/next/gap/go click work runs in a later task so final synchronous authored
defaultPrevented is respected. Buttons keep native Enter/Space activation exactly once.
Modified clicks are not paging requests. Native size change captures its draft and restores
accepted selection after a canceled request. Set/refresh/disconnect invalidate pending work.
Automatic invalid-anatomy failures disconnect and emit `mui:pagination-error` with `{ error }`;
explicit invalid API calls throw.

Quick jump commits only through Go or plain Enter, not blur or partial input. Native number
min/max/step and reportValidity reject missing/out-of-range/fractional drafts without navigation.
An untouched optional empty input does not invalidate an enclosing form. Required is added
only for a jump attempt if not author-required, and that owned empty-error state clears on
input/blur or valid commit. Author required is retained. Other native draft constraints and
successful named controls still participate in their authored form.

Enter in the owned jump input suppresses implicit form submission even with modifiers or
composition; only plain noncomposing Enter requests a page. Earlier authored keyboard
cancellation is honored. Because the helper itself prevents Enter's default, use the cancelable
request event to cancel a jump after that point. It does not synthesize click or submit.
Unrelated form submit buttons work normally.

## Ownership, focus and lifecycle

The helper never replaces the nav, prefix/suffix, templates, labels or stable native controls.
It owns generated page children, their numbers/current/disabled state, count text, native
auxiliary min/max/step/value changes, fallback/region hidden state and its two root markers.
No-JS links retain their original aria-current. Only the visible enhanced region has one
generated aria-current=page; no aria-selected or live-region announcement is invented.

Authored disabled values are merged with paging boundaries/global state, not overwritten.
A small **per-control disabled-attribute observer** records external writes, including repeated
disabled=true, while component writes are excluded. Native disabled fieldsets remain effective.
Other attributes/values/text restore conditionally only if still matching the last owned write.
Reserve managed attributes while connected; unrelated author attributes/listeners survive.

Focus stays on surviving keyed controls. If an owned focused control disappears or becomes
disabled/hidden, focus falls to the current enabled page, an enabled auxiliary/navigation
control, or the named nav with a programmatic-only tabindex fallback. External focus is not
stolen. Disconnecting a focused generated page restores focus to a usable fallback link or
surviving native control/nav. Native Tab order remains document order and never trapped.

Nested data-pagination boundaries are independent. One controller owns a nav. There is no
document mutation observer or automatic data/anatomy renderer: call refresh after replacing
controls/templates/regions or changing authored option lists. Invalid/missing/duplicate anatomy
throws instead of claiming success. External content in the generated region is rejected and
is not deleted on disposal. Call disconnect before removing/transferring the nav; it removes
listeners, scoped observer, timers and generated nodes. Refresh re-adopts authored replacements;
disconnect before handing nodes between documents or independent helper copies.

## CSS and acceptance — 2026-09-09

External CSS supplies current/borders/disabled/focus, small/medium/large sizes, native wrapping,
logical spacing and readable print/forced-color state. No measured geometry, injected styles,
portal, motion engine or transition requiring reduced-motion suppression. RTL keeps native
reading and Tab order; authors use suitable directional labels/icons. No mandatory Select,
InputNumber, Dropdown, Icon or provider/theme dependency.

- **80 targeted tests:** 53 Pagination + 27 native/legacy; build/declarations/package exports
  and all budgets pass.
- Chromium: click/Space/Enter once; optional blank form validity; unrelated submission;
  Shift+Enter suppression; native range/missing feedback; size clamp/cancellation;
  trillion-page bounded window, zero/shrink/focus, simple/Tab, author disabled, replacements,
  refresh/disconnect/reconnect/reentrant requests, RTL/360px wrapping, 2x CSS zoom and
  reduced-motion/forced-color/print presentation.
- Read-only review found initial required-state and modified-Enter form bugs; both are fixed
  with unit regressions and real-browser verification.
- Further regressions cover author-disabled focus recovery and stale select restoration after
  request-time reconnect. Chromium also verifies nested pagers, no-JS fragment links,
  standalone ESM/classic with legacy loading, and preserving an existing unrelated namespace.
- The inventory audit preserves **42 original owner/name/source identities**: **55 rows,
  36 adapted targets and 19 omissions**. Catalog totals are **96 routes, 3,302 rows and
  176/384 accepted tasks**, with **nine Planned P3 routes**. All **299 relative file links**
  in the changed documentation resolve.

| Asset | Raw bytes | gzip bytes | New ceiling |
| --- | ---: | ---: | ---: |
| Pagination ESM | 13,146 | 5,011 | 5,500 |
| Pagination classic | 13,321 | 5,080 | 5,500 |
| Pagination CSS | 2,285 | 816 | 1,250 |

One format + CSS: **5,827 ESM / 5,896 classic gzip bytes**. Prior optional/core/plugin
sources/outputs/ceilings are unchanged; core **14,611/15,000**, advanced **2,181/3,000**,
widgets **2,779/4,000** gzip bytes. No all-browser, physical-touch or screen-reader certification.
P3 remains in progress. **Next: Steps.**
