### `signature-paths.ts`: the handwriting coordinates

This file stores smooth 3D stroke points for two handwritten words: **Chronos** and **ANEX**. Curved control points are sampled into many small points, each with an `x`, `y`, and `z` position. The file provides the handwriting path, not the particles or their animation.

### How the words become particle shapes

1. `plexus-shapes.tsx` samples each path by stroke length and normalizes the points for the particle field.
2. The signature entries in `hero-pattern-adapters.tsx` choose the shape. The English entry selects `SIGNATURE_CHRONOS`; the Chinese catalog entry selects `SIGNATURE_ANEX`.
3. `ParticleField.tsx` moves particles toward the selected shape's target points.

In short: **curved stroke points → shape generator → catalog entry → moving particles**. The paths draw the words, the shape generators prepare particle targets, and the catalog chooses which word to form.

### Does the language automatically change the word?

The language does not switch shapes by itself. A caller can pass `language="zh"` to `PlexusBackground`; `PlexusScene.tsx` then selects the Chinese catalog entries, including ANEX for the signature pattern. Without that prop, the background uses the English entries and forms Chronos.

The shape settings and particle animation remain the same for both words. Only the selected stroke path changes.
