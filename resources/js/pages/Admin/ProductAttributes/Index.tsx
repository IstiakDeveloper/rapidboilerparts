import React from 'react';
import { Head, router } from '@inertiajs/react';
import { Search, Plus, Edit, Trash2, Filter, Tag, Hash, ToggleLeft } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

interface ProductAttribute {
  id: number;
  name: string;
  slug: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'boolean';
  is_required: boolean;
  is_filterable: boolean;
  sort_order: number;
  values_count: number;
  created_at: string;
}

interface Filters {
  search?: string;
  type?: string;
}

interface PageProps {
  attributes: {
    data: ProductAttribute[];
    links?: any[];
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
    from?: number;
    to?: number;
  };
  filters: Filters;
  attribute_types: string[];
}

export default function Index({ attributes, filters, attribute_types }: PageProps) {
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = formData.get('search') as string;

    router.get('/admin/product-attributes', {
      ...filters,
      search: search || undefined
    }, {
      preserveState: true
    });
  };

  const handleFilterChange = (key: string, value: string) => {
    router.get('/admin/product-attributes', {
      ...filters,
      [key]: value || undefined
    }, {
      preserveState: true
    });
  };

  const handleDelete = (attributeId: number) => {
    if (confirm('Are you sure you want to delete this attribute?')) {
      router.delete(`/admin/product-attributes/${attributeId}`);
    }
  };

  const getTypeBadge = (type: string) => {
    const styles = {
      text: { bg: 'bg-blue-100', text: 'text-blue-800', icon: 'T' },
      number: { bg: 'bg-green-100', text: 'text-green-800', icon: '#' },
      select: { bg: 'bg-purple-100', text: 'text-purple-800', icon: '☰' },
      multiselect: { bg: 'bg-orange-100', text: 'text-orange-800', icon: '☰' },
      boolean: { bg: 'bg-gray-100', text: 'text-gray-800', icon: '⚏' }
    };
    const style = styles[type as keyof typeof styles];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${style.bg} ${style.text} font-mono`}>
        {type}
      </span>
    );
  };

  return (
    <AdminLayout>
      <Head title="Product Attributes" />

      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Product Attributes</h1>
            <p className="text-gray-600 mt-2">Manage product specifications and filtering options</p>
          </div>
          <button
            onClick={() => router.visit('/admin/product-attributes/create')}
            className="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Attribute
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <form onSubmit={handleSearch} className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="search"
                  placeholder="Search attributes..."
                  defaultValue={filters.search || ''}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </form>

            <select
              value={filters.type || ''}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              {attribute_types.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Attributes Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Attribute</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Usage</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Options</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attributes.data.map((attribute) => (
                  <tr key={attribute.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                          <Tag className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{attribute.name}</div>
                          <div className="text-sm text-gray-500 font-mono">{attribute.slug}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {getTypeBadge(attribute.type)}
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {attribute.values_count} values
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-1">
                          {attribute.is_required ? (
                            <>
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <span className="text-red-600 font-medium">Required</span>
                            </>
                          ) : (
                            <>
                              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                              <span className="text-gray-500">Optional</span>
                            </>
                          )}
                        </div>

                        {attribute.is_filterable && (
                          <div className="flex items-center gap-1">
                            <Filter className="w-3 h-3 text-blue-500" />
                            <span className="text-blue-600 text-xs font-medium">Filterable</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm font-mono text-gray-600">
                        <Hash className="w-4 h-4 mr-1" />
                        {attribute.sort_order}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.visit(`/admin/product-attributes/${attribute.id}/edit`)}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit Attribute"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(attribute.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Attribute"
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

          {attributes.data.length === 0 && (
            <div className="text-center py-12">
              <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No attributes found</h3>
              <p className="text-gray-500 mb-6">Get started by creating your first product attribute.</p>
              <button
                onClick={() => router.visit('/admin/product-attributes/create')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Attribute
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {attributes.links && attributes.links.length > 3 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              {attributes.from && attributes.to && attributes.total ? (
                <>Showing {attributes.from} to {attributes.to} of {attributes.total} results</>
              ) : (
                <>Showing {attributes.data.length} results</>
              )}
            </div>
            <div className="flex items-center gap-2">
              {attributes.links.map((link, index) => (
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
