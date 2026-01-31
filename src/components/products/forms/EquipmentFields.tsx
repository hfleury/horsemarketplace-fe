import { useFormContext } from 'react-hook-form';
import FormTextField from '../../ui/FormTextField';
import type { CreateProductRequest } from '../../../types/product';

const EquipmentFields = () => {
    const { register, formState: { errors } } = useFormContext<CreateProductRequest>();

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Equipment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField
                    label="Make"
                    type="text"
                    error={!!errors.equipment?.make?.message}
                    helperText={errors.equipment?.make?.message}
                    {...register('equipment.make')}
                />
                <FormTextField
                    label="Model"
                    type="text"
                    error={!!errors.equipment?.model?.message}
                    helperText={errors.equipment?.model?.message}
                    {...register('equipment.model')}
                />
                <FormTextField
                    label="Size"
                    type="text"
                    error={!!errors.equipment?.size?.message}
                    helperText={errors.equipment?.size?.message}
                    {...register('equipment.size')}
                />
                <FormTextField
                    label="Condition"
                    type="text"
                    error={!!errors.equipment?.condition?.message}
                    helperText={errors.equipment?.condition?.message}
                    {...register('equipment.condition')}
                />
                <FormTextField
                    label="Sub Type (e.g. Dressage, Jumping)"
                    type="text"
                    error={!!errors.equipment?.sub_type?.message}
                    helperText={errors.equipment?.sub_type?.message}
                    {...register('equipment.sub_type')}
                />
                <FormTextField
                    label="Boom Width"
                    type="text"
                    error={!!errors.equipment?.boom_width?.message}
                    helperText={errors.equipment?.boom_width?.message}
                    {...register('equipment.boom_width')}
                />
            </div>
        </div>
    );
};

export default EquipmentFields;
