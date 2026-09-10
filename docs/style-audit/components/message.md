# Message default-style audit

**2026-09-11 — complete in owned scope, with required native feedback retained.**

## Reference and isolated method

- Reference: [Naive UI Message](https://www.naiveui.com/en-US/os-theme/components/message),
  Naive UI **2.45.3**, Vue **3.5.30**, source commit
  `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
- Inspected MessageProvider, Message, message props, common/light/dark theme values,
  Message CSS and the base close implementation. The public `create()` API defaults
  to **default**, not the internal component prop's info default.
- Actual NMessageProvider/useMessage rendered all six types, optional icons/close,
  light/dark, and all six placements. Visual fixtures use persistent duration 0 to
  avoid expiry during measurement; this does not redefine either API's timer defaults.
- Same **Arial**, **14px/1.6** document baseline, **1200×800 CSS-pixel** viewport and
  literal “Changes saved” content. Source transitions settled for **400ms**; hover/
  pressed endpoints for **350ms**.
- Chromium **151.0.7922.174** on Windows. Each pass created a private browser context/
  page and closed it in `finally`. Private repository-local fixture/server used an
  OS-assigned loopback port, **53983**, existing esbuild and existing private reference
  dependencies. Before CSS was captured before editing.
- Shared `feedback/*`, Notification, runtime, generated entries and release outputs
  were not modified. Notification CSS was only loaded into the isolated fixture to
  verify repeated-base order and style noninterference.

## Measured default corrections

The reference does **not** impose a 420px minimum merely because a `minWidth` value
exists in the common theme. Actual short default/info toasts measured 137.29/167.29px.
Native messages previously stretched to the generic 512px fixed host.

| Field | Native before | Reference / native after |
| --- | --- | --- |
| Info toast | **512×74.51px** | Reference **167.29×42.40**; native **167.29×64.79** |
| Default toast | **512×74.51px** | Reference **137.29×42.40**; native with retained bullet **167.29×64.79** |
| Default with icon hidden | Stretched host width | Native **137.29×64.79**, no phantom icon gap |
| Closable info | **512×74.51px** | Reference **193.29×42.40**; native **217.29×64.79** |
| Desktop padding | 12.8px | **10px 20px** |
| Outer border / radius | Colored 1px / 8px | **No border / 3px** |
| Content font / leading | 14px / 21px | **14px / 22.4px** |
| Icon region / spacing | Glyph-dependent width, 9.6px grid gap | **20×20px / 10px margin** |
| Light body / surface | #20252b / white | **#333639 / white** |
| Dark body / surface | Same light defaults | **white .82 / #48484e** |
| First top item | y=16px | **y=12px** |
| Last bottom item's edge gap | 16px | **12px** |
| Fixed host stacking default | 100 | **6000**, still below native top layers |

For all **twelve type × theme** comparisons, computed foreground/background, padding,
radius, shadow, and content font/leading matched. The five semantic icon types matched
their actual source icon-child color in both themes; the wrapper's inherited color was
not mistaken for the icon's paint.

| Type | Light icon | Dark icon |
| --- | --- | --- |
| info | #2080f0 | #70c0e8 |
| success | #18a058 | #63e2b7 |
| warning | #f0a020 | #f2c97d |
| error | #d03050 | #e88080 |
| loading | #18a058 | #63e2b7 |

The native default bullet uses the body-tone fallback; source default has no icon.
Existing `showIcon:false` remains honored, including authored template decorations.
No source SVG artwork or spinner was copied.

Measured shadows:

- Light: **0 3px 6px −4px black .12; 0 6px 16px black .08; 0 9px 28px 8px black .05**.
- Dark: **0 3px 6px −4px black .24; 0 6px 12px black .16; 0 9px 18px 8px black .10**.

Semantic icon roles use the existing shared palette. Neutral defaults are Message/
Popover colors, not the incompatible legacy neutral or Modal surface roles.

## Required native differences

**Visible kind words were not removed.** Message/Information/Success/Warning/Error/
Loading retain their own row above content, adding **22.40px** to this desktop fixture.
Default decoration and the static loading ellipsis remain native adaptations. Meaning
does not depend only on color or movement, and only the dedicated polite announcer
owns live announcements.

Close remains at least **40×40px**, versus the source's 16px icon box and 20px hover
area. Its 16px text glyph is original authored text, not vendor artwork. Source and
native close paint endpoints matched:

| State | Light | Dark |
| --- | --- | --- |
| Glyph | #666 | white .52 |
| Hover background | black .09 | white .12 |
| Pressed background | black .13 | white .08 |

Native hover paint fills the larger native target; its extent is not pixel-equivalent
to the source pseudo-element. Disabled close remains nonactivating with a visible
disabled treatment. A **2px inset focus outline** is retained rather than replacing
native focus protection with source focus paint.

Error text keeps a full-width row, 4px accent border and 8px inset. Authored actions
remain full-width wrapping content with native form controls. No business action,
extra live region, focus trap, promise decision, timer policy or service API was added.

## Placement, repeated base sheets and native containment

All changes to fixed placement are guarded by both `.mui-message-host` and
`.mui-feedback-host--fixed`. Shared placement CSS and Notification are untouched.
Explicit left/right selectors outrank later repeated shared base selectors.

**48 cases passed:** two Message/Notification stylesheet orders × light/dark × LTR/
RTL × six placements. Two-item stacks had:

- **12px** top or last-visible-bottom inset, **12px** physical side inset where selected,
  and **8px** inter-item gap.
- Correct palette, fixed positioning and unchanged x/y after scrolling the document.
- Preserved physical left/right placement in both directions.

Reference LTR placements matched these visible edge coordinates. Its bottom container
is positioned at 4px but each wrapper has 8px bottom margin, yielding the measured
**12px** visible bottom gap. Under the same inherited HTML `dir=rtl` fixture, the
reference container's flex alignment reversed corner alignment (for example top-left
was near the right edge). The retained native physical-placement contract intentionally
does not copy that behavior; this is not a claim of complete provider RTL equivalence.

Native fixed hosts retain finite max-height, scrolling, pointer-event routing and
viewport width caps. The source provider is a zero-height, overflow-visible container.
The native bounded host may therefore clip shadow paint at its edges; matching computed
shadow values is not a claim of complete painted-pixel equivalence. Safe-area offsets
remain, and the height cap also accounts for both safe-area endpoints. No body scroll
locking, portal or visualViewport engine was introduced.

Notification's isolated baseline was identical with before/after Message CSS: host
**448px**, 16px edge inset, z-index 100, and unchanged item size/palette/shadow. This is
style noninterference evidence, not a Notification audit or runtime modification.

## Narrow layout and author overrides

An intermediate intrinsic-width implementation exposed a real grid sizing problem:
an implicit list track could stay 720px wide inside a zoomed, narrow host. The final
Message-scoped list uses **minmax(0,1fr)**, so item percentage bounds resolve against a
shrinkable track rather than overflowing the host.

At viewports up to **24rem**, content spans the full item width and close moves to a
following row. Kind/icon remain visible above content; 12px horizontal padding and 6px
icon/close spacing preserve room for text without shrinking the 40px close target.
No required region is hidden. This is a native responsive safety adaptation, not an
upstream single-line layout claim.

**24 cases passed at 320×640 and 2× CSS zoom:** six placements × LTR/RTL × both stylesheet
orders. Long messages had nonzero usable content width, no item/host horizontal
overflow, bounded scrolling and a fully reachable close. A native action template also
kept its required input visible and its form/action region within the item.

Inherited author overrides won, including after a type update:

- Body **rgb(1,2,3)**, background **rgb(4,5,6)**, icon/focus **rgb(120,20,180)**.
- Existing feedback width **360px** and z-index **7001**.
- Type update to warning retained the author's accent and visible **Warning** text.

Public Message override variables are consumed but no longer assigned component
defaults. Flow hosts remain ordinary flow. Explicit light boundaries reset dark defaults.

## Lifetime, actions, media and modal-local checks

Runtime source and compiled runtime bytes are unchanged. Existing lifetime semantics
were verified, not rewritten:

- Focus held a 200ms message beyond expiry; after leaving, its remaining-time expiry
  completed. Opt-in hover held a 300ms message beyond expiry and resumed afterward.
- Creation did not steal focus. Native invalid form submission did not dispatch submit;
  valid submission dispatched the author's listener exactly once.
- Content update retained the same input node, its `"Draft"` value and action listener.
- Synchronous close failure kept the item and visible error text; exactly one owner
  status announcer remained, with no item-level live region. Clearing the callback and
  closing restored the explicit fallback focus.
- Body-fixed feedback could not cross a native modal top layer. A separate flow owner
  inside that modal accepted focus and closed without affecting the outside owner.
- Earlier authored motion `probe / 5s` reset to **none / 0s** under reduced motion.
  Forced colors retained system text, visible kind words and borders, with no shadow.
  Print changed fixed hosts to **static / unbounded height / visible overflow**, removed
  message shadow and retained `break-inside:avoid`.
  A final **twelve-case** screen/print pass covered all six placements in both stylesheet
  orders after the narrow-layout correction.

Default durations, loading persistence, max admission, hover/focus holds, close callback
semantics, events, announcement ownership, template validation and cleanup policies
remain exactly as documented in the native component guide.

## Validation and unchanged budgets

`npm test -- --run tests\message.test.ts`: **64 passed** (59 existing + five style/budget
regressions). Assertions preserve actual child combinators/value tokens while tolerating
irrelevant formatting. They cover intrinsic sizing, required rows, shrinkable tracks,
responsive controls, semantic roles, scoped placement, author precedence, media safety
and the exact composed gzip ceiling.

Private builds use existing esbuild with production basenames/options: bundled/minified
ESM `index.ts` and classic `global.ts`, target `es2022`, sourcemaps and no legal comments.
CSS is the actual **feedback.css + newline + message.css** composition, not a hypothetical
minified result. All gzip measurements use **level 9**.

| Asset | Raw bytes | gzip bytes | Unchanged ceiling |
| --- | ---: | ---: | ---: |
| Message ESM | 12,468 | 4,739 | 6,000 |
| Message classic | 12,740 | 4,860 | 6,000 |
| Message CSS only | 5,862 | 1,505 | — |
| Actual composed Message CSS | 7,313 | 1,728 | 1,750 |

CSS has **22 bytes** headroom; newline-normalized LF/CRLF probes were **1,724 / 1,729**
gzip bytes. No shared dependency or formatting change was needed.
No shared feedback/Notification edit, runtime/dependency addition, generated/index/
builder edit, full build, commit or push was performed. Private server/context/fixture
are cleaned up after verification; coordinator owns release integration.

Only the stated Chromium/jsdom evidence is claimed—not all-browser, screen-reader,
physical-touch, complete provider/template APIs or full pixel-equivalence certification.
