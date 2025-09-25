import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Search, Plus, Filter, Eye, Edit, Trash2, Star, Package, AlertCircle } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  sale_price: number | null;
  stock_quantity: number;
  status: 'active' | 'inactive' | 'draft';
  is_featured: boolean;
  brand: { id: number; name: string };
  category: { id: number; name: string };
  images_count: number;
  reviews_count: number;
  created_at: string;
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

interface Filters {
  search?: string;
  brand_id?: string;
  category_id?: string;
  status?: string;
  stock_status?: string;
}

interface PageProps {
  products: {
    data: Product[];
    links?: any[];
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
    from?: number;
    to?: number;
  };
  brands: Brand[];
  categories: Category[];
  filters: Filters;
}

export default function Index({ products, brands, categories, filters }: PageProps) {
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState('');

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = formData.get('search') as string;

    router.get('/admin/products', {
      ...filters,
      search: search || undefined
    }, {
      preserveState: true
    });
  };

  const handleFilterChange = (key: string, value: string) => {
    router.get('/admin/products', {
      ...filters,
      [key]: value || undefined
    }, {
      preserveState: true
    });
  };

  const handleBulkAction = () => {
    if (!bulkAction || selectedProducts.length === 0) return;

    if (bulkAction === 'delete') {
      if (!confirm('Are you sure you want to delete selected products?')) return;
    }

    router.post('/admin/products/bulk-update', {
      ids: selectedProducts,
      action: bulkAction
    }, {
      onSuccess: () => {
        setSelectedProducts([]);
        setBulkAction('');
      }
    });
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === products.data.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.data.map(p => p.id));
    }
  };

  const toggleSelectProduct = (id: number) => {
    setSelectedProducts(prev =>
      prev.includes(id)
        ? prev.filter(pid => pid !== id)
        : [...prev, id]
    );
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      draft: 'bg-yellow-100 text-yellow-800'
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return <span className="text-red-600 font-medium">Out of Stock</span>;
    if (quantity <= 5) return <span className="text-yellow-600 font-medium">Low Stock</span>;
    return <span className="text-green-600 font-medium">In Stock</span>;
  };

  return (
    <AdminLayout>
      <Head title="Products" />

      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600 mt-2">Manage your product catalog</p>
          </div>
          <button
            onClick={() => router.visit('/admin/products/create')}
            className="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <form onSubmit={handleSearch} className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="search"
                  placeholder="Search products..."
                  defaultValue={filters.search || ''}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </form>

            <select
              value={filters.brand_id || ''}
              onChange={(e) => handleFilterChange('brand_id', e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Brands</option>
              {brands.map(brand => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>

            <select
              value={filters.category_id || ''}
              onChange={(e) => handleFilterChange('category_id', e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>

            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedProducts.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
            <span className="text-blue-800 font-medium">
              {selectedProducts.length} product(s) selected
            </span>
            <div className="flex items-center gap-3">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-3 py-2 border border-blue-300 rounded-lg text-sm"
              >
                <option value="">Choose Action</option>
                <option value="activate">Activate</option>
                <option value="deactivate">Deactivate</option>
                <option value="feature">Feature</option>
                <option value="unfeature">Unfeature</option>
                <option value="delete">Delete</option>
              </select>
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
              >
                Apply
              </button>
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
                      checked={selectedProducts.length === products.data.length && products.data.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Brand</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.data.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleSelectProduct(product.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12 bg-gray-100 rounded-lg overflow-hidden mr-4">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={`/storage/${product.images[0].image_path}`}
                              alt={product.images[0].alt_text || product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            {product.is_featured && (
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{product.images_count} images</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-mono">{product.sku}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{product.brand.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{product.category.name}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {product.sale_price ? (
                          <div>
                            <span className="font-medium">£{product.sale_price}</span>
                            <span className="text-gray-500 line-through ml-2">£{product.price}</span>
                          </div>
                        ) : (
                          <span className="font-medium">£{product.price}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div>
                        <div className="font-medium text-gray-900">{product.stock_quantity}</div>
                        {getStockStatus(product.stock_quantity)}
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(product.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.visit(`/admin/products/${product.id}`)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => router.visit(`/admin/products/${product.id}/edit`)}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this product?')) {
                              router.delete(`/admin/products/${product.id}`);
                            }
                          }}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {products.data.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 mb-6">Get started by creating your first product.</p>
              <button
                onClick={() => router.visit('/admin/products/create')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Product
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {products.links && products.links.length > 3 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              {products.from && products.to && products.total ? (
                <>Showing {products.from} to {products.to} of {products.total} results</>
              ) : (
                <>Showing {products.data.length} results</>
              )}
            </div>
            <div className="flex items-center gap-2">
              {products.links.map((link, index) => (
                <button
                  key={index}
                  onClick={() => link.url && router.visit(link.url)}
                  disabled={!link.url}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    link.active
                      ? 'bg-blue-600 text-white'
                      : link.url
                      ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
