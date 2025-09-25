import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
  Search, Filter, Eye, Trash2, Mail, MessageCircle,
  User, Clock, CheckCircle, AlertCircle, XCircle,
  Calendar, Phone, MessageSquare, Archive
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

interface ContactInquiry {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

interface Filters {
  search?: string;
  status?: string;
}

interface PageProps {
  inquiries: {
    data: ContactInquiry[];
    links?: any[];
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
    from?: number;
    to?: number;
  };
  filters: Filters;
  inquiry_statuses: string[];
}

export default function Index({ inquiries, filters, inquiry_statuses }: PageProps) {
  const [selectedInquiries, setSelectedInquiries] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState('');

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = formData.get('search') as string;

    router.get('/admin/contact-inquiries', {
      ...filters,
      search: search || undefined
    }, {
      preserveState: true
    });
  };

  const handleFilterChange = (key: string, value: string) => {
    router.get('/admin/contact-inquiries', {
      ...filters,
      [key]: value || undefined
    }, {
      preserveState: true
    });
  };

  const handleDelete = (inquiryId: number) => {
    if (confirm('Are you sure you want to delete this inquiry?')) {
      router.delete(`/admin/contact-inquiries/${inquiryId}`);
    }
  };

  const handleSelectInquiry = (inquiryId: number) => {
    setSelectedInquiries(prev =>
      prev.includes(inquiryId)
        ? prev.filter(id => id !== inquiryId)
        : [...prev, inquiryId]
    );
  };

  const handleSelectAll = () => {
    if (selectedInquiries.length === inquiries.data.length) {
      setSelectedInquiries([]);
    } else {
      setSelectedInquiries(inquiries.data.map(inquiry => inquiry.id));
    }
  };

  const handleBulkAction = () => {
    if (!bulkAction || selectedInquiries.length === 0) return;

    const confirmMessage = bulkAction === 'delete'
      ? 'Are you sure you want to delete selected inquiries?'
      : `Are you sure you want to ${bulkAction.replace('_', ' ')} selected inquiries?`;

    if (confirm(confirmMessage)) {
      router.post('/admin/contact-inquiries/bulk-update', {
        ids: selectedInquiries,
        action: bulkAction
      });
      setSelectedInquiries([]);
      setBulkAction('');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      new: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        icon: AlertCircle,
        label: 'New'
      },
      in_progress: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        icon: Clock,
        label: 'In Progress'
      },
      resolved: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: CheckCircle,
        label: 'Resolved'
      },
      closed: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        icon: XCircle,
        label: 'Closed'
      }
    };

    const style = styles[status as keyof typeof styles] || styles.new;
    const Icon = style.icon;

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${style.bg} ${style.text}`}>
        <Icon className="w-3 h-3" />
        {style.label}
      </span>
    );
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

  const getStatusLabel = (status: string) => {
    const labels = {
      new: 'New',
      in_progress: 'In Progress',
      resolved: 'Resolved',
      closed: 'Closed'
    };
    return labels[status as keyof typeof labels] || status;
  };

  return (
    <AdminLayout>
      <Head title="Contact Inquiries" />

      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Contact Inquiries</h1>
            <p className="text-gray-600 mt-2">Manage customer contact inquiries and support requests</p>
          </div>
          <div className="flex items-center gap-3">
            {selectedInquiries.length > 0 && (
              <>
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Bulk Actions</option>
                  <option value="mark_progress">Mark In Progress</option>
                  <option value="mark_resolved">Mark Resolved</option>
                  <option value="mark_closed">Mark Closed</option>
                  <option value="delete">Delete</option>
                </select>
                <button
                  onClick={handleBulkAction}
                  disabled={!bulkAction}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
                >
                  Apply ({selectedInquiries.length})
                </button>
              </>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <form onSubmit={handleSearch} className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="search"
                  placeholder="Search by name, email, subject, or message..."
                  defaultValue={filters.search || ''}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </form>

            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              {inquiry_statuses.map(status => (
                <option key={status} value={status}>
                  {getStatusLabel(status)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Inquiries Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedInquiries.length === inquiries.data.length && inquiries.data.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact Info</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Message</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inquiries.data.map((inquiry) => (
                  <tr key={inquiry.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedInquiries.includes(inquiry.id)}
                        onChange={() => handleSelectInquiry(inquiry.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{inquiry.name}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {inquiry.email}
                          </div>
                          {inquiry.phone && (
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {inquiry.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{inquiry.subject}</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {inquiry.message.substring(0, 100)}
                        {inquiry.message.length > 100 && '...'}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {getStatusBadge(inquiry.status)}
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {formatDate(inquiry.created_at)}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.visit(`/admin/contact-inquiries/${inquiry.id}`)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Inquiry"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(inquiry.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Inquiry"
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

          {inquiries.data.length === 0 && (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No inquiries found</h3>
              <p className="text-gray-500">No contact inquiries match your current filters.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {inquiries.links && inquiries.links.length > 3 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              {inquiries.from && inquiries.to && inquiries.total ? (
                <>Showing {inquiries.from} to {inquiries.to} of {inquiries.total} results</>
              ) : (
                <>Showing {inquiries.data.length} results</>
              )}
            </div>
            <div className="flex items-center gap-2">
              {inquiries.links.map((link, index) => (
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
