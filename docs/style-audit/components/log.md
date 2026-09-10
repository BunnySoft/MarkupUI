# Log default-style audit

**Integrated, retained native scope; not full NLog parity.** This pass changes only
Log CSS, its focused tests and documentation. Code remains an unchanged published
dependency. No controller, dependency manifest, shared theme, generated asset or builder
change is required.

## Reference and reproducible fixture

- Official source: `tusen-ai/naive-ui` revision
  `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; published runtime **naive-ui 2.45.3**,
  **Vue 3.5.30**, from the existing isolated `style-reference` package/lock.
  Lock SHA-256:
  `a9e02efaf82d0335b797406ed11030c00b58b74f1123b84f49e3c97e5d82ee9c`.
- Read `src/log/src/Log.tsx`, `LogLine.tsx`, `LogLoader.tsx`, Log light/dark themes and
  CSS, and the Code component/style used by NLog. The baseline uses `NConfigProvider`
  with `theme=null` plus `NGlobalStyle`; dark uses `darkTheme`. No website demo options,
  highlighter, source artwork or source renderer are copied into MarkupUI.
- Private session fixture:
  `C:\Users\chengzhu\.copilot\session-state\99fde562-4396-4c35-9601-b00d03e1c14e\files\log-style`.
  `node build.mjs`, `node server.mjs` and `node verify.mjs` build, serve and measure it.
  The attached server uses **127.0.0.1:54013**, an explicit asset allowlist and no
  arbitrary filesystem route. Reference/native/before CSS are separate documents.
- `before.css` and `baseline-evidence.json` preserve the original presentation.
  `evidence.json`, `budgets.json` and reference/native light/dark PNGs retain results.
  Each browser run uses its own Chrome profile and closes only its own browser.
- Shared Code is frozen at published commit
  `ec4c00ad240a7e7660f4a45e003bff26eebfd8c0`; stylesheet SHA-256
  `87dd6ab6a39a786e82ebdaed5ceca4306ffe2ce8981a8d92d35f378f60c421c2`.
  Private CSS is exactly that source plus a newline plus current Log CSS, as in the
  existing build composition. No shared Code edit or CSS normalization is used.

Chrome **151.0.7922.174**, Windows, 1000x900 viewport, DPR 1. Both documents use the
same installed fonts, 320px content width, labels and literal records. Cases include
normal/long/unbroken text, blank/trailing/empty records, forty scrollable records,
custom/fractional metrics, loading, padding, colors, optional numbers/gutter and wrap
overrides. Root font-size 20px, light/dark, forced colors, reduced motion and **dark
print** are separate probes. Comparison uses actual line rectangles and scroll/client
dimensions, not merely component-token values.

The primary native page loads documented Global Style plus the optional general themes
stylesheet. A second native page loads Global Style only, with explicit light/dark
color-scheme, to distinguish component inheritance from that optional palette.

## Findings and resulting measurements

| Surface | Pinned reference | Native before | Result / status |
| --- | --- | --- | --- |
| Text font/weight/line | Mono stack `v-mono, SFMono-Regular, Menlo, Consolas, Courier, monospace`, 14px, 400, 17.5px line | Same at a 16px root | **Matched**, same stack and actual line boxes; no font asset added |
| Root font-size 20px | Still 14px / 17.5px; viewport 263px | `.875rem` becomes 17.5px / 21.875px; viewport 350.125px | **Fixed** to 14px default; now 14px / 17.5px / 263px. Authored font-size units still work |
| Default viewport/inset | 320x263px; padding 0; no panel border/radius/background | 320x280.5px; padding 8px; obsolete +2px height allowance despite border 0 | **Fixed** to 320x263px, padding 0, border/radius 0 and transparent background |
| Custom metrics | 18px x 1.5 x 8 rows = 216px; 15.5px x 1.3 x 7 rounds to 141px | Extra default inset/allowance | **Fixed**; native actual heights 216px and 141px |
| Long record wrapping | `pre-wrap` / `break-word`; sample row heights 122.5px and 52.5px, scroll extent 320x263px | `pre` / normal; rows 17.5px, horizontal extent 1894px | **Fixed**; same sample line heights and 320x263px extent |
| Default numbers | None; NLog does not expose Code's number option | None unless authored `data-line-numbers` | **Matched** default; optional numbers remain a native extension |
| Optional gutter | No NLog equivalent; published Code sizes by digit count | Forced 5ch +12px; twelve-record inset 50.4863px | **Corrected native extension** to Code's 2ch +12px =27.3945px. Explicit 5ch override still produces 50.4863px |
| Plain text color, Global Style only | Light #333639; dark rgba(255,255,255,.82), inherited | Component already inherits | **Matched** in isolated light/dark Global Style probes; author parent rgb(12,34,56) also inherits unchanged |
| Optional general palette | Reference globals remain #333639 / rgba(255,255,255,.82) | Native themes supply #18181b / #fafafa | **Remaining contextual difference**, not a Log token bug. Palette is not overridden locally or changed globally |
| Vertical scrollbar | Custom overlay; forty records: client width 320px, content height 700px | Native OS scrollbar | **Native limitation**, retained: width 305px for the same 320px outer viewport, height 263px and content height 700px. Additional wrapping can follow from the reserved 15px |
| Empty and blank records | Empty default has zero records; `first`, blank, `third`, trailing blank have heights 17.5/0/17.5/0px | One appendable empty record; each retained blank has a 17.5px line box | **Retained native difference**: stable physical records, selection and blank-line visibility are not collapsed to reproduce source empty `pre` behavior |
| Loading | Animated 111.71875x34px overlay pill, 17px radius, spinner and themed backing; top 8px/right 16px | Authored outside text, 22.390625px high; `aria-busy` on pre | **Retained native difference**. No spinner/provider/localization or overlay ownership is added. Removed a stale dashed-border rule that painted no default border |
| Dark print | Source has no equivalent full retained native print policy | Native viewport inherits white text/dark color-scheme; root backing follows dark page | **Fixed locally**: light scheme, black CanvasText on Canvas backing, transparent pre/code; authored screen text/background tokens cannot make this fallback white-on-paper |
| Forced colors | Browser/source adaptation differs from the retained native regions | Existing Code system colors | **Matched native accessibility requirement**, kept: black text/white Canvas in the active palette, including custom screen colors, readable status and no forced-color-adjust override |

Font/height/padding/gutter/wrapping changes are in `src/components/log/log.css`.
Print rules are Log-local and do not change ordinary Code. The first height declaration
is an unrounded fallback for engines without CSS `round()`; at defaults that fallback
is 262.5px, a documented 0.5px source difference. No JavaScript geometry bridge is added.

## Author and native behavior boundaries

Screen overrides remain effective: a 6px padding produces a 275px automatic viewport;
an explicit 120px height wins; the measured author case keeps rgb(120,40,80) text,
rgb(250,240,220) background and a monospace font. Code's border-color token remains an
inset shadow rather than consuming layout space. The controller never writes style
attributes and does not overwrite authored styles on disconnect. An authored root
`--mui-code-gutter: 4ch` still produces a 42.7891px inset; the automatic fallback does
not shadow this existing Code override.

`--mui-log-white-space: pre` plus `--mui-log-word-break: normal` restores horizontal
scrolling (1886px sample extent after removal of the default inset). Explicit
`data-word-wrap` retains Code's stronger break-all/anywhere behavior and hidden number
markers. Normal Log wrapping can show optional logical-record numbers, including on
multi-line records; this is not a public NLog feature.

Print expands forty records to **700px**, wraps the explicit nowrap case, hides number
markers/loading status, and renders the default, loading and authored-color cases
black with a light scheme. The white Log backing remains readable even when the
surrounding application still prints a dark theme. Reduced motion has **zero native
animations**, with loading words still visible. No claim of source loader fade/scale or
spinner motion is made.

Actual native controller probes retained:

- Follow at the tail ends at top=max=455px after append; a reader's surviving row/Text
  identity and -12.5px visual anchor offset remain unchanged after trimming two heads.
- Selection of `record 6` survives append elsewhere. Existing selected-record rejection,
  partial CR, retention/bounds and loading/lifecycle tests remain intact.
- Focus remains on the native readout; explicit vertical scrolling preserves
  `scrollLeft=50`. Literal `<img>` text creates no element or link.
- FormData contains only the unrelated native input; native reset restores that input
  without clearing log text. Disconnect retains existing record nodes.

Empty records, native focus/keyboard/scrollbars, stable mounted spans, optional loading
text and append/follow/retention policies remain deliberate retained semantics. No
virtualization, syntax engine, transport, live region, binding/template or provider
redesign is part of this pass.

## Focused evidence and integration boundary

`pnpm exec vitest run tests\log.test.ts tests\log.styles.test.ts tests\code.test.ts`:
**79 passing tests** (59 controller, 6 new Log style, 14 unchanged Code).
Private source compilation and browser assertions cover the measurements above.

| Private asset | Bytes | gzip level 9 | Unchanged ceiling |
| --- | ---: | ---: | ---: |
| Original Code + Log CSS | 5,506 | 1,565 | 1,750 |
| Corrected Code + Log CSS | 6,006 | **1,679** | **1,750** |
| Log ESM helper | 11,507 | 4,745 | 6,000 |
| Log classic helper | 11,774 | 4,889 | 6,000 |

The readable Log fragment is 1,300 bytes; the CSS ceiling applies to the **composed**
asset, not that fragment. Private JS figures exclude distribution sourcemap trailers;
runtime source is unchanged. Parent integration still owns the full release build and
actual-distribution accounting. No full build, commit or push was run in this pass.

## Integration

The isolated release build and **79 Log/Code tests** passed. Actual composed CSS is
**6130 raw / 1678 gzip bytes**, under the unchanged **1750-byte ceiling**.
Distribution ESM/classic, including source-map trailers, are **4774/4920 gzip bytes**,
each below 6000. Code remains unchanged; native scrollbar, blank-record and loading
presentation differences remain documented above.
