import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import {
  Settings, Plus, Edit, Trash2, Save,
  Key, Hash, Folder, Search, Filter
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

interface Setting {
  id: number;
  key: string;
  value: string;
  group: string;
  created_at: string;
  updated_at: string;
}

interface PageProps {
  settings: {
    data: Setting[];
    links?: any[];
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
    from?: number;
    to?: number;
  };
  groups: string[];
  current_group: string;
}

export default function Index({ settings, groups, current_group }: PageProps) {
  const [editingSettings, setEditingSettings] = useState<{[key: string]: string}>({});
  const [isBulkEditing, setIsBulkEditing] = useState(false);

  const { data, setData, post, processing } = useForm({
    settings: {}
  });

  const handleGroupChange = (group: string) => {
    router.get('/admin/settings', { group });
  };

  const handleDelete = (setting: Setting) => {
    if (confirm(`Are you sure you want to delete the setting "${setting.key}"?`)) {
      router.delete(`/admin/settings/${setting.id}`);
    }
  };

  const handleEditToggle = (setting: Setting) => {
    if (editingSettings[setting.key]) {
      // Cancel editing
      const newEditing = { ...editingSettings };
      delete newEditing[setting.key];
      setEditingSettings(newEditing);
    } else {
      // Start editing
      setEditingSettings({
        ...editingSettings,
        [setting.key]: setting.value
      });
    }
  };

  const handleEditValueChange = (key: string, value: string) => {
    setEditingSettings({
      ...editingSettings,
      [key]: value
    });
  };

  const handleSingleUpdate = (setting: Setting) => {
    if (!editingSettings[setting.key]) return;

    router.put(`/admin/settings/${setting.id}`, {
      value: editingSettings[setting.key],
      group: setting.group
    }, {
      onSuccess: () => {
        const newEditing = { ...editingSettings };
        delete newEditing[setting.key];
        setEditingSettings(newEditing);
      }
    });
  };

  const handleBulkUpdate = () => {
    const bulkSettings = {};
    settings.data.forEach(setting => {
      if (editingSettings[setting.key] !== undefined) {
        bulkSettings[setting.key] = editingSettings[setting.key];
      }
    });

    if (Object.keys(bulkSettings).length === 0) return;

    post('/admin/settings/bulk-update', {
      settings: bulkSettings
    }, {
      onSuccess: () => {
        setEditingSettings({});
        setIsBulkEditing(false);
      }
    });
  };

  const toggleBulkEdit = () => {
    if (isBulkEditing) {
      // Cancel bulk editing
      setEditingSettings({});
      setIsBulkEditing(false);
    } else {
      // Start bulk editing - populate all current values
      const allSettings = {};
      settings.data.forEach(setting => {
        allSettings[setting.key] = setting.value;
      });
      setEditingSettings(allSettings);
      setIsBulkEditing(true);
    }
  };

  const formatKey = (key: string) => {
    return key.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

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
      <Head title="Settings" />

      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
            <p className="text-gray-600 mt-2">Manage application configuration and preferences</p>
          </div>
          <div className="flex items-center gap-3">
            {Object.keys(editingSettings).length > 0 && (
              <>
                <button
                  onClick={isBulkEditing ? handleBulkUpdate : toggleBulkEdit}
                  disabled={processing}
                  className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isBulkEditing ? 'Save All Changes' : 'Save Changes'}
                </button>
                <button
                  onClick={toggleBulkEdit}
                  className="px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </>
            )}
            <button
              onClick={() => router.visit('/admin/settings/create')}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Setting
            </button>
          </div>
        </div>

        {/* Group Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-4 mb-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Setting Groups:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {groups.map(group => (
              <button
                key={group}
                onClick={() => handleGroupChange(group)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  current_group === group
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="capitalize">{group.replace('_', ' ')}</span>
                <span className="ml-2 text-xs opacity-75">
                  ({settings.data.filter(s => s.group === group).length})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Settings Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Folder className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900">
                {current_group.charAt(0).toUpperCase() + current_group.slice(1)} Settings
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGroupColor(current_group)}`}>
                {settings.data.length} settings
              </span>
            </div>
            {!isBulkEditing && settings.data.length > 1 && (
              <button
                onClick={toggleBulkEdit}
                className="px-3 py-1.5 text-sm text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Bulk Edit
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Setting</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Group</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Updated</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {settings.data.map((setting) => (
                  <tr key={setting.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                          <Key className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {formatKey(setting.key)}
                          </div>
                          <div className="text-sm text-gray-500 font-mono">
                            {setting.key}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {editingSettings[setting.key] !== undefined ? (
                        <div className="max-w-md">
                          {setting.value.length > 100 ? (
                            <textarea
                              value={editingSettings[setting.key]}
                              onChange={(e) => handleEditValueChange(setting.key, e.target.value)}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                          ) : (
                            <input
                              type="text"
                              value={editingSettings[setting.key]}
                              onChange={(e) => handleEditValueChange(setting.key, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                          )}
                        </div>
                      ) : (
                        <div className="max-w-md">
                          {setting.value.length > 100 ? (
                            <div className="text-sm text-gray-900">
                              {setting.value.substring(0, 100)}...
                              <button
                                onClick={() => alert(setting.value)}
                                className="text-blue-600 hover:text-blue-800 ml-2"
                              >
                                View Full
                              </button>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-900 break-words">
                              {setting.value}
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getGroupColor(setting.group)}`}>
                        {setting.group}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {formatDate(setting.updated_at)}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {editingSettings[setting.key] !== undefined && !isBulkEditing ? (
                          <>
                            <button
                              onClick={() => handleSingleUpdate(setting)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Save Changes"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditToggle(setting)}
                              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                              title="Cancel Edit"
                            >
                              ×
                            </button>
                          </>
                        ) : !isBulkEditing ? (
                          <>
                            <button
                              onClick={() => handleEditToggle(setting)}
                              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit Setting"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => router.visit(`/admin/settings/${setting.id}/edit`)}
                              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Advanced Edit"
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(setting)}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Setting"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {settings.data.length === 0 && (
            <div className="text-center py-12">
              <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No settings found</h3>
              <p className="text-gray-500 mb-6">
                No settings found for the "{current_group}" group.
              </p>
              <button
                onClick={() => router.visit('/admin/settings/create')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add First Setting
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {settings.links && settings.links.length > 3 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              {settings.from && settings.to && settings.total ? (
                <>Showing {settings.from} to {settings.to} of {settings.total} results</>
              ) : (
                <>Showing {settings.data.length} results</>
              )}
            </div>
            <div className="flex items-center gap-2">
              {settings.links.map((link, index) => (
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
