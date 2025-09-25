import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { ArrowLeft, Save, Upload, X, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

interface Brand {
    id: number;
    name: string;
}

interface Category {
    id: number;
    name: string;
}

interface Attribute {
    id: number;
    name: string;
    slug: string;
    type: 'text' | 'number' | 'select' | 'multiselect' | 'boolean';
    is_required: boolean;
    options?: string[]; // For select/multiselect types
}

interface CompatibleModel {
    id: number;
    brand_name: string;
    model_name: string;
    model_code: string;
}

interface Service {
    id: number;
    name: string;
    type: string;
    price: number;
    is_optional: boolean;
}

interface ProductImage {
    id: number;
    image_path: string;
    alt_text: string;
    sort_order: number;
    is_primary: boolean;
}

interface Product {
    id: number;
    name: string;
    slug: string;
    sku: string;
    brand_id: number;
    category_id: number;
    short_description: string;
    description: string;
    price: number;
    sale_price: number;
    cost_price: number;
    stock_quantity: number;
    low_stock_threshold: number;
    manufacturer_part_number: string;
    gc_number: string;
    weight: number;
    length: number;
    width: number;
    height: number;
    meta_title: string;
    meta_description: string;
    status: string;
    is_featured: boolean;
    manage_stock: boolean;
    images: ProductImage[];
    services: Array<{
        id: number;
        name: string;
        type: string;
        price: number;
        pivot: {
            custom_price: number;
            is_mandatory: boolean;
            is_free: boolean;
        };
    }>;
}

interface PageProps {
    product: Product;
    brands: Brand[];
    categories: Category[];
    attributes: Attribute[];
    compatible_models: CompatibleModel[];
    services: Service[];
    attribute_values: Record<number, string>;
    selected_compatible_models: number[];
}

export default function Edit({
    product,
    brands,
    categories,
    attributes,
    compatible_models,
    services,
    attribute_values,
    selected_compatible_models
}: PageProps) {
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<ProductImage[]>(product.images || []);
    const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);

    const { data, setData, post, processing, errors } = useForm({
        name: product.name || '',
        slug: product.slug || '',
        sku: product.sku || '',
        brand_id: product.brand_id?.toString() || '',
        category_id: product.category_id?.toString() || '',
        short_description: product.short_description || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        sale_price: product.sale_price?.toString() || '',
        cost_price: product.cost_price?.toString() || '',
        stock_quantity: product.stock_quantity?.toString() || '',
        low_stock_threshold: product.low_stock_threshold?.toString() || '5',
        manufacturer_part_number: product.manufacturer_part_number || '',
        gc_number: product.gc_number || '',
        weight: product.weight?.toString() || '',
        length: product.length?.toString() || '',
        width: product.width?.toString() || '',
        height: product.height?.toString() || '',
        meta_title: product.meta_title || '',
        meta_description: product.meta_description || '',
        status: product.status || 'active',
        is_featured: product.is_featured || false,
        manage_stock: product.manage_stock ?? true,
        attributes: attribute_values || {},
        compatible_models: selected_compatible_models || [],
        services: product.services?.map(service => ({
            service_id: service.id,
            custom_price: service.pivot.custom_price?.toString() || '',
            is_mandatory: service.pivot.is_mandatory || false,
            is_free: service.pivot.is_free || false,
        })) || [],
        new_images: [] as File[],
        new_image_alts: [] as string[],
        existing_images: existingImages.map(img => ({
            id: img.id,
            alt_text: img.alt_text || '',
            sort_order: img.sort_order,
            is_primary: img.is_primary
        })),
        delete_images: [] as number[],
    });

    // Update existing_images in form data when existingImages state changes
    useEffect(() => {
        setData('existing_images', existingImages.map(img => ({
            id: img.id,
            alt_text: img.alt_text || '',
            sort_order: img.sort_order,
            is_primary: img.is_primary
        })));
    }, [existingImages]);

    // Update delete_images in form data when deletedImageIds changes
    useEffect(() => {
        setData('delete_images', deletedImageIds);
    }, [deletedImageIds]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const totalImages = existingImages.length + selectedImages.length + files.length - deletedImageIds.length;

        if (totalImages > 10) {
            alert('Maximum 10 images allowed');
            return;
        }

        const newImages = [...selectedImages, ...files];
        setSelectedImages(newImages);
        setData('new_images', newImages);

        // Create previews
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreviews(prev => [...prev, e.target?.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeNewImage = (index: number) => {
        const newImages = selectedImages.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);

        setSelectedImages(newImages);
        setImagePreviews(newPreviews);
        setData('new_images', newImages);
    };

    const removeExistingImage = (imageId: number) => {
        setExistingImages(prev => prev.filter(img => img.id !== imageId));
        setDeletedImageIds(prev => [...prev, imageId]);
    };

    const setPrimaryExistingImage = (imageId: number) => {
        setExistingImages(prev => prev.map(img => ({
            ...img,
            is_primary: img.id === imageId
        })));
    };

    const updateExistingImageAlt = (imageId: number, altText: string) => {
        setExistingImages(prev => prev.map(img =>
            img.id === imageId ? { ...img, alt_text: altText } : img
        ));
    };

    const handleAttributeChange = (attributeId: number, value: string) => {
        setData('attributes', {
            ...data.attributes,
            [attributeId]: value
        });
    };

    const handleCompatibleModelToggle = (modelId: number) => {
        const currentModels = data.compatible_models;
        const isSelected = currentModels.includes(modelId);

        if (isSelected) {
            setData('compatible_models', currentModels.filter(id => id !== modelId));
        } else {
            setData('compatible_models', [...currentModels, modelId]);
        }
    };

    const addService = () => {
        setData('services', [
            ...data.services,
            { service_id: 0, custom_price: '', is_mandatory: false, is_free: false }
        ]);
    };

    const removeService = (index: number) => {
        setData('services', data.services.filter((_, i) => i !== index));
    };

    const updateService = (index: number, field: string, value: any) => {
        const updatedServices = [...data.services];
        updatedServices[index] = { ...updatedServices[index], [field]: value };
        setData('services', updatedServices);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/products/${product.id}`, {
            forceFormData: true,
            _method: 'patch'
        });
    };

    // Get primary image for display
    const primaryExistingImage = existingImages.find(img => img.is_primary);
    const hasPrimaryImage = primaryExistingImage || existingImages.length > 0;

    return (
        <AdminLayout>
            <Head title={`Edit Product - ${product.name}`} />

            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.visit('/admin/products')}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
                            <p className="text-gray-600 mt-2">Update product information</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Information */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.name ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        placeholder="Enter product name"
                                    />
                                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">SKU *</label>
                                    <input
                                        type="text"
                                        value={data.sku}
                                        onChange={(e) => setData('sku', e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.sku ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        placeholder="Enter SKU"
                                    />
                                    {errors.sku && <p className="mt-1 text-sm text-red-600">{errors.sku}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Brand *</label>
                                    <select
                                        value={data.brand_id}
                                        onChange={(e) => setData('brand_id', e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.brand_id ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                    >
                                        <option value="">Select Brand</option>
                                        {brands.map(brand => (
                                            <option key={brand.id} value={brand.id}>{brand.name}</option>
                                        ))}
                                    </select>
                                    {errors.brand_id && <p className="mt-1 text-sm text-red-600">{errors.brand_id}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                                    <select
                                        value={data.category_id}
                                        onChange={(e) => setData('category_id', e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.category_id ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(category => (
                                            <option key={category.id} value={category.id}>{category.name}</option>
                                        ))}
                                    </select>
                                    {errors.category_id && <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Manufacturer Part Number</label>
                                    <input
                                        type="text"
                                        value={data.manufacturer_part_number}
                                        onChange={(e) => setData('manufacturer_part_number', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter part number"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">GC Number</label>
                                    <input
                                        type="text"
                                        value={data.gc_number}
                                        onChange={(e) => setData('gc_number', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter GC number"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Short Description</label>
                                <textarea
                                    value={data.short_description}
                                    onChange={(e) => setData('short_description', e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Brief product description"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={6}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Detailed product description"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Product Images */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Product Images</h3>
                            <p className="text-sm text-gray-600 mt-1">Upload up to 10 images total. Click on an image to set as primary.</p>
                        </div>
                        <div className="p-6">
                            {/* Existing Images */}
                            {existingImages.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-md font-medium text-gray-900 mb-3">Current Images</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                        {existingImages.map((image) => (
                                            <div key={image.id} className="relative group">
                                                <div className={`relative border-2 rounded-lg overflow-hidden ${image.is_primary ? 'border-blue-500' : 'border-gray-200'
                                                    }`}>
                                                    <img
                                                        src={`/storage/${image.image_path}`}
                                                        alt={image.alt_text || `Product image ${image.sort_order}`}
                                                        className="w-full h-24 object-cover"
                                                    />
                                                    {image.is_primary && (
                                                        <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                                                            Primary
                                                        </div>
                                                    )}
                                                    <div className="absolute top-2 right-2 flex gap-1">
                                                        {!image.is_primary && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setPrimaryExistingImage(image.id)}
                                                                className="bg-white/90 hover:bg-white text-gray-700 p-1 rounded text-xs transition-colors"
                                                                title="Set as primary"
                                                            >
                                                                <ImageIcon className="w-3 h-3" />
                                                            </button>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeExistingImage(image.id)}
                                                            className="bg-red-500 hover:bg-red-600 text-white p-1 rounded transition-colors"
                                                            title="Remove image"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="Alt text"
                                                    value={image.alt_text || ''}
                                                    className="w-full mt-2 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                    onChange={(e) => updateExistingImageAlt(image.id, e.target.value)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Upload New Images */}
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    id="image-upload"
                                />
                                <label
                                    htmlFor="image-upload"
                                    className="cursor-pointer flex flex-col items-center justify-center gap-4"
                                >
                                    <Upload className="w-12 h-12 text-gray-400" />
                                    <div className="text-center">
                                        <p className="text-lg font-medium text-gray-900">Drop new images here or click to upload</p>
                                        <p className="text-sm text-gray-600">PNG, JPG, GIF up to 2MB each</p>
                                    </div>
                                </label>
                            </div>

                            {/* New Image Previews */}
                            {imagePreviews.length > 0 && (
                                <div className="mt-6">
                                    <h4 className="text-md font-medium text-gray-900 mb-3">New Images</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                        {imagePreviews.map((preview, index) => (
                                            <div key={index} className="relative group">
                                                <div className="relative border-2 border-gray-200 rounded-lg overflow-hidden">
                                                    <img
                                                        src={preview}
                                                        alt={`New preview ${index + 1}`}
                                                        className="w-full h-24 object-cover"
                                                    />
                                                    <div className="absolute top-2 right-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeNewImage(index)}
                                                            className="bg-red-500 hover:bg-red-600 text-white p-1 rounded transition-colors"
                                                            title="Remove image"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="Alt text"
                                                    className="w-full mt-2 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                    onChange={(e) => {
                                                        const newAlts = [...data.new_image_alts];
                                                        newAlts[index] = e.target.value;
                                                        setData('new_image_alts', newAlts);
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pricing & Inventory */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Pricing & Inventory</h3>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Regular Price *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.price}
                                        onChange={(e) => setData('price', e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.price ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        placeholder="0.00"
                                    />
                                    {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Sale Price</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.sale_price}
                                        onChange={(e) => setData('sale_price', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Cost Price</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.cost_price}
                                        onChange={(e) => setData('cost_price', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
                                    <input
                                        type="number"
                                        value={data.stock_quantity}
                                        onChange={(e) => setData('stock_quantity', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Low Stock Threshold</label>
                                    <input
                                        type="number"
                                        value={data.low_stock_threshold}
                                        onChange={(e) => setData('low_stock_threshold', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="5"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="draft">Draft</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={data.manage_stock}
                                        onChange={(e) => setData('manage_stock', e.target.checked)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Manage Stock</span>
                                </label>

                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={data.is_featured}
                                        onChange={(e) => setData('is_featured', e.target.checked)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Featured Product</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Physical Dimensions */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Physical Dimensions</h3>
                            <p className="text-sm text-gray-600 mt-1">Product dimensions for shipping calculations</p>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.weight}
                                        onChange={(e) => setData('weight', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Length (cm)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.length}
                                        onChange={(e) => setData('length', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Width (cm)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.width}
                                        onChange={(e) => setData('width', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.height}
                                        onChange={(e) => setData('height', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Attributes */}
                    {attributes && attributes.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Product Attributes</h3>
                                <p className="text-sm text-gray-600 mt-1">Additional product specifications</p>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {attributes.map(attribute => (
                                        <div key={attribute.id}>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {attribute.name}
                                                {attribute.is_required && <span className="text-red-500 ml-1">*</span>}
                                            </label>

                                            {/* Text Input */}
                                            {attribute.type === 'text' && (
                                                <input
                                                    type="text"
                                                    value={data.attributes[attribute.id] || ''}
                                                    onChange={(e) => handleAttributeChange(attribute.id, e.target.value)}
                                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${attribute.is_required && !data.attributes[attribute.id]
                                                            ? 'border-red-300'
                                                            : 'border-gray-300'
                                                        }`}
                                                    placeholder={`Enter ${attribute.name.toLowerCase()}`}
                                                    required={attribute.is_required}
                                                />
                                            )}

                                            {/* Number Input */}
                                            {attribute.type === 'number' && (
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={data.attributes[attribute.id] || ''}
                                                    onChange={(e) => handleAttributeChange(attribute.id, e.target.value)}
                                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${attribute.is_required && !data.attributes[attribute.id]
                                                            ? 'border-red-300'
                                                            : 'border-gray-300'
                                                        }`}
                                                    placeholder={`Enter ${attribute.name.toLowerCase()}`}
                                                    required={attribute.is_required}
                                                />
                                            )}

                                            {/* Select Dropdown */}
                                            {attribute.type === 'select' && (
                                                <select
                                                    value={data.attributes[attribute.id] || ''}
                                                    onChange={(e) => handleAttributeChange(attribute.id, e.target.value)}
                                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${attribute.is_required && !data.attributes[attribute.id]
                                                            ? 'border-red-300'
                                                            : 'border-gray-300'
                                                        }`}
                                                    required={attribute.is_required}
                                                >
                                                    <option value="">Select {attribute.name}</option>
                                                    {attribute.options?.map(option => (
                                                        <option key={option} value={option}>{option}</option>
                                                    ))}
                                                </select>
                                            )}

                                            {/* Multi-Select with Checkboxes */}
                                            {attribute.type === 'multiselect' && (
                                                <div className={`border rounded-lg p-3 max-h-40 overflow-y-auto ${attribute.is_required && !data.attributes[attribute.id]
                                                        ? 'border-red-300'
                                                        : 'border-gray-300'
                                                    }`}>
                                                    {attribute.options?.map(option => {
                                                        const selectedOptions = data.attributes[attribute.id]
                                                            ? data.attributes[attribute.id].split(',')
                                                            : [];
                                                        const isSelected = selectedOptions.includes(option);

                                                        return (
                                                            <label key={option} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    onChange={(e) => {
                                                                        let newOptions = [...selectedOptions];
                                                                        if (e.target.checked) {
                                                                            newOptions.push(option);
                                                                        } else {
                                                                            newOptions = newOptions.filter(o => o !== option);
                                                                        }
                                                                        handleAttributeChange(attribute.id, newOptions.join(','));
                                                                    }}
                                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                                                                />
                                                                <span className="text-sm text-gray-700">{option}</span>
                                                            </label>
                                                        );
                                                    })}
                                                    {(!attribute.options || attribute.options.length === 0) && (
                                                        <p className="text-sm text-gray-500 p-2">No options available</p>
                                                    )}
                                                </div>
                                            )}

                                            {/* Boolean Checkbox */}
                                            {attribute.type === 'boolean' && (
                                                <div className="flex items-center gap-3 mt-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={data.attributes[attribute.id] === 'true'}
                                                        onChange={(e) => handleAttributeChange(attribute.id, e.target.checked ? 'true' : 'false')}
                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm text-gray-600">
                                                        Yes, this product has {attribute.name.toLowerCase()}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Validation Error Display */}
                                            {attribute.is_required && !data.attributes[attribute.id] && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {attribute.name} is required
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Compatible Models */}
                    {compatible_models && compatible_models.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Compatible Boiler Models</h3>
                                <p className="text-sm text-gray-600 mt-1">Select which boiler models this part is compatible with</p>
                            </div>
                            <div className="p-6">
                                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                                    {compatible_models.map(model => (
                                        <div key={model.id} className="flex items-center p-3 border-b border-gray-100 last:border-b-0">
                                            <input
                                                type="checkbox"
                                                id={`model-${model.id}`}
                                                checked={data.compatible_models.includes(model.id)}
                                                onChange={() => handleCompatibleModelToggle(model.id)}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <label htmlFor={`model-${model.id}`} className="ml-3 flex-1 cursor-pointer">
                                                <div className="font-medium text-gray-900">{model.brand_name} - {model.model_name}</div>
                                                {model.model_code && (
                                                    <div className="text-sm text-gray-500">Code: {model.model_code}</div>
                                                )}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                {data.compatible_models.length > 0 && (
                                    <div className="mt-3 text-sm text-blue-600">
                                        {data.compatible_models.length} model(s) selected
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Product Services */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Product Services</h3>
                                <p className="text-sm text-gray-600 mt-1">Configure additional services for this product</p>
                            </div>
                        </div>
                        <div className="p-6">
                            {/* Available Services Selection */}
                            <div className="mb-6">
                                <h4 className="text-md font-medium text-gray-900 mb-4">Available Services</h4>
                                <div className="space-y-3">
                                    {services.map(service => {
                                        const isAssigned = data.services.some(s => s.service_id === service.id);
                                        return (
                                            <div key={service.id} className={`border rounded-lg p-4 transition-all ${isAssigned ? 'border-blue-200 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                                                }`}>
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start gap-3 flex-1">
                                                        <input
                                                            type="checkbox"
                                                            checked={isAssigned}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    // Add service
                                                                    setData('services', [
                                                                        ...data.services,
                                                                        {
                                                                            service_id: service.id,
                                                                            custom_price: '',
                                                                            is_mandatory: !service.is_optional,
                                                                            is_free: service.is_free
                                                                        }
                                                                    ]);
                                                                } else {
                                                                    // Remove service
                                                                    setData('services', data.services.filter(s => s.service_id !== service.id));
                                                                }
                                                            }}
                                                            className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <h5 className="font-medium text-gray-900">{service.name}</h5>
                                                                <span className="text-sm px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                                                                    {service.type}
                                                                </span>
                                                                {service.is_free && (
                                                                    <span className="text-sm px-2 py-1 rounded-full bg-green-100 text-green-700">
                                                                        Free
                                                                    </span>
                                                                )}
                                                                {!service.is_optional && (
                                                                    <span className="text-sm px-2 py-1 rounded-full bg-orange-100 text-orange-700">
                                                                        Required
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-gray-600 mt-1">
                                                                Default Price: £{service.price}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Service Configuration - Show only when assigned */}
                                                {isAssigned && (
                                                    <div className="mt-4 pt-4 border-t border-blue-200">
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                    Custom Price (£)
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={data.services.find(s => s.service_id === service.id)?.custom_price || ''}
                                                                    onChange={(e) => {
                                                                        const updatedServices = data.services.map(s =>
                                                                            s.service_id === service.id
                                                                                ? { ...s, custom_price: e.target.value }
                                                                                : s
                                                                        );
                                                                        setData('services', updatedServices);
                                                                    }}
                                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                    placeholder={`Default: £${service.price}`}
                                                                />
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    Leave empty to use default price
                                                                </p>
                                                            </div>

                                                            <div className="space-y-3">
                                                                <label className="flex items-center gap-2">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={data.services.find(s => s.service_id === service.id)?.is_mandatory || false}
                                                                        onChange={(e) => {
                                                                            const updatedServices = data.services.map(s =>
                                                                                s.service_id === service.id
                                                                                    ? { ...s, is_mandatory: e.target.checked }
                                                                                    : s
                                                                            );
                                                                            setData('services', updatedServices);
                                                                        }}
                                                                        disabled={!service.is_optional}
                                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                                                                    />
                                                                    <span className="text-sm font-medium text-gray-700">
                                                                        Mandatory for this product
                                                                    </span>
                                                                </label>

                                                                <label className="flex items-center gap-2">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={data.services.find(s => s.service_id === service.id)?.is_free || false}
                                                                        onChange={(e) => {
                                                                            const updatedServices = data.services.map(s =>
                                                                                s.service_id === service.id
                                                                                    ? { ...s, is_free: e.target.checked }
                                                                                    : s
                                                                            );
                                                                            setData('services', updatedServices);
                                                                        }}
                                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                                    />
                                                                    <span className="text-sm font-medium text-gray-700">
                                                                        Free service for this product
                                                                    </span>
                                                                </label>
                                                            </div>

                                                            <div className="flex items-center">
                                                                <div className="text-sm">
                                                                    <p className="font-medium text-gray-900">Final Price:</p>
                                                                    <p className="text-lg font-bold text-blue-600">
                                                                        {(() => {
                                                                            const serviceConfig = data.services.find(s => s.service_id === service.id);
                                                                            if (serviceConfig?.is_free || service.is_free) return 'Free';
                                                                            const customPrice = serviceConfig?.custom_price;
                                                                            const finalPrice = customPrice ? parseFloat(customPrice) : service.price;
                                                                            return `£${finalPrice.toFixed(2)}`;
                                                                        })()}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Summary */}
                            {data.services.length > 0 && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="text-md font-medium text-gray-900 mb-2">Service Summary</h4>
                                    <div className="text-sm text-gray-600">
                                        <p className="mb-2">
                                            <span className="font-medium">{data.services.length}</span> service(s) configured
                                        </p>
                                        <div className="flex gap-4">
                                            <span>
                                                Mandatory: <span className="font-medium text-orange-600">
                                                    {data.services.filter(s => s.is_mandatory).length}
                                                </span>
                                            </span>
                                            <span>
                                                Optional: <span className="font-medium text-blue-600">
                                                    {data.services.filter(s => !s.is_mandatory).length}
                                                </span>
                                            </span>
                                            <span>
                                                Free: <span className="font-medium text-green-600">
                                                    {data.services.filter(s => s.is_free).length}
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {data.services.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <p>No services selected. Check services above to add them to this product.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SEO Settings */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">SEO Settings</h3>
                            <p className="text-sm text-gray-600 mt-1">Optimize your product for search engines</p>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
                                <input
                                    type="text"
                                    value={data.meta_title}
                                    onChange={(e) => setData('meta_title', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="SEO optimized title"
                                    maxLength={60}
                                />
                                <p className="text-xs text-gray-500 mt-1">{data.meta_title.length}/60 characters</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                                <textarea
                                    value={data.meta_description}
                                    onChange={(e) => setData('meta_description', e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="SEO optimized description"
                                    maxLength={160}
                                />
                                <p className="text-xs text-gray-500 mt-1">{data.meta_description.length}/160 characters</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Product Slug</label>
                                <input
                                    type="text"
                                    value={data.slug}
                                    onChange={(e) => setData('slug', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Leave empty to auto-generate from product name"
                                />
                                <p className="text-xs text-gray-500 mt-1">URL-friendly version of the product name</p>
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-end gap-4 bg-gray-50 px-6 py-4 rounded-xl">
                        <button
                            type="button"
                            onClick={() => router.visit('/admin/products')}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center gap-2"
                        >
                            <Save className="w-5 h-5" />
                            {processing ? 'Updating...' : 'Update Product'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
