import { useEffect, useRef } from 'react';

export function usePolling(callback: () => void, intervalMs: number, enabled: boolean): void {
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        if (!enabled) return;
        const intervalId = setInterval(() => callbackRef.current(), intervalMs);
        return () => clearInterval(intervalId);
    }, [intervalMs, enabled]);
}
