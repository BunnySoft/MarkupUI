# Dialog default-style audit

**2026-09-10 — retained native presentation corrected; no provider/runtime rewrite.**

**INTEGRATED — modality, composed-order and safety-policy corrections retained.**
Parent review found that the initial blanket `position:relative` changed native modal
positioning. That rule is removed. On screen only, non-dialog `.mui-dialog` content and
`dialog.mui-native-dialog.mui-dialog[open]:not(:modal)` are positioned relatively; modal positioning is
left to the browser. The original explicit reduced-motion, error-border and pending
weight policies are restored, not traded away to fit the payload ceiling.

### Parent-review regression verification

A second private fixture at OS-assigned loopback port **56434**, Chromium
**151.0.7922.174**, **1200×800**, exercised the actual corrected composed stylesheet:

- Opening `showModal()` at **scrollY=400**: computed **fixed**, top **330.40625px**,
  height **139.1875px**. Subsequent **scrollY=800**: still fixed and the exact same top.
- Modal, modeless `show()`, all-methods-absent inline fallback, and inline section
  retained close offsets **26px from the right / 20px from the top**. Native/modeless/
  fallback close controls remained visible and clicking each closed its opening.
- Modeless and marked inline fallback computed **relative**, overriding only the shared
  static screen baseline; no native helper or shared stylesheet behavior was changed.
- Earlier authored motion computed `audit-motion / 5s / smooth`; enabling reduced
  motion changed both surface and backdrop to **none / 0s / auto**.
- Revealed error feedback computed **4px solid rgb(172,38,53)** with **8px** inset,
  pending text computed **600**, and forced colors changed the error border to the
  system foreground.

Regression tests protect mode-specific positioning, repeated-base specificity and
explicit feedback/motion policies. CSS assertions normalize insignificant punctuation whitespace rather
than deleting all whitespace: descendant combinators and value token boundaries remain
significant, with a regression test protecting that distinction. The final run has
**66 passed**, including the unchanged 1,500-byte composed CSS ceiling. No semantic
assertion or budget was weakened.

**Approved dependency applied by the coordinator:** whitespace formatting of shared
`src/components/dialog/native.css` (`minifyWhitespace:true`, `minifySyntax:false`,
`legalComments:"none"`), plus local insignificant custom-property colon/comma whitespace
compaction in Dialog CSS. With the final specificity guards, the actual files measure
**5,218 raw / 1,496 gzip bytes**,
including current line endings, rather than the earlier in-memory proposal's 1,492.
Every selector, declaration, backdrop color, native behavior and ceiling is preserved.
The coordinator owns the shared formatting and Modal/Drawer integration/regressions.
Neither nested-selector experiments nor any semantic removal entered the solution.

### Repeated composed-stylesheet load orders

A further parent review identified ties between the compact Dialog selectors and
later shared base copies prepended to Modal/Drawer CSS. Native Dialog paint now uses
`dialog.mui-native-dialog.mui-dialog`; open nonmodal positioning uses that same
two-class guard plus `[open]:not(:modal)`. Each outranks the corresponding shared
base selector regardless of source order. Modal positioning remains browser-owned,
and public color/background/accent variables remain author overrides.

The private fixture at free loopback port **51127** loaded actual composed source
stylesheets in six orders: Dialog→Modal, Modal→Dialog, Dialog→Drawer, Drawer→Dialog,
Dialog→Modal→Drawer, and Drawer→Modal→Dialog. **All 36 combinations passed** across
light/dark and modal/modeless/all-methods-absent fallback:

- Correct light **#333639 / #fff** and dark **white .82 / #2c2c32** paint.
- Nonmodal/fallback position **relative**, close offsets **26px / 20px**, visible
  close controls, and successful native/helper close activation.
- Modal position **fixed**, top **330.40625px** before and after scrolling from
  **400 to 800**, with unchanged **446×139.19px** geometry.
- Authored foreground **rgb(10,20,30)**, background **rgb(240,220,200)** and accent
  **rgb(120,20,180)** win in every combination.

The before-selector fixture reproduced the failure under Dialog→Modal→Drawer:
dark paint reverted to **#20252b / #fff**, modeless/fallback became **static**, and
close offsets escaped to approximately **−343.33 / −617.40px**. This was a measured
cascade failure, not merely a hypothetical specificity concern. The final guard costs
only **one additional gzip byte**; no shared declaration or safety policy was removed.

## Reference and method

- Reference: [Naive UI Dialog](https://www.naiveui.com/en-US/os-theme/components/dialog),
  Naive UI **2.45.3**, Vue **3.5.30**, source commit
  `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
- Inspected `src/dialog/styles/{_common,light,dark}.ts`,
  `src/dialog/src/{Dialog.tsx,styles/index.cssr.ts}`, common theme colors and
  `_internal/close/src/styles/index.cssr.ts`. Installed reference versions and source
  commit were checked, not inferred from a latest documentation page.
- Rendered actual NDialog under NConfigProvider, with its default theme, versus
  authored `.mui-dialog` content. Both used **Arial**, **14px** document text,
  **1200×1000 CSS-pixel** viewport, **446px** containing blocks, and the same strings:
  “Review change”, “Review the local change before confirming.”, “Not now”, “Confirm”.
  The container width is a fixture constraint, not an inline NDialog default.
- Compared default/info/success/warning/error, light/dark, left/top icon placement,
  enabled hover, disabled actions, omitted actions/close, author overrides and
  core-plus-theme composition. Hover endpoint reads waited **350ms** for upstream
  transitions. Close hover paint was read from the upstream **`::before`** layer,
  not mistaken for its transparent button background.
- A private repository-local fixture used the existing esbuild and already-installed
  private Naive/Vue dependencies. Its loopback server used an OS-assigned free port
  (**63096**), not a shared demo/server or build output. Each browser pass created a
  private context/page and closed the context in `finally`. Fixture outputs were
  disposable; no vendor code, generated bundle or fixture enters the source changes.
- Before CSS was captured before editing. After measurements used rebuilt private
  outputs. No full release build, shared fixture mutation, dependency install, commit
  or push was performed by this audit.

## Inline content is not a provider/Modal

Inline NDialog has **no fixed width and no shadow**; its default border is absent.
Its Modal/provider wrapper supplies the **446px** width and modal lifetime. The old
native stylesheet applied a 32rem content width, rounded elevated surface and generic
native controls even to a section.

`.mui-dialog` now uses automatic inline sizing and border-box geometry. Only the real
`dialog.mui-dialog` gets the wrapper-aligned 446px default. This is explicitly a native
surface adaptation, not a claim that inline NDialog is modal. Both accept the existing
`--mui-dialog-width` override.

`native.ts` remains untouched; `native.css` has only coordinator-owned, approved
whitespace formatting. The shared backdrop stays
**rgba(15,23,42,.48)**, viewport bounds and scrolling remain native, and no Modal/Drawer
consumer receives these presentation changes. No upstream backdrop, shadow, scroll
lock, focus trap, provider lifetime or service semantics are silently imported.

## Measured corrections

All dimensions below are CSS pixels, rounded to two decimals.

| Field | Before | Reference / after |
| --- | --- | --- |
| Inline outer box inside 446px container | **561.33×182.33**, overflow | **446×139.19** |
| Top-icon outer box | Non-centered legacy wrapped layout | **446×179.19** |
| Padding | 24px all sides | **16px 28px 20px** |
| Default border / radius / shadow | Transparent 1px / 12px / single elevated shadow | **0 / 3px / none** |
| Title size / weight / line height | 20px / 700 / 28px | **18px / 500 / 28.8px** |
| Body size / line height | 14px / 21px | **14px / 22.4px** |
| Body margins | 16px block | **8px 0 16px**, bottom 0 without actions |
| Body origin in left-icon case | (24.67,80.67) | **(28,52.79)** |
| Action row origin / height | (24.67,117.67) / 40px | **(28,91.19) / 28px** |
| Action gap | 8px | **12px** |
| Negative / positive button widths | 67.36 / 69.67px | **71.36 / 69.01px** |
| Icon region | 32×32px including border | **28×28px** |
| Close box / origin | 24.18×40px / (512.49,24.67) | **22×22px / (398,20)** |
| Top icon / close origins | Not centered / inline close | **(209,20) / (408,10)** |
| Light body / title / surface | Inherited black / black / transparent on section | **#333639 / #1f2225 / #fff** |
| Dark body / title / surface | Unchanged light/inherited defaults | **white .82 / white .9 / #2c2c32** |

For all **20 type × theme × placement combinations**, outer surface, content, actions,
icon region, close and both action-button rectangles matched at **0.01px** reporting
precision, along with their foreground/background colors and opacity. The known icon
exception is text rendering: an authored 14px decoration occupies a 28px region,
where upstream uses a 28px SVG icon. No vendor icon artwork was copied.

The heading DOM differs intentionally: upstream puts the icon inside its title region;
the authored native header contains separate icon and heading elements. Matching text
placement and row geometry does not require replacing semantic native headings.

## Semantic types and interaction paint

The previous accent was #315ba6 for both default and info, with unrelated darker
success/warning/error tones. Native positive buttons were gray browser buttons with
bold colored text. They now use source-aligned normal-weight filled actions.

| Type | Light icon/positive fill | Dark icon/positive fill | Light / dark positive hover |
| --- | --- | --- | --- |
| default | #18a058 | #63e2b7 | #36ad6a / #7fe7c4 |
| info | #2080f0 | #70c0e8 | #4098fc / #8acbec |
| success | #18a058 | #63e2b7 | #36ad6a / #7fe7c4 |
| warning | #f0a020 | #f2c97d | #fcb040 / #f5d599 |
| error | #d03050 | #e88080 | #de576d / #e98b8b |

These use existing `--mui-color-{primary,info,success,warning,error}` and hover roles
with matching standalone fallbacks. The generic legacy text/surface/border roles are
not the NDialog palette and are not reused for those defaults.

Positive text is white/light or black/dark. Negative actions are transparent with
source-sized inset borders; hover uses the primary hover role independently of Dialog
type. Source and native hover endpoint colors matched for all ten positive cases and
both negative cases. Close hover uses black **.09** / white **.12**, matching upstream's
pseudo-element paint. Disabled opacity/cursor matched **.5 / .38 / not-allowed**;
enabled-only hover rules cannot repaint a disabled action.

Native buttons remain keyboard reachable, with a **2px** semantic focus outline and
**3px** offset. This deliberately differs from source closeFocusable=false and source
button focus paint. Distinct pressed shades, button waves and transition animation
remain unsupported; a pressed pointer button keeps hover paint. An explicit reduced
motion rule resets animation, transition and smooth scrolling on the surface/backdrop;
it overrides earlier same-specificity authored motion.
No disabled prop, icon API, theme object forwarding or button-prop bag was invented.

## Author precedence and retained native behavior

Public color/background/accent/border/width variables are consumed, never overwritten
with component defaults. Inherited and local overrides remain effective even on
semantic variants; an accent override also wins on hover. Actual core-plus-theme reads
confirmed the same dark surface and semantic paint as standalone CSS. An explicit light
surface inside a dark document reset to the light defaults. Custom body
**rgb(10,20,30)**, surface **rgb(240,220,200)** and accent **rgb(120,20,180)** won.
The source font family remains inherited from the document.

Only marked decision buttons receive the action skin. Unmarked native form controls
are not restyled. Authored error/pending regions retain the pre-existing red error
border/inset and pending weight, with alert/status semantics and without an invented
spinner or generated labels.
Hidden close controls no longer reserve heading space; missing actions remove the
bottom content margin.

Real Chromium verification retained:

- `showModal()` and `:modal`, named autofocus heading, **446×139.19** native surface;
  unchanged native backdrop and no added shadow.
- False decisions keep the opening and restore busy/disabled state.
- Escape closes and restores the opener; marked close returns `"close"`.
- Invalid `method=dialog` form remains open; valid form closes with `"saved"` without
  entering the enhanced decision lane.
- At **320×640**, RTL and **2× CSS zoom**, long content yields a
  **240.67×560.67** surface at **(32,32)**, no internal horizontal overflow, vertical
  scrolling and a keyboard-reachable action footer.
- Forced colors retain surface/control borders and system text/background. Reduced
  motion computes animation `none` and transition duration `0s`. Print removes the
  height cap and backdrop paint; actual top-layer print positioning remains browser
  policy, not a custom layout engine.

Runtime/lifecycle, form interception policy, close/cancel semantics, template ownership
and focus restoration code did not change. Legacy `<mui-dialog>` remains outside this
CSS-only retained native audit. No missing binding/template/service APIs were added.

## Targeted validation and budgets

`npm test -- --run tests\dialog.test.ts`: **66 passed**.
Regression coverage includes default rules, neutral/semantic role selection, disabled
and override selectors, and exact production-composed CSS gzip.

Private builds used existing esbuild: bundle, minify, target `es2022`, legal comments
`none`, sourcemaps, ESM `index.ts` and classic `global.ts`, and the production output
basenames. CSS is **not minified** by the release builder: the exact input is
`native.css + "\n" + dialog.css`. All gzip reads use **level 9**.

| Asset | Raw bytes | gzip bytes | Unchanged ceiling |
| --- | ---: | ---: | ---: |
| Dialog ESM | 12,062 | 4,319 | 5,500 |
| Dialog classic | 12,323 | 4,442 | 5,500 |
| Dialog composed CSS | 5,218 | 1,496 | 1,500 |

ESM/classic runtime outputs are unchanged. CSS has **4 bytes headroom** under its
unchanged ceiling with all required policies restored. The approved formatting above
is applied; this measurement uses the actual composed source, not a hypothetical
minified output. No budget or builder edit, compression trick, generated adapter edit,
runtime dependency or full build was performed.

## Coordinated release integration

The coordinator's isolated release `pnpm build` and all **192 related tests** passed:
66 Dialog, 44 Modal, 36 Drawer and 46 Radio. Final CSS gzip is **1,496 Dialog /
950 Modal / 1,208 Drawer**; each remains within its unchanged ceiling. The Dialog
checkout output is **5,219 raw bytes**. Shared native CSS formatting changes no
declarations, selectors or media behavior.

The coordinator also exercised actual emitted styles in Chromium, loading **Dialog,
then Modal, then Drawer**. In dark mode the modal stayed fixed at **top 352.40625px**
across window scroll **400 to 800**. Modeless and inline-fallback surfaces remained
relative; close controls stayed inside each surface at **20px top / 26px end**.
All modes retained **#2c2c32** background and white/.82 text after later base sheets.
These regression fixes were completed before publication.

This is Chromium plus existing jsdom validation, not cross-browser, physical touch,
screen-reader, complete upstream API or icon/pixel-equivalence certification.
