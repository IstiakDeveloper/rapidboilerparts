import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { ArrowLeft, Save, Upload, X, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

interface Brand {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
}

interface Attribute {
  id: number;
  name: string;
  slug: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'boolean';
}

interface CompatibleModel {
  id: number;
  brand_name: string;
  model_name: string;
  model_code: string;
}

interface Service {
  id: number;
  name: string;
  type: string;
  price: number;
  is_optional: boolean;
}

interface PageProps {
  brands: Brand[];
  categories: Category[];
  attributes: Attribute[];
  compatible_models: CompatibleModel[];
  services: Service[];
}

export default function Create({ brands, categories, attributes, compatible_models, services }: PageProps) {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);

  const { data, setData, post, processing, errors } = useForm({
    name: '',
    slug: '',
    sku: '',
    brand_id: '',
    category_id: '',
    short_description: '',
    description: '',
    price: '',
    sale_price: '',
    cost_price: '',
    stock_quantity: '',
    low_stock_threshold: '5',
    manufacturer_part_number: '',
    gc_number: '',
    weight: '',
    length: '',
    width: '',
    height: '',
    meta_title: '',
    meta_description: '',
    status: 'active',
    is_featured: false,
    manage_stock: true,
    attributes: {} as Record<number, string>,
    compatible_models: [] as number[],
    services: [] as Array<{service_id: number, custom_price: string, is_mandatory: boolean, is_free: boolean}>,
    images: [] as File[],
    image_alts: [] as string[],
    primary_image_index: 0,
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedImages.length > 10) {
      alert('Maximum 10 images allowed');
      return;
    }

    const newImages = [...selectedImages, ...files];
    setSelectedImages(newImages);
    setData('images', newImages);

    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);

    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
    setData('images', newImages);

    if (primaryImageIndex === index) {
      setPrimaryImageIndex(0);
      setData('primary_image_index', 0);
    } else if (primaryImageIndex > index) {
      setPrimaryImageIndex(primaryImageIndex - 1);
      setData('primary_image_index', primaryImageIndex - 1);
    }
  };

  const setPrimaryImage = (index: number) => {
    setPrimaryImageIndex(index);
    setData('primary_image_index', index);
  };

  const handleAttributeChange = (attributeId: number, value: string) => {
    setData('attributes', {
      ...data.attributes,
      [attributeId]: value
    });
  };

  const handleCompatibleModelToggle = (modelId: number) => {
    const currentModels = data.compatible_models;
    const isSelected = currentModels.includes(modelId);

    if (isSelected) {
      setData('compatible_models', currentModels.filter(id => id !== modelId));
    } else {
      setData('compatible_models', [...currentModels, modelId]);
    }
  };

  const addService = () => {
    setData('services', [
      ...data.services,
      { service_id: 0, custom_price: '', is_mandatory: false, is_free: false }
    ]);
  };

  const removeService = (index: number) => {
    setData('services', data.services.filter((_, i) => i !== index));
  };

  const updateService = (index: number, field: string, value: any) => {
    const updatedServices = [...data.services];
    updatedServices[index] = { ...updatedServices[index], [field]: value };
    setData('services', updatedServices);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/admin/products');
  };

  return (
    <AdminLayout>
      <Head title="Create Product" />

      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.visit('/admin/products')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Product</h1>
              <p className="text-gray-600 mt-2">Add a new product to your catalog</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                  <input
                    type="text"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter product name"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SKU *</label>
                  <input
                    type="text"
                    value={data.sku}
                    onChange={(e) => setData('sku', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.sku ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter SKU"
                  />
                  {errors.sku && <p className="mt-1 text-sm text-red-600">{errors.sku}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brand *</label>
                  <select
                    value={data.brand_id}
                    onChange={(e) => setData('brand_id', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.brand_id ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Brand</option>
                    {brands.map(brand => (
                      <option key={brand.id} value={brand.id}>{brand.name}</option>
                    ))}
                  </select>
                  {errors.brand_id && <p className="mt-1 text-sm text-red-600">{errors.brand_id}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    value={data.category_id}
                    onChange={(e) => setData('category_id', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.category_id ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                  {errors.category_id && <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Manufacturer Part Number</label>
                  <input
                    type="text"
                    value={data.manufacturer_part_number}
                    onChange={(e) => setData('manufacturer_part_number', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter part number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">GC Number</label>
                  <input
                    type="text"
                    value={data.gc_number}
                    onChange={(e) => setData('gc_number', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter GC number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Short Description</label>
                <textarea
                  value={data.short_description}
                  onChange={(e) => setData('short_description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Brief product description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Detailed product description"
                />
              </div>
            </div>
          </div>

          {/* Product Images */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Product Images</h3>
              <p className="text-sm text-gray-600 mt-1">Upload up to 10 images. First image will be primary.</p>
            </div>
            <div className="p-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center justify-center gap-4"
                >
                  <Upload className="w-12 h-12 text-gray-400" />
                  <div className="text-center">
                    <p className="text-lg font-medium text-gray-900">Drop images here or click to upload</p>
                    <p className="text-sm text-gray-600">PNG, JPG, GIF up to 2MB each (Max 10 images)</p>
                  </div>
                </label>
              </div>

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-6">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <div className={`relative border-2 rounded-lg overflow-hidden ${
                        primaryImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                      }`}>
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover"
                        />
                        {primaryImageIndex === index && (
                          <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                            Primary
                          </div>
                        )}
                        <div className="absolute top-2 right-2 flex gap-1">
                          {primaryImageIndex !== index && (
                            <button
                              type="button"
                              onClick={() => setPrimaryImage(index)}
                              className="bg-white/90 hover:bg-white text-gray-700 p-1 rounded text-xs transition-colors"
                              title="Set as primary"
                            >
                              <ImageIcon className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="bg-red-500 hover:bg-red-600 text-white p-1 rounded transition-colors"
                            title="Remove image"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <input
                        type="text"
                        placeholder="Alt text"
                        className="w-full mt-2 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        onChange={(e) => {
                          const newAlts = [...data.image_alts];
                          newAlts[index] = e.target.value;
                          setData('image_alts', newAlts);
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Pricing & Inventory</h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Regular Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={data.price}
                    onChange={(e) => setData('price', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.price ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                  {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sale Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={data.sale_price}
                    onChange={(e) => setData('sale_price', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cost Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={data.cost_price}
                    onChange={(e) => setData('cost_price', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
                  <input
                    type="number"
                    value={data.stock_quantity}
                    onChange={(e) => setData('stock_quantity', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Low Stock Threshold</label>
                  <input
                    type="number"
                    value={data.low_stock_threshold}
                    onChange={(e) => setData('low_stock_threshold', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={data.status}
                    onChange={(e) => setData('status', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={data.manage_stock}
                    onChange={(e) => setData('manage_stock', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Manage Stock</span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={data.is_featured}
                    onChange={(e) => setData('is_featured', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Featured Product</span>
                </label>
              </div>
            </div>
          </div>

          {/* Physical Dimensions */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Physical Dimensions</h3>
              <p className="text-sm text-gray-600 mt-1">Product dimensions for shipping calculations</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={data.weight}
                    onChange={(e) => setData('weight', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Length (cm)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={data.length}
                    onChange={(e) => setData('length', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Width (cm)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={data.width}
                    onChange={(e) => setData('width', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={data.height}
                    onChange={(e) => setData('height', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Product Attributes */}
          {attributes && attributes.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Product Attributes</h3>
                <p className="text-sm text-gray-600 mt-1">Additional product specifications</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {attributes.map(attribute => (
                    <div key={attribute.id}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {attribute.name}
                      </label>
                      {attribute.type === 'text' && (
                        <input
                          type="text"
                          value={data.attributes[attribute.id] || ''}
                          onChange={(e) => handleAttributeChange(attribute.id, e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={`Enter ${attribute.name.toLowerCase()}`}
                        />
                      )}
                      {attribute.type === 'number' && (
                        <input
                          type="number"
                          step="0.01"
                          value={data.attributes[attribute.id] || ''}
                          onChange={(e) => handleAttributeChange(attribute.id, e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={`Enter ${attribute.name.toLowerCase()}`}
                        />
                      )}
                      {attribute.type === 'boolean' && (
                        <div className="flex items-center gap-3 mt-2">
                          <input
                            type="checkbox"
                            checked={data.attributes[attribute.id] === 'true'}
                            onChange={(e) => handleAttributeChange(attribute.id, e.target.checked ? 'true' : 'false')}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-600">Yes</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Compatible Models */}
          {compatible_models && compatible_models.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Compatible Boiler Models</h3>
                <p className="text-sm text-gray-600 mt-1">Select which boiler models this part is compatible with</p>
              </div>
              <div className="p-6">
                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                  {compatible_models.map(model => (
                    <div key={model.id} className="flex items-center p-3 border-b border-gray-100 last:border-b-0">
                      <input
                        type="checkbox"
                        id={`model-${model.id}`}
                        checked={data.compatible_models.includes(model.id)}
                        onChange={() => handleCompatibleModelToggle(model.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor={`model-${model.id}`} className="ml-3 flex-1 cursor-pointer">
                        <div className="font-medium text-gray-900">{model.brand_name} - {model.model_name}</div>
                        {model.model_code && (
                          <div className="text-sm text-gray-500">Code: {model.model_code}</div>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
                {data.compatible_models.length > 0 && (
                  <div className="mt-3 text-sm text-blue-600">
                    {data.compatible_models.length} model(s) selected
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Product Services */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Product Services</h3>
                <p className="text-sm text-gray-600 mt-1">Additional services available for this product</p>
              </div>
              <button
                type="button"
                onClick={addService}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Service
              </button>
            </div>
            <div className="p-6">
              {data.services.length > 0 ? (
                <div className="space-y-4">
                  {data.services.map((service, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Service</label>
                          <select
                            value={service.service_id}
                            onChange={(e) => updateService(index, 'service_id', parseInt(e.target.value))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value={0}>Select Service</option>
                            {services.map(s => (
                              <option key={s.id} value={s.id}>{s.name} - £{s.price}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Custom Price</label>
                          <input
                            type="number"
                            step="0.01"
                            value={service.custom_price}
                            onChange={(e) => updateService(index, 'custom_price', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Leave empty to use default"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={service.is_mandatory}
                              onChange={(e) => updateService(index, 'is_mandatory', e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">Mandatory</span>
                          </label>

                          <label className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={service.is_free}
                              onChange={(e) => updateService(index, 'is_free', e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">Free Service</span>
                          </label>
                        </div>

                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => removeService(index)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No services added yet. Click "Add Service" to add services for this product.</p>
                </div>
              )}
            </div>
          </div>

          {/* SEO Settings */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">SEO Settings</h3>
              <p className="text-sm text-gray-600 mt-1">Optimize your product for search engines</p>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
                <input
                  type="text"
                  value={data.meta_title}
                  onChange={(e) => setData('meta_title', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="SEO optimized title"
                  maxLength={60}
                />
                <p className="text-xs text-gray-500 mt-1">{data.meta_title.length}/60 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                <textarea
                  value={data.meta_description}
                  onChange={(e) => setData('meta_description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="SEO optimized description"
                  maxLength={160}
                />
                <p className="text-xs text-gray-500 mt-1">{data.meta_description.length}/160 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Slug</label>
                <input
                  type="text"
                  value={data.slug}
                  onChange={(e) => setData('slug', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Leave empty to auto-generate from product name"
                />
                <p className="text-xs text-gray-500 mt-1">URL-friendly version of the product name</p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 bg-gray-50 px-6 py-4 rounded-xl">
            <button
              type="button"
              onClick={() => router.visit('/admin/products')}
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
              {processing ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
