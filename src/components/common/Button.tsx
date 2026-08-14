import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass' | 'gradient';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
        const variants = {
            primary: 'bg-accent-purple hover:bg-accent-purple/90 text-white shadow-glow-sm hover:shadow-glow-md',
            secondary: 'bg-dark-200 hover:bg-dark-300 text-white',
            outline: 'border border-dark-300 hover:border-accent-purple text-text-secondary hover:text-white bg-transparent',
            ghost: 'hover:bg-dark-200 text-text-secondary hover:text-white',
            glass: 'glass hover:bg-dark-200/50 text-white',
            gradient: 'bg-gradient-primary hover:opacity-90 text-white shadow-glow-sm hover:shadow-glow-md',
        };

        const sizes = {
            sm: 'h-9 px-3 text-xs',
            md: 'h-11 px-6 text-sm',
            lg: 'h-14 px-8 text-base',
            icon: 'h-10 w-10 p-2',
        };

        return (
            <button
                ref={ref}
                disabled={isLoading}
                className={cn(
                    'inline-flex items-center justify-center rounded-2xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed',
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';
