'use client';

import { Canvas, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState, type CSSProperties, type RefObject } from 'react';
import { ConnectionLines } from './ConnectionLines';
import { ParticleField } from './ParticleField';
import { PostProcessing } from './PostProcessing';
import {
    getHeroPatternAdapter,
    type HeroPatternId,
    type HeroPatternLanguage,
} from './hero-pattern-adapters';
import { usePlexusTheme } from './plexus-theme-runtime';

export interface PlexusSceneProps {
    className?: string;
    style?: CSSProperties;
    particleCount?: number;
    patternId?: HeroPatternId;
    language?: HeroPatternLanguage;
}

interface SceneContentsProps {
    adapter: ReturnType<typeof getHeroPatternAdapter>;
    count: number;
    containerRef: RefObject<HTMLDivElement | null>;
    reducedMotion: boolean;
}

function SceneContents({ adapter, count, containerRef, reducedMotion }: SceneContentsProps) {
    const theme = usePlexusTheme();
    const viewport = useThree((state) => state.viewport);
    const positionsBufferRef = useRef<Float32Array | null>(null);
    const connectionDistanceRef = useRef(3);
    const cursorRef = useRef({ active: false, x: 0, y: 0, mode: 1 });

    useEffect(() => {
        const updateCursor = (event: PointerEvent) => {
            const bounds = containerRef.current?.getBoundingClientRect();
            if (!bounds || bounds.width === 0 || bounds.height === 0) {
                cursorRef.current.active = false;
                return;
            }

            const x = event.clientX - bounds.left;
            const y = event.clientY - bounds.top;
            if (x < 0 || x > bounds.width || y < 0 || y > bounds.height) {
                cursorRef.current.active = false;
                return;
            }

            cursorRef.current.x = (x / bounds.width - 0.5) * viewport.width;
            cursorRef.current.y = (0.5 - y / bounds.height) * viewport.height;
            cursorRef.current.active = true;
        };
        const deactivateCursor = () => {
            cursorRef.current.active = false;
        };

        window.addEventListener('pointermove', updateCursor, { passive: true });
        window.addEventListener('blur', deactivateCursor);
        return () => {
            window.removeEventListener('pointermove', updateCursor);
            window.removeEventListener('blur', deactivateCursor);
        };
    }, [containerRef, viewport.height, viewport.width]);

    return (
        <>
            <ParticleField
                adapter={adapter}
                count={count}
                theme={theme}
                positionsBufferRef={positionsBufferRef}
                cursorRef={cursorRef}
                reducedMotion={reducedMotion}
                connectionDistanceRef={connectionDistanceRef}
            />
            <ConnectionLines
                particleCount={count}
                positionBufferRef={positionsBufferRef}
                connectionDistanceRef={connectionDistanceRef}
                theme={theme}
            />
            <PostProcessing theme={theme} />
        </>
    );
}

export function PlexusScene({
    className,
    style,
    particleCount = 500,
    patternId = 'signature',
    language = 'en',
}: PlexusSceneProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [reducedMotion, setReducedMotion] = useState(false);
    const adapter = useMemo(
        () => getHeroPatternAdapter(patternId, language),
        [language, patternId],
    );

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const updateMotionPreference = () => setReducedMotion(mediaQuery.matches);

        updateMotionPreference();
        mediaQuery.addEventListener('change', updateMotionPreference);
        return () => mediaQuery.removeEventListener('change', updateMotionPreference);
    }, []);

    return (
        <div
            ref={containerRef}
            className={className}
            aria-hidden="true"
            style={{
                position: 'absolute',
                inset: 0,
                zIndex: 0,
                ...style,
                pointerEvents: 'none',
            }}
        >
            <Canvas
                dpr={[1, 1.5]}
                camera={{ position: [0, 0, 10], fov: 45 }}
                gl={{ alpha: true, antialias: true }}
                onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
                style={{ pointerEvents: 'none' }}
            >
                <SceneContents
                    adapter={adapter}
                    count={particleCount}
                    containerRef={containerRef}
                    reducedMotion={reducedMotion}
                />
            </Canvas>
        </div>
    );
}
