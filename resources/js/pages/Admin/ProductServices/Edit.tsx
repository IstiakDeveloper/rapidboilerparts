import React from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import {
  ArrowLeft, Save, Settings, DollarSign, Hash, Info
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

interface ProductService {
  id: number;
  name: string;
  slug: string;
  description: string;
  type: 'setup' | 'delivery' | 'installation' | 'maintenance' | 'other';
  price: string;
  is_optional: boolean;
  is_free: boolean;
  conditions: Array<{ key: string; value: string }>;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface EditProps {
  service: ProductService;
}

export default function Edit({ service }: EditProps) {
  const { data, setData, put, processing, errors } = useForm({
    name: service.name || '',
    slug: service.slug || '',
    description: service.description || '',
    type: service.type || 'setup',
    price: service.price || '',
    is_optional: service.is_optional || false,
    is_free: service.is_free || false,
    conditions: service.conditions || [],
    is_active: service.is_active || false,
    sort_order: service.sort_order || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/admin/product-services/${service.id}`);
  };

  const serviceTypes = [
    {
      value: 'setup',
      label: 'Setup Service',
      description: 'Initial configuration and setup of the product',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      value: 'delivery',
      label: 'Delivery Service',
      description: 'Product delivery and handling fees',
      color: 'bg-green-100 text-green-800'
    },
    {
      value: 'installation',
      label: 'Installation Service',
      description: 'Professional installation by certified technicians',
      color: 'bg-purple-100 text-purple-800'
    },
    {
      value: 'maintenance',
      label: 'Maintenance Service',
      description: 'Ongoing maintenance and support services',
      color: 'bg-orange-100 text-orange-800'
    },
    {
      value: 'other',
      label: 'Other Service',
      description: 'Custom or miscellaneous services',
      color: 'bg-gray-100 text-gray-800'
    }
  ];

  const handleConditionAdd = () => {
    setData('conditions', [...data.conditions, { key: '', value: '' }]);
  };

  const handleConditionRemove = (index: number) => {
    const newConditions = data.conditions.filter((_, i) => i !== index);
    setData('conditions', newConditions);
  };

  const handleConditionChange = (index: number, field: 'key' | 'value', value: string) => {
    const newConditions = [...data.conditions];
    newConditions[index] = { ...newConditions[index], [field]: value };
    setData('conditions', newConditions);
  };

  return (
    <AdminLayout>
      <Head title={`Edit Service: ${service.name}`} />

      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.visit(`/admin/product-services/${service.id}`)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Product Service</h1>
              <p className="text-gray-600 mt-2">Update service details and configuration</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Basic Information
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Name *
                  </label>
                  <input
                    type="text"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Professional Installation"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug (Optional)
                  </label>
                  <input
                    type="text"
                    value={data.slug}
                    onChange={(e) => setData('slug', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono ${
                      errors.slug ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., professional-installation"
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
                  Description
                </label>
                <textarea
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  rows={3}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Describe what this service includes..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
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
                  Lower numbers appear first in listings
                </p>
              </div>
            </div>
          </div>

          {/* Service Type */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Service Type</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {serviceTypes.map((type) => (
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
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${type.color}`}>
                        {type.label}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">{type.description}</div>
                  </label>
                ))}
              </div>
              {errors.type && (
                <p className="mt-3 text-sm text-red-600">{errors.type}</p>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Pricing
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={data.price}
                      onChange={(e) => setData('price', e.target.value)}
                      disabled={data.is_free}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        data.is_free ? 'bg-gray-100 text-gray-500' : ''
                      } ${errors.price ? 'border-red-300' : 'border-gray-300'}`}
                      placeholder="0.00"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">£</div>
                  </div>
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Options
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={data.is_free}
                        onChange={(e) => {
                          setData('is_free', e.target.checked);
                          if (e.target.checked) {
                            setData('price', '0');
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <span className="font-medium text-gray-900">Free Service</span>
                        <div className="text-sm text-gray-600">
                          This service is provided at no cost
                        </div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={data.is_optional}
                        onChange={(e) => setData('is_optional', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <span className="font-medium text-gray-900">Optional Service</span>
                        <div className="text-sm text-gray-600">
                          Customers can choose whether to add this service
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Conditions */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Service Conditions</h3>
              <p className="text-sm text-gray-600 mt-1">Optional conditions when this service applies</p>
            </div>
            <div className="p-6">
              {data.conditions.length > 0 && (
                <div className="space-y-4 mb-4">
                  {data.conditions.map((condition, index) => (
                    <div key={index} className="flex gap-4 items-start">
                      <input
                        type="text"
                        placeholder="Condition key (e.g., min_order_value)"
                        value={condition.key}
                        onChange={(e) => handleConditionChange(index, 'key', e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Condition value (e.g., 100)"
                        value={condition.value}
                        onChange={(e) => handleConditionChange(index, 'value', e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleConditionRemove(index)}
                        className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={handleConditionAdd}
                className="px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
              >
                Add Condition
              </button>

              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-blue-900 mb-1">Service Conditions</div>
                    <div className="text-sm text-blue-800">
                      Conditions help determine when this service should be offered or required.
                      Examples: minimum order value, specific product categories, customer location, etc.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Status</h3>
            </div>
            <div className="p-6">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={data.is_active}
                  onChange={(e) => setData('is_active', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="font-medium text-gray-900">Active Service</span>
                  <div className="text-sm text-gray-600">
                    Service is available and can be assigned to products
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="bg-gray-50 px-6 py-4 rounded-xl flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => router.visit(`/admin/product-services/${service.id}`)}
              className="px-6 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {processing ? 'Updating...' : 'Update Service'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
