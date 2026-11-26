'use client';

import dynamic from 'next/dynamic';
import type { PlexusSceneProps } from './PlexusScene';

const PlexusScene = dynamic<PlexusSceneProps>(
    () => import('./PlexusScene').then((module) => module.PlexusScene),
    {
        ssr: false,
        loading: () => null,
    },
);

export type PlexusBackgroundProps = PlexusSceneProps;

export function PlexusBackground(props: PlexusBackgroundProps) {
    return <PlexusScene {...props} />;
}
