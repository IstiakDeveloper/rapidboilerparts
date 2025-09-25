import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Copy,
  Star,
  Package,
  DollarSign,
  Eye,
  ShoppingCart,
  Heart,
  TrendingUp,
  Calendar,
  Tag,
  Truck,
  Globe,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  MessageCircle,
  ImageIcon,
  Settings,
  BarChart3,
} from 'lucide-react';

interface Brand {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
}

interface ProductImage {
  id: number;
  image_path: string;
  alt_text: string | null;
  is_primary: boolean;
  sort_order: number;
}

interface ProductAttributeValue {
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
  model_code: string | null;
}

interface Review {
  id: number;
  rating: number;
  title: string | null;
  comment: string | null;
  created_at: string;
  user: {
    id: number;
    first_name: string;
    last_name: string;
  };
}

interface Product {
  id: number;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  sku: string;
  manufacturer_part_number: string | null;
  gc_number: string | null;
  price: number;
  sale_price: number | null;
  cost_price: number | null;
  stock_quantity: number;
  low_stock_threshold: number;
  manage_stock: boolean;
  in_stock: boolean;
  meta_title: string | null;
  meta_description: string | null;
  status: 'active' | 'inactive' | 'draft';
  is_featured: boolean;
  weight: number | null;
  length: number | null;
  width: number | null;
  height: number | null;
  created_at: string;
  updated_at: string;
  brand: Brand;
  category: Category;
  images: ProductImage[];
  attributeValues: ProductAttributeValue[];
  compatibleModels: CompatibleModel[];
  reviews: Review[];
}

interface Stats {
  total_sold: number;
  revenue: number;
  avg_rating: number;
  total_reviews: number;
  in_wishlist: number;
  in_cart: number;
}

interface Props {
  product: Product;
  stats: Stats;
}

export default function ProductShow({ product, stats }: Props) {
  const [selectedImage, setSelectedImage] = useState(
    product.images.find(img => img.is_primary) || product.images[0]
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-red-100 text-red-800 border-red-200',
      draft: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };

    const icons = {
      active: CheckCircle,
      inactive: XCircle,
      draft: AlertTriangle,
    };

    const Icon = icons[status as keyof typeof icons];

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium border ${styles[status as keyof typeof styles]}`}>
        <Icon className="w-4 h-4" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getStockStatus = () => {
    if (product.stock_quantity === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-200">
          <XCircle className="w-4 h-4" />
          Out of Stock
        </span>
      );
    } else if (product.stock_quantity <= product.low_stock_threshold) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
          <AlertTriangle className="w-4 h-4" />
          Low Stock ({product.stock_quantity})
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
          <CheckCircle className="w-4 h-4" />
          In Stock ({product.stock_quantity})
        </span>
      );
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      router.delete(route('admin.products.destroy', product.id));
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <AdminLayout>
      <Head title={`${product.name} - Product Details`} />

      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={route('admin.products.index')}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                {product.is_featured && (
                  <Star className="w-6 h-6 text-yellow-500 fill-current" />
                )}
                {getStatusBadge(product.status)}
              </div>
              <p className="text-gray-600 mt-2">
                SKU: {product.sku} • {product.brand.name} • {product.category.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={route('admin.products.duplicate', product.id)}
              method="post"
              as="button"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Copy className="w-4 h-4" />
              Duplicate
            </Link>
            <Link
              href={route('admin.products.edit', product.id)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit Product
            </Link>
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {[
            { label: 'Total Sold', value: stats.total_sold, icon: ShoppingCart, color: 'text-blue-600' },
            { label: 'Revenue', value: formatPrice(stats.revenue), icon: DollarSign, color: 'text-green-600' },
            { label: 'Avg Rating', value: stats.avg_rating.toFixed(1), icon: Star, color: 'text-yellow-600' },
            { label: 'Reviews', value: stats.total_reviews, icon: MessageCircle, color: 'text-purple-600' },
            { label: 'In Wishlist', value: stats.in_wishlist, icon: Heart, color: 'text-red-600' },
            { label: 'In Cart', value: stats.in_cart, icon: Package, color: 'text-orange-600' },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Product Images */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Product Images</h2>
                <Link
                  href={route('admin.products.manage-images', product.id)}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <ImageIcon className="w-4 h-4" />
                  Manage Images
                </Link>
              </div>

              {product.images.length > 0 ? (
                <div className="space-y-4">
                  {/* Main Image */}
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={`/storage/${selectedImage?.image_path}`}
                      alt={selectedImage?.alt_text || product.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Thumbnail Images */}
                  {product.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto">
                      {product.images.map((image) => (
                        <button
                          key={image.id}
                          onClick={() => setSelectedImage(image)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                            selectedImage?.id === image.id
                              ? 'border-blue-500'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <img
                            src={`/storage/${image.image_path}`}
                            alt={image.alt_text || product.name}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ImageIcon className="mx-auto w-16 h-16 text-gray-400 mb-4" />
                  <p className="text-gray-600">No images uploaded</p>
                  <Link
                    href={route('admin.products.manage-images', product.id)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mt-4"
                  >
                    <ImageIcon className="w-4 h-4" />
                    Add Images
                  </Link>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
              {product.short_description && (
                <div className="mb-4">
                  <h3 className="font-medium text-gray-900 mb-2">Short Description</h3>
                  <p className="text-gray-600">{product.short_description}</p>
                </div>
              )}
              {product.description && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Full Description</h3>
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

            {/* Attributes */}
            {product.attributeValues.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Attributes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.attributeValues.map((attributeValue) => (
                    <div key={attributeValue.id} className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-900">{attributeValue.attribute.name}:</span>
                      <span className="text-gray-600">{attributeValue.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Compatible Models */}
            {product.compatibleModels.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Compatible Boiler Models</h2>
                <div className="space-y-4">
                  {Object.entries(
                    product.compatibleModels.reduce((groups, model) => {
                      if (!groups[model.brand_name]) {
                        groups[model.brand_name] = [];
                      }
                      groups[model.brand_name].push(model);
                      return groups;
                    }, {} as { [key: string]: CompatibleModel[] })
                  ).map(([brandName, models]) => (
                    <div key={brandName}>
                      <h3 className="font-medium text-gray-900 mb-2">{brandName}</h3>
                      <div className="flex flex-wrap gap-2">
                        {models.map((model) => (
                          <span
                            key={model.id}
                            className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                          >
                            {model.model_name}
                            {model.model_code && (
                              <span className="ml-1 text-blue-600">({model.model_code})</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Reviews */}
            {product.reviews.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Reviews</h2>
                <div className="space-y-4">
                  {product.reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {renderStars(review.rating)}
                          <span className="text-sm text-gray-600">
                            by {review.user.first_name} {review.user.last_name}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {review.title && (
                        <h4 className="font-medium text-gray-900 mb-1">{review.title}</h4>
                      )}
                      {review.comment && (
                        <p className="text-gray-600 text-sm">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Product Info */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Information</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-900">Price:</span>
                  <div className="text-right">
                    <div className="font-semibold text-lg text-gray-900">
                      {formatPrice(product.sale_price || product.price)}
                    </div>
                    {product.sale_price && (
                      <div className="text-sm text-gray-500 line-through">
                        {formatPrice(product.price)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-900">Stock Status:</span>
                  {getStockStatus()}
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-900">SKU:</span>
                  <span className="text-gray-600 font-mono">{product.sku}</span>
                </div>

                {product.manufacturer_part_number && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-900">MPN:</span>
                    <span className="text-gray-600 font-mono">{product.manufacturer_part_number}</span>
                  </div>
                )}

                {product.gc_number && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-900">GC Number:</span>
                    <span className="text-gray-600 font-mono">{product.gc_number}</span>
                  </div>
                )}

                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-900">Brand:</span>
                  <span className="text-gray-600">{product.brand.name}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-900">Category:</span>
                  <span className="text-gray-600">{product.category.name}</span>
                </div>

                {product.cost_price && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-900">Cost Price:</span>
                    <span className="text-gray-600">{formatPrice(product.cost_price)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Physical Properties */}
            {(product.weight || product.length || product.width || product.height) && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Physical Properties</h2>
                <div className="space-y-3">
                  {product.weight && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-900">Weight:</span>
                      <span className="text-gray-600">{product.weight} kg</span>
                    </div>
                  )}
                  {product.length && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-900">Length:</span>
                      <span className="text-gray-600">{product.length} cm</span>
                    </div>
                  )}
                  {product.width && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-900">Width:</span>
                      <span className="text-gray-600">{product.width} cm</span>
                    </div>
                  )}
                  {product.height && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-900">Height:</span>
                      <span className="text-gray-600">{product.height} cm</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SEO Information */}
            {(product.meta_title || product.meta_description) && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">SEO Information</h2>
                <div className="space-y-3">
                  {product.meta_title && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">Meta Title</h3>
                      <p className="text-gray-600 text-sm">{product.meta_title}</p>
                    </div>
                  )}
                  {product.meta_description && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">Meta Description</h3>
                      <p className="text-gray-600 text-sm">{product.meta_description}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Activity */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Activity</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-900">Created:</span>
                  <span className="text-gray-600 text-sm">
                    {new Date(product.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="font-medium text-gray-900">Updated:</span>
                  <span className="text-gray-600 text-sm">
                    {new Date(product.updated_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  href={route('admin.products.manage-images', product.id)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ImageIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">Manage Images</span>
                </Link>
                <Link
                  href={route('admin.products.edit', product.id)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Edit className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">Edit Product</span>
                </Link>
                <button
                  onClick={() => {
                    router.post(route('admin.products.duplicate', product.id));
                  }}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors w-full text-left"
                >
                  <Copy className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">Duplicate Product</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
