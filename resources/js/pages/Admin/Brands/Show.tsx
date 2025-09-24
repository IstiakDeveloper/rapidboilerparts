import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Edit, Trash2, Eye, Package, Calendar, Building2, Hash, Globe, ExternalLink, PoundSterling } from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';

interface Product {
    id: number;
    name: string;
    slug: string;
    price: number;
    is_featured?: boolean;
    status: string;
    stock_quantity: number;
}

interface Brand {
    id: number;
    name: string;
    slug: string;
    description?: string;
    website?: string;
    is_active: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
    products?: Product[];
}

interface Props {
    brand: Brand;
}

export default function Show({ brand }: Props) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const handleDelete = () => {
        if (confirm(`Delete "${brand.name}"? This action cannot be undone.`)) {
            router.delete(`/admin/brands/${brand.id}`);
        }
    };

    return (
        <AdminLayout>
            <Head title={`Brand: ${brand.name}`} />

            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="space-y-3">
                        <div className="flex items-center gap-4">
                            <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                                <Building2 className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-3xl font-bold text-gray-900">{brand.name}</h1>
                                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                                        brand.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {brand.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <p className="text-gray-600 mt-1">Brand details and associated products</p>
                                <div className="flex items-center gap-4 mt-2">
                                    <div className="text-sm text-gray-500 font-mono">/{brand.slug}</div>
                                    {brand.website && (
                                        <a
                                            href={brand.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                                        >
                                            <Globe className="w-4 h-4 mr-1" />
                                            Visit Website
                                            <ExternalLink className="w-3 h-3 ml-1" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            href={`/admin/brands/${brand.id}/edit`}
                            className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Brand
                        </Link>
                        <button
                            onClick={handleDelete}
                            className="inline-flex items-center px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </button>
                        <Link
                            href="/admin/brands"
                            className="inline-flex items-center px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Brands
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    {/* Brand Information Sidebar */}
                    <div className="xl:col-span-4 space-y-6">
                        {/* Basic Information */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <Building2 className="w-5 h-5 mr-2 text-gray-500" />
                                    Brand Information
                                </h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Brand Name</label>
                                    <p className="text-gray-900 font-semibold">{brand.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">URL Slug</label>
                                    <p className="text-gray-900 font-mono text-sm">/{brand.slug}</p>
                                </div>
                                {brand.description && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Description</label>
                                        <p className="text-gray-900">{brand.description}</p>
                                    </div>
                                )}
                                {brand.website && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Website</label>
                                        <a
                                            href={brand.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-700 font-medium flex items-center mt-1"
                                        >
                                            <Globe className="w-4 h-4 mr-1" />
                                            {brand.website}
                                            <ExternalLink className="w-3 h-3 ml-1" />
                                        </a>
                                    </div>
                                )}
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Sort Order</label>
                                    <p className="text-gray-900 flex items-center">
                                        <Hash className="w-4 h-4 mr-1 text-gray-400" />
                                        {brand.sort_order}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Meta Information */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <Calendar className="w-5 h-5 mr-2 text-gray-500" />
                                    Timeline
                                </h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Created</label>
                                    <p className="text-gray-900">{formatDate(brand.created_at)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Last Updated</label>
                                    <p className="text-gray-900">{formatDate(brand.updated_at)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Products Section */}
                    <div className="xl:col-span-8">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                        <Package className="w-5 h-5 mr-2 text-gray-500" />
                                        Products ({brand.products?.length || 0})
                                    </h3>
                                    <Link
                                        href={`/admin/products?brand_id=${brand.id}`}
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <Eye className="w-4 h-4 mr-2" />
                                        View All Products
                                    </Link>
                                </div>
                            </div>

                            {brand.products && brand.products.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-100">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Product</th>
                                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Price</th>
                                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Stock</th>
                                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Status</th>
                                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {brand.products.slice(0, 10).map((product) => (
                                                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-semibold text-gray-900">{product.name}</span>
                                                                {product.is_featured && (
                                                                    <span className="inline-flex px-2 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">
                                                                        Featured
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-sm text-gray-500 font-mono">/{product.slug}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="font-semibold text-gray-900 flex items-center justify-center">
                                                            <PoundSterling className="w-4 h-4 mr-1" />
                                                            {formatCurrency(product.price)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                                                            product.stock_quantity <= 5
                                                                ? 'bg-red-100 text-red-800'
                                                                : 'bg-green-100 text-green-800'
                                                        }`}>
                                                            {product.stock_quantity}
                                                        </span>
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
                                                        <div className="flex items-center justify-end gap-3">
                                                            <Link
                                                                href={`/admin/products/${product.id}`}
                                                                className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors flex items-center"
                                                            >
                                                                <Eye className="w-4 h-4 mr-1" />
                                                                View
                                                            </Link>
                                                            <Link
                                                                href={`/admin/products/${product.id}/edit`}
                                                                className="text-indigo-600 hover:text-indigo-700 font-medium text-sm transition-colors flex items-center"
                                                            >
                                                                <Edit className="w-4 h-4 mr-1" />
                                                                Edit
                                                            </Link>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {brand.products.length > 10 && (
                                        <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 text-center">
                                            <Link
                                                href={`/admin/products?brand_id=${brand.id}`}
                                                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                                            >
                                                <ExternalLink className="w-4 h-4 mr-2" />
                                                View all {brand.products.length} products from this brand
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                                        <Package className="w-12 h-12 text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No products yet</h3>
                                    <p className="text-gray-600 mb-8">This brand doesn't have any products assigned to it.</p>
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
                </div>
            </div>
        </AdminLayout>
    );
}
