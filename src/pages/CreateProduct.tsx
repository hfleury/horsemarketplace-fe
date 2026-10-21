import { useNavigate } from 'react-router-dom';
import ProductForm from '../components/products/ProductForm';
import { productsApi } from '../api/products';
import { getCurrentPosition } from '../lib/geolocation';
import { extractErrorMessage } from '../lib/errors';
import { startBoostCheckout } from '../lib/payments/startBoostCheckout';
import { splitBoostSelection } from '../lib/products/productFormValues';
import type { ProductFormValues } from '../lib/products/productFormValues';
import type { CreateProductRequest } from '../types/product';
import type { EditProductLocationState } from './EditProduct';

async function withBrowserLocation(product: CreateProductRequest): Promise<CreateProductRequest> {
    const position = await getCurrentPosition();
    return position ? { ...product, latitude: position.lat, longitude: position.lng } : product;
}

const CreateProduct = () => {
    const navigate = useNavigate();

    const handleCreate = async (values: ProductFormValues) => {
        const { product, boost } = splitBoostSelection(values);
        const response = await productsApi.createProduct(await withBrowserLocation(product));
        const productId = response.data?.id;
        if (response.status !== 'success' || !productId) {
            throw new Error(response.message || 'Failed to create the listing');
        }

        if (!boost) {
            navigate(`/listings/${productId}`);
            return;
        }
        try {
            await startBoostCheckout(productId, boost);
        } catch (err) {
            // The listing exists now, so go to its edit page instead of letting
            // a resubmit of this form create a duplicate.
            const state: EditProductLocationState = { boostError: extractErrorMessage(err, 'The payment could not be started') };
            navigate(`/listings/${productId}/edit`, { state });
        }
    };

    return (
        <div className="h-full bg-gray-50">
            {/* Header Section for the page */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold leading-tight text-gray-900">
                        Create a Listing
                    </h1>
                </div>
            </div>
            <main>
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <ProductForm submitLabel="Publish Ad" onSubmit={handleCreate} />
                </div>
            </main>
        </div>
    );
};

export default CreateProduct;
