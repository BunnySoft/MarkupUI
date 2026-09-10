# Image, group navigation and native-dialog preview

**Migration status: 🟢 Verified for the retained native image/fallback/dialog scope.**
Native thumbnails remain authored `img`/`picture`/links. An optional dependency-free helper
adds bounded plain-image fallback and an owned, authored-template dialog with previous/next/
close controls. This is not a gesture/zoom/rotation/fullscreen/download viewer framework.

**Default-style audit: 🟢 thumbnail defaults and preview surfaces verified / 🟡 native
toolbar differences retained.** The [2026-09-10 rendered report](../style-audit/components/image.md)
records the corrected viewport fitting and light/dark chrome, separately from the
historical migration acceptance below.

## Distribution and loading

| Asset / export | Purpose |
| --- | --- |
| `@dataengine/markup-ui/image` | `createImagePreview` plus native controller/detail types. |
| `dist/markup-ui-image.js` | Standalone ESM helper. |
| `dist/markup-ui-image.global.js` | Classic `window.MarkupUIImage` helper namespace. |
| `@dataengine/markup-ui/image/style.css` | `dist/markup-ui-image.css`, independent external CSS. |
| `src/components/image/` | Maintained helper and CSS. |
| `demo/components/image.*` | Native gallery, local original SVG fixtures and application setup. |

```html
<link rel="stylesheet" href="./vendor/markup-ui-image.css">
<script defer src="./vendor/markup-ui-image.global.js"></script>
<script defer src="./gallery.js"></script>
```

```js
// ESM alternative:
import { createImagePreview } from "@dataengine/markup-ui/image";
const preview = createImagePreview(document.querySelector("#gallery"));
preview.open(0, document.querySelector("#open-gallery"));
// During application teardown, including when currently closed:
preview.disconnect();
```

There is no mui-image/mui-image-group definition, registry/provider or pre-upgrade property
bridge. An explicit helper fits native author roots without requiring a virtual constructor.
Call setup after insertion; `connect()` is idempotent, and reattachment after disconnect
requires an explicit connect. Core-first/helper-first ordering has no registration conflict.
Other enhanced components keep their own registration restrictions.

## Native gallery and owned template

```html
<div id="gallery" data-image-group>
  <figure class="mui-image-frame" data-image-frame>
    <a data-image-preview href="./full-photo.svg">
      <picture>
        <source media="(min-width: 40rem)" srcset="./large-thumb.svg">
        <img class="mui-image" src="./thumb.svg" width="200" height="125"
          loading="lazy" decoding="async" alt="Amber mountains beneath a sun">
      </picture>
    </a>
    <figcaption>An authored caption, not a duplicate generated image name.</figcaption>
    <p data-image-placeholder>Native image loading; the original link remains available.</p>
    <p data-image-error hidden>The thumbnail could not load.</p>
  </figure>
  <template data-image-preview-template>
    <dialog aria-label="Image preview">
      <header><h2>Image preview</h2><button type="button" data-image-close>Close preview</button></header>
      <p data-image-position></p>
      <div data-image-stage><img data-image-full alt="" decoding="async"></div>
      <p data-image-preview-error hidden>The preview could not load.</p>
      <div data-image-toolbar>
        <button type="button" data-image-prev>Previous image</button>
        <button type="button" data-image-next>Next image</button>
        <a data-image-original target="_blank" rel="noopener noreferrer">Open original</a>
      </div>
    </dialog>
  </template>
</div>
```

The helper adopts the root; it never replaces thumbnail/picture/link/caption nodes or their
listeners. Native srcset/sizes, source selection, loading/decoding, width/height, alt,
referrerpolicy and crossorigin attributes remain intact. `--mui-image-fit` accepts ordinary
CSS object-fit values (fill default). No image is hidden or given zero dimensions to implement
lazy loading; author dimensions reserve its box and the browser owns lazy thresholds.

Each nested `data-image-group` is an independent boundary. Only eligible owned
`a[data-image-preview][href]` entries participate, in current DOM order. Hidden/inert,
`data-preview-disabled`, download and explicit external-target/rel=external links are
excluded from enhancement/navigation, not stripped of native behavior.
Only unmodified primary/keyboard clicks not already defaultPrevented are intercepted.
Modifier/middle clicks, downloads, native targets and prior author cancellation are preserved.
No URL or clipboard/download action is performed merely by setup.

The direct template must contain a named native dialog, a fixed `img[data-image-full]`
placeholder and a non-disabled/non-hidden typed close button **outside** optional toolbar
content. Navigation controls, if provided, must be buttons of type button. Missing/unsupported
dialog support or invalid template structure returns false from `open`, leaving ordinary
link navigation available. Initially open/hidden dialogs and embedded script/style/iframe/
object/embed content are rejected. Template markup must be author-owned/trusted.

The clone is helper-owned and appended to the same root, then shown with native showModal.
HTML is cloned from the template, not constructed from image text/URLs. The helper controls
only its clone's state, current preview image, position text and navigation controls. Template
listeners are not cloned. The preview img may carry ordinary authored decoding/referrer/
crossorigin/presentation attributes, but **src/alt are controlled** and a template src/srcset
is rejected to prevent competing image selection. Thumbnail responsive attributes are not
copied into the full-image request or suppressed.

## Native controller API and events

`createImagePreview(root)` connects immediately and returns:

| API | Contract |
| --- | --- |
| `open(indexOrAnchor = previousSelectionOrZero, opener?)` | Opens an eligible member; returns false when no supported preview can be opened. Negative/fractional numeric indices throw RangeError. The optional opener is a native focus-return target. |
| `close()` | Closes this owned dialog, cancels its image request/listeners and restores safe focus. Idempotent. |
| `next()`, `prev()` | Circular navigation in current eligible DOM order; false if closed or fewer than two entries. |
| `current` | Read current eligible index; assignment validates an existing integer index, selects that anchor and updates an open preview. |
| `show` | Actual open state; boolean assignment requests open/close. A true assignment throws if preview is unavailable rather than claiming success. |
| `dialog` | Current owned native dialog or null; useful for explicit native cancel/close listeners. Do not replace helper-owned internals. |
| `connected`, `connect()`, `disconnect()` | Explicit lifecycle. Duplicate active ownership is rejected. Disconnect releases root/image/dialog observers/listeners/probes and removes the clone; native images/links and the last successful fallback src remain. |

Root events are `mui:image-open`, `mui:image-close`, `mui:image-change`, `mui:image-next`
and `mui:image-prev`, with `{ current, src }` detail. These are actual helper notifications,
not Vue callback-array aliases or controlled/uncontrolled state parity. Group/standalone
source callbacks map to these documented events; default-current/default-show configuration
and src-list-only rendering are omitted. Set current or call open deliberately in application
code rather than opening an unsolicited default modal.

Native Escape/cancel/close behavior remains. Author prevention of the native cancel event
is respected. Close starts focused; previous/next remain ordinary buttons, not menuitems.
No global arrow/wheel/drag handler disables page zoom or native image interactions.
Closing one viewer does not steal focus from another open dialog. Removed/hidden active
entries or openers close safely, returning to a remaining eligible link when possible.
If no connected destination remains, the helper does not invent a focus target.

The active dialog has a temporary document mutation observer solely for removal/hidden
lifecycle safety. Root removal while open automatically disconnects and releases the modal.
The application must still call disconnect for normal teardown, including closed groups;
there is no general framework mount service. Reconnect explicitly after reinsertion.
A queued native close followed immediately by reopen is handled without leaving an invisible
orphaned preview. Old load/error callbacks cannot affect a new request/session.

## Live content, loading and bounded fallback

Native src/srcset/sizes/source changes and gallery membership/href/alt/hidden changes are
observed without layout polling. Active entry identity follows its authored anchor across
reordering; removing/disabling it closes rather than silently choosing unrelated content.
Changing its href requests a new full image. Each request gets a fresh **owned preview
image**, cancellation/generation guards and load/error handlers; old preview nodes can be
discarded, but thumbnails are never cloned/replaced. Full-image errors show the authored
error message and keep the close action reachable.

Optional thumbnail state uses `data-image-frame` with direct placeholder/error regions.
The helper owns their hidden state and the frame's data-image-state. Loading/error callbacks
on original images remain native Events; no duplicate generated aria-label is added.
Placeholder/error content itself remains authored. Native no-JS images/alt/links are the
fallback, not a promise that JS-controlled error messaging also updates without script.

For a **plain single-src img**, opt into bounded fallback:

```html
<img class="mui-image" src="./primary.svg" data-image-fallback="./fallback.svg"
  width="200" height="125" alt="Authored alternative text">
```

One detached native image probe is attempted per source/fallback configuration. Only a
successful, still-current probe changes src on the original image. Repeated failures do
not loop; a successful new primary load or source update invalidates the old probe. Source/
fallback attribute changes can intentionally start a new attempt. Disconnect clears pending
probe listeners and source requests; browser network cancellation remains best-effort.
Only HTTP(S), blob and data:image resources are enhancement candidates. No fetch/proxy,
HTML evaluation or object-URL revocation of author resources is performed.

Automatic fallback is deliberately **not** applied to picture/srcset images, where replacing
src would not reliably replace responsive selection. Those sources remain unchanged and
surface native errors for independent application policy. Explicit native lazy loading
replaces intersection-observer option/root/margin/threshold modes, which are omitted.

## Toolbar, presentation and advanced exclusions

Previous/next/close and an ordinary Open original link are retained. Set
`data-show-toolbar="false"` on the group to hide optional toolbar content; close remains
outside it and Escape stays native. An initially hidden authored toolbar remains hidden.
Visible button labels supply names without a Tooltip dependency.

Drag/pinch/kept offsets, animated thumbnail transforms, zoom/rotation/original-size tools,
fullscreen, programmatic downloads, tooltip-provider and render-toolbar/VNode contracts
are not implemented. No fake no-op tool API is exported. Use Open original and ordinary
browser controls/gestures where appropriate; cross-origin navigation, save permissions
and data/blob restrictions remain browser-owned. Tests did not perform real downloads.

CSS owns fitting, viewport caps, scrollable dialog layout, backdrop and responsive
controls. JavaScript writes no geometry/style objects or CSS text, so there is no injected
CSS-in-JS source to authorize; normal trusted template/CSP resource policy still applies.
No animation, viewer/gesture/icon/modal package or runtime dependency is added. Print hides
the preview overlay and retains authored images; forced colors preserve readable controls.

### Audited default presentation and author overrides

The preview is now a **transparent viewport-sized native dialog**, not the former white,
rounded 56rem panel. The backdrop is black at .3 opacity. Images retain natural size
without upscaling, centered in the viewport with maximum dimensions `100vw - 32px` and
`100vh - 32px`. Percentage caps additionally keep native fitting usable under CSS zoom.
The optional stage is a positioning layer; fitting also works without that wrapper.
Authored close/header, position and error content stays above the image on
translucent chrome, rather than being removed or hidden to imitate the upstream markup.

The toolbar is centered 40px above the bottom, with 12px horizontal padding, 24px radius,
black .35 fill, and 48px minimum height. Its width follows the **retained authored text
controls**, not Naive's nine-icon toolbar. It wraps at narrow widths instead of clipping
labels. Close stays outside the optional toolbar; controls keep native focus and disabled
semantics. Thumbnails retain `object-fit: fill` by default and now inherit authored
rounding from their immediate parent.

Public CSS tokens:

- `--mui-image-fit`: thumbnail object-fit.
- `--mui-image-preview-color`: foreground for overlay chrome; white .9 by default and
  white .82 under an explicit dark theme.
- `--mui-image-preview-background`: dialog surface; transparent by default.
- `--mui-image-backdrop`: native modal backdrop; black .3 by default.
- `--mui-image-toolbar-background`: toolbar and authored chrome fill; black .35.
- `--mui-image-border-color`, `--mui-image-border-width`: optional authored dialog border;
  the new default is zero width. A formerly customized frame color needs a nonzero border
  width to remain visible.

Tokens inherit from the author root and are never assigned public defaults by Image CSS.
`data-mui-theme="dark"` changes only a private Image foreground default; a nested explicit
light boundary resets it. No aggregate stylesheet or shared palette is required. Typography
continues to inherit from the document; chrome opacity, geometry and Image theme roles stay
component-local. Authors can override presentation with ordinary CSS without changing the
controller or its existing trusted-template contract.

## Source reconciliation and acceptance

Authority is the [pinned public API](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md),
[Image](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/src/Image.tsx),
[ImageGroup](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/src/ImageGroup.tsx),
[ImagePreview](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/src/ImagePreview.tsx),
[shared props](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/src/interface.ts)
and [public types](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/src/public-types.ts)
at `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
The [reference tracker](../naive-ui/components/image.md) preserves all 77 original rows
plus 13 source declaration groups: **90 rows, 41 Verified adapted targets and 49 explicit
omissions**. P6 omissions are visible;
acceptance is not blanket source viewer/gesture/framework parity.

1. [x] Preserve native responsive image attributes, loading box, names, links and callbacks.
2. [x] Add owned authored-template native dialogs with group navigation and reliable close/focus.
3. [x] Bound fallback/request lifecycle and explicitly exclude advanced gesture/renderer/permission tools.
4. [x] Verify failures, live updates, stale/cancelled loads, nested ownership, viewport and no-JS paths.

`pnpm --dir D:\repos\MarkupUI check` passed build/budget gates and **583 tests**, including
**31 Image cases**. After the final live thumbnail-alt observer correction, build/budget
gates and all 31 focused cases passed again. Focused tests cover native modifiers/defaultPrevented,
template validation, current/show, nested/duplicate ownership, fallback bounds/staleness,
close/reopen races, removed triggers/root teardown/reconnect and native cancel/focus.
Chromium acceptance additionally checked:

- Native srcset/sizes/decoding/referrer/crossorigin/alt preservation, working local SVG
  fixtures, bounded fallback and a visible nonzero native lazy image box/loading completion.
- Named modal entry, group order/wrap, single-image disabled navigation, native Escape/
  cancelled cancel, original/programmatic opener focus and another modal retaining focus.
- Live toolbar/href changes, authored error content, stale preview/fallback protection,
  removed-root cleanup and explicit reconnect; original thumbnail nodes remained identical.
- 280px/320px viewports, RTL/200% CSS zoom, fitting, forced colors and print; native
  modifier/middle/download non-interception and a real no-JS link opening its full SVG.
- ESM/classic plus aggregate/plugin coexistence, without custom-element redefinition.

The demo server now serves `.svg` as `image/svg+xml`. Validation used an attached dedicated
server at **127.0.0.1:4188** so the existing 4187 server and other tabs were not disrupted;
an already-running old server needs restart to pick up this MIME addition.
ESM is **9,127 bytes / 3,430 gzip bytes**, classic **9,626 / 3,665**, and CSS **1,778 / 656**,
under independent **4,000 / 4,000 / 1,000** gzip ceilings. One helper mode plus CSS costs
**4,086 gzip bytes (ESM)** or **4,321 (classic)**. Demo JS is **691 / 316 gzip bytes** and
CSS **1,132 / 544**; the local original SVG fixtures are separate authored demo assets.
Core/widgets/advanced remain **14,611 / 2,779 / 2,181** gzip bytes under unchanged
**15,000 / 4,000 / 3,000** ceilings. Runtime dependencies remain zero.
This is retained-scope Chromium evidence, not all-browser, screen-reader speech,
mobile gesture, cross-origin download/fullscreen or framework parity certification.
