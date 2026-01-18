import React, { useState, useEffect } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { CreditCard, Truck, MapPin, Tag, AlertCircle, Check } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import ServiceSelection from '@/components/ServiceSelection';

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
    total_services_amount: number;
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
    const [availableProviders, setAvailableProviders] = useState<any[]>([]);
    const [checkingAvailability, setCheckingAvailability] = useState(false);

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
        cart_services: {} as Record<number, any[]>,

        // Service scheduling
        service_date: '',
        service_time: '',
        service_provider_id: null as number | null,
        service_instructions: '',
    });

    const formatPrice = (price: number): string => {
        return `£${price.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // Fetch billing areas when city changes
    useEffect(() => {
        if (data.billing_city_id) {
            console.log('Fetching billing areas for city:', data.billing_city_id);
            setLoadingBillingAreas(true);
            fetch('/checkout/areas-by-city', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ city_id: data.billing_city_id }),
            })
                .then(res => {
                    console.log('Response status:', res.status);
                    if (!res.ok) {
                        throw new Error(`HTTP error! status: ${res.status}`);
                    }
                    return res.json();
                })
                .then(result => {
                    console.log('Billing areas received:', result);
                    setBillingAreas(result.areas || []);
                    setLoadingBillingAreas(false);
                })
                .catch((error) => {
                    console.error('Error fetching billing areas:', error);
                    setLoadingBillingAreas(false);
                });
        } else {
            setBillingAreas([]);
            setData('billing_area_id', '');
        }
    }, [data.billing_city_id]);

    // Fetch shipping areas when city changes
    useEffect(() => {
        if (data.shipping_city_id && !sameAsBilling) {
            console.log('Fetching shipping areas for city:', data.shipping_city_id);
            setLoadingShippingAreas(true);
            fetch('/checkout/areas-by-city', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ city_id: data.shipping_city_id }),
            })
                .then(res => {
                    console.log('Response status:', res.status);
                    if (!res.ok) {
                        throw new Error(`HTTP error! status: ${res.status}`);
                    }
                    return res.json();
                })
                .then(result => {
                    console.log('Shipping areas received:', result);
                    setShippingAreas(result.areas || []);
                    setLoadingShippingAreas(false);
                })
                .catch((error) => {
                    console.error('Error fetching shipping areas:', error);
                    setLoadingShippingAreas(false);
                });
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

    // Check service provider availability
    useEffect(() => {
        if (data.service_date && data.service_time && cartItems.some(item => item.selected_services?.length > 0)) {
            setCheckingAvailability(true);

            const serviceIds = cartItems
                .flatMap(item => item.selected_services || [])
                .map(service => service.id);

            const areaId = data.shipping_area_id || data.billing_area_id;

            console.log('=== Checking Service Provider Availability ===');
            console.log('Service Date:', data.service_date);
            console.log('Service Time:', data.service_time);
            console.log('Service IDs:', serviceIds);
            console.log('Area ID:', areaId);

            fetch('/checkout/check-service-availability', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    service_ids: serviceIds,
                    date: data.service_date,
                    time_slot: data.service_time,
                    area_id: areaId,
                }),
            })
                .then(res => res.json())
                .then(result => {
                    console.log('Available Providers Response:', result);
                    setAvailableProviders(result.available_providers || []);
                    setCheckingAvailability(false);

                    // Auto-select first provider if only one available
                    if (result.available_providers?.length === 1) {
                        setData('service_provider_id', result.available_providers[0].id);
                        console.log('Auto-selected provider:', result.available_providers[0].id);
                    }
                })
                .catch((error) => {
                    console.error('Error checking availability:', error);
                    setAvailableProviders([]);
                    setCheckingAvailability(false);
                });
        } else {
            setAvailableProviders([]);
            setData('service_provider_id', null);
        }
    }, [data.service_date, data.service_time, data.shipping_area_id, data.billing_area_id]);

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

    const handleServiceSelect = (cartItemId: number, services: any[]) => {
        const newCartServices = { ...cartServices, [cartItemId]: services };
        setCartServices(newCartServices);
        setData('cart_services', newCartServices);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        console.log('=== Submitting Checkout ===');
        console.log('Service Date:', data.service_date);
        console.log('Service Time:', data.service_time);
        console.log('Selected Provider ID:', data.service_provider_id);
        console.log('Service Instructions:', data.service_instructions);
        console.log('Complete Form Data:', data);

        // Submit - Inertia will use the data object
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
                            {/* Service Scheduling - Show if ANY services available */}
                            {(cartItems.some(item => item.selected_services && item.selected_services.length > 0) || true) && (
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 shadow-sm p-5">
                                    <div className="flex items-center mb-4">
                                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-2">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">Service Appointment (Optional)</h3>
                                    </div>

                                    {/* Show cart services info for debugging */}
                                    {cartItems.length > 0 && (
                                        <div className="mb-3 text-xs bg-white/60 p-2 rounded">
                                            <p className="font-semibold text-gray-700">Cart Services:</p>
                                            {cartItems.map(item => (
                                                <div key={item.id} className="ml-2 text-gray-600">
                                                    • {item.product.name}: {item.selected_services?.length || 0} service(s)
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Date & Time Selection */}
                                    <div className="space-y-3 mb-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                                Date *
                                            </label>
                                            <input
                                                type="date"
                                                value={data.service_date}
                                                onChange={(e) => setData('service_date', e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                                className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                                Time Slot *
                                            </label>
                                            <select
                                                value={data.service_time}
                                                onChange={(e) => setData('service_time', e.target.value)}
                                                className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                                required
                                            >
                                                <option value="">Select time</option>
                                                <option value="09:00-11:00">9 AM - 11 AM</option>
                                                <option value="11:00-13:00">11 AM - 1 PM</option>
                                                <option value="13:00-15:00">1 PM - 3 PM</option>
                                                <option value="15:00-17:00">3 PM - 5 PM</option>
                                                <option value="17:00-19:00">5 PM - 7 PM</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Available Providers */}
                                    {checkingAvailability ? (
                                        <div className="p-3 bg-white rounded-lg border border-blue-200 text-center">
                                            <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                                            <p className="text-xs text-gray-600">Checking availability...</p>
                                        </div>
                                    ) : data.service_date && data.service_time ? (
                                        availableProviders.length > 0 ? (
                                            <div className="space-y-2">
                                                <p className="text-xs font-semibold text-green-700 flex items-center">
                                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    {availableProviders.length} Technician{availableProviders.length > 1 ? 's' : ''} Available
                                                </p>
                                                <div className="max-h-48 overflow-y-auto space-y-2">
                                                    {availableProviders.map((provider) => (
                                                        <label
                                                            key={provider.id}
                                                            className={`flex items-center justify-between p-3 bg-white rounded-lg border-2 cursor-pointer transition-all hover:border-blue-400 ${
                                                                data.service_provider_id === provider.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                                                            }`}
                                                        >
                                                            <div className="flex items-center flex-1">
                                                                <input
                                                                    type="radio"
                                                                    name="service_provider"
                                                                    value={provider.id}
                                                                    checked={data.service_provider_id === provider.id}
                                                                    onChange={() => setData('service_provider_id', provider.id)}
                                                                    className="w-4 h-4 text-blue-600"
                                                                />
                                                                <div className="ml-2 flex-1">
                                                                    <p className="text-sm font-semibold text-gray-900">{provider.name}</p>
                                                                    <div className="flex items-center text-xs text-gray-600 mt-0.5">
                                                                        <svg className="w-3 h-3 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                        </svg>
                                                                        {provider.rating || '5.0'} • {provider.completed_services || 0} services
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {data.service_provider_id === provider.id && (
                                                                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                </svg>
                                                            )}
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                <p className="text-xs text-yellow-800 flex items-center">
                                                    <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    No technicians available. Try different time.
                                                </p>
                                            </div>
                                        )
                                    ) : (
                                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                            <p className="text-xs text-gray-600 text-center">
                                                Select date & time to see available technicians
                                            </p>
                                        </div>
                                    )}

                                    {/* Service Notes */}
                                    <div className="mt-3">
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                                            Special Instructions (Optional)
                                        </label>
                                        <textarea
                                            rows={2}
                                            value={data.service_instructions}
                                            onChange={(e) => setData('service_instructions', e.target.value)}
                                            className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white"
                                            placeholder="Any requirements..."
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Cart Items */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    Order Summary
                                </h2>
                                <div className="space-y-4">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="border-b border-gray-100 pb-4 last:border-0">
                                            <div className="flex gap-4">
                                                <img
                                                    src={item.product.image}
                                                    alt={item.product.name}
                                                    className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                                />
                                                <div className="flex-1">
                                                    <h3 className="text-sm font-medium text-gray-900 mb-1">{item.product.name}</h3>
                                                    <p className="text-xs text-gray-500 mb-2">Qty: {item.quantity} × {formatPrice(item.product.final_price)}</p>
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {formatPrice(item.product.final_price * item.quantity)}
                                                    </p>

                                                    {/* Services for this item */}
                                                    {item.selected_services && item.selected_services.length > 0 && (
                                                        <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                                                            <p className="text-xs font-semibold text-blue-900 mb-1">Services:</p>
                                                            {item.selected_services.map((service) => (
                                                                <div key={service.id} className="flex justify-between text-xs text-blue-800">
                                                                    <span>• {service.name}</span>
                                                                    <span className="font-medium">{formatPrice(service.price)}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
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
                            <div className="bg-white rounded-xl border-2 border-gray-200 shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                    Price Breakdown
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Products Subtotal</span>
                                        <span className="font-medium">{formatPrice(localCartSummary.subtotal)}</span>
                                    </div>

                                    {localCartSummary.total_services_amount > 0 && (
                                        <div className="flex justify-between text-sm bg-blue-50 -mx-2 px-2 py-2 rounded">
                                            <span className="text-blue-700 font-medium">Services Total</span>
                                            <span className="font-semibold text-blue-700">{formatPrice(localCartSummary.total_services_amount)}</span>
                                        </div>
                                    )}

                                    {localCartSummary.discount_amount > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Discount</span>
                                            <span className="font-medium text-green-600">
                                                -{formatPrice(localCartSummary.discount_amount)}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Delivery Charge</span>
                                        <span className="font-medium">{formatPrice(localCartSummary.shipping_amount)}</span>
                                    </div>

                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">VAT ({localCartSummary.tax_rate * 100}%)</span>
                                        <span className="font-medium">{formatPrice(localCartSummary.tax_amount)}</span>
                                    </div>

                                    <div className="border-t-2 border-gray-300 pt-4 mt-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-bold text-gray-900">Total Amount</span>
                                            <div className="text-right">
                                                <span className="text-2xl font-bold text-blue-600">
                                                    {formatPrice(localCartSummary.total)}
                                                </span>
                                                <p className="text-xs text-gray-500 mt-1">Inc. VAT</p>
                                            </div>
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
