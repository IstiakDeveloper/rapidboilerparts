import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, X, Building2, Link as LinkIcon, Globe, Hash, ToggleLeft, FileText, Eye } from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';

interface Brand {
    id: number;
    name: string;
    slug: string;
    description?: string;
    website?: string;
    sort_order: number;
    is_active: boolean;
}

interface Props {
    brand: Brand;
}

export default function Edit({ brand }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: brand.name,
        slug: brand.slug,
        description: brand.description || '',
        website: brand.website || '',
        sort_order: brand.sort_order,
        is_active: brand.is_active,
    });

    const generateSlug = (name: string) => {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        setData(prev => ({
            ...prev,
            name,
            slug: prev.slug === generateSlug(brand.name) ? generateSlug(name) : prev.slug
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/brands/${brand.id}`);
    };

    return (
        <AdminLayout>
            <Head title={`Edit Brand: ${brand.name}`} />

            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Edit Brand</h1>
                        <p className="text-gray-600">Update "{brand.name}" brand details</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href={`/admin/brands/${brand.id}`}
                            className="inline-flex items-center px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            <Eye className="w-4 h-4 mr-2" />
                            View Brand
                        </Link>
                        <Link
                            href="/admin/brands"
                            className="inline-flex items-center px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Brands
                        </Link>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
                        {/* Form Content */}
                        <div className="p-8 space-y-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Brand Name */}
                                <div className="space-y-2">
                                    <label className="flex items-center text-sm font-semibold text-gray-900">
                                        <Building2 className="w-4 h-4 mr-2 text-gray-500" />
                                        Brand Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={handleNameChange}
                                        className={`w-full px-4 py-3 border rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                            errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                        placeholder="Enter brand name"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="flex items-center text-sm text-red-600">
                                            <X className="w-4 h-4 mr-1" />
                                            {errors.name}
                                        </p>
                                    )}
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
                                        className={`w-full px-4 py-3 border rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono ${
                                            errors.slug ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                        placeholder="brand-url-slug"
                                    />
                                    {errors.slug && (
                                        <p className="flex items-center text-sm text-red-600">
                                            <X className="w-4 h-4 mr-1" />
                                            {errors.slug}
                                        </p>
                                    )}
                                </div>

                                {/* Website URL */}
                                <div className="space-y-2">
                                    <label className="flex items-center text-sm font-semibold text-gray-900">
                                        <Globe className="w-4 h-4 mr-2 text-gray-500" />
                                        Website URL
                                    </label>
                                    <input
                                        type="url"
                                        value={data.website}
                                        onChange={(e) => setData('website', e.target.value)}
                                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                            errors.website ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                        placeholder="https://example.com"
                                    />
                                    <p className="text-xs text-gray-500">Brand's official website (optional)</p>
                                    {errors.website && (
                                        <p className="flex items-center text-sm text-red-600">
                                            <X className="w-4 h-4 mr-1" />
                                            {errors.website}
                                        </p>
                                    )}
                                </div>

                                {/* Sort Order */}
                                <div className="space-y-2">
                                    <label className="flex items-center text-sm font-semibold text-gray-900">
                                        <Hash className="w-4 h-4 mr-2 text-gray-500" />
                                        Sort Order
                                    </label>
                                    <input
                                        type="number"
                                        value={data.sort_order}
                                        onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        min="0"
                                        placeholder="0"
                                    />
                                    <p className="text-xs text-gray-500">Lower numbers will appear first in listings</p>
                                    {errors.sort_order && (
                                        <p className="flex items-center text-sm text-red-600">
                                            <X className="w-4 h-4 mr-1" />
                                            {errors.sort_order}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="flex items-center text-sm font-semibold text-gray-900">
                                    <FileText className="w-4 h-4 mr-2 text-gray-500" />
                                    Description
                                </label>
                                <textarea
                                    rows={4}
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                                    placeholder="Tell customers about this brand, its history, and what makes it special..."
                                />
                                {errors.description && (
                                    <p className="flex items-center text-sm text-red-600">
                                        <X className="w-4 h-4 mr-1" />
                                        {errors.description}
                                    </p>
                                )}
                            </div>

                            {/* Status Toggle */}
                            <div className="space-y-3">
                                <label className="flex items-center text-sm font-semibold text-gray-900">
                                    <ToggleLeft className="w-4 h-4 mr-2 text-gray-500" />
                                    Brand Status
                                </label>
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 focus:ring-2"
                                    />
                                    <label htmlFor="is_active" className="text-sm text-gray-700 select-none cursor-pointer">
                                        Active brand (visible to customers)
                                    </label>
                                </div>
                                <p className="text-xs text-gray-500 ml-8">Inactive brands will be hidden from the storefront but remain in admin</p>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="bg-gray-50 px-8 py-6">
                            <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
                                <Link
                                    href="/admin/brands"
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
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            Update Brand
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
