# Watermark: one native decorative tile

**🟢 Verified retained native Canvas/overlay scope.** Literal local text or a caller-owned
native image produces one bounded PNG. External CSS repeats it on one authored empty
overlay. Content is never re-rendered. No watermark dependency, global service/storage,
anti-tamper machinery, selection blocker, access control, DRM or screenshot prevention.

## Loading and anatomy

| Asset | Contract |
| --- | --- |
| `@dataengine/markup-ui/watermark` | createWatermark, settings/options/image-loader/state/result/controller types |
| `dist/markup-ui-watermark.js` | Optional ESM; no custom-element registration |
| `dist/markup-ui-watermark.global.js` | MarkupUIWatermark namespace; refuses to replace an existing namespace |
| `@dataengine/markup-ui/watermark/style.css` | Explicit external overlay placement/repetition/pointer/media CSS |
| [Local demo](../../demo/components/watermark.html) | Separate HTML/CSS/JS and original local SVG image; no vendor assets |
| [Complete reference](../naive-ui/components/watermark.md) | All 27 original rows plus four explicit source additions |

```html
<p>This example is classified LOCAL DRAFT.</p>
<section class="mui-watermark document-wrapper" data-watermark>
  <h2>Original document</h2>
  <label>Title <input name="title" value="Keep native state"></label>
  <div data-watermark-overlay hidden aria-hidden="true"></div>
</section>
```

```css
/* Application-owned wrapper: choosing this containing block is deliberate. */
.document-wrapper { position: relative; }
```

```js
import { createWatermark } from "@dataengine/markup-ui/watermark"
const watermark = createWatermark(document.querySelector("[data-watermark]"), {
  content: "LOCAL DRAFT",
  width: 200,
  height: 100,
  rotate: -20
})
const result = await watermark.ready
if (result.status === "error") reportLocalError(result.error)
// On teardown: watermark.disconnect()
```

Use a connected light-DOM native div/section/article root. It must contain exactly
one **direct**, empty native div[data-watermark-overlay], initially hidden and
aria-hidden=true, without role, tabindex, contenteditable or child nodes. No generated
element substitutes for author content. A local wrapper must **already** have relative,
absolute, fixed or sticky positioning. The helper never changes root position or
inserts a containing block around existing absolute descendants.

Names/headings/classification text and all underlying form/focus semantics remain
application-owned. The overlay is decorative and pointer-events:none; it cannot be
focused or contain controls. There is no live-region announcement of repeated pixels.
Put meaningful classifications/warnings in separately readable text, not only pixels.

No-JS or a missing helper leaves the overlay hidden and all original content/fields/
links intact. An unsupported Canvas/Blob implementation is a reported generation error,
not a fake ready state. Do not expose application-only controls before binding.

## Tile, font, image and presentation settings

| Setting | Default / retained meaning |
| --- | --- |
| content | Empty string; literal LF-separated text, no HTML/SVG interpolation |
| image / loadImage | null; either native HTMLImageElement or explicit caller callback |
| width / height | 160 / 80 CSS px, mark allocation, not root dimensions |
| xGap / yGap | 40 / 40 CSS px; tile pitch = mark dimension + gap |
| xOffset / yOffset | 0 / 0 physical CSS px; repeat phase, independent of RTL |
| rotate | 0; static degrees around each mark's center |
| cross | false; second periodic stamp offset by half **tile pitch** on both axes |
| debug | false; contrasting Canvas outlines of mark/tile bounds |
| opacity / imageOpacity | 1 / 1; whole overlay / image stamp alpha |
| imageWidth / imageHeight | null; fit down within mark, preserve aspect when one is supplied |
| fontSize / lineHeight | 14 / 20 CSS px; glyph size / baseline advance |
| fontFamily | sans-serif; one simple named/generic family, no arbitrary shorthand/list |
| fontStyle / fontVariant | normal / normal; normal/italic/oblique and normal/small-caps subsets |
| fontWeight / fontStretch | 400 / normal; 100-step weights / supported native stretch keywords |
| fontColor | rgba(128, 128, 128, .3); explicit native pixel color |
| textAlign | left; left/center/right within the measured multiline block |
| fullscreen / zIndex | false / 10; external absolute or explicitly fixed placement |
| pixelRatio | auto; devicePixelRatio clamped to the documented 0.5..4 quality range |

These are explicit JS options, not reactive attributes or framework prop passthrough.
Defaults for mark size/gaps/line height are deliberately more useful for readable text
than the source's 32px/zero-gap/14px defaults. Cross uses half pitch rather than source
half mark size. Offsets phase the background instead of clipping content within a tile.
`rotate` turns each centered mark, not the repeating lattice. Whole-layer globalRotate
is intentionally absent; native fixed/rotated wrappers do not guarantee full coverage.

Text blocks use native Canvas metrics and physical multiline alignment, then center
inside the mark. Rotated glyph/image bounds must fit the mark; overlarge content
reports an error instead of silently cropping or producing blank pixels. Increase
width/height, reduce text/font/image size or change the angle. Gaps extend repeat pitch,
not the permitted mark drawing area. Cross patterns can intentionally overlap stamps.

Font input is constrained to one family of 1..64 ASCII letters/digits/spaces/hyphens,
starting with a letter. Font style supports normal/italic/bare oblique, not numeric
oblique angles; variant supports normal/small-caps. Weight is 100..900 in 100 steps.
Stretch supports normal plus ultra/extra/semi condensed/expanded and condensed/expanded;
non-normal values report unsupported native Canvas implementations rather than lying.
The native font setter is checked. Font availability, fallback glyphs and synthesis
remain browser-owned: syntactically valid unavailable families may use native fallback.
Existing document.fonts.ready is awaited; no FontFace, font load request or font service
is created. Call refresh after fonts registered/loaded later; no automatic theme watcher.

Color grammar is deliberately small: #RGB/#RGBA/#RRGGBB/#RRGGBBAA, basic CSS named
colors (including transparent), and comma rgb(r,g,b)/rgba(r,g,b,a) with finite bounded
numeric channels. No percentages, hsl/wide-gamut/color functions, currentColor, variables,
contextual/system colors or arbitrary CSS strings. Native setter rejection surfaces.
Transparent colors and zero opacity are **intentional** invisible output, not inferred errors.
Pixel colors do not automatically follow dark mode, CSS variables or high-contrast themes.

### Resource bounds

- All numeric settings are finite. Mark dimensions are 1..1024px; gaps 0..1024px;
  offsets -100000..100000px; rotation -360..360; opacity values 0..1.
- Font size is 1..256px; line height 1..512px; zIndex is an integer within
  -2147483647..2147483647. Negative z-index remains native and may hide decoration.
- Content is at most 2048 UTF-16 code units and 16 LF-separated lines; tabs, CR and
  control characters reject. Normalize CRLF explicitly if importing external text.
  fontColor is at most 128 characters. Invalid keys/types reject before replacing
  valid settings or cancelling the existing request.
- Explicit pixelRatio is 0.5..4. Automatic ratio is capped for bounded memory, not a
  promise of unlimited physical display resolution. Bitmap dimensions use ceil(pitch
  × ratio), capped at 4096 per axis and **4,194,304 pixels** before Canvas allocation.
  Oversized nonempty generation errors rather than silently reducing a requested tile.
- Image intrinsic dimensions are <=8192 each and <=16,777,216 pixels. Requested image
  dimensions are 0.5..2048px and still must pass the mark's rotated fit check.
- Exactly one live displayed Blob URL and at most one active off-DOM Canvas are owned.
  Canvas storage is released after success/error/abort. Native PNG encoding is serialized:
  a newer generation waits for the one uncancellable old encoder to finish before
  allocating its canvas, preventing an unbounded platform pixel-buffer queue. Old
  public outcomes still abort promptly; a stalled native encoder can delay the next
  nonempty generation. Native decode may finish after cancellation; stale results never create tiles.
  PNG type/size is checked (nonempty image/png, <=16MiB). A cross pattern uses a bounded
  set of Canvas stamps, not one DOM element per visible repeat.

## Images, native origins and errors

`image` accepts a caller-owned native HTMLImageElement in the root's realm, not a URL
string. An already decoded image draws without another decode/request. Otherwise the
helper awaits its existing native decode(), never changes src/srcset/crossOrigin/
referrerPolicy, and verifies source stability before committing. It never clears a
caller image, revokes its URLs, closes caller resources or adopts it into the overlay.

Alternatively, `loadImage({signal, generation})` returns that native image or a promise.
The callback owns all request/loading/credential policy. It should check/observe the
AbortSignal and release **its** resources on cancellation. The helper never calls an
already superseded queued loader and protects against loaders that ignore cancellation.
Use image:null when switching to a loader and loadImage:null when switching back.
Image input takes precedence over content, matching the useful source behavior.

No helper URL loader means no implicit cookies, credentialed fetch or remote endpoint.
The caller still must select a safe permitted source: same-origin, safe local data/blob
or an image requested with suitable crossOrigin and server CORS headers. An image
displaying successfully in an img does **not** prove it is Canvas-readable. Native
decode, drawImage, tainted-Canvas SecurityError, unsupported Canvas and null/invalid
PNG encoding failures surface as result.status=error and state.error. They do not
become ready/empty. Cross-origin credentials and transport are never guessed or retried.

## Generation and lifecycle contract

`createWatermark` starts a generation; `ready` returns the latest generation's promise.
`update(settings)` merges explicit requested settings and returns its promise.
`refresh()` retries/redraws the current requested settings (for fonts, image changes or
manual DPR/placement refresh). Operational outcomes are frozen ready/empty/error/aborted
records, not uncaught asynchronous promise rejections. Invalid synchronous configuration
throws before starting a new generation. Applications must inspect result.status/state.

State exposes phase (loading/ready/empty/error/disconnected), generation, hasTile,
error and the last successfully rendered tile's CSS/pixel dimensions and ratio.
`settings` is a shallow frozen snapshot of **requested** settings, not necessarily the
displayed tile's settings during loading/error. Caller image identity is not frozen.

During loading/error the **previous complete valid tile, its placement and opacity
remain**. A first failed generation leaves decoration hidden. A successful generation
atomically writes the new safe URL/geometry, then revokes the previous owned URL.
Empty/whitespace text with no image/loader explicitly clears and revokes the tile.
An error never clears useful content or erases the previous successful decoration.

`mui:watermark-state` bubbles with a frozen state snapshot at loading/completion/error/
disconnect. No repeated text/image payload, automatic live region or focus move is added.
Promises settle before completion notification. A reentrant update/disconnect from
loading or abort callbacks cannot apply an older result. Abort resolves the old outcome
promptly even if a loader/native decode/PNG operation never cooperates.

`disconnect()` is idempotent: abort current generation, release Canvas storage, remove
resize/resolution listeners and the removal observer, restore only styles/attributes
still equal to owned writes and revoke only owned display URLs. Removed root/overlay
automatically disconnects. The observer never recreates removed decoration or monitors
tampering. Reconnect by explicitly creating a new helper with valid hidden anatomy.
Existing author root styles/ARIA/content/listeners/defaults/form values remain untouched.

## Native coverage, resize, CSP and media limits

The overlay is absolute inset:0 in an **already positioned** local wrapper; CSS owns
its placement, repeat, z-index and pointer behavior. Only validated generated image
and numeric custom properties are written by JS, individually; no style-rule injection,
style object passthrough, universal positioning calculation or full-style restoration.

A wrapper around an inner native scroller covers that visible scrollport and does not
move when the inner content scrolls. If the positioned wrapper **itself** scrolls, the
absolute overlay belongs to the initial box, scrolls with it and does not automatically
cover all scrollHeight. Choose an outer wrapper deliberately; the library does not
insert one or change containing blocks. Native stacking contexts, clipping, borders,
zoom and author overlays still apply. RTL does not reverse physical background offsets.

Fullscreen uses external position:fixed, not the Fullscreen API, a portal or top layer.
It requires a root directly under body and rejects transforms/filters/perspective/
containment/content-visibility/will-change that establish conflicting containing blocks
on root/body/html at configuration/generation time. No anti-tamper monitoring enforces
those assumptions later. It covers the layout viewport, excluding browser chrome/
scrollbars, not necessarily visual-viewport pinch effects or native dialog/popover layers.

Changing container size naturally repeats the same CSS tile—**no layout polling,
ResizeObserver, tile-grid DOM or ordinary resize redraw**. Automatic DPR observes
native window resize/resolution changes and regenerates only when the capped ratio
changes. Explicit pixelRatio stays fixed. CSS zoom scales CSS pixels and the raster;
it is not separately inferred from visual rectangles. Choose an explicit higher ratio/
refresh if independently zoomed content needs sharper pixels. No all-transform claim.

Load the external stylesheet. CSP must permit the explicit scripts/styles and **blob:
in img-src** for the generated CSS background. The helper validates/encodes the image,
not the application stylesheet/CSP paint outcome; browser policy can still prevent
display and reports its own violations. No base64 URL bypass or remote fallback is tried.

The stylesheet **hides decorative pixels for print and forced-colors**, keeping ordinary
classification text/content available. This avoids a false print background-graphics/
contrast guarantee. Override only with an application-tested policy; no guarantee of
printer output, ink contrast, screenshot prevention or persistence after user editing.
No user-select/touch-action/key/copy restrictions are installed.

## Acceptance — 2026-09-10

1. Decorative/native ownership: original content, selection, focus, fields/listeners,
   one empty aria-hidden overlay and deliberate wrapper positioning verified.
2. Tile inputs: actual text/image/font/rotation/gap/offset/opacity/cross/debug behavior,
   bounds, readable classification and explicit per-property omissions verified.
3. Generation: native decoding/PNG/CORS errors, previous-valid loading/error, generation
   races, resource revocation, ratio refresh and idempotent teardown verified.
4. Integration: all original/source-added rows reconciled; explicit ESM/classic/CSS,
   budgets, local Chromium/native/no-JS/CSP/legacy and coverage/media evidence recorded.

Targeted command: `pnpm test -- tests\watermark.test.ts tests\native.test.ts`.
**88 tests pass (61 Watermark + 27 native/legacy).** Build/declarations/budgets:
`pnpm build`. Final level-nine gzip bytes: **5,755 ESM / 5,889 classic / 319 CSS**;
combined **6,074 / 6,208** JS+CSS. Raw sizes, ceilings and exact inventory totals
are recorded in the [current catalog acceptance](../naive-ui/index.md#watermark-accepted).

Observed native Chromium pixels: initial 324×194 PNG with **2,409 nontransparent
pixels**, rotated text bounds x44..212/y27..121; zero-degree text bounds y47..93.
Cross/debug changed the same tile to **5,887 nontransparent pixels**, without overlay
children. DPR2 produced **648×388** pixels at unchanged 324×194 CSS pitch. A decoded
original local SVG produced nonempty pixels without changing caller src/crossOrigin.
Malformed image decoding and actual cross-origin Canvas SecurityError kept the old tile.
Rapid caller-loader replacement kept “LATEST TEXT WINS”; late results could not replace it.
Native 1px serif and italic/small-caps/condensed fonts were accepted. Holding a real PNG
callback showed only one encoder before its release; the latest generation then completed.
Disconnect aborted a pending loader, revoked one owned tile URL, restored the absent
inline style/hidden overlay and preserved every original child node.

Actual mouse-selected text remained selected across a generation; pointer-transparent
fields/buttons/validation/FormData and original child nodes remained intact. Narrowing
changed overlay width from 1052 to 444px without changing generation; CSS zoom 2 gave
444px layout/888px visual width, with unchanged tile pitch. Inner scrolling left the
overlay stationary; self-scrolling by 180px moved it -180px, visibly demonstrating the
documented initial-box limit. Fixed mode covered 1545×836 layout pixels (15px scrollbar
excluded from 1560px innerWidth) and did not block outside native fields.

Print/forced-colors computed display:none; strict self-hosted script/style CSP with
img-src self blob worked at DPR2 without page errors. JavaScript-disabled context kept
the original SVG and editable/resettable native fields, with enhancement controls and
overlay hidden. Classic-only generation succeeded; loading unchanged core/widgets
preserved the native Watermark and legacy Carousel behavior, without mui-watermark
registration. These are observed Chromium results, not all-browser/AT/font/CSP/print parity.
