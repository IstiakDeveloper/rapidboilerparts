import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { User, Mail, Lock, Save, Edit2 } from 'lucide-react';
import CustomerLayout from '@/layouts/CustomerLayout';

interface User {
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    date_of_birth: string | null;
    gender: string | null;
}

interface ProfilePageProps {
    user: User;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user }) => {
    const [editingProfile, setEditingProfile] = useState(false);
    const [editingEmail, setEditingEmail] = useState(false);
    const [editingPassword, setEditingPassword] = useState(false);

    // Profile Form
    const profileForm = useForm({
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone || '',
        date_of_birth: user.date_of_birth || '',
        gender: user.gender || '',
    });

    // Email Form
    const emailForm = useForm({
        email: user.email,
        password: '',
    });

    // Password Form
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleProfileUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        profileForm.patch('/profile/update', {
            preserveScroll: true,
            onSuccess: () => setEditingProfile(false),
        });
    };

    const handleEmailUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        emailForm.patch('/profile/update-email', {
            preserveScroll: true,
            onSuccess: () => {
                setEditingEmail(false);
                emailForm.reset('password');
            },
        });
    };

    const handlePasswordUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        passwordForm.patch('/profile/update-password', {
            preserveScroll: true,
            onSuccess: () => {
                setEditingPassword(false);
                passwordForm.reset();
            },
        });
    };

    return (
        <CustomerLayout title="My Profile">
            <Head title="My Profile - RapidBoilerParts" />

            <div className="space-y-6">
                {/* Profile Information */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <User className="text-red-600 mr-2" size={20} />
                            <h2 className="text-lg font-semibold text-gray-800">Profile Information</h2>
                        </div>
                        {!editingProfile && (
                            <button
                                onClick={() => setEditingProfile(true)}
                                className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center"
                            >
                                <Edit2 size={16} className="mr-1" />
                                Edit
                            </button>
                        )}
                    </div>

                    {editingProfile ? (
                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        value={profileForm.data.first_name}
                                        onChange={(e) => profileForm.setData('first_name', e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                        required
                                    />
                                    {profileForm.errors.first_name && (
                                        <p className="mt-1 text-sm text-red-600">{profileForm.errors.first_name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        value={profileForm.data.last_name}
                                        onChange={(e) => profileForm.setData('last_name', e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                        required
                                    />
                                    {profileForm.errors.last_name && (
                                        <p className="mt-1 text-sm text-red-600">{profileForm.errors.last_name}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    value={profileForm.data.phone}
                                    onChange={(e) => profileForm.setData('phone', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Date of Birth
                                    </label>
                                    <input
                                        type="date"
                                        value={profileForm.data.date_of_birth}
                                        onChange={(e) => profileForm.setData('date_of_birth', e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Gender
                                    </label>
                                    <select
                                        value={profileForm.data.gender}
                                        onChange={(e) => profileForm.setData('gender', e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    type="submit"
                                    disabled={profileForm.processing}
                                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                                >
                                    <Save size={16} />
                                    <span>{profileForm.processing ? 'Saving...' : 'Save Changes'}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingProfile(false);
                                        profileForm.reset();
                                    }}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-500 mb-1">First Name</p>
                                <p className="font-medium text-gray-800">{user.first_name}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Last Name</p>
                                <p className="font-medium text-gray-800">{user.last_name}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Phone</p>
                                <p className="font-medium text-gray-800">{user.phone || 'Not provided'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Date of Birth</p>
                                <p className="font-medium text-gray-800">{user.date_of_birth || 'Not provided'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Gender</p>
                                <p className="font-medium text-gray-800 capitalize">{user.gender || 'Not specified'}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Email */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <Mail className="text-red-600 mr-2" size={20} />
                            <h2 className="text-lg font-semibold text-gray-800">Email Address</h2>
                        </div>
                        {!editingEmail && (
                            <button
                                onClick={() => setEditingEmail(true)}
                                className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center"
                            >
                                <Edit2 size={16} className="mr-1" />
                                Change
                            </button>
                        )}
                    </div>

                    {editingEmail ? (
                        <form onSubmit={handleEmailUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    New Email Address
                                </label>
                                <input
                                    type="email"
                                    value={emailForm.data.email}
                                    onChange={(e) => emailForm.setData('email', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    required
                                />
                                {emailForm.errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{emailForm.errors.email}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Current Password (for verification)
                                </label>
                                <input
                                    type="password"
                                    value={emailForm.data.password}
                                    onChange={(e) => emailForm.setData('password', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    required
                                />
                                {emailForm.errors.password && (
                                    <p className="mt-1 text-sm text-red-600">{emailForm.errors.password}</p>
                                )}
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    type="submit"
                                    disabled={emailForm.processing}
                                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                                >
                                    <Save size={16} />
                                    <span>{emailForm.processing ? 'Updating...' : 'Update Email'}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingEmail(false);
                                        emailForm.reset();
                                    }}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <p className="font-medium text-gray-800">{user.email}</p>
                    )}
                </div>

                {/* Password */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <Lock className="text-red-600 mr-2" size={20} />
                            <h2 className="text-lg font-semibold text-gray-800">Password</h2>
                        </div>
                        {!editingPassword && (
                            <button
                                onClick={() => setEditingPassword(true)}
                                className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center"
                            >
                                <Edit2 size={16} className="mr-1" />
                                Change
                            </button>
                        )}
                    </div>

                    {editingPassword ? (
                        <form onSubmit={handlePasswordUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordForm.data.current_password}
                                    onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    required
                                />
                                {passwordForm.errors.current_password && (
                                    <p className="mt-1 text-sm text-red-600">{passwordForm.errors.current_password}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordForm.data.password}
                                    onChange={(e) => passwordForm.setData('password', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    required
                                />
                                {passwordForm.errors.password && (
                                    <p className="mt-1 text-sm text-red-600">{passwordForm.errors.password}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordForm.data.password_confirmation}
                                    onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    required
                                />
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    type="submit"
                                    disabled={passwordForm.processing}
                                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                                >
                                    <Save size={16} />
                                    <span>{passwordForm.processing ? 'Updating...' : 'Update Password'}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingPassword(false);
                                        passwordForm.reset();
                                    }}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <p className="text-gray-600">••••••••••••</p>
                    )}
                </div>
            </div>
        </CustomerLayout>
    );
};

export default ProfilePage;
