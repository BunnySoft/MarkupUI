# Modal default-style audit

**2026-09-10 — integrated within the retained native model.**

## Reference and isolated method

- Reference: [Naive UI Modal](https://www.naiveui.com/en-US/os-theme/components/modal),
  Naive UI **2.45.3**, Vue **3.5.30**, pinned source commit
  `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
- Inspected Modal `BodyWrapper.tsx`, `presetProps.ts`, light/dark theme and CSS,
  plus the Card geometry and modal overrides. Actual NModal was rendered with
  no preset, `preset="card"` and `preset="dialog"`; no injected service was emulated.
- Private repository-local fixture, existing esbuild and already-installed private
  Naive/Vue dependencies; no installation or production dependency. Its OS-assigned
  loopback port was **49654**. It built private ESM/classic/composed CSS outputs,
  never the release distribution or a shared fixture.
- Chromium **151.0.7922.174**, Windows, **1200×800 CSS pixels**, Arial document font,
  14px/1.6 text. Source transitions settled for **350ms** before reads. Fresh private
  browser contexts/pages were closed in `finally`.
- Identical strings: “Review change”, “Review the local change before confirming.”,
  “Authored footer”, “Close”, “Not now”, “Confirm”. Raw uses the same authored heading,
  paragraph and form/button structure. Its native control sizing remains a deliberate
  adaptation, not an upstream wrapper default.
- Before CSS was captured before editing. Both natural widths and an explicit
  **600px** author width were measured; 600px is not represented as a preset default.

## The three reference surfaces are different

**Raw NModal** clones/classes its authored child. It adds text color, shadow and modal
placement, but no child background, border, radius or padding. Its flex-layout child
shrinks to content. Copying that child's `position:relative` to a native modal would
break native fixed positioning; this implementation does not do so.

**Card preset** constructs NCard. `presetProps.ts` spreads Dialog props after Card
props, making the preset **unbordered by default**, unlike standalone NCard. It also
provides a default close control. Actual Card preset shadow values differ from raw/
Dialog because the Card theme supplies its own `--n-box-shadow`. Its default width is
100% of the source wrapper, not a guessed 40rem or 600px.

**Dialog preset** constructs NDialog with its 446px wrapper width. Modal contributes
the shadow/mask; the Dialog stylesheet supplies content geometry and semantic actions.
The retained native target composes classes/styles, not two controller instances or
two dialog roles.

The native helper still rejects `preset`, render callbacks, prop bags, blockScroll and
other unsupported option keys. No missing API, binding or template feature was added.

## Corrected retained presentation

- Raw `.mui-modal` now has zero padding/border/radius and transparent background.
  Native fixed insets would make `width:auto` stretch, so its default inline size is
  **fit-content**. This produces the same natural width without changing modality.
- Existing **direct** `data-modal-header` or `data-modal-title` children select the
  authored Card-like frame. A local `:has()` recognizes existing layout anatomy only;
  it does not inspect body/html, lock scrolling or discover nested dialogs' titles.
  The `.mui-dialog` composition is explicitly excluded from this rule.
- Card frame padding is **19px 24px 20px**, radius **3px**, title **18px/500**, and body
  **14px/1.6**. Footer text now starts at the content edge. Content spacing is 20px;
  a terminal content region does not double the bottom padding. The existing segmented
  footer border and 1rem spacing remain a native convention, not complete Card props.
- `.mui-modal.mui-dialog` keeps the accepted Dialog geometry independently of stylesheet
  order. Modal width/padding/radius/border overrides remain usable; its width falls back
  to the Dialog override and then 446px.
- Modal-only backdrop paint now matches **rgba(0,0,0,.4)**, with sufficient specificity
  against repeated shared base sheets. Transparent-backdrop paint remains explicit and
  does not remove native modality. Other components' backdrop rules are unchanged.

| Field | Native before | Reference / native after |
| --- | --- | --- |
| Raw natural box | **640×190.69px** | Reference **267.71×127.24**; native **267.71×144.84** |
| Raw padding / radius / background | 24px / 12px / white | **0 / 0 / transparent** |
| Card at authored 600px width | **600×163.33px** | Reference **600×152.58**; native with retained close **600×163.79** |
| Card with close omitted | Old title/frame geometry | Both **600×152.58px** |
| Card with close and footer omitted | Extra trailing content spacing | Both **600×110.19px** |
| Card title/body text origins, no close | Old title 22px/700 | Both title **(24,19)**, body **(24,67.79)** |
| Dialog composition | **446×150.33px**, 24px padding, 12px radius, 21px leading | Both **446×139.19px**, 16px 28px 20px, 3px radius, 22.4px leading |
| Light body / title | #20252b inherited throughout generic content | **#333639 / #1f2225** |
| Dark Card/Dialog body / title / surface | Generic light defaults | **white .82 / white .9 / #2c2c32** |
| Modal mask | rgb(15 23 42 / .48) | **black .4**, Modal-scoped only |

Measured shadows, matching source endpoint colors and geometry:

| Presentation | Light | Dark |
| --- | --- | --- |
| Raw / Dialog wrapper | 0 6px 16px −9px black .08; 0 9px 28px black .05; 0 12px 48px 16px black .03 | **Same measured values** |
| Card | 0 1px 2px −2px black .08; 0 3px 6px black .06; 0 5px 12px 4px black .04 | Same geometry, alpha **.24 / .18 / .12** |

The generic legacy neutral palette is not used as a Modal theme. Existing semantic
primary roles supply the focus color. Shared native foreground/background override
names remain `--mui-dialog-color` / `--mui-dialog-background`; no public override is
assigned a component default.

## Deliberate native differences

- Ordinary native buttons retain **2.5rem minimum height**, inherited font and wrapping.
  Reference raw's browser button measured **21.33px / 13.33px font**; native remained
  **40px / 14px**. Source Card close uses an 18px icon box with a 22px hover area; the
  authored native form close remains 40px high. These explain the residual raw/Card
  heights and the Card title/body shift when close is present. They were not removed
  to obtain pixel parity or fit a budget.
- With no authored width, source Card measured **1200px**. Native measured **1152.67px**
  because it retains the shared 32px viewport gutter and the visible document scrollbar.
  Source blocks body scrolling by default; native intentionally does not. Modal center
  offsets therefore also reflect the scrollbar rather than a fabricated compensation.
- Native form controls keep browser hover/disabled behavior, keyboard reachability and
  actual validation. No upstream SVG artwork, generated close button, button-prop bag,
  loading indicator, theme object or animation system was added.
- Raw content inherits the author's font; marked Card content uses its measured theme
  size. A generic native Modal is not a newly implemented NCard. Cover/actions/header
  extras, full segmented options, embedded states and Card prop forwarding stay outside
  this retained target.
- Dialog's already documented icon, focus and interaction-paint adaptations remain.
  Loading its CSS does not import asynchronous Dialog decisions into createModal.
- The new unbordered baseline retains the border **color** variable. Authors explicitly
  supply a border width if desired. Other width/padding/radius/focus/color overrides
  remain effective in all three presentations.

## Composed load orders and author precedence

All **108** combinations passed: six permutations of **Modal, Dialog and Drawer**
composed stylesheets × light/dark × raw/Card/Dialog intent × native modal/modeless/
explicit inline fallback. Every sheet includes the actual shared base, so these are
repeated-base tests, not just reordered component-only CSS.

Verified in every combination:

- Correct foreground, surface and mask paint, 600px author width, reachable close
  controls inside the surface, and successful close activation.
- Native modal computed **fixed** when opened at scrollY **400** and retained exactly
  the same top after scrollY **800**. Tops at 600px authored width were raw **327.573**,
  Card **318.104**, Dialog **330.406px**. No relative positioning is applied to a modal.
- Raw/Card modeless/fallback remain in native static flow. Dialog composition keeps
  the accepted relative nonmodal close anchor, unaffected by subsequent base copies.
- Overrides: width **500px**, padding **12px**, radius **9px**, border **rgb(11,22,33)**,
  foreground **rgb(1,2,3)**, surface **rgb(4,5,6)** and focus **rgb(7,8,9)** all won.
  Border width was explicitly authored for that test.
- HTML/body inline overflow stayed untouched. Fallback used explicit `show()`; unsupported
  `showModal()` was not silently downgraded.

Explicit light scope inside a dark page reset the Card background to white. Appending
a nested Modal with its own marked title did not change an outer raw surface's skin.
Shared `native.css`, `native.ts`, Dialog CSS and Drawer CSS were not edited.

## Native safety and accessibility verification

- Invalid native `method=dialog` form stayed open and focused its required input;
  valid submission closed with returnValue `"closed"`. Disabled close did not activate
  or accept focus and retained its 40px height.
- Cancel veto kept the modal open; the next Escape closed it and restored the opener.
  Transparent backdrop stayed transparent **and truly modal**, blocking background focus.
- Nested top layers focused the child; Escape closed only the child and restored focus
  inside the still-open parent.
- Start/end placement retained **16px** edge insets.
- Earlier authored `probe / 5s / smooth` motion became **none / 0s / auto** on both the
  surface and backdrop under reduced motion. These explicit resets are retained.
- Forced colors retained system borders/text/background and removed shadows. Print
  removed maximum block sizing, shadows and backdrop paint. Chromium's printed native
  top layer computes absolute rather than static; no physical-pagination parity is claimed.
- At **320×640**, RTL and **2× CSS zoom**, all three intents measured approximately
  **240.67×576px at (32,32)**, without internal horizontal overflow. Long content
  scrolled, a native footer button remained reachable by focus, and submission closed.

## Targeted validation and payload

`npm test -- --run tests\modal.test.ts`: **49 passed** (44 existing + five style/budget
regressions). Checks cover raw/Card/Dialog separation, local-only anatomy selection,
neutral/shadow roles, fixed modality, repeated-base specificity, preserved native safety
rules and exact production-composed gzip.

Private builds use existing esbuild with production basenames/options: bundled/minified
ESM `index.ts` and classic `global.ts`, target `es2022`, sourcemaps, legal comments `none`.
The release builder concatenates **native.css + newline + modal.css** without another
CSS minification step. Component whitespace was formatted using existing esbuild with
`minifyWhitespace:true`, `minifySyntax:false`; all gzip measurements use **level 9**.

| Asset | Raw bytes | gzip bytes | Unchanged ceiling |
| --- | ---: | ---: | ---: |
| Modal ESM | 9,082 | 3,533 | 4,000 |
| Modal classic | 9,339 | 3,661 | 4,000 |
| Actual composed Modal CSS | 3,997 | 1,188 | 1,250 |

Runtime outputs are unchanged. CSS has **62 bytes** headroom. No full build, generated
adapter/index/builder edit, shared-source edit, dependency addition, commit or push was
performed. The private server/context/fixture were isolated from public demos and are
cleaned up after verification. Coordinator owns release and integration.

## Coordinated release integration

The isolated release build and **151 Modal/Dialog/Drawer tests** passed. Parent review
then fixed a print cascade gap: the Card-like shadow could survive on modeless/fallback
surfaces. The final print rule clears shadows on every native Modal presentation, not
only `:modal`; all **49 Modal tests** passed again after that correction.

Actual emitted CSS in Chromium kept the modal fixed at **top 314.90625px** across
window scroll **400 to 800** with later Dialog/Drawer sheets loaded. Print reported
**box-shadow:none** for modal, modeless and inline-fallback Card surfaces.
Final composed CSS is **4,049 raw / 1,193 gzip bytes**, within the unchanged 1,250-byte
ceiling. Shared native files and runtime code remain unchanged.

Only the stated Chromium/jsdom coverage is claimed—not all-browser, screen-reader,
physical-touch, source service API, vendor artwork or full pixel-equivalence certification.
