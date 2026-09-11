# 2. Web renderer and prefix

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
4. Public data attributes use `data-m-*`.
5. JavaScript classes and the global API use `M*` and `m`.
6. The package name and `markup-ui-*` asset filenames do not change.
7. No old-prefix alias is registered or documented.
