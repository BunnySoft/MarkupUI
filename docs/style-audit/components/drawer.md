# Drawer default-style audit

**2026-09-10 — integrated; retained native modes and safety policies.**

The coordinator's isolated release `pnpm build` and all **156 Drawer/Modal/Dialog
tests** passed (41/49/66). Final composed Drawer CSS is **4,983 raw / 1,357 gzip
bytes**, below the unchanged 1,500-byte ceiling. This checkout value supersedes
the private fixture estimate below; shared runtime and styles remain unchanged.

## Reference and isolated method

- Reference: [Naive UI Drawer](https://www.naiveui.com/en-US/os-theme/components/drawer),
  Naive UI **2.45.3**, Vue **3.5.30**, source commit
  `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
- Inspected Drawer props, DrawerContent, light/dark themes and style rules. Source
  defaults are physical **right**, `defaultWidth/defaultHeight=251`, native scrollbar
  enabled, and DrawerContent `closable=false`. Header/footer are rendered only when
  their content is supplied.
- Actual NDrawer/NDrawerContent rendered under NConfigProvider. Same Arial document
  font, 14px/1.6 body, **1200×800 CSS-pixel** viewport, and strings “Review details”,
  “Review the local change before confirming.” and “Authored footer”. Optional-close
  and omitted-region fixtures were also exercised.
- Chromium **151.0.7922.174** on Windows. Source transitions settled for **400ms** before
  endpoint reads. Every pass used a private context/page closed in `finally`.
- Private repository-local fixture used existing esbuild and existing private pinned
  dependencies, with OS-assigned loopback port **65089**. Before CSS was captured before
  editing. No shared fixture, public server, generated release output or production
  dependency was modified.

## Measured corrections

The native root remains an HTMLDialogElement. Its **fixed native modal positioning**
was retained; source `.n-drawer` absolute positioning inside its provider container was
not copied onto it.

| Field | Native before | Reference / native after |
| --- | --- | --- |
| Side extent | **384px** from 24rem | **251px** |
| Top/bottom extent | **384px** | **251px** |
| Default side | Physical right | Physical right, unchanged |
| Outer border | 1px #9ca7b6 | **No outer border** |
| Right corners | Square | **3px 0 0 3px** |
| Left corners | Square | **0 3px 3px 0** |
| Top corners | Square | **0 0 3px 3px** |
| Bottom corners | Square | **3px 3px 0 0** |
| Header/body-content/footer padding | 16px all sides | **16px 24px** |
| Header text | 20px / 700 / 30px leading | **18px / 500 / 18px leading** |
| Body leading, 14px fixture | 21px | **22.4px** |
| Light body / title / surface | #20252b / inherited / white | **#333639 / #1f2225 / white** |
| Dark body / title / surface | Same light defaults | **white .82 / white .9 / #2c2c32** |
| Dividers | #9ca7b6 | **#efeff5 light / white .09 dark** |
| Mask | rgb(15 23 42 / .48) | **black .3** |
| Shadow | None | **0 6px 16px −9px black .08; 0 9px 28px black .05; 0 12px 48px 16px black .03** |

Actual source shadow values were the same in both themes. Drawer mask is **.3**, not
the Modal mask's .4; neither was guessed from generic overlay tokens.

With the same supplied title/footer and **no close control**, all **eight physical
side × theme** comparisons matched computed surface/shadow/corner/mask paint, region
padding, typography, header/footer/body heights and relative block positions:

- Side header **50.667px**, body **694.271px**, footer **55.063px**, total **800px**.
- Top/bottom header **50.667px**, body **145.271px**, footer **55.063px**, total **251px**.
- Title origin **(24,16)**; body begins at **y=50.667**.
- With header/footer omitted, native body filled the full **800px** side panel and no
  missing regions or controls were invented.

The source viewport is scroll-locked by default; the retained native document is not.
At 1200×800 the reference right edge ended at 1200, while native ended at **1184.667**
beside the visible scrollbar. Horizontal native panels similarly measured **1184.667px**
instead of 1200. This preserves layout-viewport sizing and noninterference rather than
adding body locking, scrollbar compensation or visualViewport machinery.

## Native differences and preserved contracts

DrawerContent `closable` defaults false. Native close remains an **authored native
form/button**, not a generated SVG or hidden callback API. When included:

- Source close icon box is **18×18px** with a 22px hover area; native button remains
  **40px high** under the existing 2.5rem control policy.
- Native header is then **72.667px**, versus reference **50.667px**, leaving 22px less
  body space. This deliberate accessibility/control adaptation was not removed to
  manufacture pixel parity.
- Native hover/disabled styling remains browser-owned. A disabled close neither closed
  nor accepted focus; native form validation and actual return values remain intact.
- No copied vendor icon, new closable option, resize control, animation, preset, binding,
  render function or service API was introduced.

The native body section owns scrolling; its authored padding region is not a cloned
framework scrollbar wrapper. Header/footer keep overflow safety and **35%** maximum
extents; body keeps its **3rem** minimum. At normal heights the body scrolls independently.
At viewports no taller than **20rem**, the whole panel scrolls so large fixed regions
cannot hide controls. These are retained native policies, not complete Scrollbar props.

The strong `.mui-native-dialog.mui-drawer` root and backdrop selectors survive later
shared base copies from other overlay stylesheets. Root styling never uses generic
legacy text/surface roles. Focus uses the existing semantic primary role with correct
standalone light/dark fallbacks.

Public width/height/padding/border/radius/color/background/focus variables are consumed,
never overwritten with defaults. Border color remains configurable; authors provide an
outer border width when they want a visible border. Internal corner state resets per
surface. A nested default-right Drawer inside a left Drawer retained its own right-edge
rounding rather than inheriting the parent's private corner value.

## Load order, native modes and author overrides

**216 cases passed:** six permutations of composed Drawer/Modal/Dialog stylesheets ×
light/dark × all six physical/logical placements × modal/modeless/explicit fallback.
Every stylesheet included the actual native base, not just component-only CSS.

In every case:

- Foreground/background, mask, shadow, default extent and reachable close were correct.
- Modal computed **fixed** when opened at **scrollY=400**, and x/y remained exactly
  unchanged after **scrollY=800**. Physical/logical docking was checked against the
  native layout viewport. Modeless and explicit inline fallback remained **static flow**.
- Native close activated successfully. HTML/body overflow styles remained untouched.
  Fallback used explicit `show()`; unavailable `showModal()` was not silently downgraded.
- Overrides won: side width **320px** or horizontal height **180px**, padding
  **12px 18px**, radius **9px**, border **rgb(11,22,33)**, body **rgb(1,2,3)**,
  background **rgb(4,5,6)** and focus **rgb(7,8,9)**.

Eight additional LTR/RTL cases verified that physical left/right do **not** flip, while
inline-start/inline-end do, with matching exposed-edge corners. Logical aliases remain
native additions for horizontal writing modes; no upstream logical-placement API is
claimed.

## Print and safety checks

**36 print cases passed:** both forward/reverse composed-sheet orders × six placements
× modal/modeless/fallback, in dark theme. Every open surface had:

- Shadow **none**, backdrop **transparent**, no fixed positioning, and max block size
  **none**.
- Full available print width, natural **182.125px** fixture height rather than a
  residual 251px top/bottom cap, and visible header/body/footer overflow.
- An all-open-mode print selector whose specificity overrides the edge-specific sizing
  rules. Print resets are not limited to `:modal`, so modeless/fallback shadows cannot
  survive the reset.

Other actual Chromium checks:

- Body scrollTop **500px** left header/footer positions unchanged and root scrollTop 0.
- Invalid native form stayed open and focused the required field; valid form closed
  with `"closed"`. Cancel veto kept the panel open; the next Escape closed it and
  restored its opener.
- Default outside click did not dismiss; explicit backdropDismiss did. A transparent
  mask remained truly modal and blocked background focus.
- Earlier authored motion `probe / 5s / smooth` reset to **none / 0s / auto** on both
  surface and backdrop under reduced motion.
- Forced colors retained system text/surface/borders and removed shadow. Explicit
  light scope inside dark reset the surface to white.
- At **320×640, RTL and 2× CSS zoom**, all six placements had no internal horizontal
  overflow and a reachable working footer. Side panels measured **304.67×640px**;
  horizontal panels **304.67×502px**, with bottom y **138px**.
- At **1000×240**, whole-panel fallback scrolling reached the footer with root
  scrollTop about **2176.67px**; body overflow was visible and header maximum was none.

Native modality, focus ownership, generation/cancellation, ancestor observation,
template ownership, form semantics and teardown code are unchanged. Shared native,
Modal and Dialog sources were not edited.

## Validation and unchanged budgets

`npm test -- --run tests\drawer.test.ts`: **41 passed** (36 existing + five style/budget
regressions). Assertions cover exact defaults, physical/logical corner mappings and
reset, author variables, strong paint/mask selectors, fixed modality, scrolling/control/
motion safeguards and all-mode print rules. Formatter tolerance preserves selector
combinators and value-token boundaries.

Private builds used the existing production entry basenames/options: bundled/minified
ESM `index.ts` and classic `global.ts`, target `es2022`, sourcemaps, legal comments none.
CSS is the actual **native.css + newline + drawer.css** composition; canonical Drawer
whitespace was formatted with existing esbuild `minifyWhitespace:true`,
`minifySyntax:false`. Gzip uses **level 9**.

| Asset | Raw bytes | gzip bytes | Unchanged ceiling |
| --- | ---: | ---: | ---: |
| Drawer ESM | 10,510 | 3,956 | 4,750 |
| Drawer classic | 10,770 | 4,082 | 4,750 |
| Actual composed Drawer CSS | 4,981 | 1,354 | 1,500 |

Runtime outputs are unchanged. CSS has **146 bytes** headroom. No full build, shared or
other-component CSS edit, generated/index/builder edit, runtime dependency, commit or
push was performed. Private fixture/server/context are cleaned up after verification;
the coordinator owns release integration.

This is Chromium plus existing jsdom coverage, not all-browser, physical-touch,
screen-reader, complete framework API or full pixel-equivalence certification.
