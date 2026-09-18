import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ListingCard } from './ListingCard';
import { ProductStatus, ProductType, type Product } from '../../types/product';

const baseProduct: Product = {
    id: 'p1',
    user_id: 'u1',
    type: ProductType.Horse,
    status: ProductStatus.Published,
    title: 'Test Listing',
    price_sek: 12000,
    city: 'Stockholm',
    views_count: 0,
    favorite_count: 0,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
};

describe('ListingCard', () => {
    it('renders the horse-type summary line', () => {
        const horseProduct: Product = {
            ...baseProduct,
            type: ProductType.Horse,
            horse: { breed: 'Warmblood', age: 5 },
        };
        render(
            <MemoryRouter>
                <ListingCard product={horseProduct} />
            </MemoryRouter>
        );
        expect(screen.getByText('Test Listing')).toBeInTheDocument();
        expect(screen.getByText('Warmblood • 5 yrs')).toBeInTheDocument();
    });

    it('renders the vehicle-type summary line', () => {
        const vehicleProduct: Product = {
            ...baseProduct,
            type: ProductType.Vehicle,
            vehicle: { make: 'Ifor Williams', model: 'HB506' },
        };
        render(
            <MemoryRouter>
                <ListingCard product={vehicleProduct} />
            </MemoryRouter>
        );
        expect(screen.getByText('Ifor Williams HB506')).toBeInTheDocument();
    });

    it('renders the equipment-type summary line', () => {
        const equipmentProduct: Product = {
            ...baseProduct,
            type: ProductType.Equipment,
            equipment: { make: 'Passier', model: 'Dressage Saddle' },
        };
        render(
            <MemoryRouter>
                <ListingCard product={equipmentProduct} />
            </MemoryRouter>
        );
        expect(screen.getByText('Passier Dressage Saddle')).toBeInTheDocument();
    });

    it('links to the listing detail route', () => {
        render(
            <MemoryRouter>
                <ListingCard product={baseProduct} />
            </MemoryRouter>
        );
        expect(screen.getByRole('link')).toHaveAttribute('href', '/listings/p1');
    });

    it('renders the placeholder div when there is no media', () => {
        const { container } = render(
            <MemoryRouter>
                <ListingCard product={baseProduct} />
            </MemoryRouter>
        );
        expect(container.querySelector('img')).not.toBeInTheDocument();
        expect(container.querySelector('.bg-dark-100\\/50')).toBeInTheDocument();
    });

    it('renders the cover image for the primary media item', () => {
        const productWithMedia: Product = {
            ...baseProduct,
            media: [
                {
                    product_id: 'p1',
                    media_id: 'm1',
                    order: 0,
                    is_primary: true,
                    media: { id: 'm1', url: 'https://example.com/photo.jpg' },
                },
            ],
        };
        render(
            <MemoryRouter>
                <ListingCard product={productWithMedia} />
            </MemoryRouter>
        );
        const image = screen.getByRole('img', { name: 'Test Listing' });
        expect(image).toHaveAttribute('src', 'https://example.com/photo.jpg');
    });

    it('falls back to the placeholder div when the cover image fails to load', () => {
        const productWithMedia: Product = {
            ...baseProduct,
            media: [
                {
                    product_id: 'p1',
                    media_id: 'm1',
                    order: 0,
                    is_primary: true,
                    media: { id: 'm1', url: 'https://example.com/broken.jpg' },
                },
            ],
        };
        const { container } = render(
            <MemoryRouter>
                <ListingCard product={productWithMedia} />
            </MemoryRouter>
        );
        fireEvent.error(screen.getByRole('img', { name: 'Test Listing' }));
        expect(container.querySelector('img')).not.toBeInTheDocument();
        expect(container.querySelector('.bg-dark-100\\/50')).toBeInTheDocument();
    });
});
