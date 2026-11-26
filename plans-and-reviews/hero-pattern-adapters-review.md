### `hero-pattern-adapters.tsx`: the catalog

This file organizes those shapes into **patterns you can choose for the hero section**:

1. `signature`: a Ming signature.
2. `codex`: a sequence of eight classic shapes.
3. `mobius`: a Möbius band.
4. `orbits`: orbital rings.

Each pattern contains entries with a shape, a name, a quote, and how long to hold it. For example, each classic shape has `holdMs: 10_000`, meaning **10 seconds**. Some patterns also specify connection distances depending on the particle count.

`getHeroPatternAdapter()` finds a pattern by its ID; if none matches, it returns the first one, `signature`. English and Chinese entries are provided, but selecting the appropriate language still needs to be wired up.

Think of this file as the **menu** that chooses which blueprint and accompanying information to use.

### How the files fit together

**Pattern adapter chooses a shape → shapes file provides target points → particle field moves the dots toward them → connection lines draw the web.**

For example, choosing `orbits` selects `ORBITAL_RINGS`. That shape generates points around three rings, and `ParticleField.tsx` moves the dots toward them while rotating the formation.

### Current status

`PlexusScene.tsx` is still unfinished, and `plexus-shapes.tsx` imports a missing `signature-ming-paths` file. So this describes how the pieces are intended to work together, not a finished effect we’ve seen running.