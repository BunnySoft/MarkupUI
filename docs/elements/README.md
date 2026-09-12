# Element contracts

Element Contracts define the latest public properties, content and behavior for the
ViewElement rewrite. They are design requirements, not a claim that every API is delivered.
Pending contracts identify unresolved decisions. For implemented components, the catalog
links to the demo page containing current API tables, examples and behavior.

## Reading order

1. [Contract model](01-contract.md): shared terminology, structure and rules.
2. [Initial catalog](02-catalog.md): the first seven component families and their contracts.
3. [Full inventory](03-inventory.md): every retained UI family and the non-element boundary.
4. [Component development guide](04-development.md): implement, document and validate one family end-to-end.

The [rewrite plan](../architecture/04-rewrite.md) covers the complete inventory.
Web/native mapping belongs in [Architecture](../architecture/README.md);
[Binding](../binding/README.md) and [Styling](../styling/README.md) own their shared rules.
Individual contracts should not repeat those guides. Move completed planning contracts
to the archive rather than maintaining duplicate component API/usage pages.

## Status

Separate a defined or approved contract from implemented and validated code.
All seven initial families use the thin shared core and source-generated demo API data.
Avatar, Button, Card, Carousel, Collapse, Divider and Dropdown are implemented with
approved payload ceilings.
The initial batch establishes the pattern; the remaining inventory requires its own
contracts and dependency-aware implementation sequence.

## References

- [Previous implementation guides](../archive/components/README.md)
- [Pinned API comparisons](../archive/naive/index.md)
- [Visual comparison records](../archive/styling/index.md)
