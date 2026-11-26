### `ParticleField.tsx`: the moving particles

This is the component that **creates and animates the dots**:

1. It starts particles at scattered positions and stores their positions, sizes, and velocities.
2. It receives a pattern from the adapter and asks its current shape to generate target points.
3. On each animation frame, it moves the particles toward those points. When the target shape changes, the dots move toward the new targets, creating the **morphing effect** you were thinking about.
4. It applies the shape’s rotation and subtle movement, and can respond to the cursor.
5. It shares the particle positions so `ConnectionLines.tsx` can draw the web between them. The shaders and theme control how the dots look.

The component also schedules changes between entries. When a group is finished, it calls `onGroupAdvance` if one was supplied; another component must decide what group comes next. Reduced motion stops automatic cycling and reduces motion in the particle logic.

### How the files fit together

**Pattern adapter chooses a shape → shapes file provides target points → particle field moves the dots toward them → connection lines draw the web.**

For example, choosing `orbits` selects `ORBITAL_RINGS`. That shape generates points around three rings, and `ParticleField.tsx` moves the dots toward them while rotating the formation.

### Current status

`PlexusScene.tsx` is still unfinished, and `plexus-shapes.tsx` imports a missing `signature-ming-paths` file. So this describes how the pieces are intended to work together, not a finished effect we’ve seen running.