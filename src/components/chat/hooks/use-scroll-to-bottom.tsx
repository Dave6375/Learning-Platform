import { useLayoutEffect, useRef } from "react";
import type { UIEvent } from "react";

const BOTTOM_THRESHOLD = 80;

export function useScrollToBottom(messageCount: number) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const shouldFollow = useRef(true);

    function onScroll(event: UIEvent<HTMLDivElement>) {
        const element = event.currentTarget;
        shouldFollow.current = element.scrollHeight - element.scrollTop - element.clientHeight <= BOTTOM_THRESHOLD;
    }

    useLayoutEffect(() => {
        const element = scrollRef.current;
        if (element && shouldFollow.current) element.scrollTop = element.scrollHeight;
    }, [messageCount]);

    return { scrollRef, onScroll };
}