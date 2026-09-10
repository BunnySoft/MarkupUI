# Marquee: one original track, optional native motion

**🟢 Verified retained horizontal overflow-traversal scope.** Native Web Animations
move one original authored track; external CSS provides the stopped, scrolling and
media presentations. No obsolete marquee element, duplicated/mirrored content,
VNode renderer, animation dependency or seamless-ticker claim.

## Loading and native anatomy

| Asset | Contract |
| --- | --- |
| `@dataengine/markup-ui/marquee` | createMarquee and MarqueeSettings/Options/State/Controller types |
| `dist/markup-ui-marquee.js` | Optional ESM; no Custom Element registration |
| `dist/markup-ui-marquee.global.js` | MarkupUIMarquee namespace; refuses replacement |
| `@dataengine/markup-ui/marquee/style.css` | Explicit layout/scroll/focus/typography/media CSS |
| [Separate local demo](../../demo/components/marquee.html) | Local HTML/CSS/JS and original local SVG; no external requests |
| [Complete pinned mapping](../naive-ui/components/marquee.md) | Three original identities plus eight explicitly sourced additions |

```html
<section class="mui-marquee" data-marquee aria-labelledby="announcement">
  <h2 id="announcement">Announcement</h2>
  <div data-marquee-viewport tabindex="0" aria-label="Scrollable announcement">
    <div data-marquee-content><strong>Original text.</strong> Author the full readable content here.</div>
  </div>
  <div data-marquee-controls hidden>
    <button type="button" data-marquee-toggle>
      <span data-marquee-label>Play motion</span>
    </button>
  </div>
  <p data-marquee-status>Static content; use native scrolling to read all text.</p>
</section>
```

```js
import { createMarquee } from "@dataengine/markup-ui/marquee"
const marquee = createMarquee(document.querySelector("[data-marquee]"))
// Starts static. The real button can request motion.
marquee.set({ speed: 48, direction: "left", iterations: 2 })
// marquee.play(), marquee.pause(), marquee.refresh(), marquee.disconnect()
```

Use a connected, unowned native div/section with the class, data marker and accessible
name. The named tabindex=0 viewport is a direct native div/section child; its original
content is a direct native div/p. Author exactly one separate hidden controls region,
type=button toggle, label span containing one Text node, and plain nonlive p/div/span
status. There is no generated renderer, implicit title/heading replacement, button
keyboard shim, hidden form field or auto-submit.

Controls become visible only when native animate is available. Without JS they remain
hidden and the original content scrolls normally. Missing animation support stays
static with hidden controls; missing matchMedia conservatively prevents motion.
No animation/media polyfill is installed. Keep the control visibly usable: disabling
the button/fieldset, removing its tab stop or hiding/inerting it prevents motion.
Those author changes are not undone to force playback.

## Bounded original-content contract

Moving content is **noninteractive native phrasing/text/images only**. The root
heading, separate controls, form fields and status are outside the moving track.
At most **16,384 UTF-16 text units and 200 descendant elements** are accepted.
Supported descendants: span, strong, em, b, i, u, s, small, sub, sup, mark, abbr,
code, kbd, samp, var, time, data, img, br, wbr, ruby, rt and rp.

No descendant tabindex, contenteditable, autofocus, customized built-in `is`, role,
nested marquee owner, button, link, field, custom element or embedded document.
Images need explicit alt text; empty alt is allowed for decoration. The track
itself cannot be focusable, editable or role-based. Do not add delegated interactive
behavior to otherwise allowed text nodes; static original listeners are preserved.

Validation is not sanitization or a general HTML renderer. Author trusted semantic
nodes, not injected HTML strings. Initial unsupported content rejects before revealing
enhancement. Later unsupported content stops motion into a static error view; the
library does not remove the new button/field or change its form value. Remove the
unsupported content and refresh to resume a still-requested run.

The original nodes, Text nodes, listeners, DOM reading order, image labels and native
selection remain. No clones, parked content, hidden accessible mirror or repeated
template rendering is used. Static scrolling exposes the complete original track;
essential information must never depend on waiting for motion.

## Settings, passes and stopping

| Setting | Default / contract |
| --- | --- |
| active | false; persistent user/application intent, not current animation phase |
| speed | 48; finite 1..1000 layout CSS pixels/second |
| direction | left; physical left/right direction of the first pass, independent of text direction |
| iterations | 1; integer 1..100 passes or explicit `"infinite"` |
| delay | 0; finite 0..60000ms initial delay, not a delay between passes |
| playLabel / pauseLabel | “Play motion” / “Pause motion and use static view”; nonempty strings up to 120 units |

`set` merges validated settings and restarts any eligible requested motion. Unknown
keys, invalid types/nonfinite values and bounds reject before cancelling a valid run.
`play` requests a fresh run; `pause` clears active intent. There is no separate
timeline-resume, seek, progress, retarget interpolation, easing callback or reset API.
`refresh` validates the original content/environment and restarts if eligible.

One pass traverses **only contentWidth − viewportWidth**. Subsequent passes alternate
back and forth, using linear native keyframes. A finite sequence stops in static view
and clears active intent. An infinite sequence still requires the same pause control.
This differs deliberately from source normal-direction infinite duplicated groups.
No auto-fill, entrance/exit across a blank viewport, seamless wrap or vertical mode.

**Every pause cancels the transform**, removes the running clip marker and restores
native horizontal scrolling. It does not freeze a translated track out of reach.
Resuming after a temporary reason, resize, content change or explicit refresh restarts
from the configured edge with the full initial delay and pass count. Previously
completed passes are not retained. Starting motion resets native scrollLeft to zero;
stopping does not restore an earlier manual scroll position.

Temporary pause reasons include viewport hover/focus, selection intersecting the track,
hidden document, reduced motion, forced colors, print, announcing live-region ancestry,
hidden/inert/CSS-hidden ancestors, closed details/dialog, unavailable pause control
and unusable geometry. Clearing a reason **never overrides an explicit user pause**.
The separate toggle remains focusable during motion: hovering/focusing that control
does not itself stop playback or prevent Play from working.

Focus stays where the user placed it. Native viewport keys/touch/wheel own scrolling;
no editing keys or page-scroll gesture is intercepted. No live-region role is added.
The status is nonlive and changes only with state, not per animation tick. If a
completion announcement is useful, the application owns a separate optional live
message, as in the demo. No sound, network, navigation or focus occurs on finish.

## Layout pixels, RTL, media and capability limits

Geometry reads clientWidth, offsetWidth and offsetLeft, **not transformed visual
rectangles**. The external CSS requires a positioned-relative, borderless/paddingless
viewport and a static max-content track with no horizontal margins/padding/borders
or competing transform/CSS animation. The track's offsetParent must be the viewport.
Horizontal writing mode only. Avoid transformed/out-of-flow descendants and unusual
containing blocks; this is not universal visual anchoring or a transform-composition
engine. Author transforms on the track/viewport reject rather than being overwritten.

The track now has a **100% minimum inline size**, matching the reference's full-width
short-content box. Longer content still uses max-content width. Measured contentWidth
includes that minimum; fitting content remains static rather than gaining a loop.
Whitespace uses the normal inherited text flow inside the max-content box: ordinary
long text still overflows horizontally, while authored `br` elements retain line breaks.
No default gap, padding, border, background or edge fade is added.

Images now retain native baseline alignment, as the pinned reference does. Authors can
still set `vertical-align: middle` or another alignment explicitly. Inherited font,
line-height and colors remain application-owned; no fixed Marquee palette is imposed.
The existing public `--mui-marquee-focus` token remains the focus-outline authority and
is never assigned by the component. Use ordinary CSS for other presentation, without
changing the geometry constraints above.

Each metric/translation is bounded to **100,000 layout CSS pixels**. Duration is
overflow/speed×1000, at most 100,000,000ms per pass. Native integer layout metrics
introduce subpixel rounding; no subpixel-perfect speed promise. Overflow ≤1px is
`fits`; travel shorter than 100ms is `short-travel`, intentionally static rather than
rapid oscillation. Zero width/height and hidden containers never guess dimensions.
State geometry describes the last measurement, not a constantly updated static layout.

In RTL, the original DOM/bidi direction stays native; offsetLeft accounts for the
track's initial right alignment. Physical left/right options select translation
endpoints without reversing content order or treating RTL scrollLeft as LTR.
CSS zoom retains layout-pixel speed, so visual speed scales with zoom. Browser zoom
and viewport changes rely on actual native layout and observation.

ResizeObserver watches the viewport/track when available. Same geometry/height-only
deliveries do not restart an animation. Window resize, image load, font loading,
relevant DOM/ancestor mutations and explicit refresh cover other changes. Without
ResizeObserver, call refresh after size-only container changes. Stylesheet rule
changes that produce no observed resize/mutation also need explicit refresh.
No per-frame layout polling, forced-reflow iteration reset or custom scheduler exists.

Reduced motion, forced colors and print cancel motion and **wrap full content** using
external CSS; print hides controls. Large authored images must themselves have
appropriate responsive dimensions. This is not an all-content print-fitting system.
Print also supplies a local light Canvas/CanvasText surface, so default text remains
readable under a dark theme. Explicit authored colors/backgrounds still win through
the normal cascade; authors remain responsible for their contrast and print overrides.
Forced colors retain browser color substitution, without opting out of it.
Hidden-document motion is cancelled, not elapsed in the background; reveal restarts
only if still requested, without a catch-up burst or detached animation loop.

## Ownership, events and errors

The controller exposes element/viewport/content, connected and frozen state:
active, phase, pauseReasons, supported, generation, measured widths/distance/duration,
direction, iterations and error. Phases are static/running/finished/error/disconnected.

- `mui:marquee-change`: deduplicated state notifications after reconciliation.
- `mui:marquee-finish`: one state notification for the current finite native run.
- `mui:marquee-error`: error/reason after a runtime content/layout/native failure;
  the original content remains static. Explicit API calls also throw that failure.

Old finish/cancel callbacks compare animation identity and generation. Native external
animation cancellation becomes a persistent inactive stop. Reentrant finish listeners
may request a new run; stale completion cannot finish or cancel it. Reentry during
measurement is rejected, except disconnect, which cancels a just-created native
animation too. Event-listener exceptions follow native event error reporting, not a
hidden success callback pipeline.

Removal/replacement of owned anatomy automatically disconnects. Disconnect cancels
animation, clears callbacks, observers and listeners, and restores only still-owned
running/control/label attributes and label/status text. It never replaces the content
or writes input values/styles. Author changes to owned label/status targets during
binding may be overwritten on reconciliation; use separate nodes for application
text. Explicit rebinding is required after reconnection.

## Acceptance and payload

The following is historical migration acceptance. The
[rendered default-style audit](../style-audit/components/marquee.md) supersedes its CSS
payload and image/short-track presentation figures. That follow-up changes CSS only:
full-width short tracks, native image baseline, normal whitespace and readable dark
print. Opt-in motion, native controls, single-track traversal and all pause/lifecycle
policies are unchanged.

`pnpm test -- tests\marquee.test.ts tests\native.test.ts`: **69 tests passed**
(42 Marquee, 27 native/legacy). `pnpm build` passed declarations and every independent
budget. Tests cover bounds, sticky pause reasons, media/visibility, layout/RTL, restart/
stale callbacks, original nodes/selection/forms, reentrant finish/native factory,
disabled fieldset/control/closed-disclosure fallback, falsy thrown errors and disconnect/rebind.

Observed in a dedicated Chromium demo tab:

- One 1854px original track in a 672px viewport yielded 1182px overflow and 24625ms
  per pass at 48px/s; computed translation changed from −8.58 to −21.38px.
- Real mouse/Enter/Space controls changed state once without submitting or losing
  focus. Hover/focus/selection cancelled transform; selected original strong text
  remained identical. Native ArrowRight scrolled the stopped viewport 40px.
- Narrowing to 352px and appending original text recalculated overflow; unsupported
  button insertion stayed reachable in static error fallback. At 1000px/s, a 2236ms
  finite pass finished exactly once, with the native form value unchanged.
- Review found that disabling the pause control could leave motion running. Fixed
  and regression-tested: disabled/hidden/fieldset controls now produce static view,
  preserve author disabling and resume only still-requested intent when available.
- Real RTL offset −1182 used translations 1182→0 for left and 0→1182 for right.
  At CSS zoom 200%, content stayed 1854 layout pixels/approximately 3708 visual
  pixels; the remeasured viewport was 526 layout pixels, not a visual-rectangle guess.
- Closed details stayed static and started on reveal; fitting text did not animate.
  Native reduced/forced/print emulation wrapped the content with transform=none.
  At 360px viewport the page stayed within width and used a 303px native scrollport.
- Native AX snapshot retained named region, original level-two heading, strong/text,
  labelled image, emphasis and one named control; no duplicate track/live tick nodes.
- JavaScript-disabled narrow view retained the full 1854px text and hidden controls.
  Strict self-hosted script/style/image CSP allowed real motion with zero injected
  style elements/errors. Missing animate kept static content and hidden controls.
  Classic owner rebinding coexisted with native ESM and legacy registered Carousel.

Document-hidden scheduling is covered deterministically; headless tab switching is
not claimed as visibility evidence. No all-browser, screen-reader speech, essential
automatic-content, seamless-loop or source theme/renderer parity is claimed.

| Asset | Raw bytes | gzip level 9 | gzip ceiling |
| --- | ---: | ---: | ---: |
| Optional ESM | 12,234 | 4,920 | 6,000 |
| Optional classic | 12,517 | 5,062 | 6,000 |
| External CSS | 1,497 | 552 | 1,000 |

Combined ESM+CSS **5,472**, classic+CSS **5,614** gzip bytes. Separate demo HTML/CSS/
JS/SVG add **1,883 / 541 / 1,176 / 209**, making the full local ESM example **9,281**.
Core/advanced/widgets remain **14,611 / 2,181 / 2,779** under unchanged
**15,000 / 3,000 / 4,000** ceilings. Previous optional sources/budgets are unchanged;
runtime dependencies remain `{}`. Only concrete owned-attribute restoration is reused,
not an application clock or unrelated date/number formatter.

This closes the ninth main P6 **retained scope**, not advanced parity. Equation,
QR Code, Legacy Grid and Legacy Transfer alternative-guidance acceptance and broad
P0-01–P0-09 foundations remain separate. Recommend Equation's native authored MathML
alternative next; it is not implemented in this scope.
