# Metadata ownership discussion

**Historical design context.** This records the reasoning behind the current class-owned
metadata direction; it does not define another supported metadata API.

## Previous approach

The initial Avatar implementation kept an `AvatarDefinition` object in `model.ts` and
exposed it through `Avatar.definition`. It described properties, defaults, regions,
capabilities, events and states separately from the executable class.

The separation made the object easy to inspect without importing a Web class, but allowed
defaults, allowed values and attribute lists to be repeated in the class. Merely moving
the object into the class would not remove that duplication.

## Discussion and decision

| Question | Conclusion |
| --- | --- |
| Can JavaScript reflect everything from a TypeScript class? | No. Types are erased, and getter/method bodies do not reliably reveal contracts. |
| Can metadata be obtained without creating an element? | Yes, from explicit class/accessor declarations and property descriptors. |
| Should the complete definition be handwritten separately? | No. The class should own the declarations used by both behavior and inspection. |
| Does this require a reflection framework? | No. A small declaration store and collector are sufficient for the selected scope. |
| What about non-Web consumers? | The reflected result is plain data, but importing a Web class still requires a Web environment. A separate build-time export can be considered when needed. |

The names evolved from `ControlMetadata` and `ElementMetadata` to `ElementMeta`, matching
the shorter `.meta` accessor and `ViewElement` base.

## Current documentation

- [ElementMeta design](../../architecture/05-meta.md)
- [Full ViewElement rewrite](../../architecture/04-rewrite.md)
