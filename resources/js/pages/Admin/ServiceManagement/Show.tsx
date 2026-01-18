import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft, Edit, Trash2, Users, Tag, MapPin, Building, Phone, Mail,
    DollarSign, Hash, Star, CheckCircle, XCircle, Calendar, Clock,
    Package, TrendingUp, AlertCircle
} from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';

interface Category {
    id: number;
    name: string;
}

interface City {
    id: number;
    name: string;
    region: string;
}

interface Area {
    id: number;
    name: string;
    postcode: string | null;
}

interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
}

interface Order {
    id: number;
    order_number: string;
    total_amount: string;
    service_provider_charge: string | null;
    service_provider_status: string | null;
    status: string;
    created_at: string;
}

interface ProductService {
    id: number;
    name: string;
    type: string;
    price: string;
    pivot: {
        custom_price: string | null;
        experience_level: string;
        is_active: boolean;
    };
}

interface ServiceProvider {
    id: number;
    user_id: number;
    category_id: number;
    city_id: number;
    area_id: number;
    business_name: string | null;
    description: string | null;
    service_charge: string;
    contact_number: string | null;
    email: string | null;
    max_daily_orders: number;
    daily_orders_count: number;
    total_orders_completed: number;
    rating: string;
    availability_status: string;
    is_active: boolean;
    is_verified: boolean;
    last_active_at: string | null;
    created_at: string;
    updated_at: string;
    user: User;
    category: Category;
    city: City;
    area: Area;
    orders?: Order[];
    services?: ProductService[];
}

interface Props {
    serviceProvider: ServiceProvider;
}

export default function Show({ serviceProvider }: Props) {
    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this service provider? This action cannot be undone.')) {
            router.delete(`/admin/service-management/${serviceProvider.id}`);
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
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    const getOrderStatusBadge = (status: string) => {
        const statusConfig: Record<string, { bg: string; text: string }> = {
            'pending': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
            'assigned': { bg: 'bg-blue-100', text: 'text-blue-700' },
            'in_progress': { bg: 'bg-purple-100', text: 'text-purple-700' },
            'completed': { bg: 'bg-green-100', text: 'text-green-700' },
            'cancelled': { bg: 'bg-red-100', text: 'text-red-700' },
        };
        const config = statusConfig[status] || statusConfig['pending'];
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                {status.replace('_', ' ').toUpperCase()}
            </span>
        );
    };

    const displayName = serviceProvider.business_name ||
        `${serviceProvider.user.first_name} ${serviceProvider.user.last_name}`;

    return (
        <AdminLayout>
            <Head title={`Service Provider - ${displayName}`} />

            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{displayName}</h1>
                        <p className="text-gray-600">{serviceProvider.category.name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin/service-management"
                            className="inline-flex items-center px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to List
                        </Link>
                        <Link
                            href={`/admin/service-management/${serviceProvider.id}/edit`}
                            className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                        </Link>
                        <button
                            onClick={handleDelete}
                            className="inline-flex items-center px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Rating</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {parseFloat(serviceProvider.rating).toFixed(1)}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <Star className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                        <div className="flex items-center mt-3 text-sm text-gray-500">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            Out of 5.0
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {serviceProvider.total_orders_completed}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Package className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                        <div className="flex items-center mt-3 text-sm text-gray-500">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Completed
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Today's Orders</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {serviceProvider.daily_orders_count} / {serviceProvider.max_daily_orders}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Hash className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                        <div className="flex items-center mt-3 text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-1" />
                            Daily limit
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Service Charge</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    £{parseFloat(serviceProvider.service_charge).toFixed(2)}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                        <div className="flex items-center mt-3 text-sm text-gray-500">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            Per order
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                        href={`/admin/service-management/${serviceProvider.id}/services`}
                        className="flex items-center gap-4 p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:shadow-md transition-all group"
                    >
                        <div className="w-12 h-12 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center transition-colors">
                            <Package className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                Manage Services
                            </h3>
                            <p className="text-sm text-gray-600">Assign services & pricing</p>
                        </div>
                    </Link>

                    <Link
                        href={`/admin/service-management/${serviceProvider.id}/working-hours`}
                        className="flex items-center gap-4 p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-purple-500 hover:shadow-md transition-all group"
                    >
                        <div className="w-12 h-12 bg-purple-100 group-hover:bg-purple-200 rounded-lg flex items-center justify-center transition-colors">
                            <Clock className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                                Working Hours
                            </h3>
                            <p className="text-sm text-gray-600">Set availability schedule</p>
                        </div>
                    </Link>

                    <Link
                        href={`/admin/service-management/${serviceProvider.id}/schedule`}
                        className="flex items-center gap-4 p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-green-500 hover:shadow-md transition-all group"
                    >
                        <div className="w-12 h-12 bg-green-100 group-hover:bg-green-200 rounded-lg flex items-center justify-center transition-colors">
                            <Calendar className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                                View Schedule
                            </h3>
                            <p className="text-sm text-gray-600">Check bookings & calendar</p>
                        </div>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Information */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Basic Details */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="border-b border-gray-200 px-6 py-4">
                                <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="flex items-center text-sm font-medium text-gray-500">
                                            <Users className="w-4 h-4 mr-2" />
                                            User Account
                                        </label>
                                        <p className="text-gray-900">
                                            {serviceProvider.user.first_name} {serviceProvider.user.last_name}
                                        </p>
                                        <p className="text-sm text-gray-500">{serviceProvider.user.email}</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="flex items-center text-sm font-medium text-gray-500">
                                            <Tag className="w-4 h-4 mr-2" />
                                            Category
                                        </label>
                                        <p className="text-gray-900">{serviceProvider.category.name}</p>
                                    </div>

                                    {serviceProvider.business_name && (
                                        <div className="space-y-2">
                                            <label className="flex items-center text-sm font-medium text-gray-500">
                                                <Building className="w-4 h-4 mr-2" />
                                                Business Name
                                            </label>
                                            <p className="text-gray-900">{serviceProvider.business_name}</p>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="flex items-center text-sm font-medium text-gray-500">
                                            <MapPin className="w-4 h-4 mr-2" />
                                            Location
                                        </label>
                                        <p className="text-gray-900">{serviceProvider.area.name}, {serviceProvider.city.name}</p>
                                        <p className="text-sm text-gray-500">
                                            {serviceProvider.city.region}
                                            {serviceProvider.area.postcode && ` • ${serviceProvider.area.postcode}`}
                                        </p>
                                    </div>

                                    {serviceProvider.contact_number && (
                                        <div className="space-y-2">
                                            <label className="flex items-center text-sm font-medium text-gray-500">
                                                <Phone className="w-4 h-4 mr-2" />
                                                Contact Number
                                            </label>
                                            <p className="text-gray-900">{serviceProvider.contact_number}</p>
                                        </div>
                                    )}

                                    {serviceProvider.email && (
                                        <div className="space-y-2">
                                            <label className="flex items-center text-sm font-medium text-gray-500">
                                                <Mail className="w-4 h-4 mr-2" />
                                                Email
                                            </label>
                                            <p className="text-gray-900">{serviceProvider.email}</p>
                                        </div>
                                    )}
                                </div>

                                {serviceProvider.description && (
                                    <div className="space-y-2 pt-4 border-t border-gray-200">
                                        <label className="text-sm font-medium text-gray-500">Description</label>
                                        <p className="text-gray-900 leading-relaxed">{serviceProvider.description}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Assigned Services */}
                        {serviceProvider.services && serviceProvider.services.length > 0 && (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-gray-900">Assigned Services</h2>
                                    <Link
                                        href={`/admin/service-management/${serviceProvider.id}/edit`}
                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        Edit Services
                                    </Link>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-3">
                                        {serviceProvider.services.map((service) => (
                                            <div
                                                key={service.id}
                                                className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <h3 className="font-semibold text-gray-900">{service.name}</h3>
                                                            {service.pivot.is_active ? (
                                                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                                                                    Active
                                                                </span>
                                                            ) : (
                                                                <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                                                                    Inactive
                                                                </span>
                                                            )}
                                                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded capitalize">
                                                                {service.pivot.experience_level}
                                                            </span>
                                                        </div>
                                                        <div className="text-sm text-gray-600 space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium">Service Type:</span>
                                                                <span className="capitalize">{service.type}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium">Customer Price:</span>
                                                                <span>£{parseFloat(service.price).toFixed(2)}</span>
                                                            </div>
                                                            {service.pivot.custom_price && (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-medium">Provider Payment:</span>
                                                                    <span className="text-green-600 font-semibold">
                                                                        £{parseFloat(service.pivot.custom_price).toFixed(2)}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {service.pivot.custom_price && (
                                                                <div className="flex items-center gap-2 text-xs">
                                                                    <span className="font-medium">Company Profit:</span>
                                                                    <span className="text-blue-600 font-semibold">
                                                                        £{(parseFloat(service.price) - parseFloat(service.pivot.custom_price)).toFixed(2)}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Assigned Orders */}
                        {serviceProvider.orders && serviceProvider.orders.length > 0 && (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="border-b border-gray-200 px-6 py-4">
                                    <h2 className="text-lg font-semibold text-gray-900">Assigned Orders</h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Order #
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Amount
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Service Charge
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Date
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {serviceProvider.orders.map((order) => (
                                                <tr key={order.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <Link
                                                            href={`/admin/orders/${order.id}`}
                                                            className="text-blue-600 hover:text-blue-700 font-medium"
                                                        >
                                                            {order.order_number}
                                                        </Link>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                                                        £{parseFloat(order.total_amount).toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                                                        {order.service_provider_charge
                                                            ? `£${parseFloat(order.service_provider_charge).toFixed(2)}`
                                                            : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getOrderStatusBadge(order.service_provider_status || order.status)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(order.created_at).toLocaleDateString('en-GB')}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Status Card */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <h3 className="text-sm font-semibold text-gray-900 mb-4">Status</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Availability</span>
                                    {getStatusBadge(serviceProvider.availability_status)}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Active</span>
                                    {serviceProvider.is_active ? (
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-red-600" />
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Verified</span>
                                    {serviceProvider.is_verified ? (
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                    ) : (
                                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Activity Card */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <h3 className="text-sm font-semibold text-gray-900 mb-4">Activity</h3>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        Joined
                                    </div>
                                    <p className="text-sm text-gray-900 ml-6">
                                        {new Date(serviceProvider.created_at).toLocaleDateString('en-GB', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                                {serviceProvider.last_active_at && (
                                    <div className="space-y-1">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Clock className="w-4 h-4 mr-2" />
                                            Last Active
                                        </div>
                                        <p className="text-sm text-gray-900 ml-6">
                                            {new Date(serviceProvider.last_active_at).toLocaleDateString('en-GB', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                )}
                                <div className="space-y-1">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        Last Updated
                                    </div>
                                    <p className="text-sm text-gray-900 ml-6">
                                        {new Date(serviceProvider.updated_at).toLocaleDateString('en-GB', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
