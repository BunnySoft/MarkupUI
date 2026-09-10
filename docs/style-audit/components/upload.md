# Upload native-workflow style audit

**Status:** integrated. This is a rendered style pass,
not a new file renderer, binding, transport, provider or preview implementation.
Native FileList, validation, callbacks, focus, form/reset and attempt ownership remain
unchanged.

## Reference and evidence

- Pinned commit: `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
- Sources: [Upload styles](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/src/styles/index.cssr.ts),
  [light theme](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/styles/light.ts),
  [dark theme](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/styles/dark.ts),
  [file renderer](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/src/UploadFile.tsx),
  [progress](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/upload/src/UploadProgress.tsx).
- Actual renderer: installed `naive-ui@2.45.3` / `vue@3.5.30`, with light/dark
  NConfigProvider. Source trigger content is an authored default NButton, not an
  intrinsic Upload button style.
- Private session fixture: `files\style-reference\upload-audit`, port **4226**.
  Includes isolated build/server/entries, saved `before.css`, `before.json`,
  `after.json`, `boundaries.json`, and
  `{before,reference,after,legacy}-{light,dark}-ltr.png`.
  The forced-disabled follow-up adds `forced-disabled.mjs`, `forced-disabled.json`
  and `forced-disabled-{light,dark}.png`, using a separate headless Chromium process
  and private profile. The script consumes the isolated emitted assets.
- Fresh Chromium contexts, closed in `finally`; 1000x1000 main viewport, 375px
  narrow probe. The browser resolved some declared 1px borders to approximately
  .667px; measurements below report observed geometry rather than rounding it away.
- Only in-memory synthetic Files and manually settled local Promise transports were
  used. The source-only image card used a synthetic inline SVG data URL. No user
  files, external uploads, file-body reads or native OS picker interaction occurred.

## Corrected controllable defaults

| Surface | Before | Source / corrected native presentation |
| --- | --- | --- |
| Typography | Inherited without a local size default | 14px / 1.6; inherited family |
| Native action minimum height | 44px | 34px, matching default source trigger height |
| Button face | Browser outset border / gray face | Transparent, 1px themed border, 3px radius |
| Drop padding / border / radius | 16px / 2px dashed blue-gray / 0 | 24px / 1px dashed theme border / 3px |
| Drop geometry at 560px width | 58.396px high | Source and native both **71.729px** |
| Light drop / border | Transparent / `#aab9ca` | `#fafafc` / `#e0e0e6` |
| Dark drop / border | Transparent / same opaque border | White .06 / white .24 |
| File-list margin | 16px | 8px |
| Row border / horizontal padding | Outlined frame / 16px | Borderless / 6px left, 12px right |
| Row hover light / dark | None | `#f3f3f5` / white .09 |
| Error indication | Thick red inline-start border | Filename `#d03050` light / `#e88080` dark |
| Error hover light / dark | None | Error red at .06 / .09 |
| Determinate progress | Native 14px box, squeezed to ~52.927px in the fixture | Full **542x2px**, matching source rail geometry |
| Progress rail light / dark | Platform paint | `#ebebeb` / white .12 |
| Progress fill light / dark | Platform paint | Info `#2080f0` / `#70c0e8` with shared theme tokens |

The initial attempt to apply only a 2px height to native progress clipped its
platform-painted fill. The final CSS replaces **determinate paint only**, retains
the real progress element/max/value, and leaves unknown totals native. The WebKit
inner rail is transparent so the dark translucent background is painted only once.
Filled-end rasterization remains browser-specific.

Light/dark drop geometry, row hover/error palette and determinate rail measurements
matched the reference. Loading the existing legacy aggregate CSS afterward produced
the same measured native results. No aggregate source or generated assets were changed.

## Deliberate native layout, artwork and state differences

- A source text row measured **40.792px** high in this fixture; the native pending row
  is **102.792px** after correction (previously 107.729px). Native size/status text,
  full-width action group and all four buttons remain. Source's single compact line,
  attachment icon and 80px hover-action overlay are not a compatible replacement.
- Source Upload does not define the chooser slot's artwork/layout. The comparator
  uses an authored NButton; native Upload retains its labelled file input, filename
  summary and real `::file-selector-button`. OS dialog appearance, localized chooser
  labels, browser minimum widths and native interaction cannot be certified against
  that unrelated slot button.
- Start/cancel/retry/remove remain explicit labelled buttons, not generated source
  icons or hover-only controls. Arbitrary author icons are not replaced. Default
  button height is 34px, not the source file-action peer's compact icon hit area.
- Source image-card rendered **96x96px**, one image and two visible action icons on
  hover. Native Upload has no preview/download anchor, thumbnail, image-card layout
  or object-URL owner. No such features were added, and finished native filenames
  remain plain text rather than source URL-success-colored links.
- Pending, queued, uploading, cancelling, cancelled, finished and error retain
  their honest text labels. A 100% sent value remains uploading until fulfillment.
  Source Upload's smaller status vocabulary and transient completed/error progress
  are not copied: native progress is shown only for uploading/cancelling.
- Disabled native actions/input/drop use .5 opacity; readable filename/status text
  is not dimmed as a whole list. Native disabled drop hover stays neutral, whereas
  the source fixture still computes a primary hover border under its disabled
  trigger wrapper. The native drop text has no pointer/picker-button behavior.
- Source color/hover/progress and list transitions are not reproduced. Native
  determinate updates are immediate. Unknown totals retain the platform's native
  indeterminate appearance (14px here), including browser-owned motion. There is
  no new animation engine or universal reduced-motion control over native chrome.
- Responsive native grid/word wrapping is retained; physical 6px-left/12px-right
  row padding follows the pinned source rather than inventing mirrored artwork.

## Native behavior and boundary evidence

`boundaries.json` records actual browser observations:

- Starting via the focused native button kept that same node focused with
  `aria-disabled=true`, not a disabled-element focus loss. At 100% sent, the original
  row remained identical and status remained uploading; fulfillment then finished.
- Native FileList and FormData both contained `pending.txt`. Remove cleared actual
  input membership and moved focus to the visible file input.
- With three synthetic Files and concurrency two, cancelling an ignored-abort
  attempt left two active slots and one queued. Only actual settlement admitted
  the third; the cancelled record did not become a false finished record.
- Real reset-button default action emptied queue and native input. Error retry
  finished through the existing transport callback path.
- A synthetic flat drop populated the actual file input. Dragover retained a
  visible outline plus primary border, without turning the region into a button.
- Purple text/progress, orange border, 9px radius and 12px drop padding author
  overrides survived dark theme. Nested light scope reset to light text/drop colors.
- Narrow RTL long-name probe had 360px client/scroll widths (no horizontal
  document overflow), a 312px row and a single 294px content track.
- High contrast used system text/button colors and restored auto/native 14px
  progress. Print kept root/name/status black and hid only enhancement actions/drop.
  These are Chromium emulations, not physical high-contrast hardware or AT claims.
- The forced-disabled follow-up corrected the prior .5 opacity and normal ButtonText
  overrides: disabled and aria-disabled actions, inputs, picker pseudo-elements and
  drop regions now use **opacity 1 and GrayText text/borders**. Eleven disabled
  element/pseudo cases in each light/dark theme matched computed system GrayText,
  including native fieldset disabling and a real focus-retained aria-disabled Start
  action. Enabled Remove stayed distinguishable. Focus/outline remained on Start,
  and reactivation admitted no extra transport. Ordinary screen disabled opacity
  stayed .5. The script asserts these results rather than inferring them from CSS.
- Reduced-motion mode introduced no CSS/WAAPI animations. This does not certify
  suppression of browser-internal indeterminate motion.
- Disconnect removed all generated rows and all owners disconnected, but retained
  the latest native selection as contracted. **Zero object URLs** and **zero
  transport network requests** were observed; 34 workflow change notifications
  were recorded in the principal boundary run.
- A JavaScript-disabled static-anatomy context used a synthetic FileList assigned
  through the browser test harness: native FormData contained `fallback.txt`,
  chooser stayed visible, enhancement controls stayed hidden, and native reset
  emptied the input. This is not an OS file-dialog test.

## Validation and integration gate

- `pnpm test -- tests\upload.test.ts tests\upload.styles.test.ts`: **66 passed**
  (58 existing workflow tests and eight added CSS regressions).
- Isolated existing esbuild with the repository's ESM/classic entries, source maps,
  ES2022 target, minification and level-nine gzip:
  **7,727 / 7,855 / 1,219 bytes** ESM/classic/CSS. Existing esbuild whitespace
  formatting keeps the expanded forced-color safety rules inside the CSS ceiling;
  no declarations or safety behavior were removed for size.
- Unchanged ceilings: **9,000 / 9,000 / 1,250 bytes**. No runtime or dependency
  change; no shared theme/core/helper, generated asset or audit index edit.
- No common/shared change is required for these corrected defaults.
  Cross-browser native picker/indeterminate painting and omitted preview/card
  features remain explicit limits, not proposed shared implementation work.
- Full integrated build, final release manifest and publication remain with the
  parent. This pass made no full build, commit or push.

## Integration

The isolated release build and **66 Upload workflow/style tests** passed after the
forced-color correction. Actual emitted CSS is **4709 raw / 1223 gzip bytes**, below
the unchanged **1250-byte ceiling**. ESM/classic are **7727/7855 gzip bytes**, each
below 9000; the private CSS measurement differs slightly due to checkout line endings.

Parent browser assertions against the emitted release stylesheet confirmed opacity
**1** and system **GrayText** foreground/borders on the disabled file input, native
disabled action, aria-disabled action, disabled drop region and file-selector button.
Native picker, row-layout and indeterminate-paint limitations above remain explicit.
