import { useEffect, useState } from 'react';

export interface TimeRemaining {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
}

/**
 * Custom hook for countdown timer functionality
 * @param targetDate - The target date/time to count down to
 * @returns TimeRemaining object with days, hours, minutes, seconds, and expiration status
 */
export function useCountdown(targetDate: Date | string): TimeRemaining {
    const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() =>
        calculateTimeRemaining(targetDate)
    );

    useEffect(() => {
        const interval = setInterval(() => {
            const remaining = calculateTimeRemaining(targetDate);
            setTimeRemaining(remaining);

            // Clear interval if expired
            if (remaining.isExpired) {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [targetDate]);

    return timeRemaining;
}

function calculateTimeRemaining(targetDate: Date | string): TimeRemaining {
    const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
    const now = new Date();
    const difference = target.getTime() - now.getTime();

    if (difference <= 0) {
        return {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            isExpired: true,
        };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return {
        days,
        hours,
        minutes,
        seconds,
        isExpired: false,
    };
}
