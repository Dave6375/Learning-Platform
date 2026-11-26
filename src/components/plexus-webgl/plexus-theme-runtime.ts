'use client';

import { useEffect, useState } from 'react';
import * as THREE from 'three';

export interface PlexusTheme {
    isDark: boolean;
    color0: THREE.Color;
    color1: THREE.Color;
    lineColor: THREE.Color;
    hdrIntensity: number;
    bloom: { strength: number; radius: number; threshold: number };
    blendingMode: THREE.Blending;
}

const DARK_THEME: PlexusTheme = {
    isDark: true,
    color0: new THREE.Color('#4169E1'),
    color1: new THREE.Color('#60A5FA'),
    lineColor: new THREE.Color('#3B82F6'),
    hdrIntensity: 0.3,
    bloom: { strength: 0.2, radius: 0.3, threshold: 0.5 },
    blendingMode: THREE.AdditiveBlending,
};

const LIGHT_THEME: PlexusTheme = {
    isDark: false,
    color0: new THREE.Color(0.08, 0.08, 0.1),
    color1: new THREE.Color(0.2, 0.2, 0.25),
    lineColor: new THREE.Color(0.1, 0.1, 0.12),
    hdrIntensity: 0.15,
    bloom: { strength: 0.04, radius: 0.2, threshold: 0.9 },
    blendingMode: THREE.NormalBlending,
};

export function usePlexusTheme(): PlexusTheme {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const updateTheme = () => {
            setIsDark(document.documentElement.classList.contains('dark'));
        };

        updateTheme();
        const observer = new MutationObserver(updateTheme);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });
        return () => observer.disconnect();
    }, []);

    return isDark ? DARK_THEME : LIGHT_THEME;
}
