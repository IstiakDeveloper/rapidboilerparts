// resources/js/Pages/Admin/Categories/Index.tsx

import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

interface Category {
    id: number;
    name: string;
    slug: string;
    is_active: boolean;
    parent?: { name: string };
    products_count: number;
    created_at: string;
}

interface Props {
    categories: {
        data: Category[];
        links?: any[];
        meta?: { from?: number; to?: number; total?: number };
    };
    filters: { search?: string; status?: string };
}

export default function Index({ categories, filters }: Props) {
    const [selected, setSelected] = useState<number[]>([]);
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');

    const handleFilter = () => router.get('/admin/categories', { search, status });
    const handleReset = () => {
        setSearch(''); setStatus(''); router.get('/admin/categories');
    };
    const handleBulk = (action: string) => {
        if (!selected.length) return;
        if (confirm(`${action} selected categories?`)) {
            router.post('/admin/categories/bulk-update', { ids: selected, action });
        }
    };
    const handleDelete = (id: number, name: string) => {
        if (confirm(`Delete "${name}"?`)) router.delete(`/admin/categories/${id}`);
    };

    return (
        <AdminLayout>
            <Head title="Categories" />

            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
                        <p className="text-gray-600">Organize your products with categories</p>
                    </div>
                    <Link
                        href="/admin/categories/create"
                        className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Category
                    </Link>
                </div>

                {/* Filters Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            <div className="md:col-span-4">
                                <input
                                    type="text"
                                    placeholder="Search categories..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
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
                                    className="flex-1 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                                >
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
                            <span className="text-blue-900 font-medium">{selected.length} categories selected</span>
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
                    {categories.data && categories.data.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="w-12 px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    onChange={(e) => setSelected(e.target.checked ? categories.data.map(c => c.id) : [])}
                                                    checked={categories.data.length > 0 && selected.length === categories.data.length}
                                                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                />
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Category</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Parent</th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Products</th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Status</th>
                                            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {categories.data.map((category) => (
                                            <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={selected.includes(category.id)}
                                                        onChange={(e) => setSelected(prev =>
                                                            e.target.checked ? [...prev, category.id] : prev.filter(id => id !== category.id)
                                                        )}
                                                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <div className="font-semibold text-gray-900">{category.name}</div>
                                                        <div className="text-sm text-gray-500 font-mono">/{category.slug}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-gray-600">{category.parent?.name || '—'}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-700 text-sm font-semibold rounded-full">
                                                        {category.products_count || 0}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                                        category.is_active
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {category.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <Link
                                                            href={`/admin/categories/${category.id}`}
                                                            className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                                                        >
                                                            View
                                                        </Link>
                                                        <Link
                                                            href={`/admin/categories/${category.id}/edit`}
                                                            className="text-indigo-600 hover:text-indigo-700 font-medium text-sm transition-colors"
                                                        >
                                                            Edit
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(category.id, category.name)}
                                                            className="text-red-600 hover:text-red-700 font-medium text-sm transition-colors"
                                                        >
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
                            {categories.meta && (categories.meta.from || categories.meta.to || categories.meta.total) && (
                                <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div className="text-sm text-gray-700">
                                            Showing <span className="font-semibold">{categories.meta.from || 0}</span> to{' '}
                                            <span className="font-semibold">{categories.meta.to || 0}</span> of{' '}
                                            <span className="font-semibold">{categories.meta.total || 0}</span> results
                                        </div>
                                        {categories.links && (
                                            <div className="flex items-center gap-1">
                                                {categories.links.map((link: any, index: number) => (
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
                                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No categories yet</h3>
                            <p className="text-gray-600 mb-8">Get started by creating your first product category.</p>
                            <Link
                                href="/admin/categories/create"
                                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Create Category
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
