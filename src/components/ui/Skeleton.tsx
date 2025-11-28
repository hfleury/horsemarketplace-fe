import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'text' | 'circular' | 'rectangular';
    width?: string | number;
    height?: string | number;
}

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
    ({ className, variant = 'text', width, height, ...props }, ref) => {
        const baseStyles = 'animate-shimmer bg-gradient-to-r from-dark-200 via-dark-300 to-dark-200 bg-[length:1000px_100%]';

        const variants = {
            text: 'h-4 rounded',
            circular: 'rounded-full',
            rectangular: 'rounded-lg',
        };

        const style = {
            width: width || (variant === 'circular' ? '40px' : '100%'),
            height: height || (variant === 'circular' ? '40px' : undefined),
        };

        return (
            <div
                ref={ref}
                className={cn(baseStyles, variants[variant], className)}
                style={style}
                {...props}
            />
        );
    }
);

Skeleton.displayName = 'Skeleton';

export default Skeleton;
