# Element default-style audit

**2026-09-11 — not applicable: native authoring has no component-owned defaults.**
No source, stylesheet, package entry, generated asset or budget was added or changed.
This audit documents the existing native composition boundary.

## Reference and classification

Naive UI 2.45.3 at pinned commit
`42a52e6436b38bed456fee19eb0b89cdcd00fcc2` exposes a renderer that selects a tag,
applies `role="none"` and derives common-theme CSS variables.

MarkupUI intentionally has no corresponding visual component. Authors choose the actual
semantic HTML element and style it through ordinary application CSS and explicitly
available inherited custom properties. The existing abstract `MuiElement` controller
base is unrelated infrastructure, not an Element renderer or style owner.

The default-style result is therefore **⏭️ Not applicable**, not Matched: there is no
Element-owned surface whose pixels can be compared or whose stylesheet can be aligned.

## Preserved boundary

- No `mui-element` registration or `@dataengine/markup-ui/element` export exists.
- No Element CSS bundle, theme object, provider merge or automatic variable aliasing exists.
- Native heading, link, button, form and grouping semantics remain author-owned.
- The source's universal presentation role is not copied over real semantic elements.
- Config Provider example CSS remains application composition, not an Element dependency.

Adding a wrapper stylesheet only for visual parity would create ownership that the native
resolution deliberately avoids.

## Validation

All **12 Element tests** pass, covering native semantics, stable authored nodes, cascade
and optional local event wiring. No CSS size measurement applies because no package
stylesheet exists. Full Config Provider/native integration remains part of the parent
final pass.
