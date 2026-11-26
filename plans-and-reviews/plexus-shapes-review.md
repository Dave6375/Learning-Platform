### `plexus-shapes.tsx`: the blueprints

This file defines **what shapes the particles can form**. Each shape has a generator that returns 3D points: `x`, `y`, and `z` coordinates telling the particles where to go.

For example, `ORBITAL_RINGS` generates points for three tilted rings. Other shapes include a Möbius band, a spiral galaxy, and a signature.

Each shape also has settings such as:

1. `spinX`, `spinY`, and `spinZ`: how it rotates.
2. `spread`: how large it appears.
3. `jitter`: how much the particles subtly move.
4. `lerpMul`: how quickly particles move toward the shape.

Think of this file as a **book of blueprints**. It describes the shapes but doesn’t draw them itself.

### How the files fit together

**Pattern adapter chooses a shape → shapes file provides target points → particle field moves the dots toward them → connection lines draw the web.**

For example, choosing `orbits` selects `ORBITAL_RINGS`. That shape generates points around three rings, and `ParticleField.tsx` moves the dots toward them while rotating the formation.

### Current status

`PlexusScene.tsx` is still unfinished, and `plexus-shapes.tsx` imports a missing `signature-ming-paths` file. So this describes how the pieces are intended to work together, not a finished effect we’ve seen running.