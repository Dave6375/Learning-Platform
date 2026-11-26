/**
 * PostProcessing.tsx adds the glow to your plexus after the scene has been drawn. Think of it like adding a lighting
 * filter to a photograph: it changes how the finished image looks, not where the particles are
 */

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import type { PlexusTheme } from './plexus-theme-runtime';

interface PostProcessingProps {
    theme: PlexusTheme;
}

export function PostProcessing({ theme }: PostProcessingProps) {
    const { gl, scene, camera, size } = useThree();
    const composerRef = useRef<EffectComposer | null>(null);

    useEffect(() => {
        const composer = new EffectComposer(gl);
        composer.addPass(new RenderPass(scene, camera));
        composer.addPass(
            new UnrealBloomPass(
                new THREE.Vector2(size.width, size.height),
                theme.bloom.strength,
                theme.bloom.radius,
                theme.bloom.threshold,
            ),
        );
        composer.addPass(new OutputPass());
        composerRef.current = composer;

        return () => {
            composerRef.current = null;
            composer.dispose();
        };
    }, [camera, gl, scene, size.height, size.width, theme]);

    useFrame(() => {
        composerRef.current?.render();
    }, 1);

    return null;
}
