import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import {
  ArrowLeft,
  Package,
  User,
  Calendar,
  CreditCard,
  MapPin,
  Edit3,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  FileText
} from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';

interface Order {
  id: number;
  order_number: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: string;
  payment_transaction_id: string;
  subtotal: string | number;
  tax_amount: string | number;
  shipping_amount: string | number;
  discount_amount: string | number;
  total_amount: string | number;
  billing_address: {
    first_name: string;
    last_name: string;
    company?: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone?: string;
  };
  shipping_address: {
    first_name: string;
    last_name: string;
    company?: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone?: string;
  };
  notes: string;
  shipped_at: string;
  delivered_at: string;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  items: OrderItem[];
}

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: string | number;
  total_price: string | number;
  selected_services: any;
  services_total: string | number;
  product: {
    id: number;
    name: string;
    slug: string;
    images: Array<{
      id: number;
      image_path: string;
      alt_text: string;
      is_primary: boolean;
    }>;
  };
}

interface PageProps {
  order: Order;
}

export default function Show({ order }: PageProps) {
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const { data: statusData, setData: setStatusData, post: postStatus, processing: statusProcessing } = useForm({
    status: order.status,
    notes: order.notes || '',
  });

  const { data: paymentData, setData: setPaymentData, post: postPayment, processing: paymentProcessing } = useForm({
    payment_status: order.payment_status,
    payment_transaction_id: order.payment_transaction_id || '',
  });

  const handleStatusUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    postStatus(`/admin/orders/${order.id}/status`, {
      onSuccess: () => setShowStatusModal(false),
    });
  };

  const handlePaymentUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    postPayment(`/admin/orders/${order.id}/payment`, {
      onSuccess: () => setShowPaymentModal(false),
    });
  };

  const getStatusBadge = (status: string, type: 'order' | 'payment' = 'order') => {
    const orderStyles = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      processing: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Package },
      shipped: { bg: 'bg-purple-100', text: 'text-purple-800', icon: Truck },
      delivered: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
      refunded: { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle }
    };

    const paymentStyles = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      paid: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      failed: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
      refunded: { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle }
    };

    const styles = type === 'order' ? orderStyles : paymentStyles;
    const style = styles[status as keyof typeof styles];
    const IconComponent = style.icon;

    return (
      <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${style.bg}`}>
        <IconComponent className={`w-4 h-4 ${style.text}`} />
        <span className={`text-sm font-medium ${style.text}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>
    );
  };

  const formatPrice = (price: string | number) => {
    return `£${parseFloat(price.toString()).toFixed(2)}`;
  };

  const formatAddress = (address: any) => {
    const parts = [
      address.first_name + ' ' + address.last_name,
      address.company,
      address.address_line_1,
      address.address_line_2,
      `${address.city}, ${address.state} ${address.postal_code}`,
      address.country,
      address.phone
    ].filter(Boolean);

    return parts.join('\n');
  };

  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <AdminLayout>
      <Head title={`Order #${order.order_number}`} />

      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.visit('/admin/orders')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order #{order.order_number}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <span>Order ID: {order.id}</span>
                <span>•</span>
                <span>Placed: {new Date(order.created_at).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowStatusModal(true)}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Update Status
            </button>
            <button
              onClick={() => setShowPaymentModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              Update Payment
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Items */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Items ({totalItems} items)
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                        {item.product?.images && item.product.images.length > 0 ? (
                          <img
                            src={`/storage/${item.product.images[0].image_path}`}
                            alt={item.product.images[0].alt_text || item.product_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 mb-1">
                          {item.product_name}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">SKU: {item.product_sku}</p>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            Qty: {item.quantity} × {formatPrice(item.unit_price)}
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {formatPrice(item.total_price)}
                          </div>
                        </div>

                        {item.selected_services && parseFloat(item.services_total.toString()) > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <div className="text-xs text-gray-500 mb-1">Services:</div>
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-gray-600">Additional services</div>
                              <div className="text-sm font-medium text-gray-900">
                                {formatPrice(item.services_total)}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Totals */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-900">{formatPrice(order.subtotal)}</span>
                    </div>

                    {parseFloat(order.tax_amount.toString()) > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tax</span>
                        <span className="text-gray-900">{formatPrice(order.tax_amount)}</span>
                      </div>
                    )}

                    {parseFloat(order.shipping_amount.toString()) > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Shipping</span>
                        <span className="text-gray-900">{formatPrice(order.shipping_amount)}</span>
                      </div>
                    )}

                    {parseFloat(order.discount_amount.toString()) > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Discount</span>
                        <span className="text-red-600">-{formatPrice(order.discount_amount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-3">
                      <span className="text-gray-900">Total</span>
                      <span className="text-gray-900">{formatPrice(order.total_amount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Addresses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Billing Address */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Billing Address
                  </h3>
                </div>
                <div className="p-6">
                  <pre className="text-sm text-gray-600 whitespace-pre-line">
                    {formatAddress(order.billing_address)}
                  </pre>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Shipping Address
                  </h3>
                </div>
                <div className="p-6">
                  <pre className="text-sm text-gray-600 whitespace-pre-line">
                    {formatAddress(order.shipping_address)}
                  </pre>
                </div>
              </div>
            </div>

            {/* Order Notes */}
            {order.notes && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Order Notes</h3>
                </div>
                <div className="p-6">
                  <p className="text-gray-600">{order.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Status */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Order Status</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Current Status</span>
                  {getStatusBadge(order.status, 'order')}
                </div>

                {order.shipped_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Shipped At</span>
                    <span className="text-sm text-gray-900">
                      {new Date(order.shipped_at).toLocaleString()}
                    </span>
                  </div>
                )}

                {order.delivered_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Delivered At</span>
                    <span className="text-sm text-gray-900">
                      {new Date(order.delivered_at).toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="text-sm text-gray-900">
                    {new Date(order.updated_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Information
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status</span>
                  {getStatusBadge(order.payment_status, 'payment')}
                </div>

                {order.payment_method && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Method</span>
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {order.payment_method}
                    </span>
                  </div>
                )}

                {order.payment_transaction_id && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Transaction ID</span>
                    <span className="text-sm font-mono text-gray-900">
                      {order.payment_transaction_id}
                    </span>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900 font-medium">Amount Paid</span>
                    <span className="text-xl font-bold text-green-600">
                      {formatPrice(order.total_amount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Customer Information
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {order.user.first_name} {order.user.last_name}
                    </div>
                    <div className="text-sm text-gray-600">{order.user.email}</div>
                  </div>
                </div>

                {order.user.phone && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Phone</span>
                    <span className="text-sm text-gray-900">{order.user.phone}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Customer ID</span>
                  <span className="text-sm text-gray-900">#{order.user.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Update Modal */}
        {showStatusModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl border border-gray-200 shadow-xl max-w-md w-full">
              <form onSubmit={handleStatusUpdate}>
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Update Order Status</h3>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order Status
                    </label>
                    <select
                      value={statusData.status}
                      onChange={(e) => setStatusData('status', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={statusData.notes}
                      onChange={(e) => setStatusData('notes', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Add any notes about this status update..."
                    />
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowStatusModal(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={statusProcessing}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                  >
                    {statusProcessing ? 'Updating...' : 'Update Status'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Payment Update Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl border border-gray-200 shadow-xl max-w-md w-full">
              <form onSubmit={handlePaymentUpdate}>
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Update Payment Status</h3>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Status
                    </label>
                    <select
                      value={paymentData.payment_status}
                      onChange={(e) => setPaymentData('payment_status', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transaction ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={paymentData.payment_transaction_id}
                      onChange={(e) => setPaymentData('payment_transaction_id', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter transaction ID"
                    />
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={paymentProcessing}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                  >
                    {paymentProcessing ? 'Updating...' : 'Update Payment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
