import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Package, Search, FileText, Eye, X } from 'lucide-react';
import AppLayout from '@/layouts/CustomerLayout';

interface Order {
    id: number;
    order_number: string;
    status: string;
    payment_status: string;
    payment_method: string;
    total_amount: number;
    total_items: number;
    created_at: string;
    formatted_date: string;
}

interface PaginatedOrders {
    data: Order[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface OrdersPageProps {
    orders: PaginatedOrders;
    filters: {
        status?: string;
        search?: string;
    };
}

const OrdersPage: React.FC<OrdersPageProps> = ({ orders, filters }) => {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');

    const formatPrice = (price: number): string => {
        return `£${price.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const getStatusColor = (status: string): string => {
        const colors: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800',
            processing: 'bg-blue-100 text-blue-800',
            shipped: 'bg-purple-100 text-purple-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
            refunded: 'bg-gray-100 text-gray-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getPaymentStatusColor = (status: string): string => {
        const colors: Record<string, string> = {
            pending: 'text-yellow-600',
            paid: 'text-green-600',
            failed: 'text-red-600',
            refunded: 'text-gray-600',
        };
        return colors[status] || 'text-gray-600';
    };

    const handleSearch = () => {
        router.get('/orders', {
            search: searchTerm,
            status: selectedStatus,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedStatus('');
        router.get('/orders', {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AppLayout>
            <Head title="My Orders - RapidBoilerParts" />

            <div className="max-w-7xl mx-auto px-4 py-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">My Orders</h1>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    placeholder="Search by order number..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                />
                            </div>
                        </div>

                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>

                        <button
                            onClick={handleSearch}
                            className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                            Search
                        </button>

                        {(searchTerm || selectedStatus) && (
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center"
                            >
                                <X size={16} className="mr-1" />
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Orders List */}
                {orders.data.length > 0 ? (
                    <>
                        <div className="space-y-4">
                            {orders.data.map((order) => (
                                <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-800">
                                                        Order #{order.order_number}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Placed on {order.created_at} • {order.formatted_date}
                                                    </p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                                                <div>
                                                    <p className="text-xs text-gray-500">Total Amount</p>
                                                    <p className="text-lg font-bold text-gray-800">{formatPrice(order.total_amount)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Payment Status</p>
                                                    <p className={`text-sm font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                                                        {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Items</p>
                                                    <p className="text-sm font-medium text-gray-800">
                                                        {order.total_items} {order.total_items === 1 ? 'item' : 'items'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-2 lg:flex-col">
                                            <Link
                                                href={`/orders/${order.id}`}
                                                className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                                            >
                                                <Eye size={16} />
                                                <span>View Details</span>
                                            </Link>
                                            <Link
                                                href={`/orders/${order.id}/invoice`}
                                                className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
                                            >
                                                <FileText size={16} />
                                                <span>Invoice</span>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {orders.last_page > 1 && (
                            <div className="mt-6 flex justify-center">
                                <div className="flex items-center space-x-2">
                                    {orders.current_page > 1 && (
                                        <Link
                                            href={`/orders?page=${orders.current_page - 1}${searchTerm ? `&search=${searchTerm}` : ''}${selectedStatus ? `&status=${selectedStatus}` : ''}`}
                                            className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                                        >
                                            Previous
                                        </Link>
                                    )}

                                    <span className="px-4 py-2 text-sm text-gray-600">
                                        Page {orders.current_page} of {orders.last_page}
                                    </span>

                                    {orders.current_page < orders.last_page && (
                                        <Link
                                            href={`/orders?page=${orders.current_page + 1}${searchTerm ? `&search=${searchTerm}` : ''}${selectedStatus ? `&status=${selectedStatus}` : ''}`}
                                            className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                                        >
                                            Next
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <Package size={64} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Orders Found</h3>
                        <p className="text-gray-600 mb-6">
                            {searchTerm || selectedStatus
                                ? 'No orders match your search criteria.'
                                : "You haven't placed any orders yet."}
                        </p>
                        <Link
                            href="/products"
                            className="inline-block bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors"
                        >
                            Start Shopping
                        </Link>
                    </div>
                )}
            </div>
        </AppLayout>
    );
};

export default OrdersPage;
