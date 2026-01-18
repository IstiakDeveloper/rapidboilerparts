import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Package, MapPin, CreditCard, Truck, FileText, X, Check, Clock } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';

interface SelectedService {
    id: number;
    name: string;
    price: number;
}

interface Product {
    id: number;
    slug: string;
    image: string;
    brand: {
        name: string;
    };
}

interface OrderItem {
    id: number;
    product_name: string;
    product_sku: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    selected_services: SelectedService[];
    services_total: number;
    product: Product;
}

interface Address {
    first_name: string;
    last_name: string;
    company: string | null;
    address_line_1: string;
    address_line_2: string | null;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone: string | null;
}

interface Order {
    id: number;
    order_number: string;
    status: string;
    payment_status: string;
    payment_method: string;
    payment_transaction_id: string | null;
    subtotal: number;
    tax_amount: number;
    shipping_amount: number;
    discount_amount: number;
    total_amount: number;
    total_services_amount: number;
    billing_address: Address;
    shipping_address: Address;
    notes: string | null;
    preferred_service_date: string | null;
    service_time_slot: string | null;
    service_instructions: string | null;
    service_provider: {
        id: number;
        name: string;
        business_name: string | null;
        contact_number: string | null;
        email: string | null;
        city: string | null;
        area: string | null;
        rating: number;
    } | null;
    assigned_at: string | null;
    created_at: string;
    shipped_at: string | null;
    delivered_at: string | null;
    items: OrderItem[];
}

interface OrderShowProps {
    order: Order;
}

const OrderShow: React.FC<OrderShowProps> = ({ order }) => {
    const formatPrice = (price: number): string => {
        return `£${price.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const getStatusColor = (status: string): string => {
        const colors: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            processing: 'bg-blue-100 text-blue-800 border-blue-200',
            shipped: 'bg-purple-100 text-purple-800 border-purple-200',
            delivered: 'bg-green-100 text-green-800 border-green-200',
            cancelled: 'bg-red-100 text-red-800 border-red-200',
            refunded: 'bg-gray-100 text-gray-800 border-gray-200',
        };
        return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock size={20} />;
            case 'processing':
                return <Package size={20} />;
            case 'shipped':
                return <Truck size={20} />;
            case 'delivered':
                return <Check size={20} />;
            case 'cancelled':
                return <X size={20} />;
            default:
                return <Package size={20} />;
        }
    };

    const canCancelOrder = ['pending', 'processing'].includes(order.status);

    const handleCancelOrder = () => {
        if (confirm('Are you sure you want to cancel this order?')) {
            router.post(`/orders/${order.id}/cancel`, {}, {
                preserveScroll: true,
            });
        }
    };

    const formatAddress = (address: Address): string => {
        const parts = [
            address.company,
            address.address_line_1,
            address.address_line_2,
            address.city,
            address.state,
            address.postal_code,
        ].filter(Boolean);
        return parts.join(', ');
    };

    const orderTimeline = [
        { status: 'pending', label: 'Order Placed', date: order.created_at, completed: true },
        { status: 'processing', label: 'Processing', date: null, completed: ['processing', 'shipped', 'delivered'].includes(order.status) },
        { status: 'shipped', label: 'Shipped', date: order.shipped_at, completed: ['shipped', 'delivered'].includes(order.status) },
        { status: 'delivered', label: 'Delivered', date: order.delivered_at, completed: order.status === 'delivered' },
    ];

    return (
        <AppLayout>
            <Head title={`Order ${order.order_number} - RapidBoilerParts`} />

            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Header */}
                <div className="mb-6">
                    <Link href="/orders" className="text-red-600 hover:text-red-700 text-sm font-medium mb-2 inline-block">
                        ← Back to Orders
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Order #{order.order_number}</h1>
                            <p className="text-sm text-gray-500 mt-1">Placed on {order.created_at}</p>
                        </div>
                        <div className="flex gap-2">
                            <Link
                                href={`/orders/${order.id}/invoice`}
                                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                <FileText size={16} />
                                <span>Download Invoice</span>
                            </Link>
                            {canCancelOrder && (
                                <button
                                    onClick={handleCancelOrder}
                                    className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                                >
                                    Cancel Order
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Status */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-gray-800">Order Status</h2>
                                <span className={`px-4 py-2 rounded-full text-sm font-medium border-2 ${getStatusColor(order.status)} flex items-center space-x-2`}>
                                    {getStatusIcon(order.status)}
                                    <span>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                                </span>
                            </div>

                            {/* Timeline */}
                            {order.status !== 'cancelled' && (
                                <div className="relative">
                                    {orderTimeline.map((step, index) => (
                                        <div key={step.status} className="flex items-start mb-8 last:mb-0">
                                            <div className="relative">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                    step.completed ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
                                                }`}>
                                                    {step.completed ? <Check size={20} /> : <Clock size={20} />}
                                                </div>
                                                {index < orderTimeline.length - 1 && (
                                                    <div className={`absolute left-5 top-10 w-0.5 h-12 ${
                                                        step.completed ? 'bg-green-600' : 'bg-gray-200'
                                                    }`} />
                                                )}
                                            </div>
                                            <div className="ml-4 flex-1">
                                                <p className={`font-medium ${step.completed ? 'text-gray-800' : 'text-gray-500'}`}>
                                                    {step.label}
                                                </p>
                                                {step.date && (
                                                    <p className="text-sm text-gray-500 mt-1">{step.date}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {order.status === 'cancelled' && (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                                        <X className="text-red-600" size={32} />
                                    </div>
                                    <p className="text-lg font-medium text-gray-800">Order Cancelled</p>
                                    <p className="text-sm text-gray-600 mt-1">This order has been cancelled</p>
                                </div>
                            )}
                        </div>

                        {/* Order Items */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Items</h2>
                            <div className="space-y-4">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-b-0 last:pb-0">
                                        <Link href={`/products/${item.product.slug}`} className="flex-shrink-0">
                                            <img
                                                src={`/storage/${item.product.image}`}
                                                alt={item.product_name}
                                                className="w-20 h-20 object-cover rounded border border-gray-200"
                                                onError={(e) => {
                                                    e.currentTarget.src = '/storage/products/placeholder-product.jpg';
                                                }}
                                            />
                                        </Link>
                                        <div className="flex-1">
                                            <Link
                                                href={`/products/${item.product.slug}`}
                                                className="font-medium text-gray-800 hover:text-red-600 line-clamp-2"
                                            >
                                                {item.product_name}
                                            </Link>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Brand: {item.product.brand.name}
                                            </p>
                                            <p className="text-sm text-gray-500">SKU: {item.product_sku}</p>

                                            {item.selected_services && item.selected_services.length > 0 && (
                                                <div className="mt-2 text-sm">
                                                    <p className="font-medium text-gray-700">Services:</p>
                                                    {item.selected_services.map((service) => (
                                                        <p key={service.id} className="text-gray-600 ml-2">
                                                            • {service.name} - {formatPrice(service.price)}
                                                        </p>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                            <p className="text-sm text-gray-600 mt-1">{formatPrice(item.unit_price)} each</p>
                                            <p className="text-lg font-bold text-gray-800 mt-2">
                                                {formatPrice(item.total_price + item.services_total)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Notes */}
                        {order.notes && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-800 mb-3">Order Notes</h2>
                                <p className="text-gray-600">{order.notes}</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Order Summary */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal:</span>
                                    <span>{formatPrice(order.subtotal)}</span>
                                </div>

                                {order.total_services_amount > 0 && (
                                    <div className="flex justify-between text-gray-600">
                                        <span>Services:</span>
                                        <span>{formatPrice(order.total_services_amount)}</span>
                                    </div>
                                )}

                                {order.discount_amount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount:</span>
                                        <span>-{formatPrice(order.discount_amount)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between text-gray-600">
                                    <span>VAT:</span>
                                    <span>{formatPrice(order.tax_amount)}</span>
                                </div>

                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping:</span>
                                    <span>
                                        {order.shipping_amount === 0 ? (
                                            <span className="text-green-600 font-medium">FREE</span>
                                        ) : (
                                            formatPrice(order.shipping_amount)
                                        )}
                                    </span>
                                </div>

                                <div className="border-t-2 border-gray-200 pt-3">
                                    <div className="flex justify-between">
                                        <span className="text-lg font-bold text-gray-800">Total:</span>
                                        <span className="text-lg font-bold text-red-600">
                                            {formatPrice(order.total_amount)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Information */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center mb-4">
                                <CreditCard className="text-red-600 mr-2" size={20} />
                                <h2 className="text-lg font-semibold text-gray-800">Payment Details</h2>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Method:</span>
                                    <span className="font-medium text-gray-800 capitalize">
                                        {order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Status:</span>
                                    <span className={`font-medium ${
                                        order.payment_status === 'paid' ? 'text-green-600' :
                                        order.payment_status === 'failed' ? 'text-red-600' :
                                        'text-yellow-600'
                                    }`}>
                                        {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                                    </span>
                                </div>
                                {order.payment_transaction_id && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Transaction ID:</span>
                                        <span className="font-mono text-xs text-gray-800">
                                            {order.payment_transaction_id}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Service Provider Information */}
                        {order.service_provider && (
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 p-6">
                                <div className="flex items-center mb-4">
                                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-lg font-bold text-gray-800">Service Provider</h2>
                                </div>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <p className="text-gray-600 text-xs font-semibold uppercase mb-1">Provider Name</p>
                                        <p className="font-semibold text-gray-900">{order.service_provider.name}</p>
                                        {order.service_provider.business_name && (
                                            <p className="text-gray-600 text-xs mt-0.5">{order.service_provider.business_name}</p>
                                        )}
                                    </div>

                                    {order.service_provider.contact_number && (
                                        <div>
                                            <p className="text-gray-600 text-xs font-semibold uppercase mb-1">Contact</p>
                                            <p className="text-gray-800">{order.service_provider.contact_number}</p>
                                        </div>
                                    )}

                                    {order.service_provider.email && (
                                        <div>
                                            <p className="text-gray-600 text-xs font-semibold uppercase mb-1">Email</p>
                                            <p className="text-gray-800 break-all">{order.service_provider.email}</p>
                                        </div>
                                    )}

                                    {(order.service_provider.city || order.service_provider.area) && (
                                        <div>
                                            <p className="text-gray-600 text-xs font-semibold uppercase mb-1">Location</p>
                                            <p className="text-gray-800">
                                                {[order.service_provider.area, order.service_provider.city].filter(Boolean).join(', ')}
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-4 pt-2 border-t border-blue-200">
                                        <div>
                                            <p className="text-gray-600 text-xs font-semibold uppercase">Rating</p>
                                            <p className="text-lg font-bold text-yellow-600">⭐ {order.service_provider.rating.toFixed(1)}</p>
                                        </div>
                                        {order.assigned_at && (
                                            <div>
                                                <p className="text-gray-600 text-xs font-semibold uppercase">Assigned</p>
                                                <p className="text-sm text-gray-800">{order.assigned_at}</p>
                                            </div>
                                        )}
                                    </div>

                                    {(order.preferred_service_date || order.service_time_slot) && (
                                        <div className="mt-3 pt-3 border-t border-blue-200">
                                            <p className="text-gray-600 text-xs font-semibold uppercase mb-2">Service Schedule</p>
                                            {order.preferred_service_date && (
                                                <p className="text-gray-800 flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    {order.preferred_service_date}
                                                </p>
                                            )}
                                            {order.service_time_slot && (
                                                <p className="text-gray-800 flex items-center gap-2 mt-1">
                                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {order.service_time_slot}
                                                </p>
                                            )}
                                            {order.service_instructions && (
                                                <div className="mt-2">
                                                    <p className="text-gray-600 text-xs font-semibold uppercase mb-1">Instructions</p>
                                                    <p className="text-gray-700 text-xs bg-white/50 p-2 rounded">{order.service_instructions}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Billing Address */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center mb-3">
                                <MapPin className="text-red-600 mr-2" size={20} />
                                <h2 className="text-lg font-semibold text-gray-800">Billing Address</h2>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p className="font-medium text-gray-800">
                                    {order.billing_address.first_name} {order.billing_address.last_name}
                                </p>
                                {order.billing_address.company && <p>{order.billing_address.company}</p>}
                                <p>{order.billing_address.address_line_1}</p>
                                {order.billing_address.address_line_2 && <p>{order.billing_address.address_line_2}</p>}
                                <p>{order.billing_address.city}, {order.billing_address.state}</p>
                                <p>{order.billing_address.postal_code}</p>
                                {order.billing_address.phone && <p>Phone: {order.billing_address.phone}</p>}
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center mb-3">
                                <Truck className="text-red-600 mr-2" size={20} />
                                <h2 className="text-lg font-semibold text-gray-800">Shipping Address</h2>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p className="font-medium text-gray-800">
                                    {order.shipping_address.first_name} {order.shipping_address.last_name}
                                </p>
                                {order.shipping_address.company && <p>{order.shipping_address.company}</p>}
                                <p>{order.shipping_address.address_line_1}</p>
                                {order.shipping_address.address_line_2 && <p>{order.shipping_address.address_line_2}</p>}
                                <p>{order.shipping_address.city}, {order.shipping_address.state}</p>
                                <p>{order.shipping_address.postal_code}</p>
                                {order.shipping_address.phone && <p>Phone: {order.shipping_address.phone}</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default OrderShow;
