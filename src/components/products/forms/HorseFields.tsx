import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import FormTextField from '../../ui/FormTextField';
import type { CreateProductRequest } from '../../../types/product';
import { horseAttributesApi } from '../../../api/horseAttributesApi';
import type { HorseAttributeOption } from '../../../types/horseAttributes';

const HorseFields = () => {
    const { register, formState: { errors } } = useFormContext<CreateProductRequest>();

    const [breedOptions, setBreedOptions] = useState<HorseAttributeOption[]>([]);
    const [disciplineOptions, setDisciplineOptions] = useState<HorseAttributeOption[]>([]);
    const [genderOptions, setGenderOptions] = useState<HorseAttributeOption[]>([]);

    useEffect(() => {
        horseAttributesApi
            .list('breed')
            .then((response) => {
                if (response.status === 'success' && response.data) {
                    setBreedOptions(response.data);
                }
            })
            .catch(() => {
                // Attribute dropdowns are a progressive enhancement; ignore fetch failures here.
            });
        horseAttributesApi
            .list('discipline')
            .then((response) => {
                if (response.status === 'success' && response.data) {
                    setDisciplineOptions(response.data);
                }
            })
            .catch(() => {
                // Attribute dropdowns are a progressive enhancement; ignore fetch failures here.
            });
        horseAttributesApi
            .list('gender')
            .then((response) => {
                if (response.status === 'success' && response.data) {
                    setGenderOptions(response.data);
                }
            })
            .catch(() => {
                // Attribute dropdowns are a progressive enhancement; ignore fetch failures here.
            });
    }, []);

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Horse Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField
                    label="Name"
                    type="text"
                    error={!!errors.horse?.name?.message}
                    helperText={errors.horse?.name?.message}
                    {...register('horse.name')}
                />
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
                    <select
                        {...register('horse.breed')}
                        className="w-full px-3 py-2 border border-input-border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    >
                        <option value="">Select breed</option>
                        {breedOptions.map((opt) => (
                            <option key={opt.id} value={opt.value}>
                                {opt.value}
                            </option>
                        ))}
                    </select>
                </div>
                <FormTextField
                    label="Age"
                    type="number"
                    error={!!errors.horse?.age?.message}
                    helperText={errors.horse?.age?.message}
                    {...register('horse.age', { valueAsNumber: true })}
                />
                <FormTextField
                    label="Year of Birth"
                    type="number"
                    error={!!errors.horse?.year_of_birth?.message}
                    helperText={errors.horse?.year_of_birth?.message}
                    {...register('horse.year_of_birth', { valueAsNumber: true })}
                />
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <select
                        {...register('horse.gender')}
                        className="w-full px-3 py-2 border border-input-border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    >
                        <option value="">Select gender</option>
                        {genderOptions.map((opt) => (
                            <option key={opt.id} value={opt.value}>
                                {opt.value}
                            </option>
                        ))}
                    </select>
                </div>
                <FormTextField
                    label="Height (cm)"
                    type="number"
                    error={!!errors.horse?.height?.message}
                    helperText={errors.horse?.height?.message}
                    {...register('horse.height', { valueAsNumber: true })}
                />
                <FormTextField
                    label="Color"
                    type="text"
                    error={!!errors.horse?.color?.message}
                    helperText={errors.horse?.color?.message}
                    {...register('horse.color')}
                />
                <FormTextField
                    label="Dressage Level"
                    type="text"
                    error={!!errors.horse?.dressage_level?.message}
                    helperText={errors.horse?.dressage_level?.message}
                    {...register('horse.dressage_level')}
                />
                <FormTextField
                    label="Jump Level"
                    type="text"
                    error={!!errors.horse?.jump_level?.message}
                    helperText={errors.horse?.jump_level?.message}
                    {...register('horse.jump_level')}
                />
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Discipline</label>
                    <select
                        {...register('horse.orientation')}
                        className="w-full px-3 py-2 border border-input-border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    >
                        <option value="">Select discipline</option>
                        {disciplineOptions.map((opt) => (
                            <option key={opt.id} value={opt.value}>
                                {opt.value}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Pedigree could be added here as a complex nested form later */}
        </div>
    );
};

export default HorseFields;
