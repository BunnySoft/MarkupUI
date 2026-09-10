# Switch: one native binary control

**🟢 Verified for the retained native Switch scope, with explicit omissions.**
The actual `input[type=checkbox][role=switch]` owns checkedness, focus, labels and forms.
External CSS paints its rail/thumb. The optional helper adds only focus-safe loading,
strict boolean convenience setters and reversible enhancement state.
Legacy `MuiSwitch`/`MuiCheckbox` in `src/components/forms.ts` remain unchanged.

## Loading and authored anatomy

| Export / asset | Contract |
| --- | --- |
| `@dataengine/markup-ui/switch/style.css` | External `dist/markup-ui-switch.css`; native Switch works without JS |
| `@dataengine/markup-ui/switch` | ESM `createSwitch`, `SwitchController`, `SwitchOptions` |
| `dist/markup-ui-switch.js` | Self-contained optional ESM |
| `dist/markup-ui-switch.global.js` | Classic `MarkupUISwitch.createSwitch`; refuses namespace replacement |
| [Local demo](../../demo/components/switch.html) | Separate HTML/CSS/JS; native forms, explicit loading, no network task |
| [Pinned dispositions](../naive-ui/components/switch.md) | All 23 original identities plus eight explicit source supplements |

```html
<label class="mui-switch" data-switch id="alerts-switch">
  <input data-switch-control type="checkbox" role="switch"
    name="alerts" value="enabled" checked aria-labelledby="alerts-label">
  <span class="mui-switch__label" id="alerts-label">Email alerts</span>
  <span class="mui-switch__state" aria-hidden="true">
    <span class="mui-switch__on">On</span>
    <span class="mui-switch__off">Off</span>
  </span>
  <span data-switch-loading hidden aria-hidden="true">Working…</span>
</label>
```

An external setup script, after one helper format and CSS, may use:

```js
const alerts = MarkupUISwitch.createSwitch(document.querySelector("#alerts-switch"))
alerts.setLoading(true)  // Does not blur, hide or natively disable the control.
alerts.setChecked(false) // Silent programmatic update is still allowed while loading.
alerts.setLoading(false)
```

ESM consumers import `createSwitch`. There is no custom-element registration or
`mui-*` loading-order rule. Root/input symbols prevent duplicate ownership across
classic/ESM copies; no global form registry is created.

An enhanced root is a connected light-DOM `.mui-switch[data-switch]`, without wrapper
role or tabindex. It contains exactly one **direct** authored `input[data-switch-control]`
of type checkbox with role switch. The input has a real native label (wrapping or `for`)
and a **stable `aria-label` or resolved `aria-labelledby`** separate from visual state
content. Do not add `aria-checked`: the native checked property supplies that state.
Do not nest the component in another label, button, link or summary.

Optional direct `.mui-switch__state` and `[data-switch-loading]` children must be
`aria-hidden="true"` and noninteractive, without roles/tabstops/nested controls.
Visual on/off labels and icons must not rename the setting or duplicate its accessible
checked state. The helper never changes the authored accessible name or decoration text.
Hide the loading indicator in baseline HTML. There are no generated controls, duplicate
hidden values, proxies, templates or arbitrary HTML render callbacks.

Without enhancement, omit `data-switch`; CSS/native controls remain usable. Server-authored
disabled is a native no-JS disabling mechanism. Merely showing a loading word or ARIA is
not a no-JS activation guard.

## Boolean state is not a submitted token

| Native/API state | Meaning |
| --- | --- |
| `control.checked` | Native boolean current on/off state |
| `control.defaultChecked` / checked HTML | Native boolean reset default |
| `control.value`, `control.defaultValue` | **Submission strings**, never checked/defaultChecked aliases |
| `control`, `connected`, `error` | Original input, lifetime and latest validation error |
| `loading` | Effective loading after refresh: local requested loading **or** authored aria-busy=true |
| `setChecked(boolean)` | Silent native checked write; no default or submitted string change |
| `setLoading(boolean)` | Silent requested loading update; no checked/default change |
| `refresh()` | Validate fixed anatomy/binary state and update owned busy/indicator attributes |
| `disconnect()` | Idempotent cleanup; restores only still-owned temporary attributes and releases owner symbols |

For example, changing `input.defaultValue = "new-token"` changes the submitted string,
not whether the switch is on. `setChecked(false)` leaves defaultChecked unchanged.
Unchecked controls are **absent** from FormData. Checked successful controls submit their
native string once. No hidden unchecked value, numeric/boolean token protocol or source
`value` model is introduced. Setters reject nonbooleans rather than coercing `"false"`.

Native constraints, name, form association, disabled and disabled-fieldset/first-legend
semantics remain native. Programmatic checked writes are allowed while disabled/loading;
user actions are not. A native required switch must be on to satisfy its checkbox
constraint. The helper does not install Form validation or stop whole-form submission.

**Switch has no mixed state.** Initial indeterminate state, explicit refresh and setters
encountering `control.indeterminate === true` reject it. Clear that native property before
continuing. `.indeterminate` cannot be MutationObserver-observed; arbitrary direct mixed
writes without refresh are outside this binary contract, not a third supported value.
The helper never silently converts or submits mixed state. The custom rail applies only
to non-indeterminate controls; invalid mixed input falls back to native checkbox painting.

**Readonly is not a Switch feature.** Native checkbox readonly does not prevent toggles;
the enhancement rejects it rather than claiming text-input readonly semantics. Use native
disabled for durable disabling or loading for temporary focus-safe blocking. A CSS-only
checkbox still follows the browser's ordinary behavior if an author supplies readonly.

## Loading, focus and native event order

Effective loading writes `aria-busy="true"` and `aria-disabled="true"` on the **actual input**
and reveals the optional authored loading indicator. It never sets native disabled or
hidden on that input, never moves focus and never changes checkedness or default state.
Thus a focused switch remains focusable and a busy checked switch remains a successful
native form value. Application code owns any whole-form pending/submit policy.

ARIA is not the enforcement mechanism. A capture-phase **native click** listener samples
effective loading, author aria-disabled and native disabled state, then cancels forbidden
activation with `preventDefault()`. Checkbox pre-activation already proposed a toggle;
the **browser** rolls it back. The helper does not flip checked back, synthesize clicks,
intercept Space/key events, or add a second toggle engine. Label/pointer/Space share the
same native path. Starting loading in a later accepted change handler does not retroactively
undo that already accepted selection; a later click listener can cancel its own event.
Noncancelable synthetic clicks are not a supported user interaction mechanism.

Successful user activation emits the original native `input` and `change` once, with the
native boolean on `event.target.checked`. Blocked/cancelled toggles emit neither. There is
no additional `mui:change`/`mui:switch-change` notification. Setters, refresh, reset and
loading transitions fabricate no user changes. Loading is a boolean policy, **not** async
networking, request cancellation, promise handling or a Spin dependency.

Preexisting/later authored `aria-busy="true"` is an independent loading reason. Clearing
the helper's requested flag cannot override it; remove/change the author's busy attribute
and refresh to release that reason. Authored `aria-disabled="true"` also blocks activation
while bound, but does not change native submission. Native disabled is always author-owned.

The helper temporarily owns only aria-busy/aria-disabled and the loading indicator's hidden
attribute. Outside mutation records are consumed before helper writes. Disposal restores
only still-owned state, preserving later author changes, checked values, role, names,
labels, descriptions and native disabled. Setting an existing attribute to the same value
is observable; removing an already absent attribute is a native no-op, not an observable
transfer of ownership. Disconnect before taking full ownership of a managed decoration.

Fixed anatomy means disconnect/recreate for replacements. Root/control removal disconnects
automatically. Invalid role, mixed/readonly state, naming or decoration contracts throw on
explicit refresh/setters; automatic validation errors set `error` and emit nonbubbling
`mui:switch-error` with `{ message }` when the message changes. Correct the native state
and refresh to recover. No automatic live announcement or schema validation is added.

## Reset and direct properties

The input owns all editing/form state. Direct `.checked` assignments are silent and cannot
be observed by MutationObserver. Native CSS and accessible checked state update immediately;
call refresh to validate/update helper decorations after application property changes.
Attribute changes are observed, including native defaultChecked/value/disabled/form.

A document capture reset listener checks the control's current `.form`, then refreshes
in a task **after native reset default handling**. Changed defaults, cancelled resets,
external form association and changed form IDs remain native. Reset never ends an owned
loading request; the application must clear it explicitly. The helper does not rewrite
current/default values, change author roles or introduce reset-only payload fields.

## External CSS, labels and icons

The baseline is a visible native checkbox with accent-color. Where appearance/gradient
support is available, **the same input box itself** paints a rail and background-image
thumb. It is never display:none, transparent over a proxy, replaced by a role-switch span,
or removed from focus/hit testing. Focus remains on that input: the custom skin uses
a focus ring/glow, while native fallback uses a visible outline.
Forced colors and print deliberately return to native checkbox painting and keep the
authored switch semantics.

- `data-size="small|medium|large"` sets **32×18 / 40×22 / 48×26px** rails and
  **14/18/22px** thumb images; medium is default. Labels/state text default to 14px
  in the retained system font stack, with an 8px label gap.
- Rounded rail/thumb is default; `data-square` uses a squared rail and thumb.
- `:checked`, `:focus`, `:focus-visible` and inherited `:dir(rtl)` own state/focus/direction.
  The thumb moves to the logical checked side. Loading adds a dashed border plus the
  authored indicator; native disabled remains separate.
- `.mui-switch__on` / `__off` and `__checked-icon` / `__unchecked-icon` inside the
  aria-hidden state region switch through native checked selectors. `__icon` is common
  static decorative content. Icons are adjacent decorations, not inserted inside a void
  HTML input/thumb; author either common or state-specific content. No upstream slot
  fallback/precedence renderer is claimed.
- Optional `data-status="warning|error"` changes border presentation, not validity/ARIA.
- Rubber-band pressing, drag/gesture handling and icon/Spin transition engines are omitted.
  No animation is introduced, so reduced motion needs no JS or animation override.

Tokens (all share `--mui-switch`): `-color`, `-font`, `-width`, `-height`, `-thumb-size`,
`-thumb`, `-thumb-image`, `-rail`, `-active`, `-border`, `-radius`, `-focus`, `-disabled`.
Use external selectors/tokens instead of rail-style callbacks, inline style objects or
CSS-in-JS. There is no global control reset or provider/theme dependency.

The [default-style audit](../style-audit/components/switch.md) records actual geometry,
paint, thumb pixels and native-policy checks. An ancestor `data-mui-theme="light|dark"`
selects the scheme; standalone controls default to light. Size/square/status defaults
use private variables, so public author tokens remain authoritative. The thumb image
uses the border box as its origin, keeping the default 2px edge inset independent of
the transparent border retained for authored status/loading boundaries.

The light active rail follows the shared primary role; the dark default is the pinned
Switch supplementary primary **#2a947d**, not the ordinary dark primary **#63e2b7**.
Use `--mui-switch-active` to override it. Unchecked rails use black 14% / white 20%.
Normal disabled **input** opacity is .5 in both schemes, matching the rendered reference;
loading alone does not dim or natively disable it. Forced colors and print restore native
appearance, background/box-shadow removal and opacity 1, with a system focus outline.
No animation or transition is added, including under reduced motion.

The gradient thumb does not reproduce the reference's independent drop/inset shadows.
`data-square` retains a flat square thumb rather than Naive's separately rounded knob.
State text/icons and loading text stay authored adjacent decorations, not content
inserted into a void input: no content-measurement mirror, thumb slot or spinner renderer
was added. The rail therefore does not automatically widen for On/Off text.

## Complete upstream disposition

| Upstream item | Retained mapping or explicit omission |
| --- | --- |
| `value`, `default-value` | Native **checked/defaultChecked**, not native value/defaultValue; strict boolean state only |
| `checked-value`, `unchecked-value` | **Omitted** arbitrary model/payload token protocol; native checked string submission and unchecked absence remain |
| `disabled`, `loading` | Native disabled and explicit focus-safe loading helper, with independent form semantics |
| `rail-style`, `.focused`, `.checked` | External CSS tokens/native focus/checked selectors; callback/style-string generation omitted |
| `round`, `size` | Default round / data-square and three explicit CSS sizes |
| `rubber-band` | **Omitted** pressing/stretch behavior; no gesture engine |
| `spin-props` and `.strokeWidth?`, `.stroke?`, `.scale?`, `.radius?` | **Omitted** spinner configuration; authored loading text/icon needs no dependency |
| `on-update:value`, source `onUpdateValue` | Native change listener reads checked; no duplicate framework callback event |
| Slots `checked`, `unchecked`, `icon`, `checked-icon`, `unchecked-icon` | Authored aria-hidden text/decorations and native CSS selectors, with a separate stable accessible setting name |
| Source `defaultValue` string/number expansion | **Omitted** wider state tokens; source differs from public boolean default table |
| Source deprecated `onChange` | **Omitted** alias; native change instead |
| Source `theme`, `themeOverrides`, `builtinThemeOverrides` | **Omitted** provider/theme-object/CSS-in-JS integration |
| Source `SwitchSize` | Three CSS sizes |
| Source `SwitchSpinProps`, `OnUpdateValue`/`OnUpdateValueImpl`, `SwitchSlots` | **Omitted** internal spinner alias, typed model callback and VNode-slot types |

## Acceptance

### Original native-contract acceptance (historical)

Evidence is from the local 4188 server and dedicated Switch tab on 2026-09-09.
This is not universal browser/AT/native-theme parity, an async service or Form validation.
The dimensions and asset sizes below describe that original revision.

- **163 targeted tests passed**: 39 Switch, 45 Checkbox, 52 Input and 27 native regressions,
  using `pnpm test -- tests\switch.test.ts tests\checkbox.test.ts tests\input.test.ts
  tests\native.test.ts`. Cases cover identity, strict binary anatomy, mixed/readonly
  rejection, current/default/submission distinction, busy rollback, author attributes,
  external form reset, native constraints, duplicate owners and lifecycle disposal.
- Chromium **151.0.7922.174** exercised actual label/pointer/Space toggles and loading
  cancellation, unchanged focus and successful checked submission while busy, one native
  input/change sequence, direct/silent checked writes, changed submission defaultValue,
  native defaultChecked/reset/cancellation, fieldset/first legend, external form/renamed
  IDs, required, FormData, mixed/readonly errors, and post-disposal native operation.
  Forced pointer actions bypassed Playwright's ARIA actionability guard to verify the
  helper itself blocked native label activation.
- A Chromium **accessibility-tree** probe reported one role switch named “Email alerts”,
  focusable/focused while loading, busy and aria-disabled, with checked **true → false**
  while its accessible name remained fixed. This is obtained browser-tree evidence,
  not a claim about speech output or every assistive technology.
- Rail CSS checks verified the actual input's dashed busy border and logical RTL thumb
  positions (LTR on: `calc(100% - 2px)`, RTL on: `2px`, RTL off: `calc(100% - 2px)`).
  Narrow 360px RTL and 200% **CSS zoom** had no page overflow. Forced colors and print
  restored native input painting; reduced-motion context had no animations/transitions.
  Removing optional appearance rules preserved native fallback (a simulated CSS-support
  reduction, not an old-engine certification).
- JS-disabled Chromium verified native Switch/Space, hidden loading text, reset and real
  local GET submission with no unchecked/external/disabled duplicates. Standalone ESM,
  cross-format duplicate ownership and both legacy loading orders retained native state.

Review corrected rail focus/loading/RTL selector precedence and tested real author
attribute mutations instead of treating a no-op absent hidden removal as observable.
`pnpm build` passed TypeScript and every existing/new budget. No dependencies were installed
or changed; prior Input/Checkbox/Radio/shared/legacy sources remain untouched.

| Optional asset | Raw bytes | Gzip bytes | Gzip ceiling |
| --- | ---: | ---: | ---: |
| `markup-ui-switch.js` | 5,513 | 2,268 | 3,500 |
| `markup-ui-switch.global.js` | 5,673 | 2,343 | 3,500 |
| `markup-ui-switch.css` | 4,055 | 1,119 | 1,250 |

CSS-only Switch costs **1,119 gzip bytes**. One loading-helper format plus CSS costs
**3,387 ESM / 3,462 classic gzip bytes**. All **130 previous top-level JS/CSS assets are
SHA-256 byte-identical**; core/advanced/widgets remain **14,611/2,181/2,779 gzip bytes**
under unchanged **15,000/3,000/4,000** ceilings.

All **23 original identities** remain plus eight source supplements: **31 rows = 17
adapted targets + 14 omissions**. The catalog now has **3,510 rows and 228/384 accepted
tasks across 57 pages**. Edited relative file links pass. P4-02's Checkbox/Radio/Switch
retained scopes are complete; P4 overall remains In progress. **Next Select.**

### Default-style audit, 2026-09-10

**44 Switch-only tests passed**: all 39 original native cases plus five CSS regressions.
Private Chromium comparison covered three sizes, checked/unchecked, disabled, focus/
hover, square rails, authored state text/icons and loading in light/dark. Actual PNG
samples confirmed corrected rail colors and thumb placement, with shadow/slot differences
documented rather than hidden behind an exact-parity claim.

Real keyboard/native event ordering, loading rollback/focus/submission, boolean setters,
reset/default submission strings, cancellation, mixed fallback and fieldset/first-legend
checks passed. The browser accessibility tree retained one input role switch named
“Email alerts”, focused and busy, while checked changed true→false. Public sizing,
color, radius, border, focus and thumb-image overrides were verified.

Forced-colors and print probes covered checked/unchecked, explicit/fieldset disabled,
enabled and busy inputs in both schemes: native appearance, opacity 1 and visible
system focus were retained. Normal opacity returned to .5; reduced/no-preference motion
contexts both had zero animations and 0s transitions. RTL positioning, 360px/200% CSS zoom
and no-JS Space/state-text/reset/FormData also passed. These are Chromium observations,
not all-engine, OS animation or assistive-technology certification.

| Isolated asset | Raw bytes | Gzip level 9 | Unchanged ceiling |
| --- | ---: | ---: | ---: |
| `markup-ui-switch.js` | 5,513 | 2,268 | 3,500 |
| `markup-ui-switch.global.js` | 5,673 | 2,343 | 3,500 |
| `markup-ui-switch.css`, working LF | 4,188 | 1,243 | 1,250 |
| Same CSS, CRLF checkout | 4,189 | 1,246 | 1,250 |

Source CSS uses equivalent whitespace/private-name compaction; native fallback, loading,
hidden, disabled and motion policies were not removed for the ceiling. CSS-only Switch
costs **1,243 gzip bytes**; enhanced totals are **3,511 ESM / 3,586 classic** (**3,514 /
3,589** with CRLF). JavaScript and all shared/generated files are unchanged. No full
release build, dependency addition, commit or push was performed.
