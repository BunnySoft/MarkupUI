# Scrollbar native-alternative style audit

**Status:** integrated controllable color defaults;
Chromium comparison, 2026-09-10. This remains a native scroll container, **not** the
upstream custom DOM scrollbar renderer. No rail/thumb JS, provider, drag/sync engine,
vendor pseudo-element implementation or registration was added.

## Reference and evidence

- Pinned commit: `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
- Sources: [public wrapper](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/scrollbar/src/Scrollbar.tsx),
  [internal renderer](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_internal/scrollbar/src/Scrollbar.tsx),
  [custom chrome CSS](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_internal/scrollbar/src/styles/index.cssr.ts),
  [theme](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_internal/scrollbar/styles/light.ts),
  [rail constants](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_internal/scrollbar/styles/common.ts).
- Actual reference: installed `naive-ui@2.45.3` / `vue@3.5.30`, configured light/dark.
  The default case uses source hover-trigger behavior; other source inspection cases use
  `trigger="none"` to keep custom chrome visible for measurements.
- Target: literal native HTML plus current CSS, no browser script.
- Private session fixture `files\style-reference\scrollbar-audit`, port **4221**:
  case/source/build/server files, `before.json`, `after.json`, `boundaries.json`,
  `{reference,before,after,legacy}-{light,dark}-{ltr,rtl}.png` where captured.
  Original before captures are LTR; reference/corrected/legacy cover both directions.
- Isolated Chromium contexts closed in `finally`, 650×1750 viewport, DPR 1,
  280×160px frames and 600px-tall / 560px-wide controlled content.
- Nine variants cover unflagged default, colored, thin, stable gutter, horizontal/both
  axes, no overflow, zero padding and author colors: **36 corrected cases**, corresponding
  reference/legacy matrices, plus 18 original LTR cases (**126 captured conditions**).

## Controllable correction

Only the opted-in standards color defaults change:

| Area | Before | Pinned base palette / corrected request |
| --- | --- | --- |
| Light thumb | Opaque `#71717a` | **`rgba(0,0,0,.25)`** |
| Dark thumb | Same opaque gray | **`rgba(255,255,255,.2)`** |
| Track | Opaque `#e4e4e7` | **Transparent** |
| Unflagged color/width | Native auto | **Native auto, unchanged** |

`data-colored` still gates the supported `scrollbar-color` rule. A local light/dark scope
chooses the fallback thumb value, and authored `--mui-scrollbar-thumb-color` /
`--mui-scrollbar-track-color` retain precedence. No theme object, CSS-in-JS or shared theme
edit is needed. Standard color inheritance remains native, not forcibly reset on every child.

The measured corrected tuples were black .25 / transparent in light and white .2 /
transparent in dark, in both LTR and RTL. These match the source's base DOM thumb and
rail colors as **requested CSS values**, not a claim that OS chrome rasterizes identically.

## Observed geometry and hover boundaries

| Feature | Pinned custom renderer | Native alternative in this Chromium session |
| --- | --- | --- |
| Browser scrollbar CSS | Explicitly hidden (`scrollbar-width:none`) | Not hidden; auto/thin only |
| Vertical chrome width | 5px DOM rail/thumb | 15px ordinary gutter / 10px thin gutter |
| Thumb radius | 5px authored DOM radius | Browser/OS-owned |
| Content client width in 280px frame | 280px, overlaid chrome | 265px auto / 270px thin |
| Native RTL left gutter | 0 (native chrome hidden) | clientLeft 15px / 10px |
| Default custom vertical placement | Right, inset 4px | Platform placement; left in measured RTL |
| Base thumb height in tall case | 49.09375px custom DOM | Not exposed as an author DOM element |
| Hover thumb color | Black .4 / white .3 | Native state paint; no per-thumb standards selector added |
| Stable gutter without overflow | No native gutter reserved | Explicit stable flag can reserve space |
| Scroll padding | Source container 0 | Retained native focus padding 4px at 16px root |

The source default initially had no thumb child; hovering revealed its custom thumb.
Source direct-thumb hover measured black .4 and white .3. Hovering a native colored
region did not change its requested color tuple. This does **not** prove that native
hover paint is unchanged: the OS/browser controls that internal widget state.

The 15px/10px figures are gutter measurements from offset/client dimensions, not asserted
native thumb widths. Native arrows, hit areas, rail offsets, corner boxes, minimum thumb
length, fading/overlay visibility, zoom scaling and contrast adjustments are not emulated.
`thin` does not promise the source's 5px chrome; `stable` is not an always-visible trigger.

Default both-axis `overflow:auto` and the optional focus-padding convention remain native
adaptations. Vertical content measured 608px with native padding versus 600px in source;
the zero-padding case is available through the existing author token. Actual application
dimensions and overflow still come from native CSS, not a wrapper renderer.

## Real native behavior verified

Final corrected metrics were identical with later legacy CSS, including requested colors,
overflow dimensions, direction and gutters. `boundaries.json` additionally records:

- Both-axis native `scrollTo({left:120,top:80})`, followed by `{top:140}`, retained left
  120. In RTL the same logical exercise retained -120. Subsequent native deltas produced
  left ±140 / top 110; no zero-fill or sign-normalizing adapter exists.
- ArrowDown moved the focused native region to 40px in this session; wheel input then
  moved it to 160px. Observed scroll events targeted the actual scrolling element.
- Focusing the far link revealed it at left ±298 / top 458 in LTR/RTL.
  These are fixture observations, not universal keyboard/wheel step promises.
- No generated custom rails or `role=scrollbar` nodes appeared.
- Author colors `(100,80,150)` / `(230,220,210)` worked. Nested light scope restored the
  opted-in black .25 / transparent tuple; no custom-element definition appeared.
- Forced colors restored `scrollbar-color:auto` and `scrollbar-width:auto`, while the
  independent stable-gutter request remained. Print set overflow visible, expanded the
  fixture to 608px and cleared the gutter.
- With JavaScript disabled, the dark color request and ArrowDown scrolling still worked.
  Native required validation, reset to “Original”, disabled controls and GET submission
  to `/markup?note=NoJS` passed; the target document contained zero scripts.

## Explicit OS/browser limits

This audit exercises one Windows/Chromium configuration. Native results may change with
OS scrollbar size/visibility preferences, overlay settings, accessibility/high-contrast
choices, browser engine/version, color scheme, zoom and input hardware. A computed
`scrollbar-color` tuple alone is not evidence of exact painted pixels or hover contrast.
Firefox/Safari/macOS/touch behavior is not certified here.

No custom trigger, pixel-width rail placement, thumb-drag model, resize synchronization,
cached scroll state, hidden native bars or advanced source scrolling overloads is added
to work around those limits. The source custom renderer and this native alternative are
intentionally different implementations.

## Validation and integration gate

- `pnpm test -- tests\scrollbar.test.ts`: **15 tests passed**.
  New checks cover opt-in light/dark defaults, transparent track/author precedence and
  the absence of fake hover/pixel-sized/custom scrollbar behavior.
- One maintained CSS file, **0 JavaScript bytes**, no dependencies.
- CSS **520 / 750 gzip bytes**, measured with the build script's level 9 accounting.
- No shared/theme/index/generated edits, full build, commit or push. Parent's isolated
  integration pipeline owns the final distribution/manifest gate.

The coordinator subsequently ran the isolated release `pnpm build` and all **15
Scrollbar tests** successfully. CSS remains **520/750 gzip bytes**. This accepts
the opt-in native palette correction, not custom-renderer or OS-pixel parity.
