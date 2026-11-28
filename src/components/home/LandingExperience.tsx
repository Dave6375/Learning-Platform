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
import { ShimmerButton } from "@/components/ui/shimmer-button";
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
    {id: 'Kronos', char: 'K'},
    {id: 'Kronos', char: 'r'},
    {id: 'Kronos', char: 'o'},
    {id: 'Kronos', char: 'n'},
    {id: 'Kronos', char: 'o'},
    {id: 'Kronos', char: 's'},
];
export default function LandingExperience({ lang = 'en'}: { lang?: Local}) {
    const t = useTranslation(lang);
    const heroRef = useRef<HTMLDivElement>(null);
    const heroCardRef = useRef<HTMLDivElement>(null);
    const nameRef = useRef<HTMLHeadingElement>(null);
    const [nameWidth, setNameWidth] = useState<number | null>(null);
    const [pattern, setPattern] = useState<HeroPatternId>('signature')
    const [entryIndex, setEntryIndex] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const [showComingSoon, setShowComingSoon] = useState(false)
    const isZh = lang === 'zh';
    const [shouldMountDock, setShouldMountDock] = useState(false)

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const timeoutId = window.setTimeout(() => {
            setShouldMountDock(true)
        }, DOCK_PRELOAD_DELAY_MS);

        return () => window.clearTimeout(timeoutId);
    }, [])

    const adapter = getHeroPatternAdapter(pattern, isZh ? 'zh' : 'en');
    const activeEntries = adapter.entries;
    const activeEntry = activeEntries[entryIndex % activeEntries.length];
    const quoteText = useTextScramble(activeEntry.quote);
    const metadataText = useTextScramble(activeEntry.author ?? '');
    const intro = lang === 'en'
        ? 'Welcome to ANEX. A place to learn, practice, and grow—one challenge at a time. “The immortal gods have put sweat before virtue.” — Hesiod, Works and Days'
        : t('landingIntro');
    const currentShapeName = adapter.label[isZh ? 'zh' : 'en'];

    const handleGroupAdvance = useCallback(() => {
        const ids = HERO_PATTERN_ADAPTERS.map((a) => a.id);
        const currIdx = ids.indexOf(pattern);
        const nextPattern =ids[(currIdx + 1) % ids.length];
        setPattern(nextPattern);
        setEntryIndex(0);
    }, [pattern])

    const handleEntryChange = useCallback(
        (id: HeroPatternId, index: number) => {
            if (id === pattern) {
                setEntryIndex(index);
            }
        },
        [pattern],
    )

    // Track name element with via ResizeObserver
    useEffect(() => {
        const el = nameRef.current;
        if (!el) return;
        const ro = new ResizeObserver(([entry]) => {
            setNameWidth(entry.contentRect.width);
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    // Pause auto-cycle when hovering over hero card
    useEffect(() => {
        const heroCard = heroCardRef.current;
        if (!heroCard) return

        const onEnter = () => setIsPaused(true);
        const onLeave = () => setIsPaused(false);

        heroCard.addEventListener('mouseenter', onEnter);
        heroCard.addEventListener('mouseleave', onLeave);

        return () => {
            heroCard.removeEventListener('mouseenter', onEnter);
            heroCard.removeEventListener('mouseleave', onLeave);
        }
    }, []);

    return (
        <MotionConfig reducedMotion="user">
            <div className="landing-root" ref={heroRef}>
                <PlexusBackground
                    patternId={pattern}
                    language={isZh ? 'zh' : 'en'}
                    className='pointer-events-auto z-0'
                    onEntryChange={handleEntryChange}
                    onGroupAdvance={handleGroupAdvance}
                    isPaused={isPaused}
                />

                <motion.div
                    className='final-card-container pointer-events-none z-10'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className='relative flex flex-col items-center'>
                        <div className='px-4 sm:px-0'>
                            <div ref={heroCardRef} className='landing-hero pointer-events-auto'>
                                <p className='sr-only'>{t('heroDescription')}</p>
                                <h1
                                    ref={nameRef}
                                    className='landing-hero-name'
                                    aria-label='ANEX Kronos'
                                    style={{ fontFamily: 'Rock Salt, cursive' }}
                                    >
                                    {NAME_CHARS.map(({ id, char}, index) => {
                                        const baseDelay = index * 0.03;
                                        return char == ' ' ? (
                                            <span key={id} className='w-full' />
                                        ) : (
                                            <span
                                                key={`${id}-${index}`}
                                                className='landing-hero-char md:mt-10 mt-5'
                                                style={{ '--landing-char-delay': `${baseDelay}s` } as CSSProperties}
                                            >
                                            {char}
                                            </span>
                                        );
                                    })}
                                </h1>

                                <motion.div
                                    className='landing-hero-sub'
                                    style={nameWidth ? { maxWidth: nameWidth }: undefined}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.5 }}
                                    >
                                    <p className='landing-hero-intro'>{intro}</p>
                                    <span className="landing-hero-quote" title={currentShapeName}>
                                        {quoteText}
                                    </span>
                                    {metadataText && <span className="landing-hero-metadata">{metadataText}</span>}
                                </motion.div>
                                <div className='flex flex-col items-center gap-3'>
                                    <ShimmerButton
                                        type='button'
                                        shimmerColor='#fb923c'
                                        className='focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-400'
                                        onClick={() => setShowComingSoon(true)}
                                    >
                                        {t('heroGetStarted')}
                                    </ShimmerButton>
                                    <p role='status' className='text-sm text-foreground'>
                                        {showComingSoon ? 'Coming soon.' : ''}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <motion.div
                            className='pointer-events-auto flex flex-col items-center gap-3 mt-6'
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                            >
                            {shouldMountDock && (
                                <Suspense fallback={null}>
                                    <SocialDock
                                        mobileClassName=''
                                        desktopClassName=''
                                        />
                                </Suspense>
                            )}
                        </motion.div>

                    </div>
                </motion.div>
            </div>
        </MotionConfig>
    )
};