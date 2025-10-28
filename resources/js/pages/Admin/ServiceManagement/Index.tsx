import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Plus, Search, Filter, Eye, Edit, Trash2, Users, MapPin, Tag,
    Star, CheckCircle, XCircle, Hash, Clock, AlertCircle
} from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';

interface Category {
    id: number;
    name: string;
}

interface City {
    id: number;
    name: string;
}

interface Area {
    id: number;
    name: string;
}

interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
}

interface ServiceProvider {
    id: number;
    user_id: number;
    business_name: string | null;
    service_charge: string;
    rating: string;
    availability_status: string;
    is_active: boolean;
    is_verified: boolean;
    daily_orders_count: number;
    max_daily_orders: number;
    orders_count: number;
    user: User;
    category: Category;
    city: City;
    area: Area;
}

interface Props {
    serviceProviders: {
        data: ServiceProvider[];
        links?: any[];
        meta?: { from?: number; to?: number; total?: number };
    };
    filters: {
        search?: string;
        category_id?: string;
        city_id?: string;
        status?: string;
        availability?: string;
    };
    categories: Category[];
    cities: City[];
}

export default function Index({ serviceProviders, filters, categories, cities }: Props) {
    const [selected, setSelected] = useState<number[]>([]);
    const [search, setSearch] = useState(filters.search || '');
    const [categoryId, setCategoryId] = useState(filters.category_id || '');
    const [cityId, setCityId] = useState(filters.city_id || '');
    const [status, setStatus] = useState(filters.status || '');
    const [availability, setAvailability] = useState(filters.availability || '');

    const handleFilter = () => {
        router.get('/admin/service-management', {
            search,
            category_id: categoryId,
            city_id: cityId,
            status,
            availability
        });
    };

    const handleReset = () => {
        setSearch('');
        setCategoryId('');
        setCityId('');
        setStatus('');
        setAvailability('');
        router.get('/admin/service-management');
    };

    const handleBulk = (action: string) => {
        if (!selected.length) return;
        if (confirm(`${action} selected service providers?`)) {
            router.post('/admin/service-management/bulk-update', { ids: selected, action });
        }
    };

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Delete "${name}"? This action cannot be undone.`)) {
            router.delete(`/admin/service-management/${id}`);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
            'available': { bg: 'bg-green-100', text: 'text-green-700', label: 'Available' },
            'busy': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Busy' },
            'offline': { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Offline' },
        };
        const config = statusConfig[status] || statusConfig['offline'];
        return (
            <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    return (
        <AdminLayout>
            <Head title="Service Providers" />

            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Service Providers</h1>
                        <p className="text-gray-600">Manage installers, delivery personnel and service staff</p>
                    </div>
                    <Link
                        href="/admin/service-management/create"
                        className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Add Service Provider
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
                                        placeholder="Search providers..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <select
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                >
                                    <option value="">All Categories</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <select
                                    value={cityId}
                                    onChange={(e) => setCityId(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                >
                                    <option value="">All Cities</option>
                                    {cities.map(city => (
                                        <option key={city.id} value={city.id}>{city.name}</option>
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
                                    <option value="verified">Verified</option>
                                    <option value="pending">Pending Verification</option>
                                </select>
                            </div>
                            <div className="md:col-span-3 flex gap-3">
                                <button
                                    onClick={handleFilter}
                                    className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                                >
                                    <Filter className="w-4 h-4 mr-2" />
                                    Apply
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
                            <span className="text-blue-900 font-medium">{selected.length} providers selected</span>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => handleBulk('activate')}
                                    className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                                >
                                    Activate
                                </button>
                                <button
                                    onClick={() => handleBulk('deactivate')}
                                    className="px-3 py-1.5 bg-amber-600 text-white text-sm font-medium rounded-md hover:bg-amber-700 transition-colors"
                                >
                                    Deactivate
                                </button>
                                <button
                                    onClick={() => handleBulk('verify')}
                                    className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Verify
                                </button>
                                <button
                                    onClick={() => handleBulk('delete')}
                                    className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Table Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {serviceProviders.data && serviceProviders.data.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="w-12 px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    onChange={(e) => setSelected(e.target.checked ? serviceProviders.data.map(p => p.id) : [])}
                                                    checked={serviceProviders.data.length > 0 && selected.length === serviceProviders.data.length}
                                                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                />
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Provider</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Category</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Location</th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Rating</th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Orders</th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Availability</th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Status</th>
                                            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {serviceProviders.data.map((provider) => {
                                            const displayName = provider.business_name ||
                                                `${provider.user.first_name} ${provider.user.last_name}`;

                                            return (
                                                <tr key={provider.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <input
                                                            type="checkbox"
                                                            checked={selected.includes(provider.id)}
                                                            onChange={(e) => setSelected(prev =>
                                                                e.target.checked ? [...prev, provider.id] : prev.filter(id => id !== provider.id)
                                                            )}
                                                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                                                <Users className="w-5 h-5 text-white" />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <div className="font-semibold text-gray-900">{displayName}</div>
                                                                <div className="text-sm text-gray-500">{provider.user.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center text-sm text-gray-900">
                                                            <Tag className="w-4 h-4 mr-2 text-gray-400" />
                                                            {provider.category.name}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center text-sm text-gray-900">
                                                            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                                            <div>
                                                                <div>{provider.area.name}</div>
                                                                <div className="text-xs text-gray-500">{provider.city.name}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex items-center justify-center">
                                                            <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                                                            <span className="font-semibold text-gray-900">
                                                                {parseFloat(provider.rating).toFixed(1)}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex items-center justify-center space-x-1">
                                                            <span className="text-sm font-semibold text-gray-900">
                                                                {provider.daily_orders_count}/{provider.max_daily_orders}
                                                            </span>
                                                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {provider.orders_count || 0} total
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {getStatusBadge(provider.availability_status)}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex flex-col items-center space-y-1">
                                                            <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                                                                provider.is_active
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-red-100 text-red-800'
                                                            }`}>
                                                                {provider.is_active ? 'Active' : 'Inactive'}
                                                            </span>
                                                            <div className="flex items-center">
                                                                {provider.is_verified ? (
                                                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                                                ) : (
                                                                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-end gap-3">
                                                            <Link
                                                                href={`/admin/service-management/${provider.id}`}
                                                                className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors flex items-center"
                                                            >
                                                                <Eye className="w-4 h-4 mr-1" />
                                                                View
                                                            </Link>
                                                            <Link
                                                                href={`/admin/service-management/${provider.id}/edit`}
                                                                className="text-indigo-600 hover:text-indigo-700 font-medium text-sm transition-colors flex items-center"
                                                            >
                                                                <Edit className="w-4 h-4 mr-1" />
                                                                Edit
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDelete(provider.id, displayName)}
                                                                className="text-red-600 hover:text-red-700 font-medium text-sm transition-colors flex items-center"
                                                            >
                                                                <Trash2 className="w-4 h-4 mr-1" />
                                                                Delete
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
                            {serviceProviders.meta && (serviceProviders.meta.from || serviceProviders.meta.to || serviceProviders.meta.total) && (
                                <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div className="text-sm text-gray-700">
                                            Showing <span className="font-semibold">{serviceProviders.meta.from || 0}</span> to{' '}
                                            <span className="font-semibold">{serviceProviders.meta.to || 0}</span> of{' '}
                                            <span className="font-semibold">{serviceProviders.meta.total || 0}</span> results
                                        </div>
                                        {serviceProviders.links && (
                                            <div className="flex items-center gap-1">
                                                {serviceProviders.links.map((link: any, index: number) => (
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
                                <Users className="w-12 h-12 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No service providers yet</h3>
                            <p className="text-gray-600 mb-8">Get started by adding your first installer or delivery personnel.</p>
                            <Link
                                href="/admin/service-management/create"
                                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
                            >
                                <Users className="w-5 h-5 mr-2" />
                                Add Service Provider
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
