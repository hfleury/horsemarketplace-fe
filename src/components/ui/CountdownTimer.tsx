import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';
import { useCountdown } from '../../hooks/useCountdown';

export interface CountdownTimerProps extends HTMLAttributes<HTMLDivElement> {
    targetDate: Date | string;
    onExpire?: () => void;
    compact?: boolean;
}

const CountdownTimer = forwardRef<HTMLDivElement, CountdownTimerProps>(
    ({ className, targetDate, onExpire, compact = false, ...props }, ref) => {
        const { days, hours, minutes, seconds, isExpired } = useCountdown(targetDate);

        // Call onExpire callback when timer expires
        if (isExpired && onExpire) {
            onExpire();
        }

        if (isExpired) {
            return (
                <div
                    ref={ref}
                    className={cn('text-text-muted text-sm', className)}
                    {...props}
                >
                    Auction ended
                </div>
            );
        }

        const timeUnits = [
            { value: days, label: 'Days' },
            { value: hours, label: 'Hours' },
            { value: minutes, label: 'Mins' },
            { value: seconds, label: 'Secs' },
        ];

        if (compact) {
            return (
                <div
                    ref={ref}
                    className={cn('flex items-center gap-1 text-sm font-medium', className)}
                    {...props}
                >
                    {days > 0 && <span>{days}d</span>}
                    <span>{String(hours).padStart(2, '0')}h</span>
                    <span>{String(minutes).padStart(2, '0')}m</span>
                    <span>{String(seconds).padStart(2, '0')}s</span>
                </div>
            );
        }

        return (
            <div
                ref={ref}
                className={cn('flex items-center gap-2', className)}
                {...props}
            >
                {timeUnits.map((unit, index) => (
                    <div key={unit.label} className="flex flex-col items-center">
                        <div className="bg-dark-300 rounded-lg px-3 py-2 min-w-[60px] text-center">
                            <span className="text-2xl font-bold text-white">
                                {String(unit.value).padStart(2, '0')}
                            </span>
                        </div>
                        <span className="text-xs text-text-muted mt-1">{unit.label}</span>
                        {index < timeUnits.length - 1 && (
                            <span className="text-text-muted mx-1">:</span>
                        )}
                    </div>
                ))}
            </div>
        );
    }
);

CountdownTimer.displayName = 'CountdownTimer';

export default CountdownTimer;
