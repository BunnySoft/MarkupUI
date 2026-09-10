# Loading Bar default-style audit

**Integrated.** CSS paint correction only. The retained controller's native
measurement, terminal outcome, hold, observer and cleanup policies are unchanged. No provider,
request tracker, binding/template layer or simulated-progress engine was added.

## Reference and isolated fixture

- Official page: <https://www.naiveui.com/en-US/os-theme/components/loading-bar>.
- Pinned source/runtime: **Naive UI 2.45.3**, commit
  `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`, with existing **Vue 3.5.30**.
- Read `LoadingBar.tsx`, `LoadingBarProvider.tsx`, light/dark themes, loading-bar CSS and
  fade-in transition definitions. Important source facts: **2px** rail; primary loading/
  finishing color; light error `#d03050`, but **dark error is literal red**, not the generic
  dark error palette; fixed top/left/right zero and z-index **5999**.
- Private fixture:
  `C:\Users\chengzhu\.copilot\session-state\99fde562-4396-4c35-9601-b00d03e1c14e\files\loading-bar-style`.
  `node build.mjs` compiles only private reference/helper assets and copies current CSS.
  `node server.mjs` serves an explicit loopback allowlist.
  Attached session **`loading-bar-style-preview`**, **http://127.0.0.1:53919**.
- Routes: `/reference.html`, `/native.html`, `/native.html?before`; add `?dark`, `?rtl`, or
  native `?hold` for explicitly disabled terminal auto-hide during measurement.
  `window.api.start()`, `.finish()`, `.error()` expose the actual source provider/native
  controller. Only the native fixture also exposes its real `.setProgress()`.
- The reference uses `NConfigProvider theme=null`, `NGlobalStyle` and the real provider.
  Native uses an explicitly authored fixed root, named native progress and visible status.
  Separate private contexts/pages: Chromium **151.0.7922.174**, Windows,
  **800×600 CSS viewport**, requested DPR 1. Border values can be device-pixel quantized;
  both sides were sampled under the same environment.

## Exact differences and results

Changed file: `src/components/loading-bar/loading-bar.css`.

| Case | Pinned reference | Native before | After / status |
| --- | --- | --- | --- |
| Rail height | 2px | `.5rem` = 8px | **2px**, fixed |
| Rail corners | 0 | `.15rem` = 2.4px | **0**, fixed |
| Loading light | rgb(24,160,88) | rgb(36,114,191) | **rgb(24,160,88)**, fixed |
| Loading dark | rgb(99,226,183) | Same blue as light | **rgb(99,226,183)**, fixed |
| Success color | Same primary color as loading | Separate dark-green `#176243` override | Primary retained; author color token no longer replaced, fixed |
| Error light | `#d03050` | `#a1272f` | **#d03050**, fixed |
| Error dark | `#f00` | `#a1272f` | **#f00**, fixed |
| Unfilled track | Transparent; source has no track surface | `#dbe4ef` | **Transparent** native track, fixed |
| Root background | Transparent, bar only | Opaque white panel | Inline transparent; fixed uses configurable Canvas backing for required words (final readability clarification below) |
| Fixed position | top/left/right 0, z-index 5999 | Default insets already 0; z-index 20 | **5999**; logical safe-area/author insets retained |
| Loading entry | 300ms opacity, cubic-bezier(.4,0,.2,1) | Immediate | Same measured opacity curve, fixed |
| Error paint transition | Background changes linearly over 200ms | Immediate error-border color | Error cue border color follows the same measured 200ms color curve |
| Declared-success fill | 200ms linear fill-to-full | Immediate full value paint | Native progress value painting now follows a 200ms terminal-only width transition |
| Measured updates | No public measured-value API in source | Caller-supplied native value, immediate | **Unchanged**: `setProgress` has no width tween and never infers completion |
| Error semantics | Cosmetic source bar grows to full width | Retains last measurement, hides progress, shows independent error words/cue | **Unchanged native contract**, not false percentage completion |

The fixed native rail measured `(0,0,800,2)`; its native progress **element** remains full
width. The actual Chromium UA value element was inspected through DevTools rather than
mistaking the host's full width for the painted amount. At measured 40/100, the filled value
box was **320×2px**. With RTL it was `(480,0,320,2)`, matching a source bar sampled at 40%.
The source 40% sample was obtained by pausing its 4s cosmetic transition at 2s; it is not
described as a source measured-progress API.

### Measured motion

Entry rail opacity was identical (reference container versus native rail; fixed-mode
words are kept opaque by the readability follow-up):

| Time | Source | Native |
| --- | ---: | ---: |
| 0ms | 0 | 0 |
| 150ms | .775561 | .775561 |
| 299ms | .999994 | .999994 |

Declared-success fill from 40% in the 800px viewport:

| Time | Source width | Native painted width |
| --- | ---: | ---: |
| 0ms | 320 | 320 |
| 100ms | 560 | 560 |
| 199ms | 797.59375 | 797.59375 |

Both use **200ms linear**. Native value/state/status were already **100 / success /
Completed**; the transition is presentation, not a fake incremental measurement. Success
color stayed primary throughout.

Error color from loading was also identical despite different paint primitives:

| Time | Light source/native | Dark source/native |
| --- | --- | --- |
| 0ms | rgb(24,160,88) | rgb(99,226,183) |
| 100ms | rgb(116,104,84) | rgb(177,113,92) |
| 199ms | rgb(207,49,80) | rgb(254,1,1) |

The source transitions a background; native transitions its existing independent error
border. The native error still retained **value 40**, kept progress hidden, and displayed
**Failed**. No controller state or timer was changed to achieve the color match.

## Author overrides and native preservation

- Existing color, track, height, top/inset, background, text and z-index tokens remain.
  A progress-level color override rendered `rgb(112,64,160)`.
- With author height **5.5px**, top **9px** and inset **11px**, progress measured
  `(11,9,778,5.5)`; custom error color became `rgb(190,80,20)`.
  Native CSS borders are device-pixel quantized: the requested 5.5px error border resolved
  to 5.33333px in that environment. No fractional-error-line equivalence is asserted.
- Updating measured value 40→60 immediately changed painted width 320→480, with **zero
  width transitions** in loading state.
- Reduced motion produced zero root animations and `transition:none`; terminal native
  state/value remained success/100. Forced colors retained a static outlined progress cue
  and visible status words. Native borders use the browser's device rounding.
- Root/progress/status nodes, named native progress semantics, author styles/hidden/ARIA,
  first-terminal outcome, readable error text, timer cancellation and observer cleanup retain
  the original controller behavior. Its source and exports have no diff.

## Concrete remaining differences / policies

1. **Unknown progress is truthful:** native `start()` removes value and uses its existing
   indeterminate stripe decoration. It does not emulate the source's cosmetic **0→80% over
   4 seconds**. Stripe motion/color changes are not the source's solid simulated width path.
2. **Visible words remain:** source's container is only 2px high. The native passive root
   includes a required status span (and any authored label). In the minimal fixture its
   total root height became **34.78125px**, formerly 40.78125px; only the rail is 2px. No text
   was hidden to fake whole-surface geometry. The fixed-mode readability follow-up below
   keeps words/backing fully opaque and applies entry fade only to the rail; inline behavior
   retains its original surface fade.
3. **Terminal timing stays native:** the source fades out over **800ms** after finish/error.
   Native success holds **600ms** by default, then becomes idle immediately; error persists
   by default. These remain explicit options/outcome policies, not CSS animation-completion
   state machines. Native errors do not tween a fake measured amount to 100%.
4. **Repeated starts/early terminal calls:** repeated loading state does not force an entry
   fade restart. A terminal transition can end that fade immediately; it does not reproduce
   the source provider's mount/enter/leave sequencing.
5. **Placement is opted in:** inline flow remains the native default. `.mui-loading-bar--fixed`
   is the fixed counterpart; there is no provider/teleport, universal viewport escape from
   transformed ancestors, global request counting or missing binding/template layer.
6. **Native progress engines:** terminal width animation was measured on Chromium's actual
   progress value element. Other engines keep native progress/status fallback; no all-browser
   internal progress-animation equivalence is claimed. General page palette is unaudited.

## Validation and handoff

- `pnpm test tests\loading-bar.test.ts --reporter=dot`: **53 tests passed** (47 retained
  lifecycle/ownership/anatomy tests plus six focused paint/readability regressions).
- Private compile only: CSS **1152 gzip bytes**, before **826** (initial audit correction
  was 1034), under the unchanged
  **1250-byte ceiling**. Private ESM helper **2595 gzip bytes**, unchanged source; final
  distribution validation is the parent's task.
- Source-ready files: Loading Bar CSS, `tests/loading-bar.test.ts`, canonical/reference
  Loading Bar docs and this report.
- **No controller/API, shared CSS/theme, index, generated adapter, builder, package, root
  demo, full build, commit, push or sibling broadcast changes.**
- The owned `highlight-style-preview` session was stopped before this audit; its evidence
  files were retained. Shared/public/release servers were not stopped.

## Fixed-status readability follow-up

Parent review correctly identified that a transparent root could overlay required words on
real header text. The private fixture now includes an **Operations dashboard** header with
report/service text and a native **New report** action. Routes add `?header`, optionally
`&dark`, `&label`, and `&readability-before` for the initial transparent-word candidate.
`&labelspan` adds a naming span referenced by progress `aria-labelledby`, ensuring the
final backing protects labels that are not native `label` elements.

Actual text-range intersection was true in both light and dark before correction. The
status box was 800px wide at y=7.59375 with a transparent background, so `Loading`/`Failed`
were painted over header glyphs.

The final bounded correction uses a configurable opaque **fixed root** backing, as permitted
by the parent scope clarification. It protects every visible word, including a naming span
referenced by `aria-labelledby`, not only `label` and status-marker elements. Named label/status
boxes remain content-sized with an available-width limit and long-word wrapping; their own
backing is optional. The 2px rail and transparent unfilled track remain unchanged. Inline
behavior is unchanged. No words are hidden and no controller, outcome or terminal policy changes
were made.

| Measurement | Before | After |
| --- | --- | --- |
| Loading status width | 800px | 62.510418px |
| Effective status backing, light | transparent | rgb(255,255,255) / root Canvas |
| Effective status backing, dark | transparent | rgb(18,18,18) / root Canvas |
| Loading text color | light rgb(24,24,27), dark rgb(250,250,250) | unchanged |
| Error text color | light rgb(208,48,80), dark rgb(255,0,0) | unchanged |
| Rail rectangle | (0,0,800,2) | unchanged |
| Fixed root background | transparent | configurable Canvas |

An additional visible label (`Report preparation`) retained its 129.989594px content box.
To avoid translucent words/backing during entrance, fixed-mode root/status opacity remains
**1** while rail opacity alone follows the reference samples **0 / .775561 / .999994** at
0/150/299ms. Removing the fixed class returned status background to transparent.

Author checks passed: root background `rgb(20,30,40)` backs the words;
the optional status-specific override can add `rgb(40,50,60)` independently. Text
`rgb(230,240,250)` and error `rgb(255,190,90)` overrides remained effective. Explicit
transparent status backing is the default over the opaque root. In forced colors, words use
Canvas/CanvasText; print removes default root/word backings while keeping words visible and
the root in normal flow.
Reduced motion disabled both root and progress animation. The header action remained
clickable, confirming pointer pass-through.

The fixed surface still geometrically overlaps part of the header; its opaque backing
makes the **status** readable but necessarily covers the underlying header fragment.
Applications must use top/inset offsets, a separate layout position, or inline mode when
that header content must also remain visible. Explicit transparency/root opacity/translucent
layering requires author-managed contrast and clearance. No universal readability or
collision-avoidance claim is made.

Final bounded confirmation used a separately launched headless Chrome profile, not shared
browser state. `verify-root-backing.mjs` and `root-backing-evidence.json` remain in the private
fixture. Both native status and the `aria-labelledby` naming span stayed visible over the
meaningful header, with root opacity 1 and white/light or rgb(18,18,18)/dark Canvas backing.
The measured rail remained (0,0,800,2) with transparent track. Root background/text/error
overrides rendered rgb(20,30,40), rgb(230,240,250), and rgb(255,190,90) respectively.
Print returned the root to static/transparent with black readable words; forced colors
produced Canvas/CanvasText; reduced motion produced zero animations. The private browser
was closed after these checks. Controller and inline policies were not changed.

## Integration correction and release

Parent review additionally exercised the **error** state in dark-mode print. The original
state selector overrode the generic print foreground, retaining red text and a dark scheme.
The print reset now matches state-selector specificity and explicitly selects a light scheme.
The emitted release stylesheet renders error/status words black, even with an authored
orange error token, over a transparent static root. Screen overrides remain unchanged.

The isolated release build and all **53 Loading Bar tests** passed. Actual distribution
sizes are **1163/1250 gzip bytes CSS**, **2627/3500 ESM**, and **2700/3500 classic**.
The earlier private measurements above are not the final distribution sizes.
