import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Search, Phone, Mail, MessageCircle, ShoppingCart, User, Menu, X, Filter, Star, Truck, Shield, Clock, ArrowRight, CheckCircle, Heart, Loader2 } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import ServiceSelectionModal from '@/components/ServiceSelectionModal';

interface Product {
    id: number;
    name: string;
    slug: string;
    sku: string;
    manufacturer_part_number?: string;
    gc_number?: string;
    price: number;
    sale_price?: number;
    final_price: number;
    discount_percentage: number;
    image: string;
    rating: number;
    reviews_count: number;
    brand: {
        name: string;
        slug: string;
    };
    in_stock: boolean;
    stock_quantity: number;
}

interface Category {
    id: number;
    name: string;
    slug: string;
    icon?: string;
    products_count: number;
}

interface Brand {
    id: number;
    name: string;
    slug: string;
    logo: string;
    products_count: number;
    categories: Category[];
}

interface HomeProps {
    categories: Category[];
    allCategories: Category[];
    brands: Brand[];
    featuredProducts: Product[];
    latestProducts: Product[];
    stats: {
        total_products: number;
        total_brands: number;
        total_categories: number;
    };
    availableServices: {
        id: number;
        name: string;
        description: string | null;
        base_price: number;
        duration_minutes: number;
        type: string;
        is_optional: boolean;
        is_free: boolean;
    }[];
}

const Home: React.FC<HomeProps> = ({
    categories,
    allCategories,
    brands,
    featuredProducts,
    latestProducts,
    stats,
    availableServices
}) => {
    // Get CSRF token from meta tag
    const getCsrfToken = () => {
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    };
    const [selectedBrand, setSelectedBrand] = useState('');
    const [selectedPartType, setSelectedPartType] = useState('');
    const [partNumber, setPartNumber] = useState('');
    const [gcNumber, setGcNumber] = useState('');
    const [availablePartTypes, setAvailablePartTypes] = useState<Category[]>([]);
    const [addingToCart, setAddingToCart] = useState<number | null>(null);
    const [addingToWishlist, setAddingToWishlist] = useState<number | null>(null);
    const [serviceModalOpen, setServiceModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    useEffect(() => {
        if (selectedBrand) {
            const selectedBrandData = brands.find(brand => brand.slug === selectedBrand);
            if (selectedBrandData) {
                setAvailablePartTypes(selectedBrandData.categories);
            }
            setSelectedPartType('');
        } else {
            setAvailablePartTypes(allCategories);
            setSelectedPartType('');
        }
    }, [selectedBrand, brands, allCategories]);

    const handleSearch = (type: 'filter' | 'part_number' | 'gc_number') => {
        const params: Record<string, string> = {};

        switch (type) {
            case 'filter':
                if (selectedBrand) params.brand = selectedBrand;
                if (selectedPartType) params.category = selectedPartType;
                break;
            case 'part_number':
                if (partNumber) params.part_number = partNumber;
                break;
            case 'gc_number':
                if (gcNumber) params.gc_number = gcNumber;
                break;
        }

        router.get('/products', params);
    };

    const handleAddToCart = (productId: number) => {
        console.log('=== Home: handleAddToCart called ===');
        console.log('Product ID:', productId);

        const allProducts = [...featuredProducts, ...latestProducts];
        const product = allProducts.find(p => p.id === productId);

        console.log('Product found:', product ? 'Yes' : 'No');
        if (product) {
            console.log('Product details:', { id: product.id, name: product.name });
            console.log('Opening service modal...');
            setSelectedProduct(product);
            setServiceModalOpen(true);
        } else {
            console.error('Product not found in products list');
        }
    };

    const addToCartWithServices = async (services: any[]) => {
        if (!selectedProduct) return;

        setAddingToCart(selectedProduct.id);
        setServiceModalOpen(false);

        try {
            const response = await fetch('/api/cart/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    product_id: selectedProduct.id,
                    quantity: 1,
                    selected_services: services
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                window.dispatchEvent(new CustomEvent('cartUpdated', {
                    detail: { cartCount: data.cartCount }
                }));
                window.dispatchEvent(new CustomEvent('showToast', {
                    detail: {
                        type: 'success',
                        message: services.length > 0
                            ? `Added to cart with ${services.length} service(s)`
                            : data.message
                    }
                }));
            } else {
                window.dispatchEvent(new CustomEvent('showToast', {
                    detail: { type: 'error', message: data.message || 'Failed to add to cart' }
                }));
            }
        } catch (error) {
            console.error('Add to cart error:', error);
            window.dispatchEvent(new CustomEvent('showToast', {
                detail: { type: 'error', message: 'An error occurred. Please try again.' }
            }));
        } finally {
            setAddingToCart(null);
            setSelectedProduct(null);
        }
    };

    const handleAddToWishlist = async (productId: number) => {
        setAddingToWishlist(productId);
        try {
            const response = await fetch(`/wishlist/add/${productId}`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            const data = await response.json();

            if (response.ok && data.success) {
                window.dispatchEvent(new CustomEvent('showToast', {
                    detail: { type: 'success', message: data.message || 'Added to wishlist' }
                }));
                // Reload to update wishlist count
                router.reload({ only: ['wishlistCount'] });
            } else {
                window.dispatchEvent(new CustomEvent('showToast', {
                    detail: { type: 'error', message: data.message || 'Failed to add to wishlist' }
                }));
            }
        } catch (error) {
            console.error('Add to wishlist error:', error);
            window.dispatchEvent(new CustomEvent('showToast', {
                detail: { type: 'error', message: 'An error occurred. Please try again.' }
            }));
        } finally {
            setAddingToWishlist(null);
        }
    };

    const formatPrice = (price: number): string => {
        return `£${price.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const renderStars = (rating: number) => {
        return [...Array(5)].map((_, i) => (
            <Star
                key={i}
                size={12}
                className={i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
            />
        ));
    };

    const topCategories = categories.slice(0, 6);
    const topBrands = brands.slice(0, 5);
    const selectedBrandName = selectedBrand ? brands.find(b => b.slug === selectedBrand)?.name : '';

    const ProductCard: React.FC<{ product: Product; showNewBadge?: boolean }> = ({ product, showNewBadge = false }) => (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all group">
            <div className="relative">
                <Link href={`/products/${product.slug}`}>
                    <img
                        src={`/storage/${product.image}`}
                        alt={product.name}
                        className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                            e.currentTarget.src = '/storage/products/placeholder-product.jpg';
                        }}
                    />
                </Link>
                {showNewBadge && (
                    <span className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 text-xs rounded font-medium">
                        NEW
                    </span>
                )}
                {!showNewBadge && product.sale_price && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs rounded font-medium">
                        -{product.discount_percentage}%
                    </span>
                )}

                {/* Wishlist Button - Top Right */}
                <button
                    onClick={() => handleAddToWishlist(product.id)}
                    disabled={addingToWishlist === product.id}
                    className="absolute top-2 right-2 bg-white hover:bg-red-50 text-gray-600 hover:text-red-600 p-2 rounded-full shadow-md transition-all disabled:opacity-50"
                    title="Add to Wishlist"
                >
                    {addingToWishlist === product.id ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        <Heart size={16} />
                    )}
                </button>
            </div>

            <div className="p-3">
                <Link href={`/products/${product.slug}`}>
                    <h3 className="text-sm font-semibold text-gray-800 mb-1 line-clamp-2 hover:text-blue-600 leading-tight">
                        {product.name}
                    </h3>
                </Link>
                <p className="text-xs text-gray-500 mb-1">{product.sku}</p>
                <p className="text-xs text-blue-600 mb-2 font-medium">{product.brand.name}</p>

                {product.rating > 0 && (
                    <div className="flex items-center mb-2">
                        <div className="flex items-center">
                            {renderStars(product.rating)}
                        </div>
                        <span className="text-xs text-gray-500 ml-1">({product.reviews_count})</span>
                    </div>
                )}

                <div className="flex items-center justify-between mb-2">
                    <div>
                        {product.sale_price ? (
                            <div className="flex items-center space-x-1">
                                <span className="text-sm font-bold text-green-600">{formatPrice(product.sale_price)}</span>
                                <span className="text-xs text-gray-400 line-through">{formatPrice(product.price)}</span>
                            </div>
                        ) : (
                            <span className="text-sm font-bold text-gray-800">{formatPrice(product.price)}</span>
                        )}
                    </div>
                </div>

                {/* Stock Status */}
                {!product.in_stock ? (
                    <button
                        disabled
                        className="w-full bg-gray-300 text-gray-500 px-3 py-2 rounded text-xs font-medium cursor-not-allowed flex items-center justify-center"
                    >
                        Out of Stock
                    </button>
                ) : product.stock_quantity <= 5 ? (
                    <div>
                        <p className="text-xs text-orange-600 mb-1 font-medium">Only {product.stock_quantity} left!</p>
                        <button
                            onClick={() => handleAddToCart(product.id)}
                            disabled={addingToCart === product.id}
                            className="w-full bg-blue-600 text-white px-3 py-2 rounded text-xs font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-1"
                        >
                            {addingToCart === product.id ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    <span>Adding...</span>
                                </>
                            ) : (
                                <>
                                    <ShoppingCart size={14} />
                                    <span>Add to Cart</span>
                                </>
                            )}
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => handleAddToCart(product.id)}
                        disabled={addingToCart === product.id}
                        className="w-full bg-blue-600 text-white px-3 py-2 rounded text-xs font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-1"
                    >
                        {addingToCart === product.id ? (
                            <>
                                <Loader2 size={14} className="animate-spin" />
                                <span>Adding...</span>
                            </>
                        ) : (
                            <>
                                <ShoppingCart size={14} />
                                <span>Add to Cart</span>
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <AppLayout>
            <Head>
                <title>Boiler Parts Pro - Your Trusted Spare Parts Supplier</title>
                <meta name="description" content="Find quality boiler spare parts from top brands. PCB, Pumps, Valves & More." />
            </Head>

            {/* Hero Section */}
            <section className="relative h-[500px] bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 flex items-center">
                <div className="absolute inset-0 bg-black bg-opacity-60"></div>
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: 'url(/images/boiler-parts-bg.jpg)' }}
                ></div>
                <div className="relative max-w-6xl mx-auto px-4 w-full">
                    <div className="flex items-center justify-between">
                        <div className="w-full lg:w-1/2 text-white">
                            <h1 className="text-3xl lg:text-4xl font-bold mb-3 leading-tight">
                                Find Boiler Spare Parts Fast
                            </h1>
                            <p className="text-base mb-5 text-gray-200 leading-relaxed">
                                Over {stats.total_products.toLocaleString()} genuine parts from {stats.total_brands} trusted brands.
                                PCB, Pumps, Valves & More with fast delivery.
                            </p>
                            <Link
                                href="/products"
                                className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                            >
                                Browse All Parts
                            </Link>
                        </div>

                        {/* Right Search Panel */}
                        <div className="hidden lg:block w-1/2 ml-8">
                            <div className="bg-white rounded-lg p-5 shadow-2xl">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Search</h3>

                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Brand</label>
                                        <select
                                            value={selectedBrand}
                                            onChange={(e) => setSelectedBrand(e.target.value)}
                                            className="w-full p-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Select Brand</option>
                                            {brands.map(brand => (
                                                <option key={brand.id} value={brand.slug}>
                                                    {brand.name} ({brand.products_count} parts)
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                            Part Type
                                            {selectedBrandName && (
                                                <span className="text-blue-600 font-medium"> for {selectedBrandName}</span>
                                            )}
                                        </label>
                                        <select
                                            value={selectedPartType}
                                            onChange={(e) => setSelectedPartType(e.target.value)}
                                            className="w-full p-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">
                                                {selectedBrand ? 'Select Part Type' : 'Select Brand First'}
                                            </option>
                                            {availablePartTypes.map(category => (
                                                <option key={category.id} value={category.slug}>
                                                    {category.name} ({category.products_count} parts)
                                                </option>
                                            ))}
                                        </select>
                                        {selectedBrand && availablePartTypes.length === 0 && (
                                            <p className="text-xs text-red-500 mt-1">No parts available for this brand</p>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleSearch('filter')}
                                    className={`w-full py-2.5 rounded-md text-sm font-medium transition-colors mb-4 ${selectedBrand || selectedPartType
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                    disabled={!selectedBrand && !selectedPartType}
                                >
                                    <Filter className="inline mr-2" size={14} />
                                    {selectedBrand || selectedPartType ? 'Search Parts' : 'Select Brand/Type'}
                                </button>

                                <div className="border-t pt-4">
                                    <div className="text-center mb-3">
                                        <span className="text-sm font-medium text-gray-700">OR Search Directly</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Part Number</label>
                                            <input
                                                type="text"
                                                value={partNumber}
                                                onChange={(e) => setPartNumber(e.target.value)}
                                                placeholder="e.g. 87161213440"
                                                className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                onKeyPress={(e) => e.key === 'Enter' && partNumber && handleSearch('part_number')}
                                            />
                                            <button
                                                onClick={() => handleSearch('part_number')}
                                                className={`w-full py-2 rounded-md mt-2 text-xs font-medium transition-colors ${partNumber
                                                    ? 'bg-gray-600 text-white hover:bg-gray-700'
                                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    }`}
                                                disabled={!partNumber}
                                            >
                                                Search by Part #
                                            </button>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">GC Number</label>
                                            <input
                                                type="text"
                                                value={gcNumber}
                                                onChange={(e) => setGcNumber(e.target.value)}
                                                placeholder="e.g. GC-47-123-456"
                                                className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                onKeyPress={(e) => e.key === 'Enter' && gcNumber && handleSearch('gc_number')}
                                            />
                                            <button
                                                onClick={() => handleSearch('gc_number')}
                                                className={`w-full py-2 rounded-md mt-2 text-xs font-medium transition-colors ${gcNumber
                                                    ? 'bg-gray-600 text-white hover:bg-gray-700'
                                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    }`}
                                                disabled={!gcNumber}
                                            >
                                                Search by GC #
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-8 bg-white border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Truck className="text-blue-600" size={20} />
                            </div>
                            <h3 className="text-sm font-semibold mb-1">Fast Delivery</h3>
                            <p className="text-xs text-gray-600">Quick shipping nationwide</p>
                        </div>
                        <div className="text-center">
                            <div className="bg-green-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                                <CheckCircle className="text-green-600" size={20} />
                            </div>
                            <h3 className="text-sm font-semibold mb-1">{stats.total_products.toLocaleString()}+ Parts</h3>
                            <p className="text-xs text-gray-600">Extensive inventory</p>
                        </div>
                        <div className="text-center">
                            <div className="bg-orange-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Shield className="text-orange-600" size={20} />
                            </div>
                            <h3 className="text-sm font-semibold mb-1">Quality Assured</h3>
                            <p className="text-xs text-gray-600">Genuine parts only</p>
                        </div>
                        <div className="text-center">
                            <div className="bg-purple-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Clock className="text-purple-600" size={20} />
                            </div>
                            <h3 className="text-sm font-semibold mb-1">Expert Support</h3>
                            <p className="text-xs text-gray-600">Technical assistance</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="py-12 bg-gray-50">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Popular Categories</h2>
                            <p className="text-sm text-gray-600">Find parts by category</p>
                        </div>
                        <Link
                            href="/categories"
                            className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center"
                        >
                            View All Categories <ArrowRight className="ml-1" size={16} />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {topCategories.map((category) => (
                            <Link
                                key={category.id}
                                href={`/categories/${category.slug}`}
                                className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-all group border border-gray-100"
                            >
                                <div className="text-2xl mb-2">{category.icon}</div>
                                <h3 className="text-sm font-semibold text-gray-800 mb-1 group-hover:text-blue-600">
                                    {category.name}
                                </h3>
                                <p className="text-xs text-gray-500">{category.products_count} parts</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="py-12 bg-white">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Featured Products</h2>
                            <p className="text-sm text-gray-600">Top quality parts from leading brands</p>
                        </div>
                        <Link
                            href="/products?featured=1"
                            className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center"
                        >
                            View All Featured <ArrowRight className="ml-1" size={16} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {featuredProducts.slice(0, 8).map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Latest Products */}
            {latestProducts.length > 0 && (
                <section className="py-12 bg-gray-50">
                    <div className="max-w-6xl mx-auto px-4">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">Latest Arrivals</h2>
                                <p className="text-sm text-gray-600">Recently added to our inventory</p>
                            </div>
                            <Link
                                href="/products?sort=latest"
                                className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center"
                            >
                                View All Latest <ArrowRight className="ml-1" size={16} />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {latestProducts.map((product) => (
                                <ProductCard key={product.id} product={product} showNewBadge />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Brands */}
            <section className="py-12 bg-white">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Trusted Brands</h2>
                            <p className="text-sm text-gray-600">Genuine parts from leading manufacturers</p>
                        </div>
                        <Link
                            href="/brands"
                            className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center"
                        >
                            View All Brands <ArrowRight className="ml-1" size={16} />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                        {topBrands.map((brand) => (
                            <Link
                                key={brand.id}
                                href={`/brands/${brand.slug}`}
                                className="text-center group"
                            >
                                <div className="bg-gray-50 p-4 rounded-lg hover:shadow-md transition-all border border-gray-100">
                                    <img
                                        src={`/storage/${brand.logo}`}
                                        alt={brand.name}
                                        className="h-12 object-contain mx-auto grayscale group-hover:grayscale-0 transition-all"
                                        onError={(e) => {
                                            e.currentTarget.src = '/storage/brands/placeholder-brand.png';
                                        }}
                                    />
                                </div>
                                <h3 className="mt-2 text-sm font-semibold text-gray-800 group-hover:text-blue-600">
                                    {brand.name}
                                </h3>
                                <p className="text-xs text-gray-500">{brand.products_count} parts</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-12 bg-blue-600">
                <div className="max-w-6xl mx-auto px-4 text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">Can't Find What You Need?</h2>
                    <p className="text-blue-100 mb-6 text-sm">
                        Contact our technical experts for assistance finding the right part for your boiler
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            href="/contact"
                            className="bg-white text-blue-600 px-6 py-2.5 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                            Contact Support
                        </Link>
                        <a
                            href={`https://wa.me/+447832156716`}
                            className="bg-green-500 text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-green-600 transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            WhatsApp Chat
                        </a>
                    </div>
                </div>
            </section>

            {/* Service Selection Modal */}
            <ServiceSelectionModal
                isOpen={serviceModalOpen}
                onClose={() => {
                    setServiceModalOpen(false);
                    setSelectedProduct(null);
                }}
                productId={selectedProduct?.id || null}
                productName={selectedProduct?.name || ''}
                onConfirm={addToCartWithServices}
            />
        </AppLayout>
    );
};

export default Home;
