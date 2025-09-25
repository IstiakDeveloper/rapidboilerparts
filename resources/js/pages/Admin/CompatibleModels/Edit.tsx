import React from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { ArrowLeft, Save, Settings, Calendar, Tag } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

interface CompatibleModel {
  id: number;
  brand_name: string;
  model_name: string;
  model_code: string;
  year_from: number;
  year_to: number;
  is_active: boolean;
}

interface PageProps {
  model: CompatibleModel;
  brands: string[];
}

export default function Edit({ model, brands }: PageProps) {
  const { data, setData, put, processing, errors } = useForm({
    brand_name: model.brand_name,
    model_name: model.model_name,
    model_code: model.model_code || '',
    year_from: model.year_from ? model.year_from.toString() : '',
    year_to: model.year_to ? model.year_to.toString() : '',
    is_active: model.is_active,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/admin/compatible-models/${model.id}`);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1899 + 10 }, (_, i) => 1900 + i);

  return (
    <AdminLayout>
      <Head title={`Edit ${model.brand_name} ${model.model_name}`} />

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
              <h1 className="text-3xl font-bold text-gray-900">Edit Compatible Model</h1>
              <p className="text-gray-600 mt-2">Update model information and settings</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      list="brands"
                      value={data.brand_name}
                      onChange={(e) => setData('brand_name', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.brand_name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="e.g., Worcester Bosch, Baxi, Ideal"
                    />
                    <datalist id="brands">
                      {brands.map(brand => (
                        <option key={brand} value={brand} />
                      ))}
                    </datalist>
                  </div>
                  {errors.brand_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.brand_name}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Start typing to see existing brands
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model Name *
                  </label>
                  <input
                    type="text"
                    value={data.model_name}
                    onChange={(e) => setData('model_name', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.model_name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Greenstar 24i, Main Eco Elite"
                  />
                  {errors.model_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.model_name}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tag className="w-4 h-4 inline mr-1" />
                  Model Code (Optional)
                </label>
                <input
                  type="text"
                  value={data.model_code}
                  onChange={(e) => setData('model_code', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono ${
                    errors.model_code ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., GS24i, MEE24"
                />
                {errors.model_code && (
                  <p className="mt-1 text-sm text-red-600">{errors.model_code}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Internal model code or SKU if available
                </p>
              </div>
            </div>
          </div>

          {/* Year Range */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Production Years
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Specify when this model was manufactured (optional)
              </p>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Year
                  </label>
                  <select
                    value={data.year_from}
                    onChange={(e) => setData('year_from', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.year_from ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select start year</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  {errors.year_from && (
                    <p className="mt-1 text-sm text-red-600">{errors.year_from}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To Year
                  </label>
                  <select
                    value={data.year_to}
                    onChange={(e) => setData('year_to', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.year_to ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select end year (ongoing if empty)</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  {errors.year_to && (
                    <p className="mt-1 text-sm text-red-600">{errors.year_to}</p>
                  )}
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm text-blue-800">
                  <strong>Year Range Examples:</strong>
                  <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li><strong>2010 - 2020:</strong> Model produced between these years</li>
                    <li><strong>2015 - (empty):</strong> Model produced from 2015 onwards</li>
                    <li><strong>(empty) - (empty):</strong> Year range not specified</li>
                  </ul>
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
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="is_active"
                    checked={data.is_active === true}
                    onChange={() => setData('is_active', true)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-medium text-green-600">Active</span>
                    <div className="text-sm text-gray-600">
                      Model is available for product compatibility
                    </div>
                  </div>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="is_active"
                    checked={data.is_active === false}
                    onChange={() => setData('is_active', false)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-medium text-red-600">Inactive</span>
                    <div className="text-sm text-gray-600">
                      Model is hidden from product compatibility options
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 bg-gray-50 px-6 py-4 rounded-xl">
            <button
              type="button"
              onClick={() => router.visit('/admin/compatible-models')}
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
              {processing ? 'Updating...' : 'Update Model'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
