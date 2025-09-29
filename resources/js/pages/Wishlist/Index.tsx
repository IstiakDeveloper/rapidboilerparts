import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Heart, ShoppingCart, Trash2, Star } from 'lucide-react';
import AppLayout from '@/layouts/CustomerLayout';

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
    rating: number;
    reviews_count: number;
}

interface WishlistItem {
    id: number;
    added_at: string;
    product: Product;
}

interface WishlistPageProps {
    wishlistItems: WishlistItem[];
}

const WishlistPage: React.FC<WishlistPageProps> = ({ wishlistItems }) => {
    const formatPrice = (price: number): string => {
        return `£${price.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const renderStars = (rating: number) => {
        return [...Array(5)].map((_, i) => (
            <Star
                key={i}
                size={14}
                className={i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
            />
        ));
    };

    const removeFromWishlist = (itemId: number) => {
        if (confirm('Remove this item from your wishlist?')) {
            router.delete(`/wishlist/${itemId}`, {
                preserveScroll: true,
            });
        }
    };

    const moveToCart = (itemId: number) => {
        router.post(`/wishlist/${itemId}/move-to-cart`, {}, {
            preserveScroll: true,
        });
    };

    const clearWishlist = () => {
        if (confirm('Are you sure you want to clear your entire wishlist?')) {
            router.delete('/wishlist', {
                preserveScroll: true,
            });
        }
    };

    if (wishlistItems.length === 0) {
        return (
            <AppLayout>
                <Head title="My Wishlist - RapidBoilerParts" />

                <div className="max-w-7xl mx-auto px-4 py-12">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <Heart size={64} className="mx-auto text-gray-400 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Wishlist is Empty</h2>
                        <p className="text-gray-600 mb-6">
                            Save your favorite products here to keep track of them.
                        </p>
                        <Link
                            href="/products"
                            className="inline-flex items-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors"
                        >
                            <span>Browse Products</span>
                        </Link>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Head title="My Wishlist - RapidBoilerParts" />

            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800">
                        My Wishlist ({wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'})
                    </h1>
                    <button
                        onClick={clearWishlist}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                        Clear Wishlist
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {wishlistItems.map((item) => (
                        <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
                            <div className="relative">
                                <Link href={`/products/${item.product.slug}`}>
                                    <img
                                        src={`/storage/${item.product.image}`}
                                        alt={item.product.name}
                                        className="w-full aspect-square object-cover"
                                        onError={(e) => {
                                            e.currentTarget.src = '/storage/products/placeholder-product.jpg';
                                        }}
                                    />
                                </Link>
                                {item.product.discount_percentage > 0 && (
                                    <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
                                        -{item.product.discount_percentage}%
                                    </div>
                                )}
                                {!item.product.in_stock && (
                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                        <span className="bg-white text-gray-800 px-3 py-1 rounded text-sm font-medium">
                                            Out of Stock
                                        </span>
                                    </div>
                                )}
                                <button
                                    onClick={() => removeFromWishlist(item.id)}
                                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors group"
                                    title="Remove from wishlist"
                                >
                                    <Heart size={18} className="text-red-600 fill-current" />
                                </button>
                            </div>

                            <div className="p-4">
                                <p className="text-xs text-gray-500 mb-1">{item.product.brand.name}</p>
                                <h3 className="font-medium text-gray-800 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                                    <Link href={`/products/${item.product.slug}`}>
                                        {item.product.name}
                                    </Link>
                                </h3>

                                <p className="text-xs text-gray-500 mb-2">SKU: {item.product.sku}</p>

                                {item.product.rating > 0 && (
                                    <div className="flex items-center mb-3">
                                        <div className="flex items-center">
                                            {renderStars(item.product.rating)}
                                        </div>
                                        <span className="text-xs text-gray-500 ml-1">
                                            ({item.product.reviews_count})
                                        </span>
                                    </div>
                                )}

                                <div className="mb-3">
                                    {item.product.sale_price ? (
                                        <div className="flex items-center space-x-2">
                                            <span className="text-lg font-bold text-red-600">
                                                {formatPrice(item.product.final_price)}
                                            </span>
                                            <span className="text-sm text-gray-500 line-through">
                                                {formatPrice(item.product.price)}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-lg font-bold text-gray-800">
                                            {formatPrice(item.product.price)}
                                        </span>
                                    )}
                                </div>

                                <p className="text-xs text-gray-500 mb-3">
                                    Added on {item.added_at}
                                </p>

                                {item.product.in_stock ? (
                                    <button
                                        onClick={() => moveToCart(item.id)}
                                        className="w-full flex items-center justify-center space-x-2 bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                                    >
                                        <ShoppingCart size={16} />
                                        <span>Add to Cart</span>
                                    </button>
                                ) : (
                                    <button
                                        disabled
                                        className="w-full bg-gray-300 text-gray-500 py-2 rounded-md cursor-not-allowed text-sm font-medium"
                                    >
                                        Out of Stock
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
};

export default WishlistPage;
