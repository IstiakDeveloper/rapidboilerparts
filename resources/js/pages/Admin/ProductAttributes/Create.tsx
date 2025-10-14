import React from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { ArrowLeft, Save, Tag, Type, Hash, Filter, CheckSquare } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Create() {
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')  // Remove all special characters except spaces and hyphens
      .replace(/\s+/g, '-')           // Replace spaces with hyphens
      .replace(/-+/g, '-')            // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, '');       // Remove hyphens from start and end
  };

  const { data, setData, post, processing, errors } = useForm({
    name: '',
    slug: '',
    type: 'text',
    is_required: false,
    is_filterable: false,
    sort_order: 0,
  });

  const handleNameChange = (value: string) => {
    setData(prev => ({
      ...prev,
      name: value,
      slug: generateSlug(value)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/admin/product-attributes');
  };

  const attributeTypes = [
    {
      value: 'text',
      label: 'Text',
      description: 'Single line text input (e.g., Color, Brand, Model)',
      icon: 'T'
    },
    {
      value: 'number',
      label: 'Number',
      description: 'Numeric values (e.g., Weight, Dimensions, Power)',
      icon: '#'
    },
    {
      value: 'select',
      label: 'Select',
      description: 'Single selection from predefined options (e.g., Size)',
      icon: '☰'
    },
    {
      value: 'multiselect',
      label: 'Multi-Select',
      description: 'Multiple selections from options (e.g., Features)',
      icon: '☰'
    },
    {
      value: 'boolean',
      label: 'Boolean',
      description: 'Yes/No or True/False values (e.g., Waterproof)',
      icon: '⚏'
    }
  ];

  return (
    <AdminLayout>
      <Head title="Create Product Attribute" />

      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.visit('/admin/product-attributes')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Product Attribute</h1>
              <p className="text-gray-600 mt-2">Add a new product specification or filtering option</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Basic Information
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attribute Name *
                  </label>
                  <input
                    type="text"
                    value={data.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Color, Size, Weight"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    The display name for this attribute
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug (Optional)
                  </label>
                  <input
                    type="text"
                    value={data.slug}
                    onChange={(e) => setData('slug', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm ${
                      errors.slug ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., product-color"
                  />
                  {errors.slug && (
                    <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Auto-generated from name if left empty
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Hash className="w-4 h-4 inline mr-1" />
                  Sort Order
                </label>
                <input
                  type="number"
                  min="0"
                  value={data.sort_order}
                  onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                  className={`w-full md:w-48 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.sort_order ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0"
                />
                {errors.sort_order && (
                  <p className="mt-1 text-sm text-red-600">{errors.sort_order}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Lower numbers appear first in forms and listings
                </p>
              </div>
            </div>
          </div>

          {/* Attribute Type */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Type className="w-5 h-5" />
                Attribute Type
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {attributeTypes.map((type) => (
                  <label
                    key={type.value}
                    className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      data.type === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={type.value}
                      checked={data.type === type.value}
                      onChange={(e) => setData('type', e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-sm font-bold ${
                        data.type === type.value
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {type.icon}
                      </div>
                      <div className="font-medium text-gray-900">{type.label}</div>
                    </div>
                    <div className="text-sm text-gray-600">{type.description}</div>
                    {data.type === type.value && (
                      <div className="absolute top-2 right-2">
                        <CheckSquare className="w-5 h-5 text-blue-500" />
                      </div>
                    )}
                  </label>
                ))}
              </div>
              {errors.type && (
                <p className="mt-3 text-sm text-red-600">{errors.type}</p>
              )}
            </div>
          </div>

          {/* Attribute Settings */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Attribute Settings</h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Field Requirements</h4>

                  <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                    <input
                      type="checkbox"
                      checked={data.is_required}
                      onChange={(e) => setData('is_required', e.target.checked)}
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">Required Field</div>
                      <div className="text-sm text-gray-600">
                        This attribute must be filled when adding products
                      </div>
                      <div className="text-xs text-red-600 mt-1">
                        ⚠ Required attributes cannot be left empty
                      </div>
                    </div>
                  </label>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Frontend Features</h4>

                  <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                    <input
                      type="checkbox"
                      checked={data.is_filterable}
                      onChange={(e) => setData('is_filterable', e.target.checked)}
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900 flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        Enable as Filter
                      </div>
                      <div className="text-sm text-gray-600">
                        Show this attribute in product filtering options
                      </div>
                      <div className="text-xs text-blue-600 mt-1">
                        💡 Helps customers find products more easily
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {(data.type === 'select' || data.type === 'multiselect') && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-800 font-medium mb-2">
                    <Type className="w-4 h-4" />
                    Note for {data.type === 'select' ? 'Select' : 'Multi-Select'} Type
                  </div>
                  <p className="text-sm text-blue-700">
                    You'll need to define the available options after creating this attribute.
                    Options can be managed when editing products or through the attribute values section.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 bg-gray-50 px-6 py-4 rounded-xl">
            <button
              type="button"
              onClick={() => router.visit('/admin/product-attributes')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              {processing ? 'Creating...' : 'Create Attribute'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
