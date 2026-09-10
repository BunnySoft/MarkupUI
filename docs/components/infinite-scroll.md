# Infinite Scroll: native content, bounded load permission

**🟢 Verified retained native scope.** Native sentinel observation and manual loading,
with explicit completion and cancellation. The application owns every item, transport,
data key and form field. No data-fetch/renderer/virtualization framework is introduced.

## Loading and authored anatomy

| Asset | Purpose |
| --- | --- |
| `@dataengine/markup-ui/infinite-scroll` | createInfiniteScroll, settings/context/result/outcome/state/controller types |
| `dist/markup-ui-infinite-scroll.js` | Independent optional ESM; no registration |
| `dist/markup-ui-infinite-scroll.global.js` | Classic MarkupUIInfiniteScroll; rejects namespace replacement |
| `@dataengine/markup-ui/infinite-scroll/style.css` | Optional native overflow/sentinel/focus/media behavior; no component skin |
| [Local demo](../../demo/components/infinite-scroll.html) | Separate HTML/CSS/JS with real fields, manual retry, footer and static fallback |
| [Controlled local fixture](../../demo/components/infinite-scroll.fixture.js) | Growth/no-growth/error/end/abort-ignoring scenarios; no HTTP |
| [Complete reference](../naive-ui/components/infinite-scroll.md) | Original identities and explicit source supplements |

```html
<section class="mui-infinite-scroll" data-infinite-scroll>
  <h2 id="feed-heading">Local feed</h2>
  <div class="mui-infinite-scroll__viewport" id="feed-viewport"
       tabindex="0" role="region" aria-labelledby="feed-heading">
    <ul data-infinite-content><li>Existing native item</li></ul>
    <div data-infinite-sentinel aria-hidden="true"></div>
  </div>
  <button type="button" data-infinite-load hidden>Load more / Retry</button>
  <p data-infinite-message="loading" hidden>Loading one batch.</p>
  <p data-infinite-message="cancelling" hidden>Waiting for the previous load to settle.</p>
  <p data-infinite-message="error" hidden>Loading failed. Use Load more / Retry.</p>
  <p data-infinite-message="finished" hidden>No more items.</p>
  <p data-infinite-message="disabled" hidden>Loading is disabled.</p>
  <p data-infinite-message="paused" hidden>Use Load more to continue.</p>
  <a href="/existing-static-route">Read the static version</a>
</section>
```

Use a connected light-DOM div/section host. Author exactly one content region, one following
empty div/span sentinel, one named native type=button manual control, and all six nonempty
plain-text messages. Content and sentinel share a parent; the sentinel is outside and after
content, not inside an item/template. Messages and manual controls are outside the owned
application content. The helper does not generate any of these nodes.

The content region may contain native lists/tables/fields/templates as appropriate to the
application. Its children are **not** inspected as a data schema or rebuilt by the helper.
Keep the fixed marked anatomy; duplicate/replaced markers, nonempty/interactive sentinels,
invalid roots or foreign owners reject instead of being silently adopted. Native item
controls/listeners/current edits/defaults remain application-owned.

The sentinel is decorative aria-hidden text-free geometry, not a focus stop or live record.
Do not add role/grid/listbox semantics to the host or scroll root. Author meaningful root
labels and a manual/footer/fallback path before enabling automatic loading.

## Native roots, distance and fallback

`scrollRoot` is null by default: the document viewport. An explicit element root must be
a connected same-document native div/section/article/main/aside ancestor of both content
and sentinel, with a name, tabindex=0 and native vertical auto/scroll overflow. Root roles,
when authored, are region; writing mode is horizontal-tb. Window/Document objects, detached
or foreign roots, custom scrollbar instances and selector strings are not substitutes for null.

`distance` is a finite **0..4096 CSS-pixel** bottom margin, default 0. The native observer
uses rootMargin `0px 0px <distance>px 0px` and threshold 0. It observes the sentinel, not
scrollHeight arithmetic, wheel velocity or a custom scrollbar. Zero-area roots cannot
trigger automatic loading. Element/document roots, nested clipping and zoom use native
IntersectionObserver geometry; no positioning/polling engine is added.

Missing IntersectionObserver is a supported **manual-only fallback**. No observer polyfill,
wheel emulation or timer is installed. `supported` and pauseReason=unsupported report that
boundary. With no JavaScript, existing content remains readable and the enhancement button
stays hidden; supply a real fallback link. The demo's link reaches its complete static
twelve-item sample, not a fake pagination URL returning the same page.

## Explicit loader, progress and commit contract

```js
const infinite = createInfiniteScroll(host, {
  scrollRoot: document.querySelector("#feed-viewport"),
  load: async context => {
    const batch = await applicationLoader(context.signal)
    return {
      added: batch.items.length,
      hasMore: batch.hasMore,
      commit() {
        // Application-owned native insertion/data update, not a library renderer.
        appendApplicationItems(batch.items)
      }
    }
  }
})
```

The helper implements no applicationLoader, HTTP, URL, router, socket, serialization,
cache, item-key map, DOM row factory or persistence policy.

Context is frozen `{signal,generation,reason,isCurrent}`. reason is automatic for an
observer request, manual for API/button requests. Signal cancels obsolete pending work;
isCurrent checks current generation/owner/native availability. Permission ends when the
request settles. Do not keep a completed request context as a lifetime for later work.

A synchronous or asynchronous loader returns:

| Field | Contract |
| --- | --- |
| added | Nonnegative safe integer: the application's count of newly added records |
| hasMore | Required boolean; no inference from a void result, array length or swallowed error |
| commit | Required when added > 0; optional otherwise; synchronous function returning undefined |

Completion values are copied/validated **before** commit. Only a still-current result may
invoke commit. Native anatomy is checked before and after. Defer actual data/DOM updates
to this callback rather than mutating items during an unguarded asynchronous loader body.
The helper neither builds items nor rolls back arbitrary side effects performed by caller
code. A throwing or unsupported async commit is an explicit error; any already-performed
application side effects remain the application's responsibility.

Commit must not reenter settings/reset/load/refresh. Disconnect is allowed and revokes the
rest of that result. General settings/reset/dispose operations remain available while the
loader is awaiting work. Native dispatch-listener errors retain normal browser behavior.

`added` is an explicit progress declaration, **not a DOM-count inference**. This supports
application data/virtualization composition without pretending a mounted-node count is the
full dataset. `added:0, hasMore:true` pauses automatic requests until deliberate manual
retry/reset. `hasMore:false` finishes, including an empty final response.
Even a faulty positive progress declaration cannot exceed the automatic budget below.

### Promise outcomes are not all success

`load()` returns a Promise of a discriminated outcome:

- `{status:"loaded",added,hasMore}`: a validated current completion was applied.
- `{status:"error",error}`: a current loader/protocol/commit failure, also shown in state/UI.
- `{status:"aborted",reason,cause?}`: superseded/disposed/unavailable work; stale rejection
  may be retained as cause without overwriting a new generation's error/UI.

**Inspect status; Promise resolution alone is not a success signal.** Invalid calls made
while disconnected/disabled/finished/cancelling or with invalid anatomy reject the Promise.
Invalid settings/reset arguments throw before changing a healthy request/configuration.

Outcomes describe the completed request, not a promise that a later reset has not changed
the dataset. Use the guarded commit for data insertion; do not apply a second unguarded
copy after awaiting load().

## One pending load, cancellation and retries

Repeated load() calls during the same current request return its same Promise. Manual
activation and observer callbacks cannot start another pending load.

Changed settings, reset, explicit disabling, root changes, native hiding/inert/disabled
constraints and disconnect revoke generation/Signal authority. Root removal or transfer
outside the original light-DOM document disposes the owner. Stale results never run commit;
stale errors never replace current error/finished state.

**Cancellation waits for acknowledgement.** An abort-ignoring loader remains pending in
cancelling until its Promise actually settles. A reset or re-enable cannot start a second
loader behind it. There is no automatic timeout pretending the old transport stopped.
If it never settles, this owner remains blocked; honor AbortSignal or provide application
transport cancellation. Disconnect releases native ownership, not external work.
Creating a different owner does not establish a global transport concurrency limit.

Current errors stop automatic observation and show the authored error message. The manual
button/load() explicitly retries, clears that error and invokes one new loader. After a
successful retry the observer resumes without immediately chaining another load from its
initial visible notification. Signal/observer-generation guards also discard old callbacks
after root changes/reset/disposal.

## Bounded automatic permission and underfilled content

Automatic enhancement defaults true, with **automaticLimit=3**. The limit is an integer
0..20 per explicit reset. Zero means manual-only permission; false automatic also retains
the manual path. These are intentional target limits, not unrestricted source parity.

1. A fresh visible sentinel entry may start **one** automatic load.
2. Repeated notifications while it stays visible cannot start another. Completion does
   not recursively refill an underfilled region.
3. A real exit/reentry can grant another request, subject to the remaining automatic budget.
4. No-progress or error stops automatic requests even across further intersections.
5. After the budget, use the manual button. Manual requests do not consume or renew it.
6. Only explicit reset renews the budget. Refresh does not grant a new entry/budget.

Thus an initially underfilled viewport performs at most one load for its continuous visible
entry, and at most the configured total if layout repeatedly exits/reenters. There is no
unbounded microtask/fill loop. A loader that declares positive progress without actual
growth still cannot exceed the total cap.

This deliberate pause makes a real footer reachable. Keep the manual button outside item
content, retain a native skip/fallback link and do not turn state events into an application
auto-reset loop that defeats the limit.

## Settings, reset and native ownership

| Setting | Default / behavior |
| --- | --- |
| scrollRoot | null page viewport, or explicit named native root |
| distance | 0; finite 0..4096 CSS pixels |
| disabled | false; revokes load permission, not application field values |
| hasMore | true; false means finished and revokes pending authority |
| automatic | true; false leaves manual loading |
| automaticLimit | 3; integer 0..20 per reset |

set() validates all supplied settings first. Changed settings invalidate pending authority
and rebuild the observer; they preserve used budget and sticky error/no-progress state.
Unchanged settings do not restart a healthy request. Use load() for explicit retry or reset
for a new permission generation.

`reset({hasMore?})` defaults hasMore to true, clears error/progress diagnostics and budget,
and cancels obsolete work. **It never clears/replaces items or resets form fields.**
The demo's separately labelled Restart dataset application action intentionally replaces
its own sample items before resetting permission.

`refresh()` validates fixed anatomy, updates native-constraint observation and restores
eligible observation without renewing permission. It does not adopt replacement markers
or regenerate item nodes. A repaired error still needs manual retry/reset.

Native button.disabled, disabled fieldsets (including first-legend exceptions), hidden and
inert ancestors remain browser-owned. The helper never removes those attributes or disables
arbitrary item controls. It watches only marked nodes and their shallow ancestor chains,
not a document-wide subtree or per-frame loop.

The enhancement owns button hidden/aria-disabled, content aria-busy, host phase and the six
message hidden attributes while bound. Use real disabled/settings rather than authoring
aria-disabled=true as a competing button owner. The button remains focusable while loading,
cancelling or finished; aria-disabled blocks activation without dropping keyboard focus.
There is no automatic focus movement or scroll-coordinate assignment.

Item inputs retain native FormData/default/reset/validation semantics. Type=button loading
does not submit the enclosing form. aria-busy is not field disabling, and no hidden value
proxy or business serializer is created.

## API, events and cleanup

| API | Contract |
| --- | --- |
| element, content, sentinel, scrollRoot | Original native nodes/current observation root |
| connected, error, state | Lifetime/current failure plus phase, flags, generation, budget, lastAdded and intersection observations |
| load() | Explicit manual request/retry; coalesced current Promise and discriminated outcome |
| set(settings) | Validated settings change, generation revocation, observer rebind |
| reset({hasMore?}) | Explicit new permission generation; does not edit items |
| refresh() | Validate/update native scope without renewing budget |
| disconnect() | Abort/revoke pending authority, release observers/listener and owned attributes |

Phases: idle/loading/cancelling/error/finished/disabled/paused/disconnected. pending remains
true for unacknowledged cancellation. pauseReason describes the automatic gate separately
from phase, so it can still be limit while finished.

mui:infinite-state emits changed frozen state snapshots. mui:infinite-error exposes current
errors; generic authored messages do not automatically print backend error text. These are
permission/diagnostic events, not item-data serialization or a fabricated user-change event.
Do not synchronously reset on every state event; application-created loops are not a
request policy supplied by this helper.

One IntersectionObserver exists while eligible; one scoped MutationObserver tracks native
anatomy/constraint changes. There are no scroll/wheel listeners, polling frames, timers,
automatic network retries or hidden queues in the helper. The local demo's timers belong
to its explicit fake loader and honor or deliberately ignore Signal as labelled.

Disconnect is idempotent. It stops observers/manual activation, restores only still-owned
attributes and leaves current items/edits/listeners/native scroll position untouched.
It never resurrects removed records. Later stale settlement resolves the old request but
does not write status/busy state into a new owner. The app ends its own enhancement controls;
the demo hides loader controls and chooses its own footer focus destination.

The attribute lease reuses existing ownedWrites from the native Popover utility module.
No Popover controller, stylesheet, positioning service or runtime registration is started;
no shared helper source changed.

## CSS, native fallback and optional composition

CSS owns only native overflow, min-content safety, 1px sentinel geometry, current-color
focus visibility and static reduced-motion/print behavior. It sets no default viewport
height, border, padding, message margin/color, disabled cursor, font, background, animation
or transition. Applications size and skin the authored viewport and status content through
their normal cascade; the existing `--mui-infinite-scroll-height` hook remains opt-in and
falls back to no maximum. No JavaScript style writes, global reset or CSS-in-JS
presentation engine is used.

Native hidden/templates remain hidden/inert. RTL preserves DOM/item order and vertical
bottom semantics. Print exposes overflow and removes only the observer sentinel; authored
manual/status content remains available. Reduced-motion uses native auto scrolling. No
programmatic scrolling animation is initiated by the helper.

The [default-style audit](../style-audit/components/infinite-scroll.md) records why the
pinned source has no Infinite Scroll-owned skin and why custom scrollbar chrome remains
a separate architectural difference.

[Virtual List](virtual-list.md) may be composed explicitly by the application, for example
with automatic=false and application end-of-window intent calling load(), whose commit
updates the app's items and existing Virtual List owner. Do not insert a sentinel into that
helper's exclusively owned viewport/rows. This helper measures neither item count/row
heights nor a virtual window and adds no mandatory Virtual List dependency.

## Complete source dispositions and four accepted steps

[Reference tracker](../naive-ui/components/infinite-scroll.md): **three original identities
+ four source-only supplements = seven rows, four adapted and three omitted**.
Original section/member/kind/API-line identities remain in order.

Retained: distance as native bottom rootMargin; on-load's application-loading role adapted
to explicit context/result/commit; NInfiniteScroll as native createInfiniteScroll; default
slot as original authored content. Omitted individually: scrollbar-props forwarding,
infiniteScrollProps Vue schema and InfiniteScrollProps framework type alias.

The pinned source awaits void/Promise<void> and catches rejected loads without surfacing
them; it has no public hasMore/disabled/reset API. That silent/void behavior is intentionally
not reproduced. Progress/commit, cancellation/outcomes, bounded auto permission, native
manual retry and state/messages are explicit target extensions, not invented source props.
The live official route redirected to `/lander` during review; immutable pinned GitHub
Markdown/source/exports remain the authority, not a live visual-parity claim.

1. [x] Preserve original identities; read pinned API/source/types/default slot/exports.
2. [x] Keep native content/manual/fallback and validate root/sentinel/threshold ownership.
3. [x] Enforce serialized, generation-safe async completion and bounded underfill/retry.
4. [x] Targeted regressions, build/budgets and actual Chromium native intersection acceptance.

**Next: Popselect, then Split.** P5 remains incomplete; no Popselect implementation is
included in this separate component commit.

## Measured acceptance — 2026-09-10

`pnpm exec vitest run tests\infinite-scroll.test.ts tests\popover.test.ts tests\native.test.ts`:
**139 tests passed: 59 Infinite Scroll, 53 existing native-attribute/Popover and 27 native/legacy**.
`pnpm build` passed declarations, standalone assets and every old/new budget.
No new dependency was installed.

Chromium **151.0.7922.174**, dedicated local Infinite Scroll tab. Existing user/demo tabs
were not altered; the newly opened unrelated official landing tab was closed.

| Actual browser acceptance | Result |
| --- | --- |
| Initial native intersection | Two items underfilled the panel; one automatic load appended three, total five; max active loader 1 |
| Bounded repeated scrolling | Three automatic loads total produced 11 items, then limit pause; another scroll did not load |
| Manual keyboard/end | Enter loaded the twelfth/final item; Space retried an error; manual focus remained with aria-disabled, not native disabled |
| Existing items/fields | Original first li/input identity and browser edit survived appends; disabled item-three field was excluded by native FormData |
| Footer | Tab reached the static fallback after the manual control; native skip link focused the reachable footer |
| No growth | added=0/hasMore=true stayed at two items and one request; no repeated load after continued visibility |
| Error/retry | Authored error message visible; one manual retry appended three and cleared current error without a chained refill |
| Ignored abort/reset | Cancelling retained active=1 and rejected another load; late success did not commit; max physical loader concurrency stayed 1 |
| Stale error | Explicit aborted outcome retained controlled failure as cause; new disabled state/error=null was not overwritten |
| Root change during pending load | Panel -> document revoked the old generation; cancelled result did not commit |
| Real threshold | Sentinel 40px below native root edge: distance 0 produced zero calls; distance 64 produced one |
| Document root | null root observed a real page sentinel and completed exactly one fixture load |
| Native fieldset | Disabled fieldset aborted the request; first-legend checkbox remained usable; real FormData contained no disabled item fields |
| Nested owners | Inner loading did not load outer; disconnecting inner left outer independently operational |
| Disposal race | Late rejection returned aborted; same native item nodes, no late commit, busy restored, footer focus retained |
| 320px / RTL / 200% CSS zoom | 305px document width; native direction/layout preserved |
| Print/forced colors/reduced motion | Native overflow visible/max-height none; sentinel/manual hidden for print; reduced scroll behavior auto |
| No IntersectionObserver | No polyfill; one real manual load grew two -> five items, supported=false |
| No JavaScript | Two existing editable items and real FormData retained; all JS controls hidden; static link reached the complete twelve-item sample |
| ESM/classic/core/plugins | Native item identity survived later core/advanced/widgets; legacy code remained literal; no mui-infinite-scroll registration; ownership/namespace replacement rejected |

Local loader delays (150/600ms) are controlled fixtures, not transport or throughput
benchmarks. No virtual-DOM/window size, production network latency, full framework,
all-browser, assistive-technology speech or browser-toolbar zoom parity is claimed.
Review/regressions include retry observation rearming, copied completion values, stale
error events, native ancestor/shadow-root cancellation and error-versus-disabled diagnostics.

### Payload and preservation

gzip figures use build compression level 9.

| Asset | Bytes | gzip bytes | gzip ceiling |
| --- | ---: | ---: | ---: |
| Infinite Scroll ESM | 11,810 | 4,627 | 7,000 |
| Infinite Scroll classic | 12,114 | 4,761 | 7,000 |
| Infinite Scroll CSS | 1,318 | 462 | 1,000 |
| Existing core | 62,558 | 14,611 | 15,000 |
| Existing advanced | 6,554 | 2,181 | 3,000 |
| Existing widgets | 10,858 | 2,779 | 4,000 |

Combined ESM + CSS: **5,089 gzip bytes**; classic + CSS: **5,223**.
Those are the original 2026-09-10 acceptance artifacts. The 2026-09-11
[default-style audit](../style-audit/components/infinite-scroll.md) narrows the maintained
source CSS to **706 raw / 305 level-9 gzip bytes** without regenerating `dist`.
All **193 previous top-level JS/CSS assets byte-match**; sorted filename + NUL + content
SHA-256: `49ff4f9caf9007af011ccf97f6471e69bc2a37f4700a511b9c51acd6801b016a`.
No prior component/helper source or ceiling changed; generated dist follows existing ignore policy.
All **512 scoped Infinite Scroll/reference/index/master relative links** resolve.

Catalog: **3,882 rows / 312 of 384 tasks / 78 accepted pages / 72 unchecked tasks**.
P5: **794 rows = 292 adapted + 428 omitted + 74 unresolved**, eight of ten routes accepted.
Remaining **Popselect and Split: 75 rows / 74 unresolved**.
