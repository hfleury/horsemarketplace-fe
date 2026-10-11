import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import { Listings } from './Listings';
import { productsApi } from '../api/products';
import { categoriesApi } from '../api/categories';
import { geocodingApi } from '../api/geocoding';
import { horseAttributesApi } from '../api/horseAttributesApi';
import { savedSearchesApi } from '../api/savedSearches';
import { getCurrentPosition } from '../lib/geolocation';
import { useAuth } from '../hooks/useAuth';
import { ProductStatus, ProductType, type Product } from '../types/product';
import type { HorseAttributeType } from '../types/horseAttributes';
import type { SearchCriteria } from '../types/searchCriteria';

vi.mock('../api/products', () => ({
    productsApi: { list: vi.fn() },
}));

vi.mock('../api/categories', () => ({
    categoriesApi: { list: vi.fn() },
}));

vi.mock('../api/geocoding', () => ({
    geocodingApi: { resolve: vi.fn() },
}));

vi.mock('../api/horseAttributesApi', () => ({
    horseAttributesApi: { list: vi.fn() },
}));

vi.mock('../lib/geolocation', () => ({
    getCurrentPosition: vi.fn(),
}));

vi.mock('../hooks/useAuth', () => ({ useAuth: vi.fn() }));

vi.mock('../api/savedSearches', () => ({
    savedSearchesApi: { create: vi.fn() },
}));

const FIRST_PAGE = { page: 1, limit: 20 };
const STOCKHOLM = { lat: 59.3293, lng: 18.0686 };

function makeProduct(overrides: Partial<Product> = {}): Product {
    return {
        id: 'p1',
        user_id: 'u1',
        type: ProductType.Horse,
        status: ProductStatus.Published,
        title: 'Test Horse',
        price_sek: 5000,
        views_count: 0,
        favorite_count: 0,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
        ...overrides,
    };
}

function logInAs(username: string | null) {
    vi.mocked(useAuth).mockReturnValue({
        user: username ? { username, email: `${username}@example.com` } : null,
        token: username ? 'token123' : null,
        login: vi.fn(),
        logout: vi.fn(),
        loading: false,
        error: null,
    });
}

function mockListings(total = 1) {
    vi.mocked(productsApi.list).mockResolvedValue({
        status: 'success',
        data: { items: [makeProduct()], total, page: 1, limit: 20 },
    });
}

function mockOneAttributeOptionPerType() {
    const valuesByType: Record<HorseAttributeType, string> = { breed: 'Arabian', gender: 'Mare', discipline: 'Dressage' };
    vi.mocked(horseAttributesApi.list).mockImplementation(async (type) => {
        const attributeType = type as HorseAttributeType;
        return {
            status: 'success',
            data: [
                {
                    id: `${attributeType}-1`,
                    type: attributeType,
                    value: valuesByType[attributeType],
                    created_at: '2026-01-01T00:00:00Z',
                    updated_at: '2026-01-01T00:00:00Z',
                },
            ],
        };
    });
}

function LocationProbe() {
    return <div data-testid="location-search">{useLocation().search}</div>;
}

// Simulates a Header search without rendering the Header.
function NavigateButton() {
    const navigate = useNavigate();
    return <button onClick={() => navigate('/listings?q=saddle')}>Header search</button>;
}

function renderListings(initialEntry = '/listings') {
    return render(
        <MemoryRouter initialEntries={[initialEntry]}>
            <Listings />
            <LocationProbe />
            <NavigateButton />
        </MemoryRouter>
    );
}

function currentSearchParams(): URLSearchParams {
    return new URLSearchParams(screen.getByTestId('location-search').textContent ?? '');
}

function lastListCall() {
    return vi.mocked(productsApi.list).mock.lastCall;
}

async function chooseCategory(value: string) {
    await screen.findByRole('option', { name: /Horses/ });
    fireEvent.change(screen.getByRole('combobox', { name: 'Category' }), { target: { value } });
}

describe('Listings', () => {
    beforeEach(() => {
        vi.mocked(productsApi.list).mockReset();
        vi.mocked(categoriesApi.list).mockReset();
        vi.mocked(geocodingApi.resolve).mockReset();
        vi.mocked(horseAttributesApi.list).mockReset();
        vi.mocked(getCurrentPosition).mockReset().mockResolvedValue(null);
        vi.mocked(savedSearchesApi.create).mockReset();
        vi.mocked(categoriesApi.list).mockResolvedValue({
            status: 'success',
            data: [{ id: 'cat-1', name: 'Horses' }],
        });
        // Unmocked, this hits the real apiClient (no backend in tests), with timing that
        // varies enough between local and CI to bleed into other tests' assertions.
        vi.mocked(horseAttributesApi.list).mockResolvedValue({ status: 'success', data: [] });
        logInAs(null);
    });

    it('shows a loading state then renders listing cards once resolved', async () => {
        mockListings();

        renderListings();

        expect(screen.getByText(/loading listings/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('Test Horse')).toBeInTheDocument();
        });
    });

    it('re-fetches with the selected category when the filter changes', async () => {
        mockListings();

        renderListings();

        await waitFor(() => expect(productsApi.list).toHaveBeenCalledWith({}, FIRST_PAGE));

        await chooseCategory('cat-1');

        await waitFor(() => expect(productsApi.list).toHaveBeenCalledWith({ category_id: 'cat-1' }, FIRST_PAGE));
    });

    it('disables next when on the last page, and advances page when clicked while enabled', async () => {
        mockListings(40);

        renderListings();

        await waitFor(() => expect(screen.getByText('Test Horse')).toBeInTheDocument());

        const nextButton = screen.getByRole('button', { name: /next/i });
        expect(nextButton).not.toBeDisabled();

        fireEvent.click(nextButton);

        await waitFor(() => expect(productsApi.list).toHaveBeenCalledWith({}, { page: 2, limit: 20 }));
    });

    it('disables next when page * limit >= total', async () => {
        mockListings(5);

        renderListings();

        await waitFor(() => expect(screen.getByText('Test Horse')).toBeInTheDocument());

        expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
    });

    it('renders the empty-state message when there are no listings', async () => {
        vi.mocked(productsApi.list).mockResolvedValue({
            status: 'success',
            data: { items: [], total: 0, page: 1, limit: 20 },
        });

        renderListings();

        await waitFor(() => {
            expect(screen.getByText(/no listings found/i)).toBeInTheDocument();
        });
    });

    it('re-fetches with resolved coordinates and radius after typing a location and picking a radius', async () => {
        mockListings();
        vi.mocked(geocodingApi.resolve).mockResolvedValue({ status: 'success', data: STOCKHOLM });

        renderListings();

        await waitFor(() => expect(screen.getByText('Test Horse')).toBeInTheDocument());

        fireEvent.change(screen.getByLabelText('Location'), { target: { value: 'Stockholm' } });
        fireEvent.blur(screen.getByLabelText('Location'));

        await waitFor(() => expect(geocodingApi.resolve).toHaveBeenCalledWith('Stockholm'));
        await waitFor(() => expect(screen.getByRole('combobox', { name: 'Radius' })).not.toBeDisabled());

        fireEvent.change(screen.getByRole('combobox', { name: 'Radius' }), { target: { value: '50' } });

        await waitFor(() =>
            expect(productsApi.list).toHaveBeenCalledWith({ ...STOCKHOLM, radius_km: 50 }, FIRST_PAGE)
        );
    });

    it('seeds the keyword input from the q URL param and includes it in the fetch', async () => {
        mockListings();

        renderListings('/listings?q=foo');

        expect(screen.getByLabelText('Keyword')).toHaveValue('foo');

        await waitFor(() => expect(productsApi.list).toHaveBeenCalledWith({ q: 'foo' }, FIRST_PAGE));
    });

    it('debounces keyword input changes before re-fetching, and resets to page 1', async () => {
        // Deliberately real timers, not vi.useFakeTimers: mixing fake timers with RTL's
        // (or even vi's) waitFor proved unreliable under CI's scheduling here across several
        // attempts. A real ~400ms wait is slower but fully deterministic, and matches every
        // other (never-flaky) test in this file.
        mockListings(40);

        renderListings();

        await waitFor(() => expect(productsApi.list).toHaveBeenCalledWith({}, FIRST_PAGE));

        fireEvent.click(screen.getByRole('button', { name: /next/i }));
        await waitFor(() => expect(productsApi.list).toHaveBeenCalledWith({}, { page: 2, limit: 20 }));

        fireEvent.change(screen.getByLabelText('Keyword'), { target: { value: 'stockholm' } });

        await waitFor(() => expect(productsApi.list).toHaveBeenCalledWith({ q: 'stockholm' }, FIRST_PAGE), {
            timeout: 2000,
        });
    });

    it('seeds every filter from the URL', async () => {
        mockListings();
        const criteria: SearchCriteria = {
            q: 'saddle',
            category_id: 'cat-1',
            breed: 'Arabian',
            gender: 'Mare',
            discipline: 'Dressage',
            min_age: 3,
            max_age: 8,
            min_height: 150,
            max_height: 170,
            min_price: 1000,
            max_price: 5000,
            ...STOCKHOLM,
            radius_km: 50,
        };
        const query = new URLSearchParams({
            ...Object.fromEntries(Object.entries(criteria).map(([key, value]) => [key, String(value)])),
            location_label: 'Stockholm',
            page: '2',
        });

        renderListings(`/listings?${query}`);

        await waitFor(() => expect(productsApi.list).toHaveBeenCalledWith(criteria, { page: 2, limit: 20 }));
        expect(screen.getByLabelText('Location')).toHaveValue('Stockholm');
        expect(screen.getByRole('combobox', { name: 'Radius' })).toHaveValue('50');
        expect(screen.getByRole('combobox', { name: 'Radius' })).not.toBeDisabled();
        expect(screen.getByLabelText('Min price')).toHaveValue(1000);
    });

    it('writes applied filters back to the URL and resets the page', async () => {
        mockListings();

        renderListings('/listings?page=2');

        await chooseCategory('cat-1');

        await waitFor(() => expect(currentSearchParams().get('category_id')).toBe('cat-1'));
        expect(currentSearchParams().has('page')).toBe(false);
    });

    it('keeps pagination in the URL until the next filter change', async () => {
        mockListings(40);

        renderListings();

        await waitFor(() => expect(screen.getByText('Test Horse')).toBeInTheDocument());
        fireEvent.click(screen.getByRole('button', { name: /next/i }));
        await waitFor(() => expect(currentSearchParams().get('page')).toBe('2'));

        await chooseCategory('cat-1');

        await waitFor(() => expect(currentSearchParams().get('category_id')).toBe('cat-1'));
        expect(currentSearchParams().has('page')).toBe(false);
    });

    it('goes back a page with Previous', async () => {
        mockListings(40);

        renderListings('/listings?page=2');

        await waitFor(() => expect(productsApi.list).toHaveBeenCalledWith({}, { page: 2, limit: 20 }));

        fireEvent.click(screen.getByRole('button', { name: /previous/i }));

        await waitFor(() => expect(lastListCall()).toEqual([{}, FIRST_PAGE]));
        expect(currentSearchParams().has('page')).toBe(false);
    });

    it('follows a navigation to /listings?q=saddle while on the page, even after typing', async () => {
        mockListings();

        renderListings();

        fireEvent.change(screen.getByLabelText('Keyword'), { target: { value: 'something' } });
        await waitFor(() => expect(productsApi.list).toHaveBeenCalledWith({ q: 'something' }, FIRST_PAGE), {
            timeout: 2000,
        });

        fireEvent.click(screen.getByRole('button', { name: 'Header search' }));

        await waitFor(() => expect(productsApi.list).toHaveBeenCalledWith({ q: 'saddle' }, FIRST_PAGE));
        expect(screen.getByLabelText('Keyword')).toHaveValue('saddle');

        // Past the debounce window, the stale typed text must not overwrite the navigation.
        await new Promise((resolve) => setTimeout(resolve, 600));
        expect(currentSearchParams().get('q')).toBe('saddle');
        expect(screen.getByLabelText('Keyword')).toHaveValue('saddle');
    });

    it('ignores a radius that is not one of the options', async () => {
        mockListings();

        renderListings('/listings?lat=59.3&lng=18.1&radius_km=30');

        await waitFor(() => expect(productsApi.list).toHaveBeenCalledWith({}, FIRST_PAGE));
        expect(screen.getByRole('combobox', { name: 'Radius' })).toHaveValue('');
    });

    it.each<[string, keyof SearchCriteria, string]>([
        ['Category', 'category_id', 'cat-1'],
        ['Breed', 'breed', 'Arabian'],
        ['Gender', 'gender', 'Mare'],
        ['Discipline', 'discipline', 'Dressage'],
    ])('writes the %s select to %s and removes it again', async (label, key, value) => {
        mockListings();
        mockOneAttributeOptionPerType();

        renderListings();

        const select = screen.getByRole('combobox', { name: label });
        await waitFor(() => expect(select.querySelectorAll('option')).toHaveLength(2));

        fireEvent.change(select, { target: { value } });
        await waitFor(() => expect(currentSearchParams().get(key)).toBe(value));
        await waitFor(() => expect(lastListCall()).toEqual([{ [key]: value }, FIRST_PAGE]));

        fireEvent.change(select, { target: { value: '' } });
        await waitFor(() => expect(currentSearchParams().has(key)).toBe(false));
        await waitFor(() => expect(lastListCall()).toEqual([{}, FIRST_PAGE]));
    });

    it.each<[string, keyof SearchCriteria]>([
        ['Min age', 'min_age'],
        ['Max age', 'max_age'],
        ['Min height', 'min_height'],
        ['Max height', 'max_height'],
        ['Min price', 'min_price'],
        ['Max price', 'max_price'],
    ])('writes the %s input to %s and removes it when cleared', async (label, key) => {
        mockListings();

        renderListings();

        fireEvent.change(screen.getByLabelText(label), { target: { value: '5' } });
        await waitFor(() => expect(currentSearchParams().get(key)).toBe('5'));
        await waitFor(() => expect(lastListCall()).toEqual([{ [key]: 5 }, FIRST_PAGE]));

        fireEvent.change(screen.getByLabelText(label), { target: { value: '' } });
        await waitFor(() => expect(currentSearchParams().has(key)).toBe(false));
        await waitFor(() => expect(lastListCall()).toEqual([{}, FIRST_PAGE]));
    });

    it('removes q when the keyword is cleared', async () => {
        mockListings();

        renderListings('/listings?q=foo');

        fireEvent.change(screen.getByLabelText('Keyword'), { target: { value: '' } });

        await waitFor(() => expect(currentSearchParams().has('q')).toBe(false), { timeout: 2000 });
        await waitFor(() => expect(lastListCall()).toEqual([{}, FIRST_PAGE]));
    });

    it('keeps a geocoded location local until a radius is picked', async () => {
        mockListings();
        vi.mocked(geocodingApi.resolve).mockResolvedValue({ status: 'success', data: STOCKHOLM });

        renderListings();

        await waitFor(() => expect(productsApi.list).toHaveBeenCalledTimes(1));

        fireEvent.change(screen.getByLabelText('Location'), { target: { value: 'Stockholm' } });
        fireEvent.blur(screen.getByLabelText('Location'));

        await waitFor(() => expect(screen.getByRole('combobox', { name: 'Radius' })).not.toBeDisabled());
        expect(productsApi.list).toHaveBeenCalledTimes(1);
        expect(currentSearchParams().toString()).toBe('');

        fireEvent.change(screen.getByRole('combobox', { name: 'Radius' }), { target: { value: '50' } });

        await waitFor(() =>
            expect(currentSearchParams().toString()).toBe(
                'lat=59.3293&lng=18.0686&radius_km=50&location_label=Stockholm'
            )
        );
        await waitFor(() => expect(lastListCall()).toEqual([{ ...STOCKHOLM, radius_km: 50 }, FIRST_PAGE]));
    });

    it('removes the whole location when the radius is cleared', async () => {
        mockListings();

        renderListings('/listings?lat=59.3293&lng=18.0686&radius_km=50&location_label=Stockholm');

        await waitFor(() =>
            expect(productsApi.list).toHaveBeenCalledWith({ ...STOCKHOLM, radius_km: 50 }, FIRST_PAGE)
        );

        fireEvent.change(screen.getByRole('combobox', { name: 'Radius' }), { target: { value: '' } });

        await waitFor(() => expect(currentSearchParams().toString()).toBe(''));
        await waitFor(() => expect(lastListCall()).toEqual([{}, FIRST_PAGE]));
        expect(screen.getByRole('combobox', { name: 'Radius' })).not.toBeDisabled();
    });

    it('applies "Use my location" to a seeded radius without a location label', async () => {
        mockListings();
        vi.mocked(getCurrentPosition).mockResolvedValue({ lat: 57.7, lng: 11.97 });

        renderListings('/listings?lat=59.3293&lng=18.0686&radius_km=50&location_label=Stockholm');

        await waitFor(() => expect(screen.getByText('Test Horse')).toBeInTheDocument());

        fireEvent.click(screen.getByRole('button', { name: /use my location/i }));

        await waitFor(() => expect(currentSearchParams().toString()).toBe('lat=57.7&lng=11.97&radius_km=50'));
        await waitFor(() => expect(lastListCall()).toEqual([{ lat: 57.7, lng: 11.97, radius_km: 50 }, FIRST_PAGE]));
        expect(screen.getByLabelText('Location')).toHaveValue('');
    });

    it('warns when the browser location is unavailable', async () => {
        mockListings();

        renderListings();

        fireEvent.click(screen.getByRole('button', { name: /use my location/i }));

        expect(await screen.findByText(/couldn't access your location/i)).toBeInTheDocument();
        expect(currentSearchParams().toString()).toBe('');
    });

    it.each([
        ['an error response', () => vi.mocked(geocodingApi.resolve).mockResolvedValue({ status: 'error' })],
        ['a rejected request', () => vi.mocked(geocodingApi.resolve).mockRejectedValue(new Error('boom'))],
    ])('warns and leaves the URL unchanged when geocoding fails with %s', async (_name, mockFailure) => {
        mockListings();
        mockFailure();

        renderListings();

        fireEvent.change(screen.getByLabelText('Location'), { target: { value: 'Nowhere' } });
        fireEvent.blur(screen.getByLabelText('Location'));

        expect(await screen.findByText(/couldn't find that location/i)).toBeInTheDocument();
        expect(currentSearchParams().toString()).toBe('');
        expect(screen.getByRole('combobox', { name: 'Radius' })).toBeDisabled();
    });

    describe('save this search', () => {
        it('is hidden when logged out', async () => {
            mockListings();

            renderListings('/listings?category_id=cat-1');

            await waitFor(() => expect(screen.getByText('Test Horse')).toBeInTheDocument());
            expect(screen.queryByRole('button', { name: 'Save this search' })).not.toBeInTheDocument();
        });

        it('is disabled with a hint when no filter is applied', async () => {
            logInAs('alice');
            mockListings();

            renderListings();

            expect(screen.getByRole('button', { name: 'Save this search' })).toBeDisabled();
            expect(screen.getByText('Choose at least one filter to save this search.')).toBeInTheDocument();
        });

        it('is disabled with a hint when the filters would fail validation', async () => {
            logInAs('alice');
            mockListings();

            renderListings('/listings?min_age=9&max_age=3');

            expect(screen.getByRole('button', { name: 'Save this search' })).toBeDisabled();
            expect(screen.getByText("A minimum can't be greater than its maximum.")).toBeInTheDocument();
        });

        it('saves the applied filters under the suggested name and confirms', async () => {
            logInAs('alice');
            mockListings();
            vi.mocked(savedSearchesApi.create).mockResolvedValue({
                status: 'success',
                data: {
                    id: 's1',
                    user_id: 'u1',
                    name: 'Horses',
                    criteria: { category_id: 'cat-1' },
                    location_label: null,
                    alerts_enabled: true,
                    last_notified_at: null,
                    created_at: '2026-10-11T00:00:00Z',
                    updated_at: '2026-10-11T00:00:00Z',
                },
            });

            renderListings('/listings?category_id=cat-1');
            await screen.findByRole('option', { name: /Horses/ });

            const saveButton = screen.getByRole('button', { name: 'Save this search' });
            expect(saveButton).not.toBeDisabled();
            fireEvent.click(saveButton);

            expect(await screen.findByLabelText('Name')).toHaveValue('Horses');
            fireEvent.click(screen.getByRole('button', { name: 'Save' }));

            await waitFor(() =>
                expect(savedSearchesApi.create).toHaveBeenCalledWith({
                    name: 'Horses',
                    criteria: { category_id: 'cat-1' },
                    location_label: undefined,
                    alerts_enabled: true,
                })
            );
            expect(await screen.findByText(/Saved "Horses"\./)).toBeInTheDocument();
            // findByRole waits out the closing dialog, which aria-hides its siblings during its exit transition.
            expect(await screen.findByRole('link', { name: 'View my saved searches' })).toHaveAttribute(
                'href',
                '/saved-searches'
            );

            await chooseCategory('');
            await waitFor(() => expect(screen.queryByText(/Saved "Horses"\./)).not.toBeInTheDocument());
        });

        it('sends the location label with a location', async () => {
            logInAs('alice');
            mockListings();
            vi.mocked(savedSearchesApi.create).mockResolvedValue({ status: 'error', message: 'nope' });

            renderListings('/listings?lat=59.3293&lng=18.0686&radius_km=50&location_label=Stockholm');

            fireEvent.click(screen.getByRole('button', { name: 'Save this search' }));
            expect(await screen.findByLabelText('Name')).toHaveValue('Within 50 km of Stockholm');
            fireEvent.click(screen.getByRole('button', { name: 'Save' }));

            await waitFor(() =>
                expect(savedSearchesApi.create).toHaveBeenCalledWith({
                    name: 'Within 50 km of Stockholm',
                    criteria: { ...STOCKHOLM, radius_km: 50 },
                    location_label: 'Stockholm',
                    alerts_enabled: true,
                })
            );
        });
    });
});
