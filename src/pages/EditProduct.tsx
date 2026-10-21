import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ProductForm from '../components/products/ProductForm';
import { productsApi } from '../api/products';
import { useAuth } from '../hooks/useAuth';
import { extractErrorMessage } from '../lib/errors';
import { startBoostCheckout } from '../lib/payments/startBoostCheckout';
import { productToFormValues, splitBoostSelection, toUpdateRequest } from '../lib/products/productFormValues';
import type { ProductFormValues } from '../lib/products/productFormValues';
import { ProductStatus, type Product } from '../types/product';

/** Router state CreateProduct passes when the listing was saved but its boost wasn't. */
export interface EditProductLocationState {
    boostError?: string;
}

type ListingLoad = { product: Product } | { error: string };

async function loadListing(id: string): Promise<ListingLoad> {
    try {
        const response = await productsApi.getById(id);
        if (response.status === 'success' && response.data) return { product: response.data };
        return { error: response.message || 'Listing not found' };
    } catch (err) {
        return { error: extractErrorMessage(err, 'An error occurred') };
    }
}

const PageShell = ({ children }: { children: React.ReactNode }) => (
    <div className="h-full bg-gray-50">
        <div className="bg-white shadow">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold leading-tight text-gray-900">Edit Listing</h1>
            </div>
        </div>
        <main>
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</div>
        </main>
    </div>
);

const messageClassName = 'max-w-2xl mx-auto p-4 text-sm rounded-lg';

export function EditProduct() {
    const { id = '' } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const boostError = (useLocation().state as EditProductLocationState | null)?.boostError;
    const [listing, setListing] = useState<ListingLoad | null>(null);

    useEffect(() => {
        let isMounted = true;
        loadListing(id).then((loaded) => {
            if (isMounted) setListing(loaded);
        });
        return () => {
            isMounted = false;
        };
    }, [id]);

    const handleSave = async (values: ProductFormValues) => {
        const { product, boost } = splitBoostSelection(values);
        const response = await productsApi.updateProduct(id, toUpdateRequest(product));
        if (response.status !== 'success') {
            throw new Error(response.message || 'Failed to save the listing');
        }

        if (!boost) {
            navigate(`/listings/${id}`);
            return;
        }
        try {
            await startBoostCheckout(id, boost);
        } catch (err) {
            // Saving again is a harmless repeat of the same edit, so the seller can just retry.
            throw new Error(`Changes saved, but the boost couldn't start: ${extractErrorMessage(err, 'unknown error')}`);
        }
    };

    if (!listing) {
        return (
            <PageShell>
                <p className="p-10 text-center text-gray-600">Loading listing...</p>
            </PageShell>
        );
    }
    if ('error' in listing) {
        return (
            <PageShell>
                <p className={`${messageClassName} text-red-700 bg-red-100`} role="alert">{listing.error}</p>
            </PageShell>
        );
    }
    if (listing.product.user_id !== user?.id) {
        return (
            <PageShell>
                <p className={`${messageClassName} text-gray-700 bg-white`}>You can only edit your own listings</p>
            </PageShell>
        );
    }

    const { product } = listing;
    return (
        <PageShell>
            {boostError && (
                <p className={`${messageClassName} mb-4 text-red-700 bg-red-100`} role="alert">
                    Listing created, but the boost couldn't start: {boostError}. You can try again below.
                </p>
            )}
            <ProductForm
                defaultValues={productToFormValues(product)}
                isTypeLocked
                submitLabel="Save changes"
                notice={
                    product.status === ProductStatus.Published
                        ? 'Changes to a published listing may need admin approval again'
                        : undefined
                }
                onSubmit={handleSave}
            />
        </PageShell>
    );
}

export default EditProduct;
