import React from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { ArrowLeft, Save, Ticket, Percent, DollarSign, Calendar, Users, Info } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

interface Coupon {
  id: number;
  code: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed_amount';
  value: string | number;
  minimum_amount: string | number;
  maximum_discount: string | number;
  usage_limit: number;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
}

interface PageProps {
  coupon: Coupon;
}

export default function Edit({ coupon }: PageProps) {
  const { data, setData, put, processing, errors } = useForm({
    code: coupon.code,
    name: coupon.name,
    description: coupon.description || '',
    type: coupon.type,
    value: coupon.value.toString(),
    minimum_amount: coupon.minimum_amount ? coupon.minimum_amount.toString() : '',
    maximum_discount: coupon.maximum_discount ? coupon.maximum_discount.toString() : '',
    usage_limit: coupon.usage_limit ? coupon.usage_limit.toString() : '',
    starts_at: coupon.starts_at || '',
    expires_at: coupon.expires_at || '',
    is_active: coupon.is_active,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/admin/coupons/${coupon.id}`);
  };

  const generateCouponCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setData('code', result);
  };

  const formatDateTimeLocal = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toISOString().slice(0, 16);
  };

  return (
    <AdminLayout>
      <Head title={`Edit ${coupon.code}`} />

      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.visit('/admin/coupons')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Coupon</h1>
              <p className="text-gray-600 mt-2">Update coupon settings and configuration</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Ticket className="w-5 h-5" />
                Basic Information
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coupon Code *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={data.code}
                      onChange={(e) => setData('code', e.target.value.toUpperCase())}
                      className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono ${
                        errors.code ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="e.g., SAVE20"
                    />
                    <button
                      type="button"
                      onClick={generateCouponCode}
                      className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      Generate
                    </button>
                  </div>
                  {errors.code && (
                    <p className="mt-1 text-sm text-red-600">{errors.code}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Customers will use this code at checkout
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coupon Name *
                  </label>
                  <input
                    type="text"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Black Friday Sale"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Internal name for identification
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  rows={3}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Describe this coupon for internal reference"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Discount Settings */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Discount Settings</h3>
            </div>
            <div className="p-6 space-y-6">
              {/* Discount Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Discount Type *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    data.type === 'percentage'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="type"
                      value="percentage"
                      checked={data.type === 'percentage'}
                      onChange={(e) => setData('type', e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        data.type === 'percentage'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        <Percent className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Percentage</div>
                        <div className="text-sm text-gray-600">Discount by percentage (e.g., 20%)</div>
                      </div>
                    </div>
                  </label>

                  <label className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    data.type === 'fixed_amount'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="type"
                      value="fixed_amount"
                      checked={data.type === 'fixed_amount'}
                      onChange={(e) => setData('type', e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        data.type === 'fixed_amount'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        <DollarSign className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Fixed Amount</div>
                        <div className="text-sm text-gray-600">Fixed discount amount (e.g., £10)</div>
                      </div>
                    </div>
                  </label>
                </div>
                {errors.type && (
                  <p className="mt-2 text-sm text-red-600">{errors.type}</p>
                )}
              </div>

              {/* Discount Value */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {data.type === 'percentage' ? 'Percentage' : 'Amount'} *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step={data.type === 'percentage' ? '1' : '0.01'}
                      min="0"
                      max={data.type === 'percentage' ? '100' : undefined}
                      value={data.value}
                      onChange={(e) => setData('value', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.value ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder={data.type === 'percentage' ? '20' : '10.00'}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      {data.type === 'percentage' ? '%' : '£'}
                    </div>
                  </div>
                  {errors.value && (
                    <p className="mt-1 text-sm text-red-600">{errors.value}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Order Amount
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={data.minimum_amount}
                      onChange={(e) => setData('minimum_amount', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.minimum_amount ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">£</div>
                  </div>
                  {errors.minimum_amount && (
                    <p className="mt-1 text-sm text-red-600">{errors.minimum_amount}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Optional minimum cart value
                  </p>
                </div>

                {data.type === 'percentage' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Discount
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={data.maximum_discount}
                        onChange={(e) => setData('maximum_discount', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.maximum_discount ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="0.00"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">£</div>
                    </div>
                    {errors.maximum_discount && (
                      <p className="mt-1 text-sm text-red-600">{errors.maximum_discount}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Cap discount amount for percentage coupons
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Usage & Schedule */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Usage & Schedule
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Usage Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={data.usage_limit}
                    onChange={(e) => setData('usage_limit', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.usage_limit ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Unlimited"
                  />
                  {errors.usage_limit && (
                    <p className="mt-1 text-sm text-red-600">{errors.usage_limit}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Leave empty for unlimited usage
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Start Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formatDateTimeLocal(data.starts_at)}
                    onChange={(e) => setData('starts_at', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.starts_at ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.starts_at && (
                    <p className="mt-1 text-sm text-red-600">{errors.starts_at}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Leave empty to start immediately
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    End Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formatDateTimeLocal(data.expires_at)}
                    onChange={(e) => setData('expires_at', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.expires_at ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.expires_at && (
                    <p className="mt-1 text-sm text-red-600">{errors.expires_at}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Leave empty for no expiry date
                  </p>
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
                      Coupon is available for customers to use (subject to schedule)
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
                      Coupon is disabled and cannot be used
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
              onClick={() => router.visit('/admin/coupons')}
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
              {processing ? 'Updating...' : 'Update Coupon'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
