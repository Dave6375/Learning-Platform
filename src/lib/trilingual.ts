/**
 * In short, trilingual.ts is the project’s central language and translation helper. It keeps English and Chinese behavior
 * consistent across pages, React components, navigation, and URLs.
 * IT DOSNT TRANSLATE IT; it just decides which language to show
 */

import {en} from '@/locales/en';
import {zh} from '@/locales/zh';
import {es} from '@/locales/es';

export const defaultLocal = 'en' as const;
export const locals = ['en', 'zh', 'es'] as const;
export type Local = (typeof locals)[number];

export const ui = { zh, es, en} as const;
export type TranslationKey = keyof typeof en
export type TranslationParams = Record<string, string | number>;

// check whether a value is a language code supported by the project
export function isLocals(value: string | null | undefined): value is Local
{
    return !!value && locals.includes(value as Local);
}

// Fallback local resolution; any invalid value falls back to the default local
function normalizePathname(pathname: string): string {
    if (!pathname || pathname === '/') return '/';

    const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
    return normalized.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
}


// Parse the language segment in the path all at once to avoid multiple functions repeatedly splitting pathname
function parsePathname(pathname: string): { local: Local; pathname: string } {
    const normalizedPathname = normalizePathname(pathname);
    const segments = normalizedPathname.split('/').filter(Boolean);
    const hasLocalPrefix = isLocals(segments[0]);
    const locale: Local = hasLocalPrefix ? (segments[0] as Local) : defaultLocal;

    const pathnameWithoutLocale = hasLocalPrefix
        ? `/${segments.slice(1).join('/')}`
        : normalizedPathname;

    return { local: locale, pathname: pathnameWithoutLocale };
}

// Extract the current language from the route, for example /zh/about -> zh
export function getLocalFromPathname(pathname: string): Local {
    return parsePathname(pathname).local;
}

// Remove the language prefix from the path to make route matching and highlight determination easier
export function stripLocalFromPathname(pathname: string): string {
    return parsePathname(pathname).pathname;
}

// Extract the current language from the route path, for example /zh/about -> zh.
export function localizePathname(pathname: string, local: Local): string {
    const normalizedPath = stripLocalFromPathname(pathname);
    if (local === defaultLocal) return normalizedPath;
    return normalizedPath === '/' ?  `/${local}` : `/${local}${normalizedPath}`;

}

export function getLocalizedAlternates(pathname: string): Record<Local, string> {
    return Object.fromEntries(
        locals.map((local) => [local, localizePathname(pathname, local)])
    ) as Record<Local, string>;

}

// Get the current language from the explicit route path, on either the server or client
export function getCurrentLocal(pathname: string): Local {
    return getLocalFromPathname(pathname);
}

// Replace placeholders like {name} with the passed-in parameters.
function formatMessage(template: string, params?: TranslationParams) {
    if (!params) return template;

    let result = template;
    Object.entries(params).forEach(([key, value]) => {
        result = result.replaceAll(`{${key}}`, String(value));
    })

    return result;
}

function createTranslation(lang: Local) {
    return (key: TranslationKey, params?: TranslationParams): string =>
        formatMessage(ui[lang][key], params);
}

export function useTranslation(lang: Local = defaultLocal) {
    return createTranslation(lang);
}

export function getDateLocal(lang: Local): string {
    return lang;
}

export function formatDate(
    date: Date,
    lang: Local,
    options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
    },
): string {
    return date.toLocaleDateString(getDateLocal(lang), options);
}

