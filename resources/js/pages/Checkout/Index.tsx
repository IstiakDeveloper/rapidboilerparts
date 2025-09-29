import React, { useState, useEffect } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { CreditCard, Truck, MapPin, Tag, AlertCircle, Check } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';

interface SelectedService {
    id: number;
    name: string;
    price: number;
}

interface Product {
    id: number;
    name: string;
    slug: string;
    sku: string;
    price: number;
    final_price: number;
    image: string;
    brand: {
        name: string;
    };
}

interface CartItem {
    id: number;
    quantity: number;
    selected_services: SelectedService[];
    services_total: number;
    product: Product;
}

interface Address {
    id: number;
    type: string;
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
    is_default: boolean;
}

interface CartSummary {
    subtotal: number;
    discount_amount: number;
    tax_rate: number;
    tax_amount: number;
    shipping_amount: number;
    total: number;
    applied_coupon?: {
        code: string;
        discount_amount: number;
    };
}

interface User {
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
}

interface CheckoutPageProps {
    cartItems: CartItem[];
    cartSummary: CartSummary;
    addresses: Address[];
    user: User;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ cartItems, cartSummary, addresses, user }) => {
    const [couponCode, setCouponCode] = useState('');
    const [applyingCoupon, setApplyingCoupon] = useState(false);
    const [couponError, setCouponError] = useState('');
    const [localCartSummary, setLocalCartSummary] = useState(cartSummary);

    const billingAddresses = addresses.filter(addr => addr.type === 'billing');
    const shippingAddresses = addresses.filter(addr => addr.type === 'shipping');

    const defaultBilling = billingAddresses.find(addr => addr.is_default) || billingAddresses[0];
    const defaultShipping = shippingAddresses.find(addr => addr.is_default) || shippingAddresses[0];

    const { data, setData, post, processing, errors } = useForm({
        billing_address_id: defaultBilling?.id || '',
        shipping_address_id: defaultShipping?.id || '',
        payment_method: 'cod',
        notes: '',
    });

    const formatPrice = (price: number): string => {
        return `£${price.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const applyCoupon = async () => {
        if (!couponCode.trim()) return;

        setApplyingCoupon(true);
        setCouponError('');

        try {
            const response = await fetch('/checkout/apply-coupon', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ coupon_code: couponCode }),
            });

            const result = await response.json();

            if (response.ok) {
                setLocalCartSummary(result.cartSummary);
                setCouponCode('');
            } else {
                setCouponError(result.message);
            }
        } catch (error) {
            setCouponError('Failed to apply coupon. Please try again.');
        } finally {
            setApplyingCoupon(false);
        }
    };

    const removeCoupon = async () => {
        try {
            const response = await fetch('/checkout/remove-coupon', {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const result = await response.json();
            if (response.ok) {
                setLocalCartSummary(result.cartSummary);
            }
        } catch (error) {
            console.error('Failed to remove coupon');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/checkout/process');
    };

    const formatAddress = (address: Address): string => {
        const parts = [
            address.address_line_1,
            address.address_line_2,
            address.city,
            address.state,
            address.postal_code,
        ].filter(Boolean);
        return parts.join(', ');
    };

    return (
        <AppLayout>
            <Head title="Checkout - RapidBoilerParts" />

            <div className="max-w-7xl mx-auto px-4 py-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout</h1>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Billing Address */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center mb-4">
                                    <MapPin className="text-red-600 mr-2" size={20} />
                                    <h2 className="text-lg font-semibold text-gray-800">Billing Address</h2>
                                </div>

                                {billingAddresses.length > 0 ? (
                                    <div className="space-y-3">
                                        {billingAddresses.map((address) => (
                                            <label
                                                key={address.id}
                                                className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                                                    data.billing_address_id === address.id
                                                        ? 'border-red-600 bg-red-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="billing_address"
                                                    value={address.id}
                                                    checked={data.billing_address_id === address.id}
                                                    onChange={(e) => setData('billing_address_id', parseInt(e.target.value))}
                                                    className="mt-1 rounded-full border-gray-300 text-red-600 focus:ring-red-500"
                                                />
                                                <div className="ml-3 flex-1">
                                                    <div className="font-medium text-gray-800">
                                                        {address.first_name} {address.last_name}
                                                        {address.is_default && (
                                                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                                                                Default
                                                            </span>
                                                        )}
                                                    </div>
                                                    {address.company && (
                                                        <div className="text-sm text-gray-600">{address.company}</div>
                                                    )}
                                                    <div className="text-sm text-gray-600 mt-1">
                                                        {formatAddress(address)}
                                                    </div>
                                                    {address.phone && (
                                                        <div className="text-sm text-gray-600">
                                                            Phone: {address.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-gray-600 mb-3">No billing address found</p>
                                        <Link
                                            href="/profile/addresses"
                                            className="text-red-600 hover:text-red-700 font-medium"
                                        >
                                            Add Billing Address
                                        </Link>
                                    </div>
                                )}

                                {errors.billing_address_id && (
                                    <p className="mt-2 text-sm text-red-600">{errors.billing_address_id}</p>
                                )}
                            </div>

                            {/* Shipping Address */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center mb-4">
                                    <Truck className="text-red-600 mr-2" size={20} />
                                    <h2 className="text-lg font-semibold text-gray-800">Shipping Address</h2>
                                </div>

                                {shippingAddresses.length > 0 ? (
                                    <div className="space-y-3">
                                        {shippingAddresses.map((address) => (
                                            <label
                                                key={address.id}
                                                className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                                                    data.shipping_address_id === address.id
                                                        ? 'border-red-600 bg-red-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="shipping_address"
                                                    value={address.id}
                                                    checked={data.shipping_address_id === address.id}
                                                    onChange={(e) => setData('shipping_address_id', parseInt(e.target.value))}
                                                    className="mt-1 rounded-full border-gray-300 text-red-600 focus:ring-red-500"
                                                />
                                                <div className="ml-3 flex-1">
                                                    <div className="font-medium text-gray-800">
                                                        {address.first_name} {address.last_name}
                                                        {address.is_default && (
                                                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                                                                Default
                                                            </span>
                                                        )}
                                                    </div>
                                                    {address.company && (
                                                        <div className="text-sm text-gray-600">{address.company}</div>
                                                    )}
                                                    <div className="text-sm text-gray-600 mt-1">
                                                        {formatAddress(address)}
                                                    </div>
                                                    {address.phone && (
                                                        <div className="text-sm text-gray-600">
                                                            Phone: {address.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-gray-600 mb-3">No shipping address found</p>
                                        <Link
                                            href="/profile/addresses"
                                            className="text-red-600 hover:text-red-700 font-medium"
                                        >
                                            Add Shipping Address
                                        </Link>
                                    </div>
                                )}

                                {errors.shipping_address_id && (
                                    <p className="mt-2 text-sm text-red-600">{errors.shipping_address_id}</p>
                                )}
                            </div>

                            {/* Payment Method */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center mb-4">
                                    <CreditCard className="text-red-600 mr-2" size={20} />
                                    <h2 className="text-lg font-semibold text-gray-800">Payment Method</h2>
                                </div>

                                <div className="space-y-3">
                                    <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                                        data.payment_method === 'cod' ? 'border-red-600 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                                    }`}>
                                        <input
                                            type="radio"
                                            name="payment_method"
                                            value="cod"
                                            checked={data.payment_method === 'cod'}
                                            onChange={(e) => setData('payment_method', e.target.value)}
                                            className="mt-1 rounded-full border-gray-300 text-red-600 focus:ring-red-500"
                                        />
                                        <div className="ml-3">
                                            <div className="font-medium text-gray-800">Cash on Delivery</div>
                                            <div className="text-sm text-gray-600 mt-1">
                                                Pay with cash when your order is delivered
                                            </div>
                                        </div>
                                    </label>

                                    <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                                        data.payment_method === 'card' ? 'border-red-600 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                                    }`}>
                                        <input
                                            type="radio"
                                            name="payment_method"
                                            value="card"
                                            checked={data.payment_method === 'card'}
                                            onChange={(e) => setData('payment_method', e.target.value)}
                                            className="mt-1 rounded-full border-gray-300 text-red-600 focus:ring-red-500"
                                        />
                                        <div className="ml-3">
                                            <div className="font-medium text-gray-800">Credit / Debit Card</div>
                                            <div className="text-sm text-gray-600 mt-1">
                                                Pay securely with your card
                                            </div>
                                        </div>
                                    </label>

                                    <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                                        data.payment_method === 'paypal' ? 'border-red-600 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                                    }`}>
                                        <input
                                            type="radio"
                                            name="payment_method"
                                            value="paypal"
                                            checked={data.payment_method === 'paypal'}
                                            onChange={(e) => setData('payment_method', e.target.value)}
                                            className="mt-1 rounded-full border-gray-300 text-red-600 focus:ring-red-500"
                                        />
                                        <div className="ml-3">
                                            <div className="font-medium text-gray-800">PayPal</div>
                                            <div className="text-sm text-gray-600 mt-1">
                                                Pay with your PayPal account
                                            </div>
                                        </div>
                                    </label>
                                </div>

                                {errors.payment_method && (
                                    <p className="mt-2 text-sm text-red-600">{errors.payment_method}</p>
                                )}
                            </div>

                            {/* Order Notes */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Notes (Optional)</h2>
                                <textarea
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    rows={4}
                                    placeholder="Special instructions for delivery..."
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                />
                            </div>
                        </div>

                        {/* Order Summary Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
                                <h2 className="text-lg font-bold text-gray-800 mb-4">Order Summary</h2>

                                {/* Cart Items */}
                                <div className="mb-4 max-h-64 overflow-y-auto space-y-3">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="flex gap-3 pb-3 border-b border-gray-200 last:border-b-0">
                                            <img
                                                src={`/storage/${item.product.image}`}
                                                alt={item.product.name}
                                                className="w-16 h-16 object-cover rounded border border-gray-200"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-medium text-gray-800 line-clamp-2">
                                                    {item.product.name}
                                                </h4>
                                                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                                {item.selected_services.length > 0 && (
                                                    <p className="text-xs text-gray-500">
                                                        + {item.selected_services.length} service(s)
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-sm font-medium text-gray-800">
                                                {formatPrice(item.product.final_price * item.quantity + item.services_total)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Coupon Code */}
                                <div className="mb-4 pb-4 border-b border-gray-200">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Tag size={16} className="inline mr-1" />
                                        Coupon Code
                                    </label>
                                    {localCartSummary.applied_coupon ? (
                                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
                                            <div>
                                                <span className="text-sm font-medium text-green-800">
                                                    {localCartSummary.applied_coupon.code}
                                                </span>
                                                <span className="text-xs text-green-600 ml-2">
                                                    (-{formatPrice(localCartSummary.applied_coupon.discount_amount)})
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={removeCoupon}
                                                className="text-red-600 hover:text-red-700 text-sm font-medium"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                placeholder="Enter code"
                                                className="flex-1 p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={applyCoupon}
                                                disabled={applyingCoupon || !couponCode.trim()}
                                                className="px-4 py-2 bg-gray-800 text-white rounded text-sm hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {applyingCoupon ? 'Applying...' : 'Apply'}
                                            </button>
                                        </div>
                                    )}
                                    {couponError && (
                                        <p className="mt-2 text-sm text-red-600 flex items-center">
                                            <AlertCircle size={14} className="mr-1" />
                                            {couponError}
                                        </p>
                                    )}
                                </div>

                                {/* Price Breakdown */}
                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Subtotal:</span>
                                        <span>{formatPrice(localCartSummary.subtotal)}</span>
                                    </div>

                                    {localCartSummary.discount_amount > 0 && (
                                        <div className="flex justify-between text-sm text-green-600">
                                            <span>Discount:</span>
                                            <span>-{formatPrice(localCartSummary.discount_amount)}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>VAT ({localCartSummary.tax_rate}%):</span>
                                        <span>{formatPrice(localCartSummary.tax_amount)}</span>
                                    </div>

                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Shipping:</span>
                                        <span>
                                            {localCartSummary.shipping_amount === 0 ? (
                                                <span className="text-green-600 font-medium">FREE</span>
                                            ) : (
                                                formatPrice(localCartSummary.shipping_amount)
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <div className="border-t-2 border-gray-200 pt-4 mb-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-bold text-gray-800">Total:</span>
                                        <span className="text-2xl font-bold text-red-600">
                                            {formatPrice(localCartSummary.total)}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing || !data.billing_address_id || !data.shipping_address_id}
                                    className="w-full bg-red-600 text-white py-3 rounded-md hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? 'Processing...' : 'Place Order'}
                                </button>

                                <div className="mt-4 text-xs text-gray-500 text-center">
                                    By placing your order, you agree to our terms and conditions
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
};

export default CheckoutPage;
