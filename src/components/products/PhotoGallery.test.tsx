import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PhotoGallery } from './PhotoGallery';
import type { ProductMedia } from '../../types/product';

function makeMediaItem(overrides: Partial<ProductMedia> = {}): ProductMedia {
    return {
        product_id: 'p1',
        media_id: 'm1',
        order: 0,
        is_primary: false,
        media: { id: 'm1', url: 'https://example.com/m1.jpg' },
        ...overrides,
    };
}

describe('PhotoGallery', () => {
    it('renders the placeholder when media is undefined or empty', () => {
        const { container, rerender } = render(<PhotoGallery media={undefined} />);
        expect(container.querySelector('img')).not.toBeInTheDocument();
        expect(container.querySelector('.h-80')).toBeInTheDocument();

        rerender(<PhotoGallery media={[]} />);
        expect(container.querySelector('img')).not.toBeInTheDocument();
        expect(container.querySelector('.h-80')).toBeInTheDocument();
    });

    it('renders the hero image but no thumbnail strip for a single item', () => {
        const media = [makeMediaItem({ media_id: 'm1' })];
        const { container } = render(<PhotoGallery media={media} />);

        expect(container.querySelectorAll('img')).toHaveLength(1);
        expect(screen.queryByLabelText('View photo 1')).not.toBeInTheDocument();
    });

    it('renders the primary item as the hero image regardless of order', () => {
        const media = [
            makeMediaItem({ media_id: 'm1', order: 0, is_primary: false, media: { id: 'm1', url: 'https://example.com/m1.jpg' } }),
            makeMediaItem({ media_id: 'm2', order: 1, is_primary: true, media: { id: 'm2', url: 'https://example.com/m2.jpg' } }),
        ];
        render(<PhotoGallery media={media} />);

        const heroButton = screen.getByLabelText('View photo fullscreen');
        const heroImage = heroButton.querySelector('img');
        expect(heroImage).toHaveAttribute('src', 'https://example.com/m2.jpg');
    });

    it('updates the hero image when a thumbnail is clicked', () => {
        const media = [
            makeMediaItem({ media_id: 'm1', order: 0, is_primary: true, media: { id: 'm1', url: 'https://example.com/m1.jpg' } }),
            makeMediaItem({ media_id: 'm2', order: 1, is_primary: false, media: { id: 'm2', url: 'https://example.com/m2.jpg' } }),
        ];
        render(<PhotoGallery media={media} />);

        fireEvent.click(screen.getByLabelText('View photo 2'));

        const heroButton = screen.getByLabelText('View photo fullscreen');
        expect(heroButton.querySelector('img')).toHaveAttribute('src', 'https://example.com/m2.jpg');
    });

    it('opens the lightbox when the hero image is clicked', () => {
        const media = [makeMediaItem()];
        render(<PhotoGallery media={media} />);

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        fireEvent.click(screen.getByLabelText('View photo fullscreen'));
        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('disables prev/next at the bounds and advances on next', () => {
        const media = [
            makeMediaItem({ media_id: 'm1', media: { id: 'm1', url: 'https://example.com/m1.jpg' } }),
            makeMediaItem({ media_id: 'm2', media: { id: 'm2', url: 'https://example.com/m2.jpg' } }),
        ];
        render(<PhotoGallery media={media} />);
        fireEvent.click(screen.getByLabelText('View photo fullscreen'));

        expect(screen.getByLabelText('Previous photo')).toBeDisabled();
        expect(screen.getByLabelText('Next photo')).not.toBeDisabled();

        fireEvent.click(screen.getByLabelText('Next photo'));

        const dialog = screen.getByRole('dialog');
        expect(dialog.querySelector('img')).toHaveAttribute('src', 'https://example.com/m2.jpg');
        expect(screen.getByLabelText('Next photo')).toBeDisabled();
        expect(screen.getByLabelText('Previous photo')).not.toBeDisabled();
    });

    it('renders the ImageOff placeholder when media.url is missing', () => {
        const media = [makeMediaItem({ media: undefined })];
        const { container } = render(<PhotoGallery media={media} />);

        expect(container.querySelector('img')).not.toBeInTheDocument();
        expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('swaps to the ImageOff placeholder when the image fails to load', () => {
        const media = [makeMediaItem()];
        const { container } = render(<PhotoGallery media={media} />);

        const image = container.querySelector('img');
        expect(image).toBeInTheDocument();
        fireEvent.error(image!);

        expect(container.querySelector('img')).not.toBeInTheDocument();
        expect(container.querySelector('svg')).toBeInTheDocument();
    });
});
