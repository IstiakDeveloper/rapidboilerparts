import React from 'react';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Star, User, Package, CheckCircle, XCircle, Trash2, Calendar, MessageSquare } from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';

interface ProductReview {
  id: number;
  rating: number;
  title: string;
  comment: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  product: {
    id: number;
    name: string;
    slug: string;
    sku: string;
    brand: {
      name: string;
    };
    category: {
      name: string;
    };
  };
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
}

interface PageProps {
  review: ProductReview;
}

export default function Show({ review }: PageProps) {
  const handleApprove = () => {
    router.post(`/admin/product-reviews/${review.id}/approve`);
  };

  const handleReject = () => {
    router.post(`/admin/product-reviews/${review.id}/reject`);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      router.delete(`/admin/product-reviews/${review.id}`);
    }
  };

  const getStatusBadge = (isApproved: boolean) => {
    if (isApproved) {
      return (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-green-100 text-green-800 border border-green-200">
          <CheckCircle className="w-4 h-4" />
          <span className="font-medium">Approved</span>
        </div>
      );
    }
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-yellow-100 text-yellow-800 border border-yellow-200">
        <XCircle className="w-4 h-4" />
        <span className="font-medium">Pending Approval</span>
      </div>
    );
  };

  const renderStars = (rating: number, size: 'sm' | 'lg' = 'sm') => {
    const starSize = size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`${starSize} ${
              i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <AdminLayout>
      <Head title={`Review by ${review.user.first_name} ${review.user.last_name}`} />

      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.visit('/admin/product-reviews')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">Product Review</h1>
                {getStatusBadge(review.is_approved)}
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <span>Review ID: #{review.id}</span>
                <span>•</span>
                <span>Posted: {new Date(review.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!review.is_approved ? (
              <button
                onClick={handleApprove}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Approve Review
              </button>
            ) : (
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Reject Review
              </button>
            )}
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
            {/* Review Content */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Review Content
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Rating</span>
                  <div className="flex items-center gap-2">
                    {renderStars(review.rating)}
                    <span className="font-medium text-gray-900">{review.rating}/5</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={`font-medium ${
                    review.is_approved ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {review.is_approved ? 'Approved' : 'Pending'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Has Title</span>
                  <span className="font-medium text-gray-900">
                    {review.title ? 'Yes' : 'No'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Has Comment</span>
                  <span className="font-medium text-gray-900">
                    {review.comment ? 'Yes' : 'No'}
                  </span>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Posted</span>
                    <span className="font-medium text-gray-900">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {review.updated_at !== review.created_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Last Updated</span>
                    <span className="font-medium text-gray-900">
                      {new Date(review.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Review Actions */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Review Actions</h3>
              </div>
              <div className="p-6 space-y-3">
                {!review.is_approved ? (
                  <button
                    onClick={handleApprove}
                    className="w-full text-left px-4 py-3 text-sm text-green-700 hover:bg-green-50 rounded-lg transition-colors flex items-center gap-3"
                  >
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Approve Review
                  </button>
                ) : (
                  <button
                    onClick={handleReject}
                    className="w-full text-left px-4 py-3 text-sm text-yellow-700 hover:bg-yellow-50 rounded-lg transition-colors flex items-center gap-3"
                  >
                    <XCircle className="w-4 h-4 text-yellow-500" />
                    Reject Review
                  </button>
                )}

                <button
                  onClick={() => router.visit(`/admin/products/${review.product.id}`)}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3"
                >
                  <Package className="w-4 h-4 text-gray-400" />
                  View Product Details
                </button>

                <button
                  onClick={() => router.visit(`/admin/users/${review.user.id}`)}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3"
                >
                  <User className="w-4 h-4 text-gray-400" />
                  View Customer Profile
                </button>

                <div className="pt-3 border-t border-gray-100">
                  <button
                    onClick={handleDelete}
                    className="w-full text-left px-4 py-3 text-sm text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-3"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                    Delete Review
                  </button>
                </div>
              </div>
            </div>

            {/* Rating Breakdown */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Rating Breakdown</h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-12">
                        <span className="text-sm text-gray-600">{star}</span>
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            review.rating === star ? 'bg-yellow-400' : 'bg-gray-200'
                          }`}
                          style={{ width: review.rating === star ? '100%' : '0%' }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-8">
                        {review.rating === star ? '1' : '0'}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">{review.rating}.0</div>
                  <div className="text-sm text-gray-600">Overall Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
