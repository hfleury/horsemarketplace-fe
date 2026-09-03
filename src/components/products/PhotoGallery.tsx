import { useEffect, useState } from 'react';
import { Dialog } from '@mui/material';
import { ChevronLeft, ChevronRight, ImageOff, X } from 'lucide-react';
import IconButton from '../ui/IconButton';
import { cn } from '../../lib/cn';
import type { ProductMedia } from '../../types/product';

function sortMediaPrimaryFirst(media: ProductMedia[]): ProductMedia[] {
    return [...media].sort((a, b) => {
        if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
        return a.order - b.order;
    });
}

function GalleryImage({ item, className }: { item: ProductMedia; className: string }) {
    const [hasError, setHasError] = useState(false);

    if (!item.media?.url || hasError) {
        return (
            <div className={cn(className, 'flex items-center justify-center bg-dark-100/50 dark:bg-dark-200/30')}>
                <ImageOff className="h-6 w-6 text-text-secondary" />
            </div>
        );
    }

    return <img src={item.media.url} alt="" className={className} onError={() => setHasError(true)} />;
}

interface LightboxProps {
    media: ProductMedia[];
    selectedIndex: number;
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (index: number) => void;
}

function Lightbox({ media, selectedIndex, isOpen, onClose, onNavigate }: LightboxProps) {
    const isAtStart = selectedIndex === 0;
    const isAtEnd = selectedIndex === media.length - 1;

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'ArrowLeft' && !isAtStart) {
                onNavigate(selectedIndex - 1);
            } else if (event.key === 'ArrowRight' && !isAtEnd) {
                onNavigate(selectedIndex + 1);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isAtStart, isAtEnd, selectedIndex, onNavigate]);

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            fullScreen
            PaperProps={{ className: 'bg-black', sx: { backgroundColor: 'black' } }}
        >
            <div className="relative flex h-full w-full items-center justify-center">
                <IconButton
                    icon={<X className="h-5 w-5" />}
                    ariaLabel="Close gallery"
                    variant="ghost"
                    onClick={onClose}
                    className="absolute right-4 top-4"
                />
                <IconButton
                    icon={<ChevronLeft className="h-5 w-5" />}
                    ariaLabel="Previous photo"
                    variant="ghost"
                    onClick={() => onNavigate(selectedIndex - 1)}
                    disabled={isAtStart}
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                />
                <GalleryImage item={media[selectedIndex]} className="max-h-[90vh] max-w-[90vw] object-contain" />
                <IconButton
                    icon={<ChevronRight className="h-5 w-5" />}
                    ariaLabel="Next photo"
                    variant="ghost"
                    onClick={() => onNavigate(selectedIndex + 1)}
                    disabled={isAtEnd}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                />
            </div>
        </Dialog>
    );
}

export function PhotoGallery({ media }: { media?: ProductMedia[] }) {
    const sortedMedia = sortMediaPrimaryFirst(media ?? []);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    if (sortedMedia.length === 0) {
        return <div className="h-80 w-full rounded-3xl bg-dark-100/50 dark:bg-dark-200/30" />;
    }

    return (
        <div>
            <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                aria-label="View photo fullscreen"
                className="block w-full"
            >
                <GalleryImage
                    item={sortedMedia[selectedIndex]}
                    className="aspect-square w-full rounded-3xl object-cover"
                />
            </button>

            {sortedMedia.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pt-3 snap-x scrollbar-hide">
                    {sortedMedia.map((item, index) => (
                        <button
                            type="button"
                            key={item.media_id}
                            onClick={() => setSelectedIndex(index)}
                            aria-label={`View photo ${index + 1}`}
                            className={cn(
                                'shrink-0 snap-start rounded-xl',
                                index === selectedIndex && 'ring-2 ring-accent-purple'
                            )}
                        >
                            <GalleryImage item={item} className="h-16 w-16 rounded-xl object-cover" />
                        </button>
                    ))}
                </div>
            )}

            <Lightbox
                media={sortedMedia}
                selectedIndex={selectedIndex}
                isOpen={isLightboxOpen}
                onClose={() => setIsLightboxOpen(false)}
                onNavigate={setSelectedIndex}
            />
        </div>
    );
}

export default PhotoGallery;
