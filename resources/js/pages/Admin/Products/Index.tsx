import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search, Filter, Eye, Edit, Trash2, Package, Star, AlertTriangle, PoundSterling, Package2 } from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';

interface Product {
    id: number;
    name: string;
    slug: string;
    sku: string;
    price: number;
    sale_price?: number;
    stock_quantity: number;
    status: string;
    is_featured: boolean;
    brand: { id: number; name: string };
    category: { id: number; name: string };
    images_count?: number;
    reviews_count?: number;
    created_at: string;
}

interface Brand {
    id: number;
    name: string;
}

interface Category {
    id: number;
    name: string;
}

interface Props {
    products: {
        data: Product[];
        links?: any[];
        meta?: { from?: number; to?: number; total?: number };
    };
    brands: Brand[];
    categories: Category[];
    filters: {
        search?: string;
        brand_id?: string;
        category_id?: string;
        status?: string;
        stock_status?: string;
    };
}

export default function Index({ products, brands, categories, filters }: Props) {
    const [selected, setSelected] = useState<number[]>([]);
    const [search, setSearch] = useState(filters.search || '');
    const [brandId, setBrandId] = useState(filters.brand_id || '');
    const [categoryId, setCategoryId] = useState(filters.category_id || '');
    const [status, setStatus] = useState(filters.status || '');
    const [stockStatus, setStockStatus] = useState(filters.stock_status || '');

    const handleFilter = () => {
        router.get('/admin/products', {
            search,
            brand_id: brandId,
            category_id: categoryId,
            status,
            stock_status: stockStatus
        });
    };

    const handleReset = () => {
        setSearch(''); setBrandId(''); setCategoryId(''); setStatus(''); setStockStatus('');
        router.get('/admin/products');
    };

    const handleBulk = (action: string) => {
        if (!selected.length) return;
        if (confirm(`${action} selected products?`)) {
            router.post('/admin/products/bulk-update', { ids: selected, action });
        }
    };

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Delete "${name}"?`)) router.delete(`/admin/products/${id}`);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);
    };

    const getStockStatus = (quantity: number) => {
        if (quantity === 0) return { color: 'bg-red-100 text-red-800', text: 'Out of Stock' };
        if (quantity <= 5) return { color: 'bg-orange-100 text-orange-800', text: 'Low Stock' };
        return { color: 'bg-green-100 text-green-800', text: 'In Stock' };
    };

    return (
        <AdminLayout>
            <Head title="Products" />

            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
                        <p className="text-gray-600">Manage your product catalog and inventory</p>
                    </div>
                    <Link
                        href="/admin/products/create"
                        className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Add Product
                    </Link>
                </div>

                {/* Filters Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            <div className="md:col-span-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <select
                                    value={brandId}
                                    onChange={(e) => setBrandId(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                >
                                    <option value="">All Brands</option>
                                    {brands.map(brand => (
                                        <option key={brand.id} value={brand.id}>{brand.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <select
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                >
                                    <option value="">All Categories</option>
                                    {categories.map(category => (
                                        <option key={category.id} value={category.id}>{category.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                >
                                    <option value="">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="draft">Draft</option>
                                </select>
                            </div>
                            <div className="md:col-span-3 flex gap-2">
                                <button
                                    onClick={handleFilter}
                                    className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                                >
                                    <Filter className="w-4 h-4 mr-2" />
                                    Filter
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bulk Actions */}
                {selected.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <span className="text-blue-900 font-medium">{selected.length} products selected</span>
                            <div className="flex flex-wrap gap-2">
                                <button onClick={() => handleBulk('activate')} className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors">
                                    Activate
                                </button>
                                <button onClick={() => handleBulk('feature')} className="px-3 py-1.5 bg-yellow-600 text-white text-sm font-medium rounded-md hover:bg-yellow-700 transition-colors">
                                    Feature
                                </button>
                                <button onClick={() => handleBulk('deactivate')} className="px-3 py-1.5 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors">
                                    Deactivate
                                </button>
                                <button onClick={() => handleBulk('delete')} className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors">
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Table Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {products.data && products.data.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="w-12 px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    onChange={(e) => setSelected(e.target.checked ? products.data.map(p => p.id) : [])}
                                                    checked={products.data.length > 0 && selected.length === products.data.length}
                                                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                />
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Product</th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Price</th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Stock</th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Brand</th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Category</th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Status</th>
                                            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {products.data.map((product) => {
                                            const stockStatus = getStockStatus(product.stock_quantity);

                                            return (
                                                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <input
                                                            type="checkbox"
                                                            checked={selected.includes(product.id)}
                                                            onChange={(e) => setSelected(prev =>
                                                                e.target.checked ? [...prev, product.id] : prev.filter(id => id !== product.id)
                                                            )}
                                                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                                                                <Package2 className="w-6 h-6 text-gray-500" />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-semibold text-gray-900">{product.name}</span>
                                                                    {product.is_featured && (
                                                                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                                                    )}
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    SKU: {product.sku} • /{product.slug}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="space-y-1">
                                                            <div className="font-semibold text-gray-900">
                                                                {formatCurrency(product.sale_price || product.price)}
                                                            </div>
                                                            {product.sale_price && (
                                                                <div className="text-sm text-gray-500 line-through">
                                                                    {formatCurrency(product.price)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex flex-col items-center gap-1">
                                                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${stockStatus.color}`}>
                                                                {product.stock_quantity}
                                                            </span>
                                                            {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                                                                <AlertTriangle className="w-4 h-4 text-orange-500" />
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="text-gray-600 text-sm">{product.brand.name}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="text-gray-600 text-sm">{product.category.name}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                                            product.status === 'active' ? 'bg-green-100 text-green-800' :
                                                            product.status === 'inactive' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                            {product.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Link
                                                                href={`/admin/products/${product.id}`}
                                                                className="text-blue-600 hover:text-blue-700 p-1 rounded transition-colors"
                                                                title="View Product"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </Link>
                                                            <Link
                                                                href={`/admin/products/${product.id}/edit`}
                                                                className="text-indigo-600 hover:text-indigo-700 p-1 rounded transition-colors"
                                                                title="Edit Product"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDelete(product.id, product.name)}
                                                                className="text-red-600 hover:text-red-700 p-1 rounded transition-colors"
                                                                title="Delete Product"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {products.meta && (products.meta.from || products.meta.to || products.meta.total) && (
                                <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div className="text-sm text-gray-700">
                                            Showing <span className="font-semibold">{products.meta.from || 0}</span> to{' '}
                                            <span className="font-semibold">{products.meta.to || 0}</span> of{' '}
                                            <span className="font-semibold">{products.meta.total || 0}</span> results
                                        </div>
                                        {products.links && (
                                            <div className="flex items-center gap-1">
                                                {products.links.map((link: any, index: number) => (
                                                    link.url ? (
                                                        <Link
                                                            key={index}
                                                            href={link.url}
                                                            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                                                link.active
                                                                    ? 'bg-blue-600 text-white'
                                                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                                            }`}
                                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                                        />
                                                    ) : (
                                                        <span
                                                            key={index}
                                                            className="px-3 py-2 text-sm text-gray-400 rounded-md"
                                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                                        />
                                                    )
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-16">
                            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                                <Package className="w-12 h-12 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products yet</h3>
                            <p className="text-gray-600 mb-8">Start building your catalog by adding your first product.</p>
                            <Link
                                href="/admin/products/create"
                                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
                            >
                                <Package className="w-5 h-5 mr-2" />
                                Add Product
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
