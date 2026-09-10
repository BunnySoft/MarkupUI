# Image default-style audit

**2026-09-10 — thumbnail defaults matched; preview fitting/chrome corrected; native
toolbar and interaction differences remain intentional.** Integrated by the coordinator.
The isolated audit made no shared-source changes.

## Pinned reference and isolated reproduction

- Official reference: <https://www.naiveui.com/en-US/os-theme/components/image>.
- Naive UI **2.45.3**, pinned source
  `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; Vue **3.5.30**.
  Inspected Image/ImageGroup/ImagePreview, shared preview props, Image CSS and
  light/dark theme constants.
- Private fixture:
  `C:\Users\chengzhu\.copilot\session-state\99fde562-4396-4c35-9601-b00d03e1c14e\files\style-reference\image-audit`.
  It resolves already-installed reference dependencies from the parent fixture and
  esbuild from MarkupUI. No package installation or production dependency changes.
- Run `node build.mjs` and `node server.mjs` in that directory. Port **4195** is dedicated
  to this audit. The server reads Image's canonical CSS directly; helper builds are
  isolated production-equivalent ESM/classic outputs, not the repository distribution.
  `before.css` is reconstructed from **902a8fb**, not approximated.
- `/reference.html` renders default `NImage`/`NImageGroup` with `NConfigProvider` and
  `NGlobalStyle`. `/markup.html` uses authored native thumbnails and the existing preview
  helper/template contract. `?dark` selects explicit dark defaults; Markup `?before`
  uses the pinned old CSS. `?no-toolbar` exercises retained toolbar hiding.
- Chromium **151.0.7922.174**, Windows, DPR 1. Every investigation used a **new private
  browser context**, closed afterward; the shared active page was not used.
  Primary viewport **1000×800**; additional **320×640**, RTL, CSS zoom 200%, keyboard and
  forced-colors checks. Waited 400–500ms for upstream preview transitions before measuring.
- Three locally authored SVGs provide opaque 1600×1000 landscape, 800×1600 portrait,
  and 120×80 small images. They are reference-fixture assets, not copied upstream icons.
  `measure.js` records both libraries' boxes and computed presentation.

**140 comparisons passed with zero mismatches:** 14 light/dark thumbnail cases checking
width, height, fit and radius; six light/dark preview cases checking image/viewport x/y/
width/height, toolbar height/padding/radius/color/fill, and backdrop fill. Toolbar total
width and icon inventory are deliberately not counted as matches.

Screenshots `final-reference.html.png`, `final-reference.html-dark.png`,
`final-markup.html-before.png`, `final-markup.html.png`, and
`final-markup.html-dark.png` remain beside the fixture and were visually inspected.
They show the removed white frame, larger centered image and corrected translucent
toolbar, as well as the explicitly retained native close/position/text controls.
No full-screenshot pixel-identity claim or unmeasured glyph parity is made.

## Measured before / after

At the primary viewport, the page has a 15px native vertical scrollbar, so both preview
containers measure **985×800px**. The reference uses viewport-unit caps against 1000×800
and centers inside that 985px container; these are actual rendered values, not rounded
source-token guesses.

| Case | Reference / native after | Native before | Change / status |
| --- | --- | --- | --- |
| Natural small thumbnail | **120×80px**, block, fill, radius 0 | Same | Matched; no invented thumbnail size |
| Explicit landscape thumbnail | **200×125px**, fill | Same | Matched |
| Contain / cover thumbnails | **200×200px**, corresponding object-fit | Same | Matched; authored values preserved |
| Portrait thumbnail | **100×200px** | Same | Matched |
| Authored parent rounding | Thumbnail inherits parent's radius | Native image remained square | Added `border-radius: inherit` |
| Preview viewport | **(0,0), 985×800px**, transparent, radius 0 | **(44.5,67.40625), 896×665.171875px**, white, radius 8px, 1px frame | Corrected native dialog defaults |
| Landscape full image | **(8.5,97.5), 968×605px** | **(76.5,157.1875), 832×520px** | Removed 65vh cap and panel geometry |
| Portrait full image | **(300.5,16), 384×768px** | **(362.5,157.1875), 260×520px** | Viewport fitting and centering |
| Small full image | **(432.5,360), 120×80px** | **(432.5,377.1875), 120×80px** | Centered vertically without upscaling |
| Backdrop | **rgba(0,0,0,.3)** | rgba(0,0,0,.6) | Corrected; authored override retained |
| Toolbar height / bottom / padding / radius | **48px / 40px / 0 12px / 24px** | 22.390625px / content-relative / 0 / 0 | Corrected surface geometry; min-height allows native text wrapping |
| Toolbar fill | **rgba(0,0,0,.35)** | Transparent | Corrected |
| Toolbar light / dark foreground | **white .9 / white .82** | #18181b in both modes, with native blue original link | Corrected via scoped Image defaults and inherited native-control color |
| Toolbar width | Reference **420px**; native **321.515625px** | Native 862px | Intentional: nine upstream icons versus three retained text actions |

Implementation changes are solely in `src/components/image/image.css`. The helper's
runtime, request/fallback lifecycle, navigation rules, DOM ownership and template validation
are unchanged. Four focused CSS regressions were added to `tests/image.test.ts`.

## Theme and accessibility decisions

Image's white/translucent overlay chrome is not equivalent to generic card/surface/text
tokens. No shared preset or CSS was modified. Public Image color/background/border tokens
remain inherited author overrides, and new local backdrop/toolbar/border-width tokens
make the corrected surfaces configurable. The default border is now zero-width; applications
wanting the previous visible frame must author a nonzero width.

Only a private foreground fallback changes at explicit dark boundaries, resetting under
nested explicit light. Font family, size and line-height continue to inherit. This keeps
standalone CSS independent of core and avoids recoloring other components.

The retained authored close/header, position and error regions receive translucent
backgrounds above the image so that white labels do not become unreadable on a light page.
They are not hidden to make the screenshot resemble the reference. Native toolbar buttons
remain typed, named and focusable; disabled navigation is visibly dimmed. No fake icon-only
control, no-op gesture action, VNode renderer or new template/binding feature was added.

Additional Chromium checks:

- Keyboard Enter on the native thumbnail link opens the dialog and focuses close with
  **`:focus-visible` and native 1px auto outline**. Tab reaches Previous; Escape closes
  and restores the original thumbnail link. Close remains pointer-reachable above images.
- Hiding optional toolbar content leaves close reachable. The stage wrapper remains
  optional; without it the landscape still measures **(8.5,97.5), 968×605px**.
  Stage and toolbar remain viewport-positioned inside ordinary authored wrappers too:
  a nested mobile fixture retained **288×576px** portrait fitting, a **273×60.78125px**
  toolbar and a reachable standalone close button with black .35 background.
- At **320×640**, dialog client/scroll width both **305px**, portrait **288×576px**,
  toolbar **273×60.78125px** at x=16. Text wraps instead of overflowing like a fixed
  nine-icon strip. RTL retains that centered placement.
- At **200% CSS zoom**, the percentage cap prevents viewport-unit overflow: portrait
  **305×610px** at (0,15), with equal dialog client/scroll widths. This is a deliberate
  native fitting safeguard rather than a claim that upstream CSS zoom behavior matches.
- In forced colors, chrome resolves to Canvas/CanvasText and the toolbar has a visible
  **1px CanvasText outline**. Native keyboard outlines are not suppressed. Existing print
  hiding and authored no-JS image/link behavior remain unchanged.
- Authored preview foreground **rgb(1,2,3)**, dialog background **rgb(4,5,6)** and backdrop
  **rgba(10,11,12,.4)** were observed directly. Public values win without injected styles.

## Validation, budgets and retained limits

- `pnpm test -- tests\image.test.ts`: **35/35 passed**, including all 31 existing
  lifecycle/accessibility/fallback cases.
- Isolated builds used the existing production esbuild options, names and source-map
  settings. ESM **3430/4000**, classic **3665/4000**, CSS **998/1000 gzip bytes**.
  Runtime sizes are unchanged; CSS increased from **656 to 998**. No budget was relaxed.
- `git diff --check` passed for owned changes. Full distribution build/integration and
  any commit/push are explicitly left to the parent.

Remaining differences:

1. Native previous/next/close controls have **visible authored text**, not Naive's 28px
   icon glyphs in 44px cells. Native Open original is ordinary navigation, not the reference
   download action. Rotation, zoom, original-size, download/fullscreen and gestures remain
   omitted; the nine-icon toolbar is not fabricated.
2. The separate accessible close/header and position/error content remain visible above
   the image. Toolbar width, narrow wrapping and focus presentation therefore differ.
3. Preview-disabled native anchors remain live original-image links with pointer cursors,
   unlike the reference's non-preview wrapper cursor. Oversized native thumbnails retain
   the existing responsive `max-inline-size:100%` safeguard; a natural 1600px reference
   thumbnail can overflow in the same flex fixture. Neither safety difference was removed
   merely for screenshot parity.
4. Reference preview fade/scale and transform transitions are not implemented; native
   modal/keyboard/cancel semantics remain. The comparison is of stable endpoints.
5. No all-browser, screen-reader speech, touch-gesture or cross-origin save certification.
   Historical migration claims are not silently promoted to universal visual parity.

The coordinator subsequently ran `pnpm build` and all **35 Image tests** successfully.
Final manifest gzip is **3,430 ESM / 3,665 classic / 998 CSS bytes**, within unchanged
ceilings. Integration is complete; no other component was edited by this audit.
