import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { MapPin, Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import AppLayout from '@/layouts/CustomerLayout';

interface Address {
    id: number;
    type: string;
    first_name: string;
    last_name: string;
    full_name: string;
    company: string | null;
    address_line_1: string;
    address_line_2: string | null;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone: string | null;
    is_default: boolean;
    formatted_address: string;
}

interface AddressesPageProps {
    addresses: Address[];
}

const AddressesPage: React.FC<AddressesPageProps> = ({ addresses }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        type: 'shipping' as 'billing' | 'shipping',
        first_name: '',
        last_name: '',
        company: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'GB',
        phone: '',
        is_default: false,
    });

    const openModal = (address?: Address) => {
        if (address) {
            setEditingAddress(address);
            setData({
                type: address.type as 'billing' | 'shipping',
                first_name: address.first_name,
                last_name: address.last_name,
                company: address.company || '',
                address_line_1: address.address_line_1,
                address_line_2: address.address_line_2 || '',
                city: address.city,
                state: address.state,
                postal_code: address.postal_code,
                country: address.country,
                phone: address.phone || '',
                is_default: address.is_default,
            });
        } else {
            setEditingAddress(null);
            reset();
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingAddress(null);
        reset();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingAddress) {
            put(`/profile/addresses/${editingAddress.id}`, {
                preserveScroll: true,
                onSuccess: () => closeModal(),
            });
        } else {
            post('/profile/addresses', {
                preserveScroll: true,
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (addressId: number) => {
        if (confirm('Are you sure you want to delete this address?')) {
            router.delete(`/profile/addresses/${addressId}`, {
                preserveScroll: true,
            });
        }
    };

    const handleSetDefault = (addressId: number) => {
        router.post(`/profile/addresses/${addressId}/set-default`, {}, {
            preserveScroll: true,
        });
    };

    const billingAddresses = addresses.filter(addr => addr.type === 'billing');
    const shippingAddresses = addresses.filter(addr => addr.type === 'shipping');

    return (
        <AppLayout>
            <Head title="My Addresses - RapidBoilerParts" />

            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">My Addresses</h1>
                    <button
                        onClick={() => openModal()}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                        <Plus size={18} />
                        <span>Add New Address</span>
                    </button>
                </div>

                <div className="space-y-8">
                    {/* Shipping Addresses */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <MapPin className="mr-2 text-red-600" size={20} />
                            Shipping Addresses
                        </h2>
                        {shippingAddresses.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {shippingAddresses.map((address) => (
                                    <div key={address.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-semibold text-gray-800">
                                                    {address.full_name}
                                                    {address.is_default && (
                                                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                                                            Default
                                                        </span>
                                                    )}
                                                </h3>
                                                {address.company && (
                                                    <p className="text-sm text-gray-600">{address.company}</p>
                                                )}
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => openModal(address)}
                                                    className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(address.id)}
                                                    className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="text-sm text-gray-600 space-y-1 mb-3">
                                            <p>{address.address_line_1}</p>
                                            {address.address_line_2 && <p>{address.address_line_2}</p>}
                                            <p>{address.city}, {address.state}</p>
                                            <p>{address.postal_code}</p>
                                            {address.phone && <p>Phone: {address.phone}</p>}
                                        </div>

                                        {!address.is_default && (
                                            <button
                                                onClick={() => handleSetDefault(address.id)}
                                                className="text-sm text-red-600 hover:text-red-700 font-medium"
                                            >
                                                Set as Default
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                                <p className="text-gray-600">No shipping addresses added yet</p>
                            </div>
                        )}
                    </div>

                    {/* Billing Addresses */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <MapPin className="mr-2 text-red-600" size={20} />
                            Billing Addresses
                        </h2>
                        {billingAddresses.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {billingAddresses.map((address) => (
                                    <div key={address.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-semibold text-gray-800">
                                                    {address.full_name}
                                                    {address.is_default && (
                                                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                                                            Default
                                                        </span>
                                                    )}
                                                </h3>
                                                {address.company && (
                                                    <p className="text-sm text-gray-600">{address.company}</p>
                                                )}
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => openModal(address)}
                                                    className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(address.id)}
                                                    className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="text-sm text-gray-600 space-y-1 mb-3">
                                            <p>{address.address_line_1}</p>
                                            {address.address_line_2 && <p>{address.address_line_2}</p>}
                                            <p>{address.city}, {address.state}</p>
                                            <p>{address.postal_code}</p>
                                            {address.phone && <p>Phone: {address.phone}</p>}
                                        </div>

                                        {!address.is_default && (
                                            <button
                                                onClick={() => handleSetDefault(address.id)}
                                                className="text-sm text-red-600 hover:text-red-700 font-medium"
                                            >
                                                Set as Default
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                                <p className="text-gray-600">No billing addresses added yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add/Edit Address Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingAddress ? 'Edit Address' : 'Add New Address'}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Address Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Address Type
                                </label>
                                <div className="flex space-x-4">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            value="shipping"
                                            checked={data.type === 'shipping'}
                                            onChange={(e) => setData('type', e.target.value as 'shipping')}
                                            className="rounded-full border-gray-300 text-red-600 focus:ring-red-500"
                                        />
                                        <span className="ml-2">Shipping</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            value="billing"
                                            checked={data.type === 'billing'}
                                            onChange={(e) => setData('type', e.target.value as 'billing')}
                                            className="rounded-full border-gray-300 text-red-600 focus:ring-red-500"
                                        />
                                        <span className="ml-2">Billing</span>
                                    </label>
                                </div>
                            </div>

                            {/* Name Fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        First Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.first_name}
                                        onChange={(e) => setData('first_name', e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                        required
                                    />
                                    {errors.first_name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Last Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.last_name}
                                        onChange={(e) => setData('last_name', e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                        required
                                    />
                                    {errors.last_name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
                                    )}
                                </div>
                            </div>

                            {/* Company */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Company (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={data.company}
                                    onChange={(e) => setData('company', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                />
                            </div>

                            {/* Address Lines */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Address Line 1 *
                                </label>
                                <input
                                    type="text"
                                    value={data.address_line_1}
                                    onChange={(e) => setData('address_line_1', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    required
                                />
                                {errors.address_line_1 && (
                                    <p className="mt-1 text-sm text-red-600">{errors.address_line_1}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Address Line 2 (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={data.address_line_2}
                                    onChange={(e) => setData('address_line_2', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                />
                            </div>

                            {/* City, State, Postal */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        City *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.city}
                                        onChange={(e) => setData('city', e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                        required
                                    />
                                    {errors.city && (
                                        <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        County/State *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.state}
                                        onChange={(e) => setData('state', e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                        required
                                    />
                                    {errors.state && (
                                        <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Postcode *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.postal_code}
                                        onChange={(e) => setData('postal_code', e.target.value.toUpperCase())}
                                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                        required
                                    />
                                    {errors.postal_code && (
                                        <p className="mt-1 text-sm text-red-600">{errors.postal_code}</p>
                                    )}
                                </div>
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone (Optional)
                                </label>
                                <input
                                    type="tel"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                />
                            </div>

                            {/* Default Address */}
                            <div>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={data.is_default}
                                        onChange={(e) => setData('is_default', e.target.checked)}
                                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Set as default address</span>
                                </label>
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                                >
                                    <Check size={18} />
                                    <span>{processing ? 'Saving...' : editingAddress ? 'Update Address' : 'Add Address'}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
};

export default AddressesPage;
