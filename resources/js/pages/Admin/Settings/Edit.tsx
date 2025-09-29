import React from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { ArrowLeft, Save, Key, Folder, FileText, Calendar } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

interface Setting {
  id: number;
  key: string;
  value: string;
  group: string;
  created_at: string;
  updated_at: string;
}

interface EditProps {
  setting: Setting;
  groups: string[];
}

export default function Edit({ setting, groups }: EditProps) {
  const { data, setData, put, processing, errors } = useForm({
    value: setting.value || '',
    group: setting.group || 'general',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/admin/settings/${setting.id}`);
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

  const formatKey = (key: string) => {
    return key.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
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

  return (
    <AdminLayout>
      <Head title={`Edit Setting: ${setting.key}`} />

      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.visit(`/admin/settings?group=${setting.group}`)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{formatKey(setting.key)}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGroupColor(setting.group)}`}>
                  {setting.group}
                </span>
              </div>
              <p className="text-gray-600">Edit system setting configuration</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Setting Information */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Setting Details
                </h3>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Setting Key</label>
                  <div className="bg-gray-50 px-4 py-3 rounded-lg border">
                    <span className="font-mono text-gray-900">{setting.key}</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Setting key cannot be modified
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Setting Value *
                  </label>
                  <textarea
                    value={data.value}
                    onChange={(e) => setData('value', e.target.value)}
                    rows={6}
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

            {/* Value Preview */}
            {data.value && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Value Preview
                  </h3>
                </div>
                <div className="p-6">
                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <pre className="text-sm text-gray-900 whitespace-pre-wrap break-words">
                      {data.value}
                    </pre>
                  </div>
                  <div className="mt-3 text-xs text-gray-500">
                    Character count: {data.value.length}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Setting Info */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Setting Info</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Key</label>
                  <div className="font-mono text-sm text-gray-900 break-words">{setting.key}</div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Current Group</label>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getGroupColor(setting.group)}`}>
                    {setting.group}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Created</label>
                  <div className="text-sm text-gray-900 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    {formatDate(setting.created_at)}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Last Updated</label>
                  <div className="text-sm text-gray-900 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    {formatDate(setting.updated_at)}
                  </div>
                </div>
              </div>
            </div>

            {/* Group Information */}
            {data.group && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Folder className="w-5 h-5" />
                    Group Info
                  </h3>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGroupColor(data.group)}`}>
                      {data.group.charAt(0).toUpperCase() + data.group.slice(1)}
                    </span>
                  </div>

                  {predefinedGroups.find(g => g.value === data.group) && (
                    <div className="text-sm text-gray-600">
                      {predefinedGroups.find(g => g.value === data.group)?.description}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Actions</h3>
              </div>
              <div className="p-6 space-y-3">
                <button
                  onClick={handleSubmit}
                  disabled={processing}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {processing ? 'Updating...' : 'Update Setting'}
                </button>

                <button
                  onClick={() => router.visit(`/admin/settings?group=${setting.group}`)}
                  className="w-full px-4 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel Changes
                </button>
              </div>
            </div>

            {/* Original Value */}
            {setting.value !== data.value && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Original Value</h3>
                </div>
                <div className="p-6">
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap break-words">
                      {setting.value}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
