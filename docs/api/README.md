# Implemented APIs

This section describes the APIs implemented by the current rewrite, not every component
in the target inventory.

1. [Core and ViewElement](01-core.md): direct DOM access, registration and small typed helpers.
2. [Avatar demo and API](../../demo/components/avatar.html): examples, required files, reflected API tables and behavior.
3. [Button demo and API](../../demo/components/button.html): native Button/ButtonGroup behavior, required files and reflected API (payload acceptance pending).

Implemented component pages under `demo/components` are the end-user reference. Do not
maintain a second Markdown copy of their API tables or usage examples.

## Select only what you use

| Need | Load |
| --- | --- |
| Author a component or inspect the Web base | `@dataengine/markup-ui/core` |
| Use Avatar | `@dataengine/markup-ui/avatar` and its CSS; ESM imports core automatically. |
| Use Button/ButtonGroup | `@dataengine/markup-ui/button` and its CSS; ESM imports core automatically. |
| Use classic scripts | Core first, then the selected component scripts and CSS. |

No jQuery dependency, query wrapper, state/binding runtime or all-components bundle is
required for Avatar or Button. The new binding/template runtime remains a separate planned feature.
Choose one core format/version for the application; do not mix independently loaded ESM
and classic cores.

## References

- [Source pattern](../architecture/06-source.md)
- [Modular delivery](../architecture/07-modules.md)
