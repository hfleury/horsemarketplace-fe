import { useFormContext } from 'react-hook-form';
import FormTextField from '../../ui/FormTextField';
import type { CreateProductRequest } from '../../../types/product';

const HorseFields = () => {
    const { register, formState: { errors } } = useFormContext<CreateProductRequest>();

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
                <FormTextField
                    label="Breed"
                    type="text"
                    error={!!errors.horse?.breed?.message}
                    helperText={errors.horse?.breed?.message}
                    {...register('horse.breed')}
                />
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
                <FormTextField
                    label="Gender"
                    type="text" // Could be select
                    error={!!errors.horse?.gender?.message}
                    helperText={errors.horse?.gender?.message}
                    {...register('horse.gender')}
                />
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
            </div>

            {/* Pedigree could be added here as a complex nested form later */}
        </div>
    );
};

export default HorseFields;
