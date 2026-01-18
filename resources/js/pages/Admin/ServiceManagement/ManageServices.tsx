import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Save, ArrowLeft, Settings, DollarSign, Award, CheckCircle, XCircle } from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';

interface ProductService {
    id: number;
    name: string;
    description: string | null;
    type: string;
    price: string | number;
    is_active: boolean;
}

interface AssignedService extends ProductService {
    pivot: {
        custom_price: string | null;
        experience_level: 'beginner' | 'intermediate' | 'expert';
        is_active: boolean;
    };
}

interface ServiceProvider {
    id: number;
    business_name: string | null;
    user: {
        first_name: string;
        last_name: string;
    };
    category: {
        name: string;
    };
    city: {
        name: string;
    };
    area: {
        name: string;
    };
}

interface Props {
    serviceProvider: ServiceProvider;
    allServices: ProductService[];
    assignedServices: AssignedService[];
    assignedServiceIds: number[];
}

interface ServiceFormData {
    service_id: number;
    custom_price: string;
    experience_level: 'beginner' | 'intermediate' | 'expert';
    is_active: boolean;
}

export default function ManageServices({ serviceProvider, allServices, assignedServices, assignedServiceIds }: Props) {
    const [selectedServices, setSelectedServices] = useState<Map<number, ServiceFormData>>(
        new Map(
            assignedServices.map(service => [
                service.id,
                {
                    service_id: service.id,
                    custom_price: service.pivot.custom_price || '',
                    experience_level: service.pivot.experience_level,
                    is_active: service.pivot.is_active
                }
            ])
        )
    );

    const { data, setData, post, processing, errors } = useForm({
        services: [] as ServiceFormData[]
    });

    const handleServiceToggle = (serviceId: number, service: ProductService) => {
        const newSelected = new Map(selectedServices);

        if (newSelected.has(serviceId)) {
            newSelected.delete(serviceId);
        } else {
            newSelected.set(serviceId, {
                service_id: serviceId,
                custom_price: '',
                experience_level: 'intermediate',
                is_active: true
            });
        }

        setSelectedServices(newSelected);
    };

    const handleServiceUpdate = (serviceId: number, field: keyof ServiceFormData, value: any) => {
        const newSelected = new Map(selectedServices);
        const service = newSelected.get(serviceId);

        if (service) {
            newSelected.set(serviceId, { ...service, [field]: value });
            setSelectedServices(newSelected);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const servicesArray = Array.from(selectedServices.values());

        router.put(`/admin/service-management/${serviceProvider.id}/services`, {
            services: servicesArray
        }, {
            preserveScroll: true,
            onSuccess: () => {
                // Success handled by Inertia
            }
        });
    };

    const getExperienceBadge = (level: string) => {
        const config: Record<string, { bg: string; text: string }> = {
            beginner: { bg: 'bg-blue-100', text: 'text-blue-700' },
            intermediate: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
            expert: { bg: 'bg-green-100', text: 'text-green-700' }
        };
        const { bg, text } = config[level] || config.intermediate;
        return (
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${bg} ${text} capitalize`}>
                {level}
            </span>
        );
    };

    const displayName = serviceProvider.business_name ||
        `${serviceProvider.user.first_name} ${serviceProvider.user.last_name}`;

    return (
        <AdminLayout>
            <Head title="Manage Services" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.visit(`/admin/service-management/${serviceProvider.id}`)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Manage Services</h1>
                            <p className="text-gray-600 mt-1">
                                {displayName} • {serviceProvider.category.name}
                            </p>
                            <p className="text-sm text-gray-500">
                                {serviceProvider.area.name}, {serviceProvider.city.name}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Info Card */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <Settings className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-blue-900">Configure Service Capabilities</h3>
                            <p className="text-sm text-blue-700 mt-1">
                                Select which services this provider can offer. Set custom pricing and experience level for each service.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Services Form */}
                <form onSubmit={handleSubmit}>
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Available Services</h2>
                            <p className="text-sm text-gray-600 mt-1">
                                {selectedServices.size} service(s) selected
                            </p>
                        </div>

                        <div className="divide-y divide-gray-200">
                            {allServices.map(service => {
                                const isSelected = selectedServices.has(service.id);
                                const serviceData = selectedServices.get(service.id);

                                return (
                                    <div
                                        key={service.id}
                                        className={`p-6 transition-colors ${
                                            isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            {/* Checkbox */}
                                            <div className="flex items-center h-5 mt-1">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleServiceToggle(service.id, service)}
                                                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                />
                                            </div>

                                            {/* Service Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        <h3 className="text-base font-semibold text-gray-900">
                                                            {service.name}
                                                        </h3>
                                                        {service.description && (
                                                            <p className="text-sm text-gray-600 mt-1">
                                                                {service.description}
                                                            </p>
                                                        )}
                                                        <div className="flex items-center gap-3 mt-2">
                                                            <span className="text-xs text-gray-500 uppercase font-medium">
                                                                {service.type}
                                                            </span>
                                                            <span className="text-sm font-medium text-gray-900">
                                                                Default: ৳{service.price}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {isSelected && serviceData && (
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleServiceUpdate(
                                                                    service.id,
                                                                    'is_active',
                                                                    !serviceData.is_active
                                                                )}
                                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                                                    serviceData.is_active
                                                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                                }`}
                                                            >
                                                                {serviceData.is_active ? (
                                                                    <CheckCircle className="w-3.5 h-3.5" />
                                                                ) : (
                                                                    <XCircle className="w-3.5 h-3.5" />
                                                                )}
                                                                {serviceData.is_active ? 'Active' : 'Inactive'}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Configuration Options (shown when selected) */}
                                                {isSelected && serviceData && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                                                        {/* Custom Price */}
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                <DollarSign className="w-4 h-4 inline mr-1" />
                                                                Custom Price (Optional)
                                                            </label>
                                                            <div className="relative">
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                                                    ৳
                                                                </span>
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={serviceData.custom_price}
                                                                    onChange={(e) => handleServiceUpdate(
                                                                        service.id,
                                                                        'custom_price',
                                                                        e.target.value
                                                                    )}
                                                                    placeholder="Leave empty for default"
                                                                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                />
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                Default price: ৳{service.price}
                                                            </p>
                                                        </div>

                                                        {/* Experience Level */}
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                <Award className="w-4 h-4 inline mr-1" />
                                                                Experience Level
                                                            </label>
                                                            <select
                                                                value={serviceData.experience_level}
                                                                onChange={(e) => handleServiceUpdate(
                                                                    service.id,
                                                                    'experience_level',
                                                                    e.target.value
                                                                )}
                                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            >
                                                                <option value="beginner">Beginner</option>
                                                                <option value="intermediate">Intermediate</option>
                                                                <option value="expert">Expert</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-gray-50 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                    {selectedServices.size === 0 ? (
                                        <span className="text-amber-600 font-medium">
                                            Please select at least one service
                                        </span>
                                    ) : (
                                        <span>
                                            {selectedServices.size} service(s) configured
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => router.visit(`/admin/service-management/${serviceProvider.id}`)}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing || selectedServices.size === 0}
                                        className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        {processing ? 'Saving...' : 'Save Services'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
