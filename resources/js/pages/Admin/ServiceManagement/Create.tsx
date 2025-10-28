import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { ArrowLeft, Save, X, Users, Tag, MapPin, Building, Phone, Mail, DollarSign, Hash, ToggleLeft, CheckCircle, Plus } from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';

interface Category {
    id: number;
    name: string;
}

interface City {
    id: number;
    name: string;
}

interface Area {
    id: number;
    name: string;
    city_id: number;
}

interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
}

interface Props {
    categories: Category[];
    cities: City[];
    users: User[];
}

export default function Create({ categories, cities, users }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        user_id: '',

        // Category
        category_id: '',
        new_category_name: '',

        // City
        city_id: '',
        new_city_name: '',
        new_city_region: '',
        new_city_county: '',

        // Area
        area_id: '',
        new_area_name: '',
        new_area_postcode: '',

        business_name: '',
        description: '',
        service_charge: '',
        contact_number: '',
        email: '',
        max_daily_orders: '5',
        is_active: true,
        is_verified: false,
    });

    const [areas, setAreas] = useState<Area[]>([]);
    const [showNewCategory, setShowNewCategory] = useState(false);
    const [showNewCity, setShowNewCity] = useState(false);
    const [showNewArea, setShowNewArea] = useState(false);
    const [loadingAreas, setLoadingAreas] = useState(false);

    // Fetch areas when city changes
    useEffect(() => {
        if (data.city_id && !showNewCity) {
            setLoadingAreas(true);
            fetch('/admin/service-management/areas-by-city', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ city_id: data.city_id }),
            })
                .then(res => res.json())
                .then(data => {
                    setAreas(data.areas || []);
                    setLoadingAreas(false);
                })
                .catch(() => setLoadingAreas(false));
        } else {
            setAreas([]);
            setData('area_id', '');
        }
    }, [data.city_id, showNewCity]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/service-management');
    };

    return (
        <AdminLayout>
            <Head title="Add Service Provider" />

            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Add Service Provider</h1>
                        <p className="text-gray-600">Register a new installer, delivery person or service staff</p>
                    </div>
                    <Link
                        href="/admin/service-management"
                        className="inline-flex items-center px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to List
                    </Link>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
                        {/* Form Content */}
                        <div className="p-8 space-y-8">
                            {/* User Selection */}
                            <div className="space-y-2">
                                <label className="flex items-center text-sm font-semibold text-gray-900">
                                    <Users className="w-4 h-4 mr-2 text-gray-500" />
                                    Select User *
                                </label>
                                <select
                                    value={data.user_id}
                                    onChange={(e) => setData('user_id', e.target.value)}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                        errors.user_id ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                    }`}
                                    required
                                >
                                    <option value="">Select a user</option>
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>
                                            {user.first_name} {user.last_name} - {user.email}
                                        </option>
                                    ))}
                                </select>
                                {errors.user_id && (
                                    <p className="flex items-center text-sm text-red-600">
                                        <X className="w-4 h-4 mr-1" />
                                        {errors.user_id}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Category Selection or Create */}
                                <div className="space-y-2">
                                    <label className="flex items-center text-sm font-semibold text-gray-900">
                                        <Tag className="w-4 h-4 mr-2 text-gray-500" />
                                        Category *
                                    </label>

                                    {!showNewCategory ? (
                                        <div className="space-y-2">
                                            <select
                                                value={data.category_id}
                                                onChange={(e) => setData('category_id', e.target.value)}
                                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                                    errors.category_id ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                }`}
                                                required={!showNewCategory}
                                            >
                                                <option value="">Select category</option>
                                                {categories.map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                ))}
                                            </select>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowNewCategory(true);
                                                    setData('category_id', '');
                                                }}
                                                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
                                            >
                                                <Plus className="w-4 h-4 mr-1" />
                                                Create new category
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                value={data.new_category_name}
                                                onChange={(e) => setData('new_category_name', e.target.value)}
                                                placeholder="Enter new category name"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                required={showNewCategory}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowNewCategory(false);
                                                    setData('new_category_name', '');
                                                }}
                                                className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                                            >
                                                ← Select existing category
                                            </button>
                                        </div>
                                    )}
                                    {errors.category_id && <p className="text-sm text-red-600">{errors.category_id}</p>}
                                    {errors.new_category_name && <p className="text-sm text-red-600">{errors.new_category_name}</p>}
                                </div>

                                {/* Business Name */}
                                <div className="space-y-2">
                                    <label className="flex items-center text-sm font-semibold text-gray-900">
                                        <Building className="w-4 h-4 mr-2 text-gray-500" />
                                        Business Name
                                    </label>
                                    <input
                                        type="text"
                                        value={data.business_name}
                                        onChange={(e) => setData('business_name', e.target.value)}
                                        placeholder="Optional business name"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                    <p className="text-xs text-gray-500">Leave blank to use user's name</p>
                                </div>
                            </div>

                            {/* City Selection or Create */}
                            <div className="space-y-2">
                                <label className="flex items-center text-sm font-semibold text-gray-900">
                                    <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                                    City *
                                </label>

                                {!showNewCity ? (
                                    <div className="space-y-2">
                                        <select
                                            value={data.city_id}
                                            onChange={(e) => setData('city_id', e.target.value)}
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                                errors.city_id ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            }`}
                                            required={!showNewCity}
                                        >
                                            <option value="">Select city</option>
                                            {cities.map(city => (
                                                <option key={city.id} value={city.id}>{city.name}</option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowNewCity(true);
                                                setData('city_id', '');
                                            }}
                                            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
                                        >
                                            <Plus className="w-4 h-4 mr-1" />
                                            Add new city
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            value={data.new_city_name}
                                            onChange={(e) => setData('new_city_name', e.target.value)}
                                            placeholder="City name"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            required={showNewCity}
                                        />
                                        <div className="grid grid-cols-2 gap-3">
                                            <select
                                                value={data.new_city_region}
                                                onChange={(e) => setData('new_city_region', e.target.value)}
                                                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                required={showNewCity}
                                            >
                                                <option value="">Select region</option>
                                                <option value="England">England</option>
                                                <option value="Scotland">Scotland</option>
                                                <option value="Wales">Wales</option>
                                                <option value="Northern Ireland">Northern Ireland</option>
                                            </select>
                                            <input
                                                type="text"
                                                value={data.new_city_county}
                                                onChange={(e) => setData('new_city_county', e.target.value)}
                                                placeholder="County (optional)"
                                                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowNewCity(false);
                                                setData({
                                                    ...data,
                                                    new_city_name: '',
                                                    new_city_region: '',
                                                    new_city_county: '',
                                                });
                                            }}
                                            className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                                        >
                                            ← Select existing city
                                        </button>
                                    </div>
                                )}
                                {errors.city_id && <p className="text-sm text-red-600">{errors.city_id}</p>}
                                {errors.new_city_name && <p className="text-sm text-red-600">{errors.new_city_name}</p>}
                            </div>

                            {/* Area Selection or Create */}
                            <div className="space-y-2">
                                <label className="flex items-center text-sm font-semibold text-gray-900">
                                    <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                                    Area *
                                </label>

                                {!showNewArea ? (
                                    <div className="space-y-2">
                                        <select
                                            value={data.area_id}
                                            onChange={(e) => setData('area_id', e.target.value)}
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                                errors.area_id ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            }`}
                                            required={!showNewArea}
                                            disabled={!data.city_id || showNewCity || loadingAreas}
                                        >
                                            <option value="">
                                                {loadingAreas ? 'Loading areas...' : !data.city_id ? 'Select city first' : 'Select area'}
                                            </option>
                                            {areas.map(area => (
                                                <option key={area.id} value={area.id}>{area.name}</option>
                                            ))}
                                        </select>
                                        {data.city_id && !showNewCity && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowNewArea(true);
                                                    setData('area_id', '');
                                                }}
                                                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
                                            >
                                                <Plus className="w-4 h-4 mr-1" />
                                                Add new area
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            value={data.new_area_name}
                                            onChange={(e) => setData('new_area_name', e.target.value)}
                                            placeholder="Area name"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            required={showNewArea}
                                        />
                                        <input
                                            type="text"
                                            value={data.new_area_postcode}
                                            onChange={(e) => setData('new_area_postcode', e.target.value)}
                                            placeholder="Postcode (optional)"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowNewArea(false);
                                                setData({
                                                    ...data,
                                                    new_area_name: '',
                                                    new_area_postcode: '',
                                                });
                                            }}
                                            className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                                        >
                                            ← Select existing area
                                        </button>
                                    </div>
                                )}
                                {errors.area_id && <p className="text-sm text-red-600">{errors.area_id}</p>}
                                {errors.new_area_name && <p className="text-sm text-red-600">{errors.new_area_name}</p>}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Service Charge */}
                                <div className="space-y-2">
                                    <label className="flex items-center text-sm font-semibold text-gray-900">
                                        <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
                                        Service Charge (£) *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.service_charge}
                                        onChange={(e) => setData('service_charge', e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                            errors.service_charge ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                        placeholder="0.00"
                                        required
                                    />
                                    {errors.service_charge && <p className="text-sm text-red-600">{errors.service_charge}</p>}
                                </div>

                                {/* Max Daily Orders */}
                                <div className="space-y-2">
                                    <label className="flex items-center text-sm font-semibold text-gray-900">
                                        <Hash className="w-4 h-4 mr-2 text-gray-500" />
                                        Max Daily Orders *
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="50"
                                        value={data.max_daily_orders}
                                        onChange={(e) => setData('max_daily_orders', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        required
                                    />
                                    <p className="text-xs text-gray-500">Maximum orders per day</p>
                                </div>

                                {/* Contact Number */}
                                <div className="space-y-2">
                                    <label className="flex items-center text-sm font-semibold text-gray-900">
                                        <Phone className="w-4 h-4 mr-2 text-gray-500" />
                                        Contact Number
                                    </label>
                                    <input
                                        type="text"
                                        value={data.contact_number}
                                        onChange={(e) => setData('contact_number', e.target.value)}
                                        placeholder="+44 7XXX XXXXXX"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <label className="flex items-center text-sm font-semibold text-gray-900">
                                        <Mail className="w-4 h-4 mr-2 text-gray-500" />
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="provider@example.com"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="flex items-center text-sm font-semibold text-gray-900">
                                    Description
                                </label>
                                <textarea
                                    rows={4}
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                                    placeholder="Additional information about this service provider..."
                                />
                            </div>

                            {/* Status Toggles */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="flex items-center text-sm font-semibold text-gray-900">
                                        <ToggleLeft className="w-4 h-4 mr-2 text-gray-500" />
                                        Active Status
                                    </label>
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                            className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 focus:ring-2"
                                        />
                                        <label htmlFor="is_active" className="text-sm text-gray-700 select-none cursor-pointer">
                                            Provider is active and available
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="flex items-center text-sm font-semibold text-gray-900">
                                        <CheckCircle className="w-4 h-4 mr-2 text-gray-500" />
                                        Verification Status
                                    </label>
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            id="is_verified"
                                            checked={data.is_verified}
                                            onChange={(e) => setData('is_verified', e.target.checked)}
                                            className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 focus:ring-2"
                                        />
                                        <label htmlFor="is_verified" className="text-sm text-gray-700 select-none cursor-pointer">
                                            Provider is verified
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="bg-gray-50 px-8 py-6">
                            <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
                                <Link
                                    href="/admin/service-management"
                                    className="inline-flex items-center justify-center px-6 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className={`inline-flex items-center justify-center px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
                                        processing ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {processing ? (
                                        <>
                                            <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            Create Service Provider
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
