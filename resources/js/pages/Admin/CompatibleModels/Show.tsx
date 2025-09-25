import React from 'react';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Edit, Trash2, Settings, Calendar, Tag, Package, CheckCircle, XCircle } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  brand: {
    name: string;
  };
  category: {
    name: string;
  };
  status: string;
}

interface CompatibleModel {
  id: number;
  brand_name: string;
  model_name: string;
  model_code: string;
  year_from: number;
  year_to: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  products: Product[];
}

interface PageProps {
  model: CompatibleModel;
}

export default function Show({ model }: PageProps) {
  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this compatible model? This action cannot be undone.')) {
      router.delete(`/admin/compatible-models/${model.id}`);
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${
        isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {isActive ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
        <span className="text-sm font-medium">{isActive ? 'Active' : 'Inactive'}</span>
      </div>
    );
  };

  const formatYearRange = (yearFrom: number, yearTo: number) => {
    if (yearFrom && yearTo) {
      return `${yearFrom} - ${yearTo}`;
    } else if (yearFrom) {
      return `${yearFrom} onwards`;
    } else if (yearTo) {
      return `Up to ${yearTo}`;
    }
    return 'All Years';
  };

  const getProductStatusBadge = (status: string) => {
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

  return (
    <AdminLayout>
      <Head title={`${model.brand_name} ${model.model_name}`} />

      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.visit('/admin/compatible-models')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">
                  {model.brand_name} {model.model_name}
                </h1>
                {getStatusBadge(model.is_active)}
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <span>Model ID: #{model.id}</span>
                <span>•</span>
                <span>Created: {new Date(model.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.visit(`/admin/compatible-models/${model.id}/edit`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Model
            </button>
            {model.products.length === 0 && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Model Information */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Model Information
                </h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Brand Name</label>
                    <div className="mt-1 text-lg font-medium text-gray-900">{model.brand_name}</div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Model Name</label>
                    <div className="mt-1 text-lg font-medium text-gray-900">{model.model_name}</div>
                  </div>
                </div>

                {model.model_code && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      Model Code
                    </label>
                    <div className="mt-1 text-lg font-mono font-medium text-gray-900">{model.model_code}</div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Production Years
                  </label>
                  <div className="mt-1 text-lg font-medium text-gray-900">
                    {formatYearRange(model.year_from, model.year_to)}
                  </div>
                  {(model.year_from || model.year_to) && (
                    <div className="mt-2 text-sm text-gray-600">
                      {model.year_from && !model.year_to && 'This model is still in production'}
                      {model.year_from && model.year_to && 'Production ended'}
                      {!model.year_from && model.year_to && 'Legacy model'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Compatible Products */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Compatible Products ({model.products.length})
                </h3>
              </div>
              <div className="p-6">
                {model.products.length > 0 ? (
                  <div className="space-y-4">
                    {model.products.map((product) => (
                      <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Package className="w-5 h-5 text-gray-400" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                            </div>
                          </div>
                          {getProductStatusBadge(product.status)}
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Brand:</span> {product.brand.name} •
                            <span className="font-medium ml-2">Category:</span> {product.category.name}
                          </div>
                          <button
                            onClick={() => router.visit(`/admin/products/${product.id}`)}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                          >
                            View Product →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Compatible Products</h4>
                    <p className="text-gray-500 mb-4">This model hasn't been assigned to any products yet.</p>
                    <button
                      onClick={() => router.visit('/admin/products?search=' + model.model_name)}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Search Products to Add Compatibility →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Quick Stats</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Compatible Products</span>
                  <span className="font-medium text-gray-900">{model.products.length}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Active Products</span>
                  <span className="font-medium text-gray-900">
                    {model.products.filter(p => p.status === 'active').length}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={`font-medium ${model.is_active ? 'text-green-600' : 'text-red-600'}`}>
                    {model.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Last Updated</span>
                    <span className="font-medium text-gray-900">
                      {new Date(model.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Model Details */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Model Details</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Brand</span>
                  <span className="font-medium text-gray-900">{model.brand_name}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Model</span>
                  <span className="font-medium text-gray-900">{model.model_name}</span>
                </div>

                {model.model_code && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Code</span>
                    <span className="font-medium text-gray-900 font-mono text-sm">{model.model_code}</span>
                  </div>
                )}

                {model.year_from && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">From Year</span>
                    <span className="font-medium text-gray-900">{model.year_from}</span>
                  </div>
                )}

                {model.year_to && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">To Year</span>
                    <span className="font-medium text-gray-900">{model.year_to}</span>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Created</span>
                    <span className="font-medium text-gray-900">
                      {new Date(model.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              </div>
              <div className="p-6 space-y-3">
                <button
                  onClick={() => router.visit(`/admin/products?search=${model.brand_name}`)}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3"
                >
                  <Package className="w-4 h-4 text-gray-400" />
                  View {model.brand_name} Products
                </button>

                <button
                  onClick={() => router.visit(`/admin/compatible-models?brand_name=${model.brand_name}`)}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3"
                >
                  <Settings className="w-4 h-4 text-gray-400" />
                  View All {model.brand_name} Models
                </button>

                <div className="pt-3 border-t border-gray-100">
                  <button
                    onClick={() => router.visit(`/admin/compatible-models/${model.id}/edit`)}
                    className="w-full text-left px-4 py-3 text-sm text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-3"
                  >
                    <Edit className="w-4 h-4 text-blue-500" />
                    Edit Model Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
