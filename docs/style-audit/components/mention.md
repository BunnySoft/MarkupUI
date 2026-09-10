# Mention default-style audit

**2026-09-11 — Input ownership and menu density fixed; adjacent native panel retained.**
Changed Mention CSS, its existing fixture, demo composition and canonical/audit
documentation. Controller code, Input/Form sources, generated files and dependencies are
unchanged. No full build or commit.

## Reference and method

Compared Naive UI 2.45.3 at pinned commit
`42a52e6436b38bed456fee19eb0b89cdcd00fcc2` with the local Mention demo. Chromium measured
the source's generated Input and open mention menu.

The reference uses a caret-positioned follower, generated Input and select-menu options.
MarkupUI keeps an original native input/textarea and a named adjacent region of real
buttons in document flow. Control density and palette are comparison targets; caret
geometry, portal topology and listbox keyboard behavior remain intentionally omitted.

## Fixed defaults

The source medium Input measured **34px** high with 14px type, 12px inline padding and
3px corners. Its menu uses 14px type, 3px corners, **34px** options and 12px option
padding. Mention now provides:

- **28 / 34 / 40px** small / medium / large standalone controls and options;
- 14 / 14 / 15px type, 12px inline control/option padding and 3px corners;
- source-like light/dark field, popup, hover and disabled roles;
- a bounded 7.6-option scrolling region and source-like popup shadow.

The adjacent panel retains authored headings, instructions and status, so it uses 8px
content padding rather than reproducing the source menu's generated internal topology.
Native candidate button labels remain visible and may determine a wider panel.

## Input composition ownership

The previous `.mui-mention__editor` selector restyled controls marked
`data-input-control`, competing with the composed Input stylesheet. Mention now excludes
those controls from standalone field paint and sizing. The demo explicitly links
`markup-ui-input.css` because it loads and uses the Input component; it no longer relies
on selector leakage from Mention.

Autosize remains a Mention-specific progressive enhancement on the original textarea.
Mention does not import Input CSS or change runtime dependencies.

## Media and retained differences

Forced colors use Canvas, ButtonText, Highlight and HighlightText with no shadow. Print
hides transient suggestion panels and keeps standalone native editor contents. The panel
remains ordinary flow, not caret-anchored or portalled, and editor Enter/Tab/arrows remain
native rather than becoming select-menu navigation.

## Validation and budget

Four checks in the existing fixture cover the **1,250-byte** ceiling, reference sizing,
Input ownership and forced-color/print behavior.

| Mention CSS | Raw bytes | gzip level 9 | Ceiling |
| --- | ---: | ---: | ---: |
| Before | 1,457 | 558 | 1,250 |
| After | 3,607 | 960 | 1,250 |

Chromium confirmed a **34px** standalone input and option, 14px type, 12px inline
padding, 3px corners and explicit Input CSS composition. All **79 Mention tests** pass.
Full Input/Form/build validation remains with the parent final pass.
