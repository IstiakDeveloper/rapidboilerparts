import React from 'react';
import { Head, router } from '@inertiajs/react';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Ticket,
  Percent,
  DollarSign,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
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
  used_count: number;
  is_active: boolean;
  starts_at: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

interface PageProps {
  coupon: Coupon;
}

export default function Show({ coupon }: PageProps) {
  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this coupon? This action cannot be undone.')) {
      router.delete(`/admin/coupons/${coupon.id}`);
    }
  };

  const getCouponStatus = () => {
    const now = new Date();
    const startsAt = coupon.starts_at ? new Date(coupon.starts_at) : null;
    const expiresAt = coupon.expires_at ? new Date(coupon.expires_at) : null;

    if (!coupon.is_active) {
      return {
        status: 'inactive',
        label: 'Inactive',
        icon: XCircle,
        color: 'text-red-600 bg-red-50 border-red-200',
        description: 'This coupon is disabled and cannot be used.'
      };
    }

    if (startsAt && now < startsAt) {
      return {
        status: 'scheduled',
        label: 'Scheduled',
        icon: Clock,
        color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        description: 'This coupon will become active on the scheduled start date.'
      };
    }

    if (expiresAt && now > expiresAt) {
      return {
        status: 'expired',
        label: 'Expired',
        icon: XCircle,
        color: 'text-red-600 bg-red-50 border-red-200',
        description: 'This coupon has passed its expiry date.'
      };
    }

    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return {
        status: 'limit_reached',
        label: 'Limit Reached',
        icon: AlertTriangle,
        color: 'text-red-600 bg-red-50 border-red-200',
        description: 'This coupon has reached its usage limit.'
      };
    }

    return {
      status: 'active',
      label: 'Active',
      icon: CheckCircle,
      color: 'text-green-600 bg-green-50 border-green-200',
      description: 'This coupon is active and available for use.'
    };
  };

  const formatValue = (type: string, value: string | number) => {
    const numValue = parseFloat(value.toString());
    if (type === 'percentage') {
      return `${numValue}%`;
    }
    return `£${numValue.toFixed(2)}`;
  };

  const formatPrice = (price: string | number) => {
    return `£${parseFloat(price.toString()).toFixed(2)}`;
  };

  const getTypeIcon = (type: string) => {
    return type === 'percentage' ? Percent : DollarSign;
  };

  const status = getCouponStatus();
  const IconComponent = status.icon;
  const TypeIcon = getTypeIcon(coupon.type);
  const usagePercentage = coupon.usage_limit ? (coupon.used_count / coupon.usage_limit) * 100 : 0;

  return (
    <AdminLayout>
      <Head title={`Coupon ${coupon.code}`} />

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
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900 font-mono">{coupon.code}</h1>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border ${status.color}`}>
                  <IconComponent className="w-4 h-4" />
                  <span className="text-sm font-medium">{status.label}</span>
                </div>
              </div>
              <p className="text-gray-600 mt-2">{coupon.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.visit(`/admin/coupons/${coupon.id}/edit`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Coupon
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Status Alert */}
            <div className={`p-4 rounded-lg border ${status.color}`}>
              <div className="flex items-center gap-3">
                <IconComponent className="w-5 h-5" />
                <div>
                  <div className="font-medium">{status.label}</div>
                  <div className="text-sm opacity-90">{status.description}</div>
                </div>
              </div>
            </div>

            {/* Coupon Information */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Ticket className="w-5 h-5" />
                  Coupon Information
                </h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Coupon Code</label>
                    <div className="mt-1 text-2xl font-bold text-gray-900 font-mono">{coupon.code}</div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Name</label>
                    <div className="mt-1 text-lg font-medium text-gray-900">{coupon.name}</div>
                  </div>
                </div>

                {coupon.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Description</label>
                    <div className="mt-1 text-gray-700">{coupon.description}</div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <TypeIcon className="w-3 h-3" />
                      Discount Type
                    </label>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-lg font-medium text-gray-900 capitalize">
                        {coupon.type.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        coupon.type === 'percentage'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        <TypeIcon className="w-3 h-3 inline mr-1" />
                        {coupon.type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Discount Value</label>
                    <div className="mt-1 text-2xl font-bold text-green-600">
                      {formatValue(coupon.type, coupon.value)}
                    </div>
                  </div>
                </div>

                {(coupon.minimum_amount || coupon.maximum_discount) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {coupon.minimum_amount && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Minimum Order</label>
                        <div className="mt-1 text-lg font-medium text-gray-900">
                          {formatPrice(coupon.minimum_amount)}
                        </div>
                      </div>
                    )}

                    {coupon.maximum_discount && coupon.type === 'percentage' && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Maximum Discount</label>
                        <div className="mt-1 text-lg font-medium text-gray-900">
                          {formatPrice(coupon.maximum_discount)}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Usage Statistics */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Usage Statistics
                </h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Times Used</label>
                    <div className="mt-1 text-2xl font-bold text-gray-900">{coupon.used_count}</div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Usage Limit</label>
                    <div className="mt-1 text-lg font-medium text-gray-900">
                      {coupon.usage_limit || 'Unlimited'}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Remaining Uses</label>
                    <div className="mt-1 text-lg font-medium text-gray-900">
                      {coupon.usage_limit ? Math.max(0, coupon.usage_limit - coupon.used_count) : '∞'}
                    </div>
                  </div>
                </div>

                {coupon.usage_limit && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Usage Progress</span>
                      <span className="text-sm text-gray-600">{usagePercentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-300 ${
                          usagePercentage >= 100 ? 'bg-red-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Schedule */}
            {(coupon.starts_at || coupon.expires_at) && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Schedule
                  </h3>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Start Date</label>
                      <div className="mt-1 text-lg font-medium text-gray-900">
                        {coupon.starts_at
                          ? new Date(coupon.starts_at).toLocaleString()
                          : 'Immediate'
                        }
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">End Date</label>
                      <div className="mt-1 text-lg font-medium text-gray-900">
                        {coupon.expires_at
                          ? new Date(coupon.expires_at).toLocaleString()
                          : 'No expiry'
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                  <span className="text-gray-600">Status</span>
                  <span className={`font-medium ${
                    status.status === 'active' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {status.label}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Type</span>
                  <span className="font-medium text-gray-900 capitalize">
                    {coupon.type.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Value</span>
                  <span className="font-medium text-gray-900">
                    {formatValue(coupon.type, coupon.value)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Usage</span>
                  <span className="font-medium text-gray-900">
                    {coupon.used_count}
                    {coupon.usage_limit && ` / ${coupon.usage_limit}`}
                  </span>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Created</span>
                    <span className="font-medium text-gray-900">
                      {new Date(coupon.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Coupon Code Display */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl border border-gray-200 shadow-sm text-white">
              <div className="p-6 text-center">
                <div className="text-sm font-medium opacity-90 mb-2">Coupon Code</div>
                <div className="text-3xl font-bold font-mono mb-4 bg-white/20 rounded-lg py-3">
                  {coupon.code}
                </div>
                <div className="text-sm opacity-75">
                  Share this code with customers
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
                  onClick={() => navigator.clipboard.writeText(coupon.code)}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3"
                >
                  <Ticket className="w-4 h-4 text-gray-400" />
                  Copy Coupon Code
                </button>

                <div className="pt-3 border-t border-gray-100">
                  <button
                    onClick={() => router.visit(`/admin/coupons/${coupon.id}/edit`)}
                    className="w-full text-left px-4 py-3 text-sm text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-3"
                  >
                    <Edit className="w-4 h-4 text-blue-500" />
                    Edit Coupon Details
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
