import React from 'react';
import { Head, router } from '@inertiajs/react';
import { Search, Plus, Eye, Edit, Trash2, Settings, Calendar, Package } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

interface CompatibleModel {
  id: number;
  brand_name: string;
  model_name: string;
  model_code: string;
  year_from: number;
  year_to: number;
  is_active: boolean;
  products_count: number;
  created_at: string;
}

interface Filters {
  search?: string;
  brand_name?: string;
  is_active?: string;
}

interface PageProps {
  models: {
    data: CompatibleModel[];
    links?: any[];
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
    from?: number;
    to?: number;
  };
  brands: string[];
  filters: Filters;
}

export default function Index({ models, brands, filters }: PageProps) {
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = formData.get('search') as string;

    router.get('/admin/compatible-models', {
      ...filters,
      search: search || undefined
    }, {
      preserveState: true
    });
  };

  const handleFilterChange = (key: string, value: string) => {
    router.get('/admin/compatible-models', {
      ...filters,
      [key]: value || undefined
    }, {
      preserveState: true
    });
  };

  const handleDelete = (modelId: number) => {
    if (confirm('Are you sure you want to delete this compatible model?')) {
      router.delete(`/admin/compatible-models/${modelId}`);
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
        isActive
          ? 'bg-green-100 text-green-800'
          : 'bg-red-100 text-red-800'
      }`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  const formatYearRange = (yearFrom: number, yearTo: number) => {
    if (yearFrom && yearTo) {
      return `${yearFrom} - ${yearTo}`;
    } else if (yearFrom) {
      return `${yearFrom}+`;
    } else if (yearTo) {
      return `Up to ${yearTo}`;
    }
    return 'All Years';
  };

  return (
    <AdminLayout>
      <Head title="Compatible Models" />

      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Compatible Models</h1>
            <p className="text-gray-600 mt-2">Manage boiler models for product compatibility</p>
          </div>
          <button
            onClick={() => router.visit('/admin/compatible-models/create')}
            className="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Model
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <form onSubmit={handleSearch} className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="search"
                  placeholder="Search models..."
                  defaultValue={filters.search || ''}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </form>

            <select
              value={filters.brand_name || ''}
              onChange={(e) => handleFilterChange('brand_name', e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Brands</option>
              {brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>

            <select
              value={filters.is_active || ''}
              onChange={(e) => handleFilterChange('is_active', e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>
        </div>

        {/* Models Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Model</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Brand</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Model Code</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Years</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Products</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {models.data.map((model) => (
                  <tr key={model.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                          <Settings className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{model.model_name}</div>
                          <div className="text-sm text-gray-500">ID: #{model.id}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{model.brand_name}</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 font-mono">
                        {model.model_code || '-'}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        {formatYearRange(model.year_from, model.year_to)}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {getStatusBadge(model.is_active)}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-900">
                        <Package className="w-4 h-4 text-gray-400 mr-2" />
                        {model.products_count} products
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.visit(`/admin/compatible-models/${model.id}`)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Model"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => router.visit(`/admin/compatible-models/${model.id}/edit`)}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit Model"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {model.products_count === 0 && (
                          <button
                            onClick={() => handleDelete(model.id)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Model"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {models.data.length === 0 && (
            <div className="text-center py-12">
              <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No compatible models found</h3>
              <p className="text-gray-500 mb-6">Get started by adding your first boiler model.</p>
              <button
                onClick={() => router.visit('/admin/compatible-models/create')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Model
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {models.links && models.links.length > 3 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              {models.from && models.to && models.total ? (
                <>Showing {models.from} to {models.to} of {models.total} results</>
              ) : (
                <>Showing {models.data.length} results</>
              )}
            </div>
            <div className="flex items-center gap-2">
              {models.links.map((link, index) => (
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
