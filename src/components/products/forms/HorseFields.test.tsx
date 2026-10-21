import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import HorseFields from './HorseFields';
import { horseAttributesApi } from '../../../api/horseAttributesApi';
import type { CreateProductRequest } from '../../../types/product';
import type { HorseAttributeOption } from '../../../types/horseAttributes';

vi.mock('../../../api/horseAttributesApi', () => ({
    horseAttributesApi: { list: vi.fn() },
}));

const optionsByType: Record<string, string[]> = {
    breed: ['Arabian', 'Friesian'],
    gender: ['Mare', 'Gelding'],
    discipline: ['Dressage', 'Jumping'],
};

function toOptions(type: string): HorseAttributeOption[] {
    return optionsByType[type].map((value, index) => ({ id: `${type}-${index}`, type, value }) as HorseAttributeOption);
}

function PrefilledHarness() {
    const methods = useForm<CreateProductRequest>({
        defaultValues: { horse: { name: 'Bella', breed: 'Friesian', gender: 'Gelding', orientation: 'Jumping' } },
    });
    return (
        <FormProvider {...methods}>
            <HorseFields />
        </FormProvider>
    );
}

describe('HorseFields', () => {
    beforeEach(() => {
        vi.mocked(horseAttributesApi.list).mockReset();
        vi.mocked(horseAttributesApi.list).mockImplementation(async (type) => ({ status: 'success', data: toOptions(type!) }));
    });

    it('shows prefilled breed, gender and discipline once their options load', async () => {
        render(<PrefilledHarness />);

        await screen.findByRole('option', { name: 'Friesian' });
        const [breed, gender, discipline] = screen.getAllByRole('combobox');
        expect(await screen.findByDisplayValue('Friesian')).toBe(breed);
        expect(gender).toHaveValue('Gelding');
        expect(discipline).toHaveValue('Jumping');
    });
});
