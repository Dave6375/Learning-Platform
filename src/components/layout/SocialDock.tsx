'use client'
import { SiArxiv } from '@icons-pack/react-simple-icons';
import {SiBehance} from "@icons-pack/react-simple-icons";
import {SiGithub} from "@icons-pack/react-simple-icons";
import {SiX} from "@icons-pack/react-simple-icons";
import IconBrandLinkedin from '@mui/icons-material/LinkedIn';
import IconMail from '@mui/icons-material/Email';
import IconsRss from '@mui/icons-material/RssFeed';
import {MotionConfig} from 'framer-motion';
import { FloatingDock, type FloatingDockProps as FloatingItem } from '@/components/ui/floating-dock';
import {type SocialLinks as SocialLink, socialLinks} from '../../../data/socialLinks';

const iconMp: Record<SocialLink['icon'], FloatingItem['icon']> = {
    github: <SiGithub className='h-full w-full text-muted-foreground' />,
    linkedin: <IconBrandLinkedin className="h-full w-full text-muted-foreground" />,

    x: <SiX className='h-full w-full text-muted-foreground' />,
    email: <IconMail className='h-full w-full text-muted-foreground' />,
    behance: <SiBehance className='h-full w-full text-muted-foreground' />,
    arxiv: <SiArxiv className='h-full w-full text-muted-foreground' />,
    rss: <IconsRss className='h-full w-full text-muted-foreground' />,
}

const dockItems = socialLinks.map((link) => ({
    title: link.title,
    href: link.href,
    icon: iconMp[link.icon],
    target: link.target,
    })
)

export default function SocialDock({
    desktopClassName,
    mobileClassName,
                                   }: {
    desktopClassName?: string;
    mobileClassName?: string;
} = {}) {
    return (
        <MotionConfig reducedMotion='user'>
            <FloatingDock
                items={dockItems}
                desktopClassName={
                    desktopClassName ??
                    'fixed bottom-16 left-1/2 -translate-x-1/2 z-floating-dock'
                }
                mobileClassName={
                    mobileClassName ??
                    'fixed bottom-16 left-1/2 -translate-x-1/2 z-floating-dock'
                }
            />
        </MotionConfig>
    )
}

