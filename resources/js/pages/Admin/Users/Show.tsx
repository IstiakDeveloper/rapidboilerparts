import React from 'react';
import { Head, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Edit,
    Trash2,
    User,
    Mail,
    Phone,
    Calendar,
    MapPin,
    ShoppingBag,
    Star,
    CreditCard,
    Clock,
    CheckCircle
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    date_of_birth: string;
    gender: string;
    user_type: 'customer' | 'admin' | 'manager';
    is_active: boolean;
    last_login_at: string;
    created_at: string;
    updated_at: string;
    addresses: UserAddress[];
    orders: Order[];
    reviews: Review[];
}

interface UserAddress {
    id: number;
    type: 'billing' | 'shipping';
    first_name: string;
    last_name: string;
    company: string;
    address_line_1: string;
    address_line_2: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone: string;
    is_default: boolean;
}

interface Order {
    id: number;
    order_number: string;
    status: string;
    total_amount: string | number;
    created_at: string;
    items: OrderItem[];
}

interface OrderItem {
    id: number;
    product_name: string;
    quantity: number;
    unit_price: string | number;
}

interface Review {
    id: number;
    rating: number;
    title: string;
    comment: string;
    created_at: string;
    product: {
        id: number;
        name: string;
    };
}

interface PageProps {
    user: User;
}

export default function Show({ user }: PageProps) {
    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            router.delete(`/admin/users/${user.id}`);
        }
    };

    const getUserTypeBadge = (type: string) => {
        const styles = {
            customer: 'bg-blue-100 text-blue-800',
            admin: 'bg-red-100 text-red-800',
            manager: 'bg-purple-100 text-purple-800'
        };
        return (
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${styles[type as keyof typeof styles]}`}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
            </span>
        );
    };

    const getStatusBadge = (isActive: boolean) => {
        return (
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                {isActive ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                <span className="text-sm font-medium">{isActive ? 'Active' : 'Inactive'}</span>
            </div>
        );
    };

    const getOrderStatusBadge = (status: string) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800',
            processing: 'bg-blue-100 text-blue-800',
            shipped: 'bg-purple-100 text-purple-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
            refunded: 'bg-gray-100 text-gray-800'
        };
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const formatPrice = (price: string | number) => {
        return `£${parseFloat(price.toString()).toFixed(2)}`;
    };

    const formatAddress = (address: UserAddress) => {
        const parts = [
            address.address_line_1,
            address.address_line_2,
            `${address.city}, ${address.state} ${address.postal_code}`,
            address.country
        ].filter(Boolean);
        return parts.join('\n');
    };

    const totalOrderValue = user.orders?.reduce((sum, order) =>
        sum + parseFloat(order.total_amount.toString()), 0) || 0;
    const averageRating = user.reviews?.length > 0
        ? user.reviews.reduce((sum, review) => sum + review.rating, 0) / user.reviews.length
        : 0;

    return (
        <AdminLayout>
            <Head title={`${user.first_name} ${user.last_name}`} />

            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.visit('/admin/users')}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold text-gray-900">
                                    {user.first_name} {user.last_name}
                                </h1>
                                {getUserTypeBadge(user.user_type)}
                                {getStatusBadge(user.is_active)}
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                <span>User ID: #{user.id}</span>
                                <span>•</span>
                                <span>Joined: {new Date(user.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.visit(`/admin/users/${user.id}/edit`)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <Edit className="w-4 h-4" />
                            Edit User
                        </button>
                        {user.orders.length === 0 && (
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Contact Information */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Contact Information
                                </h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Total Orders</span>
                                    <span className="font-medium text-gray-900">{user.orders?.length || 0}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Total Spent</span>
                                    <span className="font-medium text-gray-900">{formatPrice(totalOrderValue)}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Reviews Written</span>
                                    <span className="font-medium text-gray-900">{user.reviews?.length || 0}</span>
                                </div>

                                {averageRating > 0 && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Avg Rating Given</span>
                                        <div className="flex items-center gap-1">
                                            <span className="font-medium text-gray-900">{averageRating.toFixed(1)}</span>
                                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Addresses</span>
                                    <span className="font-medium text-gray-900">{user.addresses?.length || 0}</span>
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Member Since</span>
                                        <span className="font-medium text-gray-900">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Account Status */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Account Status</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Status</span>
                                    {getStatusBadge(user.is_active)}
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">User Type</span>
                                    {getUserTypeBadge(user.user_type)}
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Email Verified</span>
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Last Updated</span>
                                        <span className="text-sm text-gray-900">
                                            {new Date(user.updated_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                            </div>
                            <div className="p-6 space-y-3">
                                <button
                                    onClick={() => router.visit(`/admin/orders?search=${user.email}`)}
                                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3"
                                >
                                    <ShoppingBag className="w-4 h-4 text-gray-400" />
                                    View All Orders
                                </button>

                                <button
                                    onClick={() => window.open(`mailto:${user.email}`, '_blank')}
                                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3"
                                >
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    Send Email
                                </button>

                                {user.phone && (
                                    <button
                                        onClick={() => window.open(`tel:${user.phone}`, '_blank')}
                                        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3"
                                    >
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        Call User
                                    </button>
                                )}

                                <div className="pt-3 border-t border-gray-100">
                                    <button
                                        onClick={() => router.visit(`/admin/users/${user.id}/edit`)}
                                        className="w-full text-left px-4 py-3 text-sm text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-3"
                                    >
                                        <Edit className="w-4 h-4 text-blue-500" />
                                        Edit User Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
