import React from 'react';
import { Head, router } from '@inertiajs/react';
import {
  ArrowLeft, Edit, Settings, DollarSign, Hash, Info, Eye,
  Package, CheckCircle, XCircle, Calendar, Trash2, AlertTriangle
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
  products?: Array<{ id: number; name: string; slug: string }>;
}

interface ShowProps {
  service: ProductService;
}

export default function Show({ service }: ShowProps) {
  const getServiceTypeInfo = (type: string) => {
    const types = {
      setup: {
        label: 'Setup Service',
        color: 'bg-blue-100 text-blue-800',
        description: 'Initial configuration and setup'
      },
      delivery: {
        label: 'Delivery Service',
        color: 'bg-green-100 text-green-800',
        description: 'Product delivery and handling'
      },
      installation: {
        label: 'Installation Service',
        color: 'bg-purple-100 text-purple-800',
        description: 'Professional installation'
      },
      maintenance: {
        label: 'Maintenance Service',
        color: 'bg-orange-100 text-orange-800',
        description: 'Ongoing maintenance and support'
      },
      other: {
        label: 'Other Service',
        color: 'bg-gray-100 text-gray-800',
        description: 'Custom or miscellaneous services'
      }
    };
    return types[type] || types.other;
  };

  const formatPrice = (price: string, isFree: boolean) => {
    if (isFree) return 'Free';
    return `£${parseFloat(price).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const serviceType = getServiceTypeInfo(service.type);

  return (
    <AdminLayout>
      <Head title={`Service: ${service.name}`} />

      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.visit('/admin/product-services')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{service.name}</h1>
                {service.is_active ? (
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Active
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full flex items-center gap-1">
                    <XCircle className="w-4 h-4" />
                    Inactive
                  </span>
                )}
              </div>
              <p className="text-gray-600">Product service details and configuration</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.visit(`/admin/product-services/${service.id}/edit`)}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Service
            </button>
          </div>
        </div>

        {/* Service Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Details */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Service Details
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Service Name</label>
                    <div className="text-lg font-semibold text-gray-900">{service.name}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
                    <div className="font-mono text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">{service.slug}</div>
                  </div>
                </div>

                {service.description && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <div className="text-gray-900 bg-gray-50 p-4 rounded-lg">{service.description}</div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${serviceType.color}`}>
                      {serviceType.label}
                    </span>
                    <div className="text-sm text-gray-600 mt-1">{serviceType.description}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort Order</label>
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-gray-400" />
                      <span className="text-lg font-semibold text-gray-900">{service.sort_order}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Information */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Pricing & Options
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatPrice(service.price, service.is_free)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                      service.is_optional ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {service.is_optional ? 'Optional' : 'Required'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cost</label>
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                      service.is_free ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {service.is_free ? 'Free' : 'Paid'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Conditions */}
            {service.conditions && service.conditions.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    Service Conditions
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {service.conditions.map((condition, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-medium text-gray-900">{condition.key}</span>
                          <span className="text-gray-600 ml-2">→ {condition.value}</span>
                        </div>
                      </div>
                    ))}
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
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Assigned Products</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {service.products?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Created</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {formatDate(service.created_at)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Updated</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {formatDate(service.updated_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Assigned Products */}
            {service.products && service.products.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Assigned Products
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {service.products.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500 font-mono">{product.slug}</div>
                        </div>
                        <button
                          onClick={() => router.visit(`/admin/products/${product.id}`)}
                          className="p-2 text-gray-400 hover:text-blue-600 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Actions</h3>
              </div>
              <div className="p-6 space-y-3">
                <button
                  onClick={() => router.visit(`/admin/product-services/${service.id}/edit`)}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Service
                </button>

                {(!service.products || service.products.length === 0) && (
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
                        router.delete(`/admin/product-services/${service.id}`);
                      }
                    }}
                    className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Service
                  </button>
                )}

                {service.products && service.products.length > 0 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                      <div className="text-sm text-yellow-800">
                        This service cannot be deleted because it's assigned to {service.products.length} product{service.products.length > 1 ? 's' : ''}.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
