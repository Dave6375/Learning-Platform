'use client';

import { MotionConfig, motion } from 'motion/react';
import {
    type CSSProperties,
    lazy,
    Suspense,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import { getHeroPatternAdapter, HERO_PATTERN_ADAPTERS, type HeroPatternId } from "@/components/plexus-webgl/hero-pattern-adapters";
import { PlexusBackground } from "@/components/ui/plexus-background";
import {useTextScramble} from "@/components/ui/text-scramble";
import { type Local, useTranslation } from '@/lib/trilingual';

const DOCK_PRELOAD_DELAY_MS = 1000;
const SocialDock = lazy(() => import('@/components/layout/SocialDock'));

const NAME_CHARS = [
    {id: 'ANEX', char: 'A'},
    {id: 'ANEX', char: 'N'},
    {id: 'ANEX', char: 'E'},
    {id: 'ANEX', char: 'X'},
    {id: 'space', char: ' '},
    {id: 'Chronos', char: 'C'},
    {id: 'Chronos', char: 'h'},
    {id: 'Chronos', char: 'r'},
    {id: 'Chronos', char: 'o'},
    {id: 'Chronos', char: 'n'},
    {id: 'Chronos', char: 'o'},
    {id: 'Chronos', char: 's'},
];
export default function LandingExperience({ lang = 'en'}: { lang?: Local}) {
    const { t } = useTranslation(lang);
    const heroRef = useRef<HTMLDivElement>(null);
    const heroCardRef = useRef<HTMLDivElement>(null);
    const nameRef = useRef<HTMLHeadingElement>(null);
    const [nameWidth, setNameWidth] = useState<HeroPatternId>('signature')
    const [entryIndex, setEntryIndex] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const isZh = lang === 'zh';
    const isEn = lang === 'en';
    const isEs = lang === 'es';
    const [shouldMountDock, setShouldMountDock] = useState(false)

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const timeoutId = window.setTimeout(() => {
            setShouldMountDock(true)
        }, DOCK_PRELOAD_DELAY_MS);
    })
}
