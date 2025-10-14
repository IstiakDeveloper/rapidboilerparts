import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Edit, Trash2, Copy, Star, Package, Eye, User, Calendar, DollarSign, Warehouse, Settings, Image as ImageIcon } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  barcode: string;
  short_description: string;
  description: string;
  price: string | number;
  sale_price: string | number | null;
  cost_price: string | number | null;
  stock_quantity: number;
  low_stock_threshold: number;
  manufacturer_part_number: string;
  gc_number: string;
  weight: string | number | null;
  length: string | number | null;
  width: string | number | null;
  height: string | number | null;
  meta_title: string;
  meta_description: string;
  status: string;
  is_featured: boolean;
  manage_stock: boolean;
  created_at: string;
  updated_at: string;
  brand: Brand;
  category: Category;
  images: ProductImage[];
  attribute_values: AttributeValue[];
  compatible_models: CompatibleModel[];
  reviews: Review[];
  services: Service[];
}

interface Brand {
  id: number;
  name: string;
  slug: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface ProductImage {
  id: number;
  image_path: string;
  alt_text: string;
  sort_order: number;
  is_primary: boolean;
}

interface AttributeValue {
  id: number;
  value: string;
  attribute: {
    id: number;
    name: string;
    type: string;
  };
}

interface CompatibleModel {
  id: number;
  brand_name: string;
  model_name: string;
  model_code: string;
}

interface Review {
  id: number;
  rating: number;
  title: string;
  comment: string;
  user: {
    id: number;
    first_name: string;
    last_name: string;
  };
  created_at: string;
}

interface Service {
  id: number;
  name: string;
  type: string;
  price: number;
  pivot: {
    custom_price: number;
    is_mandatory: boolean;
    is_free: boolean;
  };
}

interface PageProps {
  product: Product;
}

export default function Show({ product }: PageProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      draft: 'bg-yellow-100 text-yellow-800'
    };
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { text: 'Out of Stock', color: 'text-red-600' };
    if (quantity <= product.low_stock_threshold) return { text: 'Low Stock', color: 'text-yellow-600' };
    return { text: 'In Stock', color: 'text-green-600' };
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      router.delete(`/admin/products/${product.id}`);
    }
  };

  const handleDuplicate = () => {
    router.post(`/admin/products/${product.id}/duplicate`);
  };

  const stockStatus = getStockStatus(product.stock_quantity);
  const price = parseFloat(product.price.toString());
  const salePrice = product.sale_price ? parseFloat(product.sale_price.toString()) : null;
  const costPrice = product.cost_price ? parseFloat(product.cost_price.toString()) : null;
  const finalPrice = salePrice || price;
  const hasDiscount = salePrice && salePrice < price;
  const discountPercent = hasDiscount ? Math.round(((price - salePrice) / price) * 100) : 0;

  return (
    <AdminLayout>
      <Head title={product.name} />

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
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                {product.is_featured && (
                  <Star className="w-6 h-6 text-yellow-500 fill-current" />
                )}
                {getStatusBadge(product.status)}
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <span>SKU: {product.sku}</span>
                <span>•</span>
                <span>Barcode: {product.barcode}</span>
                <span>•</span>
                <span>Created: {new Date(product.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDuplicate}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Duplicate
            </button>
            <button
              onClick={() => router.visit(`/admin/products/${product.id}/edit`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
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
            {/* Product Images */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Product Images ({product.images?.length || 0})
                </h3>
              </div>
              <div className="p-6">
                {product.images && product.images.length > 0 ? (
                  <div className="space-y-4">
                    {/* Main Image */}
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={`/storage/${product.images[selectedImageIndex]?.image_path}`}
                        alt={product.images[selectedImageIndex]?.alt_text || product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Image Thumbnails */}
                    {product.images.length > 1 && (
                      <div className="grid grid-cols-6 gap-2">
                        {product.images.map((image, index) => (
                          <button
                            key={image.id}
                            onClick={() => setSelectedImageIndex(index)}
                            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                              selectedImageIndex === index ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <img
                              src={`/storage/${image.image_path}`}
                              alt={image.alt_text || `Image ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {image.is_primary && (
                              <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
                                P
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No images available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Description</h3>
              </div>
              <div className="p-6 space-y-4">
                {product.short_description && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Short Description</h4>
                    <p className="text-gray-600">{product.short_description}</p>
                  </div>
                )}

                {product.description && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Full Description</h4>
                    <div className="prose prose-sm max-w-none text-gray-600">
                      {product.description.split('\n').map((paragraph, index) => (
                        <p key={index} className="mb-2">{paragraph}</p>
                      ))}
                    </div>
                  </div>
                )}

                {!product.short_description && !product.description && (
                  <p className="text-gray-500 italic">No description available</p>
                )}
              </div>
            </div>

            {/* Attributes */}
            {product.attribute_values && product.attribute_values.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Product Attributes</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.attribute_values.map((attr) => (
                      <div key={attr.id} className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                        <span className="font-medium text-gray-700">{attr.attribute.name}:</span>
                        <span className="text-gray-600">{attr.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Compatible Models */}
            {product.compatible_models && product.compatible_models.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Compatible Models</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {product.compatible_models.map((model) => (
                      <div key={model.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="font-medium text-gray-900">{model.brand_name}</div>
                        <div className="text-sm text-gray-600">{model.model_name}</div>
                        {model.model_code && (
                          <div className="text-xs text-gray-500 font-mono">{model.model_code}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Services */}
            {product.services && product.services.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Available Services
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {product.services.map((service) => (
                      <div key={service.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{service.name}</div>
                          <div className="text-sm text-gray-600 capitalize">{service.type} Service</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            {service.pivot.is_free ? (
                              'Free'
                            ) : (
                              `£${Number(service.pivot.custom_price || service.price).toFixed(2)}`
                            )}
                          </div>
                          {service.pivot.is_mandatory && (
                            <div className="text-xs text-blue-600 font-medium">Required</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Reviews */}
            {product.reviews && product.reviews.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Customer Reviews ({product.reviews.length})
                  </h3>
                </div>
                <div className="p-6 space-y-6">
                  {product.reviews.slice(0, 5).map((review) => (
                    <div key={review.id} className="border-b border-gray-100 last:border-b-0 pb-6 last:pb-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-medium text-gray-900">
                            {review.user.first_name} {review.user.last_name}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      {review.title && (
                        <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
                      )}
                      {review.comment && (
                        <p className="text-gray-600">{review.comment}</p>
                      )}
                    </div>
                  ))}
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
                  <span className="text-gray-600">Views</span>
                  <span className="font-medium text-gray-900">-</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Reviews</span>
                  <span className="font-medium text-gray-900">{product.reviews?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Images</span>
                  <span className="font-medium text-gray-900">{product.images?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="font-medium text-gray-900">
                    {new Date(product.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Pricing Info */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Pricing
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Regular Price</span>
                  <span className="font-medium text-gray-900">£{price.toFixed(2)}</span>
                </div>

                {salePrice && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Sale Price</span>
                      <span className="font-medium text-green-600">£{salePrice.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Discount</span>
                      <span className="font-medium text-red-600">{discountPercent}% OFF</span>
                    </div>
                  </>
                )}

                {costPrice && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Cost Price</span>
                    <span className="font-medium text-gray-900">£{costPrice.toFixed(2)}</span>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900 font-medium">Final Price</span>
                    <span className="text-xl font-bold text-green-600">£{finalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Inventory Info */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Warehouse className="w-5 h-5" />
                  Inventory
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Current Stock</span>
                  <span className="font-medium text-gray-900">{product.stock_quantity}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={`font-medium ${stockStatus.color}`}>{stockStatus.text}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Low Stock Alert</span>
                  <span className="font-medium text-gray-900">{product.low_stock_threshold}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Stock Management</span>
                  <span className="font-medium text-gray-900">
                    {product.manage_stock ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Product Details</h3>
              </div>
              <div className="p-6 space-y-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Brand</span>
                  <span className="font-medium text-gray-900">{product.brand.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Category</span>
                  <span className="font-medium text-gray-900">{product.category.name}</span>
                </div>

                {product.manufacturer_part_number && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">MPN</span>
                    <span className="font-medium text-gray-900 font-mono text-xs">
                      {product.manufacturer_part_number}
                    </span>
                  </div>
                )}

                {product.gc_number && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">GC Number</span>
                    <span className="font-medium text-gray-900 font-mono text-xs">{product.gc_number}</span>
                  </div>
                )}

                {product.barcode && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Barcode</span>
                    <span className="font-medium text-gray-900 font-mono text-xs">{product.barcode}</span>
                  </div>
                )}

                {(product.weight || product.length || product.width || product.height) && (
                  <div className="pt-4 border-t border-gray-100">
                    <div className="text-gray-600 font-medium mb-3">Dimensions</div>
                    <div className="space-y-2">
                      {product.weight && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Weight</span>
                          <span className="font-medium text-gray-900">{product.weight} kg</span>
                        </div>
                      )}
                      {product.length && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Length</span>
                          <span className="font-medium text-gray-900">{product.length} cm</span>
                        </div>
                      )}
                      {product.width && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Width</span>
                          <span className="font-medium text-gray-900">{product.width} cm</span>
                        </div>
                      )}
                      {product.height && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Height</span>
                          <span className="font-medium text-gray-900">{product.height} cm</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Created</span>
                    <span className="font-medium text-gray-900">
                      {new Date(product.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
