import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Search, Filter, X, ChevronDown, Star, Grid, List, SortAsc, ShoppingCart, Heart, Eye } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';

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
        id: number;
        name: string;
        slug: string;
    };
    category: {
        id: number;
        name: string;
        slug: string;
    };
    in_stock: boolean;
    stock_quantity: number;
}

interface Brand {
    id: number;
    name: string;
    slug: string;
    products_count: number;
}

interface Category {
    id: number;
    name: string;
    slug: string;
    products_count: number;
}

interface ProductsPageProps {
    products: {
        data: Product[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    brands: Brand[];
    categories: Category[];
    priceRange: {
        min: number;
        max: number;
    };
    filters: {
        search?: string;
        brand?: string;
        category?: string;
        part_number?: string;
        gc_number?: string;
        min_price?: number;
        max_price?: number;
        featured?: boolean;
        in_stock_only?: boolean;
        sort?: string;
        order?: string;
    };
    totalProducts: number;
}

const ProductsPage: React.FC<ProductsPageProps> = ({
    products,
    brands,
    categories,
    priceRange,
    filters,
    totalProducts
}) => {
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [localFilters, setLocalFilters] = useState({
        search: filters.search || '',
        brand: filters.brand || '',
        category: filters.category || '',
        part_number: filters.part_number || '',
        gc_number: filters.gc_number || '',
        min_price: filters.min_price || priceRange.min,
        max_price: filters.max_price || priceRange.max,
        featured: filters.featured || false,
        in_stock_only: filters.in_stock_only || false,
        sort: filters.sort || 'name'
    });

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

    const handleFilterChange = (key: string, value: any) => {
        setLocalFilters(prev => ({ ...prev, [key]: value }));
    };

    const applyFilters = () => {
        const params = { ...localFilters };

        // Remove empty values
        Object.keys(params).forEach(key => {
            if (!params[key] || params[key] === '' || params[key] === priceRange.min || params[key] === priceRange.max) {
                delete params[key];
            }
        });

        router.get('/products', params, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const clearFilters = () => {
        setLocalFilters({
            search: '',
            brand: '',
            category: '',
            part_number: '',
            gc_number: '',
            min_price: priceRange.min,
            max_price: priceRange.max,
            featured: false,
            in_stock_only: false,
            sort: 'name'
        });

        router.get('/products', {}, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const handleSort = (sortType: string) => {
        router.get('/products', { ...filters, sort: sortType }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const getActiveFilterCount = () => {
        let count = 0;
        if (filters.search) count++;
        if (filters.brand) count++;
        if (filters.category) count++;
        if (filters.part_number) count++;
        if (filters.gc_number) count++;
        if (filters.min_price && filters.min_price > priceRange.min) count++;
        if (filters.max_price && filters.max_price < priceRange.max) count++;
        if (filters.featured) count++;
        if (filters.in_stock_only) count++;
        return count;
    };

    const selectedBrand = brands.find(b => b.slug === filters.brand);
    const selectedCategory = categories.find(c => c.slug === filters.category);

    return (
        <AppLayout>
            <Head>
                <title>
                    {filters.search
                        ? `Search Results for "${filters.search}" - RapidBoilerParts`
                        : selectedBrand
                            ? `${selectedBrand.name} Parts - RapidBoilerParts`
                            : selectedCategory
                                ? `${selectedCategory.name} - RapidBoilerParts`
                                : 'Boiler Spare Parts - RapidBoilerParts'
                    }
                </title>
                <meta name="description" content={`Find quality boiler spare parts. ${products.total} products available with fast UK delivery.`} />
            </Head>

            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Breadcrumb */}
                <nav className="mb-6 text-sm">
                    <ol className="flex items-center space-x-2 text-gray-500">
                        <li><Link href="/" className="hover:text-red-600">Home</Link></li>
                        <li>/</li>
                        <li><Link href="/products" className="hover:text-red-600">Products</Link></li>
                        {selectedBrand && (
                            <>
                                <li>/</li>
                                <li className="text-gray-800">{selectedBrand.name}</li>
                            </>
                        )}
                        {selectedCategory && (
                            <>
                                <li>/</li>
                                <li className="text-gray-800">{selectedCategory.name}</li>
                            </>
                        )}
                    </ol>
                </nav>

                {/* Page Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        {filters.search
                            ? `Search Results for "${filters.search}"`
                            : selectedBrand
                                ? `${selectedBrand.name} Parts`
                                : selectedCategory
                                    ? selectedCategory.name
                                    : 'All Products'
                        }
                    </h1>
                    <p className="text-gray-600">
                        {products.total.toLocaleString()} products found
                        {selectedBrand && ` from ${selectedBrand.name}`}
                        {selectedCategory && ` in ${selectedCategory.name}`}
                    </p>
                </div>

                <div className="flex gap-6">
                    {/* Sidebar Filters */}
                    <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-64 flex-shrink-0`}>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-gray-800">Filters</h3>
                                <div className="flex items-center space-x-2">
                                    {getActiveFilterCount() > 0 && (
                                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                                            {getActiveFilterCount()}
                                        </span>
                                    )}
                                    <button
                                        onClick={clearFilters}
                                        className="text-red-600 text-sm hover:text-red-700"
                                    >
                                        Clear All
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Search */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                                    <input
                                        type="text"
                                        value={localFilters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                        placeholder="Search products..."
                                        className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                        onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                                    />
                                </div>

                                {/* Brand Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                                    <select
                                        value={localFilters.brand}
                                        onChange={(e) => handleFilterChange('brand', e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    >
                                        <option value="">All Brands</option>
                                        {brands.map(brand => (
                                            <option key={brand.id} value={brand.slug}>
                                                {brand.name} ({brand.products_count})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Category Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                    <select
                                        value={localFilters.category}
                                        onChange={(e) => handleFilterChange('category', e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map(category => (
                                            <option key={category.id} value={category.slug}>
                                                {category.name} ({category.products_count})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Part Number */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Part Number</label>
                                    <input
                                        type="text"
                                        value={localFilters.part_number}
                                        onChange={(e) => handleFilterChange('part_number', e.target.value)}
                                        placeholder="e.g. 87161213440"
                                        className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    />
                                </div>

                                {/* GC Number */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">GC Number</label>
                                    <input
                                        type="text"
                                        value={localFilters.gc_number}
                                        onChange={(e) => handleFilterChange('gc_number', e.target.value)}
                                        placeholder="e.g. GC-47-123-456"
                                        className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    />
                                </div>

                                {/* Price Range */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                                    <div className="space-y-2">
                                        <div className="flex space-x-2">
                                            <input
                                                type="number"
                                                value={localFilters.min_price}
                                                onChange={(e) => handleFilterChange('min_price', parseFloat(e.target.value) || priceRange.min)}
                                                placeholder="Min"
                                                min={priceRange.min}
                                                max={priceRange.max}
                                                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                            />
                                            <input
                                                type="number"
                                                value={localFilters.max_price}
                                                onChange={(e) => handleFilterChange('max_price', parseFloat(e.target.value) || priceRange.max)}
                                                placeholder="Max"
                                                min={priceRange.min}
                                                max={priceRange.max}
                                                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                            />
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Range: {formatPrice(priceRange.min)} - {formatPrice(priceRange.max)}
                                        </div>
                                    </div>
                                </div>

                                {/* Checkboxes */}
                                <div className="space-y-3">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={localFilters.featured}
                                            onChange={(e) => handleFilterChange('featured', e.target.checked)}
                                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Featured Products Only</span>
                                    </label>

                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={localFilters.in_stock_only}
                                            onChange={(e) => handleFilterChange('in_stock_only', e.target.checked)}
                                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">In Stock Only</span>
                                    </label>
                                </div>

                                {/* Apply Filters Button */}
                                <button
                                    onClick={applyFilters}
                                    className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Toolbar */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center space-x-4">
                                    <button
                                        onClick={() => setShowFilters(!showFilters)}
                                        className="lg:hidden flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
                                    >
                                        <Filter size={16} />
                                        <span>Filters</span>
                                        {getActiveFilterCount() > 0 && (
                                            <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">
                                                {getActiveFilterCount()}
                                            </span>
                                        )}
                                    </button>

                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-red-100 text-red-600' : 'text-gray-500 hover:bg-gray-100'}`}
                                        >
                                            <Grid size={18} />
                                        </button>
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-red-100 text-red-600' : 'text-gray-500 hover:bg-gray-100'}`}
                                        >
                                            <List size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <span className="text-sm text-gray-600">
                                        Showing {products.from}-{products.to} of {products.total} products
                                    </span>

                                    <select
                                        value={filters.sort || 'name'}
                                        onChange={(e) => handleSort(e.target.value)}
                                        className="p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    >
                                        <option value="name">Name A-Z</option>
                                        <option value="price_low">Price: Low to High</option>
                                        <option value="price_high">Price: High to Low</option>
                                        <option value="newest">Newest First</option>
                                        <option value="rating">Highest Rated</option>
                                        <option value="popular">Most Popular</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Products Grid/List */}
                        {products.data.length > 0 ? (
                            <>
                                <div className={`${viewMode === 'grid'
                                        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                                        : 'space-y-4'
                                    }`}>
                                    {products.data.map((product) => (
                                        <div key={product.id} className={`${viewMode === 'grid'
                                                ? 'bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow'
                                                : 'bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex gap-4 hover:shadow-md transition-shadow'
                                            }`}>
                                            {viewMode === 'grid' ? (
                                                // Grid View
                                                <>
                                                    <div className="relative">
                                                        <Link href={`/products/${product.slug}`}>
                                                            <img
                                                                src={`/storage/${product.image}`}
                                                                alt={product.name}
                                                                className="w-full h-48 object-cover"
                                                                onError={(e) => {
                                                                    e.currentTarget.src = '/storage/products/placeholder-product.jpg';
                                                                }}
                                                            />
                                                        </Link>
                                                        {product.discount_percentage > 0 && (
                                                            <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
                                                                -{product.discount_percentage}%
                                                            </div>
                                                        )}
                                                        {!product.in_stock && (
                                                            <div className="absolute top-2 right-2 bg-gray-800 text-white px-2 py-1 rounded text-xs">
                                                                Out of Stock
                                                            </div>
                                                        )}
                                                        <div className="absolute top-2 right-2 flex flex-col space-y-2">
                                                            <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors">
                                                                <Heart size={16} className="text-gray-600" />
                                                            </button>
                                                            <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors">
                                                                <Eye size={16} className="text-gray-600" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="p-4">
                                                        <div className="mb-2">
                                                            <Link
                                                                href={`/brands/${product.brand.slug}`}
                                                                className="text-xs text-gray-500 hover:text-red-600"
                                                            >
                                                                {product.brand.name}
                                                            </Link>
                                                        </div>
                                                        <h3 className="font-medium text-gray-800 mb-2 line-clamp-2">
                                                            <Link
                                                                href={`/products/${product.slug}`}
                                                                className="hover:text-red-600"
                                                            >
                                                                {product.name}
                                                            </Link>
                                                        </h3>

                                                        <div className="text-xs text-gray-500 mb-2 space-y-1">
                                                            <div>SKU: {product.sku}</div>
                                                            {product.manufacturer_part_number && (
                                                                <div>Part: {product.manufacturer_part_number}</div>
                                                            )}
                                                            {product.gc_number && (
                                                                <div>GC: {product.gc_number}</div>
                                                            )}
                                                        </div>

                                                        {product.rating > 0 && (
                                                            <div className="flex items-center mb-2">
                                                                <div className="flex items-center">
                                                                    {renderStars(product.rating)}
                                                                </div>
                                                                <span className="text-xs text-gray-500 ml-1">
                                                                    ({product.reviews_count})
                                                                </span>
                                                            </div>
                                                        )}

                                                        <div className="mb-3">
                                                            <div className="flex items-center space-x-2">
                                                                {product.sale_price ? (
                                                                    <>
                                                                        <span className="text-lg font-bold text-red-600">
                                                                            {formatPrice(product.final_price)}
                                                                        </span>
                                                                        <span className="text-sm text-gray-500 line-through">
                                                                            {formatPrice(product.price)}
                                                                        </span>
                                                                    </>
                                                                ) : (
                                                                    <span className="text-lg font-bold text-gray-800">
                                                                        {formatPrice(product.price)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-between">
                                                            <div className="text-xs text-gray-500">
                                                                {product.in_stock ? (
                                                                    product.stock_quantity > 10 ? (
                                                                        <span className="text-green-600">In Stock</span>
                                                                    ) : (
                                                                        <span className="text-orange-600">
                                                                            Only {product.stock_quantity} left
                                                                        </span>
                                                                    )
                                                                ) : (
                                                                    <span className="text-red-600">Out of Stock</span>
                                                                )}
                                                            </div>
                                                            <button
                                                                disabled={!product.in_stock}
                                                                className={`p-2 rounded-md transition-colors ${product.in_stock
                                                                        ? 'bg-red-600 text-white hover:bg-red-700'
                                                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                                    }`}
                                                            >
                                                                <ShoppingCart size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                // List View
                                                <>
                                                    <div className="w-32 h-32 flex-shrink-0 relative">
                                                        <Link href={`/products/${product.slug}`}>
                                                            <img
                                                                src={`/storage/${product.image}`}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover rounded"
                                                                onError={(e) => {
                                                                    e.currentTarget.src = '/storage/products/placeholder-product.jpg';
                                                                }}
                                                            />
                                                        </Link>
                                                        {product.discount_percentage > 0 && (
                                                            <div className="absolute top-1 left-1 bg-red-600 text-white px-1 py-0.5 rounded text-xs">
                                                                -{product.discount_percentage}%
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="mb-1">
                                                            <Link
                                                                href={`/brands/${product.brand.slug}`}
                                                                className="text-xs text-gray-500 hover:text-red-600"
                                                            >
                                                                {product.brand.name}
                                                            </Link>
                                                        </div>
                                                        <h3 className="font-medium text-gray-800 mb-2">
                                                            <Link
                                                                href={`/products/${product.slug}`}
                                                                className="hover:text-red-600"
                                                            >
                                                                {product.name}
                                                            </Link>
                                                        </h3>

                                                        <div className="text-xs text-gray-500 mb-2 grid grid-cols-1 sm:grid-cols-3 gap-1">
                                                            <div>SKU: {product.sku}</div>
                                                            {product.manufacturer_part_number && (
                                                                <div>Part: {product.manufacturer_part_number}</div>
                                                            )}
                                                            {product.gc_number && (
                                                                <div>GC: {product.gc_number}</div>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                {product.rating > 0 && (
                                                                    <div className="flex items-center mb-2">
                                                                        <div className="flex items-center">
                                                                            {renderStars(product.rating)}
                                                                        </div>
                                                                        <span className="text-xs text-gray-500 ml-1">
                                                                            ({product.reviews_count})
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                <div className="flex items-center space-x-2">
                                                                    {product.sale_price ? (
                                                                        <>
                                                                            <span className="text-lg font-bold text-red-600">
                                                                                {formatPrice(product.final_price)}
                                                                            </span>
                                                                            <span className="text-sm text-gray-500 line-through">
                                                                                {formatPrice(product.price)}
                                                                            </span>
                                                                        </>
                                                                    ) : (
                                                                        <span className="text-lg font-bold text-gray-800">
                                                                            {formatPrice(product.price)}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-xs text-gray-500 mb-2">
                                                                    {product.in_stock ? (
                                                                        product.stock_quantity > 10 ? (
                                                                            <span className="text-green-600">In Stock</span>
                                                                        ) : (
                                                                            <span className="text-orange-600">
                                                                                Only {product.stock_quantity} left
                                                                            </span>
                                                                        )
                                                                    ) : (
                                                                        <span className="text-red-600">Out of Stock</span>
                                                                    )}
                                                                </div>
                                                                <button
                                                                    disabled={!product.in_stock}
                                                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${product.in_stock
                                                                            ? 'bg-red-600 text-white hover:bg-red-700'
                                                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                                        }`}
                                                                >
                                                                    Add to Cart
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {products.last_page > 1 && (
                                    <div className="mt-8 flex justify-center">
                                        <div className="flex items-center space-x-2">
                                            {products.current_page > 1 && (
                                                <Link
                                                    href={`/products?${new URLSearchParams({
                                                        ...filters,
                                                        page: (products.current_page - 1).toString()
                                                    })}`}
                                                    className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                                                >
                                                    Previous
                                                </Link>
                                            )}

                                            {[...Array(products.last_page)].map((_, i) => {
                                                const page = i + 1;
                                                const isCurrentPage = page === products.current_page;
                                                const showPage = page === 1 ||
                                                    page === products.last_page ||
                                                    (page >= products.current_page - 2 && page <= products.current_page + 2);

                                                if (!showPage) {
                                                    if (page === products.current_page - 3 || page === products.current_page + 3) {
                                                        return <span key={page} className="px-2 text-gray-500">...</span>;
                                                    }
                                                    return null;
                                                }

                                                return (
                                                    <Link
                                                        key={page}
                                                        href={`/products?${new URLSearchParams({
                                                            ...filters,
                                                            page: page.toString()
                                                        })}`}
                                                        className={`px-3 py-2 rounded-md text-sm ${isCurrentPage
                                                                ? 'bg-red-600 text-white'
                                                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {page}
                                                    </Link>
                                                );
                                            })}

                                            {products.current_page < products.last_page && (
                                                <Link
                                                    href={`/products?${new URLSearchParams({
                                                        ...filters,
                                                        page: (products.current_page + 1).toString()
                                                    })}`}
                                                    className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                                                >
                                                    Next
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            // No Products Found
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                                <div className="max-w-md mx-auto">
                                    <Search size={48} className="mx-auto text-gray-400 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-800 mb-2">No Products Found</h3>
                                    <p className="text-gray-600 mb-4">
                                        We couldn't find any products matching your search criteria.
                                        Try adjusting your filters or search terms.
                                    </p>
                                    <button
                                        onClick={clearFilters}
                                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                                    >
                                        Clear All Filters
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default ProductsPage;
