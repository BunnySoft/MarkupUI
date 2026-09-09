# Upload, UploadTrigger and UploadDragger

**🟢 Verified retained native file/queue scope.** A real labelled file input, one
authored row per selection occurrence, synchronized FileList/FormData, bounded
caller-supplied transport and honest cancellation. No upload package, implicit backend,
provider, hidden membership fields, remote-file renderer, previews or downloads.

## Baseline and implementation evidence

The unchanged [advanced plugin](../../../src/plugins/advanced.ts) provides legacy
mui-upload file selection/accept/multiple and a selected File[] event, not transport.
The [new helper](../../../src/components/upload/upload.ts) is separate opt-in native
DOM ownership; no custom element is registered. [External CSS](../../../src/components/upload/upload.css)
owns native list/actions/progress/drop/media. See the [canonical contract and acceptance](../../components/upload.md),
[tests](../../../tests/upload.test.ts) and [local fake-transport demo](../../../demo/components/upload.html).

Pinned source review covered [props](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/src/Upload.tsx#L300-L399),
[request callbacks/XHR](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/src/Upload.tsx#L77-L298),
[selection and submit](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/src/Upload.tsx#L520-L650),
[public file/request/instance types](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/src/public-types.ts#L5-L59),
[file actions](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/src/UploadFile.tsx#L116-L206),
[Trigger](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/src/UploadTrigger.tsx#L15-L89)
and [Dragger](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/src/UploadDragger.tsx#L7-L37).
Source parallel additions, hidden XHR assumptions, post-finish File changes, async
vetoes and recursive drop handling are not claimed as native parity.

## Migration steps

**Delivery phase:** P6 — specialized transport. **Task state:** 🟢 Verified retained scope.
**Prerequisites:** native P4 controls/form ownership and scoped lifetime/budget conventions;
broader P0-01–P0-09 task IDs remain open/partial.
**Next task:** Calendar, separately. No Calendar implementation is included here.

1. [x] **Preserve native selection.** Label/input/accept/multiple/name/form/reset,
   FileList synchronization, explicit unsupported-browser fallback and flat drop verified.
2. [x] **Define file records.** Stable occurrence/batch IDs, real File identity,
   native status/progress/text rows and explicit remote/thumbnail/URL omissions.
3. [x] **Specify transport.** Explicit typed caller transport, 1..4 occupied slots,
   attempt/owner guards, cancellation/retry and ignored-abort ownership draining.
4. [x] **Test failure lifecycles.** Rejections, callback failures, native reset ordering,
   stale work, focus/forms/disabled/drop/no-JS/legacy, build/budgets and exact inventory.

### Native primitives and fallback

Native input type=file and FileList/FormData remain authoritative. A detached
DataTransfer capability probe gates enhancement; failure leaves native selection and
hidden enhancement controls untouched. Unsupported runtime synchronization fails closed
by clearing selection, disconnecting and reporting an error. Native templates are cloned
once per accepted File occurrence; no preloaded URL is made into a fake File.
Flat Files are dropped into a scoped optional native region, not a directory crawler.
No helper opens the OS chooser or starts a request without explicit caller configuration.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/upload)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload)
- [Catalog/provenance](../index.md) · [Architecture/statuses](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`;
historical MarkupUI baseline **5dcb190 / 0.11.0**.
Inventory: **64 original public table rows + 31 original supplementary declarations +
three explicit source/type supplements + three source-inherited theme rows = 101
tracker rows**. Every original identity/link remains one-for-one. Verified denotes
the stated native adaptation, not omitted flag variants, veto/renderer semantics,
transport protocols or all-browser/server parity.
**57 native adaptations + 44 intentional omissions; zero unresolved.**

### Upload Props

| Upstream item · source | Kind | Retained mapping / explicit boundary | Status |
| --- | --- | --- | --- |
| [`abstract`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L29) | Prop | No abstract/image-card renderer mode; an explicit named native scope is required. | ⏭️ Intentionally omitted |
| [`accept`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L30) | Prop | Original input.accept; chooser hint, not content/security validation or automatic drop filtering. | 🟢 Verified |
| [`action`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L31) | Prop | No endpoint option, implicit request destination or backend. | ⏭️ Intentionally omitted |
| [`always-show-actions`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L32) | Prop | Native actions remain visible with state-specific disabling; no hover-only action mode. | 🟢 Verified |
| [`create-thumbnail-url`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L33) | Prop | No thumbnail loader, file-body read or object-URL preview ownership. | ⏭️ Intentionally omitted |
| [`custom-request`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L34) | Prop | transport(File, context) returns typed finished result/promise; explicit caller policy, AbortSignal and byte progress. | 🟢 Verified |
| [`custom-download`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L35) | Prop | No download callback or side effect. | ⏭️ Intentionally omitted |
| [`data`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L36) | Prop | Application transport closure owns its request body; no injected HTTP data bag. | ⏭️ Intentionally omitted |
| [`default-file-list`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L37) | Prop | No remote/default metadata list. Valid initial real FileList can be adopted; native reset has no file defaults. | ⏭️ Intentionally omitted |
| [`default-upload`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L38) | Prop | autoUpload explicit opt-in, false by default; requires transport. | 🟢 Verified |
| [`directory`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L39) | Prop | Author native webkitdirectory/multiple hints; adopt only the browser's bounded flat FileList/path metadata. | 🟢 Verified |
| [`directory-dnd`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L40) | Prop | No directory entry recursion/crawler; directory drops reject. | ⏭️ Intentionally omitted |
| [`disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L41) | Prop | Native input/fieldset disabled plus hidden host gates; abort requested work without freeing unsettled slots. | 🟢 Verified |
| [`file-list-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L42) | Prop | Original native ul/ol class and external CSS. | 🟢 Verified |
| [`file-list-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L43) | Prop | No inline object/string styles; author external CSS. | ⏭️ Intentionally omitted |
| [`file-list`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L44) | Prop | Readonly controller.files over synchronized real FileList; explicit add/remove/clear/refresh, no controlled metadata renderer. | 🟢 Verified |
| [`headers`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L45) | Prop | Caller transport owns headers, no implicit forwarding/defaults. | ⏭️ Intentionally omitted |
| [`input-props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L46) | Prop | Author the actual native input attributes/form/label; no prop bag. | 🟢 Verified |
| [`image-group-props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L47) | Prop | No ImageGroup/viewer integration or preview pipeline. | ⏭️ Intentionally omitted |
| [`is-error-state`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L48) | Prop | No XHR status hook; transport must reject errors and fulfill an explicit finished result. | ⏭️ Intentionally omitted |
| [`list-type`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L49) | Prop | Text/native-row scope only; no image/image-card renderer modes. | ⏭️ Intentionally omitted |
| [`max`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L50) | Prop | maxFiles 1..100 plus byte/metadata bounds; atomic rejected batch, not invented input.max support. | 🟢 Verified |
| [`method`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L51) | Prop | No implicit POST/PUT/DELETE or HTTP method option. | ⏭️ Intentionally omitted |
| [`multiple`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L52) | Prop | Original native multiple attribute; false limits the actual selected list to one. | 🟢 Verified |
| [`name`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L53) | Prop | Original input.name and native form association; no transport field-name guessing. | 🟢 Verified |
| [`render-icon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L54) | Prop | Author native decorative row-template markup/icons; no VNode callback or asset package. | 🟢 Verified |
| [`response-type`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L55) | Prop | No bundled XHR/response parser; response data stays opaque. | ⏭️ Intentionally omitted |
| [`should-use-thumbnail-url`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L56) | Prop | No thumbnail inference or URL chooser. | ⏭️ Intentionally omitted |
| [`show-cancel-button`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L57) | Prop | Real cancel action, always present/state-disabled; no visibility flag or focus-destroying replacement. | 🟢 Verified |
| [`show-download-button`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L58) | Prop | No download action. | ⏭️ Intentionally omitted |
| [`show-file-list`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L59) | Prop | Required native list is exposed only when enhanced; no listless queue mode. | 🟢 Verified |
| [`show-preview-button`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L60) | Prop | No preview action or automatic URL navigation. | ⏭️ Intentionally omitted |
| [`show-remove-button`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L61) | Prop | Real remove action synchronizes native membership before removing a row. | 🟢 Verified |
| [`show-retry-button`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L62) | Prop | Real retry action gated by settled error/cancelled status, never an occupied cancelled attempt. | 🟢 Verified |
| [`show-trigger`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L63) | Prop | Original keyboard-accessible native file chooser remains; no hidden-trigger mode. | 🟢 Verified |
| [`trigger-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L64) | Prop | Author native label/input classes and ::file-selector-button CSS. | 🟢 Verified |
| [`trigger-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L65) | Prop | No inline object/string trigger styles. | ⏭️ Intentionally omitted |
| [`with-credentials`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L66) | Prop | No credential/cookie defaults or forwarding; caller transport owns policy. | ⏭️ Intentionally omitted |
| [`on-change`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L67) | Callback | mui:upload-change plus optional synchronous onChange notification. Exceptions surface; no veto/rollback. | 🟢 Verified |
| [`on-error`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L68) | Callback | Error status/change and mui:upload-error diagnostics; no return-value FileInfo rewrite. | 🟢 Verified |
| [`on-finish`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L69) | Callback | Finished change only after typed result settlement; no mutating finish callback or File nulling. | 🟢 Verified |
| [`on-before-upload`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L70) | Callback | No asynchronous validator/pre-upload veto pipeline. Validate in caller transport or before explicit add/start. | ⏭️ Intentionally omitted |
| [`on-download`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L71) | Callback | No download hook/effect; source callback is also labelled currently unused in props. | ⏭️ Intentionally omitted |
| [`on-preview`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L72) | Callback | No preview hook, viewer or navigable result URLs. | ⏭️ Intentionally omitted |
| [`on-remove`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L73) | Callback | No false/Promise/error remove veto. Explicit remove command emits a non-veto post-change instead. | ⏭️ Intentionally omitted |
| [`on-retry`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L74) | Callback | No retry veto hook; explicit guarded retry plus post-change notification. | ⏭️ Intentionally omitted |
| [`on-update:file-list`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L75) | Callback | change.files snapshot after actual FileList synchronization; no controlled metadata array. | 🟢 Verified |

### UploadFileInfo Type

| Upstream item · source | Kind | Retained mapping / explicit boundary | Status |
| --- | --- | --- | --- |
| [`id`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L81) | Record field | Generated stable string occurrence ID; never accepted/reused from caller metadata. Source type is string, unlike English string/number. | 🟢 Verified |
| [`name`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L82) | Record field | Actual File.name written as literal text. | 🟢 Verified |
| [`status`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L83) | Record field | Pending/uploading/error/finished/removed plus queued/cancelling/cancelled native lifecycle distinctions. | 🟢 Verified |
| [`batchId?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L84) | Record field | Generated batch ID per accepted selection. | 🟢 Verified |
| [`file?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L85) | Record field | Always a real retained File, including finished/cancelled selected entries. | 🟢 Verified |
| [`fullPath?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L86) | Record field | Native webkitRelativePath or empty; no fabricated filesystem path/crawler. | 🟢 Verified |
| [`percentage?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L87) | Record field | Derived from validated loaded/total bytes; null for unknown/zero total, matching source nullable type. | 🟢 Verified |
| [`thumbnailUrl?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L88) | Record field | No thumbnail URL or preview resource. | ⏭️ Intentionally omitted |
| [`type?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L89) | Record field | Actual File.type metadata, not validated content/security classification. | 🟢 Verified |
| [`url?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L90) | Record field | No promoted navigable remote URL. Opaque response data never becomes a File or anchor. | ⏭️ Intentionally omitted |

### UploadTrigger Props

| Upstream item · source | Kind | Retained mapping / explicit boundary | Status |
| --- | --- | --- | --- |
| [`abstract`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L96) | Prop | Native label/file input replace the companion; no abstract provider/renderer mode. | ⏭️ Intentionally omitted |

### Upload Methods

| Upstream item · source | Kind | Retained mapping / explicit boundary | Status |
| --- | --- | --- | --- |
| [`clear`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L121) | Method | controller.clear clears real native membership and cancels work, not other form fields. | 🟢 Verified |
| [`openOpenFileDialog`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L122) | Method | No helper dialog-opening alias. Original native input/label owns chooser activation; app may use native APIs with user activation. | ⏭️ Intentionally omitted |
| [`submit`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L123) | Method | start(id?) and explicit retry(id), distinct from native form submission; no implicit endpoint. | 🟢 Verified |

### Upload Slots

| Upstream item · source | Kind | Retained mapping / explicit boundary | Status |
| --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L129) | Slot | Original native scope/input/list/template/readout children. | 🟢 Verified |

### UploadDragger Slots

| Upstream item · source | Kind | Retained mapping / explicit boundary | Status |
| --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L135) | Slot | Authored hidden-until-enhanced native drop region and keyboard chooser alternative. | 🟢 Verified |

### UploadTrigger Slots

| Upstream item · source | Kind | Retained mapping / explicit boundary | Status |
| --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L141) | Slot | Original label/input and native controls, no injected scoped-slot renderer. | 🟢 Verified |

### UploadCustomRequestOptions

| Upstream item · source | Kind | Retained mapping / explicit boundary | Status |
| --- | --- | --- | --- |
| [`file`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L102) | Record field | Real File argument plus context ID/attempt/generation; no nullable remote-file record. | 🟢 Verified |
| [`action?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L103) | Record field | No injected request endpoint. | ⏭️ Intentionally omitted |
| [`data?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L104) | Record field | Caller transport owns body, including source string/Blob variants; no data bag. | ⏭️ Intentionally omitted |
| [`withCredentials?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L107) | Record field | No credential policy is inferred or forwarded. | ⏭️ Intentionally omitted |
| [`headers?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L108) | Record field | No request-header adapter. | ⏭️ Intentionally omitted |
| [`onProgress`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L111) | Record field | context.reportProgress(loaded,total?) with stale/finite/monotonic guards and native progress. | 🟢 Verified |
| [`onFinish`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L112) | Record field | Explicit fulfilled {status:finished,response?}; no fire-and-forget finish callback freeing hidden work. | 🟢 Verified |
| [`onError`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L113) | Record field | Transport throw/rejection remains error; malformed results also error. | 🟢 Verified |

### UploadCustomRequestOptions.onProgress

| Upstream item · source | Kind | Retained mapping / explicit boundary | Status |
| --- | --- | --- | --- |
| [`percent`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L111) | Record field | Derived record.percentage; no unbounded direct percentage setter. 100% bytes is not server success. | 🟢 Verified |

### Exported helper

| Upstream item · source | Kind | Retained mapping / explicit boundary | Status |
| --- | --- | --- | --- |
| [`uploadDownload`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L145) | Method | No download helper or automatic navigation of returned URLs. | ⏭️ Intentionally omitted |

### Original callback/method/trigger inline declarations

These are the same original scoped identities/links, grouped without dropping any fields.

| Upstream item · source | Kind | Retained mapping / explicit boundary | Status |
| --- | --- | --- | --- |
| [`on-change.file`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L67) | Inline field | change.file is nullable for batch operations; selection.added carries accepted entries. | 🟢 Verified |
| [`on-change.fileList`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L67) | Inline field | Frozen change.files after native synchronization. | 🟢 Verified |
| [`on-change.event?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L67) | Inline field | No original-event forwarding; native input events remain native and are not redispatched. | ⏭️ Intentionally omitted |
| [`on-error.file`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L68) | Inline field | Error diagnostics/change contain the actual file record when applicable. | 🟢 Verified |
| [`on-error.event?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L68) | Inline field | No private XHR ProgressEvent contract. | ⏭️ Intentionally omitted |
| [`on-finish.file`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L69) | Inline field | Finished change.file retains its real File, status and opaque typed result. | 🟢 Verified |
| [`on-finish.event?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L69) | Inline field | No XHR event forwarding or finish-transform callback. | ⏭️ Intentionally omitted |
| [`on-before-upload.file`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L70) | Inline field | No before-upload veto context; caller transport receives File directly. | ⏭️ Intentionally omitted |
| [`on-before-upload.fileList`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L70) | Inline field | No asynchronous batch validator/veto context. | ⏭️ Intentionally omitted |
| [`on-preview.event`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L72) | Inline field | No preview event, anchor interception or viewer. | ⏭️ Intentionally omitted |
| [`on-remove.file`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L73) | Inline field | Non-veto post-remove change.file reports the removed real File record. | 🟢 Verified |
| [`on-remove.fileList`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L73) | Inline field | Post-remove change.files is the remaining synchronized native selection. | 🟢 Verified |
| [`on-remove.index`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L73) | Inline field | No veto index context; operations address stable IDs, not shifting list indices. | ⏭️ Intentionally omitted |
| [`on-retry.file`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L74) | Inline field | Non-veto retry change.file, with fresh attempt on actual invocation. | 🟢 Verified |
| [`submit.fileId?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L123) | Inline field | start(id?) selects one stable entry or all pending entries. | 🟢 Verified |
| [`submit.retry?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L123) | Inline field | Explicit retry(id) instead of an overloaded submit option; never retries an unsettled cancelled attempt. | 🟢 Verified |
| [`default.handleClick`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L141) | Trigger slot field | Native labelled file input activation; no injected callback or fake trigger semantics. | 🟢 Verified |
| [`default.handleDragOver`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L141) | Trigger slot field | Scoped Files-only dragover and external drop-state CSS. | 🟢 Verified |
| [`default.handleDragEnter`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L141) | Trigger slot field | Scoped Files-only dragenter; no global drag interception. | 🟢 Verified |
| [`default.handleDragLeave`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L141) | Trigger slot field | Clears only owned drop feedback. | 🟢 Verified |
| [`default.handleDrop`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/demos/enUS/index.demo-entry.md#L141) | Trigger slot field | Bounded flat Files drop, atomic rejection and native FileList write; no recursive directory import. | 🟢 Verified |

### Explicit source/type supplements

These three identities are additional source evidence, not invented English table rows.

| Upstream item · source | Kind | Retained mapping / explicit boundary | Status |
| --- | --- | --- | --- |
| [`onUpdateFileList`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/src/Upload.tsx#L349) | Source alias | One current-files DOM notification; no second alias/array-of-callback compatibility layer. | 🟢 Verified |
| [`UploadInst`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/src/public-types.ts#L5-L9) | Source public interface | Native UploadController commands and original input reference; no Vue instance or chooser-opening alias. | 🟢 Verified |
| [`UploadSettledFileInfo`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/src/public-types.ts#L35) | Source public type | No Required source metadata/nullable URL/thumbnail type alias; use native UploadFile with actual File. | ⏭️ Intentionally omitted |

### Explicit source-inherited theme props

The [source spread](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/src/Upload.tsx#L301)
adds these three inherited source rows.

| Upstream item · source | Kind | Retained mapping / explicit boundary | Status |
| --- | --- | --- | --- |
| [`theme`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts#L170) | Inherited source prop | No provider/theme graph; explicit external native CSS. | ⏭️ Intentionally omitted |
| [`themeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts#L171) | Inherited source prop | No runtime theme object or generated style rules. | ⏭️ Intentionally omitted |
| [`builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts#L172) | Inherited source prop | No internal theme merge precedence; legacy/P0 exceptions remain independent. | ⏭️ Intentionally omitted |

<!-- END PINNED API INVENTORY -->
