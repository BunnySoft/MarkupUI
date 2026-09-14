# 2. Web renderer and prefix

> **Historical reference.** Preserved from the previous documentation layout. This page is not the current design or a completion claim for the ViewElement rewrite.

The existing MarkupUI browser implementation becomes the Web renderer. Native controls,
light DOM, Shadow DOM and CSS remain valuable, but they are renderer details.

## Primary syntax

New architecture:

```html
<m-button type="primary">Save</m-button>
<m-card>
  <m-card-header>Profile</m-card-header>
  <m-card-content>Content</m-card-content>
</m-card>
<m-divider></m-divider>
```

## Public versus internal DOM

| Content | Web choice |
| --- | --- |
| Public semantic application content | Light DOM |
| Independently reusable component | `m-*` Custom Element |
| Passive compound region | `m-card-header`-style light-DOM part or semantic native alternative |
| Private invariant chrome | Shadow DOM when justified |
| Repeated/deferred content | Web template adapter for logical templates |

The logical API must not depend on whether the renderer chooses `hr`, `button`, `details`
or another native element internally.

## Binding authoring

Web syntax remains:

```html
<m-avatar data-bind-src="profile.src"></m-avatar>
<input data-model-value="profile.name">
```

The attributes produce logical binding descriptors. They are not the cross-platform
serialization format.

## Prefix migration rules

1. All public Web component names use `m-*`.
2. CSS classes and variables use `.m-*` and `--m-*`.
3. Custom events use `m:*`.
4. Private renderer markers use scoped `data-part` and `data-state`; existing public
   directives keep their documented syntax.
5. New logical and JavaScript control classes are unprefixed and derive from the Web
   `ViewElement`; the Web namespace remains `m-*`.
6. The package name and `markup-ui-*` asset filenames do not change.
7. No old-prefix alias is registered or documented.

Existing `M*` class exports record the transitional renderer implementation. Individual
[Element Contracts](../../elements/README.md) govern their replacement and do not
add aliases for the removed names.

The [full component rewrite](../../architecture/04-rewrite.md) applies this base and public surface
to every retained Web UI component. Its [metadata design](../../architecture/05-meta.md) replaces
handwritten definitions with class declarations and a static `.meta` accessor returning
`ElementMeta`. This is the target API, not a claim that current exports have already changed.

## Current documentation

[Read the current design](../../architecture/README.md).
