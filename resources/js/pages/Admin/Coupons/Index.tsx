import React from 'react';
import { Head, router } from '@inertiajs/react';
import { Search, Plus, Eye, Edit, Trash2, Ticket, Percent, DollarSign, Calendar, Users } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

interface Coupon {
  id: number;
  code: string;
  name: string;
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
}

interface Filters {
  search?: string;
  type?: string;
  is_active?: string;
}

interface PageProps {
  coupons: {
    data: Coupon[];
    links?: any[];
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
    from?: number;
    to?: number;
  };
  filters: Filters;
  coupon_types: string[];
}

export default function Index({ coupons, filters, coupon_types }: PageProps) {
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = formData.get('search') as string;

    router.get('/admin/coupons', {
      ...filters,
      search: search || undefined
    }, {
      preserveState: true
    });
  };

  const handleFilterChange = (key: string, value: string) => {
    router.get('/admin/coupons', {
      ...filters,
      [key]: value || undefined
    }, {
      preserveState: true
    });
  };

  const handleDelete = (couponId: number) => {
    if (confirm('Are you sure you want to delete this coupon?')) {
      router.delete(`/admin/coupons/${couponId}`);
    }
  };

  const getTypeBadge = (type: string) => {
    const styles = {
      percentage: { bg: 'bg-green-100', text: 'text-green-800', icon: Percent },
      fixed_amount: { bg: 'bg-blue-100', text: 'text-blue-800', icon: DollarSign }
    };
    const style = styles[type as keyof typeof styles];
    const IconComponent = style.icon;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${style.bg} ${style.text} flex items-center gap-1`}>
        <IconComponent className="w-3 h-3" />
        {type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
      </span>
    );
  };

  const getStatusBadge = (coupon: Coupon) => {
    const now = new Date();
    const startsAt = coupon.starts_at ? new Date(coupon.starts_at) : null;
    const expiresAt = coupon.expires_at ? new Date(coupon.expires_at) : null;

    if (!coupon.is_active) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Inactive</span>;
    }

    if (startsAt && now < startsAt) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Scheduled</span>;
    }

    if (expiresAt && now > expiresAt) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Expired</span>;
    }

    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Limit Reached</span>;
    }

    return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Active</span>;
  };

  const formatValue = (type: string, value: string | number) => {
    const numValue = parseFloat(value.toString());
    if (type === 'percentage') {
      return `${numValue}%`;
    }
    return `£${numValue.toFixed(2)}`;
  };

  const formatUsage = (used: number, limit: number) => {
    if (limit) {
      return `${used} / ${limit}`;
    }
    return used.toString();
  };

  return (
    <AdminLayout>
      <Head title="Coupons" />

      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Coupons</h1>
            <p className="text-gray-600 mt-2">Manage discount codes and promotional offers</p>
          </div>
          <button
            onClick={() => router.visit('/admin/coupons/create')}
            className="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Coupon
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
                  placeholder="Search coupons..."
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
              {coupon_types.map(type => (
                <option key={type} value={type}>
                  {type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                </option>
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

        {/* Coupons Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Coupon</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type & Value</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Usage</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Expires</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {coupons.data.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-4">
                          <Ticket className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 font-mono">{coupon.code}</div>
                          <div className="text-sm text-gray-500">{coupon.name}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getTypeBadge(coupon.type)}
                        <span className="text-sm font-medium text-gray-900">
                          {formatValue(coupon.type, coupon.value)}
                        </span>
                      </div>
                      {coupon.minimum_amount && (
                        <div className="text-xs text-gray-500 mt-1">
                          Min: £{parseFloat(coupon.minimum_amount.toString()).toFixed(2)}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-900">
                        <Users className="w-4 h-4 text-gray-400 mr-2" />
                        {formatUsage(coupon.used_count, coupon.usage_limit)}
                        {coupon.usage_limit && (
                          <span className="text-xs text-gray-500 ml-1">uses</span>
                        )}
                      </div>
                      {coupon.usage_limit && (
                        <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${
                              coupon.used_count >= coupon.usage_limit ? 'bg-red-500' : 'bg-blue-500'
                            }`}
                            style={{
                              width: `${Math.min((coupon.used_count / coupon.usage_limit) * 100, 100)}%`
                            }}
                          />
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {getStatusBadge(coupon)}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        {coupon.expires_at ? (
                          <span>
                            {new Date(coupon.expires_at).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-gray-500">No expiry</span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.visit(`/admin/coupons/${coupon.id}`)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Coupon"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => router.visit(`/admin/coupons/${coupon.id}/edit`)}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit Coupon"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Coupon"
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

          {coupons.data.length === 0 && (
            <div className="text-center py-12">
              <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No coupons found</h3>
              <p className="text-gray-500 mb-6">Get started by creating your first coupon.</p>
              <button
                onClick={() => router.visit('/admin/coupons/create')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Coupon
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {coupons.links && coupons.links.length > 3 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              {coupons.from && coupons.to && coupons.total ? (
                <>Showing {coupons.from} to {coupons.to} of {coupons.total} results</>
              ) : (
                <>Showing {coupons.data.length} results</>
              )}
            </div>
            <div className="flex items-center gap-2">
              {coupons.links.map((link, index) => (
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
