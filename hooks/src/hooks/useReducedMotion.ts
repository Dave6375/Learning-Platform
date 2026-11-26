import {useEffect, useState} from 'react';

/**
 * This helps visitors who are sensitive to motion, and it also improves accessibility. It is a one-purpose hook:
 * “Should this animation be reduced or stopped?”
 */
const QUERY = '(prefers-reduced-motion)';

export function useReducedMotion(): boolean {
    const [reduced, setReduced] = useState(() => {
        if (typeof window === 'undefined') return false;
        return window.matchMedia(QUERY).matches;
    });

    useEffect(() => {
        const mql = window.matchMedia(QUERY);
        const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
        mql.addEventListener('change', handler);
        return () => mql.removeEventListener('change', handler);
        }, [])

    return reduced;
}