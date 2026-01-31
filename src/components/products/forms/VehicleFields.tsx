import { useFormContext } from 'react-hook-form';
import FormTextField from '../../ui/FormTextField';
import type { CreateProductRequest } from '../../../types/product';

const VehicleFields = () => {
    const { register, formState: { errors } } = useFormContext<CreateProductRequest>();

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Vehicle Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField
                    label="Make"
                    type="text"
                    error={!!errors.vehicle?.make?.message}
                    helperText={errors.vehicle?.make?.message}
                    {...register('vehicle.make')}
                />
                <FormTextField
                    label="Model"
                    type="text"
                    error={!!errors.vehicle?.model?.message}
                    helperText={errors.vehicle?.model?.message}
                    {...register('vehicle.model')}
                />
                <FormTextField
                    label="Year"
                    type="number"
                    error={!!errors.vehicle?.year?.message}
                    helperText={errors.vehicle?.year?.message}
                    {...register('vehicle.year', { valueAsNumber: true })}
                />
                <FormTextField
                    label="Load Weight (kg)"
                    type="number"
                    error={!!errors.vehicle?.load_weight?.message}
                    helperText={errors.vehicle?.load_weight?.message}
                    {...register('vehicle.load_weight', { valueAsNumber: true })}
                />
                <FormTextField
                    label="Total Weight (kg)"
                    type="number"
                    error={!!errors.vehicle?.total_weight?.message}
                    helperText={errors.vehicle?.total_weight?.message}
                    {...register('vehicle.total_weight', { valueAsNumber: true })}
                />
                <FormTextField
                    label="Condition"
                    type="text"
                    error={!!errors.vehicle?.condition?.message}
                    helperText={errors.vehicle?.condition?.message}
                    {...register('vehicle.condition')}
                />
            </div>
        </div>
    );
};

export default VehicleFields;
