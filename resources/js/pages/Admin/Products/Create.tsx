// resources/js/Pages/Admin/Products/Create.tsx

import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, X, Package2, Link as LinkIcon, Tag, PoundSterling, Package, Building2, Hash, ToggleLeft, FileText, Settings, Wrench } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

interface Brand {
    id: number;
    name: string;
}

interface Category {
    id: number;
    name: string;
}

interface ProductAttribute {
    id: number;
    name: string;
    type: string;
}

interface CompatibleModel {
    id: number;
    brand_name: string;
    model_name: string;
}

interface Props {
    brands: Brand[];
    categories: Category[];
    attributes: ProductAttribute[];
    compatible_models: CompatibleModel[];
}

export default function Create({ brands, categories, attributes, compatible_models }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        slug: '',
        short_description: '',
        description: '',
        sku: '',
        manufacturer_part_number: '',
        gc_number: '',
        price: '',
        sale_price: '',
        cost_price: '',
        stock_quantity: 0,
        low_stock_threshold: 5,
        brand_id: '',
        category_id: '',
        weight: '',
        length: '',
        width: '',
        height: '',
        meta_title: '',
        meta_description: '',
        status: 'active',
        is_featured: false,
        manage_stock: true,
        attributes: {} as Record<number, string>,
        compatible_models: [] as number[],
    });

    const [activeTab, setActiveTab] = useState('basic');

    const generateSlug = (name: string) => {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        setData(prev => ({
            ...prev,
            name,
            slug: prev.slug || generateSlug(name),
            meta_title: prev.meta_title || name
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/products');
    };

    const tabs = [
        { id: 'basic', name: 'Basic Info', icon: Package2 },
        { id: 'pricing', name: 'Pricing & Stock', icon: PoundSterling },
        { id: 'attributes', name: 'Attributes', icon: Settings },
        { id: 'compatibility', name: 'Compatibility', icon: Wrench },
        { id: 'seo', name: 'SEO & Advanced', icon: Tag },
    ];

    return (
        <AdminLayout>
            <Head title="Create Product" />

            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Create Product</h1>
                        <p className="text-gray-600">Add a new product to your catalog</p>
                    </div>
                    <Link
                        href="/admin/products"
                        className="inline-flex items-center px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Products
                    </Link>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <form onSubmit={handleSubmit}>
                        {/* Tabs */}
                        <div className="border-b border-gray-200">
                            <nav className="px-8 flex space-x-8 overflow-x-auto">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                                            activeTab === tab.id
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <tab.icon className="w-4 h-4 mr-2" />
                                        {tab.name}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Tab Content */}
                        <div className="p-8">
                            {/* Basic Info Tab */}
                            {activeTab === 'basic' && (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {/* Product Name */}
                                        <div className="space-y-2">
                                            <label className="flex items-center text-sm font-semibold text-gray-900">
                                                <Package2 className="w-4 h-4 mr-2 text-gray-500" />
                                                Product Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={data.name}
                                                onChange={handleNameChange}
                                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                                    errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                }`}
                                                placeholder="Enter product name"
                                                required
                                            />
                                            {errors.name && <p className="flex items-center text-sm text-red-600"><X className="w-4 h-4 mr-1" />{errors.name}</p>}
                                        </div>

                                        {/* URL Slug */}
                                        <div className="space-y-2">
                                            <label className="flex items-center text-sm font-semibold text-gray-900">
                                                <LinkIcon className="w-4 h-4 mr-2 text-gray-500" />
                                                URL Slug
                                            </label>
                                            <input
                                                type="text"
                                                value={data.slug}
                                                onChange={(e) => setData('slug', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono"
                                                placeholder="product-url-slug"
                                            />
                                            <p className="text-xs text-gray-500">Leave blank to auto-generate</p>
                                        </div>

                                        {/* Brand */}
                                        <div className="space-y-2">
                                            <label className="flex items-center text-sm font-semibold text-gray-900">
                                                <Building2 className="w-4 h-4 mr-2 text-gray-500" />
                                                Brand *
                                            </label>
                                            <select
                                                value={data.brand_id}
                                                onChange={(e) => setData('brand_id', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                required
                                            >
                                                <option value="">Select Brand</option>
                                                {brands.map(brand => (
                                                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                                                ))}
                                            </select>
                                            {errors.brand_id && <p className="flex items-center text-sm text-red-600"><X className="w-4 h-4 mr-1" />{errors.brand_id}</p>}
                                        </div>

                                        {/* Category */}
                                        <div className="space-y-2">
                                            <label className="flex items-center text-sm font-semibold text-gray-900">
                                                <Tag className="w-4 h-4 mr-2 text-gray-500" />
                                                Category *
                                            </label>
                                            <select
                                                value={data.category_id}
                                                onChange={(e) => setData('category_id', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                required
                                            >
                                                <option value="">Select Category</option>
                                                {categories.map(category => (
                                                    <option key={category.id} value={category.id}>{category.name}</option>
                                                ))}
                                            </select>
                                            {errors.category_id && <p className="flex items-center text-sm text-red-600"><X className="w-4 h-4 mr-1" />{errors.category_id}</p>}
                                        </div>

                                        {/* SKU */}
                                        <div className="space-y-2">
                                            <label className="flex items-center text-sm font-semibold text-gray-900">
                                                <Hash className="w-4 h-4 mr-2 text-gray-500" />
                                                SKU *
                                            </label>
                                            <input
                                                type="text"
                                                value={data.sku}
                                                onChange={(e) => setData('sku', e.target.value)}
                                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono ${
                                                    errors.sku ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                }`}
                                                placeholder="PROD-001"
                                                required
                                            />
                                            {errors.sku && <p className="flex items-center text-sm text-red-600"><X className="w-4 h-4 mr-1" />{errors.sku}</p>}
                                        </div>

                                        {/* Manufacturer Part Number */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Manufacturer Part Number</label>
                                            <input
                                                type="text"
                                                value={data.manufacturer_part_number}
                                                onChange={(e) => setData('manufacturer_part_number', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                placeholder="MPN-12345"
                                            />
                                        </div>

                                        {/* GC Number */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">GC Number</label>
                                            <input
                                                type="text"
                                                value={data.gc_number}
                                                onChange={(e) => setData('gc_number', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                placeholder="GC-12345"
                                            />
                                        </div>
                                    </div>

                                    {/* Short Description */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Short Description</label>
                                        <textarea
                                            rows={3}
                                            value={data.short_description}
                                            onChange={(e) => setData('short_description', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                                            placeholder="Brief product summary for listings..."
                                        />
                                    </div>

                                    {/* Full Description */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Full Description</label>
                                        <textarea
                                            rows={6}
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                                            placeholder="Detailed product description, features, specifications..."
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Pricing & Stock Tab */}
                            {activeTab === 'pricing' && (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        {/* Regular Price */}
                                        <div className="space-y-2">
                                            <label className="flex items-center text-sm font-semibold text-gray-900">
                                                <PoundSterling className="w-4 h-4 mr-2 text-gray-500" />
                                                Regular Price *
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.price}
                                                onChange={(e) => setData('price', e.target.value)}
                                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                                    errors.price ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                }`}
                                                placeholder="0.00"
                                                required
                                            />
                                            {errors.price && <p className="flex items-center text-sm text-red-600"><X className="w-4 h-4 mr-1" />{errors.price}</p>}
                                        </div>

                                        {/* Sale Price */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Sale Price</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.sale_price}
                                                onChange={(e) => setData('sale_price', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                placeholder="0.00"
                                            />
                                            <p className="text-xs text-gray-500">Leave blank if no discount</p>
                                        </div>

                                        {/* Cost Price */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Cost Price</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.cost_price}
                                                onChange={(e) => setData('cost_price', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                placeholder="0.00"
                                            />
                                            <p className="text-xs text-gray-500">For internal tracking</p>
                                        </div>

                                        {/* Stock Quantity */}
                                        <div className="space-y-2">
                                            <label className="flex items-center text-sm font-semibold text-gray-900">
                                                <Package className="w-4 h-4 mr-2 text-gray-500" />
                                                Stock Quantity
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={data.stock_quantity}
                                                onChange={(e) => setData('stock_quantity', parseInt(e.target.value) || 0)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            />
                                        </div>

                                        {/* Low Stock Threshold */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Low Stock Alert</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={data.low_stock_threshold}
                                                onChange={(e) => setData('low_stock_threshold', parseInt(e.target.value) || 5)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            />
                                            <p className="text-xs text-gray-500">Alert when stock drops below this number</p>
                                        </div>

                                        {/* Manage Stock Toggle */}
                                        <div className="space-y-3">
                                            <label className="text-sm font-medium text-gray-700">Stock Management</label>
                                            <div className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={data.manage_stock}
                                                    onChange={(e) => setData('manage_stock', e.target.checked)}
                                                    className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                />
                                                <span className="text-sm text-gray-700">Track inventory for this product</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Physical Dimensions */}
                                    <div className="space-y-4">
                                        <h4 className="text-lg font-semibold text-gray-900">Physical Dimensions</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Weight (kg)</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={data.weight}
                                                    onChange={(e) => setData('weight', e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Length (cm)</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={data.length}
                                                    onChange={(e) => setData('length', e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Width (cm)</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={data.width}
                                                    onChange={(e) => setData('width', e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Height (cm)</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={data.height}
                                                    onChange={(e) => setData('height', e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Attributes Tab */}
                            {activeTab === 'attributes' && (
                                <div className="space-y-6">
                                    <div className="text-center py-8 text-gray-500">
                                        <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                        <p>Product attributes functionality will be implemented here.</p>
                                        <p className="text-sm">Configure custom attributes for this product.</p>
                                    </div>
                                </div>
                            )}

                            {/* Compatibility Tab */}
                            {activeTab === 'compatibility' && (
                                <div className="space-y-6">
                                    <div className="text-center py-8 text-gray-500">
                                        <Wrench className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                        <p>Compatible models functionality will be implemented here.</p>
                                        <p className="text-sm">Select which boiler models are compatible with this part.</p>
                                    </div>
                                </div>
                            )}

                            {/* SEO & Advanced Tab */}
                            {activeTab === 'seo' && (
                                <div className="space-y-8">
                                    <div className="space-y-6">
                                        <h4 className="text-lg font-semibold text-gray-900">SEO Settings</h4>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Meta Title</label>
                                            <input
                                                type="text"
                                                value={data.meta_title}
                                                onChange={(e) => setData('meta_title', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                placeholder="Leave blank to use product name"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Meta Description</label>
                                            <textarea
                                                rows={3}
                                                value={data.meta_description}
                                                onChange={(e) => setData('meta_description', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                                                placeholder="Brief description for search engines..."
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h4 className="text-lg font-semibold text-gray-900">Product Status</h4>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Status</label>
                                                <select
                                                    value={data.status}
                                                    onChange={(e) => setData('status', e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                >
                                                    <option value="active">Active</option>
                                                    <option value="inactive">Inactive</option>
                                                    <option value="draft">Draft</option>
                                                </select>
                                            </div>

                                            <div className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={data.is_featured}
                                                    onChange={(e) => setData('is_featured', e.target.checked)}
                                                    className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                />
                                                <span className="text-sm text-gray-700">Featured product</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Form Actions */}
                        <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
                            <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
                                <Link
                                    href="/admin/products"
                                    className="inline-flex items-center justify-center px-6 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className={`inline-flex items-center justify-center px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
                                        processing ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {processing ? (
                                        <>
                                            <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            Create Product
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
