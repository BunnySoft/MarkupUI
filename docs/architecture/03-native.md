# 3. Native renderer

Native implementations follow the same logical contracts, not Web HTML or a shared
executable TypeScript class. XAML and platform markup remain adapters.

Development metadata is plain documentation data, not a native base or execution engine.
Native properties and methods use their platform systems directly.

## Base adapter

| Target | Native base |
| --- | --- |
| WPF / WinUI | Native `Control` |
| .NET MAUI / Android | Native `View` |
| iOS | Native `UIView` |

Logical classes stay unprefixed. Use platform primitives internally: a native button for
Button, content containers for Card, and paged scrolling for Carousel.
`ViewElement` belongs only to Web; native targets do not inherit it.

## Mapping rules

| Surface | Native responsibility |
| --- | --- |
| Properties | Map types, defaults and validation into the target property system; update incrementally. Do not infer configuration from unrelated fields or silently replace invalid required settings. |
| Content | Map regions to content properties, collections or containers; preserve order, keys and surviving view identity. |
| Templates | Use the shared logical scope model, not Web expressions or HTML. |
| Actions/events | Map to commands, methods or notifications with the same transitions, ordering and cancellation semantics. |
| Input/accessibility | Map names, roles, focus and relationships to native APIs; use native keyboard, pointer, touch and assistive behavior where it meets the contract. |
| Theme | Map semantic color, typography, spacing, density, radii, elevation and motion to native resources, not CSS tokens. |

Declare capability differences and fallbacks. Platform-only extensions are namespaced and
optional; they cannot change shared property meaning or invalidate a portable document on
another renderer.

## References

- [Cross-platform binding comparison](../archive/binding/06-alternatives-and-plan.md)
