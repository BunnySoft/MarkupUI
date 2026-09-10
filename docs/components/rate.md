# Rate: bounded native radio scores

**🟢 Verified for the retained native Rate scope.** Integer and half-step scores are actual
labelled radio choices. Stars/SVG/text are decoration, never hidden hit zones or role-radio
proxies. The optional helper **reuses the existing Radio implementation** for names,
form/tree boundaries, exclusivity, silent native setters and aggregate commits.
Legacy `mui-rating` in `src/plugins/widgets.ts` remains unchanged.

## Loading and authored structure

| Asset / export | Contract |
| --- | --- |
| `@dataengine/markup-ui/rate` | ESM `createRate`, `RateOptions`, `RateController`; includes internal Radio implementation |
| `dist/markup-ui-rate.js` | Self-contained optional ESM |
| `dist/markup-ui-rate.global.js` | Classic `MarkupUIRate.createRate`; refuses namespace replacement |
| `@dataengine/markup-ui/rate/style.css` | External `dist/markup-ui-rate.css`; no separate Radio stylesheet needed |
| [Demo](../../demo/components/rate.html) | Separate HTML/CSS/JS, integer/half/disabled/static examples and local form fallback |
| [Reference dispositions](../naive-ui/components/rate.md) | All original owner/prop/slot/inline identities and explicit supplements |

```html
<fieldset class="mui-rate mui-radio-group" data-rate data-radio-group id="quality">
  <legend>Quality</legend>
  <div class="mui-rate__choices">
    <label class="mui-rate__choice">
      <input data-radio type="radio" name="quality" value="1">
      <span class="mui-rate__glyph" aria-hidden="true">★</span>
      <span class="mui-rate__score">1 of 3</span>
    </label>
    <label class="mui-rate__choice">
      <input data-radio type="radio" name="quality" value="2" checked>
      <span class="mui-rate__glyph" aria-hidden="true">★</span>
      <span class="mui-rate__score">2 of 3</span>
    </label>
    <label class="mui-rate__choice">
      <input data-radio type="radio" name="quality" value="3">
      <span class="mui-rate__glyph" aria-hidden="true">★</span>
      <span class="mui-rate__score">3 of 3</span>
    </label>
  </div>
  <span data-rate-output hidden>Not rated</span>
  <button data-rate-clear type="button" hidden>Clear quality</button>
</fieldset>
```

Load one helper format and CSS, then use an external setup script:

```js
const quality = MarkupUIRate.createRate(document.querySelector("#quality"), { count: 3 })
quality.setValue(2)    // Silent, keeps defaultChecked.
quality.setValue(null) // Silent no selection, not a hidden zero.
```

There is no custom-element registration or `mui-rating` load-order rule. Radio's root/
member symbols reject duplicate Rate/Radio binding, including ESM/classic copies.
Do not independently bind the same fieldset with both helpers.

Enhanced roots must satisfy the [Radio contract](radio.md): connected light-DOM native
fieldset, named first legend, real labels, no replacement roles/tabstop, one common
nonempty native name/form owner/tree, unique explicit values and **all native peers in
scope**. Same-name outside/nested peers are not secretly isolated; invalid scope throws/
reports through Radio. Same name in a different actual form is independent. Native
behavior continues if application changes later introduce a conflict; the helper never
renames controls or restores unowned peer values.

## Bounded counts and explicit half choices

Options are initialization-only:

| Option/API | Meaning |
| --- | --- |
| `count` | Integer **1–10**, default 5; maximum score, not an unbounded render count |
| `allowHalf` | Boolean, default false; requires the full ascending half-step choice set |
| `formatValue(value, count)` | Optional pure plain-string readout formatter; no HTML/VNode or automatic live region |
| `value` | Native selected score converted from a validated canonical string, or null |
| `count`, `allowHalf`, `connected`, `error` | Effective contract/lifetime and local or underlying Radio error |
| `setValue(number|null)` | Silent existing-score selection or native clear; no clamp/rounding/option generation |
| `clear()` | Explicit user-like no-rating action; true only when an editable selected score was cleared |
| `refresh()` | Validate choices and refresh readout/clear state, without replacing native fields |
| `disconnect()` | Idempotent owned UI cleanup and Radio-owner disposal; edited checked/default/native attrs persist |

Author exactly `1,2,...count` for integer mode, or `0.5,1,1.5,...count` for half mode, in
ascending DOM order. A first explicit `value="0"` radio is optional. All values must be
canonical strings (`"1"`, not `"1.0"`/`"01"`); unknown/missing/duplicate/misordered choices
are errors. At most 20 nonzero half choices plus optional zero exist. **The helper does
not create any controls**, regardless of count; changing count/choice mode requires
disconnecting, authoring the new bounded set and recreating.

Half scores have their own visible native radios and meaningful labels, for example
“2.5 of 3”. Every half value is keyboard-reachable. The demo uses distinct score-choice
chips, **not two invisible hit zones per star**. A half glyph is optional clipped decorative
content; the focusable input is never clipped, hidden or overlaid by an unlabelled target.

```html
<label class="mui-rate__choice">
  <input data-radio type="radio" name="detail" value="1.5">
  <span class="mui-rate__glyph" data-half aria-hidden="true">
    ★<span class="mui-rate__half-fill">★</span>
  </span>
  <span class="mui-rate__score">1.5 of 3</span>
</label>
```

Glyphs require aria-hidden and no interactive descendants. The actual score label remains
visible and conveys value without color. Custom Unicode characters or static SVG can be
authored safely; there is no `character` prop, icon package or VNode callback renderer.

## Null, zero, defaults, readonly and forms

- **Null means no native radio selected** and no submitted rating. It is not a hidden
  empty/zero model value. An explicit zero radio means score 0 and submits native string
  `"0"`. The default readout distinguishes “Not rated” from “0 / count”.
- DefaultChecked/checked HTML owns reset defaults. Setters/refresh do not rewrite them.
  Native form reset and cancellation remain native, with post-default refresh following
  actual form ownership and changed IDs. Radio's known jsdom form-owner/cancellation
  limitations remain authoritative; browser evidence is recorded separately.
- Native required on one radio requires a selected peer in that native group, not every
  choice. Explicit zero can satisfy native required; positive-score policy is a separate
  application/Form validation decision. No schema validator or fake radio readonly.
- **Readonly is static presentation**, such as readable “3.5 out of 5” with decorative
  stars, no inputs/buttons/roles/tabstops. It submits no rating. Do not add a hidden field
  to pretend it is a readonly radio control. Persist an existing readonly score in the
  application's/server's model separately.
- Disabled interactive ratings use actual fieldset/input disabled. Their selected state
  remains readable but native FormData excludes disabled fields. Explicit programmatic
  setters may still update them. A disabled selected choice cannot be cleared by the
  helper; native selection of other enabled peers follows ordinary radio behavior.

The optional helper rejects readonly radio/root attributes and an unsupported readonly
option. To switch between interactive and static presentations, disconnect first and
author the appropriate DOM; this is not a hidden display-mode conversion.

## Native events and explicit clear

Native arrows, Space, Tab, labels, pointer focus and exclusivity belong entirely to Radio/
the browser. There is no second key/roving/gesture engine, no reversed DOM for star
selectors, and no synthetic click. Re-clicking/Space on the already selected star **does
not toggle it off** or generate another native change.

Selection uses original native input/change and Radio's existing one nonbubbling
`mui:radio-group-change` per committed native change (`detail.value` remains a string).
Rate adds **no duplicate `mui:rate-change`**. Read numeric `controller.value` when needed.
Native unchecking of the former peer does not emit a fabricated false change.

Clear is an authored named `type=button` outside labels. A later click preventDefault
cancels its next-task action. It clears through Radio's silent native setter, then emits
one nonbubbling `mui:rate-clear` on the root with `{ previous, value: null }`. It deliberately
does **not** synthesize native radio input/change or a second Radio aggregate because no
radio became selected. Observe native change and explicit clear for the adapted update
contract. Programmatic setters, refresh and reset emit neither.

Clear is a no-op without selection and blocked for the selected field's native disabled/
fieldset/hidden/inert state or root advisory aria-disabled/aria-readonly. A focused clear
button focuses the selected real radio before clearing/hiding; that radio remains
focusable even when unselected. Zero is a real selection and is clearable.

## Readout, style and ownership

`span[data-rate-output]` is text-only, outside labels, with no role/tabindex/live attribute.
The helper updates textContent and its enhancement visibility; no values are inserted as
HTML or announced through an automatic live region. Group/choice names stay stable.
Without JS, clear/readout enhancement nodes remain hidden, but native selection/reset,
visible labels and star styling still work. Native reset or an authored zero choice is
the no-JS alternative; it is not identical to the helper's null clear.

CSS owns size, color, current/hover/partial-fill/focus/RTL/forced-color/print presentation.
`data-size="small|medium|large"` now supplies the pinned **16/20/24px** glyph font sizes,
with 20px default; external `--mui-rate-size` overrides those private presets.
Tokens: `--mui-rate-text`, `--mui-rate-active`, `--mui-rate-muted`, `--mui-rate-size`,
`--mui-rate-gap`, `--mui-rate-border`, `--mui-rate-focus`. Choice gap defaults to 6px.
This is spacing between native choice chips, not a promise that visible radios/labels
collapse into the source's compact star strip.

Default active color is `#ffcc33` in light and `#ccaa33` in dark; inactive decoration is
`#dbdbdf` / white .2. Native labels use `#333639` / white .82. Local
`data-mui-theme="light|dark"` scopes select these defaults; public color tokens remain
author overrides. No provider or color parser is added.

`data-rate-cumulative` on an **integer** group optionally colors preceding choices via
:has; half-choice groups show their selected/hovered choice instead. Hover is visual
emphasis, not the upstream numeric hover-preview callback/model. Disabled inputs/fieldsets
no longer acquire hover fill, while disabled checked/cumulative selections remain readable.
No animation or source hover-scale effect is added.

Artwork remains authored. Unicode glyph advances and multi-character spans are not forced
to one-em widths or replaced by generated SVG. Authored SVGs render as blocks at one em,
removing the extra baseline gap. Half fill clips half of the authored glyph's actual width:
the tested 20px SVG gave 10px, while the system-font star gave about 8.333px. A multi-star
span such as `★★★` remains intact. See the
[rendered Rate audit](../style-audit/components/rate.md) for these artwork/state limits.

Without :has, actual checked radios, selected score text/underline and individual glyph
styles remain usable. RTL keeps ascending DOM order and logical half-fill direction.
Forced colors may reduce decorative fill differences, but visible numeric labels and
native checked indicators still convey the exact score. Print uses readable text/borders,
monochrome current-color decoration and native radio accents, hides the clear action, and
does not change checked values. Focusable choices are never
overflow-clipped; only the decorative half glyph is clipped.

Radio owns native-group lifetime and peer validation. Rate adds only readout/clear
attributes and text ownership; later author mutations are preserved on disposal when
still distinguishable from helper writes. No-op removal of an absent attribute is not
an observable transfer of ownership. Underlying scope errors use mui:radio-group-error;
rating-choice/format errors also expose `error`/mui:rate-error. Fix invalid markup and
refresh; no missing choice or hidden value is generated. Native controls are retained
through value updates; recreate for changed bounded choice contracts.

## Complete upstream disposition

| Upstream item | Retained adaptation or explicit omission |
| --- | --- |
| allow-half | Explicit labelled half-step native choices, not pointer half-hit zones |
| clearable, on-clear | Separate native button and mui:rate-clear; selected-star reactivation clearing omitted |
| color | External CSS color variable; no JS color prop/style injection |
| count | Bounded max score 1–10 with a complete authored choice set, no renderer |
| default-value, value | Native defaultChecked and numeric/native-string selection/null; zero is explicit |
| readonly | Static readable score with no form control; disabled interactive state is separate |
| size | Standard CSS classes and explicit CSS length token, not inline numeric prop forwarding |
| on-update:value; source onUpdateValue | Native change/Radio commit and explicit clear, not a numeric callback registration API |
| on-update:hover-value and source hover aliases | **Omitted** numeric hover-preview event/model |
| default slot | Authored safe Unicode/SVG decoration and labelled score choices |
| default.index | **Omitted** VNode renderer context/index callback; authored DOM order is explicit |
| Source theme/themeOverrides/builtinThemeOverrides, callback types and pointer half-hit calculations | **Omitted** provider/renderer/gesture contracts |

## Native prerequisites handed to Form

Use actual form.elements, native name/form association and successful controls; no hidden
proxy fields. Input has current/default strings; InputNumber distinguishes empty/badInput;
Checkbox/Switch checked/defaultChecked are not submission tokens; Radio/Rate use real
name/form/tree exclusivity; Select uses option.defaultSelected and strict scalar/array modes;
Slider pairs retain independent bounds/defaults. Read native validity on native controls,
refresh optional presentation **after native reset**, respect cancellation/disabled
fieldsets, and do not fabricate user events on validation or programmatic writes.
For user-triggered Rate unrating, observe `mui:rate-clear` in capture phase or validate
explicitly; it intentionally does not fabricate a native radio change.
Form should add native validation before remaining Auto Complete/OTP/dynamic/picker work,
not replace these controls with a schema/provider/wizard.

## Default-style acceptance — 2026-09-11

- Ten reference/native cases in light/dark covered integer/empty/sizes, half steps,
  disabled/noninteractive colors, authored SVG, overrides and static readonly artwork.
  Compared base glyph color sequences matched source for the retained cumulative states.
- 16/20/24px sizing, source gold/inactive colors and 6px choice gaps are corrected.
  SVG half geometry matched 10×20px; Unicode shape/advance and native chip layout remain
  explicit artwork differences.
- Disabled whole/individual choices no longer show false hover value fill. Native arrows,
  repeat Space, one Radio commit, explicit null clear/focus return, reset/defaultChecked,
  half submission and disabled exclusion passed without controller changes.
- High contrast/print preserved numeric labels and real checked radios. RTL retained
  ascending DOM order/logical half fill; author size/color tokens and multi-character
  readonly artwork survived. JavaScript-disabled half selection/reset/GET submission worked.
- `pnpm test -- tests\rate.test.ts tests\rate.styles.test.ts`: **38 tests passed**.
  Exact isolated level-9 ESM/classic/CSS: **3,904 / 3,976 / 1,243 bytes**, within unchanged
  **4,000 / 4,000 / 1,500** ceilings. Parent owns integrated release validation.

## Historical acceptance — 2026-09-09

The earlier sizes/colors and byte counts below predate the default-style corrections.

Local server 4188 and a dedicated Rate tab were used on 2026-09-09. This is not upstream
pointer/hover renderer, all-browser/AT or native-theme pixel parity.

- **102 targeted tests passed**: 34 Rate, 41 Radio and 27 native/legacy regressions,
  using `pnpm test -- tests\rate.test.ts tests\radio.test.ts tests\native.test.ts`.
  They cover bounded complete choices, half/zero/null, native defaults/events/required,
  strict keys, static readonly, disabled/native forms, duplicate ownership, Radio peer
  boundaries, clear/focus, error recovery and owned-state disposal.
- Chromium **151.0.7922.174** exercised native arrows/Space/labels/Tab, integer and each
  half-step choice, repeat activation without clearing, one native input/change plus
  reused Radio commit, explicit clear-only notification, focus recovery, zero versus
  absent FormData, required-group validity, changed/cancelled reset and native defaults.
  The selected half glyph measured 26.66px with a 13.33px decorative clipped fill; the
  actual radio stayed visible/focusable and was named “2.5 of 3”.
- Static readonly had no controls or submitted field; disabled interactive score retained
  its value but was not submitted. External form ownership/changed IDs and outside native
  peer rejection preserved Radio's native rules. No extra keyboard/geometry engine was
  introduced to bypass the existing Radio/jsdom caveats.
- Ascending DOM score order remained unchanged under RTL. 360px and 200% **CSS zoom**
  had no overflow; forced colors retained native check indicators and explicit numeric
  labels, and reduced-motion/print checks retained actual controls. This is not a
  browser-UI zoom, every-platform glyph or assistive-technology speech certification.
- JS-disabled Chromium retained native integer/half keys, defaults and real local GET
  submission; clear/readout enhancements stayed hidden. ESM/classic/native Radio
  duplicate guards passed. Both core/widgets loading orders and an actual legacy
  mui-rating changing 2 → 3 coexisted with the new native group.

`pnpm build` passed TypeScript and every existing/new ceiling. Rate imports/reuses the
existing Radio implementation but does not modify its source or output. No dependency was
added. Concise validation messages kept the combined optional helper within its new budget.

| Optional asset | Raw bytes | Gzip bytes | Gzip ceiling |
| --- | ---: | ---: | ---: |
| `markup-ui-rate.js` | 10,507 | 3,904 | 4,000 |
| `markup-ui-rate.global.js` | 10,661 | 3,976 | 4,000 |
| `markup-ui-rate.css` | 3,836 | 1,097 | 1,500 |

CSS-only native choices/static readonly cost **1,097 gzip bytes**. One complete helper
format (including Radio) plus CSS is **5,001 ESM / 5,073 classic gzip bytes**. All **142
previous top-level JS/CSS assets are SHA-256 byte-identical**; core/advanced/widgets remain
**14,611/2,181/2,779 gzip bytes** under unchanged **15,000/3,000/4,000** ceilings.

All **13 original identities** remain plus six source supplements: **19 rows = 13 adapted
targets + six omissions**. Totals are **3,554 rows and 244/384 accepted tasks across 61
pages**; edited file links pass. P4-04's declared native InputNumber/Slider/Rate scopes are
complete, not overall P4. **Next Form native validation**, then remaining
Auto Complete/OTP/dynamic/picker routes.
