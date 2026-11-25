// =====================================================================================================================
/**
 * The focused TypeScript and ESLint checks passed in the previous check. It isn’t connected to the plexus scene yet, so its
 * colors and glow settings won’t appear until the scene uses usePlexusTheme. It initially returns the light theme, then checks the page’s actual theme after mounting,
 * so there could be a brief light-color flash in dark mode.
 */
// =====================================================================================================================


'use client'
import { useEffect, useState } from 'react';
import * as THREE from 'three';

export interface PlexusTheme {
    isDark: boolean;
    /**
     * Particle gradient: color0 -> color1 (matching original Canvas 2D)
     */
    color0: THREE.Color;
    color1: THREE.Color;
    /** Connection line color */
    lineColor: THREE.Color;
    /** Subtle HDR boost for bloom pickup */
    hdrIntensity: number;
    /** Bloom parameters - kept subtle */
    bloom: {strength: number; radius: number; threshold: number};
    /** Blending mode: additive for dark (glow), normal for light (visibility)
     */
    blendingMode: THREE.Blending;
}

const DARK_THEME: PlexusTheme = {
    isDark: true,

    color0: new THREE.Color('#4169E1'),    // Royal blue
    color1: new THREE.Color('#60A5FA'),    // Lighter glowing blue
    lineColor: new THREE.Color('#3B82F6'), // Blue connections
    hdrIntensity: 0.3,
    bloom: { strength: 0.2, radius: 0.3, threshold: 0.5 },
    blendingMode: THREE.AdditiveBlending,
};

const LIGHT_THEME: PlexusTheme = {
    isDark: false,
    // Deep Graphite & Obsidian — neutral high-contrast for a premium, artistic feel
    color0: new THREE.Color(0.08, 0.08, 0.1), // Near Obsidian
    color1: new THREE.Color(0.2, 0.2, 0.25), // Slate Charcoal
    lineColor: new THREE.Color(0.1, 0.1, 0.12), // Deep Graphite
    hdrIntensity: 0.15, // Subtle HDR to give the points a "ink" feel
    bloom: { strength: 0.04, radius: 0.2, threshold: 0.9 }, // Extremely sharp points
    blendingMode: THREE.NormalBlending,
};

export function usePlexusTheme():
PlexusTheme {
    const [isDark, setIsDark] = useState(false)

    useEffect(() => {
        const updateTheme = () => {
            setIsDark(document.documentElement.classList.contains('dark'));
        };

        updateTheme();
        const observer = new MutationObserver(updateTheme);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });
        return () => observer.disconnect();
    }, []);

    return isDark ? DARK_THEME : LIGHT_THEME;
}