'use client'

import { MotionConfig, motion } from 'motion/react'
import { useScrollDirection } from '../../../hook/useScrollDirection'
import {
    getLocalFromPathname,
    type Local,
    localizePathname,
    stripLocalFromPathname,
} from "@/lib/trilingual";

import { ModeToggle } from './ModeToggle';
import {ReactNode} from "react";
import NavigationMenuDemo from "@/components/header/NavigationMenu";

type Props = {
    lang?: Local;
    pathName?: string;
    children?: ReactNode;
    hideLanguageSwitch?: boolean;
};

export default function AutoHideHeader({
    lang,
    pathName,
    children,
    hideLanguageSwitch = false,
                                       }: Props) {
    const { isVisible } = useScrollDirection();
    const resolvedPathname = pathName ?? '/';
    const resolvedLang = lang ?? getLocalFromPathname(resolvedPathname);
    const homeHref = localizePathname('/', resolvedLang);
    const alternateLocale: Local = resolvedLang === 'en' ? 'zh' : resolvedLang === 'zh' ? 'es' : 'en';
    const languageToggleHref = localizePathname(
        stripLocalFromPathname(resolvedPathname),
        alternateLocale
    );
    const languageToggleIsLabel = alternateLocale === 'zh' ? '中文' : alternateLocale === 'es' ? 'ES' : 'EN';
    const shouldHideLanguage = hideLanguageSwitch || resolvedPathname.startsWith('/playground');

    return (
        <MotionConfig reducedMotion='user'>
            <motion.header
                className='fixed top-0 left-0 right-0 z-header border-b border-border/40 bg-background/80 backdrop-blur-md'
                initial={{ y: 0 }}
                animate={{ y: isVisible ? 0 : -100 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >

                <div className='container mx-auto flex h-14 items-center justify-between px-4'>
                    <a href={homeHref}
                       className='text-xl font-semibold tracking-tight text-foreground'
                       style={{
                           fontFamily: 'Permanent Marker',
                       }}
                       >
                        Aion
                    </a>

                    {/** Desktop nav + actions cluster */}
                    <div className='hidden md:flex md:items-center md:gap-2.5'>
                        <NavigationMenuDemo lang={resolvedLang} pathname={resolvedPathname} />
                        {!shouldHideLanguage && children}
                        <ModeToggle />
                    </div>

                    {/** Mobile hamburger + theme toggle */}
                    <div className='flex items-center gap-2 md:hidden'>
                        {!shouldHideLanguage && (
                            <a
                                href={languageToggleHref}
                                className='inline-flex h-9 min-w-9 items-center justify-center rounded-md border-border
                                bg-background px-2 text-sm font-medium text-foreground transition-colors hover:bg-muted'

                                aria-label={`Switch language to ${alternateLocale === 'zh' ? '中文' : alternateLocale === 'es' ? 'Español' : 'English'}`}
                                >
                                {languageToggleIsLabel}
                            </a>
                        )}
                    </div>

                </div>
            </motion.header>
        </MotionConfig>
    )
}

