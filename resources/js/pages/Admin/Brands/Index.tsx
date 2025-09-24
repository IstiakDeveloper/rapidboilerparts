// resources/js/Pages/Admin/Brands/Index.tsx

import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit, Trash2, Building2, Globe, Package } from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';

interface Brand {
    id: number;
    name: string;
    slug: string;
    is_active: boolean;
    website?: string;
    products_count: number;
    created_at: string;
}

interface Props {
    brands: {
        data: Brand[];
        links?: any[];
        meta?: { from?: number; to?: number; total?: number };
    };
    filters: { search?: string; status?: string };
}

export default function Index({ brands, filters }: Props) {
    const [selected, setSelected] = useState<number[]>([]);
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');

    const handleFilter = () => router.get('/admin/brands', { search, status });
    const handleReset = () => {
        setSearch(''); setStatus(''); router.get('/admin/brands');
    };
    const handleBulk = (action: string) => {
        if (!selected.length) return;
        if (confirm(`${action} selected brands?`)) {
            router.post('/admin/brands/bulk-update', { ids: selected, action });
        }
    };
    const handleDelete = (id: number, name: string) => {
        if (confirm(`Delete "${name}"?`)) router.delete(`/admin/brands/${id}`);
    };

    return (
        <AdminLayout>
            <Head title="Brands" />

            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Brands</h1>
                        <p className="text-gray-600">Manage product brands and manufacturers</p>
                    </div>
                    <Link
                        href="/admin/brands/create"
                        className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Add Brand
                    </Link>
                </div>

                {/* Filters Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            <div className="md:col-span-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search brands..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-3">
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                >
                                    <option value="">All Status</option>
                                    <option value="1">Active</option>
                                    <option value="0">Inactive</option>
                                </select>
                            </div>
                            <div className="md:col-span-5 flex gap-3">
                                <button
                                    onClick={handleFilter}
                                    className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                                >
                                    <Filter className="w-4 h-4 mr-2" />
                                    Apply Filters
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
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
                            <span className="text-blue-900 font-medium">{selected.length} brands selected</span>
                            <div className="flex flex-wrap gap-2">
                                <button onClick={() => handleBulk('activate')} className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors">
                                    Activate
                                </button>
                                <button onClick={() => handleBulk('deactivate')} className="px-3 py-1.5 bg-amber-600 text-white text-sm font-medium rounded-md hover:bg-amber-700 transition-colors">
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
                    {brands.data && brands.data.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="w-12 px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    onChange={(e) => setSelected(e.target.checked ? brands.data.map(b => b.id) : [])}
                                                    checked={brands.data.length > 0 && selected.length === brands.data.length}
                                                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                />
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Brand</th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Website</th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Products</th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Status</th>
                                            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {brands.data.map((brand) => (
                                            <tr key={brand.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={selected.includes(brand.id)}
                                                        onChange={(e) => setSelected(prev =>
                                                            e.target.checked ? [...prev, brand.id] : prev.filter(id => id !== brand.id)
                                                        )}
                                                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                                            <Building2 className="w-5 h-5 text-white" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="font-semibold text-gray-900">{brand.name}</div>
                                                            <div className="text-sm text-gray-500 font-mono">/{brand.slug}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {brand.website ? (
                                                        <a
                                                            href={brand.website}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                                                        >
                                                            <Globe className="w-4 h-4 mr-1" />
                                                            Visit
                                                        </a>
                                                    ) : (
                                                        <span className="text-gray-400">—</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-700 text-sm font-semibold rounded-full">
                                                        {brand.products_count || 0}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                                        brand.is_active
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {brand.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <Link
                                                            href={`/admin/brands/${brand.id}`}
                                                            className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors flex items-center"
                                                        >
                                                            <Eye className="w-4 h-4 mr-1" />
                                                            View
                                                        </Link>
                                                        <Link
                                                            href={`/admin/brands/${brand.id}/edit`}
                                                            className="text-indigo-600 hover:text-indigo-700 font-medium text-sm transition-colors flex items-center"
                                                        >
                                                            <Edit className="w-4 h-4 mr-1" />
                                                            Edit
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(brand.id, brand.name)}
                                                            className="text-red-600 hover:text-red-700 font-medium text-sm transition-colors flex items-center"
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-1" />
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {brands.meta && (brands.meta.from || brands.meta.to || brands.meta.total) && (
                                <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div className="text-sm text-gray-700">
                                            Showing <span className="font-semibold">{brands.meta.from || 0}</span> to{' '}
                                            <span className="font-semibold">{brands.meta.to || 0}</span> of{' '}
                                            <span className="font-semibold">{brands.meta.total || 0}</span> results
                                        </div>
                                        {brands.links && (
                                            <div className="flex items-center gap-1">
                                                {brands.links.map((link: any, index: number) => (
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
                                <Building2 className="w-12 h-12 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No brands yet</h3>
                            <p className="text-gray-600 mb-8">Get started by adding your first brand or manufacturer.</p>
                            <Link
                                href="/admin/brands/create"
                                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
                            >
                                <Building2 className="w-5 h-5 mr-2" />
                                Create Brand
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
