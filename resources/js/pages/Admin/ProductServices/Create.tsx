import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { ArrowLeft, Save, Settings, DollarSign, Hash, Info, Plus, X, Trash2 } from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';
import axios from 'axios';
import ReactDOM from 'react-dom';

interface ServiceType {
  id: number;
  name: string;
  slug: string;
  description: string;
  color: string;
  sort_order: number;
  is_active: boolean;
}

interface Props {
  serviceTypes: ServiceType[];
}

export default function Create({ serviceTypes: initialServiceTypes }: Props) {
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>(initialServiceTypes);
  const [showModal, setShowModal] = useState(false);
  const [isCreatingType, setIsCreatingType] = useState(false);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove all special characters except spaces and hyphens
      .replace(/\s+/g, '-')         // Replace spaces with hyphens
      .replace(/-+/g, '-')          // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, '');     // Remove hyphens from start and end
  };

  interface ServiceFormData {
    name: string;
    slug: string;
    description: string;
    type: string;
    service_type_id: number | null;
    price: string;
    is_optional: boolean;
    is_free: boolean;
    conditions: Array<{ key: string; value: string; }>;
    is_active: boolean;
    sort_order: number;
  }

  const { data, setData, post, processing, errors } = useForm<ServiceFormData>({
    name: '',
    slug: '',
    description: '',
    type: '',
    service_type_id: null,
    price: '',
    is_optional: true,
    is_free: false,
    conditions: [],
    is_active: true,
    sort_order: 0,
  });

  // Modal form state for new service type
  const [newServiceType, setNewServiceType] = useState({
    name: '',
    description: '',
    color: 'bg-gray-100 text-gray-800',
    sort_order: 0,
  });

  const [modalErrors, setModalErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/admin/product-services');
  };

  const handleNameChange = (value: string) => {
    setData(prev => ({
      ...prev,
      name: value,
      slug: generateSlug(value)  // Auto-generate slug from name
    }));
  };

  const handleCreateServiceType = async () => {
    setModalErrors({});

    if (!newServiceType.name.trim()) {
      setModalErrors({ name: 'Name is required' });
      return;
    }

    setIsCreatingType(true);

    try {
      const response = await axios.post('/admin/api/service-types', {
        name: newServiceType.name,
        description: newServiceType.description,
        color: newServiceType.color,
        sort_order: newServiceType.sort_order,
      }, {
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        }
      });

      const createdType = response.data.data;
      setServiceTypes([...serviceTypes, createdType]);

      // Auto-select the newly created type
      setData('service_type_id', createdType.id);
      setData('type', createdType.slug);

      // Reset modal form
      setNewServiceType({
        name: '',
        description: '',
        color: 'bg-gray-100 text-gray-800',
        sort_order: 0,
      });

      setShowModal(false);
    } catch (error: any) {
      console.error('Error creating service type:', error);
      console.error('Error response:', error.response);

      if (error.response?.data?.errors) {
        setModalErrors(error.response.data.errors);
      } else if (error.response?.data?.message) {
        setModalErrors({ general: error.response.data.message });
      } else {
        setModalErrors({ general: 'Failed to create service type. Please try again.' });
      }
    } finally {
      setIsCreatingType(false);
    }
  };

  const handleDeleteServiceType = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this service type?')) return;
    try {
      await axios.delete(`/admin/api/service-types/${id}`, {
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        }
      });
      setServiceTypes(serviceTypes.filter(type => type.id !== id));
      // If deleted type was selected, clear selection
      if (data.service_type_id === id) {
        setData('service_type_id', null);
        setData('type', '');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete service type.');
    }
  };

  const colorOptions = [
    { value: 'bg-blue-100 text-blue-800', label: 'Blue' },
    { value: 'bg-green-100 text-green-800', label: 'Green' },
    { value: 'bg-purple-100 text-purple-800', label: 'Purple' },
    { value: 'bg-orange-100 text-orange-800', label: 'Orange' },
    { value: 'bg-red-100 text-red-800', label: 'Red' },
    { value: 'bg-yellow-100 text-yellow-800', label: 'Yellow' },
    { value: 'bg-pink-100 text-pink-800', label: 'Pink' },
    { value: 'bg-indigo-100 text-indigo-800', label: 'Indigo' },
    { value: 'bg-gray-100 text-gray-800', label: 'Gray' },
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

  const ModalPortal = ({ children }: { children: React.ReactNode }) => {
    if (typeof window === 'undefined') return null;
    const el = document.getElementById('modal-root') || document.body;
    return ReactDOM.createPortal(children, el);
  };

  return (
    <AdminLayout>
      <Head title="Create Product Service" />

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
              <h1 className="text-3xl font-bold text-gray-900">Create Product Service</h1>
              <p className="text-gray-600 mt-2">Add a new service that can be assigned to products</p>
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
                    onChange={(e) => handleNameChange(e.target.value)}
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
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Service Type *</h3>
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Add New Type
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {serviceTypes.map((type) => (
                  <label
                    key={type.id}
                    className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      data.service_type_id === type.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="service_type_id"
                      value={type.id}
                      checked={data.service_type_id === type.id}
                      onChange={() => {
                        setData('service_type_id', type.id);
                        setData('type', type.slug);
                      }}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${type.color}`}>
                        {type.name}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">{type.description || 'No description'}</div>
                  </label>
                ))}
              </div>
              {errors.service_type_id && (
                <p className="mt-3 text-sm text-red-600">{errors.service_type_id}</p>
              )}
              {serviceTypes.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No service types available. Click "Add New Type" to create one.</p>
                </div>
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

          {/* Conditions (Optional) */}
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
              onClick={() => router.visit('/admin/product-services')}
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
              {processing ? 'Creating...' : 'Create Service'}
            </button>
          </div>
        </form>

        {/* Modal for Creating New Service Type */}
        {showModal && (
          <ModalPortal>
            <div className="fixed inset-0 flex items-center justify-center w-screen h-screen bg-gray-900/75 p-0 m-0" style={{ zIndex: 9999 }}>
              <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative flex flex-col justify-center" style={{ zIndex: 10000 }}>
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                  <h2 className="text-xl font-bold text-gray-900">Create New Service Type</h2>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setModalErrors({});
                      setNewServiceType({
                        name: '',
                        description: '',
                        color: 'bg-gray-100 text-gray-800',
                        sort_order: 0,
                      });
                    }}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {modalErrors.general && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                      {modalErrors.general}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type Name *
                    </label>
                    <input
                      type="text"
                      value={newServiceType.name}
                      onChange={(e) => setNewServiceType({ ...newServiceType, name: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        modalErrors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="e.g., Express Delivery"
                    />
                    {modalErrors.name && (
                      <p className="mt-1 text-sm text-red-600">{modalErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={newServiceType.description}
                      onChange={(e) => setNewServiceType({ ...newServiceType, description: e.target.value })}
                      rows={3}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        modalErrors.description ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Describe this service type..."
                    />
                    {modalErrors.description && (
                      <p className="mt-1 text-sm text-red-600">{modalErrors.description}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color Theme
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {colorOptions.map((colorOption) => (
                        <label
                          key={colorOption.value}
                          className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                            newServiceType.color === colorOption.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="color"
                            value={colorOption.value}
                            checked={newServiceType.color === colorOption.value}
                            onChange={(e) => setNewServiceType({ ...newServiceType, color: e.target.value })}
                            className="sr-only"
                          />
                          <div className={`px-4 py-2 rounded-full text-sm font-medium ${colorOption.value}`}>
                            {colorOption.label}
                          </div>
                        </label>
                      ))}
                    </div>
                    {modalErrors.color && (
                      <p className="mt-1 text-sm text-red-600">{modalErrors.color}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newServiceType.sort_order}
                      onChange={(e) => setNewServiceType({ ...newServiceType, sort_order: parseInt(e.target.value) || 0 })}
                      className={`w-full md:w-48 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        modalErrors.sort_order ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="0"
                    />
                    {modalErrors.sort_order && (
                      <p className="mt-1 text-sm text-red-600">{modalErrors.sort_order}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Lower numbers appear first
                    </p>
                  </div>

                  {/* Existing Service Types List */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Existing Service Types</label>
                    <div className="space-y-2">
                      {serviceTypes.length === 0 && (
                        <div className="text-gray-500 text-sm">No service types available.</div>
                      )}
                      {serviceTypes.map(type => (
                        <div key={type.id} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${type.color}`}>{type.name}</span>
                            <span className="text-xs text-gray-500">({type.slug})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteServiceType(type.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-4 sticky bottom-0">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setModalErrors({});
                      setNewServiceType({
                        name: '',
                        description: '',
                        color: 'bg-gray-100 text-gray-800',
                        sort_order: 0,
                      });
                    }}
                    className="px-6 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateServiceType}
                    disabled={isCreatingType}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    {isCreatingType ? 'Creating...' : 'Create Type'}
                  </button>
                </div>
              </div>
            </div>
          </ModalPortal>
        )}
      </div>
    </AdminLayout>
  );
}
