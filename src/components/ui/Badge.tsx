import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
    size?: 'sm' | 'md' | 'lg';
    icon?: React.ReactNode;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
    ({ className, variant = 'default', size = 'md', icon, children, ...props }, ref) => {
        const baseStyles =
            'inline-flex items-center justify-center font-medium rounded-full transition-colors';

        const variants = {
            default: 'bg-dark-300 text-text-primary',
            success: 'bg-success/20 text-success border border-success/50',
            warning: 'bg-warning/20 text-warning border border-warning/50',
            error: 'bg-error/20 text-error border border-error/50',
            info: 'bg-accent-blue/20 text-accent-blue border border-accent-blue/50',
        };

        const sizes = {
            sm: 'px-2 py-0.5 text-xs',
            md: 'px-3 py-1 text-sm',
            lg: 'px-4 py-1.5 text-base',
        };

        return (
            <span
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                {...props}
            >
                {icon && <span className="mr-1">{icon}</span>}
                {children}
            </span>
        );
    }
);

Badge.displayName = 'Badge';

export default Badge;
