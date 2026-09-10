# Button / ButtonGroup default-style audit

**2026-09-10 — defaults and state endpoints corrected; remaining motion and legacy
boundaries are explicit below.** This is the new visual pass, not a replacement of the
historical native-migration acceptance record. Card has not been reviewed here.

## Source, runtime and reproducible fixture

- Official reference: <https://www.naiveui.com/en-US/os-theme/components/button>.
- Pinned source/runtime: **Naive UI 2.45.3**, source commit
  `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; **Vue 3.5.30**.
  Inspected Button/ButtonGroup props, light/dark themes and CSS, common light/dark tokens,
  Button's icon rendering and `_internal/loading` geometry/animation.
- Reused the private fixture at
  `C:\Users\chengzhu\.copilot\session-state\99fde562-4396-4c35-9601-b00d03e1c14e\files\style-reference`.
  No installation, dependency update, copied upstream asset, or production Vue/Naive import.
  Existing lock SHA-256 remains
  `a9e02efaf82d0335b797406ed11030c00b58b74f1123b84f49e3c97e5d82ee9c`.
- In that directory: **`npm run build`**, then **`node server.mjs`**.
  The attached server is **`avatar-reference`**, port **4190**. Existing Avatar routes
  `/reference.html` and `/markup.html` remain available and unchanged in purpose.
- New routes:
  - `/button-reference.html`: `NConfigProvider theme=null`, `NGlobalStyle`, default props
    except labeled variants and required content.
  - `/button-markup.html`: standalone Button and documented opt-in Global Style.
  - Add `?dark` for official `darkTheme` / MarkupUI explicit theme attribute plus themes CSS.
  - Add `?rtl` for official Button/ButtonGroup RTL configuration / native `dir=rtl`.
  - Markup `?core` imports enhanced Button **before** core and includes canonical CSS;
    `?core&reverse` reverses external stylesheet order.
  - Markup `?before`: native controller/group and CSS reconstructed from
    **`31a4de93fc383115a859af9aec75dd2d01eaa1d1`**, not approximated old styles.
  - Markup `?core&legacy`: actual basic legacy controller. Add `&before` to use the pinned
    old canonical CSS, removing the current injected stylesheet in that reference page.
    The basic controller itself was not changed by this pass.
- `button-cases.js` holds the labeled cases; `button-measure.js` exports
  `measureButton`, `measureButtons`, and `measureButtonEndpoint`. The last finishes **CSS
  transitions only** for endpoint measurements, without rewriting their durations/easing.
  SVG motion was separately paused at explicit relative times for comparison.
- Separate documents prevent stylesheet contamination. Chromium **151.0.7922.174**, Windows,
  **1000×1250 CSS pixels, DPR 1**, identical `Save` labels and locally authored plus icon.
  Icon-only reference controls genuinely omit the default slot; an empty-string slot was
  not treated as a trustworthy substitute. No webfont downloads or customized website demo
  controls were used as defaults.

State evidence includes rendered DevTools-forced hover/active/focus pseudo-states, ordinary
pointer/keyboard interactions, and native form tests. Forcing a CSS focus state is **not**
evidence that a disabled/loading native control can receive keyboard focus.

## Exact differences and corrections

**N** = `src/components/button/button.css`; **B** = `button/button.ts`;
**L** = canonical `src/components/styles.css`; **T** = `src/theme/presets.json`.
Generated `styles.ts` and `presets.ts` were produced only by `pnpm build`.

| Case | Naive expected | MarkupUI before | Fix and actual after measurement | Status |
| --- | --- | --- | --- | --- |
| Medium default geometry (`Save`) | 56.59375×34px, padding 0 14px, physical border 0 plus 1px overlay | Native 58.59375×34px with a layout-consuming 1px border; legacy already 56.59375×34px | N uses non-layout border overlay; native and legacy now both 56.59375×34px | Fixed native; legacy dimensions matched |
| Default font/leading | 14px, weight 400, line-height 14px | Native line-height 19.6px; weight inherited; legacy 14px/400 already matched | N explicit 400 and line-height 1; same family and text geometry as reference | Fixed |
| Default light border | rgb(224,224,230) | Native standalone rgb(194,194,194); native+core and legacy rgba(0,0,0,.24) | N/L/T: `#e0e0e6`, measured 1px solid overlay | Fixed |
| Default light text | rgb(51,54,57) | Native alone matched; native+core rgb(24,24,27); legacy rgba(0,0,0,.82) | N consumes Button text token, L/T set `#333639`; all loading paths measured rgb(51,54,57) | Fixed integration/legacy |
| Size presets | Heights 22/28/34/40; padding 6/10/14/18; fonts 12/14/14/15 | Heights/fonts matched; tiny padding 8; native borders added 2px to ordinary widths | N/L tiny padding 6; native `Save` tiny 42.515625→36.515625px wide at 22px high | Fixed |
| Strong | Weight 500 | Native 600; legacy 500 | N 500; native strong `Save` 59.375→57.375px wide after border correction | Fixed native |
| Round/circle | Round medium padding 18, radius 34px; circle 34×34 | Native round 66.59375px wide, radius 999px; circle outer size matched, radius 50% | N/L round width 64.59375px; native radius 34px. Tiny round 50.515625→44.515625px. Circle remains 34×34. Text+circle relinquishes fixed width, including block combination | Fixed geometry; old circle outline was visually round already |
| Text buttons | 28.59375×14px, no padding/border, radius 0 | Native 38.59375×21.59375px; padding 4px per side and transparent layout border | N/L text geometry now 28.59375×14px; overlay omitted | Fixed |
| `type=tertiary` versus `tertiary` | Type: muted rgb(118,124,130), transparent fill, ordinary border. Flag: normal text, neutral soft fill | Native type incorrectly reused the filled tertiary treatment | N separates the type from the flag; reference values measured exactly | Fixed native; basic legacy type boundary below |
| Neutral secondary/tertiary | rgba(46,51,56,.05), hover/focus .09, pressed .13; no border | Native secondary used text-tone .12/.18/.24; tertiary solid rgb(241,242,243), then tone mixtures | N/L use exact neutral colors and keep label color stable | Fixed |
| Quaternary | Transparent rest; neutral .09 hover/focus and .13 pressed | Native tone-based .18/.24 state fills | N/L exact neutral state fills | Fixed |
| Colored secondary | Tone alpha .16/.22/.28 in light | Native .12/.18/.24; focus remained .12 | N/L .16/.22/.28. Disabled colored secondary returns to neutral fill while retaining tone text | Fixed |
| Ghost/dashed/text pressed state | Primary pressed rgb(12,122,67); focus uses hover rgb(54,173,106) | Native ghost/dashed active reused hover green; focus retained resting color | N/L state variables distinguish pressed and focus; measured endpoints match | Fixed |
| Disabled state | No hover/active recoloring; opacity .5 light / .38 dark | Native disabled controls still recolored on hover/active; dark opacity .5. Legacy opacity .38 even in light | N gates state selectors on native disabled/ARIA state; L corrects light opacity; all tested endpoints match | Fixed |
| Loading state | Opacity 1, cursor wait; 18px icon plus 6px gap in medium | Native opacity .5 and not-allowed cursor; 14px rotating border icon with 8px gap | N/B opacity 1/wait, exact wrapper/label positions. Native controls remain truly disabled and busy | Fixed without changing activation contract |
| Icons | 14/18/18/20px by size, 6px gap when content exists | Native 14px-wide medium icon with 19.59375px line box and 8px gap | N normalizes icon boxes/margins. B derives icon-only spacing from live nodes without wrapping/replacing them; true icon-only and right-icon-only margins are 0 | Fixed |
| Loading arc itself | Medium radius 8.1px, stroke 1.8px; 1.6s sweep/rotation plus 3s outer rotation | Constant-gap CSS ring, 2px stroke, .8s rotation | B creates an owned native SVG; N uses proportional stroke/radius. At 0/.4/.8/1.2s, center, radius, stroke, dash lengths and angle match measured reference within 0.0001px/degrees | Fixed |
| Default horizontal group | `One/Two/Three`: 169.484375×34px; x offsets 0/53.8125/106.703125 | Native width 173.484375; legacy width 167.484375; negative member margins | N/L remove overlap, use overlay seams; both now 169.484375px wide | Fixed |
| Native group shape/seams | Retain outside rounded ends/single member; collapse only appropriate same-type default/ghost boundaries | Generic joins affected all adjacent types, and rounded ends were reset | N uses exact conditional joins and logical corners. Default, primary, ghost, mixed, vertical, small, round and single groups measured against source; RTL offsets 115.671875/62.78125/0 | Fixed native |
| Block legacy geometry | 300px within a 300px fixture parent | Legacy 328px due content-box padding | L reuses border-box rule; actual width 300px | Fixed |
| Default transition | .3s cubic-bezier(.4,0,.2,1), including color/background/opacity and painted border | Native .2s default ease, no opacity transition | N matches measured transitions; L keeps equivalent .3s painted-border transition on its overlay | Fixed |
| Focus-visible | Ordinary theme focus color/border, no default halo | Native unconditional 3px blue/global ring | N matches ordinary focus colors. Explicit `--mui-button-focus-color` still produces an authored 3px ring; forced colors use a 2px Highlight outline | Fixed with explicit accessibility adaptation |
| Dark theme | Text white/.82, border white/.24, colored button text black; secondary alpha .16/.20/.12; neutral .08/.12/.08 | Native default text rgb(250,250,250), colored text white, incorrect neutral/tone fills and .5 disabled opacity; legacy contrast near-black #0b0b0c | N/L exact Button colors, black contrast and .38 opacity; CSS-only themes path and demo switch verified | Fixed, without changing global palette |
| CSS load-order ownership | Rich host has no extra paint or padding | New stronger legacy secondary rules would otherwise tie the old isolation selector and tint the host | N strengthens host isolation. Computed native host backgrounds remain transparent with core before/after optional CSS, preventing doubled translucent fills | Fixed coupled cascade defect |
| Explicit default alias | `variant=default` with secondary stays neutral | A broad candidate `[variant]` selector could incorrectly apply colored secondary alpha | N/L limit colored branches to supported semantic aliases; rendered default-alias case matches | Fixed coupled selector defect |

The direct status hues were already correct: primary/success `#18a058`, info `#2080f0`,
warning `#f0a020`, error `#d03050` in light, with their pinned dark palette counterparts.
They were not arbitrarily retuned. Default background remains transparent and default
box-shadow remains none. Colored secondary CSS may serialize as `color(srgb … / alpha)`
instead of `rgba(…)`; actual browser RGBA resolution matches, not merely source numbers.

## Loading implementation and ownership evidence

The loading SVG is newly constructed from basic native circle/animation primitives, not an
imported Naive asset or copied renderer. The two reference angular tracks are mathematically
composed into one `0→270→720` native rotation. Percent-based circle geometry works at each icon
size; CSS stroke overrides remain physical CSS lengths. No frame loop, resize engine,
stylesheet injection or runtime dependency was added.

For an 18px indicator, both implementations measured center `(9,9)`, radius `8.1`, stroke
`1.8`, dash length `51.03`; at times `0/.4/.8/1.2s`, offsets were
`51.03/31.905/12.78/31.905` and combined angles `0/-177/6/-81` degrees. Native radius differs
only by float precision (~0.0000004px). An authored 30px spinner with 4px stroke measured a
26px circle path box, preserving the intended 30px outer footprint.

Live reduced-motion changes pause the SVG at `.8s` and disable outer CSS rotation;
returning to normal motion resumes it. Only loading, connected controls hold a media-query
listener. Detach, completion and control replacement remove the listener and pause the clock;
stale callbacks are guarded. Original icon/content nodes, event listeners, native control
identity and accessible names are retained. Icon-only classification watches character data,
does not wrap authored native-control contents, and is cleaned from replaced controls.

## Remaining gaps and scope boundaries

- **Remaining visual motion:** the reference's `.6s` post-click exterior wave and animated
  icon insertion/swap transitions are still absent. Native icon replacement is immediate.
  This is not claimed to be an inherent browser impossibility or full motion parity. Rest,
  hover, focus, pressed, disabled and steady-loading comparisons do not certify these
  transient effects.
- **Native interaction choices remain:** loading uses actual native disabled controls,
  `aria-busy` and removal from Tab order rather than Naive's loading-focus retention;
  `focusable=false` excludes sequential Tab focus but does not intercept native pointer focus.
  Anchors retain native semantics and selection. Disabled fieldsets remain browser-owned.
- **Basic legacy boundary:** the original basic controller was not migrated to native-child
  Button or a complete standalone API. Its existing default/size/color/treatment/shape/block
  presentation was corrected. Group-level size/vertical mode, normalized authored-icon API,
  `type=tertiary` styling and non-primary `variant` aliases still require the standalone entry.
  The legacy loading primitive retains its fixed 18px CSS ring and original interaction
  policy; it is not the new SVG indicator. Mixed-type seam policy is exact in standalone,
  not certified for every legacy combination.
- **Legacy focus/motion:** its existing 3px keyboard-focus ring remains. Its existing
  reduced-motion policy under `mui-app:not([motion="full"])` remains; the standalone entry
  has document-independent reduced-motion and forced-color handling. A non-painted legacy
  host-border transition was not added merely to match a computed declaration list; the
  visible overlay still transitions correctly.
- **Document palette remains unaudited:** body colors are not made identical by demo CSS.
  Transparent/translucent buttons reveal the different document canvas in core/dark pages.
  Matching component paint values is not a claim of whole-page screenshot identity.
  No all-browser, screen-reader-specific, arbitrary render-callback or CSS-token/Naive-prop
  equivalence is asserted.

## Validation, budgets and shared-token findings

- `pnpm build` passed all existing ceilings. Targeted:
  `pnpm test tests\button.test.ts tests\native.test.ts tests\global-style.test.ts tests\legacy-styles.test.ts tests\config-provider.test.ts tests\avatar.test.ts --reporter=dot`
  — **118 passed in 6 files**: 32 Button, 27 native, 13 Global Style, 9 generator/legacy,
  12 Config Provider, 25 Avatar. No full-suite claim.
- Rendered **73 controls/group members** matched the reference across light, dark, RTL and
  reversed core/optional CSS order for measured size, padding, font, colors, border painting,
  radius, opacity, cursor, transition and icon boxes. Color serialization was resolved through
  the browser, not compared as unequal spelling. Native host paint was checked separately.
- Light state endpoints were checked for 21 representative default/typed/ghost/dashed/text/
  soft/disabled/loading cases. Dark endpoints and actual pointer/keyboard focus were checked
  separately. No default-prop example was mistaken for an explicit variant.
- Real Chromium Enter and Space each activated a native button once; host Tab index remained
  -1. Required validation blocked submission, then the actual submitter produced
  `action=save; title=Verified`; native reset restored `Draft`. Existing native/link/fieldset/
  registration/action/lifecycle tests passed.
- Author overrides produced a 48px control, 9px radius, monospace text, a custom 30px/4px
  spinner and a purple 3px focus ring. Forced colors produced a 2px system outline. The demo
  theme switch settled at dark primary `rgb(99,226,183)` with black text.
- Runnable demo: `http://127.0.0.1:4191/demo/components/button.html`, existing attached
  **`avatar-fit-demo`** server. Command from `D:\repos\MarkupUI`:
  `$env:PORT='4191'; node demo\server.mjs`.
- **Only two shared preset values changed**, both Button-specific light tokens:
  `button-text-color` rgba(0,0,0,.82)→`#333639`,
  `button-border-color` rgba(0,0,0,.24)→`#e0e0e6`.
  General text/background/status/contrast palette tokens and the already corrected typography
  were not changed. Dark preset hashes remain unchanged.
- Exact approved CSS baseline changed from
  `e9da85e704ec41b78d8c514f4ece69c01903572f9c4ee34be2a05a05af87be05`
  to `6eb63c78564b604d6193af7fdbda6c69e7206b5b2f6ad07c5551e95aa4f0ee91`.
  Light preset hash changed from
  `207e2b0aabc35c662ee89d1d35258d13c37d6023f15bf47218dd15b6fb9d0f31`
  to `fee147d6edd693cb4f0b34eb79061c8546ec1a7050c155072e585addba435863`.
  Exact hashing/generation checks remain; tests were not removed or weakened.
- Core budgeting required removal of overwritten early Button rules, factored state values,
  equivalent fallback/default declarations and standard unquoted attribute selectors.
  The basic core was not expanded into all optional-entry APIs. No unrelated styles or
  budgets were modified to create room.

| Asset | Final gzip bytes | Existing ceiling |
| --- | ---: | ---: |
| Core minified ESM | 14,996 (before 14,911) | 15,000 |
| Button ESM | 2,728 | 4,000 |
| Button classic | 2,946 | 4,000 |
| Button CSS | 2,497 | 2,500 |

Changes are scoped to Button implementation/styles, canonical/generated styles and Button
tokens, targeted tests, Button demo/docs, and this audit/index. Unrelated README and main-demo
work is deliberately excluded. Reference packages, generated reference bundles and snapshots
remain outside the repository. No amend or push is performed.
