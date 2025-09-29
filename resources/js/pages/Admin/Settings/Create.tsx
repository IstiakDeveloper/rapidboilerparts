import React from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { ArrowLeft, Save, Key, Folder, FileText } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

interface CreateProps {
  groups: string[];
}

export default function Create({ groups }: CreateProps) {
  const { data, setData, post, processing, errors } = useForm({
    key: '',
    value: '',
    group: 'general',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/admin/settings');
  };

  const formatKey = (input: string) => {
    return input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  };

  const handleKeyChange = (value: string) => {
    setData('key', formatKey(value));
  };

  const predefinedGroups = [
    { value: 'general', label: 'General', description: 'Basic application settings' },
    { value: 'email', label: 'Email', description: 'Email configuration and SMTP settings' },
    { value: 'payment', label: 'Payment', description: 'Payment gateway and transaction settings' },
    { value: 'social', label: 'Social Media', description: 'Social media integration settings' },
    { value: 'api', label: 'API', description: 'API keys and external service settings' },
    { value: 'appearance', label: 'Appearance', description: 'UI/UX and branding settings' },
    { value: 'security', label: 'Security', description: 'Security and authentication settings' }
  ];

  const getGroupColor = (group: string) => {
    const colors = {
      general: 'bg-blue-100 text-blue-800',
      email: 'bg-green-100 text-green-800',
      payment: 'bg-yellow-100 text-yellow-800',
      social: 'bg-purple-100 text-purple-800',
      api: 'bg-red-100 text-red-800',
      appearance: 'bg-pink-100 text-pink-800',
      security: 'bg-orange-100 text-orange-800'
    };
    return colors[group] || 'bg-gray-100 text-gray-800';
  };

  return (
    <AdminLayout>
      <Head title="Create Setting" />

      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.visit('/admin/settings')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Setting</h1>
              <p className="text-gray-600 mt-2">Add a new configuration setting to the system</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Key className="w-5 h-5" />
                Setting Information
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Setting Key *
                  </label>
                  <input
                    type="text"
                    value={data.key}
                    onChange={(e) => handleKeyChange(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono ${
                      errors.key ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., site_name, max_upload_size"
                  />
                  {errors.key && (
                    <p className="mt-1 text-sm text-red-600">{errors.key}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Use lowercase letters, numbers, and underscores only
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Group *
                  </label>
                  <select
                    value={data.group}
                    onChange={(e) => setData('group', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.group ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    {predefinedGroups.map(group => (
                      <option key={group.value} value={group.value}>
                        {group.label}
                      </option>
                    ))}
                    {groups.filter(g => !predefinedGroups.some(pg => pg.value === g)).map(group => (
                      <option key={group} value={group}>
                        {group.charAt(0).toUpperCase() + group.slice(1)}
                      </option>
                    ))}
                  </select>
                  {errors.group && (
                    <p className="mt-1 text-sm text-red-600">{errors.group}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Choose the category for this setting
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Setting Value *
                </label>
                <textarea
                  value={data.value}
                  onChange={(e) => setData('value', e.target.value)}
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.value ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter the setting value..."
                />
                {errors.value && (
                  <p className="mt-1 text-sm text-red-600">{errors.value}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  The value for this setting (can be text, numbers, JSON, etc.)
                </p>
              </div>
            </div>
          </div>

          {/* Group Information */}
          {data.group && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Folder className="w-5 h-5" />
                  Group Information
                </h3>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGroupColor(data.group)}`}>
                    {data.group.charAt(0).toUpperCase() + data.group.slice(1)}
                  </span>
                  <span className="text-gray-600">Group</span>
                </div>

                {predefinedGroups.find(g => g.value === data.group) && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700">
                      {predefinedGroups.find(g => g.value === data.group)?.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Preview */}
          {data.key && data.value && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Setting Preview
                </h3>
              </div>
              <div className="p-6">
                <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Key</label>
                      <div className="font-mono text-sm text-gray-900">{data.key}</div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Group</label>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getGroupColor(data.group)}`}>
                        {data.group}
                      </span>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Value</label>
                      <div className="text-sm text-gray-900 break-words">
                        {data.value.length > 50 ? `${data.value.substring(0, 50)}...` : data.value}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="bg-gray-50 px-6 py-4 rounded-xl flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => router.visit('/admin/settings')}
              className="px-6 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={processing}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {processing ? 'Creating...' : 'Create Setting'}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
