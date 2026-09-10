# Checkbox and CheckboxGroup: native checkedness

**🟢 Verified for the retained native Checkbox/CheckboxGroup scope, not framework parity.**
Individual checkboxes are **CSS-only native inputs and labels**. Only useful group limits,
selected-string operations and aggregate notifications have an optional helper.
Legacy `MuiCheckbox` in `src/components/forms.ts` stays unchanged. No Custom Element
registration, replacement controls, hidden submission proxies or global form model.

## Loading and authored anatomy

| Asset / export | Contract |
| --- | --- |
| `@dataengine/markup-ui/checkbox/style.css` | External `dist/markup-ui-checkbox.css`; works without JS |
| `@dataengine/markup-ui/checkbox` | ESM `createCheckboxGroup` and group options/controller/state/change types |
| `dist/markup-ui-checkbox.js` | Self-contained optional ESM |
| `dist/markup-ui-checkbox.global.js` | Classic `MarkupUICheckbox.createCheckboxGroup`; refuses namespace replacement |
| [Local demo](../../demo/components/checkbox.html) | Separate HTML/CSS/JS; native forms and local GET fallback only |
| [Pinned dispositions](../naive-ui/components/checkbox.md) | All 29 original identities plus 13 explicit source supplements |

```html
<label class="mui-checkbox">
  <input type="checkbox" id="consent" name="consent" value="yes" required>
  <span>Accept the terms</span>
</label>

<fieldset class="mui-checkbox-group" data-checkbox-group id="topics"
  aria-describedby="topic-rules">
  <legend>Topics</legend>
  <p id="topic-rules">With enhancement, choose between one and two topics.</p>
  <div class="mui-checkbox-group__items">
    <label class="mui-checkbox"><input data-checkbox type="checkbox"
      name="topics" value="alpha" checked><span>Alpha</span></label>
    <label class="mui-checkbox"><input data-checkbox type="checkbox"
      name="topics" value="beta"><span>Beta</span></label>
    <label class="mui-checkbox"><input data-checkbox type="checkbox"
      name="topics" value="gamma"><span>Gamma</span></label>
  </div>
</fieldset>
```

After loading one helper format and CSS, an external setup script may call:

```js
const topics = MarkupUICheckbox.createCheckboxGroup(
  document.querySelector("#topics"), { min: 1, max: 2 }
)
topics.setValues(["beta"]) // Silent; defaults and indeterminate are untouched.
const alpha = document.querySelector('#topics input[value="alpha"]')
alpha.checked = true     // Native property assignment emits no events.
topics.refresh()         // Recompute derived limit ARIA after direct writes.
alpha.defaultChecked = false // Separate native reset default.
```

There is no `createCheckbox` or `registerCheckbox`: an individual native checkbox already
supplies the needed behavior. Use `input.checked`, `input.defaultChecked`,
`input.indeterminate`, `input.focus()` and `input.blur()` directly. There is no legacy
registration-order requirement. Root/member ownership uses a nonenumerable per-element
symbol and rejects duplicate binding across ESM/classic copies, without a document registry.

An enhanced group must be a connected light-DOM
`fieldset.mui-checkbox-group[data-checkbox-group]` with a nonempty first direct native `legend`,
no replacement role and no wrapper tabindex. Each **marked** member is a real
`input[type=checkbox][data-checkbox]`, with a real native label and an explicit nonempty
unique native string `value`. No role-checkbox, generated hidden value or options renderer.
An unmarked checkbox is deliberately outside the helper; it still participates in native
HTML forms. Native labels may wrap the input or use `for`; do not put unrelated interactive
content in the same label. The CSS example uses a direct input child and an authored span.

Group identity is the nearest `[data-checkbox-group]` ancestor, **not the `name` attribute**.
Nested marked groups are independent, may reuse keys and keep their own events/limits.
Outer native fieldset disabling still has its normal effect on nested controls. Template
contents are not live members until the application clones them into the document.

## Native state, names and reset

The native input owns checked/defaultChecked, indeterminate, value/name/form, labels,
keyboard/pointer activation, required and disabled behavior. The helper never writes checked
during ordinary click/input/change handling. Space and label activation remain native;
there is no Enter-to-toggle synthesis, click forwarding, focus trap or custom mixed role.
Checkbox has **no native readonly behavior**; use native disabled where disabling is intended.

- `.checked` and `.defaultChecked` are **booleans**, not arbitrary checked/unchecked
  payload tokens. `checked` HTML/defaultChecked establishes the native reset default.
- `input.value` is a **string** submitted when checked and successful. Unchecked controls
  are absent from FormData; no hidden field submits an unchecked token. Names may be
  repeated for native multi-value submission or omitted for intentionally nonsubmitting
  controls. Group keys and native submission names are separate.
- `.indeterminate` is presentation independent of checkedness. A checked mixed checkbox
  submits its normal value; an unchecked mixed checkbox does not submit. There is no
  third submitted value and no HTML `indeterminate` attribute. Set the property explicitly
  when needed. Native user activation clears mixed state; a cancelled native activation
  restores the old checked **and mixed** state.
- Native form reset restores checkedness from defaultChecked but does **not** reset
  indeterminate. Neither the helper nor its setters invent a mixed reset default.
- Native disabled and disabled-fieldset/first-legend semantics are preserved. Selected
  disabled members remain in group selected values and counts, while native FormData
  correctly excludes them. Hidden-but-checked native members still count/submit, matching
  HTML rather than silently filtering by visual appearance.

Groups may contain controls associated with different external forms. Each member's
current `.form` governs its reset/submission, not containment. A document capture reset
listener schedules a refresh **after the native default action**, including cancellation.
Changed form IDs/`form=` ownership are reread; only the browser changes checkedness.
Cancelled resets do not change state. DefaultChecked changes, reset and helper refresh
never fabricate user input/change/group-change events.

## Group API, bounds and events

| API | Behavior |
| --- | --- |
| Options `min`, `max` | Nonnegative safe integers; max ≥ min; defaults 0 and null (unlimited) |
| `state` | Fresh `{ values: string[], min, max, withinLimits }`, in current DOM order, including disabled selected members |
| `connected`, `error` | Lifetime and latest automatic refresh error message or null |
| `setValues(strings)` | Silent explicit checked-state write; unique existing string keys required; unknown/duplicate/numeric/null keys throw, not silently ignored |
| `setLimits({ min?, max? })` | Validated partial update, silent; `max: null` removes the upper bound |
| `refresh()` | Validate/reconcile original and late authored members, keys and derived limit ARIA; invalid anatomy/keys throw |
| `disconnect()` | Idempotent disposal; releases roots/members, observers/listeners/tasks and only still-owned derived ARIA; checked/default/mixed/value/disabled stay native |

Setters do not modify defaultChecked or indeterminate and do not invoke `.click()`.
Programmatic values, reset defaults, empty groups and changed bounds may legitimately be
outside min/max: **no clamping or automatic checkbox changes**. `state.withinLimits`
reports that condition. Even an empty group with min > 0 is representable; authors are
responsible for reachable bounds and for whatever validation their application requires.

Min/max are **interaction limits, not native required-group validation**. The helper
blocks checking beyond max and unchecking below min; while out of bounds, it allows
steps toward the valid range. It does not set native `required`, custom validity,
aria-invalid or a live error message, and does not intercept form submission. Putting
`required` on every checkbox means every checkbox must be checked, **not “at least one”**.
Use native required for a single consent checkbox; an application may separately inspect
`withinLimits` and provide its own group validation/message.

At a limit the helper derives **`aria-disabled="true"`**, but never native `.disabled`.
Disabling selected native controls to enforce min would incorrectly remove them from
submission. These limited controls remain keyboard-focusable and keep browser focus.
The ARIA is **not the enforcement mechanism**: a capture-phase native input click handler
sees the browser's pre-activated proposed checkedness and calls `preventDefault()` when
forbidden. Browser rollback restores both checked and indeterminate. The helper does not
toggle either property back itself. Native `.click()`, pointer, Space and forwarded label
activation share this path; a later author cancellation is respected too.

Noncancelable synthetic clicks cannot be vetoed by a DOM listener; they are not a supported
user interaction mechanism. Use silent native properties/`setValues` for programmatic
state, not artificial click events. Group limits are not an application security boundary.
Preexisting or subsequently authored `aria-disabled="true"` is respected as an interaction
restriction while bound, but still does not change native submission; prefer native
disabled for durable authored disabling.

One accepted native change produces a next-task, **nonbubbling**
`mui:checkbox-group-change` on that group root. Its snapshot is
`{ values: string[], value: string, actionType: "check" | "uncheck" }`, taken when the
member's native change reaches the group. The original native input/change are neither
stopped nor replaced. A forbidden/cancelled toggle emits neither native edit events nor
group change. A caller explicitly dispatching a bubbling native change requests group
observation too. Stopping that native event's propagation stops group observation.
Disconnect cancels queued custom notifications; later silent writes do not turn an
already accepted user-change snapshot into a programmatic change event.

## Refresh, author changes and lifecycle

Direct `.checked` assignment is **not MutationObserver-observable**. The native checkmark
updates immediately; call refresh for derived limit ARIA. The state getter reads current
native fields, and click enforcement rereads the actual proposed state even without an
intervening refresh. Direct `.indeterminate` updates browser appearance without helper work.
Checkbox `.value` and defaultChecked reflect attributes and can be observed, unlike
Input's ordinary current `.value`.

Local structural/attribute observation handles late children, removed members, changed
keys and default/disabled/form attributes. `refresh()` is also available synchronously.
Reordering retains identity and returns DOM-order values. A removed member releases
its group owner and temporary ARIA. Removing the group disconnects it; recreate explicitly
to reconnect. Same-document moves can retain the existing owner.

Invalid late keys/anatomy are not silently accepted: explicit refresh/state/setters throw.
Automatic refresh/activation errors set `error` and dispatch nonbubbling
`mui:checkbox-group-error` with `{ message }` when the error changes. Invalid group input
activation is cancelled until the DOM is fixed; valid refresh clears `error`.
The last valid member ownership remains until a successful reconciliation or disconnect.
Native form submission itself is never turned into a validation framework.

The helper temporarily owns only member `aria-disabled` and private owner symbols.
Mutation records are consumed before helper writes, including same-value author ARIA
updates; disposal restores only still-owned values. It never removes author labels,
listeners, classes, descriptions, validation state, name, checked, mixed or disabled.
Input's reversible ownership/post-native-reset/explicit-refresh conventions are reused,
but no shared runtime or Input source modification was needed.

## CSS and all upstream mappings

Native checkbox rendering and `accent-color` remain intact; no appearance:none, custom
checkmark SVG, role substitution or global input reset. `.mui-checkbox` styles the label
layout; `.mui-checkbox-group__items` wraps children. `data-size="small|medium|large"`
on an individual label or group sets explicit inherited CSS sizes (medium default).
The native boxes are **14/16/18px** and the label fonts **14/14/15px**, respectively.
Labels use 1.6 line-height, an 8px text gap and 8px trailing space; boxes align with
the first label line, including multiline labels. Top inline alignment avoids additional
native-control baseline space beneath the label. Explicit medium resets an inherited
small size, while inherited public sizing tokens still take precedence.
Optional group `data-status="warning|error"` changes its border only; include author status
text where useful, never infer schema validity. Logical spacing, focus-visible rings,
hidden safety, forced colors, print and wrapping are external CSS. No animation is added,
so reduced motion requires no runtime. Native checked/mixed visuals follow browser/platform.

Tokens: `--mui-checkbox-color`, `-font`, `-size`, `-accent`, `-focus`, `-disabled`, `-border`
(all share the `--mui-checkbox` prefix). No provider/theme-object/CSS-in-JS translation.
An ancestor `data-mui-theme="light|dark"` selects the native color scheme; standalone
controls default to light. Size/status/theme defaults use private variables and never
overwrite public tokens. Neutral label colors use local reference-matched fallbacks,
not legacy shared neutral roles; the default accent reuses the shared primary role.
`-focus` colors the 2px keyboard-focus ring, with an explicit system outline in forced
colors. It does not recolor the browser's native checkbox border or tick.

The [default-style audit](../style-audit/components/checkbox.md) records exact geometry,
computed styles and rendered pixel evidence. **Native skin is intentionally retained**:
unchecked/hover borders, disabled fills, tick/mixed glyphs and mark contrast cannot be
made identical to Naive's drawn checkbox through `accent-color`. No hidden native input,
replacement role, copied SVG or synthetic keyboard handling is introduced for parity.
The native fieldset/legend envelope also remains: 12px padding, 3px corner radius and
a subtle boundary, rather than Naive's bare group `div`. Items now use the label's own
spacing instead of an additional flex gap. Group limit `aria-disabled` still preserves
native checked-value submission and does not apply native-disabled label paint.

| Upstream owner/property | Retained adaptation or omission |
| --- | --- |
| Checkbox `checked`, `default-checked`, `indeterminate` | Native boolean/current/default/mixed properties, independently owned |
| Checkbox `disabled`, `label`, `value` | Native disabled, label and string value; no boolean/payload coercion |
| Checkbox `size` | Explicit external CSS sizes |
| Checkbox `on-update:checked`, source `onUpdateChecked` | Native change listener reading `.checked`; no duplicate custom checkbox event |
| Checkbox `checked-value`, `unchecked-value` | **Omitted** arbitrary string/number/boolean state-token protocol; native checked string submission remains |
| Checkbox `focusable` | **Omitted** wrapper focusability prop; native focus/tabindex remain authored; no Enter toggle emulation |
| CheckboxGroup `disabled`, `default-value`, `value` | Native fieldset disabled, per-member defaultChecked, and selected existing native strings/setValues |
| CheckboxGroup `min`, `max` | Interaction bounds described above, not group validity |
| CheckboxGroup `on-update:value`, inline `.actionType`/`.value`, source `onUpdateValue` | Root group-change snapshot with check/uncheck action and string key |
| CheckboxGroup `options`, `label-field`, `value-field` | **Omitted** options renderer/field lookup; author controls directly |
| CheckboxGroup `options.label?`, `.value`, `.disabled?` | Authored label, explicit string key, native disabled; no options-array API implied |
| Both owners' `default` slots | Authored label/group content, preserved identity; no renderer |
| Checkbox `focus`, `blur`; source `CheckboxInst` | Native input methods |
| Source Checkbox `CheckboxSize`, CheckboxGroup `size` | Three CSS sizes, no Form/provider inheritance |
| Source Checkbox checked/defaultChecked string-number expansion and `OnUpdateChecked`/`OnUpdateCheckedImpl` | **Omitted** arbitrary typed state/payload and MouseEvent/KeyboardEvent callback protocol |
| Source Checkbox/CheckboxGroup deprecated `onChange` | **Omitted** aliases; use native change/root group-change |
| Source Checkbox `privateInsideTable`, `theme`/`themeOverrides`/`builtinThemeOverrides` | **Omitted** private table and theme/provider hooks |
| Source `CheckboxGroupOption` including optional value/index signature; `CheckboxGroupInjection`/`checkboxGroupInjectionKey` | **Omitted** object renderer/injection/ref graph |

## Acceptance

### Original native-contract acceptance (historical)

Obtained locally on 2026-09-09, server 4188, dedicated Checkbox tab. The retained scope
does not claim all-browser/AT, native OS theme pixel parity, framework models or Form-level
validation. The sizes and asset bytes below describe that original revision.

- **124 targeted tests passed**: 45 Checkbox, 52 Input and 27 native regressions, using
  `pnpm test -- tests\checkbox.test.ts tests\input.test.ts tests\native.test.ts`.
  Coverage includes original controls/content/listeners/defaults/mixed state, strict keys,
  duplicate/cross-module owners, nested/empty/late/refreshed groups, changing bounds,
  disabled selected members, authored ARIA, cancelled clicks/reset, external forms,
  error reporting and disposal.
- `pnpm build` passed TypeScript and all existing/new byte ceilings, with no dependency
  changes or installs. Legacy forms.ts, Input and prior component/helper sources are unchanged.
- Chromium **151.0.7922.174** exercised actual Space, label/pointer activation, checked/mixed
  native pre-activation rollback at min/max, native input/change plus one deferred group
  event, silent setters, changed defaultChecked/reset/cancellation, per-control external
  forms including changed IDs, nested groups and keys, late template clones/refreshed
  values, native required consent, FormData and submission, disabled fieldsets/first legend,
  focus/Tab, native mixed reset behavior, disposal and continued native interaction.
  A forced pointer action bypassed Playwright's ARIA actionability guard to verify that the
  **browser helper itself**, not the test tool, actually prevented forbidden toggles.
- RTL at 360px and 200% **CSS zoom** had no horizontal page overflow after fixing the
  demo heading's long-word wrapping. Explicit medium size overrides inherited small
  (18px versus 16px native boxes). Forced colors retains native appearance/auto accent;
  reduced-motion context and print/native-control presence passed. This is not browser-UI
  zoom or universal native theme screenshot parity.
- A separate JS-disabled Chromium context verified label activation with no group bounds,
  native reset and real local GET submission of checked values only. Standalone ESM,
  cross-format duplicate-owner rejection, and both legacy-before-helper and
  helper-before-legacy loading preserved authored controls/pre-enhancement checked state.

Review also fixed immediate invalid-change error reporting and first-legend naming checks;
no replacement state machine or synthetic checkbox toggle was added.

| Optional asset | Raw bytes | Gzip bytes | Gzip ceiling |
| --- | ---: | ---: | ---: |
| `markup-ui-checkbox.js` | 5,410 | 2,171 | 3,500 |
| `markup-ui-checkbox.global.js` | 5,576 | 2,246 | 3,500 |
| `markup-ui-checkbox.css` | 2,419 | 741 | 1,000 |

Standalone Checkbox needs **741 gzip bytes of CSS and no JS**. Enhanced groups load one
JS format plus CSS: **2,912 ESM / 2,987 classic gzip bytes**. All **124 previous top-level
JS/CSS outputs were SHA-256 byte-identical**; core/advanced/widgets remain
**14,611/2,181/2,779 gzip bytes**, with unchanged **15,000/3,000/4,000** ceilings.

The local documentation audit preserves all **29 original Checkbox identities** and
resolves **42 rows (28 adapted, 14 omitted)**. The catalog has **3,488 colored rows across
96 pages and 220/384 accepted tasks across 55 pages**; edited local file links pass.
P4 is still In progress. **Next Radio**, then Switch/Select/native controls before Form.

### Default-style audit, 2026-09-10

**49 Checkbox-only tests passed**: all 45 original native cases plus four CSS regressions.
Isolated Chromium comparison covered unchecked/checked/indeterminate in all three sizes,
disabled variants, hover/focus, long labels, groups and inherited group sizes in light/dark.
Actual screenshot pixels confirm matching checked accents and explicitly document the
remaining native-skin differences, rather than inferring native fill from computed CSS.

Browser checks passed for Space/input/change order, label activation, cancelled mixed
activation, min/max rollback and FormData, reset retaining native indeterminate, disabled
fieldset/first-legend paint, explicit child sizing and every public color/sizing token.
Forced colors, print, RTL at 360px/200% CSS zoom and no-JS label/reset checks passed.
No browser-engine, operating-system or assistive-technology certification is implied.

Existing isolated esbuild recipes and gzip level 9 produced:

| Asset | Raw bytes | Gzip bytes | Unchanged ceiling |
| --- | ---: | ---: | ---: |
| `markup-ui-checkbox.js` | 5,410 | 2,171 | 3,500 |
| `markup-ui-checkbox.global.js` | 5,576 | 2,246 | 3,500 |
| `markup-ui-checkbox.css` | 3,215 | 989 | 1,000 |

The CSS source is readable and already CRLF; a normalized CRLF checkout measures the
same bytes. CSS-only Checkbox costs **989 gzip bytes**. Enhanced groups cost **3,160
ESM / 3,235 classic gzip bytes** including CSS. JavaScript is unchanged; no full build,
shared/generated file updates, dependency additions, commit or push were performed.
