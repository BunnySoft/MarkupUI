# Highlight default-style audit

**Integrated defaults fixed, 2026-09-10.** Scoped CSS correction in the retained native text helper.
Matching, validation, limits, escaping, node ownership and helper exports were not changed.
No parser/sanitizer, template/binding or rich-content scope was introduced.

## Reference and fixture

- Official page: <https://www.naiveui.com/en-US/os-theme/components/highlight>.
- Pinned source/runtime: **Naive UI 2.45.3**, commit
  `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`, using existing **Vue 3.5.30** dependencies.
- `src/highlight/src/Highlight.tsx` renders a span and native marks, using the configured
  prefix and optional author classes/styles. It does **not** load a component stylesheet or
  theme. There are no Highlight light/dark style files or injected default mark rules.
  Thus the trustworthy default is the actual browser-native mark, not a customized site demo.
- Private fixture:
  `C:\Users\chengzhu\.copilot\session-state\99fde562-4396-4c35-9601-b00d03e1c14e\files\highlight-style`.
  `node build.mjs` bundles only private reference/helper files and copies current CSS.
  `node server.mjs` serves an explicit loopback asset allowlist.
  Active attached session: **`highlight-style-preview`**, **http://127.0.0.1:50842**.
- Routes: `/reference.html`, `/native.html`, `/native.html?before`, with `?dark` variants.
  The before stylesheet is the original 345-byte-gzip source captured before editing.
- Reference uses `NConfigProvider theme=null` + `NGlobalStyle`, or actual `darkTheme`.
  Native uses its documented Global Style/themes path. Tests used separate browser
  contexts/pages, Chromium **151.0.7922.174**, Windows font environment,
  **1000×1000 viewport and nominal DPR 1**. Font raster box quantization varied slightly
  across browser runs; both sides were compared within the same context/conditions.
- Eleven cases cover ordinary and multiple matches, case sensitivity, inherited italic/
  bold serif typography, author classes, empty/no-match text, literal HTML/metacharacters,
  whitespace and a narrow long-word container.

## Exact mismatches and resulting measurements

Fix file: `src/components/highlight/highlight.css`.

| Case | Pinned rendered expectation | Native before | After / status |
| --- | --- | --- | --- |
| Default mark background | `rgb(255,255,0)` in light and dark | `#fef08a` / `rgb(254,240,138)` | Native system `Mark`, resolving to `rgb(255,255,0)` in both tested modes — **fixed** |
| Default mark foreground | `rgb(0,0,0)`, not surrounding text color | Inherited `rgb(24,24,27)` in light, `rgb(250,250,250)` in dark | Native system `MarkText`, resolving to black — **fixed** |
| Foreground in colored parent | Mark stays black inside purple text | Inherited purple | Black mark foreground, with surrounding text untouched — **fixed** |
| Radius | 0px | `.125em`: 1.75px at 14px font, 2.5px at 20px | 0px — **fixed** |
| Padding / border | 0 / none | Already 0 / none | **Matched**, retained |
| Display / default font | Inline; inherited 14px / 22.4px document typography | Matched | **Matched**, no font/line-height reset added |
| Inherited font variant | Italic 600 20px / 30px Georgia | Matched | **Matched**, retained |
| Default matched word width (`needle`) | 41.53125px | Matched | **Matched**, unchanged |
| Serif matched word width | 67.578125px | Matched | **Matched**, unchanged |
| Author class | rgb(12,34,56) on rgb(220,230,240), 4px radius, 1px/3px padding, weight 700 | Matched | Still **matched**, including when component CSS loads later |
| Dark-parent print foreground | Readable native mark foreground after removing printed background | `color:inherit` could restore white from the dark parent | Print retains the explicit color token or `MarkText`; measured black with transparent background and underline — **fixed coupled print issue** |

After correction, all **11 cases** matched the pinned reference's measured mark properties,
text content, mark counts and geometry in both light and dark. The font boxes agree between
implementations within each run; this is not a promise of identical raster metrics across
different DPR/font-rendering environments.

The default geometry for `A needle appears.` stayed 110.125px wide; its matched word stayed
41.53125px wide. The 20px serif case stayed 184.546875px wide with a 67.578125px mark.
The author class expanded its mark to 49.84375px, identically in both implementations.

## Inheritance, overrides and retained native behavior

- Native marks intentionally inherit font family/size/weight/style/line-height, but **not**
  their default foreground color. No font declarations were added to the stylesheet.
- `--mui-highlight-color` and `--mui-highlight-background` remain functional: parent tokens
  resolved to `rgb(4,5,6)` / `rgb(7,8,9)`. Author class rules and inline declarations retain
  precedence over the zero-specificity component selectors.
- A bare helper target is not assigned `mui-highlight`; it retains normal inherited
  whitespace, matching the source default. The **explicit optional** `span.mui-highlight`
  class retains pre-wrap/anywhere behavior. That opt-in case was compared against the same
  explicit author whitespace styling on the reference—not mislabeled as a default prop.
- `highlightText` still creates only text and native marks. Literal
  `<img src=x onerror=bad()> & [a+b] 😀` remained exact text and selected/copied text;
  no img/script element was created.
- Host/parent identity, author `aria-label`, link target and the host listener survived.
  A hidden target remained hidden across updating. Generated marks received no role,
  tabindex or live-announcement attributes. A rejected tag option left the prior child node
  intact. These checks validate the retained boundary, not new sanitization/parser features.
- Native forced-color adaptation is retained: HighlightText/Highlight, with the existing
  explicit forced-color adjustment policy. The tested system resolved white text on
  `rgb(55,0,110)`. Print used black text, transparent background and underline even for
  a dark parent and with forced colors active.
- There is no component-specific dark palette in the reference; introducing one would be
  an invented difference. General document palette remains outside this audit.

## Limits and honest scope

- Native `mark` rendering remains fixed; arbitrary `highlightTag` and runtime `highlightStyle`
  forwarding remain omitted. External classes/tokens are the retained styling API.
- The literal matcher still uses bounded Unicode-aware matching and its existing precedence,
  capacity and atomic-update rules. It is not the source's unrestricted regex mode and is
  not a rich-text or syntax-highlighting engine.
- Explicit preserved-whitespace and forced-color/print treatments are native adaptations.
  They are not attributed to a nonexistent Naive Highlight theme.
- No remaining mismatch was found in the tested **default mark** styling. No all-browser
  certification, arbitrary author-style equivalence or expanded matching API is implied.

## Validation and handoff

- `pnpm test tests\highlight.test.ts --reporter=dot`: **31 tests passed**, including all
  27 existing matching/ownership cases and four scoped style regressions.
- Private fixture compilation only: CSS **332 gzip bytes**, down from **345**, under the
  existing **750-byte ceiling**. The privately bundled helper remained **1139 gzip bytes**;
  helper source/exports have no diff. Actual distribution build remains the parent's task.
- Browser validation independently checked class cascade in both stylesheet orders.
  JSDOM's incomplete modern CSS cascade/variable handling was not used as proof of that
  rendered behavior; its tests verify preserved author declarations and selector scope.
- Source-ready files: `src/components/highlight/highlight.css`, `tests/highlight.test.ts`,
  `docs/components/highlight.md`, `docs/naive-ui/components/highlight.md`, and this report.
- **No shared/theme/index/generated/builder/root-demo/package edits, full build, commit,
  push or sibling broadcast.**
- Before this audit, only the owned `icon-style-preview` and `button-motion-preview`
  sessions were stopped. Their evidence files were retained; shared 4190, public 4191 and
  release 4307 were not stopped.

The coordinator's isolated release `pnpm build` and **47 combined Highlight/Timeline
tests** passed, including all **31 Highlight tests**. Built Highlight CSS remains
**332/750 gzip bytes**; matching/helper code is unchanged. Integration is complete.
