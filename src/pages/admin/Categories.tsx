import { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Folder, ChevronRight, ImageIcon } from 'lucide-react';
import { apiFetch } from '../../lib/apiClient';

interface Category {
    id: string;
    name: string;
    picture_url?: string;
    parent_id?: string;
    subcategories?: Category[];
    created_at?: string;
}

interface FlattenedCategory extends Category {
    depth: number;
    parentName: string | null;
}

interface CreateCategoryRequest {
    name: string;
    picture_url?: string;
    parent_id?: string;
}

interface ApiResponse<T> {
    status: string;
    message?: string;
    data?: T;
    error?: string;
}

export const Categories = () => {
    const [flatCategories, setFlatCategories] = useState<FlattenedCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState<CreateCategoryRequest>({
        name: '',
        picture_url: '',
        parent_id: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const flattenCategories = (cats: Category[], depth = 0, parentName: string | null = null): FlattenedCategory[] => {
        return cats.reduce((acc, cat) => {
            const flatCat = { ...cat, depth, parentName };
            acc.push(flatCat);
            if (cat.subcategories && cat.subcategories.length > 0) {
                acc.push(...flattenCategories(cat.subcategories, depth + 1, cat.name));
            }
            return acc;
        }, [] as FlattenedCategory[]);
    };

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await apiFetch<ApiResponse<Category[]>>('/categories');
            if (response.status === 'success' && response.data) {
                setFlatCategories(flattenCategories(response.data));
            } else {
                setError(response.message || 'Failed to fetch categories');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) return;

        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                parent_id: formData.parent_id === '' ? null : formData.parent_id
            };

            const response = await apiFetch<ApiResponse<Category>>('/categories', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            if (response.status === 'success') {
                await fetchCategories();
                setFormData({ name: '', picture_url: '', parent_id: '' });
                setShowForm(false);
            } else {
                alert(response.message || 'Failed to create category');
            }
        } catch (err) {
            console.error(err);
            alert('Failed to create category');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure? This will delete the category and potential subcategories.')) return;

        try {
            const response = await apiFetch<ApiResponse<null>>(`/categories/${id}`, {
                method: 'DELETE'
            });
            if (response.status === 'success') {
                fetchCategories();
            } else {
                alert(response.message || 'Failed to delete category');
            }
        } catch (err) {
            alert('Failed to delete category');
        }
    };

    return (
        <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
            <div className="flex justify-between items-center mb-6">
                <h4 className="text-xl font-semibold text-black dark:text-white flex items-center gap-2">
                    <Tag className="w-6 h-6" />
                    Categories
                </h4>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add New
                </button>
            </div>

            {error && (
                <div className="mb-4 text-red-500 bg-red-100 p-3 rounded">
                    {error}
                </div>
            )}

            {/* Create Form */}
            {showForm && (
                <div className="mb-8 bg-gray-50 dark:bg-meta-4 p-6 rounded-lg">
                    <h5 className="mb-4 font-semibold text-black dark:text-white">Create New Category</h5>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                    placeholder="Category Name"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                                    Parent Category (Optional)
                                </label>
                                <select
                                    name="parent_id"
                                    value={formData.parent_id}
                                    onChange={handleInputChange}
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                >
                                    <option value="">None (Top Level)</option>
                                    {flatCategories.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {'-'.repeat(cat.depth * 2)} {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                                Picture URL (Optional)
                            </label>
                            <input
                                type="text"
                                name="picture_url"
                                value={formData.picture_url}
                                onChange={handleInputChange}
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                placeholder="https://example.com/image.jpg"
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

            {/* Categories Table */}
            <div className="flex flex-col">
                <div className="grid grid-cols-4 rounded-sm bg-gray-2 dark:bg-meta-4 sm:grid-cols-5">
                    <div className="p-2.5 xl:p-5 col-span-2">
                        <h5 className="text-sm font-medium uppercase xsm:text-base">Name</h5>
                    </div>
                    <div className="p-2.5 text-center xl:p-5">
                        <h5 className="text-sm font-medium uppercase xsm:text-base">Parent</h5>
                    </div>
                    <div className="p-2.5 text-center xl:p-5 hidden sm:block">
                        <h5 className="text-sm font-medium uppercase xsm:text-base">Image</h5>
                    </div>
                    <div className="p-2.5 text-center xl:p-5">
                        <h5 className="text-sm font-medium uppercase xsm:text-base">Actions</h5>
                    </div>
                </div>

                {loading ? (
                    <div className="p-10 text-center">Loading categories...</div>
                ) : flatCategories.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">No categories found. Create one!</div>
                ) : (
                    flatCategories.map((cat) => (
                        <div
                            className={`grid grid-cols-4 sm:grid-cols-5 ${flatCategories.indexOf(cat) === flatCategories.length - 1 ? '' : 'border-b border-stroke dark:border-strokedark'
                                }`}
                            key={cat.id}
                        >
                            <div className="flex items-center gap-3 p-2.5 xl:p-5 col-span-2">
                                <div style={{ marginLeft: `${cat.depth * 20}px` }} className="flex items-center gap-2">
                                    {cat.depth > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
                                    <Folder className={`w-5 h-5 ${cat.depth === 0 ? 'text-primary' : 'text-gray-500'}`} />
                                    <p className="text-black dark:text-white font-medium">
                                        {cat.name}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-center p-2.5 xl:p-5">
                                <span className="text-gray-500 text-sm">
                                    {cat.parentName || '-'}
                                </span>
                            </div>

                            <div className="hidden sm:flex items-center justify-center p-2.5 xl:p-5">
                                {cat.picture_url ? (
                                    <img src={cat.picture_url} alt={cat.name} className="h-10 w-10 object-cover rounded" />
                                ) : (
                                    <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center">
                                        <ImageIcon className="w-5 h-5 text-gray-400" />
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-center gap-2 p-2.5 xl:p-5">
                                {/* Edit button could be added here */}
                                <button
                                    onClick={() => handleDelete(cat.id)}
                                    className="hover:text-primary transition-colors text-red-500"
                                    title="Delete Category"
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
