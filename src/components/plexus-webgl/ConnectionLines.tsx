'use client';

/**
 * Absolutely—and that’s a great question. Think of ConnectionLines.tsx as the part that draws the threads between the dots.
 * It doesn’t create the particles; it receives their positions and decides which ones should be connected.
 */
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, type MutableRefObject } from 'react';
import * as THREE from 'three';
import type { PlexusTheme } from './PlexusTheme';
import { lineFragmentShader, lineVertexShader } from './shaders';

const DEFAULT_CONNECTION_DIST = 3.0;
const Z_CONNECTION_MAX = 4.0;
const MAX_CONNECTIONS = 5000;
const MAX_GRID = 64;

interface ConnectionLinesProps {
    particleCount: number;
    connectionDistance?: number;
    positionBufferRef: MutableRefObject<Float32Array | null>;
    theme: PlexusTheme;
    connectionDistanceRef?: MutableRefObject<number>;
}

export function updateConnectionLines(
    positions: Float32Array | null,
    requestedParticleCount: number,
    activeDist: number,
    linePositions: Float32Array,
    lineAlphas: Float32Array,
    gridHead: Int32Array,
    gridNext: Int32Array,
    maxConnections = MAX_CONNECTIONS,
): number {
    if (!positions || !Number.isFinite(activeDist) || activeDist <= 0 || gridHead.length === 0) {
        return 0;
    }

    const particleCount = Math.min(
        Math.max(0, Math.floor(requestedParticleCount)),
        Math.floor(positions.length / 3),
        gridNext.length,
    );
    const lineCapacity = Math.min(
        Math.max(0, Math.floor(maxConnections)),
        Math.floor(linePositions.length / 6),
        Math.floor(lineAlphas.length / 2),
    );
    const gridLimit = Math.min(MAX_GRID, Math.floor(Math.sqrt(gridHead.length)));

    if (particleCount < 2 || lineCapacity === 0 || gridLimit === 0) return 0;

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    let validParticleCount = 0;

    for (let i = 0; i < particleCount; i++) {
        const x = positions[i * 3];
        const y = positions[i * 3 + 1];
        const z = positions[i * 3 + 2];
        if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) continue;

        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
        validParticleCount++;
    }

    if (validParticleCount < 2) return 0;

    const rangeX = maxX - minX;
    const rangeY = maxY - minY;
    const gridW = Math.max(1, Math.min(gridLimit, Math.floor(rangeX / activeDist)));
    const gridH = Math.max(1, Math.min(gridLimit, Math.floor(rangeY / activeDist)));
    const cellW = rangeX > 0 ? rangeX / gridW : activeDist;
    const cellH = rangeY > 0 ? rangeY / gridH : activeDist;
    const cellCount = gridW * gridH;
    gridHead.fill(-1, 0, cellCount);

    const getCellX = (x: number) => Math.min(
        gridW - 1,
        Math.max(0, Math.floor((x - minX) / cellW)),
    );
    const getCellY = (y: number) => Math.min(
        gridH - 1,
        Math.max(0, Math.floor((y - minY) / cellH)),
    );

    for (let i = 0; i < particleCount; i++) {
        const x = positions[i * 3];
        const y = positions[i * 3 + 1];
        const z = positions[i * 3 + 2];
        if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) continue;

        const cell = getCellY(y) * gridW + getCellX(x);
        gridNext[i] = gridHead[cell];
        gridHead[cell] = i;
    }

    let lineCount = 0;
    const connectionDistanceSq = activeDist * activeDist;

    for (let i = 0; i < particleCount && lineCount < lineCapacity; i++) {
        const ax = positions[i * 3];
        const ay = positions[i * 3 + 1];
        const az = positions[i * 3 + 2];
        if (!Number.isFinite(ax) || !Number.isFinite(ay) || !Number.isFinite(az)) continue;

        const gx = getCellX(ax);
        const gy = getCellY(ay);

        for (let dy = -1; dy <= 1 && lineCount < lineCapacity; dy++) {
            const ny = gy + dy;
            if (ny < 0 || ny >= gridH) continue;

            for (let dx = -1; dx <= 1 && lineCount < lineCapacity; dx++) {
                const nx = gx + dx;
                if (nx < 0 || nx >= gridW) continue;

                let j = gridHead[ny * gridW + nx];
                while (j !== -1 && lineCount < lineCapacity) {
                    if (j > i) {
                        const bx = positions[j * 3];
                        const by = positions[j * 3 + 1];
                        const bz = positions[j * 3 + 2];
                        const dz = Math.abs(az - bz);

                        if (dz <= Z_CONNECTION_MAX) {
                            const ddx = ax - bx;
                            const ddy = ay - by;
                            const distanceSq = ddx * ddx + ddy * ddy;

                            if (distanceSq < connectionDistanceSq) {
                                const distanceRatio = 1 - Math.sqrt(distanceSq) / activeDist;
                                const depthFade = 1 - dz / Z_CONNECTION_MAX;
                                const alpha = distanceRatio * depthFade * 0.5;
                                const positionIndex = lineCount * 6;
                                const alphaIndex = lineCount * 2;

                                linePositions[positionIndex] = ax;
                                linePositions[positionIndex + 1] = ay;
                                linePositions[positionIndex + 2] = az;
                                linePositions[positionIndex + 3] = bx;
                                linePositions[positionIndex + 4] = by;
                                linePositions[positionIndex + 5] = bz;
                                lineAlphas[alphaIndex] = alpha;
                                lineAlphas[alphaIndex + 1] = alpha;
                                lineCount++;
                            }
                        }
                    }
                    j = gridNext[j];
                }
            }
        }
    }

    return lineCount;
}

export function ConnectionLines({
    particleCount,
    connectionDistance = DEFAULT_CONNECTION_DIST,
    positionBufferRef,
    theme,
    connectionDistanceRef,
}: ConnectionLinesProps) {
    const meshRef = useRef<THREE.LineSegments | null>(null);
    const safeParticleCount = Number.isFinite(particleCount)
        ? Math.max(0, Math.floor(particleCount))
        : 0;
    const gridHead = useMemo(() => new Int32Array(MAX_GRID * MAX_GRID), []);
    const gridNext = useMemo(() => new Int32Array(safeParticleCount), [safeParticleCount]);
    const geometry = useMemo(() => {
        const linePositions = new Float32Array(MAX_CONNECTIONS * 2 * 3);
        const lineAlphas = new Float32Array(MAX_CONNECTIONS * 2);
        const geometry = new THREE.BufferGeometry();

        geometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
        geometry.setAttribute('aAlpha', new THREE.BufferAttribute(lineAlphas, 1));
        geometry.setDrawRange(0, 0);

        return geometry;
    }, []);
    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uOpacity: { value: 1 },
        uLineColor: { value: theme.lineColor.clone() },
    }), [theme.lineColor]);

    useFrame((state) => {
        const mesh = meshRef.current;
        if (!mesh) return;

        const positionAttribute = mesh.geometry.getAttribute('position') as THREE.BufferAttribute;
        const alphaAttribute = mesh.geometry.getAttribute('aAlpha') as THREE.BufferAttribute;
        const material = mesh.material as THREE.ShaderMaterial;
        const linePositions = positionAttribute.array as Float32Array;
        const lineAlphas = alphaAttribute.array as Float32Array;
        const activeDist = connectionDistanceRef?.current ?? connectionDistance;
        const lineCount = updateConnectionLines(
            positionBufferRef.current,
            safeParticleCount,
            activeDist,
            linePositions,
            lineAlphas,
            gridHead,
            gridNext,
        );

        geometry.setDrawRange(0, lineCount * 2);
        positionAttribute.needsUpdate = true;
        alphaAttribute.needsUpdate = true;
        material.uniforms.uTime.value = state.clock.elapsedTime;
        material.uniforms.uLineColor.value.copy(theme.lineColor);
    });

    return (
        <lineSegments ref={meshRef} geometry={geometry} frustumCulled={false}>
            <shaderMaterial
                vertexShader={lineVertexShader}
                fragmentShader={lineFragmentShader}
                uniforms={uniforms}
                transparent
                depthWrite={false}
                blending={theme.blendingMode}
            />
        </lineSegments>
    );
}