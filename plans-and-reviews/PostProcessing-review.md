`PostProcessing.tsx` adds the **glow** to your plexus after the scene has been drawn. Think of it like adding a lighting filter to a photograph: it changes how the finished image looks, not where the particles are.

### How it works

1. **Gets the scene:** `useThree()` gives it the renderer, scene, camera, and screen size.
2. **Builds a processing pipeline:** `EffectComposer` runs these steps in order:
   - `RenderPass` draws the scene.
   - `UnrealBloomPass` adds a soft glow around sufficiently bright areas.
   - `OutputPass` prepares the final image for display.
3. **Uses your theme:** `PlexusTheme.ts` supplies three bloom settings:
   - `strength`: how strong the glow is.
   - `radius`: how far the glow spreads.
   - `threshold`: how bright something must be before it glows.

   Your dark theme uses a stronger glow (`0.2`) than your light theme (`0.04`).
4. **Keeps things updated:** It resizes the effect when the display size changes, updates bloom when the theme changes, and renders the result on every frame.

`return null` is normal here: the component doesn’t create a visible object itself; it processes the scene’s image. It needs to be used inside a React Three Fiber `Canvas`.

So the flow is: **particles and lines are drawn → `PostProcessing.tsx` adds glow → the final image is displayed**. The glow can affect other bright objects in the same scene too, not just the particles.

Right now, nothing in `src` is using `PostProcessing` yet, so it won’t add that glow until it’s connected to your scene.