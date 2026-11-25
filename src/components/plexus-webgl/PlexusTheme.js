// =====================================================================================================================
// =====================================================================================================================
'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var THREE = require("three");
var DARK_THEME = {
    isDark: true,
    color0: new THREE.Color('#4169E1'), // Royal blue
    color1: new THREE.Color('#60A5FA'), // Lighter glowing blue
    lineColor: new THREE.Color('#3B82F6'), // Blue connections
    hdrIntensity: 0.3,
    bloom: { strength: 0.2, radius: 0.3, threshold: 0.5 },
    blendingMode: THREE.AdditiveBlending,
};
var LIGHT_THEME = {
    isDark: false,
    // Deep Graphite & Obsidian — neutral high-contrast for a premium, artistic feel
    color0: new THREE.Color(0.08, 0.08, 0.1), // Near Obsidian
    color1: new THREE.Color(0.2, 0.2, 0.25), // Slate Charcoal
    lineColor: new THREE.Color(0.1, 0.1, 0.12), // Deep Graphite
    hdrIntensity: 0.15, // Subtle HDR to give the points a "ink" feel
    bloom: { strength: 0.04, radius: 0.2, threshold: 0.9 }, // Extremely sharp points
    blendingMode: THREE.NormalBlending,
};
