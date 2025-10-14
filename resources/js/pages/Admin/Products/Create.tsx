import React, { useState, useCallback } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
  Package, Plus, X, Upload, ImageIcon, Settings, Tags, Wrench,
  AlertTriangle, Save, Eye, EyeOff, Star, StarOff
} from 'lucide-react';

interface Brand {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
}

interface ProductService {
  id: number;
  name: string;
  slug: string;
  description?: string;
  type: 'setup' | 'delivery' | 'installation' | 'maintenance' | 'other';
  price: number;
  is_optional: boolean;
  is_free: boolean;
}

interface ProductAttribute {
  id: number;
  name: string;
  slug: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'boolean';
  is_required: boolean;
  is_filterable: boolean;
}

interface CompatibleModel {
  id: number;
  brand_name: string;
  model_name: string;
  model_code?: string;
  year_from?: number;
  year_to?: number;
}

interface Props {
  brands: Brand[];
  categories: Category[];
  services: ProductService[];
  attributes: ProductAttribute[];
  compatibleModels: CompatibleModel[];
}

interface FormData {
  name: string;
  slug: string;
  short_description: string;
  description: string;
  sku: string;
  manufacturer_part_number: string;
  gc_number: string;
  price: string;
  sale_price: string;
  cost_price: string;
  stock_quantity: string;
  manage_stock: boolean;
  low_stock_threshold: string;
  meta_title: string;
  meta_description: string;
  status: 'active' | 'inactive' | 'draft';
  is_featured: boolean;
  brand_id: string;
  category_id: string;
  weight: string;
  length: string;
  width: string;
  height: string;
  images: FileList | null;
  services: Array<{
    service_id: number;
    custom_price?: number;
    is_mandatory: boolean;
    is_free: boolean;
    conditions?: Record<string, any>;
  }>;
  attributes: Array<{
    attribute_id: number;
    value: string;
  }>;
  compatible_models: number[];
}

export default function Create({ brands, categories, services, attributes, compatibleModels }: Props) {
  const [activeTab, setActiveTab] = useState('basic');
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<number[]>([]);
  const [selectedModels, setSelectedModels] = useState<number[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);

  const { data, setData, post, processing, errors, progress } = useForm<FormData>({
    name: '',
    slug: '',
    short_description: '',
    description: '',
    sku: '',
    manufacturer_part_number: '',
    gc_number: '',
    price: '',
    sale_price: '',
    cost_price: '',
    stock_quantity: '0',
    manage_stock: true,
    low_stock_threshold: '5',
    meta_title: '',
    meta_description: '',
    status: 'active',
    is_featured: false,
    brand_id: '',
    category_id: '',
    weight: '',
    length: '',
    width: '',
    height: '',
    images: null,
    services: [],
    attributes: [],
    compatible_models: [],
  });

  const generateSlug = useCallback((name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove all special characters except spaces and hyphens
      .replace(/\s+/g, '-')         // Replace spaces with hyphens
      .replace(/-+/g, '-')          // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, '');     // Remove hyphens from start and end
  }, []);

  const handleNameChange = (value: string) => {
    setData(prev => ({
      ...prev,
      name: value,
      slug: generateSlug(value)  // Always generate slug when name changes
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setData('images', files);

      const previews: string[] = [];
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            previews.push(e.target.result as string);
            if (previews.length === files.length) {
              setImagePreview([...previews]);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const addService = (serviceId: number) => {
    if (!selectedServices.includes(serviceId)) {
      const service = services.find(s => s.id === serviceId);
      if (service) {
        setSelectedServices([...selectedServices, serviceId]);
        setData('services', [
          ...data.services,
          {
            service_id: serviceId,
            custom_price: service.price,
            is_mandatory: !service.is_optional,
            is_free: service.is_free,
            conditions: {}
          }
        ]);
      }
    }
  };

  const removeService = (serviceId: number) => {
    setSelectedServices(selectedServices.filter(id => id !== serviceId));
    setData('services', data.services.filter(s => s.service_id !== serviceId));
  };

  const updateService = (serviceId: number, field: string, value: any) => {
    setData('services', data.services.map(s =>
      s.service_id === serviceId ? { ...s, [field]: value } : s
    ));
  };

  const addAttribute = (attributeId: number) => {
    if (!selectedAttributes.includes(attributeId)) {
      setSelectedAttributes([...selectedAttributes, attributeId]);
      setData('attributes', [
        ...data.attributes,
        { attribute_id: attributeId, value: '' }
      ]);
    }
  };

  const removeAttribute = (attributeId: number) => {
    setSelectedAttributes(selectedAttributes.filter(id => id !== attributeId));
    setData('attributes', data.attributes.filter(a => a.attribute_id !== attributeId));
  };

  const updateAttribute = (attributeId: number, value: string) => {
    setData('attributes', data.attributes.map(a =>
      a.attribute_id === attributeId ? { ...a, value } : a
    ));
  };

  const toggleModel = (modelId: number) => {
    const newModels = selectedModels.includes(modelId)
      ? selectedModels.filter(id => id !== modelId)
      : [...selectedModels, modelId];

    setSelectedModels(newModels);
    setData('compatible_models', newModels);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/admin/products', {
      onSuccess: () => {
        router.visit('/admin/products');
      },
    });
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Package },
    { id: 'images', label: 'Images', icon: ImageIcon },
    { id: 'services', label: 'Services', icon: Wrench },
    { id: 'attributes', label: 'Attributes', icon: Tags },
    { id: 'compatibility', label: 'Compatibility', icon: Settings },
  ];

  const StatusBadge = ({ type }: { type: string }) => {
    const colors = {
      setup: 'bg-blue-100 text-blue-800',
      delivery: 'bg-green-100 text-green-800',
      installation: 'bg-purple-100 text-purple-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[type as keyof typeof colors] || colors.other}`}>
        {type}
      </span>
    );
  };

  return (
    <AdminLayout>
      <Head title="Create Product" />

      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Product</h1>
            <p className="text-gray-600 mt-2">Add a new product to your boiler parts inventory</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.visit('/admin/products')}
              className="px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={processing}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Package className="h-4 w-4" />
              {processing ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-800">Please fix the following errors:</h3>
                <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                  {Object.entries(errors).map(([key, message]) => (
                    <li key={key}>{message}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    {/* Product Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h3>
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Product Name *
                            </label>
                            <input
                              type="text"
                              value={data.name}
                              onChange={(e) => handleNameChange(e.target.value)}
                              placeholder="Enter product name"
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                errors.name ? 'border-red-300' : 'border-gray-300'
                              }`}
                            />
                            {errors.name && (
                              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                <AlertTriangle className="h-4 w-4" />
                                {errors.name}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              URL Slug
                            </label>
                            <input
                              type="text"
                              value={data.slug}
                              onChange={(e) => setData('slug', e.target.value)}
                              placeholder="product-url-slug"
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                errors.slug ? 'border-red-300' : 'border-gray-300'
                              }`}
                            />
                            {errors.slug && (
                              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                <AlertTriangle className="h-4 w-4" />
                                {errors.slug}
                              </p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Short Description
                          </label>
                          <textarea
                            value={data.short_description}
                            onChange={(e) => setData('short_description', e.target.value)}
                            placeholder="Brief product description"
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Description
                          </label>
                          <textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Detailed product description"
                            rows={6}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Product Codes */}
                    <div className="border-t border-gray-200 pt-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Codes & Numbers</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            SKU *
                          </label>
                          <input
                            type="text"
                            value={data.sku}
                            onChange={(e) => setData('sku', e.target.value)}
                            placeholder="Product SKU"
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                              errors.sku ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                          {errors.sku && (
                            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                              <AlertTriangle className="h-4 w-4" />
                              {errors.sku}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Barcode <span className="text-gray-500 text-xs">(Auto-generated)</span>
                          </label>
                          <input
                            type="text"
                            disabled
                            placeholder="Will be generated automatically"
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                          />
                          <p className="mt-1 text-sm text-gray-500">Format: RBP-BBCC-YYMMDD-RRR</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Manufacturer Part Number
                          </label>
                          <input
                            type="text"
                            value={data.manufacturer_part_number}
                            onChange={(e) => setData('manufacturer_part_number', e.target.value)}
                            placeholder="Manufacturer part number"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            GC Number
                          </label>
                          <input
                            type="text"
                            value={data.gc_number}
                            onChange={(e) => setData('gc_number', e.target.value)}
                            placeholder="GC reference number"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Pricing & Inventory */}
                    <div className="border-t border-gray-200 pt-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing & Inventory</h3>
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Price (£) *
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={data.price}
                              onChange={(e) => setData('price', e.target.value)}
                              placeholder="0.00"
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                errors.price ? 'border-red-300' : 'border-gray-300'
                              }`}
                            />
                            {errors.price && (
                              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                <AlertTriangle className="h-4 w-4" />
                                {errors.price}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Sale Price (£)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={data.sale_price}
                              onChange={(e) => setData('sale_price', e.target.value)}
                              placeholder="0.00"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Cost Price (£)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={data.cost_price}
                              onChange={(e) => setData('cost_price', e.target.value)}
                              placeholder="0.00"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Stock Quantity *
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={data.stock_quantity}
                              onChange={(e) => setData('stock_quantity', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Low Stock Threshold *
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={data.low_stock_threshold}
                              onChange={(e) => setData('low_stock_threshold', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <input
                            id="manage_stock"
                            type="checkbox"
                            checked={data.manage_stock}
                            onChange={(e) => setData('manage_stock', e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="manage_stock" className="text-sm font-medium text-gray-700">
                            Manage stock quantity for this product
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-8">
                    {/* Organization */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Organization</h3>
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Brand *
                          </label>
                          <select
                            value={data.brand_id}
                            onChange={(e) => setData('brand_id', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                              errors.brand_id ? 'border-red-300' : 'border-gray-300'
                            }`}
                          >
                            <option value="">Select brand</option>
                            {brands.map((brand) => (
                              <option key={brand.id} value={brand.id}>
                                {brand.name}
                              </option>
                            ))}
                          </select>
                          {errors.brand_id && (
                            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                              <AlertTriangle className="h-4 w-4" />
                              {errors.brand_id}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category *
                          </label>
                          <select
                            value={data.category_id}
                            onChange={(e) => setData('category_id', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                              errors.category_id ? 'border-red-300' : 'border-gray-300'
                            }`}
                          >
                            <option value="">Select category</option>
                            {categories.map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                          {errors.category_id && (
                            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                              <AlertTriangle className="h-4 w-4" />
                              {errors.category_id}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                          </label>
                          <select
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value as 'active' | 'inactive' | 'draft')}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="draft">Draft</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-3">
                          <input
                            id="is_featured"
                            type="checkbox"
                            checked={data.is_featured}
                            onChange={(e) => setData('is_featured', e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="is_featured" className="text-sm font-medium text-gray-700">
                            Featured product
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Images Tab */}
            {activeTab === 'images' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h3>
                  <p className="text-gray-600 mb-6">Upload product images. First image will be set as primary.</p>

                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Upload Images</h4>
                    <p className="text-gray-600 mb-4">PNG, JPG, JPEG, WEBP up to 2MB each</p>
                    <button
                      type="button"
                      onClick={() => document.getElementById('image-upload')?.click()}
                      className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Choose Files
                    </button>
                  </div>

                  {imagePreview.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
                      {imagePreview.map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          />
                          {index === 0 && (
                            <span className="absolute top-2 left-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                              Primary
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Services Tab */}
            {activeTab === 'services' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Services</h3>
                  <p className="text-gray-600 mb-6">Add services like setup, delivery, installation for this product</p>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4">Available Services</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {services.filter(service => !selectedServices.includes(service.id)).map((service) => (
                          <div
                            key={service.id}
                            className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => addService(service.id)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-gray-900">{service.name}</h5>
                              <StatusBadge type={service.type} />
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-gray-900">£{service.price}</span>
                              <div className="flex items-center gap-2">
                                {service.is_free && (
                                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                                    Free
                                  </span>
                                )}
                                {!service.is_optional && (
                                  <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                                    Required
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {data.services.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Selected Services</h4>
                        <div className="space-y-4">
                          {data.services.map((serviceData) => {
                            const service = services.find(s => s.id === serviceData.service_id);
                            if (!service) return null;

                            return (
                              <div key={service.id} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                    <h5 className="font-medium text-gray-900">{service.name}</h5>
                                    <StatusBadge type={service.type} />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeService(service.id)}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Custom Price (£)
                                    </label>
                                    <input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      value={serviceData.custom_price || service.price}
                                      onChange={(e) => updateService(service.id, 'custom_price', parseFloat(e.target.value))}
                                      placeholder={service.price.toString()}
                                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Service Options
                                    </label>
                                    <div className="space-y-3">
                                      <div className="flex items-center gap-3">
                                        <input
                                          id={`mandatory-${service.id}`}
                                          type="checkbox"
                                          checked={serviceData.is_mandatory}
                                          onChange={(e) => updateService(service.id, 'is_mandatory', e.target.checked)}
                                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor={`mandatory-${service.id}`} className="text-sm text-gray-700">
                                          Mandatory for this product
                                        </label>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <input
                                          id={`free-${service.id}`}
                                          type="checkbox"
                                          checked={serviceData.is_free}
                                          onChange={(e) => updateService(service.id, 'is_free', e.target.checked)}
                                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor={`free-${service.id}`} className="text-sm text-gray-700">
                                          Free for this product
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Attributes Tab */}
            {activeTab === 'attributes' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Attributes</h3>
                  <p className="text-gray-600 mb-6">Add custom attributes and specifications for this product</p>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4">Available Attributes</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {attributes.filter(attr => !selectedAttributes.includes(attr.id)).map((attribute) => (
                          <div
                            key={attribute.id}
                            className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => addAttribute(attribute.id)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-gray-900">{attribute.name}</h5>
                              <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full font-medium">
                                {attribute.type}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {attribute.is_required && (
                                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                                  Required
                                </span>
                              )}
                              {attribute.is_filterable && (
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                                  Filterable
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {data.attributes.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Selected Attributes</h4>
                        <div className="space-y-4">
                          {data.attributes.map((attrData) => {
                            const attribute = attributes.find(a => a.id === attrData.attribute_id);
                            if (!attribute) return null;

                            return (
                              <div key={attribute.id} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                    <h5 className="font-medium text-gray-900">{attribute.name}</h5>
                                    <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full font-medium">
                                      {attribute.type}
                                    </span>
                                    {attribute.is_required && (
                                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                                        Required
                                      </span>
                                    )}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeAttribute(attribute.id)}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Value
                                  </label>
                                  {attribute.type === 'boolean' ? (
                                    <div className="flex items-center gap-3">
                                      <input
                                        id={`attr-${attribute.id}`}
                                        type="checkbox"
                                        checked={attrData.value === 'true'}
                                        onChange={(e) => updateAttribute(attribute.id, e.target.checked ? 'true' : 'false')}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                      />
                                      <label htmlFor={`attr-${attribute.id}`} className="text-sm text-gray-700">
                                        Yes
                                      </label>
                                    </div>
                                  ) : attribute.type === 'number' ? (
                                    <input
                                      type="number"
                                      value={attrData.value}
                                      onChange={(e) => updateAttribute(attribute.id, e.target.value)}
                                      placeholder="Enter number value"
                                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                  ) : (
                                    <input
                                      type="text"
                                      value={attrData.value}
                                      onChange={(e) => updateAttribute(attribute.id, e.target.value)}
                                      placeholder="Enter attribute value"
                                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Compatibility Tab */}
            {activeTab === 'compatibility' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Boiler Compatibility</h3>
                  <p className="text-gray-600 mb-6">Select compatible boiler models for this part</p>

                  <div className="space-y-8">
                    {Object.entries(
                      compatibleModels.reduce((groups, model) => {
                        if (!groups[model.brand_name]) {
                          groups[model.brand_name] = [];
                        }
                        groups[model.brand_name].push(model);
                        return groups;
                      }, {} as Record<string, CompatibleModel[]>)
                    ).map(([brandName, models]) => (
                      <div key={brandName}>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">{brandName}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {models.map((model) => (
                            <div
                              key={model.id}
                              className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                                selectedModels.includes(model.id)
                                  ? 'bg-blue-50 border-blue-200'
                                  : 'border-gray-200 hover:bg-gray-50'
                              }`}
                              onClick={() => toggleModel(model.id)}
                            >
                              <div className="flex items-start gap-3">
                                <input
                                  type="checkbox"
                                  checked={selectedModels.includes(model.id)}
                                  onChange={() => {}}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
                                />
                                <div className="flex-1">
                                  <p className="font-medium text-sm text-gray-900">{model.model_name}</p>
                                  {model.model_code && (
                                    <p className="text-xs text-gray-600 mt-1">{model.model_code}</p>
                                  )}
                                  {(model.year_from || model.year_to) && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      {model.year_from && model.year_to
                                        ? `${model.year_from} - ${model.year_to}`
                                        : model.year_from
                                        ? `From ${model.year_from}`
                                        : `Until ${model.year_to}`}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedModels.length > 0 && (
                    <div className="mt-8 bg-gray-50 rounded-xl p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">
                        Selected Models ({selectedModels.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedModels.map(modelId => {
                          const model = compatibleModels.find(m => m.id === modelId);
                          return model ? (
                            <span
                              key={model.id}
                              className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                            >
                              {model.brand_name} {model.model_name}
                              <button
                                type="button"
                                onClick={() => toggleModel(model.id)}
                                className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Form Footer */}
            <div className="border-t border-gray-200 bg-gray-50 -m-6 mt-8 px-6 py-4 rounded-b-xl">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => router.visit('/admin/products')}
                  className="px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setData('status', 'draft');
                      handleSubmit;
                    }}
                    disabled={processing}
                    className="px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Save as Draft
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <Package className="h-4 w-4" />
                    {processing ? 'Creating...' : 'Create Product'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
