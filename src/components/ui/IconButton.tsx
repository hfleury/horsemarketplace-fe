import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    icon: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'ghost' | 'outline';
    ariaLabel: string;
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
    ({ className, icon, size = 'md', variant = 'default', ariaLabel, ...props }, ref) => {
        const baseStyles =
            'inline-flex items-center justify-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent-purple focus:ring-offset-2 focus:ring-offset-dark disabled:opacity-50 disabled:cursor-not-allowed';

        const variants = {
            default: 'bg-dark-300 text-white hover:bg-dark-400',
            ghost: 'text-text-secondary hover:text-white hover:bg-dark-300',
            outline: 'border-2 border-dark-300 text-white hover:border-accent-purple hover:bg-accent-purple/10',
        };

        const sizes = {
            sm: 'w-8 h-8 text-sm',
            md: 'w-10 h-10 text-base',
            lg: 'w-12 h-12 text-lg',
        };

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                aria-label={ariaLabel}
                {...props}
            >
                {icon}
            </button>
        );
    }
);

IconButton.displayName = 'IconButton';

export default IconButton;
