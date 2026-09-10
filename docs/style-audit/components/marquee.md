# Marquee default-style audit

**Source ready: supported native presentation corrected; no seamless-loop claim.**
CSS-only changes fill short tracks, restore native image baseline alignment, use normal
whitespace and make default dark-theme print readable. The existing single-track
controller, default inactive intent, accessibility pauses and lifecycle are unchanged.
No runtime change, new public API, renderer, dependency or shared-style change is needed.

## Pinned reference and fixture

Reference: official Naive UI source revision
`42a52e6436b38bed456fee19eb0b89cdcd00fcc2`, published **naive-ui 2.45.3 / Vue 3.5.30**.
Reviewed the [props](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/marquee/src/props.ts),
[renderer/scheduling](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/marquee/src/Marquee.tsx)
and [component CSS](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/marquee/src/styles/index.cssr.ts).
The light/dark Marquee theme has no component-specific paint tokens.

The existing private `style-reference` runtime/lock is reused, with no installation or
MarkupUI dependency change. Lock SHA-256:
`a9e02efaf82d0335b797406ed11030c00b58b74f1123b84f49e3c97e5d82ee9c`.

Private fixture:
`C:\Users\chengzhu\.copilot\session-state\99fde562-4396-4c35-9601-b00d03e1c14e\files\marquee-style`.
`node build.mjs`, `node server.mjs`, `node verify.mjs` compile, serve and measure the
fixture using existing esbuild and a private Chrome/CDP context. Its server listens on
**127.0.0.1:54014** while running, with an explicit asset allowlist.
`reference.html` and `native.html` isolate their CSS. `before.css`,
`baseline-evidence.json`, `evidence.json`, `budgets.json` and separate light/dark PNGs
retain evidence. Private browser profiles are cleaned up after each run; shared
browser/server sessions are not touched.

Chrome **152.0.7977.83**, Windows, 1000x900 viewport, DPR 1; both sides use identical
320px content widths, installed font environment, labels and original content.
Cases cover short/long text, repeated spaces and a text newline, explicit `br`, an
original 32px test image, a deliberately authored 640px timing span, and font/color/
image-alignment overrides. The plain geometric image is fixture-authored, not vendor art.

Reference light uses `NConfigProvider theme=null` and `NGlobalStyle`; dark uses
`darkTheme`. Normal component props are unchanged. CSS animations are paused and sought
to time zero only for start-position geometry snapshots; their actual default running
state, timing and advancing movement are recorded separately. Native defaults remain
inactive, followed by explicit playback and supported pause-state probes.

Native Global Style plus the optional general palette is recorded separately from
Global Style alone. This avoids attributing surrounding palette differences to Marquee.
Print, forced colors, reduced motion, pointer, keyboard, selection, resize and CSS zoom
are actual private-browser probes, not JSDOM geometry or source-token estimates.

## Findings and measurements

| Surface | Pinned default | Native before | Result / disposition |
| --- | --- | --- | --- |
| Short-content box | Original item fills the 320px viewport | `Ready.` track only 40.46875px wide | **Fixed** with `min-inline-size:100%`: now 320px. Long original track remains 1370.0625px, matching source |
| Content whitespace | `normal` inside an intrinsic-width group/item | Forced `nowrap` | **Fixed** to normal; max-content still makes ordinary long text overflow. Source/native short, long, spaces, explicit-break and authored cases have equal track width/height |
| Image baseline | Native baseline; text plus 32px image creates a 38.390625px line box | Forced middle alignment; 32px box | **Fixed** by removing the image reset: native now baseline / 38.390625px. Explicit author `vertical-align:top` still matches |
| Font/line/weight | Inherited sans stack, 14px, 22.4px line-height, weight 400 | Same | **Matched**, no fixed Marquee font reset introduced |
| Content spacing/panel | Zero padding, margin and border; transparent background; no component gap | Same | **Matched**, no added spacer or repeated-content gap |
| Edge fade | None: mask-image none, no before/after content or gradient | None | **Matched**, no fade invented |
| Public focus token | No Marquee paint token | `--mui-marquee-focus` controls the existing native focus outline | **Retained local contract**: consumed with fallback and never assigned by component CSS |
| Active viewport | 320x22.390625px, overflow hidden | Native active viewport has the same dimensions | **Matched** during explicitly requested supported motion |
| Initial/stopped viewport | Source automatically clips/moves mirrored tracks | Native inactive; long content has a 15px OS scrollbar, giving 37.390625px viewport height | **Retained native difference**: readable native scrolling, not a permanently clipped source default |
| Track count/scroll extent | Two items even with auto-fill false; long sample scrollWidth 2740px | One original item, scrollWidth 1370px | **Retained native difference**: no duplicate content or mirror/auto-fill renderer |
| Dark print defaults | Source keeps its clipped animation presentation in media emulation | Native already stopped/wrapped, but inherited white text and dark scheme on a transparent root | **Fixed locally**: light scheme, black CanvasText on white Canvas. Full long text wraps to 320px x111.953125px and controls are hidden |
| Forced colors | Source still animates/clips in emulation | Native cancels and wraps | **Retained accessibility policy**: native has zero animations and system black text in the active palette, including the authored-color case |
| Reduced motion | Source still animates/clips in emulation | Native cancels and wraps | **Retained accessibility policy**, with active intent preserved and no clipped text animation |
| Surrounding palette | Global Style light #333639, dark rgba(255,255,255,.82) | Optional native themes supply #18181b / #fafafa | **Contextual difference**, unchanged. Global-Style-only native probes match source inherited colors in both themes |

All corrections are in `src/components/marquee/marquee.css`. No JavaScript dimensions,
timing or DOM ownership logic changed. The minimum width changes measured contentWidth
for fitting tracks; they still report `fits` when playback is requested, never gaining
automatic motion merely to reproduce the source loop.

## Motion comparison and native limits

For the authored 640px original span in a 320px viewport, speed defaults to **48px/s**
on both sides. Actual computed transforms at controlled animation times:

| Time | Reference | Native |
| --- | --- | --- |
| 0ms | translateX(0px) | translateX(0px) |
| 250ms | translateX(-12px) | translateX(-12px) |
| 500ms | translateX(-24px) | translateX(-24px) |
| 1000ms | translateX(-48px) | translateX(-48px) |

This matches velocity over the shared visible portion, **not loop duration or endpoints**.
Source traverses 640px per normal-direction infinite iteration in 13333.333ms, with a
mirror following it. Native traverses only the 320px overflow in 6666.667ms, alternating
when extra passes are requested. At one millisecond before the respective endpoints,
source/native translations are -639.952px / -319.952px. A finite native finish cancels
the transform into static scrolling rather than leaving the last frame clipped.

Unpaused wall-clock samples also advanced: at approximately 250/500ms, source measured
-12.0039/-24.0034px and native -12.0016/-24.7968px. These capture frame/scheduling
variation; the sought timestamps above are the exact comparable timing samples.

Supported native variants remained intact:

- Right-first with 250ms initial delay and two passes holds -320px through the delay,
  reaches -272px at 1250ms, 0px at 6916.667ms, then -48px at 7916.667ms on the return.
  Explicit infinite playback remains native alternate, not source seamless repetition.
- RTL layout offset -320px uses left-pass translations 320px to 0px without reversing
  original text. At 240px viewport width, distance becomes 400px and duration 8333.333ms.
  CSS zoom 2 keeps those layout metrics while the 640px track renders 1280px wide.
- A separate unpaused 1000px/s, 400px pass naturally completes after its 400ms duration:
  exactly one finish event, inactive finished state, transform none and native scrolling.

Source duration uses observed fractional content width, duplicated group length and
CSS animations. Its iteration handler briefly pauses, waits for nextTick, reads layout
and resumes. Native uses integer layout offsets/widths and event-driven Web Animations;
it does not adopt that forced-layout iteration scheduler. Fractional rounding, default
inactive intent, finite completion, fitting/short-travel stops, overflow-only endpoints,
alternation, restart-on-resume and lack of mirrors remain explicit native limits.

## Interaction, author styles and media

Real pointer movement over the native viewport produces `hover`, cancels the transform
and restores overflow auto; leaving resumes only still-requested motion. Source remains
running under the same pointer probe. Real Space key activation on the separate native
button pauses/plays once while preserving focus. Focusing the viewport pauses; native
ArrowRight then scrolls **40px** without moving focus.

Explicit user pause stays inactive after hover clears. Selection retains the original
`A 640px original track for timing.` Text node while motion stops. Original nodes remain
identical through media, settings, RTL, resize and disposal. Native form controls submit
only their own value; motion's type=button produces zero submits and does not change
native reset behavior.

Authored 18px font / 27px line-height, rgb(120,40,80) text, rgb(250,240,220) background
and top-aligned image remain effective. The normal cascade also preserves those readable
explicit author colors/backgrounds in print; the new light print surface is a **default**,
not a blanket override of arbitrary application colors. Authors must supply appropriate
contrast for their own overrides. A competing authored track transform still rejects
motion and remains untouched, rather than being overwritten.

Reduced/forced/print states keep active intent but have zero native animations, visible
unclipped overflow and wrapped normal text. Explicit fixed-width children/images can
still exceed that width: the fixture's authored 640px span is not resized or rewritten
by the helper. Authors own responsive content sizing. No universal print pagination,
arbitrary-content fitting or source media parity is claimed.

Disconnect leaves original content intact, cancels the native animation to idle,
restores hidden controls and removes owned motion state. No-JS/helper-free presentation
retains one full-width short track, original scrollable long content and hidden controls.
Hidden-document scheduling remains covered by deterministic controller tests, not a
claim based on headless tab switching.

## Focused evidence and integration boundary

`pnpm exec vitest run tests\marquee.test.ts`: **47 passing tests**, including five new
style regressions. Private source compilation and browser assertions cover the actual
geometry, motion, natural completion, pointer/keyboard/media and author cases above.

| Private asset | Bytes | gzip level 9 | Unchanged ceiling |
| --- | ---: | ---: | ---: |
| Original CSS | 1,497 | 552 | 1,000 |
| Corrected CSS | 1,538 | **573** | **1,000** |
| ESM helper | 12,188 | 4,889 | 6,000 |
| Classic helper | 12,464 | 5,028 | 6,000 |

CSS is copied without normalization. Private JS figures exclude distribution sourcemap
trailers; runtime source is unchanged. Parent owns release build/distribution accounting.
No full build, shared/index/generated edit, commit or push was performed in this pass.
