import ProductForm from '../components/products/ProductForm';

const CreateProduct = () => {
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
                    <ProductForm />
                </div>
            </main>
        </div>
    );
};

export default CreateProduct;
