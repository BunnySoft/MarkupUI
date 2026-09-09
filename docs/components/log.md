# Log: bounded native retained text

**🟢 Verified retained plain-log scope.** Native pre/code with real line/Text nodes,
safe partial append, explicit replacement/retention, display trimming, scroll observation
and opt-in conditional follow. No terminal, syntax engine, transport or virtualization.

## Loading and native anatomy

| Asset | Contract |
| --- | --- |
| `@dataengine/markup-ui/log` | createLog, native controller/options/state/line/update/scroll types and limits |
| `dist/markup-ui-log.js` | Independent ESM; registers no custom element |
| `dist/markup-ui-log.global.js` | Classic MarkupUILog namespace; replacement rejected |
| `@dataengine/markup-ui/log/style.css` | External CSS composing the unchanged native Code stylesheet |
| [Local demo](../../demo/components/log.html) | Separate HTML/CSS/JS, with no autonomous producer |
| [Local fixture generator](../../demo/components/log.fixture.js) | Deterministic, generated 10,000-record local data; no fetch/socket/file |
| [Complete reference inventory](../naive-ui/components/log.md) | All original identities and explicit source supplements |

```html
<section class="mui-log" data-log>
  <h2 id="log-title">Application log</h2>
  <pre class="mui-code-block" data-log-viewport data-line-numbers
       tabindex="0" role="region" aria-labelledby="log-title"><code
       class="mui-code" data-log-output>Ready.
Waiting for a local update.</code></pre>
  <p data-log-loading hidden>Application reports loading.</p>
</section>
```

```js
import { createLog } from "@dataengine/markup-ui/log"
const log = createLog(document.querySelector("[data-log]"), {
  maxLines: 2000,
  maxCharacters: 200000,
  follow: false
})
log.append("\nNext record") // The application supplies the delimiter.
```

The root is a connected native div/section. Its original pre is a direct child, with one
direct code child and no formatting whitespace outside that code. The pre is a named
tabindex=0 role=region. Keep the readout passive: no role=log, live-region subscription,
editable content, ARIA grid or terminal keyboard model. Do not wrap frequent updates in
an application live region unless you deliberately own that announcement policy.

Initial code contains **literal text only**. Escape markup in HTML or assign textContent
in application code; never put log strings into innerHTML. The helper rejects rich children,
a competing owner and an active native selection before claiming initial text ownership.
An explicit initial text or lines option may replace the fallback; specifying both rejects.
Absent both, the existing code text is adopted. HTML parsing itself may already normalize
file newlines; the helper's additional normalization is described below.

Binding converts that text into actual .mui-code-line spans, each with an empty decorative
.mui-code-number and a Text node. Original pre/code/root nodes, labels and outside
controls/listeners remain. Generated rows/markers are exclusively owned passive text:
do not insert markup, controls, role/tabindex/editing overrides or change their keys/text.
Application listeners on unchanged native line nodes survive incremental append.

No core/plugins/Form/Virtual List runtime is required. [Code](code.md) supplies native
typography/whitespace/line-number/media presentation. Existing legacy mui-code, other
optional helpers and default bundle loading remain unchanged.

## Exact text, line-ending and append contract

This is a **normalized text buffer**, not a byte-preserving transport or terminal emulator.
All strings are literal; tags, URLs, ANSI-looking sequences, tabs, Unicode and punctuation
are never executed, linked, decoded or syntax-highlighted.

| Operation/input | Meaning |
| --- | --- |
| `setText(completeText)` / initial text | Normalize CRLF and lone CR to LF, including a terminal CR |
| `setLines(strings)` / initial lines | Entries cannot contain CR or LF; join with LF, without an invented terminal LF |
| `append(chunk)` | Concatenate onto the current partial last record; **no implicit separator** |
| Final CR in an append chunk | Hold one pending CR until the next chunk or flush; do not prematurely create two records |
| Next chunk begins LF | Pending CR + LF commits one LF delimiter |
| Next chunk begins another character | Pending CR commits one LF, then the new text follows |
| `flush()` | Declare the pending CR complete and commit its LF; a later LF is a separate delimiter |
| Empty text / `[]` / `[""]` | One empty appendable record, zero retained characters |
| A terminal LF | Preserve a final empty record; blank/trailing records count toward retention |

Examples:

```js
log.setText("part")
log.append("ial\r")
log.text              // "partial"
log.state.pendingCR   // true
log.append("\nnext")  // "partial\nnext", not two breaks
log.append("\r")
log.flush()           // "partial\nnext\n" with a final empty record
```

`text` returns the **retained normalized, untrimmed committed text**. A pending CR is
separately reported and is not yet part of text/characters/DOM. There is no byte-copy,
original line-ending or full-evicted-history claim. UTF-16 code units, not bytes or Unicode
code points, are the counting unit; an emoji commonly occupies two units.

Only LF delimits records after CR normalization. Other Unicode/control characters remain
literal data; browser glyph/whitespace rendering can differ from a terminal's interpretation.
CR progress updates become line breaks, not cursor movement or overwriting a prior record.

## Retention, input limits and stable identities

| Limit | Default / maximum |
| --- | --- |
| maxLines | 10,000 retained LF-delimited records, including the empty appendable tail |
| maxCharacters | 1,000,000 committed normalized UTF-16 units, including inter-record LF |
| maxLineLength | 16,384 units, or the smaller maxCharacters value |
| One text/append call | At most 1,000,000 input units and 10,000 normalized input records |
| One line-array call | At most 10,000 entries / 1,000,000 joined units; no embedded CR/LF |

Limits are positive safe integers fixed at binding; maxLineLength cannot exceed
maxCharacters. Unknown configuration, wrong types, non-finite numbers and invalid booleans
reject explicitly. A pending CR adds at most **one** uncommitted unit outside the committed
character count. Temporary parsing/staging is bounded by these per-call limits, but these
numbers are not a measured total JavaScript heap-size promise.

On append/import, remove the **oldest complete records** until both retained bounds fit.
Never cut a retained record or surrogate pair midway to fit a character cap. A record over
maxLineLength rejects the entire operation, even if old records otherwise could be dropped.
Per-call over-limit input is rejected before native line allocation; split/batch a producer
explicitly rather than relying on invisible truncation.

`trimStart(count)` explicitly removes 0..lineCount-1 leading whole records. `clear()` resets
everything to one new empty record. The returned LogUpdate reports droppedLines,
anchorRemoved and pendingCR. droppedLines counts retention/manual head removal, not the old
records intentionally replaced by setText. totalDroppedLines accumulates since the last
clear, including capacity trimming on import; clear resets that diagnostic count.

Every logical record has a generated monotonically increasing numeric key. Appending to
the partial tail keeps its key/Text node; completed and unaffected records keep their
original nodes/listeners. Trimming retains surviving identities. Explicit setText/setLines
replacement and clear create a new generation with fresh keys, reset vertical reading
position and discard pending CR. Keys are not reset/reused by clear.

The frozen `lines` snapshot exposes `{key,text}` records without LF terminators. It is not
a mutable global log store. After normalization/retention, all source data belongs to this
one explicit controller; no provider or hidden full-history archive exists.

## Selection protection and native scroll context

Incremental append extends an unchanged native Text node where possible; it does not
replaceChildren on each update. Whole-record wrappers and safe original listeners remain.
Display trimming or explicit replacement may need a different string; those operations
are validated before committing any owned data/text changes.

**An update that would change/remove selected log text rejects atomically.** This includes
appending to a selected tail, trimming a selected head, replacing the buffer, clearing or
changing display trim on a selected affected line. A selection in earlier unchanged records
survives later append and trimming of other preceding records.

The application must decide when to release selection, pause its producer, or retain/retry
an input after a rejected update. The helper does not queue an unbounded backlog, silently
discard the rejected chunk or manufacture success. A rejected CRLF continuation preserves
the prior pending CR, allowing an explicit retry after selection is released.

Before incremental mutation, capture the first visible native block and its pixel offset.
After head retention, preserve that surviving key/offset rather than retaining an unrelated
array index. If retention removes the reading anchor, report anchorRemoved and clamp to the
first surviving record. Native integer offset rounding can leave up to about one CSS pixel
of difference; this is not character-level wrapped-line/caret anchoring.

Actual native block offsets are ordered; the helper locates one scroll anchor with a
bounded binary search. This is **not a second virtual-window engine**: no rows are windowed,
positioned absolutely, recycled or unmounted on scrolling. Normal block layout and optional
soft-wrap heights remain browser-owned. Do not override generated record layout with floats,
visual reordering, per-row transforms or independently hidden records.

No method automatically focuses the readout or an outside control. Native Tab, arrows,
PageDown, Home/End and text selection retain browser behavior. The helper does not write
scrollLeft; the browser may naturally clamp it after content/layout changes.

## Follow, explicit scrolling and observation

Follow defaults to **false**. `setFollow(true)` alone never jumps. Incremental changes
advance to the tail only when:

1. Follow is enabled.
2. The native viewport was already within nearBottom of the bottom before the change.
3. The viewport is visible/non-inert and no noncollapsed document selection is active.

nearBottom is an explicit finite 0..256 CSS-pixel tolerance, default 4. A user reading older
records stays anchored rather than being pulled down. While any native selection is active,
automatic following is suppressed, including a selection outside the log.

`scrollTo({top})` or `scrollTo({position:"top"|"bottom"})` is an explicit application action.
Exactly one target is required; finite numeric offsets clamp natively. No smooth/debounce,
index/key, x/y or horizontal-reset overload is provided. It does not enable follow.

Optional silent suppresses owned edge notifications at the resulting native target.
It does not prevent native scroll events globally or mute a different subsequent user
position. Internal follow, anchor restoration and replacement scrolls are silent.

One passive viewport scroll listener reports mui:log-edge `{position,event}` on observed
top/bottom **transitions**, not every scroll at an edge. Top uses 1px rounding tolerance;
bottom uses nearBottom. No repeated wheel-at-boundary retry, request-more callback,
transport/backpressure protocol or data fetch is installed. Short fully visible content
can be at both boundaries; initialization does not announce either.

Edge state is recorded before notifying. Data/view replacement, append, trim, explicit
scrolling or disconnect during an edge listener invalidates the rest of that old
notification batch. There is no success-shaped stale generation callback.

A feature-detected ResizeObserver watches **only the viewport**. It can retain prior
near-tail/reading context through size changes. Without it, call refresh after sizing.
Also call refresh after application wrap/font/visibility changes that do not resize the
observed box. Hidden viewport geometry is zero; updates stay bounded, with no fabricated
height or automatic focus. Browser hiding may clamp/reset position; hidden/show transitions
are not a keep-alive guarantee.

There is no per-frame layout polling, animation-frame scheduler, timer/interval, wheel
handler or global mutation observer. `refresh()` updates geometry/ownership, not log data.
Synchronous method failures throw and populate error; observed failures emit mui:log-error
with `{error}`. Neither event includes retained log contents.

## Native presentation, loading and forms

The stylesheet composes [Code's native presentation](code.md), with log-scoped tokens:
--mui-log-font-size (.875rem), --mui-log-line-height (1.25),
--mui-log-rows (15), --mui-log-height (optional explicit CSS override),
--mui-log-padding (.5rem), and --mui-log-gutter (5ch).

Default height is fifteen native line heights plus padding/borders. Font size, rows and
line height are **external CSS**, not a JavaScript number-to-style bridge. Code font-family,
tab-size/color/border tokens remain available. JS writes no geometry or presentation styles.

Without data-word-wrap the native pre scrolls long lines horizontally. Presence
data-word-wrap opts into native wrapping; numbering is suppressed when wrapped, following
Code's existing contract. Logical RTL gutter placement never reverses record order.
Very long records are bounded by maxLineLength; no horizontal width measurement/mirror or
clipping-based fake virtualization is used.

Presence data-line-numbers uses empty aria-hidden markers and Code's CSS counters.
Numbers describe **current retained-buffer positions**, not stable keys or original
evicted line numbers. Generated digits are not source text. Native selection/find covers
all retained records, including offscreen records; there is no mounted-only window caveat
because every retained record is mounted.

setTrim controls per-record **display-only** String.trim. text/lines/character retention
still include normalized source whitespace. This is separate from whole-head retention.
No upstream URI/highlight/token/ANSI parsing is introduced.

Loading is informative aria-busy and optional authored plain loading text outside the pre.
It does not hide/clear logs, disable controls or imply an active request. No spinner,
animation, localization provider or spin-props forwarding is required. Status text is not
automatically live. Original loading/busy attributes are conditionally restored on handoff.

pre/code is **not a form field**: logs contribute nothing to FormData, and native form
reset does not clear the log. Outside inputs/labels/actions remain native and retain their
own submission/reset behavior. No hidden value proxy or fake readonly textarea is inserted.

Print expands/wraps the entire retained readout and suppresses decorative numbers. Forced
colors retain readable native text/borders. There is no assertion of paper-pagination,
browser-toolbar zoom, all-browser or screen-reader speech parity.

## API and explicit lifecycle

| API | Contract |
| --- | --- |
| viewport, output | Original native pre/code |
| connected, error, state | Lifecycle/error plus current bounded counts, flags, geometry observations and generation |
| text, lines | Retained normalized-untrimmed committed data; immutable line snapshots |
| append(string) | Incremental partial-tail append and capacity retention; returns LogUpdate |
| flush() | Commit a pending final CR as LF; explicit retry/selection rules apply |
| setText(string), setLines(array) | New generation/full replacement, fresh keys and vertical position zero |
| trimStart(count) | Remove complete leading records only |
| clear() | New empty generation, pending CR removed, dropped count reset |
| setFollow(boolean) | Enable conditional following without jumping |
| setTrim(boolean) | Display whitespace trim only, selection guarded |
| setLoading(boolean) | Native busy/status state only |
| scrollTo(options), refresh() | Explicit native scroll / geometry synchronization |
| disconnect() | Release observation/listeners/ownership while retaining current native text |

No new log-content/change event is emitted merely because an application calls a setter.
Edge/error events are diagnostic native-view observations, not user input, generated
network requests or a global logging service. Normal application event-listener exceptions
retain browser reporting semantics. Generated-row/marker/structure ownership is validated;
invalid outside mutations are not silently overwritten, even during cleanup.

Disconnect invalidates pending notifications, stops the observer/listener and releases
cross-module ownership. **Current line/Text nodes, native selection, visible text and
source snapshots remain**; old removed records are never resurrected. It does not flush
pending CR, since that could mutate selected text. Flush first if the producer has ended;
otherwise preserve the explicit pendingCR flag when handing off a partial stream.
Call disconnect before removing the root. There is no document-wide removal observer;
explicit/observed refresh rejects detached anatomy rather than silently buffering into it.

After disconnect, the application owns static DOM and should end/hide enhancement actions.
The demo does so and chooses its own outside focus destination. Data getters retain their
last source snapshot; later application edits to static DOM are not a new live data source.
For rebinding, explicitly obtain the old normalized text, release any affected selection,
assign that text to code.textContent and create a new owner. Rich former generated rows
are not silently adopted. There is no reconnect singleton/provider or retained hidden queue.

## Complete mapping and limits

[Reference inventory](../naive-ui/components/log.md):
**21 original identities + 25 source-only supplements = 46 rows:
19 adapted native capabilities + 27 intentional omissions; zero unresolved.**
Every original owner/member/kind/API-line identity remains in its original order.

Retained mappings are font-size/line-height/rows as native CSS; lines/log as explicit
normalized native text; loading as busy/plain status; trim as per-line display whitespace;
native reach-top/reach-bottom observations; scrollTo plus top/position/silent fields;
source offsetBottom as nearBottom; the two scrolling overloads; NLog/LogInst as an explicit
native owner/controller; and literal LogLine.line data.

Individually omitted: hljs, language, spin-props and strokeWidth/stroke/scale/radius;
on-require-more/from and repeated wheel retries; configurable offsetTop; deprecated
scrollToTop/scrollToBottom aliases; logProps/LogProps/LogSpinProps compatibility schemas;
theme/themeOverrides/builtinThemeOverrides; LogInjection and every trim/language/highlight/
mergedHljs Ref; private LogLine/LogLoader constructors and loader clsPrefix/spinProps.
No default slot, public streaming transport or syntax-engine member API is invented.

Follow, append/flush, stable keys, retention limits, selection guards and clear generations
are **explicit target extensions**, not additional Naive UI props. Source Markdown and source
defaults/empty-log precedence differ and are recorded in the tracker. This is not full
framework/terminal/highlighter parity.

### Why there is no Log virtualization

The approved subset favors bounded full native selection/find/printing and long-line
horizontal scrolling. [Virtual List](virtual-list.md) is already the separate fixed-height,
bounded-window helper; its horizontal clipping and mounted-only native selection/find
contract is not silently substituted here.

Log retains **10,000 actual record spans at the maximum**, each with one number span and
one Text node: 20,000 descendant elements plus 10,000 source Text nodes, not one giant
text node counted as “bounded rendering.” The constant is a retention ceiling, **not**
a 17-node virtual window or a guarantee of cheap per-character streaming.

Validation and native full-layout work are proportional to the retained buffer. Batch
producer updates, prefer smaller configured limits for frequent updates, and measure the
application's real content. The measured burst costs below are intentionally published;
do not treat this as a 100k-line streaming/virtualization benchmark.

## Four accepted steps and measured evidence — 2026-09-09

1. [x] Read pinned Log/LogLine/loader/interfaces/exports, native Code and Virtual List;
   retain every original identity and separate source-only supplements.
2. [x] Implement explicit literal record/line-ending/retention/generation contracts.
3. [x] Preserve native selection/read context, conditional follow and bounded full DOM;
   deliberately omit a second window, highlighter or producer engine.
4. [x] Targeted regressions, declarations/build/budgets and actual Chromium acceptance.

`pnpm exec vitest run tests\log.test.ts tests\code.test.ts tests\native.test.ts`:
**98 passing tests: 59 Log, 12 Code and 27 existing native/legacy cases**.
`pnpm build` passed independent assets/declarations/all budgets. No dependency was installed
and no shared Code/Virtual List/core/plugin source or ceiling was changed.

Chromium **151.0.7922.174**, dedicated local Log demo tab plus separate live 2.45.3 reference
tab. Other existing user/demo tabs were not altered. All demo fixture/resource data stayed
local; no real clipboard, download or external log persistence was exercised.

| Actual browser acceptance | Result |
| --- | --- |
| Passive accessibility | Named native region -> code -> literal text; empty decorative number markers absent from accessible text, no role=log/live stream |
| No-JS fallback | Five readable/selectable lines / 125 text units, enhancement controls hidden, 305px document at 320px viewport |
| 10,000-record fixture | 10,000 actual line spans / 10,000 source Text nodes / 20,000 descendant elements; 377,055 retained units |
| Native geometry | 17.5px line boxes, 175,016px extent, 279px client height; bottom offset 174,737px and final record reachable |
| Final fixture load | 301.5ms replacement/bind-to-records observation, not an SLA |
| Twenty 25-record bursts at capacity | 500 records appended; maximum remained 10,000 line spans; p50 192.7ms / p95 292.4ms / max 354.7ms per batch |
| Whole retained native text | Range and actual Selection both exactly 377,055 units, matching normalized source; native find located Line 05000 |
| Native selected-word append | Double-clicked “Line ” remained selected in the same Text node while another record appended/retention advanced |
| Selected-head retention | Explicit error, unchanged text and selection; no successful data-loss fallback |
| Middle/head trim | After 25 old records were removed, surviving anchor/Text identity remained; measured visual offset difference -0.5 CSS px |
| Follow versus reader | Near-tail append finished at gap 0; a middle reader remained off-tail with retained logical anchor |
| CRLF/partial/trim | Split trailing CR + next LF committed one delimiter; flush preserved final empty record; display trim retained raw whitespace and nodes |
| Long-line bound | 16,384-unit line retained with native ~126,166px horizontal extent; next unit rejected; ArrowRight moved 40px |
| Native keyboard | PageDown moved 244px with viewport focused; Ctrl+End reached final record at gap 0 |
| Resize | Eight-row setting produced 156px client height and retained tail gap 0; user-scrolled context remained native |
| Narrow/RTL/200% CSS zoom | Final document width 305px at 320px viewport; 35px rendered line boxes and reachable bottom in RTL |
| Hidden/media | Hidden viewport had zero client height while keeping 10,000 bounded records; print expanded/wrapped all retained records and hid numbers; forced-colors/reduced-motion matched |
| Reading after print | An off-tail reader at 70,000px remained at 70,000px, not pulled to the bottom |
| Handoff | Current nodes, selected “literal”, normalized text remained; loading/busy attributes restored; no stale scroll work |
| Coexistence | All log nodes survived later core/advanced/widgets loading; legacy mui-code remained literal; no mui-log registration |
| Classic/ESM ownership | Classic factory exported; overlapping owner and namespace replacement rejected without replacing the existing API |

Review fixes/regressions cover stale edge batches after append/clear/disconnect, passive
generated-row/empty-marker ownership, bounded native anchor lookup and narrow demo text
wrapping. This does not certify all engines/assistive technology, browser-toolbar zoom,
paper pagination, arbitrary application CSS reordering or real-time throughput.

### Payload and preservation

gzip uses the build's **level 9** consistently.

| Asset | Bytes | gzip bytes | gzip ceiling |
| --- | ---: | ---: | ---: |
| Log ESM | 11,549 | 4,774 | 6,000 |
| Log classic | 11,823 | 4,920 | 6,000 |
| Log CSS including native Code | 4,499 | 1,319 | 1,750 |
| Existing core | 62,558 | 14,611 | 15,000 |
| Existing advanced | 6,554 | 2,181 | 3,000 |
| Existing widgets | 10,858 | 2,779 | 4,000 |

Combined ESM + CSS: **6,093 gzip bytes**; classic + CSS: **6,239**.
All **190 prior top-level JS/CSS assets byte-match**. Sorted filename + NUL + content
SHA-256: `b1c34dcac2ad646eef4a4454f618a5d4506fb6ff1e9b4f0d2739d931c280deb0`.
Generated dist follows the existing ignore policy.
All **511 scoped Log/reference/index/master relative links** resolve.

Catalog: **3,878 rows / 308 of 384 tasks / 77 accepted pages / 76 unchecked tasks**.
P5 remains in progress: **790 rows = 288 adapted + 425 omitted + 77 unresolved**,
seven of ten routes accepted. **Next: Infinite Scroll**, then Popselect and Split
(78 rows / 77 unresolved). No later component implementation is included in this commit.
