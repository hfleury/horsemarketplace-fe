import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export interface GradientCardProps extends HTMLAttributes<HTMLDivElement> {
    image?: string;
    imageAlt?: string;
    header?: React.ReactNode;
    footer?: React.ReactNode;
    hoverable?: boolean;
}

const GradientCard = forwardRef<HTMLDivElement, GradientCardProps>(
    (
        {
            className,
            image,
            imageAlt = '',
            header,
            footer,
            hoverable = true,
            children,
            ...props
        },
        ref
    ) => {
        return (
            <div
                ref={ref}
                className={cn(
                    'relative rounded-2xl overflow-hidden bg-dark-200 border border-dark-300',
                    hoverable && 'card-hover cursor-pointer',
                    className
                )}
                {...props}
            >
                {/* Gradient border effect */}
                <div className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="absolute inset-0 rounded-2xl p-[2px] bg-gradient-primary -z-10" />
                </div>

                {/* Image section */}
                {image && (
                    <div className="relative aspect-square overflow-hidden">
                        <img
                            src={image}
                            alt={imageAlt}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                        />
                        {header && (
                            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-dark/80 to-transparent">
                                {header}
                            </div>
                        )}
                    </div>
                )}

                {/* Content section */}
                {children && <div className="p-4">{children}</div>}

                {/* Footer section */}
                {footer && (
                    <div className="px-4 pb-4 pt-0 border-t border-dark-300/50">{footer}</div>
                )}
            </div>
        );
    }
);

GradientCard.displayName = 'GradientCard';

export default GradientCard;
