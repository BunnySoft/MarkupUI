# Input OTP single-field style audit

**Status:** standalone corrections integrated; shared Input wrapper media
follow-up is assigned separately and remains pending. The retained OTP is one original native
text/password input, not a six-cell renderer. No runtime, binding, template, dependency
or code-value model was changed.

## Reference and reproducible evidence

- Pinned commit **`42a52e6436b38bed456fee19eb0b89cdcd00fcc2`**; installed renderer
  **naive-ui 2.45.3 / Vue 3.5.30**.
- Sources: [InputOtp](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/src/InputOtp.tsx),
  [OTP CSS](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/src/styles/index.cssr.ts),
  [OTP theme](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/styles/light.ts),
  [Input light](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input/styles/light.ts)
  / [dark peer](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input/styles/dark.ts).
- Private session directory `files\style-reference\input-otp-audit`, port **4227**.
  `build.mjs` compiles only the current component and the reference fixture through
  existing esbuild; `server.mjs` serves only that directory.
- `browser.mjs` launches a private-profile headless Chromium process through CDP,
  closes it after each run and synchronizes navigation on actual load events.
  No shared browser tab, fixture build or server was used.
- `measure.mjs before` / `after` capture actual geometry, computed paint and
  hover/focus states. `before.css` preserves original component CSS; `before.json`,
  `after.json` and `{before,reference,after,legacy}-{light,dark}.png` retain evidence.
- The final matrix has **17 paired cases in two themes**, plus two reference-only
  warning/success cases. The baseline preceded the added composed-disabled and
  source-only cases; those additions are not presented as before/after pairs.
- `boundaries.mjs` asserts emitted native editing/lifecycle/media behavior and writes
  `boundaries.json`, `forced-dark.png`, `print-dark.png`, `narrow-rtl.png`.
- Main viewport 1000x1200, DPR 1; narrow 375px request and 200% CSS zoom. Only local
  dummy codes were entered. No real credentials, clipboard read/write, SMS/WebOTP,
  authentication request or code-bearing navigation was used.

## Corrected controllable defaults

| Surface | Before native field | Reference / corrected native field |
| --- | --- | --- |
| Small / medium / large height | 33 / 45 / 58px | **28 / 34 / 40px** |
| Small / medium / large font size | 16 / 20 / 24px | **14 / 14 / 15px** |
| Radius | 4px | **3px** |
| Border light / dark | System GrayText | **`#e0e0e6` / transparent**, one pixel |
| Text light / dark | System FieldText | **`#333639` / white .82** |
| Background light / dark | System Field | **White / white .1** |
| Placeholder light / dark | Native default | **`#c2c2c2` / white .38** |
| Disabled placeholder light / dark | Native default, faded with input | **`#d1d1d1` / white .28**, opacity 1 |
| Disabled text / surface | Entire input opacity .65 | **`#c2c2c2` / `#fafafc`** light; **white .38 / .06** dark, opacity 1 |
| Character spacing | .5ch, ~5.498px medium here | **8px** adaptation, not per-cell placement |
| Gap-aware width | Width ignored an authored larger gap | Width includes length times `(1ch + gap)`, padding and border |
| Enabled hover/focus border | No source color treatment | Primary hover **`#36ad6a` / `#7fe7c4`** |
| Focus ring/glow | Native visible outline only | Source 2px light ring / 8px dark glow **plus retained system outline** |
| Aria-invalid face | Dashed system border | Dashed **`#d03050` / `#e88080`** with corresponding error hover/focus |

Light/dark placeholder, text, background, disabled and error colors matched the actual
reference cases. Native disabled error fields return to neutral disabled borders, as
the source does, but retain the existing dashed non-color cue. The numeric source
ring/glow colors and native `color-mix` equivalents represent the same sRGB channels;
their computed CSS string serializations differ.

Private size defaults preserve public overrides. The authored small case retained
**18px type, 44px height, 9px radius, 12px spacing**, purple text and orange border.
Its complete string fit at **157.375px** width with equal client/scroll widths.
The old gap-independent width could clip a fully entered code at a larger authored gap.

## Native renderer and status limits

- Source default is six **30x34px** cells with five **8px** gaps: **220px** occupied
  width. Small/large source cells are 24/36px wide. Corrected native medium is one
  **120.172x34px** field (previously 130.953x45px in this browser).
  This is intentional compact whole-code geometry, not equivalent cell positions.
- The monospace native glyph policy is preserved; the reference inherits sans-serif
  from its surrounding UI. Native 8px letter spacing does not include the source's
  centered glyph space inside each 30px cell. There is no generated border grid,
  hidden field, character mirror or per-cell accessible-name graph.
- Source block mode distributes multiple cells across the host. Native block mode
  expands one input and keeps normal native editing/scrolling. Native 12-character
  width measured 214.359px; constrained/zoomed inputs may scroll text internally.
- Native password masking remains browser-owned. Bullet shape, selection, caret,
  OS autofill popup, mobile keyboard and real SMS autofill are not renderer-parity
  claims. Placeholder remains one native string, not six independently rendered hints.
- `aria-invalid` remains application/Form-owned presentation, with native `validity`
  authoritative for completion. Styling does not install custom validity or mark an
  empty required field red merely because `:invalid` initially matches.
- The source-only warning case showed **`#f0a020` / `#f2c97d`** borders. No standalone
  OTP warning API was added. Source success had the ordinary neutral input face;
  the native local complete count remains weight 600, not a green authentication cue.
- Hover and focus paint update immediately; source Input's CSS transition timing
  was not ported. No animation was added, including in reduced-motion mode.
- Existing legacy aggregate CSS loaded after the owned styles produced the same
  paired native geometry and paint. Legacy custom-element rendering is not certified
  as six-cell compatibility.

## Emitted native and media evidence

`boundaries.json` asserts:

- The original input remained identical, with one successful named field, native
  `one-time-code` hint and preserved leading zeroes. Completion detail contained
  only `{ length: 6, characters: "digits" }`; the count did not mirror code text.
- A synthetic paste event was not prevented, followed by CDP multi-character
  insertion. Complete-to-complete replacement did not emit a second completion.
  This is not trusted OS clipboard or SMS-autofill certification.
- Native ArrowLeft moved the caret from 6 to 5 without changing focus to another
  field. No key handler or selection/focus controller was added.
- CDP IME held state `editing`, complete false and zero notifications during
  composition; commit produced one six-character completion.
- External custom validity suppressed completion without being cleared. Native
  reset emptied the field and established an incomplete baseline without an event.
- A native disabled fieldset disabled its input without setting the input's own
  disabled property, excluded it from FormData, and preserved the first-legend
  exception and its successful native value.
- Forced colors gave standalone/fieldset-disabled, disabled-error, disabled
  placeholder and composed-disabled controls **GrayText with opacity 1**.
  GrayText resolved to `rgb(96, 0, 0)` in this emulation; assertions compare to a
  system-color probe rather than assuming gray is a particular RGB value.
- Dark print made actual standalone/composed fields, disabled text, placeholders,
  author overrides and count text **black on white**, with native field shadows
  removed. Wrapper limitations are separated below.
- Narrow RTL retained LTR code direction and all 12 characters with equal **360px**
  document client/scroll widths. 200% CSS zoom still had no page overflow.
- Disconnect preserved input identity, native hint and selection, restored all
  still-owned count text and left no connected OTP owner.
- A script-disabled static fixture retained native required blocking/focus, one
  successful form field and a valid local method=dialog close with nonsecret
  return value `"local"` and no query string.

## Shared Input boundary and proposal to the parent

**No shared Input CSS or dependency was edited.** A composed OTP is
`[data-input-control]`; Input owns its wrapper face, font, border and sizing.
OTP deliberately excludes that marker from its added focus/disabled surfaces,
avoiding duplicate dark alpha backgrounds or two theme glows. Actual focused error
composition retained a transparent, shadowless native child under one Input wrapper.

The parent-owned wrapper still has two observable media differences:

| Shared surface | Actual emitted observation | Proposed shared Input follow-up |
| --- | --- | --- |
| Forced-color disabled wrapper | Native child uses GrayText/opacity 1; wrapper pseudo-border remains ordinary black Button/Canvas text rather than GrayText | Reset disabled wrapper/pseudo-border to system GrayText without opacity fading |
| Focused error wrapper in dark print | Native child/count are black/white, but wrapper retains white-.82 text, error-.1 background, `#e98b8b` border and error-.3 8px glow | Reset wrapper/affix text and pseudo-border plus focused/status background/shadow in print |

These are proposals for the shared owner, not fixes smuggled into OTP CSS.
The standalone OTP corrections do not require a shared dependency change.

## Source validation and integration gate

- `pnpm test -- tests\input-otp.test.ts tests\input-otp.styles.test.ts`:
  **81 passed** (73 existing OTP + eight new style regressions).
- Existing esbuild, isolated ESM/classic entries, source maps, ES2022, minification
  and level-nine gzip: **2,280 / 2,352 / 994 bytes** ESM/classic/CSS.
  Windows CRLF checkout simulation: **997 CSS bytes**.
- Unchanged ceilings: **3,000 / 3,000 / 1,000 bytes**. Existing esbuild whitespace
  formatting was used to retain all local safety/media rules within the CSS budget.
- Changes are confined to OTP CSS, focused style tests, canonical/reference docs
  and this report. Controller code and the pinned API inventory remain unchanged.
- Full integrated build, final manifest, shared Input proposal and publication are
  the parent's responsibility. No full build, commit, push or shared/index/generated
  source edit occurred in this pass.

## Integration

The isolated release build and **81 OTP tests** passed. Actual emitted CSS is
**3341 raw / 997 gzip bytes**, below the unchanged **1000-byte ceiling**.
ESM/classic remain **2280/2352 gzip bytes**, each below 3000.

The shared Input wrapper observations above were routed to its coordinated media
follow-up. This release does not claim those wrapper issues are fixed; it contains
only the reviewed OTP-local changes and preserves the single native input/controller.
