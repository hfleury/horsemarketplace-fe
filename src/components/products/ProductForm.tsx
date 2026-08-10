import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';

import { ProductType, ProductStatus } from '../../types/product';
import type { CreateProductRequest } from '../../types/product';
import { productsApi } from '../../api/products';
import { getCurrentPosition } from '../../lib/geolocation';

import Button from '../../components/ui/Button';
import FormTextField from '../../components/ui/FormTextField';
import HorseFields from './forms/HorseFields';
import VehicleFields from './forms/VehicleFields';
import EquipmentFields from './forms/EquipmentFields';

// Zod Schema
const productSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    price_sek: z.number().min(0, "Price must be positive"),
    description: z.string().min(20, "Description must be at least 20 characters"),
    city: z.string().min(2, "City is required"),
    area: z.string().optional(),
    type: z.nativeEnum(ProductType),
    status: z.nativeEnum(ProductStatus),
    transaction_type: z.string().min(1, "Transaction type is required"),

    // Specifics
    horse: z.object({
        name: z.string().min(2, "Horse name required").optional(),
        age: z.number().optional(),
        breed: z.string().optional(),
        year_of_birth: z.number().optional(),
        gender: z.string().optional(),
        height: z.number().optional(),
        color: z.string().optional(),
        dressage_level: z.string().optional(),
        jump_level: z.string().optional(),
        orientation: z.string().optional(),
    }).optional(),
    vehicle: z.object({
        make: z.string().optional(),
        model: z.string().optional(),
        year: z.number().optional(),
        load_weight: z.number().optional(),
        total_weight: z.number().optional(),
        condition: z.string().optional(),
    }).optional(),
    equipment: z.object({
        make: z.string().optional(),
        model: z.string().optional(),
        size: z.string().optional(),
        condition: z.string().optional(),
        sub_type: z.string().optional(),
        boom_width: z.string().optional(),
    }).optional(),
}).superRefine((data, ctx) => {
    if (data.type === ProductType.Horse) {
        if (!data.horse?.name) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["horse", "name"],
                message: "Horse name is required"
            });
        }
    }
});

const ProductForm = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const methods = useForm<CreateProductRequest>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            status: ProductStatus.Published, // Default to published intention
            type: ProductType.Horse,
            transaction_type: 'Sale'
        }
    });

    const { register, handleSubmit, watch, formState: { errors } } = methods;
    const selectedType = watch('type');

    const onSubmit = async (data: CreateProductRequest) => {
        setIsSubmitting(true);
        setSubmitError(null);
        try {
            const position = await getCurrentPosition();
            if (position) {
                data.latitude = position.lat;
                data.longitude = position.lng;
            }
            await productsApi.createProduct(data);
            // Redirect to listings or dashboard?
            navigate('/');
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to create ad";
            setSubmitError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-6">Create New Ad</h2>

                {submitError && (
                    <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
                        {submitError}
                    </div>
                )}

                {/* Common Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                            {...register('type')}
                            className="w-full px-3 py-2 border border-input-border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value={ProductType.Horse}>Horse</option>
                            <option value={ProductType.Vehicle}>Vehicle</option>
                            <option value={ProductType.Equipment}>Equipment</option>
                        </select>
                    </div>

                    <FormTextField
                        label="Title"
                        placeholder="e.g. Stunning Dressage Gelding"
                        error={!!errors.title?.message}
                        helperText={errors.title?.message}
                        {...register('title')}
                    />

                    <FormTextField
                        label="Price (SEK)"
                        type="number"
                        error={!!errors.price_sek?.message}
                        helperText={errors.price_sek?.message}
                        {...register('price_sek', { valueAsNumber: true })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        {...register('description')}
                        rows={4}
                        className="w-full px-3 py-2 border border-input-border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        placeholder="Describe your item in detail..."
                    />
                    {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormTextField
                        label="City"
                        error={!!errors.city?.message}
                        helperText={errors.city?.message}
                        {...register('city')}
                    />
                    <FormTextField
                        label="Area (Region)"
                        error={!!errors.area?.message}
                        helperText={errors.area?.message}
                        {...register('area')}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
                    <select
                        {...register('transaction_type')}
                        className="w-full px-3 py-2 border border-input-border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    >
                        <option value="Sale">For Sale</option>
                        <option value="Rent">For Rent</option>
                        <option value="Looking For">Looking For</option>
                    </select>
                </div>

                {/* Dynamic Fields */}
                <div className="border-t pt-4 mt-4">
                    {selectedType === ProductType.Horse && <HorseFields />}
                    {selectedType === ProductType.Vehicle && <VehicleFields />}
                    {selectedType === ProductType.Equipment && <EquipmentFields />}
                </div>

                <div className="flex justify-end pt-6">
                    <Button type="submit" isLoading={isSubmitting} className="w-full md:w-auto">
                        Publish Ad
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
};

export default ProductForm;
