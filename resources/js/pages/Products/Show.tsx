import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    ShoppingCart, Heart, Share2, Star, ChevronLeft, ChevronRight,
    Check, Package, Truck, Shield, Info, Plus, Minus, AlertCircle
} from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';

interface ProductImage {
    id: number;
    image_path: string;
    alt_text: string;
    is_primary: boolean;
    sort_order: number;
}

interface ProductService {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    type: string;
    price: number;
    is_free: boolean;
    is_mandatory: boolean;
    is_optional: boolean;
}

interface Attribute {
    id: number;
    name: string;
    slug: string;
    value: string;
    type: string;
}

interface CompatibleModel {
    id: number;
    model_name: string;
    model_code: string | null;
    year_from: number | null;
    year_to: number | null;
    year_range: string | null;
}

interface CompatibleBrand {
    brand: string;
    models: CompatibleModel[];
}

interface Product {
    id: number;
    name: string;
    slug: string;
    sku: string;
    manufacturer_part_number: string | null;
    gc_number: string | null;
    short_description: string | null;
    description: string | null;
    price: number;
    sale_price: number | null;
    cost_price: number | null;
    final_price: number;
    discount_percentage: number;
    stock_quantity: number;
    in_stock: boolean;
    low_stock_threshold: number;
    is_featured: boolean;
    manage_stock: boolean;
    weight: number | null;
    dimensions: {
        length: number | null;
        width: number | null;
        height: number | null;
    };
    brand: {
        id: number;
        name: string;
        slug: string;
        logo: string | null;
        website: string | null;
    };
    category: {
        id: number;
        name: string;
        slug: string;
    };
    images: ProductImage[];
    primary_image: string;
    attributes: Attribute[];
    compatible_models: CompatibleBrand[];
    rating: number;
    reviews_count: number;
    rating_breakdown: {
        [key: number]: number;
    };
    meta_title: string | null;
    meta_description: string | null;
    created_at: string;
    updated_at: string;
}

interface Review {
    id: number;
    rating: number;
    title: string | null;
    comment: string | null;
    user_name: string;
    created_at: string;
    formatted_date: string;
}

interface RelatedProduct {
    id: number;
    name: string;
    slug: string;
    price: number;
    sale_price: number | null;
    final_price: number;
    discount_percentage: number;
    image: string;
    brand: {
        name: string;
        slug: string;
    };
    rating: number;
    in_stock: boolean;
}

interface ShowProps {
    product: Product;
    services: ProductService[];
    reviews: Review[];
    relatedProducts: RelatedProduct[];
}

const ProductShow: React.FC<ShowProps> = ({ product, services, reviews, relatedProducts }) => {
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [selectedServices, setSelectedServices] = useState<number[]>(
        services.filter(s => s.is_mandatory).map(s => s.id)
    );
    const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'compatibility' | 'reviews'>('description');

    const formatPrice = (price: number): string => {
        return `£${price.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const renderStars = (rating: number, size: number = 16) => {
        return [...Array(5)].map((_, i) => (
            <Star
                key={i}
                size={size}
                className={i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
            />
        ));
    };

    const handleQuantityChange = (delta: number) => {
        const newQty = Math.max(1, Math.min(product.stock_quantity, quantity + delta));
        setQuantity(newQty);
    };

    const toggleService = (serviceId: number, isMandatory: boolean) => {
        if (isMandatory) return;

        setSelectedServices(prev =>
            prev.includes(serviceId)
                ? prev.filter(id => id !== serviceId)
                : [...prev, serviceId]
        );
    };

    const calculateTotal = () => {
        const productTotal = product.final_price * quantity;
        const servicesTotal = services
            .filter(s => selectedServices.includes(s.id))
            .reduce((sum, s) => sum + s.price, 0);
        return productTotal + servicesTotal;
    };

    const handleAddToCart = () => {
        router.post('/cart/add', {
            product_id: product.id,
            quantity,
            selected_services: selectedServices,
        });
    };

    const getRatingPercentage = (rating: number) => {
        if (product.reviews_count === 0) return 0;
        return (product.rating_breakdown[rating] / product.reviews_count) * 100;
    };

    return (
        <AppLayout>
            <Head>
                <title>{product.meta_title || `${product.name} - RapidBoilerParts`}</title>
                <meta name="description" content={product.meta_description || product.short_description || ''} />
            </Head>

            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Breadcrumb */}
                <nav className="mb-6 text-sm">
                    <ol className="flex items-center space-x-2 text-gray-500">
                        <li><Link href="/" className="hover:text-red-600">Home</Link></li>
                        <li>/</li>
                        <li><Link href="/products" className="hover:text-red-600">Products</Link></li>
                        <li>/</li>
                        <li><Link href={`/categories/${product.category.slug}`} className="hover:text-red-600">{product.category.name}</Link></li>
                        <li>/</li>
                        <li className="text-gray-800 truncate max-w-xs">{product.name}</li>
                    </ol>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* Product Images */}
                    <div>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
                            <div className="relative aspect-square">
                                <img
                                    src={`/storage/${product.images[selectedImage]?.image_path || product.primary_image}`}
                                    alt={product.images[selectedImage]?.alt_text || product.name}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                        e.currentTarget.src = '/storage/products/placeholder-product.jpg';
                                    }}
                                />
                                {product.discount_percentage > 0 && (
                                    <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded text-sm font-medium">
                                        -{product.discount_percentage}% OFF
                                    </div>
                                )}
                                {product.is_featured && (
                                    <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded text-sm font-medium">
                                        Featured
                                    </div>
                                )}
                            </div>
                        </div>

                        {product.images.length > 1 && (
                            <div className="grid grid-cols-5 gap-2">
                                {product.images.map((img, idx) => (
                                    <button
                                        key={img.id}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`border-2 rounded-lg overflow-hidden transition-all ${selectedImage === idx ? 'border-red-600' : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <img
                                            src={`/storage/${img.image_path}`}
                                            alt={img.alt_text}
                                            className="w-full aspect-square object-contain"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="mb-4">
                                <Link href={`/brands/${product.brand.slug}`} className="text-sm text-gray-500 hover:text-red-600 flex items-center">
                                    {product.brand.logo && (
                                        <img src={`/storage/${product.brand.logo}`} alt={product.brand.name} className="h-6 mr-2" />
                                    )}
                                    {product.brand.name}
                                </Link>
                            </div>

                            <h1 className="text-2xl font-bold text-gray-800 mb-4">{product.name}</h1>

                            {product.rating > 0 && (
                                <div className="flex items-center mb-4">
                                    <div className="flex items-center">
                                        {renderStars(product.rating, 18)}
                                    </div>
                                    <span className="ml-2 text-sm text-gray-600">
                                        {product.rating.toFixed(1)} ({product.reviews_count} {product.reviews_count === 1 ? 'review' : 'reviews'})
                                    </span>
                                </div>
                            )}

                            <div className="mb-6">
                                <div className="flex items-baseline space-x-3 mb-2">
                                    {product.sale_price ? (
                                        <>
                                            <span className="text-3xl font-bold text-red-600">
                                                {formatPrice(product.final_price)}
                                            </span>
                                            <span className="text-xl text-gray-500 line-through">
                                                {formatPrice(product.price)}
                                            </span>
                                            <span className="text-sm text-white bg-red-600 px-2 py-1 rounded">
                                                Save {formatPrice(product.price - product.final_price)}
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-3xl font-bold text-gray-800">
                                            {formatPrice(product.price)}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500">Price includes VAT</p>
                            </div>

                            {/* Stock Status */}
                            <div className="mb-6">
                                {product.in_stock ? (
                                    product.stock_quantity > product.low_stock_threshold ? (
                                        <div className="flex items-center text-green-600">
                                            <Check size={18} className="mr-2" />
                                            <span className="font-medium">In Stock</span>
                                            {product.manage_stock && (
                                                <span className="ml-2 text-sm text-gray-500">
                                                    ({product.stock_quantity} available)
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex items-center text-orange-600">
                                            <AlertCircle size={18} className="mr-2" />
                                            <span className="font-medium">Low Stock - Only {product.stock_quantity} left!</span>
                                        </div>
                                    )
                                ) : (
                                    <div className="flex items-center text-red-600 font-medium">
                                        <Info size={18} className="mr-2" />
                                        <span>Out of Stock</span>
                                    </div>
                                )}
                            </div>

                            {/* Product Codes */}
                            <div className="mb-6 space-y-2 text-sm bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center">
                                    <span className="text-gray-500 w-32">SKU:</span>
                                    <span className="font-medium">{product.sku}</span>
                                </div>
                                {product.manufacturer_part_number && (
                                    <div className="flex items-center">
                                        <span className="text-gray-500 w-32">Part Number:</span>
                                        <span className="font-medium">{product.manufacturer_part_number}</span>
                                    </div>
                                )}
                                {product.gc_number && (
                                    <div className="flex items-center">
                                        <span className="text-gray-500 w-32">GC Number:</span>
                                        <span className="font-medium">{product.gc_number}</span>
                                    </div>
                                )}
                                <div className="flex items-center">
                                    <span className="text-gray-500 w-32">Category:</span>
                                    <Link href={`/categories/${product.category.slug}`} className="font-medium hover:text-red-600">
                                        {product.category.name}
                                    </Link>
                                </div>
                            </div>

                            {product.short_description && (
                                <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                                    <p className="text-gray-700">{product.short_description}</p>
                                </div>
                            )}

                            {/* Services */}
                            {services.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                                        <Package size={18} className="mr-2" />
                                        Additional Services
                                    </h3>
                                    <div className="space-y-2">
                                        {services.map(service => (
                                            <label
                                                key={service.id}
                                                className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${selectedServices.includes(service.id)
                                                        ? 'border-red-600 bg-red-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                    } ${service.is_mandatory ? 'opacity-75 cursor-not-allowed' : ''}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedServices.includes(service.id)}
                                                    onChange={() => toggleService(service.id, service.is_mandatory)}
                                                    disabled={service.is_mandatory}
                                                    className="mt-1 rounded border-gray-300 text-red-600 focus:ring-red-500"
                                                />
                                                <div className="ml-3 flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-medium text-gray-800">
                                                            {service.name}
                                                            {service.is_mandatory && (
                                                                <span className="ml-2 text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">Required</span>
                                                            )}
                                                        </span>
                                                        <span className={`font-semibold ${service.is_free ? 'text-green-600' : 'text-gray-800'}`}>
                                                            {service.is_free ? 'FREE' : formatPrice(service.price)}
                                                        </span>
                                                    </div>
                                                    {service.description && (
                                                        <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                                                    )}
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quantity Selector */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => handleQuantityChange(-1)}
                                        disabled={quantity <= 1}
                                        className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock_quantity, parseInt(e.target.value) || 1)))}
                                        className="w-20 text-center p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                        min="1"
                                        max={product.stock_quantity}
                                    />
                                    <button
                                        onClick={() => handleQuantityChange(1)}
                                        disabled={quantity >= product.stock_quantity}
                                        className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Plus size={16} />
                                    </button>
                                    <span className="text-sm text-gray-500 ml-2">
                                        Max: {product.stock_quantity}
                                    </span>
                                </div>
                            </div>

                            {/* Total Price */}
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span>Product ({quantity}x)</span>
                                        <span>{formatPrice(product.final_price * quantity)}</span>
                                    </div>
                                    {services.filter(s => selectedServices.includes(s.id)).length > 0 && (
                                        <>
                                            <div className="border-t border-gray-300 pt-2">
                                                {services
                                                    .filter(s => selectedServices.includes(s.id))
                                                    .map(service => (
                                                        <div key={service.id} className="flex items-center justify-between text-sm text-gray-600">
                                                            <span>{service.name}</span>
                                                            <span>{service.is_free ? 'FREE' : formatPrice(service.price)}</span>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        </>
                                    )}
                                    <div className="border-t-2 border-gray-300 pt-2 flex items-center justify-between text-lg font-bold">
                                        <span>Total:</span>
                                        <span className="text-red-600">{formatPrice(calculateTotal())}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-3 mb-6">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={!product.in_stock}
                                    className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-md font-medium transition-colors ${product.in_stock
                                            ? 'bg-red-600 text-white hover:bg-red-700'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    <ShoppingCart size={18} />
                                    <span>{product.in_stock ? 'Add to Cart' : 'Out of Stock'}</span>
                                </button>
                                <button className="p-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors" title="Add to Wishlist">
                                    <Heart size={18} />
                                </button>
                                <button className="p-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors" title="Share">
                                    <Share2 size={18} />
                                </button>
                            </div>

                            {/* Trust Badges */}
                            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-gray-200">
                                <div className="text-center">
                                    <Truck className="mx-auto text-red-600 mb-2" size={24} />
                                    <p className="text-xs font-medium text-gray-800">Fast UK Delivery</p>
                                    <p className="text-xs text-gray-500">Next Day Available </p>
                                </div>
                                <div className="text-center">
                                    <Shield className="mx-auto text-red-600 mb-2" size={24} />
                                    <p className="text-xs font-medium text-gray-800">Secure Payment</p>
                                    <p className="text-xs text-gray-500">100% Protected</p>
                                </div>
                                <div className="text-center">
                                    <Package className="mx-auto text-red-600 mb-2" size={24} />
                                    <p className="text-xs font-medium text-gray-800">Quality Assured</p>
                                    <p className="text-xs text-gray-500">Genuine Parts</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-12">
                    {/* Tab Headers */}
                    <div className="border-b border-gray-200">
                        <div className="flex space-x-8 px-6">
                            <button
                                onClick={() => setActiveTab('description')}
                                className={`py-4 border-b-2 font-medium transition-colors ${activeTab === 'description'
                                        ? 'border-red-600 text-red-600'
                                        : 'border-transparent text-gray-600 hover:text-gray-800'
                                    }`}
                            >
                                Description
                            </button>
                            {product.attributes.length > 0 && (
                                <button
                                    onClick={() => setActiveTab('specifications')}
                                    className={`py-4 border-b-2 font-medium transition-colors ${activeTab === 'specifications'
                                            ? 'border-red-600 text-red-600'
                                            : 'border-transparent text-gray-600 hover:text-gray-800'
                                        }`}
                                >
                                    Specifications
                                </button>
                            )}
                            {product.compatible_models.length > 0 && (
                                <button
                                    onClick={() => setActiveTab('compatibility')}
                                    className={`py-4 border-b-2 font-medium transition-colors ${activeTab === 'compatibility'
                                            ? 'border-red-600 text-red-600'
                                            : 'border-transparent text-gray-600 hover:text-gray-800'
                                        }`}
                                >
                                    Compatibility ({product.compatible_models.reduce((sum, brand) => sum + brand.models.length, 0)})
                                </button>
                            )}
                            <button
                                onClick={() => setActiveTab('reviews')}
                                className={`py-4 border-b-2 font-medium transition-colors ${activeTab === 'reviews'
                                        ? 'border-red-600 text-red-600'
                                        : 'border-transparent text-gray-600 hover:text-gray-800'
                                    }`}
                            >
                                Reviews ({product.reviews_count})
                            </button>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {/* Description Tab */}
                        {activeTab === 'description' && (
                            <div className="prose max-w-none">
                                {product.description ? (
                                    <div dangerouslySetInnerHTML={{ __html: product.description }} />
                                ) : (
                                    <p className="text-gray-600">No detailed description available for this product.</p>
                                )}

                                {/* Physical Specifications */}
                                {(product.weight || product.dimensions.length || product.dimensions.width || product.dimensions.height) && (
                                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Physical Specifications</h3>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            {product.weight && (
                                                <div className="flex items-center">
                                                    <span className="text-gray-500 w-24">Weight:</span>
                                                    <span className="font-medium">{product.weight} kg</span>
                                                </div>
                                            )}
                                            {product.dimensions.length && (
                                                <div className="flex items-center">
                                                    <span className="text-gray-500 w-24">Length:</span>
                                                    <span className="font-medium">{product.dimensions.length} cm</span>
                                                </div>
                                            )}
                                            {product.dimensions.width && (
                                                <div className="flex items-center">
                                                    <span className="text-gray-500 w-24">Width:</span>
                                                    <span className="font-medium">{product.dimensions.width} cm</span>
                                                </div>
                                            )}
                                            {product.dimensions.height && (
                                                <div className="flex items-center">
                                                    <span className="text-gray-500 w-24">Height:</span>
                                                    <span className="font-medium">{product.dimensions.height} cm</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Specifications Tab */}
                        {activeTab === 'specifications' && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Technical Specifications</h3>
                                <div className="divide-y divide-gray-200">
                                    {product.attributes.map((attr, index) => (
                                        <div key={index} className="py-3 flex items-start">
                                            <span className="text-gray-600 w-1/3">{attr.name}:</span>
                                            <span className="font-medium text-gray-800 w-2/3">{attr.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Compatibility Tab */}
                        {activeTab === 'compatibility' && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Compatible Boiler Models</h3>
                                <p className="text-gray-600 mb-6">This part is compatible with the following boiler models:</p>

                                <div className="space-y-6">
                                    {product.compatible_models.map((brandGroup, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                                                <h4 className="font-semibold text-gray-800">{brandGroup.brand}</h4>
                                            </div>
                                            <div className="p-4">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {brandGroup.models.map((model) => (
                                                        <div key={model.id} className="p-3 bg-gray-50 rounded border border-gray-200">
                                                            <div className="font-medium text-gray-800">{model.model_name}</div>
                                                            {model.model_code && (
                                                                <div className="text-sm text-gray-500">Code: {model.model_code}</div>
                                                            )}
                                                            {model.year_range && (
                                                                <div className="text-xs text-gray-500 mt-1">{model.year_range}</div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                                    <p className="text-sm text-gray-700">
                                        <strong>Note:</strong> If you're unsure about compatibility, please contact us with your boiler model number and we'll be happy to help.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Reviews Tab */}
                        {activeTab === 'reviews' && (
                            <div>
                                {product.reviews_count > 0 ? (
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        {/* Rating Summary */}
                                        <div className="lg:col-span-1">
                                            <div className="bg-gray-50 rounded-lg p-6 sticky top-4">
                                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Reviews</h3>
                                                <div className="text-center mb-4">
                                                    <div className="text-4xl font-bold text-gray-800 mb-2">
                                                        {product.rating.toFixed(1)}
                                                    </div>
                                                    <div className="flex items-center justify-center mb-2">
                                                        {renderStars(product.rating, 20)}
                                                    </div>
                                                    <p className="text-sm text-gray-600">
                                                        Based on {product.reviews_count} {product.reviews_count === 1 ? 'review' : 'reviews'}
                                                    </p>
                                                </div>

                                                {/* Rating Breakdown */}
                                                <div className="space-y-2">
                                                    {[5, 4, 3, 2, 1].map((rating) => (
                                                        <div key={rating} className="flex items-center space-x-2">
                                                            <span className="text-sm text-gray-600 w-12">{rating} star</span>
                                                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                                <div
                                                                    className="bg-yellow-400 h-2 rounded-full"
                                                                    style={{ width: `${getRatingPercentage(rating)}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-sm text-gray-600 w-12 text-right">
                                                                {product.rating_breakdown[rating]}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Reviews List */}
                                        <div className="lg:col-span-2 space-y-6">
                                            {reviews.map((review) => (
                                                <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            <div className="flex items-center mb-1">
                                                                {renderStars(review.rating)}
                                                            </div>
                                                            <p className="font-medium text-gray-800">{review.user_name}</p>
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {review.formatted_date}
                                                        </div>
                                                    </div>
                                                    {review.title && (
                                                        <h4 className="font-semibold text-gray-800 mb-2">{review.title}</h4>
                                                    )}
                                                    {review.comment && (
                                                        <p className="text-gray-600">{review.comment}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Star size={48} className="mx-auto text-gray-400 mb-4" />
                                        <h3 className="text-lg font-medium text-gray-800 mb-2">No Reviews Yet</h3>
                                        <p className="text-gray-600">Be the first to review this product!</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-12">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Related Products</h2>
                            <Link
                                href={`/categories/${product.category.slug}`}
                                className="text-red-600 hover:text-red-700 font-medium text-sm"
                            >
                                View All in {product.category.name} →
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {relatedProducts.map(relProd => (
                                <Link
                                    key={relProd.id}
                                    href={`/products/${relProd.slug}`}
                                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
                                >
                                    <div className="relative">
                                        <img
                                            src={`/storage/${relProd.image}`}
                                            alt={relProd.name}
                                            className="w-full aspect-square object-cover"
                                            onError={(e) => {
                                                e.currentTarget.src = '/storage/products/placeholder-product.jpg';
                                            }}
                                        />
                                        {relProd.discount_percentage > 0 && (
                                            <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
                                                -{relProd.discount_percentage}%
                                            </div>
                                        )}
                                        {!relProd.in_stock && (
                                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                                <span className="bg-white text-gray-800 px-3 py-1 rounded text-sm font-medium">
                                                    Out of Stock
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3">
                                        <p className="text-xs text-gray-500 mb-1">{relProd.brand.name}</p>
                                        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-2 group-hover:text-red-600 transition-colors">
                                            {relProd.name}
                                        </h3>
                                        {relProd.rating > 0 && (
                                            <div className="flex items-center mb-2">
                                                <div className="flex items-center">
                                                    {renderStars(relProd.rating, 12)}
                                                </div>
                                                <span className="text-xs text-gray-500 ml-1">
                                                    ({relProd.rating.toFixed(1)})
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex items-center space-x-2">
                                            {relProd.sale_price ? (
                                                <>
                                                    <span className="text-lg font-bold text-red-600">
                                                        {formatPrice(relProd.final_price)}
                                                    </span>
                                                    <span className="text-xs text-gray-500 line-through">
                                                        {formatPrice(relProd.price)}
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="text-lg font-bold text-gray-800">
                                                    {formatPrice(relProd.price)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
};

export default ProductShow;
