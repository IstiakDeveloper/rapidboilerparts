// resources/js/Pages/Admin/Dashboard.tsx

import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';

interface Order {
    id: number;
    order_number: string;
    user: {
        first_name: string;
        last_name: string;
    };
    total_amount: number;
    status: string;
    created_at: string;
}

interface Inquiry {
    id: number;
    name: string;
    email: string;
    subject: string;
    status: string;
    created_at: string;
}

interface Stats {
    total_products: number;
    active_products: number;
    total_orders: number;
    pending_orders: number;
    total_customers: number;
    new_inquiries: number;
    monthly_revenue: number;
    low_stock_products: number;
}

interface DashboardProps {
    stats: Stats;
    recent_orders: Order[];
    recent_inquiries: Inquiry[];
}

const Dashboard: React.FC<DashboardProps> = ({ stats, recent_orders, recent_inquiries }) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP'
        }).format(amount);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'shipped': return 'bg-purple-100 text-purple-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            case 'new': return 'bg-blue-100 text-blue-800';
            case 'in_progress': return 'bg-yellow-100 text-yellow-800';
            case 'resolved': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const statCards = [
        {
            title: 'Total Products',
            value: stats.total_products,
            change: `${stats.active_products} active`,
            icon: (
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            ),
            link: '/admin/products'
        },
        {
            title: 'Total Orders',
            value: stats.total_orders,
            change: `${stats.pending_orders} pending`,
            icon: (
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
            ),
            link: '/admin/orders'
        },
        {
            title: 'Total Customers',
            value: stats.total_customers,
            change: 'registered users',
            icon: (
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
            ),
            link: '/admin/users'
        },
        {
            title: 'Monthly Revenue',
            value: formatCurrency(stats.monthly_revenue),
            change: 'this month',
            icon: (
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
            ),
            link: '/admin/orders'
        }
    ];

    return (
        <AdminLayout>
            <Head title="Admin Dashboard" />

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">Overview of your boiler parts store</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((card, index) => (
                    <Link
                        key={index}
                        href={card.link}
                        className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                                <p className="text-sm text-gray-500 mt-1">{card.change}</p>
                            </div>
                            <div className="p-3 rounded-full bg-gray-50">
                                {card.icon}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Alerts */}
            {(stats.new_inquiries > 0 || stats.low_stock_products > 0) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {stats.new_inquiries > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <span className="text-blue-800">
                                    You have {stats.new_inquiries} new customer inquiries
                                </span>
                                <Link
                                    href="/admin/contact-inquiries"
                                    className="ml-auto text-blue-600 hover:text-blue-700 text-sm font-medium"
                                >
                                    View All
                                </Link>
                            </div>
                        </div>
                    )}

                    {stats.low_stock_products > 0 && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-orange-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <span className="text-orange-800">
                                    {stats.low_stock_products} products are running low on stock
                                </span>
                                <Link
                                    href="/admin/products?stock_status=low_stock"
                                    className="ml-auto text-orange-600 hover:text-orange-700 text-sm font-medium"
                                >
                                    View All
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Orders */}
                <div className="bg-white rounded-lg shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                            <Link
                                href="/admin/orders"
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                                View All
                            </Link>
                        </div>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {recent_orders.length > 0 ? (
                            recent_orders.map((order) => (
                                <div key={order.id} className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900">
                                                #{order.order_number}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {order.user.first_name} {order.user.last_name}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {formatDate(order.created_at)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-gray-900">
                                                {formatCurrency(order.total_amount)}
                                            </p>
                                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-6 text-center text-gray-500">
                                No recent orders
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Inquiries */}
                <div className="bg-white rounded-lg shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Recent Inquiries</h2>
                            <Link
                                href="/admin/contact-inquiries"
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                                View All
                            </Link>
                        </div>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {recent_inquiries.length > 0 ? (
                            recent_inquiries.map((inquiry) => (
                                <div key={inquiry.id} className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900">
                                                {inquiry.subject}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {inquiry.name} - {inquiry.email}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {formatDate(inquiry.created_at)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(inquiry.status)}`}>
                                                {inquiry.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-6 text-center text-gray-500">
                                No recent inquiries
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Dashboard;
