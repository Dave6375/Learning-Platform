'use client';
import type { MotionValue } from 'framer-motion';
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export interface FloatingDockProps {
    title: string;
    icon: React.ReactElement
    href: string;
    target?: '_blank' | '_self' | '_parent' | '_top';
}

export const FloatingDock = ({
    items,
    desktopClassName,
    mobileClassName,
}: {
    items: FloatingDockProps[];
    desktopClassName?: string;
    mobileClassName?: string;
}) => {
    return (
        <>
            <FloatingDockDesktop items={items} className={desktopClassName} />
            <FloatingDockMobile items={items} className={mobileClassName} />
        </>
    );
};

const FloatingDockMobile = ({
                               items,
                               className,
                           }: {
    items: FloatingDockProps[];
    className?: string;
}) => {
    return (
        <div
            role="toolbar"
            aria-label="Floating dock mobile"
            className={cn(
                'mx-auto flex flex-nowrap items-center justify-center gap-2 rounded-2xl px-3 py-2 sm:hidden isolate',
                // Combine NavigationMenu.tsx with Apple's liquid glass core filter
                'backdrop-blur-2xl saturate-180',
                'bg-gradient-to-b from-white/80 via-white/55 to-white/70',
                'dark:bg-gradient-to-b dark:from-neutral-800/80 dark:via-neutral-900/60 dark:to-neutral-900/75',
                'border border-white/70 dark:border-white/15',
                'shadow-[0_8px_24px_-4px_rgba(0,0,0,0.08),inset_0_1.5px_1px_0_rgba(255,255,255,0.95)]',
                'dark:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.5),inset_0_1.5px_1px_0_rgba(255,255,255,0.22)]',
                className,
            )}
        >0

            {items.map((item) => (
                <a
                    key={item.title}
                    href={item.href}
                    target={item.target}
                    rel={item.target === '_blank' ? 'noreferrer noopener' : undefined}
                    aria-label={item.title}
                    className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/85 dark:bg-white/14 border border-white/80 dark:border-white/15 shadow-xs transition-all hover:scale-105 active:scale-95"
                >
                    <div className="size-4 text-foreground">{item.icon}</div>
                </a>
            ))}
        </div>
    );
};

/**
 * it shows the dock on screens at the sm breakpoint and above; smaller screens use the mobile version
 * it tracks the mouses horizontal position and passes it to each IconContainer, which makes nearby icons grow smoothly
 * it creates one icon for each item in `items`. The styling gives the dock a frosted-glass appearance in light and dark modes
 *
 * The thin line at the top is a decorative highlight; it dosn't block clicks
 */
const FloatingDockDesktop = ({
                                 items,
                                 className,
                             }: {
    items: FloatingDockProps[];
    className?: string;
}) => {
    const mouseX = useMotionValue(Number.POSITIVE_INFINITY);

    return (
        <motion.div
            role="toolbar"
            aria-label="Floating dock"
            onMouseMove={(e) => mouseX.set(e.clientX)}
            onMouseLeave={() => mouseX.set(Number.POSITIVE_INFINITY)}
            className={cn(
                'relative mx-auto hidden sm:flex h-16 items-end gap-3 rounded-2xl px-4 pb-3 isolate',
                'backdrop-blur-2xl saturate-180',

                'bg-gradient-to-b from-white/80 via-white/55 to-white/70',
                'dark:bg-gradient-to-b dark:from-neutral-800/80 dark:via-neutral-900/60 dark:to-neutral-900/75',

                'border border-white/70 dark:border-white/15',
                // Imitates Apple’s double-layer edge light refraction and soft shadow (Fresnel Reflection & Specular Highlight)
                'shadow-[0_12px_32px_-4px_rgba(0,0,0,0.08),inset_0_1.5px_1px_0_rgba(255,255,255,0.95),inset_0_-1px_1px_0_rgba(0,0,0,0.03)]',
                'dark:shadow-[0_16px_36px_-4px_rgba(0,0,0,0.5),inset_0_1.5px_1px_0_rgba(255,255,255,0.22),inset_0_-1px_1px_0_rgba(0,0,0,0.4)]',
                'transition-colors duration-300',
                className,
            )}
        >

            <div
                className="pointer-events-none absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/95 to-transparent dark:via-white/35"
                aria-hidden="true"
            />

            {items.map((item) => (
                <IconContainer mouseX={mouseX} key={item.title} {...item} />
            ))}
        </motion.div>
    );
};

/**
 * it measures how close the mouse is to the icon's center. Nearby icons grow from 40x40 to 72x72 pixels
 * Springs make the resizing smooth rather than sudden.
 * Hovering over the icons or focusing on it shows its title above it.
 * Clicking the icon follows its link. The title also acts as a label for screen readers
 *
 */
function IconContainer({
                           mouseX,
                           title,
                           icon,
                           href,
                           target,
                       }: {
    mouseX: MotionValue;
    title: string;
    icon: React.ReactNode;
    href: string;
    target?: '_blank' | '_self' | '_parent' | '_top';
}) {
    const ref = useRef<HTMLAnchorElement>(null);

    // Key calculation: Map distances using clientX and precise boundingClientRect, and use Spring for smooth scaling
    const distance = useTransform(mouseX, (val: number) => {
        const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
        return val - bounds.x - bounds.width / 2;
    });

    const widthTransform = useTransform(distance, [-140, 0, 140], [40, 72, 40]);
    const heightTransform = useTransform(distance, [-140, 0, 140], [40, 72, 40]);
    const iconSizeTransform = useTransform(distance, [-140, 0, 140], [20, 36, 20]);

    const width = useSpring(widthTransform, {
        mass: 0.1,
        stiffness: 220,
        damping: 14,
    });
    const height = useSpring(heightTransform, {
        mass: 0.1,
        stiffness: 220,
        damping: 14,
    });
    const iconSize = useSpring(iconSizeTransform, {
        mass: 0.1,
        stiffness: 220,
        damping: 14,
    });

    const [hovered, setHovered] = useState(false);

    return (
        <motion.a
            ref={ref}
            href={href}
            target={target}
            rel={target === '_blank' ? 'noreferrer noopener' : undefined}
            aria-label={title}
            style={{ width, height }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onFocus={() => setHovered(true)}
            onBlur={() => setHovered(false)}
            className={cn(
                // 核心形态：作为 flex 子元素自适应弹性放大
                'relative flex shrink-0 aspect-square items-center justify-center rounded-full outline-none cursor-pointer',
                // 仿苹果微高光水银质感图标容器
                'bg-white/85 dark:bg-white/14',
                'border border-white/80 dark:border-white/15',
                'shadow-[0_2px_8px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.9)]',
                'dark:shadow-[0_2px_10px_rgba(0,0,0,0.4),inset_0_1px_0.5px_rgba(255,255,255,0.25)]',
                'transition-colors duration-150',
            )}
        >
            {/* 关键诊断修复：外层容器绝对居中锚定，内层 motion.div 仅处理透明度与微缩放，彻底消除 Tailwind 与 Motion 双重 -50% translateX 叠加导致的向左偏移 */}
            <AnimatePresence>
                {hovered && (
                    <div className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 z-50">
                        <motion.div
                            initial={{ opacity: 0, y: 6, scale: 0.92 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 4, scale: 0.92 }}
                            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                            className={cn(
                                'w-max rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-pre select-none shadow-lg',
                                // 仿苹果微高光悬浮文字气泡
                                'backdrop-blur-xl saturate-180',
                                'bg-neutral-900/90 text-white dark:bg-white/95 dark:text-neutral-950',
                                'border border-white/20 dark:border-black/10',
                            )}
                        >
                            {title}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <motion.div
                style={{ width: iconSize, height: iconSize }}
                className="flex items-center justify-center text-foreground"
            >
                {icon}
            </motion.div>
        </motion.a>
    );
}