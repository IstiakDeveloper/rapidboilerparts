import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, X } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';

interface SelectedService {
    id: number;
    name: string;
    price: number;
    is_free: boolean;
}

interface Product {
    id: number;
    name: string;
    slug: string;
    sku: string;
    price: number;
    sale_price: number | null;
    final_price: number;
    discount_percentage: number;
    stock_quantity: number;
    in_stock: boolean;
    image: string;
    brand: {
        name: string;
        slug: string;
    };
}

interface CartItem {
    id: number;
    quantity: number;
    selected_services: SelectedService[];
    services_total: number;
    item_total: number;
    product: Product;
}

interface CartSummary {
    subtotal: number;
    tax_rate: number;
    tax_amount: number;
    shipping_amount: number;
    total: number;
    total_items: number;
    total_services_amount: number;
    free_shipping_threshold: number;
    amount_for_free_shipping: number;
}

interface CartPageProps {
    cartItems: CartItem[];
    cartSummary: CartSummary;
}

const CartPage: React.FC<CartPageProps> = ({ cartItems, cartSummary }) => {
    const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());

    const formatPrice = (price: number): string => {
        return `£${price.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const updateQuantity = (itemId: number, newQuantity: number) => {
        if (newQuantity < 1) return;

        setUpdatingItems(prev => new Set(prev).add(itemId));

        router.patch(`/cart/${itemId}`,
            { quantity: newQuantity },
            {
                preserveScroll: true,
                onFinish: () => {
                    setUpdatingItems(prev => {
                        const next = new Set(prev);
                        next.delete(itemId);
                        return next;
                    });
                },
            }
        );
    };

    const removeItem = (itemId: number) => {
        if (confirm('Are you sure you want to remove this item?')) {
            router.delete(`/cart/${itemId}`, {
                preserveScroll: true,
            });
        }
    };

    const clearCart = () => {
        if (confirm('Are you sure you want to clear your entire cart?')) {
            router.delete('/cart', {
                preserveScroll: true,
            });
        }
    };

    if (cartItems.length === 0) {
        return (
            <AppLayout>
                <Head title="Shopping Cart - RapidBoilerParts" />

                <div className="max-w-7xl mx-auto px-4 py-12">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <ShoppingBag size={64} className="mx-auto text-gray-400 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Cart is Empty</h2>
                        <p className="text-gray-600 mb-6">
                            Looks like you haven't added any products to your cart yet.
                        </p>
                        <Link
                            href="/products"
                            className="inline-flex items-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors"
                        >
                            <span>Continue Shopping</span>
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Head title="Shopping Cart - RapidBoilerParts" />

            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800">
                        Shopping Cart ({cartSummary.total_items} {cartSummary.total_items === 1 ? 'item' : 'items'})
                    </h1>
                    <button
                        onClick={clearCart}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                        Clear Cart
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item) => (
                            <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                <div className="flex gap-4">
                                    {/* Product Image */}
                                    <Link href={`/products/${item.product.slug}`} className="flex-shrink-0">
                                        <img
                                            src={`/storage/${item.product.image}`}
                                            alt={item.product.name}
                                            className="w-24 h-24 object-cover rounded border border-gray-200"
                                            onError={(e) => {
                                                e.currentTarget.src = '/storage/products/placeholder-product.jpg';
                                            }}
                                        />
                                    </Link>

                                    {/* Product Details */}
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <div>
                                                <Link
                                                    href={`/products/${item.product.slug}`}
                                                    className="font-medium text-gray-800 hover:text-red-600 line-clamp-2"
                                                >
                                                    {item.product.name}
                                                </Link>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Brand: {item.product.brand.name}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    SKU: {item.product.sku}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="text-gray-400 hover:text-red-600 transition-colors"
                                                title="Remove item"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>

                                        {/* Selected Services */}
                                        {item.selected_services.length > 0 && (
                                            <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                                                <p className="font-medium text-gray-700 mb-1">Added Services:</p>
                                                {item.selected_services.map((service) => (
                                                    <div key={service.id} className="flex justify-between text-gray-600">
                                                        <span>• {service.name}</span>
                                                        <span>{service.is_free ? 'FREE' : formatPrice(service.price)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Price and Quantity */}
                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    disabled={item.quantity <= 1 || updatingItems.has(item.id)}
                                                    className="p-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className="w-12 text-center font-medium">
                                                    {updatingItems.has(item.id) ? '...' : item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    disabled={item.quantity >= item.product.stock_quantity || updatingItems.has(item.id)}
                                                    className="p-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                                <span className="text-xs text-gray-500 ml-2">
                                                    Max: {item.product.stock_quantity}
                                                </span>
                                            </div>

                                            <div className="text-right">
                                                {item.product.sale_price && (
                                                    <div className="text-sm text-gray-500 line-through">
                                                        {formatPrice(item.product.price * item.quantity)}
                                                    </div>
                                                )}
                                                <div className="text-lg font-bold text-gray-800">
                                                    {formatPrice(item.item_total)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Stock Warning */}
                                        {item.product.stock_quantity <= 5 && (
                                            <div className="mt-2 text-sm text-orange-600">
                                                Only {item.product.stock_quantity} left in stock!
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">Order Summary</h2>

                            <div className="space-y-3 mb-4">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal:</span>
                                    <span>{formatPrice(cartSummary.subtotal)}</span>
                                </div>

                                {cartSummary.total_services_amount > 0 && (
                                    <div className="flex justify-between text-gray-600 text-sm">
                                        <span>Services:</span>
                                        <span>{formatPrice(cartSummary.total_services_amount)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between text-gray-600">
                                    <span>VAT ({cartSummary.tax_rate}%):</span>
                                    <span>{formatPrice(cartSummary.tax_amount)}</span>
                                </div>

                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping:</span>
                                    <span>
                                        {cartSummary.shipping_amount === 0 ? (
                                            <span className="text-green-600 font-medium">FREE</span>
                                        ) : (
                                            formatPrice(cartSummary.shipping_amount)
                                        )}
                                    </span>
                                </div>

                                {cartSummary.amount_for_free_shipping > 0 && (
                                    <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                                        Add {formatPrice(cartSummary.amount_for_free_shipping)} more for FREE shipping!
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-gray-200 pt-4 mb-6">
                                <div className="flex justify-between text-lg font-bold text-gray-800">
                                    <span>Total:</span>
                                    <span className="text-red-600">{formatPrice(cartSummary.total)}</span>
                                </div>
                            </div>

                            <Link
                                href="/checkout"
                                className="block w-full bg-red-600 text-white text-center py-3 rounded-md hover:bg-red-700 transition-colors font-medium mb-3"
                            >
                                Proceed to Checkout
                            </Link>

                            <Link
                                href="/products"
                                className="block w-full border border-gray-300 text-gray-700 text-center py-3 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                Continue Shopping
                            </Link>

                            {/* Trust Badges */}
                            <div className="mt-6 pt-6 border-t border-gray-200 space-y-2 text-sm text-gray-600">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Secure Checkout
                                </div>
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Fast UK Delivery
                                </div>
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    100% Genuine Parts
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default CartPage;
