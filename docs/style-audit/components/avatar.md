# Avatar / AvatarGroup default-style audit

**2026-09-10 — corrected and rendered-verified for the scope below; not full pixel/API parity.**
This new default-style pass supersedes the earlier decision to preserve the legacy circular
default. No Button work is included. No runtime dependency or budget was added.

## Reference and reproducibility

- Official documentation: <https://www.naiveui.com/en-US/os-theme/components/avatar>.
- Source: Naive UI **2.45.3**, commit
  [`42a52e6436b38bed456fee19eb0b89cdcd00fcc2`](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2).
  Inspected `src/avatar/src/Avatar.tsx`, `src/avatar/src/styles/index.cssr.ts`,
  `src/avatar/styles/light.ts`, common light/dark and `_common.ts`, AvatarGroup controller,
  group theme/CSS, and `src/global-style/src/GlobalStyle.ts`.
- `npm view naive-ui version` returned **2.45.3**. The rendered package is the same pinned
  published **naive-ui@2.45.3**, with **vue@3.5.30**; not the upstream development repository.
  `npm ls --depth=0` verified both installed versions.
- Isolated private fixture:
  `C:\Users\chengzhu\.copilot\session-state\99fde562-4396-4c35-9601-b00d03e1c14e\files\style-reference`.
  `package.json` pins both direct dependencies; `package-lock.json` locks the complete tree.
  Lock SHA-256: `a9e02efaf82d0335b797406ed11030c00b58b74f1123b84f49e3c97e5d82ee9c`.
  Lock integrity: Naive `sha1-e+bhY/GwTgKQMCdC4ghT7sFlDdY=`,
  Vue `sha1-Zt8l6Xla8+VSKzbyTz0pD96D+KA=`.
  Installed with `npm install --ignore-scripts --no-audit --no-fund`; no MarkupUI manifest change.
- In that directory, `npm run build` uses MarkupUI's existing esbuild to bundle `reference.js`.
  `node server.mjs` serves `http://127.0.0.1:4190/reference.html` and `/markup.html`.
  The attached PowerShell session is **`avatar-reference`** (not detached). Explicit fixture
  asset allowlist plus the MarkupUI `dist` root only; traversal outside those roots is rejected.
  No source tree or arbitrary filesystem URL endpoint is exposed.
- Reference page: `NConfigProvider theme=null`, `NGlobalStyle`, normal default props except
  required text/image/group content and the individually labeled variant. `?dark` selects
  the actual `darkTheme`. There are no website demonstration overrides or copied assets:
  the two-color 80×40 SVG is fixture-authored.
- Markup page uses the opt-in published Global Style CSS, plus Avatar CSS/ESM. `?dark`
  sets explicit `data-mui-theme="dark"`; `?core` adds canonical CSS/themes and imports core
  **after** Avatar registration. `?core&reverse` reverses external CSS order.
  `?core&legacy` loads only the legacy Avatar definition/CSS; groups there are intentionally
  unregistered, illustrating the documented entrypoint boundary.
- Separate documents isolate both libraries' styles. Same Chromium **151.0.7922.174**,
  Windows font environment, **1000×1250 CSS-pixel viewport, DPR 1**, `AB`/`Alexandria` labels,
  and local image. No webfont downloaded; the common `v-sans` stack falls through to the
  local system font. Fixture layout uses the same 24px padding and flex rows on both pages.
- Reusable browser measurement, after the page has rendered:
  `await page.evaluate(async () => (await import('/measure.js')).measure())`.
  It returns computed properties, actual bounding boxes, image fit/loading, transformed text
  dimensions, and group offsets. Do not substitute theme-token comparison for this measurement.

**Box model matters:** the official Avatar CSS and `NGlobalStyle` do not install a universal
border-box reset. Thus default Avatar is 34×34; a 2px bordered Avatar/group member is **38×38**.
Using a website/application reset would change that reference and must be declared separately.

## Exact mismatches and results

“Before native” means the pre-pass standalone Avatar; “legacy” means canonical core CSS.
Unless separately stated, “after” applies to both. Sources of fixes:
**A** = `src/components/avatar/avatar.css`; **L** = canonical `src/components/styles.css`;
**G** = `src/components/global-style/global-style.css`; **B** = `avatar/avatar.ts`.

| Difference | Naive expected / rendered | MarkupUI before | Fix / resulting measurement | Status |
| --- | --- | --- | --- | --- |
| Default/medium size | 34×34px | Native and legacy 36×36 | A/L: 34×34 | Fixed |
| Tiny / small / large / huge | 22 / 28 / 40 / 46px | Native 36 / 28 / 48 / 36; legacy ignored presets, 36 throughout | A/L: 22 / 28 / 40 / 46, rendered individually | Fixed; native small already matched |
| Default and square shape | 3px radius, not round | Native default 50%, square 4px; legacy 50%, ignored square | A/L: default/square 3px; explicit round 50% | Fixed |
| Light fill | rgb(204,204,204), composited card/avatar color | rgb(243,244,246) | A/L: `#ccc` | Fixed |
| Light text / weight | White, inherited normal weight (400 here), 14px | rgb(82,82,91), 700; native already 14px | A/L: rgb(255,255,255), 400, 14px | Fixed; font size matched |
| Text leading / centering | Text line-height 17.5px; `AB` box 17.0625×17.5 | Native line-height 16.8px; box 18.828125×16.796875 due also to bold weight; legacy host 21px | A: absolute-centered bounded text at 1.25; L: raw text at 1.25. `AB` glyph Range is 17.0625×19 at relative offset (8.46875,7.25) in **both** native and legacy, identical to Naive | Fixed |
| Inline alignment | Baseline | Native `vertical-align:middle` | A: baseline; text-only host now has the same positioned-content baseline anatomy as reference | Fixed |
| Border and outer box | 2px solid white, content-box; outer 38×38 | Native 1px solid rgb(228,228,231), border-box outer 36×36; legacy ignored bordered | A/L: 2px white, content-box, outer 38×38 | Fixed |
| Default image fit | Native unset object-fit computes to `fill`; rendered 34×34 image | `cover`, 36×36; cropped the 2:1 test image | A/L: `fill`, 34×34 loaded image; explicit cover/contain retained | Fixed |
| Explicit dark fill/text/border | rgb(66,66,69) / white / rgb(24,24,28) | With core dark: rgb(39,39,42) / rgb(212,212,216) / rgb(63,63,70); standalone alone did not respond to the theme attribute | A/L: `#424245` / white / `#18181c`, also without core. Nested light inside dark returns to `#ccc` | Fixed |
| Three-member group | Round 38px bordered members; -12px gap; 90×38, offsets 0/26/52 | Round 36px members, 2px external outlines, -8px gap; 92×36, offsets 0/28/56 | A: real 2px borders, -12px overlap; 90×38, offsets 0/26/52 | Fixed |
| Vertical group | 38×90; y offsets 0/26/52 | 36×92; y offsets 0/28/56 | A: 38×90; offsets 0/26/52 | Fixed |
| Native overflow badge appearance | Reference rest avatar uses normal round/bordered Avatar styling | Native summary 36px, no border, inherited body font | A: summary 38×38 outer, 14px/17.5px white text, 2px border; native focus/disclosure retained | Fixed appearance; native semantics below |
| Color/border transition | 0.3s cubic-bezier(.4,0,.2,1) for border/background/text | None on either Avatar | A/L: actual computed transition matches; prefers-reduced-motion disables it | Fixed with accessibility adaptation |
| Authored inline size token | Explicit 60px override renders 60px | Native controller erased `--mui-avatar-size` on upgrade/source updates; result 36px. Legacy ignored Avatar tokens | B preserves/restores owned convenience overrides; A/L consume tokens. 60px/9px-radius, 18px monospace/600, rgb(1,2,3) fill and rgb(4,5,6) text all render as authored | Fixed coupled ownership defect |
| Shared document font family | `v-sans, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"` | Standalone global fallback system-ui/sans-serif; core began Inter/ui-sans-serif and lacked emoji fallbacks | G/L exact common stack; computed family identical on native/core/legacy. No font assets added | Fixed verified shared default |
| Shared body size / leading | 14px / 22.4px (1.6) | Global fallback 16px / 24px (1.5); core 14px / 21px | G/L: 14px / 22.4px | Fixed verified shared default |

### Remaining differences — do not claim complete equivalence

- **Automatic text fitting:** Naive renders `Alexandria` with scale **0.470769** and visual
  text bounds **30.526428×8.238464px**. Native deliberately has no text measurement engine:
  it remains **34×17.5px**, scale 1, with ellipsis. This is a visible, measured native
  limitation, not a color/font mismatch. Author font sizing remains available.
  Legacy raw text has no enhanced text wrapper/ellipsis; use the standalone entry for that
  retained behavior. Icons/arbitrary rich content and modal/popover color contexts were
  not certified by this basic default-content pass.
- **Native overflow:** `max` continues to count visible members *excluding* the summary,
  unlike Naive's count including the rest avatar. The keyboard/touch `details` disclosure
  remains in normal flow; open layout is not Naive hover expansion/popover rendering.
  Explicit `square` on a native group member still works (3px); upstream groups force round.
  A `round square` native member remains round. These native contracts are retained.
- **Legacy entrypoint scope:** default, all named sizes, round/square/bordered, image fit,
  typography, dark colors and CSS token overrides now match the same presentation.
  The legacy controller still does **not** interpret numeric `size="52"` (34px unless given
  `--mui-avatar-size:52px`) or register AvatarGroup. Enhanced entry remains required for
  numeric properties, grouping, lazy/fallback/lifecycle features. No unrelated core
  controller migration was introduced.
- **Host computed anatomy:** legacy raw text uses host line-height 17.5px; enhanced and
  reference hosts inherit 22.4px with a 17.5px inner text line. The measured short-text glyph
  geometry matches exactly; this computed difference is not concealed as equivalent DOM.
- **Document palette:** no speculative global palette changes. Light Naive body text/bg
  is rgb(51,54,57)/white; standalone Global Style remains native CanvasText/Canvas
  (black/white here), and core is rgb(24,24,27)/rgb(246,247,249). These affect surrounding
  labels/page canvas, not Avatar's opaque corrected fill/text. Later shared/global audits
  must account for them. Default light and explicit dark **Avatar** properties match, not
  the entire surrounding document.

## Validation and retained ownership

- `pnpm build` regenerates `src/components/styles.ts` from canonical CSS; generated code
  was not edited manually. Existing core/Avatar/Global Style budgets passed unchanged.
- Targeted command:
  `pnpm test tests\avatar.test.ts tests\native.test.ts tests\global-style.test.ts tests\legacy-styles.test.ts tests\config-provider.test.ts tests\element.test.ts`
  — **92 passing tests in 6 files** (19 Avatar, 27 native, 13 Global Style, 9 generator/
  legacy CSS, 12 Config Provider, 12 Element). Not a full-suite claim.
- Browser comparison found **zero property/short-text-geometry/group-offset mismatches**
  for default, five presets, numeric 52px, square, round, bordered, loaded image and explicit
  overrides, in standalone light/dark and native+core CSS in both orders. Long-text scale
  is excluded from that equality claim and recorded above.
- Legacy rendered short-text glyph positions and transitions also match, not merely the
  source tokens. No enhanced registration after core is implied: the documented registration
  conflict remains; Avatar must register before core.
- Chromium confirmed authored content/image identities and click listeners survive
  reconnect; primary image failure loads the configured real fallback and clearing the
  source restores `empty`; overflow summary retains focus and Enter toggles native details.
  Removing max restores exactly the original member identities/order.
- Chromium also verified 60px/contain inline tokens retain their `!important` priorities
  after numeric size/fit overrides are removed. JSDOM does not implement priorities for
  custom properties; its targeted test checks the native CSSStyleDeclaration API passthrough.
  Classic loading rendered the same 34px/3px/white default, and enhanced loading after the
  legacy definition produced the expected explicit registration-conflict message.
- Group `--mui-avatar-size:60px` produces 64px bordered members; explicit child `size=small`
  remains 32px outer, and authored inline 52px overrides that to 56px outer. No size-inheritance
  behavior was dropped.
- Native form validation, disabled-fieldset exclusion from FormData, successful controls
  and reset were preserved; input computed font/appearance did not change when Global
  Style was disabled. Body author Georgia/18px/2 remained Georgia/18px/36px. Nested
  explicit light/dark and reduced-motion rules were verified. No new observers, focus
  managers, form controls, clone policies or runtime dependencies were introduced.
- `git diff --check` passed. Only the intentional core CSS hash changed:
  `9f62233fa6a57d57682110d9d487a7569d79ead4cb398af24df27b6422308d29`
  → `e9da85e704ec41b78d8c514f4ece69c01903572f9c4ee34be2a05a05af87be05`.
  Test wording now protects **approved runtime CSS baselines**; exact hashing and unchanged
  advanced/widget/theme hashes remain enforced.

| Final asset | Gzip bytes | Existing ceiling |
| --- | ---: | ---: |
| Core `markup-ui.min.js` | 14,911 (before 14,633) | 15,000 |
| Avatar ESM | 2,563 | 4,000 |
| Avatar classic | 2,777 | 4,000 |
| Avatar CSS | 1,028 | 1,500 |
| Global Style CSS | 374 | 500 |

Core now has **89 bytes** of headroom: subsequent components should prefer surgical reuse
over increasing budgets. Changes include the scoped Avatar styles/controller, canonical and
generated core CSS, verified shared typography, Avatar demo, corresponding Avatar/Global
Style documentation, and targeted regression tests. The audit index links this completed
review; all other component rows remain pending.
Reference dependencies/lockfile, fixture files and browser artifacts are session-only, not
part of the repository commit. No push is performed in this pass.
