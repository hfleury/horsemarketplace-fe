import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
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
});
