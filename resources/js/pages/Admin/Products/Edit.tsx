import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { ArrowLeft, Save, Upload, X, Image as ImageIcon, Trash2 } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

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
}

interface ProductImage {
    id: number;
    image_path: string;
    alt_text: string;
    sort_order: number;
    is_primary: boolean;
}

interface Brand {
    id: number;
    name: string;
}

interface Category {
    id: number;
    name: string;
}

interface PageProps {
    product: Product;
    brands: Brand[];
    categories: Category[];
}

export default function Edit({ product, brands, categories }: PageProps) {
    const [newImages, setNewImages] = useState<File[]>([]);
    const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState(product.images || []);
    const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);

    const { data, setData, post, processing, errors } = useForm({
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        brand_id: product.brand_id.toString(),
        category_id: product.category_id.toString(),
        short_description: product.short_description || '',
        description: product.description || '',
        price: product.price.toString(),
        sale_price: product.sale_price?.toString() || '',
        cost_price: product.cost_price?.toString() || '',
        stock_quantity: product.stock_quantity.toString(),
        low_stock_threshold: product.low_stock_threshold.toString(),
        manufacturer_part_number: product.manufacturer_part_number || '',
        gc_number: product.gc_number || '',
        weight: product.weight?.toString() || '',
        length: product.length?.toString() || '',
        width: product.width?.toString() || '',
        height: product.height?.toString() || '',
        meta_title: product.meta_title || '',
        meta_description: product.meta_description || '',
        status: product.status,
        is_featured: product.is_featured,
        manage_stock: product.manage_stock,
        new_images: [] as File[],
        new_image_alts: [] as string[],
        existing_images: product.images?.map(img => ({
            id: img.id,
            alt_text: img.alt_text || '',
            sort_order: img.sort_order,
            is_primary: img.is_primary
        })) || [],
        delete_images: [] as number[],
        _method: 'PUT'
    });

    const handleNewImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length + newImages.length + existingImages.length > 10) {
            alert('Maximum 10 images allowed in total');
            return;
        }

        const updatedNewImages = [...newImages, ...files];
        setNewImages(updatedNewImages);
        setData('new_images', updatedNewImages);

        // Create previews for new images
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                setNewImagePreviews(prev => [...prev, e.target?.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeNewImage = (index: number) => {
        const updatedImages = newImages.filter((_, i) => i !== index);
        const updatedPreviews = newImagePreviews.filter((_, i) => i !== index);

        setNewImages(updatedImages);
        setNewImagePreviews(updatedPreviews);
        setData('new_images', updatedImages);
    };

    const deleteExistingImage = (imageId: number) => {
        if (!confirm('Are you sure you want to delete this image?')) return;

        const updatedImages = existingImages.filter(img => img.id !== imageId);
        const updatedDeletedIds = [...deletedImageIds, imageId];

        setExistingImages(updatedImages);
        setDeletedImageIds(updatedDeletedIds);
        setData('delete_images', updatedDeletedIds);
        setData('existing_images', updatedImages.map(img => ({
            id: img.id,
            alt_text: img.alt_text || '',
            sort_order: img.sort_order,
            is_primary: img.is_primary
        })));
    };

    const setPrimaryImage = (imageId: number) => {
        const updatedImages = existingImages.map(img => ({
            ...img,
            is_primary: img.id === imageId
        }));

        setExistingImages(updatedImages);
        setData('existing_images', updatedImages.map(img => ({
            id: img.id,
            alt_text: img.alt_text || '',
            sort_order: img.sort_order,
            is_primary: img.is_primary
        })));
    };

    const updateImageAlt = (imageId: number, altText: string) => {
        const updatedImages = existingImages.map(img =>
            img.id === imageId ? { ...img, alt_text: altText } : img
        );

        setExistingImages(updatedImages);
        setData('existing_images', updatedImages.map(img => ({
            id: img.id,
            alt_text: img.alt_text || '',
            sort_order: img.sort_order,
            is_primary: img.is_primary
        })));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/products/${product.id}`);
    };

    return (
        <AdminLayout>
            <Head title={`Edit ${product.name}`} />

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
                            <p className="text-sm text-gray-600 mt-1">Manage existing images and upload new ones (Max 10 total).</p>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Existing Images */}
                            {existingImages.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-3">Current Images</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                        {existingImages.map((image) => (
                                            <div key={image.id} className="relative group">
                                                <div className={`relative border-2 rounded-lg overflow-hidden ${image.is_primary ? 'border-blue-500' : 'border-gray-200'
                                                    }`}>
                                                    <img
                                                        src={`/storage/${image.image_path}`}
                                                        alt={image.alt_text || 'Product image'}
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
                                                                onClick={() => setPrimaryImage(image.id)}
                                                                className="bg-white/90 hover:bg-white text-gray-700 p-1 rounded text-xs transition-colors"
                                                                title="Set as primary"
                                                            >
                                                                <ImageIcon className="w-3 h-3" />
                                                            </button>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => deleteExistingImage(image.id)}
                                                            className="bg-red-500 hover:bg-red-600 text-white p-1 rounded transition-colors"
                                                            title="Delete image"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="Alt text"
                                                    value={image.alt_text || ''}
                                                    onChange={(e) => updateImageAlt(image.id, e.target.value)}
                                                    className="w-full mt-2 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Upload New Images */}
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-3">Add New Images</h4>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleNewImageUpload}
                                        className="hidden"
                                        id="new-image-upload"
                                    />
                                    <label
                                        htmlFor="new-image-upload"
                                        className="cursor-pointer flex flex-col items-center justify-center gap-4"
                                    >
                                        <Upload className="w-12 h-12 text-gray-400" />
                                        <div className="text-center">
                                            <p className="text-lg font-medium text-gray-900">Drop new images here or click to upload</p>
                                            <p className="text-sm text-gray-600">PNG, JPG, GIF up to 2MB each</p>
                                        </div>
                                    </label>
                                </div>

                                {newImagePreviews.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-4">
                                        {newImagePreviews.map((preview, index) => (
                                            <div key={index} className="relative group">
                                                <div className="relative border-2 border-gray-200 rounded-lg overflow-hidden">
                                                    <img
                                                        src={preview}
                                                        alt={`New preview ${index + 1}`}
                                                        className="w-full h-24 object-cover"
                                                    />
                                                    <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                                                        New
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeNewImage(index)}
                                                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded transition-colors"
                                                        title="Remove image"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
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
                                )}
                            </div>
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
