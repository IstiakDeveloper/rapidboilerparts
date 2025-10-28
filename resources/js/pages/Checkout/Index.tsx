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
    cities: City[];
    user: User;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ cartItems, cartSummary, cities, user }) => {
    const [couponCode, setCouponCode] = useState('');
    const [applyingCoupon, setApplyingCoupon] = useState(false);
    const [couponError, setCouponError] = useState('');
    const [localCartSummary, setLocalCartSummary] = useState(cartSummary);
    const [sameAsBilling, setSameAsBilling] = useState(false);

    // Areas state
    const [billingAreas, setBillingAreas] = useState<Area[]>([]);
    const [shippingAreas, setShippingAreas] = useState<Area[]>([]);
    const [loadingBillingAreas, setLoadingBillingAreas] = useState(false);
    const [loadingShippingAreas, setLoadingShippingAreas] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        // Billing
        billing_first_name: user.first_name || '',
        billing_last_name: user.last_name || '',
        billing_phone: user.phone || '',
        billing_city_id: '',
        billing_area_id: '',
        billing_address: '',

        // Shipping
        shipping_first_name: user.first_name || '',
        shipping_last_name: user.last_name || '',
        shipping_phone: user.phone || '',
        shipping_city_id: '',
        shipping_area_id: '',
        shipping_address: '',

        payment_method: 'cod',
        notes: '',
    });

    const formatPrice = (price: number): string => {
        return `£${price.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // Fetch billing areas when city changes
    useEffect(() => {
        if (data.billing_city_id) {
            setLoadingBillingAreas(true);
            fetch('/checkout/areas-by-city', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ city_id: data.billing_city_id }),
            })
                .then(res => res.json())
                .then(result => {
                    setBillingAreas(result.areas || []);
                    setLoadingBillingAreas(false);
                })
                .catch(() => setLoadingBillingAreas(false));
        } else {
            setBillingAreas([]);
            setData('billing_area_id', '');
        }
    }, [data.billing_city_id]);

    // Fetch shipping areas when city changes
    useEffect(() => {
        if (data.shipping_city_id && !sameAsBilling) {
            setLoadingShippingAreas(true);
            fetch('/checkout/areas-by-city', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ city_id: data.shipping_city_id }),
            })
                .then(res => res.json())
                .then(result => {
                    setShippingAreas(result.areas || []);
                    setLoadingShippingAreas(false);
                })
                .catch(() => setLoadingShippingAreas(false));
        } else if (!sameAsBilling) {
            setShippingAreas([]);
            setData('shipping_area_id', '');
        }
    }, [data.shipping_city_id, sameAsBilling]);

    // Handle "Same as billing" checkbox
    useEffect(() => {
        if (sameAsBilling) {
            setData(prev => ({
                ...prev,
                shipping_first_name: data.billing_first_name,
                shipping_last_name: data.billing_last_name,
                shipping_phone: data.billing_phone,
                shipping_city_id: data.billing_city_id,
                shipping_area_id: data.billing_area_id,
                shipping_address: data.billing_address,
            }));
            setShippingAreas(billingAreas);
        }
    }, [sameAsBilling]);

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

    return (
        <AppLayout>
            <Head title="Checkout" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Address Forms */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Billing Address */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                                    <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                                    Billing Details
                                </h2>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                First Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={data.billing_first_name}
                                                onChange={(e) => setData('billing_first_name', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            />
                                            {errors.billing_first_name && (
                                                <p className="mt-1 text-sm text-red-600">{errors.billing_first_name}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Last Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={data.billing_last_name}
                                                onChange={(e) => setData('billing_last_name', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            />
                                            {errors.billing_last_name && (
                                                <p className="mt-1 text-sm text-red-600">{errors.billing_last_name}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone Number *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.billing_phone}
                                            onChange={(e) => setData('billing_phone', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="+44 7XXX XXXXXX"
                                            required
                                        />
                                        {errors.billing_phone && (
                                            <p className="mt-1 text-sm text-red-600">{errors.billing_phone}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                City *
                                            </label>
                                            <select
                                                value={data.billing_city_id}
                                                onChange={(e) => setData('billing_city_id', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            >
                                                <option value="">Select city</option>
                                                {cities.map(city => (
                                                    <option key={city.id} value={city.id}>
                                                        {city.name} ({city.region})
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.billing_city_id && (
                                                <p className="mt-1 text-sm text-red-600">{errors.billing_city_id}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Area *
                                            </label>
                                            <select
                                                value={data.billing_area_id}
                                                onChange={(e) => setData('billing_area_id', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                disabled={!data.billing_city_id || loadingBillingAreas}
                                                required
                                            >
                                                <option value="">
                                                    {loadingBillingAreas ? 'Loading...' : !data.billing_city_id ? 'Select city first' : 'Select area'}
                                                </option>
                                                {billingAreas.map(area => (
                                                    <option key={area.id} value={area.id}>
                                                        {area.name} {area.postcode && `(${area.postcode})`}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.billing_area_id && (
                                                <p className="mt-1 text-sm text-red-600">{errors.billing_area_id}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Address *
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={data.billing_address}
                                            onChange={(e) => setData('billing_address', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                            placeholder="Street address, building number, etc."
                                            required
                                        />
                                        {errors.billing_address && (
                                            <p className="mt-1 text-sm text-red-600">{errors.billing_address}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                                        <Truck className="w-5 h-5 mr-2 text-blue-600" />
                                        Shipping Details
                                    </h2>
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={sameAsBilling}
                                            onChange={(e) => setSameAsBilling(e.target.checked)}
                                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Same as billing</span>
                                    </label>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                First Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={data.shipping_first_name}
                                                onChange={(e) => setData('shipping_first_name', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                disabled={sameAsBilling}
                                                required
                                            />
                                            {errors.shipping_first_name && (
                                                <p className="mt-1 text-sm text-red-600">{errors.shipping_first_name}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Last Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={data.shipping_last_name}
                                                onChange={(e) => setData('shipping_last_name', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                disabled={sameAsBilling}
                                                required
                                            />
                                            {errors.shipping_last_name && (
                                                <p className="mt-1 text-sm text-red-600">{errors.shipping_last_name}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone Number *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.shipping_phone}
                                            onChange={(e) => setData('shipping_phone', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="+44 7XXX XXXXXX"
                                            disabled={sameAsBilling}
                                            required
                                        />
                                        {errors.shipping_phone && (
                                            <p className="mt-1 text-sm text-red-600">{errors.shipping_phone}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                City *
                                            </label>
                                            <select
                                                value={data.shipping_city_id}
                                                onChange={(e) => setData('shipping_city_id', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                disabled={sameAsBilling}
                                                required
                                            >
                                                <option value="">Select city</option>
                                                {cities.map(city => (
                                                    <option key={city.id} value={city.id}>
                                                        {city.name} ({city.region})
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.shipping_city_id && (
                                                <p className="mt-1 text-sm text-red-600">{errors.shipping_city_id}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Area *
                                            </label>
                                            <select
                                                value={data.shipping_area_id}
                                                onChange={(e) => setData('shipping_area_id', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                disabled={sameAsBilling || !data.shipping_city_id || loadingShippingAreas}
                                                required
                                            >
                                                <option value="">
                                                    {loadingShippingAreas ? 'Loading...' : !data.shipping_city_id ? 'Select city first' : 'Select area'}
                                                </option>
                                                {shippingAreas.map(area => (
                                                    <option key={area.id} value={area.id}>
                                                        {area.name} {area.postcode && `(${area.postcode})`}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.shipping_area_id && (
                                                <p className="mt-1 text-sm text-red-600">{errors.shipping_area_id}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Address *
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={data.shipping_address}
                                            onChange={(e) => setData('shipping_address', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                            placeholder="Street address, building number, etc."
                                            disabled={sameAsBilling}
                                            required
                                        />
                                        {errors.shipping_address && (
                                            <p className="mt-1 text-sm text-red-600">{errors.shipping_address}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                                    <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                                    Payment Method
                                </h2>

                                <div className="space-y-3">
                                    <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                                        <input
                                            type="radio"
                                            name="payment_method"
                                            value="cod"
                                            checked={data.payment_method === 'cod'}
                                            onChange={(e) => setData('payment_method', e.target.value as any)}
                                            className="w-4 h-4 text-blue-600"
                                        />
                                        <span className="ml-3 font-medium">Cash on Delivery</span>
                                    </label>
                                    <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition-colors opacity-50">
                                        <input
                                            type="radio"
                                            name="payment_method"
                                            value="card"
                                            disabled
                                            className="w-4 h-4 text-blue-600"
                                        />
                                        <span className="ml-3 font-medium">Card Payment (Coming Soon)</span>
                                    </label>
                                </div>
                            </div>

                            {/* Order Notes */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Order Notes (Optional)
                                </label>
                                <textarea
                                    rows={3}
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                    placeholder="Any special instructions for your order..."
                                />
                            </div>
                        </div>

                        {/* Right Column - Order Summary */}
                        <div className="space-y-6">
                            {/* Cart Items */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
                                <div className="space-y-4">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="flex gap-4">
                                            <img
                                                src={item.product.image}
                                                alt={item.product.name}
                                                className="w-16 h-16 object-cover rounded-lg"
                                            />
                                            <div className="flex-1">
                                                <h3 className="text-sm font-medium text-gray-900">{item.product.name}</h3>
                                                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {formatPrice(item.product.final_price * item.quantity)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Coupon */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Coupon Code
                                </label>
                                {localCartSummary.applied_coupon ? (
                                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="flex items-center">
                                            <Check className="w-5 h-5 text-green-600 mr-2" />
                                            <span className="text-sm font-medium text-green-900">
                                                {localCartSummary.applied_coupon.code}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={removeCoupon}
                                            className="text-sm text-red-600 hover:text-red-700"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value)}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Enter code"
                                        />
                                        <button
                                            type="button"
                                            onClick={applyCoupon}
                                            disabled={applyingCoupon}
                                            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                                        >
                                            {applyingCoupon ? 'Applying...' : 'Apply'}
                                        </button>
                                    </div>
                                )}
                                {couponError && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center">
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        {couponError}
                                    </p>
                                )}
                            </div>

                            {/* Price Summary */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-medium">{formatPrice(localCartSummary.subtotal)}</span>
                                    </div>
                                    {localCartSummary.discount_amount > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Discount</span>
                                            <span className="font-medium text-green-600">
                                                -{formatPrice(localCartSummary.discount_amount)}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Tax ({localCartSummary.tax_rate}%)</span>
                                        <span className="font-medium">{formatPrice(localCartSummary.tax_amount)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Shipping</span>
                                        <span className="font-medium">{formatPrice(localCartSummary.shipping_amount)}</span>
                                    </div>
                                    <div className="border-t pt-3">
                                        <div className="flex justify-between">
                                            <span className="text-lg font-semibold">Total</span>
                                            <span className="text-lg font-bold text-blue-600">
                                                {formatPrice(localCartSummary.total)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Place Order Button */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                {processing ? 'Processing...' : 'Place Order'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
};

export default CheckoutPage;
