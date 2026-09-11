# Collapse / CollapseItem native-disclosure style audit

## Pinned demo parity page — 2026-09-11

The runnable page now mirrors all eleven pinned cases: Basic, Arrow placement, Accordion,
Nested, Display directive, Click on item header, Customize icon, Default expanded,
Extra info in header, Disabled and Trigger areas. Every case has an icon-only highlighted
code view.

Chromium 152 confirmed 14 independently owned native groups with zero console errors.
Accordion opening closes the previous item, header activation reports actual key/state,
disabled summary activation is blocked, and extra controls act without changing disclosure.

Two gaps remain visible:

- native details retains content like source `display-directive="show"`; `if` requires the
  proposed conditional template/lifecycle engine;
- native summary owns main/arrow activation while extra siblings are independent;
  arbitrary main/arrow/extra trigger arrays would require a non-native activation layer.

Proposal: keep the native default. Add `data-if` template composition for conditional DOM
only after the shared binder is approved. Do not add trigger-area interception unless a
real application requires partial summary activation and its keyboard/semantics contract
is designed separately.

**Status:** integrated CSS correction; Chromium comparison,
2026-09-10. The existing details/summary helper, naming, focus and ownership code is
unchanged. No CollapseTransition import, height renderer or animation dependency was added.

## Reference and evidence

- Pinned commit: `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
- Sources: [Collapse](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/src/Collapse.tsx),
  [item](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/src/CollapseItem.tsx),
  [styles](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/src/styles/index.cssr.ts),
  [RTL styles](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/src/styles/rtl.cssr.ts),
  [theme](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/styles/light.ts).
- Actual reference: installed `naive-ui@2.45.3` / `vue@3.5.30`, light/dark configuration
  and the source Collapse RTL preset when applicable.
- Private session fixture `files\style-reference\collapse-audit`, port **4223**:
  case/source/build/server files, `before.json`, `after.json`, `boundaries.json`, and
  `{reference,before,after,legacy}-{light,dark}-{ltr,rtl}.png` where captured.
  Original before captures are LTR; reference/corrected/legacy cover both directions.
- Isolated Chromium contexts closed in `finally`; 420×1000 viewport, requested DPR 1,
  320px group width, 14px inherited system font / 1.6 line-height.
  This environment rounded a declared 1px divider to about .666667 computed CSS pixels;
  reported geometry uses measured values rather than assuming integer border allocation.
- Ten cases cover closed, first/second open, accordion, disabled, custom arrows/placement,
  extra action, nesting and author overrides: **40 corrected cases**, matching reference
  and legacy matrices, plus 20 original LTR cases (**140 captured render conditions**).

## Corrected defaults

| Area | Before | Reference / corrected |
| --- | --- | --- |
| Group frame | 1px border, 6.4px radius | **No enclosing border/radius** |
| Header weight | 600 | **400** |
| First header padding | 12px 16px | **0** |
| Later items | Divider without source gaps; mixed rows could miss it | **16px preceding gap, divider, 16px header top padding** |
| Content padding | 4px 16px 16px | **16px 0 0** |
| Nested group indent | Card/inset accumulation | **32px logical-start** |
| Custom graphic/title gap | 8px | **4px** |
| Custom graphic | Unconstrained native SVG/text sizing | **18px default box** |
| Light body/header/disabled | Single dark tone / 600-weight heading / `#687385` | **`#333639` / `#1f2225` / `#c2c2c2`** |
| Dark body/header/disabled | Same hardcoded light-theme tones | **White .82 / .9 / .38** |
| Divider | `#adb5c1` | **`#efeff5` light / white .09 dark** |
| Opt-in arrow motion | 100ms ease-out | **150ms cubic-bezier(.4,0,.2,1)** |

All **40 corrected outer group heights** matched reference heights within .03px.
The simple closed/open fixtures measured 77.458336 / 115.854172px in both implementations,
instead of the previous native 94.791672 / 137.1875px.

Default header colors, weights and padding; content top spacing; nested indent; and LTR
authored custom-arrow bounds/color matched the reference. Later legacy CSS/aggregate
loading retained identical captured target measurements.

Default hover changed neither reference nor native header color/background: both remained
`#1f2225` on transparent in the light fixture. No invented hover surface was added.

## Retained native differences

1. **Native marker:** ordinary summaries still use the browser disclosure marker, not a
   generated source chevron. Its glyph, inset and platform rendering are not claimed as
   an exact source icon match. Authored custom graphics provide the source-sized alternative.
2. **RTL custom-arrow API:** the existing left/right data flags keep physical ordering.
   The source RTL preset reverses logical placement and uses -90° open rotation. With
   the same authored right-chevron, native custom arrows retain their existing +90°
   rotation. This is not normalized by a renderer; authors choose RTL-aware graphics/CSS.
3. **Header-extra anatomy:** an extra action stays outside details/summary in the second
   grid column. A measured body width was 273.614594px inside a 320px group, unlike source
   full-width body content. This preserves independent native interaction and avoids
   nested controls inside summary.
4. **Panel motion:** source opening created 150ms transform, max-height and opacity
   transitions. Native default details opened immediately with no panel Animation.
   The optional custom-arrow transition is separate; no CollapseTransition code is used.
5. **Native lifetime/value policy:** content and controls remain authored nodes when closed;
   native toggles are asynchronous/coalesced, and helper notifications keep their existing
   meaning. Source render/display directives and requested-state callbacks are not emulated.
6. CSS state colors update directly rather than reproducing source color-transition timing.
   First-child content margins are no longer forcibly removed; authored margins remain
   application-owned, so arbitrary authored content can differ from the plain fixture.

## Native behavior and author verification

`boundaries.json` records:

- Enter opened a native disclosure and Space closed it. Default opening had zero native
  animations in its subtree.
- Native accordion switching left only “b” open, while a separate independent group kept
  “a” open. Existing nested/transfer/name-restoration tests remained unchanged.
- A disabled summary stayed focusable with no added tabindex, announced owned
  `aria-disabled=true`, and ignored native Enter activation. Its dark text was white .38;
  focus independently used the info color. An explicit programmatic request still opened it.
- An extra native button received one click without changing expanded names.
- Closing an outer item repaired focus from a nested input to the parent summary while
  retaining the nested open state and “Retained” input value.
- Browser accessibility nodes remained native `DisclosureTriangle` entries with native
  focusable/expanded state. No synthetic summary role or aria-expanded was added.
- Author CSS rendered 16px/600-weight purple headers with 8px padding; token overrides
  remain authoritative rather than being lost to first-header presets.
- Opt-in arrow transition reported .15s / the source bezier; reduced motion reported 0s.
  Print produced black default header text without opening closed native details.
  Forced-color disabled text used the platform GrayText value, not a fixed RGB assumption.
- With JavaScript disabled, a disabled marker had no false aria-disabled and the native
  item remained usable. An explicitly authored native `details.name` pair still enforced
  exclusivity. No no-JS activation blocker or provider was invented.

## Budgets and integration boundary

- `pnpm test -- tests\collapse.test.ts`: **36 tests passed**.
  Three new style regressions cover the borderless palette, mixed-row spacing/custom
  arrow geometry, and opt-in/reduced/print motion without a panel height engine.
- Exact isolated level-9 ESM/classic/CSS: **3,784 / 3,855 / 985 gzip bytes**, below unchanged
  **4,000 / 4,000 / 1,000** ceilings. JS/helper logic and CSS dependencies are unchanged.
- CSS uses compact rules to keep the retained native scope within its original budget;
  the parent's isolated release pipeline remains the final build/manifest gate.
- No shared helper, CollapseTransition, index/generated, renderer/dependency, full-build,
  commit or push edits. No common source change is required.

These are Chromium observations, not all-browser, physical-touch, screen-reader speech,
source RTL-slot or complete pixel/motion parity claims.

## Coordinated release integration

Parent review corrected the new mixed-row separator selector to ignore hidden preceding
rows/items. The first visible row therefore has no orphan border or gap. Actual emitted
CSS in Chromium changed a new first row from **16px margin / 16px header padding** to
**0 / 0**, with a **0px border**, after preceding visible content was hidden.

The isolated release `pnpm build` and all **37 Collapse tests** passed. Final CSS is
**991/1,000 gzip bytes**; helper code and Collapse Transition remain unchanged.
