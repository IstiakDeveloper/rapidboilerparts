import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import {
  ArrowLeft, User, Mail, Phone, MessageSquare, Calendar,
  Clock, CheckCircle, AlertCircle, XCircle, Save, Trash2,
  Edit3, FileText
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

interface ShowProps {
  inquiry: ContactInquiry;
}

export default function Show({ inquiry }: ShowProps) {
  const [isEditing, setIsEditing] = useState(false);

  const { data, setData, put, processing, errors } = useForm({
    status: inquiry.status,
    admin_notes: inquiry.admin_notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/admin/contact-inquiries/${inquiry.id}/status`, {
      onSuccess: () => {
        setIsEditing(false);
      }
    });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this inquiry? This action cannot be undone.')) {
      router.delete(`/admin/contact-inquiries/${inquiry.id}`);
    }
  };

  const getStatusInfo = (status: string) => {
    const statuses = {
      new: {
        label: 'New',
        color: 'bg-blue-100 text-blue-800',
        icon: AlertCircle,
        description: 'New inquiry awaiting review'
      },
      in_progress: {
        label: 'In Progress',
        color: 'bg-yellow-100 text-yellow-800',
        icon: Clock,
        description: 'Currently being handled'
      },
      resolved: {
        label: 'Resolved',
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
        description: 'Issue has been resolved'
      },
      closed: {
        label: 'Closed',
        color: 'bg-gray-100 text-gray-800',
        icon: XCircle,
        description: 'Inquiry has been closed'
      }
    };
    return statuses[status as keyof typeof statuses] || statuses.new;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statusInfo = getStatusInfo(inquiry.status);
  const StatusIcon = statusInfo.icon;

  return (
    <AdminLayout>
      <Head title={`Inquiry: ${inquiry.subject}`} />

      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.visit('/admin/contact-inquiries')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{inquiry.subject}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${statusInfo.color}`}>
                  <StatusIcon className="w-4 h-4" />
                  {statusInfo.label}
                </span>
              </div>
              <p className="text-gray-600">Contact inquiry from {inquiry.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              {isEditing ? 'Cancel Edit' : 'Update Status'}
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Contact Information */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Contact Information
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="text-lg font-medium text-gray-900">{inquiry.name}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Mail className="w-5 h-5 text-green-600" />
                      </div>
                      <a
                        href={`mailto:${inquiry.email}`}
                        className="text-lg text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        {inquiry.email}
                      </a>
                    </div>
                  </div>

                  {inquiry.phone && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Phone className="w-5 h-5 text-orange-600" />
                        </div>
                        <a
                          href={`tel:${inquiry.phone}`}
                          className="text-lg text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          {inquiry.phone}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Message Content */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Message Content
                </h3>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <div className="text-xl font-semibold text-gray-900 bg-gray-50 p-4 rounded-lg">
                    {inquiry.subject}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-blue-500">
                    <div className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                      {inquiry.message}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Notes */}
            {!isEditing && inquiry.admin_notes && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Admin Notes
                  </h3>
                </div>
                <div className="p-6">
                  <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                    <div className="text-gray-900 whitespace-pre-wrap">
                      {inquiry.admin_notes}
                    </div>
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
                <h3 className="text-lg font-semibold text-gray-900">Details</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Created</span>
                  <span className="text-sm text-gray-900">{formatDate(inquiry.created_at)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Updated</span>
                  <span className="text-sm text-gray-900">{formatDate(inquiry.updated_at)}</span>
                </div>
              </div>
            </div>

            {/* Status Update Form */}
            {isEditing && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Update Status</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status *
                      </label>
                      <select
                        value={data.status}
                        onChange={(e) => setData('status', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.status ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        <option value="new">New</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                      {errors.status && (
                        <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Admin Notes
                      </label>
                      <textarea
                        value={data.admin_notes}
                        onChange={(e) => setData('admin_notes', e.target.value)}
                        rows={4}
                        placeholder="Add internal notes about this inquiry..."
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.admin_notes ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.admin_notes && (
                        <p className="mt-1 text-sm text-red-600">{errors.admin_notes}</p>
                      )}
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={processing}
                      className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {processing ? 'Updating...' : 'Update Status'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              </div>
              <div className="p-6 space-y-3">
                <a
                  href={`mailto:${inquiry.email}?subject=Re: ${inquiry.subject}&body=Hi ${inquiry.name},%0D%0A%0D%0AThank you for contacting us.%0D%0A%0D%0ABest regards`}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Reply via Email
                </a>

                {inquiry.phone && (
                  <a
                    href={`tel:${inquiry.phone}`}
                    className="w-full px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    Call Customer
                  </a>
                )}
              </div>
            </div>

            {/* Status Information */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Status Information</h3>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <StatusIcon className="w-8 h-8 text-blue-600" />
                  <div>
                    <div className="font-semibold text-gray-900">{statusInfo.label}</div>
                    <div className="text-sm text-gray-600">{statusInfo.description}</div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div>Created: {formatDate(inquiry.created_at)}</div>
                  <div>Updated: {formatDate(inquiry.updated_at)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
