import { useState, useEffect, useCallback } from 'react';
import { PawPrint, Plus, Trash2 } from 'lucide-react';
import { horseAttributesApi } from '../../api/horseAttributesApi';
import type { HorseAttributeOption, HorseAttributeType } from '../../types/horseAttributes';

const TYPES: { value: HorseAttributeType; label: string }[] = [
    { value: 'breed', label: 'Breed' },
    { value: 'discipline', label: 'Discipline' },
    { value: 'gender', label: 'Gender' },
];

export const HorseAttributes = () => {
    const [activeType, setActiveType] = useState<HorseAttributeType>('breed');
    const [options, setOptions] = useState<HorseAttributeOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [showForm, setShowForm] = useState(false);
    const [newValue, setNewValue] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchOptions = useCallback(async (type: HorseAttributeType) => {
        try {
            setLoading(true);
            const response = await horseAttributesApi.list(type);
            if (response.status === 'success') {
                setOptions(response.data || []);
            } else {
                setError(response.message || 'Failed to fetch horse attribute options');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOptions(activeType);
    }, [activeType, fetchOptions]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newValue.trim()) return;

        setSubmitting(true);
        try {
            const response = await horseAttributesApi.create({ type: activeType, value: newValue.trim() });
            if (response.status === 'success') {
                await fetchOptions(activeType);
                setNewValue('');
                setShowForm(false);
            } else {
                alert(response.message || 'Failed to create option');
            }
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to create option');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this value?')) return;

        try {
            const response = await horseAttributesApi.delete(id);
            if (response.status === 'success') {
                fetchOptions(activeType);
            } else {
                alert(response.message || 'Failed to delete option');
            }
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to delete option');
        }
    };

    return (
        <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
            <div className="flex justify-between items-center mb-6">
                <h4 className="text-xl font-semibold text-black dark:text-white flex items-center gap-2">
                    <PawPrint className="w-6 h-6" />
                    Horse Attributes
                </h4>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add New
                </button>
            </div>

            <div className="mb-6 flex gap-2 border-b border-stroke dark:border-strokedark">
                {TYPES.map((t) => (
                    <button
                        key={t.value}
                        onClick={() => {
                            setActiveType(t.value);
                            setShowForm(false);
                        }}
                        className={`px-4 py-2 font-medium ${activeType === t.value
                            ? 'border-b-2 border-primary text-primary'
                            : 'text-gray-500 dark:text-gray-400'
                            }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {error && (
                <div className="mb-4 text-red-500 bg-red-100 p-3 rounded">
                    {error}
                </div>
            )}

            {showForm && (
                <div className="mb-8 bg-gray-50 dark:bg-meta-4 p-6 rounded-lg">
                    <h5 className="mb-4 font-semibold text-black dark:text-white">
                        Add {TYPES.find((t) => t.value === activeType)?.label} Value
                    </h5>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                                Value
                            </label>
                            <input
                                type="text"
                                value={newValue}
                                onChange={(e) => setNewValue(e.target.value)}
                                required
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                placeholder="e.g. Warmblood"
                            />
                        </div>
                        <div className="flex justify-end gap-3 mt-2">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="flex justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white bg-white dark:bg-boxdark"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex justify-center rounded bg-primary py-2 px-6 font-medium text-gray hover:bg-opacity-90 text-white"
                            >
                                {submitting ? 'Creating...' : 'Create'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="flex flex-col">
                <div className="grid grid-cols-2 rounded-sm bg-gray-2 dark:bg-meta-4">
                    <div className="p-2.5 xl:p-5">
                        <h5 className="text-sm font-medium uppercase xsm:text-base">Value</h5>
                    </div>
                    <div className="p-2.5 text-center xl:p-5">
                        <h5 className="text-sm font-medium uppercase xsm:text-base">Actions</h5>
                    </div>
                </div>

                {loading ? (
                    <div className="p-10 text-center">Loading...</div>
                ) : options.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">No values found. Add one!</div>
                ) : (
                    options.map((opt, idx) => (
                        <div
                            className={`grid grid-cols-2 ${idx === options.length - 1 ? '' : 'border-b border-stroke dark:border-strokedark'}`}
                            key={opt.id}
                        >
                            <div className="flex items-center p-2.5 xl:p-5">
                                <p className="text-black dark:text-white font-medium">{opt.value}</p>
                            </div>
                            <div className="flex items-center justify-center gap-2 p-2.5 xl:p-5">
                                <button
                                    onClick={() => handleDelete(opt.id)}
                                    className="hover:text-primary transition-colors text-red-500"
                                    title="Delete value"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
