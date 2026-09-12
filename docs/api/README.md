# Implemented APIs

This section describes the APIs implemented by the current rewrite, not every component
in the target inventory.

1. [Core and ViewElement](01-core.md): direct DOM access, registration and small typed helpers.
2. [Avatar demo and API](../../demo/components/avatar.html): examples, required files, reflected API tables and behavior.
3. [Button demo and API](../../demo/components/button.html): accepted native Button/ButtonGroup behavior, required files and generated API.
4. [Card demo and API](../../demo/components/card.html): named regions, finite segmentation, native close intent and required files.
5. [Carousel demo and API](../../demo/components/carousel.html): native paging, settled identity, safe autoplay, lifecycle and required files.
6. [Collapse demo and API](../../demo/components/collapse.html): accepted keyed native disclosures and named regions.
7. [Divider demo and API](../../demo/components/divider.html): independent title content, native rule semantics and selected-file loading.
8. [Dropdown demo and API](../../demo/components/dropdown.html): native command/navigation hierarchy and canonical regions.
9. [Icon demo and API](../../demo/components/icon.html): passive authored graphics, typed sizing, theme depth and IconWrapper.

Implemented component pages under `demo/components` are the end-user reference. Do not
maintain a second Markdown copy of their API tables or usage examples.

## Select only what you use

| Need | Load |
| --- | --- |
| Author a component or inspect the Web base | `@dataengine/markup-ui/core` |
| Use Avatar | `@dataengine/markup-ui/avatar` and its CSS; ESM imports core automatically. |
| Use Button/ButtonGroup | `@dataengine/markup-ui/button` and its CSS; ESM imports core automatically. |
| Use Card and its regions | `@dataengine/markup-ui/card` and its CSS; ESM imports core automatically. |
| Use Carousel and its regions/items | `@dataengine/markup-ui/carousel` and its CSS; ESM imports core automatically. |
| Use Collapse and its regions/items | `@dataengine/markup-ui/collapse` and its CSS; ESM imports core automatically. |
| Use Divider | `@dataengine/markup-ui/divider` and its CSS; ESM imports core automatically. |
| Use Dropdown and its regions | `@dataengine/markup-ui/dropdown` and its composed CSS; ESM imports core automatically. |
| Use Icon/IconWrapper | `@dataengine/markup-ui/icon` and its CSS; ESM imports core automatically. |
| Use classic scripts | Core first, then the selected component scripts and CSS. |

No jQuery dependency, query wrapper, state/binding runtime or all-components bundle is
required for the direct ViewElement component families. The new binding/template runtime remains a separate planned feature.
Choose one core format/version for the application; do not mix independently loaded ESM
and classic cores.

## References

- [Source pattern](../architecture/06-source.md)
- [Modular delivery](../architecture/07-modules.md)
