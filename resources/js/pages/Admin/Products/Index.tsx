import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search, Filter, Eye, Edit, Trash2, Package, AlertTriangle, CheckCircle, XCircle, Star } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  sale_price?: number;
  stock_quantity: number;
  status: 'active' | 'inactive' | 'draft';
  is_featured: boolean;
  brand: {
    id: number;
    name: string;
  };
  category: {
    id: number;
    name: string;
  };
  images_count: number;
  reviews_count: number;
  services_count: number;
  images?: Array<{
    id: number;
    image_path: string;
    alt_text: string;
    is_primary: boolean;
  }>;
}

interface Brand {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
}

interface Props {
  products: {
    data: Product[];
    links?: Array<{
      url: string | null;
      label: string;
      active: boolean;
    }>;
    meta?: {
      current_page?: number;
      last_page?: number;
      total?: number;
      per_page?: number;
      from?: number;
      to?: number;
    };
  };
  brands: Brand[];
  categories: Category[];
  filters: {
    search?: string;
    brand_id?: string;
    category_id?: string;
    status?: string;
    stock_status?: string;
  };
}

export default function ProductsIndex({ products, brands, categories, filters }: Props) {
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState('');
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  const handleSearch = () => {
    router.visit('/admin/products', {
      method: 'get',
      data: {
        ...filters,
        search: searchTerm || undefined,
      },
      preserveState: true,
      replace: true,
    });
  };

  const handleFilter = (key: string, value: string) => {
    router.visit('/admin/products', {
      method: 'get',
      data: {
        ...filters,
        [key]: value || undefined,
      },
      preserveState: true,
      replace: true,
    });
  };

  const handleBulkAction = () => {
    if (!bulkAction || selectedItems.length === 0) return;

    if (bulkAction === 'delete') {
      if (!confirm('Are you sure you want to delete the selected products?')) return;
    }

    router.post('/admin/products/bulk-update', {
      ids: selectedItems,
      action: bulkAction,
    }, {
      onSuccess: () => {
        setSelectedItems([]);
        setBulkAction('');
      },
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(products.data.map(p => p.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, id]);
    } else {
      setSelectedItems(selectedItems.filter(item => item !== id));
    }
  };

  const handleDeleteProduct = (productId: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      router.delete(`/admin/products/${productId}`);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      inactive: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
      draft: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertTriangle },
    };

    const badge = badges[status as keyof typeof badges];
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3" />
          Out of Stock
        </span>
      );
    } else if (quantity <= 5) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-yellow-100 text-yellow-800">
          <AlertTriangle className="w-3 h-3" />
          Low Stock
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3" />
        In Stock
      </span>
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(price);
  };

  return (
    <AdminLayout>
      <Head title="Products" />

      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600">Manage your product catalog and inventory</p>
          </div>
          <Link
            href="/admin/products/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <select
              value={filters.brand_id || ''}
              onChange={(e) => handleFilter('brand_id', e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Brands</option>
              {brands.map(brand => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>

            <select
              value={filters.category_id || ''}
              onChange={(e) => handleFilter('category_id', e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>

            <select
              value={filters.status || ''}
              onChange={(e) => handleFilter('status', e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {products.meta?.total ? (
                `Showing ${products.meta.from || 1} to ${products.meta.to || products.data.length} of ${products.meta.total} products`
              ) : (
                `${products.data.length} products found`
              )}
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedItems.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-blue-800 font-medium">
                {selectedItems.length} item(s) selected
              </span>
              <div className="flex items-center gap-3">
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Action</option>
                  <option value="activate">Activate</option>
                  <option value="deactivate">Deactivate</option>
                  <option value="feature">Feature</option>
                  <option value="unfeature">Unfeature</option>
                  <option value="delete">Delete</option>
                </select>
                <button
                  onClick={handleBulkAction}
                  disabled={!bulkAction}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === products.data.length && products.data.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Product</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">SKU</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Brand</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Price</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Stock</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.data.length > 0 ? (
                  products.data.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(product.id)}
                          onChange={(e) => handleSelectItem(product.id, e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={`/storage/${product.images[0].image_path}`}
                                alt={product.images[0].alt_text}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <Package className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 truncate">{product.name}</div>
                            <div className="text-sm text-gray-500">
                              {product.images_count} images • {product.services_count} services
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-gray-900">{product.sku}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{product.brand.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{product.category.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {formatPrice(product.sale_price || product.price)}
                          </div>
                          {product.sale_price && (
                            <div className="text-sm text-gray-500 line-through">
                              {formatPrice(product.price)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-900">{product.stock_quantity}</div>
                          {getStockStatus(product.stock_quantity)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {getStatusBadge(product.status)}
                          {product.is_featured && (
                            <div className="flex items-center gap-1 text-xs text-yellow-600 font-medium">
                              <Star className="w-3 h-3 fill-current" />
                              Featured
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg"
                            title="View Product"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="p-2 text-gray-400 hover:text-green-600 transition-colors rounded-lg"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <Package className="w-12 h-12 text-gray-400" />
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">No products found</h3>
                          <p className="text-gray-500">Get started by creating your first product.</p>
                        </div>
                        <Link
                          href="/admin/products/create"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Add Product
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {products.meta && products.meta.last_page > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {products.meta?.total ? (
                    `Showing ${products.meta.from || 1} to ${products.meta.to || products.data.length} of ${products.meta.total} results`
                  ) : (
                    `${products.data.length} results`
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {products.links && products.links.map((link, index) => {
                    if (!link.url) {
                      return (
                        <span
                          key={index}
                          className="px-3 py-2 text-sm text-gray-400 cursor-not-allowed"
                          dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                      );
                    }

                    return (
                      <Link
                        key={index}
                        href={link.url}
                        className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                          link.active
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-200'
                        }`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}