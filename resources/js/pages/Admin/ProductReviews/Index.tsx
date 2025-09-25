import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Search, Eye, Trash2, Star, User, Package, CheckCircle, XCircle, Clock } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

interface ProductReview {
  id: number;
  rating: number;
  title: string;
  comment: string;
  is_approved: boolean;
  created_at: string;
  product: {
    id: number;
    name: string;
    slug: string;
  };
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface Filters {
  search?: string;
  rating?: string;
  is_approved?: string;
}

interface PageProps {
  reviews: {
    data: ProductReview[];
    links?: any[];
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
    from?: number;
    to?: number;
  };
  filters: Filters;
}

export default function Index({ reviews, filters }: PageProps) {
  const [selectedReviews, setSelectedReviews] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState('');

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = formData.get('search') as string;

    router.get('/admin/product-reviews', {
      ...filters,
      search: search || undefined
    }, {
      preserveState: true
    });
  };

  const handleFilterChange = (key: string, value: string) => {
    router.get('/admin/product-reviews', {
      ...filters,
      [key]: value || undefined
    }, {
      preserveState: true
    });
  };

  const handleBulkAction = () => {
    if (!bulkAction || selectedReviews.length === 0) return;

    if (bulkAction === 'delete') {
      if (!confirm('Are you sure you want to delete selected reviews?')) return;
    }

    router.post('/admin/product-reviews/bulk-update', {
      ids: selectedReviews,
      action: bulkAction
    }, {
      onSuccess: () => {
        setSelectedReviews([]);
        setBulkAction('');
      }
    });
  };

  const handleApprove = (reviewId: number) => {
    router.post(`/admin/product-reviews/${reviewId}/approve`);
  };

  const handleReject = (reviewId: number) => {
    router.post(`/admin/product-reviews/${reviewId}/reject`);
  };

  const handleDelete = (reviewId: number) => {
    if (confirm('Are you sure you want to delete this review?')) {
      router.delete(`/admin/product-reviews/${reviewId}`);
    }
  };

  const toggleSelectAll = () => {
    if (selectedReviews.length === reviews.data.length) {
      setSelectedReviews([]);
    } else {
      setSelectedReviews(reviews.data.map(r => r.id));
    }
  };

  const toggleSelectReview = (id: number) => {
    setSelectedReviews(prev =>
      prev.includes(id)
        ? prev.filter(rid => rid !== id)
        : [...prev, id]
    );
  };

  const getStatusBadge = (isApproved: boolean) => {
    if (isApproved) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Approved
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1">
        <Clock className="w-3 h-3" />
        Pending
      </span>
    );
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  const truncateText = (text: string, length: number = 100) => {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  };

  return (
    <AdminLayout>
      <Head title="Product Reviews" />

      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Product Reviews</h1>
            <p className="text-gray-600 mt-2">Manage customer product reviews and ratings</p>
          </div>
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
                  placeholder="Search reviews, products, customers..."
                  defaultValue={filters.search || ''}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </form>

            <select
              value={filters.rating || ''}
              onChange={(e) => handleFilterChange('rating', e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>

            <select
              value={filters.is_approved || ''}
              onChange={(e) => handleFilterChange('is_approved', e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="1">Approved</option>
              <option value="0">Pending</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedReviews.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
            <span className="text-blue-800 font-medium">
              {selectedReviews.length} review(s) selected
            </span>
            <div className="flex items-center gap-3">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-3 py-2 border border-blue-300 rounded-lg text-sm"
              >
                <option value="">Choose Action</option>
                <option value="approve">Approve</option>
                <option value="reject">Reject</option>
                <option value="delete">Delete</option>
              </select>
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
              >
                Apply
              </button>
            </div>
          </div>
        )}

        {/* Reviews Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedReviews.length === reviews.data.length && reviews.data.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Review</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reviews.data.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedReviews.includes(review.id)}
                        onChange={() => toggleSelectReview(review.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>

                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        {review.title && (
                          <div className="font-medium text-gray-900 mb-1">
                            {truncateText(review.title, 50)}
                          </div>
                        )}
                        {review.comment && (
                          <div className="text-sm text-gray-600">
                            {truncateText(review.comment, 80)}
                          </div>
                        )}
                        {!review.title && !review.comment && (
                          <div className="text-sm text-gray-400 italic">No text review</div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                          <Package className="w-4 h-4 text-gray-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {truncateText(review.product.name, 30)}
                          </div>
                          <button
                            onClick={() => router.visit(`/admin/products/${review.product.id}`)}
                            className="text-xs text-blue-600 hover:text-blue-700"
                          >
                            View Product
                          </button>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                          <User className="w-4 h-4 text-gray-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {review.user.first_name} {review.user.last_name}
                          </div>
                          <div className="text-xs text-gray-500">{review.user.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {renderStars(review.rating)}
                    </td>

                    <td className="px-6 py-4">
                      {getStatusBadge(review.is_approved)}
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {new Date(review.created_at).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.visit(`/admin/product-reviews/${review.id}`)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Review"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {!review.is_approved ? (
                          <button
                            onClick={() => handleApprove(review.id)}
                            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Approve Review"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReject(review.id)}
                            className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                            title="Reject Review"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(review.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Review"
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

          {reviews.data.length === 0 && (
            <div className="text-center py-12">
              <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
              <p className="text-gray-500">Reviews will appear here when customers rate products.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {reviews.links && reviews.links.length > 3 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              {reviews.from && reviews.to && reviews.total ? (
                <>Showing {reviews.from} to {reviews.to} of {reviews.total} results</>
              ) : (
                <>Showing {reviews.data.length} results</>
              )}
            </div>
            <div className="flex items-center gap-2">
              {reviews.links.map((link, index) => (
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
