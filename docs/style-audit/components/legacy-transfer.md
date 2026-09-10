# Legacy Transfer default-style audit

**2026-09-11 — local legacy presentation corrected; native migration boundaries retained.**
The shipped Transfer controller and stylesheet remain unchanged. Corrections are confined
to the Legacy Transfer migration's local CSS, existing test, canonical guide and tracker.

## Reference and scope

- Official reference: <https://www.naiveui.com/en-US/os-theme/components/legacy-transfer>.
- Naive UI **2.45.3**, pinned commit
  [`42a52e6436b38bed456fee19eb0b89cdcd00fcc2`](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2).
- Inspected `Transfer.tsx`, `TransferHeader.tsx`, `TransferFilter.tsx`,
  `TransferList.tsx`, `TransferListItem.tsx`, `src/styles/index.cssr.ts`, and the
  Legacy Transfer light/dark themes.
- Upstream medium roles used by the comparison: **440px** width, **240px** height,
  **14px** font, **34px** item height, **38px** header, **3px** radius,
  `rgb(250, 250, 252)` light header, `rgba(255, 255, 255, .06)` dark header,
  `rgb(224, 224, 230)` light border and transparent dark border.
- Native fixture: `demo/components/legacy-transfer.html`, its local CSS/JS, and the
  existing emitted `markup-ui-transfer.css` / ESM helper. Chromium was measured at
  **900×900 CSS pixels** in a fresh context. No upstream file or generated asset was copied.

This audit owns no shared Transfer change. The modern Transfer style audit had already
corrected the reusable pane, type, control, disabled, dark, forced-color and print roles.
Only local Legacy Transfer rules that overrode or supplemented those defaults were changed.

## Corrected defaults

| Area | Before | After / pinned role |
| --- | --- | --- |
| Pane title type | Local page `h2` rule forced **17.6px / 26.4px** | **14px / 14px**, weight 400; public title/component font tokens still win |
| Header block | **48.406px**, transparent | **38px**, matching medium item-height + 4; light `rgb(250,250,252)` |
| Dark header/filter | No local Legacy header role | `rgba(255,255,255,.06)`, matching pinned dark `tableHeaderColor` |
| Filter region | Transparent wrapper | Shares the header surface and existing public/private Transfer border role |
| Count flow | Native `<p>` retained browser block margins | Margin **0**; the count box remains **34px** with 12px/18px type |
| Transfer actions | Page-wide button rule forced **44px** minimum | Shared native action default restored: **31.729px** measured |
| Migration actions | Same 44px rule mixed application and component controls | 44px minimum is now scoped only to `#migration-tools` |
| Focus | Page-wide 3px outline replaced component focus defaults | 3px remains for local application controls; Transfer keeps its shipped 2px rule |
| Scheme/print | No explicit local light/dark scheme boundary | Light by default, dark under `data-mui-theme=dark`, light again for print |

At 900px, the source pane changed from **385.719px** to **339.708px** high. The
heading correction removes 10.406px and resetting the two 14px paragraph margins removes
the remaining avoidable vertical expansion. The fixture's meaningful native labels and
listbox remain responsible for the rest of the height.

## Theme, media and author ownership

- Light rendering resolves Transfer text/title/count to `#333639`, `#1f2225` and
  `#767c82`, with white panes and the Legacy header surface.
- Dark rendering resolves white-.82/.9/.52 text roles, white-.1 panes and controls,
  transparent pane/divider borders, and the white-.06 Legacy header surface.
- Print returns the page and Transfer to a light color scheme, keeps the light header
  role and hides only the local migration tool strip. Native lists and data remain visible.
- Existing Transfer forced-color rules remain authoritative; no color, opacity or
  appearance replacement was added for native options or controls.
- A rendered author check set `--mui-transfer-title-size: 19px` and
  `--mui-transfer-border-color: rgb(1, 2, 3)`. The heading resolved to **19px** and
  pane/filter borders to the authored color.
- The local stylesheet assigns no public `--mui-transfer-*` property. It uses one
  private Legacy header fallback and consumes existing public tokens where applicable.

No `appearance:none`, fixed native select height, hidden option, synthetic checkbox,
proxy input or role substitution was added. The source and target remain real unnamed,
unrequired multiple selects; every target option remains membership and selected options
remain staging.

## Retained rendering and interaction differences

1. **Overall geometry:** pinned Legacy Transfer is a fixed **440×240px** flex renderer.
   The native fixture remains responsive. At 900px its fieldset content was
   **836.667×376.104px**, with approximately **302.167px** panes. Fixing this to 440px
   would crush the explicit text-action column and visible labels.
2. **Actions:** the source has two vertically centered icon buttons in a 72px gap.
   Native keeps four clearly named text buttons for highlighted/all add/remove actions.
   The measured action column is about **200.333px** wide.
3. **Rows:** the source renders 34px checkbox rows, hover fills, custom scrolling and
   optional virtualization. Native keeps platform option metrics inside a real
   `<select multiple size="6">`; the measured source list is **276.833×129.188px**.
4. **Header anatomy:** the source integrates select-all, title and checked/total counts
   in one renderer row. Native retains an authored heading, visible filter/list labels
   and a separate explanatory count. No checkbox/header renderer was introduced.
5. **Membership model:** source checkboxes update a controlled option-array model.
   Native selection highlights only stage moves; target DOM membership, item locks,
   FormData ownership, reset and original option identity remain unchanged.
6. **Motion:** source row entry/exit and color transitions are not recreated. Native
   movement remains immediate, reduced-motion-safe and controller-owned.
7. **Fallback:** without JavaScript the native listboxes still support platform
   highlighting, but movement and membership serialization remain unavailable. No visual
   parity claim hides that behavioral boundary.

## Regression and payload validation

- Smallest fixture:
  `pnpm exec vitest run tests\legacy-transfer.test.ts` — **13/13 passed**.
- The new existing-file regression checks light/dark/private defaults, the 38px/14px
  header role, filter/count scoping, print reset, absence of public token assignments,
  absence of select replacement/fixed height, and continued native multiple-select markup.
- Chromium rendering checks retained `["core","reader"]` membership, real multiple
  selects with empty names, dark/light/print schemes, and authored public-token precedence.
- No full build was required because no source, package, build input or distribution
  asset changed. The existing emitted Transfer assets remain within `scripts/build.mjs`:

| Asset | Raw bytes | Gzip bytes | Ceiling |
| --- | ---: | ---: | ---: |
| Transfer ESM | 17,241 | 5,986 | 8,000 |
| Transfer classic | 17,527 | 6,125 | 8,000 |
| Transfer CSS | 5,407 | 1,215 | 1,250 |

Local application payload:

| File | Raw bytes | Gzip bytes |
| --- | ---: | ---: |
| `legacy-transfer.html` | 5,645 | 1,843 |
| `legacy-transfer.css` | 2,416 | 767 |
| `legacy-transfer.js` | 4,715 | 1,613 |
| **Demo-only total** | **12,776** | **4,223** |

The complete ESM example is **11,424 gzip bytes** when the unchanged Transfer ESM/CSS
are included. No ceiling was relaxed and no new package/export/distribution file exists.

## Bounded outcome

The controllable Legacy header/filter surface, medium title metrics, count flow, theme
scheme and local-selector leakage now match the pinned renderer's roles without changing
native semantics. Fixed renderer geometry, synthetic checkbox rows, icon-only actions,
virtual scrolling and transition choreography remain explicit non-goals.

No shared style-audit index/status, README/queue, unrelated component, generated
distribution, commit or push was touched.
