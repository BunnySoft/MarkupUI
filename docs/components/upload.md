# Upload: real native files, explicit bounded transport

**🟢 Verified retained native queue scope.** A labelled file input owns actual File/
FileList membership. A small explicit controller adopts an authored list/row template
and runs a caller-supplied transport in one bounded pool. No backend, automatic HTTP
method/headers/credentials, upload package, provider, preview/download renderer or
hidden membership fields.

## Loading and native anatomy

| Asset | Contract |
| --- | --- |
| `@dataengine/markup-ui/upload` | createUpload and options/context/transport/result/file/state/selection/controller types |
| `dist/markup-ui-upload.js` | Optional ESM, no custom-element registration |
| `dist/markup-ui-upload.global.js` | MarkupUIUpload; refuses to overwrite an existing namespace |
| `@dataengine/markup-ui/upload/style.css` | External native row/action/status/progress/drop/focus/media presentation |
| [Local demo](../../demo/components/upload.html) | Separate HTML/CSS/JS, small local fixture files and fake timer transport only |
| [Complete reference](../naive-ui/components/upload.md) | All 95 original identities plus six explicit source additions |

```html
<section class="mui-upload" data-upload tabindex="-1" aria-label="Attachments">
  <label>Files <input data-upload-input type="file" name="attachments" multiple></label>
  <div data-upload-actions hidden>
    <button type="button" data-upload-action="start">Start pending files</button>
    <button type="button" data-upload-action="cancel">Cancel active and queued files</button>
    <button type="button" data-upload-action="clear">Clear native selection</button>
  </div>
  <div data-upload-drop hidden>Drop flat files here, or use the native chooser.</div>
  <ul data-upload-list hidden></ul>
  <template data-upload-row>
    <li>
      <span data-upload-name></span><span data-upload-size></span>
      <span data-upload-status></span><progress data-upload-progress hidden></progress>
      <div data-upload-row-actions>
        <button type="button" data-upload-action="start">Start</button>
        <button type="button" data-upload-action="cancel">Cancel</button>
        <button type="button" data-upload-action="retry">Retry</button>
        <button type="button" data-upload-action="remove">Remove</button>
      </div>
    </li>
  </template>
  <p data-upload-status>Use the native file chooser.</p>
</section>
```

```js
import { createUpload } from "@dataengine/markup-ui/upload"
const upload = createUpload(document.querySelector("[data-upload]"), {
  transport: applicationTransport, // Explicit File + context => Promise/result.
  concurrency: 2,
  maxFiles: 20,
  maxFileBytes: 25 * 1024 * 1024
})
// upload.start(), upload.cancel(id), upload.retry(id), upload.remove(id)
// On teardown: upload.disconnect()
```

The connected light-DOM native div/section root is named and has author-supplied
tabindex=-1 for focus fallback. The original labelled native input remains visible,
type=file and unowned by another helper. Name, form, required, accept, multiple,
disabled, native file-selector UI and any supported directory hint stay native.
There is no second chooser trigger that secretly calls input.click() or opens dialogs.

Author one initially empty/hidden ul/ol, one row template, hidden top action container
and a separate plain-text p/div/span readout. The optional drop region starts hidden;
it is text, not a fake button. Top actions may include start/cancel/clear. Each template
has exactly one native li with plain name/size/status fields, one progress and four
real labelled type=button start/cancel/retry/remove actions. Decorative native markup/
icons may be authored; no script/style, IDs, navigable previews or extra form fields.
The row is cloned **once per new selection entry**, never reconstructed on progress.

Existing content, native input, template, labels, listeners and unrelated form fields
remain application-owned. Generated rows and their plain text/data/action/progress
state are controller-owned. Keep the anatomy and row parts stable while bound; use
disconnect/rebind for replacement templates/controls. This is not a general renderer.

## Real FileList synchronization and fallback

The helper first probes **a detached input** with a small local empty probe File and
native DataTransfer. It does not touch the user's input for capability detection.
If DataTransfer/FileList assignment is unsupported, creation throws before exposing
enhancement controls. Catch that error and keep the original native chooser/form
fallback. No queue-removal UI or fake native membership is offered in that fallback.

In a supported browser, every accepted add/replace/remove/clear writes the actual
input.files through DataTransfer (native value="" for clear), and verifies real File
identity/order before committing the list. Native FormData therefore reflects the
displayed selection, including duplicate entries. There are no hidden field proxies
or formdata-event patches. A removal does **not** merely hide a row while leaving its
file selected.
An empty named native file input may still contribute the browser's empty-filename,
zero-byte File placeholder to FormData; that is not a removed file or a helper proxy.

An unexpected runtime synchronization failure clears the native file selection,
disconnects enhancement and emits mui:upload-error with phase=synchronization and
cleared=true, then throws. It does not leave allegedly removed files to be submitted.
The application should surface that failure and let the user choose again. Original
native controls remain usable; rebinding waits for any old actual transports to drain.

Native form submission and explicit transport are **independent**. Finished/cancelled
files stay selected until remove/clear/reset/replacement. A native multipart form can
therefore submit them again. Choose one submission path or deliberately coordinate
both in application code; Upload never intercepts form submit, clears successful files
implicitly or treats a transport response as new native File content.

### Settings and all-or-nothing selection

| Option | Default / meaning |
| --- | --- |
| transport | absent; queue/native FormData still work, start/retry are disabled |
| selection | replace; append is explicit for native chooser/drop/API additions |
| maxFiles | 20; integer 1..100, also constrained to one when native multiple is false |
| maxFileBytes | 25MiB per file; nonnegative safe integer |
| concurrency | 2; integer 1..4 occupied attempt slots per owner |
| autoUpload | false; explicit opt-in, requires transport |
| drop | true when an authored drop zone exists; flat File drops only |
| onChange | Optional synchronous post-change notification; not a veto |

Options are fixed for the owner; there is no reactive prop/controlled-array model.
Native attributes remain application-owned. Counts/sizes/types/extensions are client
UX metadata, **not security/content/server validation**. The helper enforces count/
byte/text bounds; accept remains only a native chooser hint and is not reapplied as
a MIME security filter to drop/add. Validate authorization/content/size again wherever
the application actually receives files.

`add(File[] | FileList, mode?)` accepts only real same-realm File objects, not URLs,
remote metadata or an unbounded iterable. A batch is atomic: validate all bounded
metadata before queue/native membership mutation; no silently accepted subset.
The result contains accepted, added records, rejected samples, rejectedCount and reason.
Rejected samples are capped at 100 even for a much larger native list. Names/paths are
bounded to 4096 characters, MIME metadata to 255; no file contents are read.

- API/drop rejection leaves the previous queue and native selection unchanged.
- A rejected **native replace** or authoritative refresh clears queue/FileList, since
  the user/author already replaced the input; it never resurrects old user files.
- Explicit native **append** rejection retains only the previous queue/FileList and
  announces rejection. That retention is part of the chosen append contract, not a
  silent restore or a form default.
- An empty native change is authoritative clear even in append mode. An empty Files
  drop is rejected without changing existing selection; it is not a clear command.
- Successful replacement gives each newly selected occurrence a fresh ID/batch.
  Append retains old entries and gives new occurrences distinct IDs, even for the same
  File object/name/size. No metadata deduplication guesses content equality.
- Native chooser cancellation/same-file change-event behavior remains browser-owned;
  the helper does not clear input.value to force another chooser event and thereby
  falsify native submission membership.

Preloaded remote/default-file-list records are intentionally absent. A valid initial
native FileList can be adopted; invalid initial selection rejects binding without
changing it. A URL is never converted into a fake File or promised as native upload data.

## Records, commands and actual transport concurrency

`files` returns fresh frozen records with id, batchId, actual file, name, MIME type,
size, native webkitRelativePath (or empty), status, attempt, loaded, total, derived
percentage, error and typed result. No generated remote/thumbnail URL is included.
Files remain real even after success; IDs are generated, opaque and never caller-reused
within an owner. IDs are not authentication tokens.

- `start(id?)` queues pending entries, or all pending entries. It does not retry failed/
  cancelled/finished entries implicitly.
- `retry(id)` queues error/cancelled entries only **after** their old actual attempt
  settled. Ineligible existing states are no-ops; unknown/removed IDs throw.
- `cancel(id?)` requests cancellation of one/all queued or active entries, but retains
  their native selection. Queued, never-invoked entries become cancelled immediately.
- `remove(id)` first synchronizes actual FileList, then removes that row and requests
  cancellation if needed. There is no backend DELETE request.
- `clear()` clears native selection and rows, cancels queued/active work and invalidates
  old callbacks. It does not reset other native form fields.
- `refresh()` reads current native FileList, never an old value snapshot. Reordering
  the same File occurrences preserves record/row identity. Missing files are removed,
  new files get new IDs; invalid external replacement clears with a rejection report.
- `whenIdle()` waits until no queued entries and **all actual occupied transports**
  have settled, including removed/disconnected ignored-abort work. It may wait forever
  if an application transport never settles.

```js
async function applicationTransport(file, context) {
  // Application owns endpoint, method, headers, credentials, body, retries and errors.
  // context: id, attempt, generation, signal, reportProgress(loaded, total?)
  const response = await explicitlyConfiguredApplicationRequest(file, context.signal)
  return { status: "finished", response } // Opaque data; never rendered/navigated by Upload.
}
```

No request implementation is bundled. The caller can use fetch/XHR or another existing
application API, but must tie all work to the returned promise and handle AbortSignal.
Do not return "finished" while detached background network work continues. The component
cannot infer whether an arbitrary returned response actually proves server success.

Each attempt gets an owner generation, stable entry identity, incrementing attempt and
fresh AbortSignal. Slots are reserved before invocation. **Abort is not completion**:
an invoked transport ignoring abort keeps its pool slot until its promise settles.
Its row says cancelling, or the row may already be removed while state.cancelling still
reports the occupied slot. No replacement attempt uses that slot early. Late progress/
completion cannot modify a removed/reset/disconnected or superseded entry.

Cancellation does not undo server effects or prove no bytes were sent. Late successful
responses after cancellation are not announced as finished. Retrying is an explicit
application/user decision; server idempotency and compensation remain application work.
Disconnect keeps the root/input ownership lock until draining attempts settle, so a
new binding cannot silently start a second pool over the same native input.

Transport must resolve `{status:"finished", response?}` or reject/throw. Undefined,
malformed results, throwing response getters and every rejection (including false,
zero/null/undefined) remain errors, never finished. Unknown response data and URLs are
opaque and never HTML, navigation, preview, download or native File replacements.

`reportProgress(loaded, total?)` returns false for stale/blocked attempts. Active progress
requires monotonic nonnegative safe-integer loaded bytes and a null or valid total >=
loaded. Null/zero total is indeterminate. Total may be revised, so percentage is derived
from the latest denominator. Invalid progress reports an error and requests cancellation
without releasing an unsettled transport slot. It becomes error when that attempt settles.
**100% bytes sent is still uploading**; only the explicit fulfilled result is completion.

There are no async pre-upload/remove/retry veto pipelines, user validators, download
callbacks or thumbnail loaders. Run application validation inside the explicit transport
or before an explicit add/start operation. A post-change event is not cancellable and
false/Promise callback values do not gate requests or file membership.

## Notifications, reset, native disabled state and focus

`mui:upload-change` bubbles with reason, nullable file, complete files, state and nullable
selection result. Batch selection/clear/settled events can have file=null; selection.added
contains the new entries. Progress has a separate mui:upload-progress record and does
not drive repeated live readout changes. mui:upload-error supplies phase/error/nullable
file; errors are also observable through state.lastError and per-file error status.

The optional onChange runs after the DOM event as a synchronous notification. Its
exceptions, or unsupported promise returns, are reported without rolling back native
membership or turning actual server success into a retryable failure. Ordinary DOM
listener exceptions follow browser event rules. Reentrant mutations during notification,
transport invocation/result evaluation or reset are rejected; defer them to a later task. Disconnect is
allowed, including before transport invocation. No stale callback starts a request after
an owner is disposed.

The one polite/atomic readout announces selection/count/status changes, not every byte
sample. Rows retain original action nodes and native progress. Actions stay visible
with correct enabled states; a focused now-unavailable action stays focusable with
aria-disabled and guarded activation, becoming natively disabled after blur. Authored
disabled buttons and fieldset state are preserved.

Nothing moves focus on creation/progress. Before removing a focused owned row, focus
returns to the native input, or the named tabindex=-1 scope if the input cannot take
focus. Actual File/row reorder preserves the focused original control rather than
focusing a new row. If the entire host is removed/hidden/inert, native host/dialog focus
restoration remains the application's responsibility.

Native input/fieldset disabled, hidden/inert/closed dialog/details and CSS-hidden scopes
prevent new starts/edits/progress and request cancellation of active/queued work.
Clearing/cancelling remain explicit teardown operations. Observe native attribute changes
and call refresh after external FileList/value/multiple/association changes. Operations
refuse unsynchronized selection rather than restoring stale files. No fieldset, required,
accept, name, form or file input value default is overwritten by the helper.

Native form association (including an external form= ID) determines reset. Reset events
are cancellable. One **zero-delay task**, not a microtask, observes the final native
FileList after a real reset button's default action; browsers can run a microtask
checkpoint before clearing files. Mutations/new starts pause during that boundary and
settled attempt callbacks are held, not busy-polled. Cancelled reset preserves selection/
requests. Uncancelled reset cancels old work and adopts the actual post-reset empty/latest
FileList; no old files are restored. Disconnect cancels that task and drains held completions.

`disconnect()` removes listeners/observer/task, aborts work, removes only generated rows,
restores only still-owned action/list/drop/readout attributes/text and releases ownership
after actual attempts drain. It **leaves the latest native input selection intact**.
To clear sensitive selection as well, call clear before disconnect. No owned object URLs
exist: this scope reads no file bodies and deliberately omits previews/downloads.

## Drag, directory, layout and host limits

Drop enhancement only handles Files inside its authored zone. Native text dragging is
not intercepted. File drops are prevented from navigating the page; disabled/rejected/
directory drops report failure without partial imports. There is no global drop trap.
At most 100 transfer items are inspected; native chooser and manual buttons provide the
keyboard alternative. No fake drop-only role=button or custom keyboard picker exists.

An authored native webkitdirectory hint may provide a platform-specific, already-flat
FileList/fullPath metadata; use multiple and suitable limits. There is no folder crawler,
webkit entry recursion, directory-tree renderer or universal directory-drop promise.
Directory drop entries are explicitly rejected. Unsupported directory hints retain the
ordinary native chooser rather than importing a polyfill.

External CSS owns wrapping, rows, action targets, error filename color, progress dimensions,
focus, drop presentation, RTL/zoom/narrow/media behavior. There are no JS style strings,
drag/animation packages or geometry calculations. Native forms/dialogs remain in their
authored hosts; no portal/provider/focus trap is introduced. Native FileList support and
CSS loading are required for enhancement; no-JS keeps chooser/form behavior with hidden
enhancement-only controls. Print hides enhancement actions/drop region, not the file
status text. No all-browser/AT/OS directory/transport/server guarantees are claimed.

## Default presentation and author styling

The [rendered Upload style audit](../style-audit/components/upload.md) compares the
pinned Naive UI default with this retained native workflow. Defaults use 14px type,
1.6 line height, 34px minimum button height, 3px corners, a centered 24px-padded
one-pixel dashed drop region, borderless rows and local light/dark filename, hover,
drop and error colors. The filename becomes red on error; the explicit failure text
and Retry action remain. Finished files do not become links or green preview names.

Determinate native progress spans the row with a 2px rail and themed info fill.
Unknown totals keep native indeterminate appearance and platform sizing/motion.
High contrast restores native progress appearance and uses unfaded GrayText text/
borders for disabled or aria-disabled actions, inputs, picker buttons and drop regions;
print uses black row/status text
and hides actions/drop. There is no added animation; source hover/row/progress
transitions are not reproduced.

| Public CSS token | Default / purpose |
| --- | --- |
| `--mui-upload-font-size`, `--mui-upload-color` | 14px; light/dark text |
| `--mui-upload-button-size`, `--mui-upload-radius` | 34px minimum; 3px corners |
| `--mui-upload-border`, `--mui-upload-action-color` | Theme border; primary enabled action/drop hover |
| `--mui-upload-drop-padding`, `--mui-upload-drop-background` | 24px; light/dark action surface |
| `--mui-upload-hover`, `--mui-upload-error` | Row hover surface; error filename color |
| `--mui-upload-progress`, `--mui-upload-rail` | Info fill; neutral progress rail |
| `--mui-upload-focus` | Visible keyboard/drag outline |

Local theme defaults use private tokens so public author tokens remain effective,
including within nested light/dark scopes. An authored error color does not implicitly
recalculate the hover surface; set `--mui-upload-hover` when changing that surface.
Native disabled inputs/actions are dimmed, but status text stays readable. The
deliberately focus-retained `aria-disabled` action cannot gain enabled hover styling.

The real chooser and its platform filename UI remain visible. There is no synthetic
trigger, attachment/trash/preview artwork, thumbnail/card, or hidden hover-only action
strip. All four row buttons, size and status remain, so row geometry is intentionally
larger than Naive UI's compact text list. The noninteractive drop text does not become
a picker button. Native control chrome, indeterminate motion and OS dialogs are not
claimed as pixel-identical to the source.

Style-pass source acceptance: **66 targeted tests (58 workflow + 8 style)**; isolated
level-nine gzip **7,727 ESM / 7,855 classic / 1,219 CSS**, within unchanged
**9,000 / 9,000 / 1,250** ceilings. Real Chromium evidence covers synthetic FileList/
FormData, focus, transport settlement, reset, disabled, RTL/narrow, media, author
overrides and no-JS fallback. Controller code is unchanged. Integrated build and
publication remain the coordinating parent's responsibility.

## Historical native-workflow acceptance — 2026-09-10

1. Preserve selection: real FileList/FormData, append/replace/limits/rejection/duplicate
   identity, native reset/cancelled reset, refresh/disabled/forms and fallback verified.
2. File records: one authored template row per real selection occurrence; literal names,
   status/progress/native form membership, no remote fake files or object URLs.
3. Transport: explicit typed promise results, bounded pool, honest ignored-abort slots,
   retries/attempt guards, callback/transport failures, disposal and ownership drain verified.
4. Integration: complete source/reference dispositions, ESM/classic/CSS budgets and native
   Chromium controls/drop/selection/focus/RTL/zoom/media/no-JS/legacy evidence recorded.

Targeted tests: `pnpm test -- tests\upload.test.ts tests\native.test.ts`; build/declarations/
budgets: `pnpm build`. **85 tests pass (58 Upload + 27 native/legacy).** New level-nine
gzip bytes: **7,727 ESM / 7,855 classic / 560 CSS**, combined **8,287 / 8,415** JS+CSS,
under **9,000 / 9,000 / 1,250** ceilings. Unit tests use real jsdom FileList/FormData internals with a
DataTransfer shim and a documented jsdom 26 file-reset default-action shim. Real Chromium
reset-button acceptance additionally caught/fixed the native microtask/default-action
ordering issue; native browser evidence is not inferred from those mocks.

Browser acceptance uses only the two committed local text fixtures or new in-memory
Files, never user files or a real OS chooser. Playwright sets the existing native input
directly; all transports are local fake timers/promises. Actual FileList and FormData
contained both fixture names; removing the first left only the retry fixture in both
and returned focus to the file input. The first fake attempt failed, retry attempt 2
finished, and original row nodes remained identical. Cancelled native reset preserved
selection; a real accepted reset cleared native files and queue together.

With concurrency 2 and three local files, cancelling/removing one ignored-abort entry
left **two occupied slots, one cancelling and one queued**, with only two transport
invocations. The third started only after actual settlement, despite immediate removal
from FormData. Native flat drop created the real selected File. No POST/PUT/DELETE or
download request was made. Final asset/test/catalog measurements are in the
[current index acceptance](../naive-ui/index.md#upload-accepted).

Native fieldset disabling excluded attachments from real FormData without changing the
input's own disabled property. RTL/2x CSS zoom retained the same IDs and FileList
(448px layout / 896px visual scope). A 375px strict-CSP context used a single 260px row
track and completed the fake transport with connect-src:none. Print hid actions/drop,
not row status; forced-colors/reduced-motion retained native selection. No-JS and an
explicitly missing DataTransfer context both retained the native chooser with enhancement
controls hidden; native reset cleared the fallback FileList.

Classic-only generation inside a native dialog blocked work while closed and used the
author's external form association after opening. Opaque javascript-like response data
created no anchor/image. ESM/classic did not register mui-upload; loading the unchanged
advanced plugin afterwards preserved its real File[] selection event exactly once.
