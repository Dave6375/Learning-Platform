import { metadata } from './metadata';
/**
 * Social link entry (driving footer / social icons on the About page).
 * - title: display name
 * - href: link URL
 * - icon: icon name, possible values are listed in the enum below (GitHub / LinkedIn / x / email / Behance / arxiv / rss)
 * - target: how to open it (like '_blank' for a new window, optional)
 */
export interface SocialLinks {
    title: string;
    href: string;
    icon: 'github' | 'linkedin' | 'x' | 'email' | 'behance' | 'arxiv' | 'rss';
    target?: '_blank' | '_self' | '_parent' | '_top';
}

export const socialLinks: SocialLinks[] = [
    {
        title: 'Github',
        href: metadata.social.github.url,
        icon: 'github',
        target: '_blank',
    },

    {
        title: 'X',
        href: metadata.social.x.url,
        icon: 'x',
        target: '_blank',
    },
    { title: 'RSS', href: `/rss.xml`, target: '_blank', icon: 'rss' },
]
