import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Clock, Info, Loader2 } from 'lucide-react';

interface Service {
    id: number;
    name: string;
    description: string | null;
    base_price: number;
    duration_minutes: number;
    is_active: boolean;
}

interface SelectedService {
    service_id: number;
    service_name: string;
    estimated_cost: number;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    productId: number | null;
    productName: string;
    onConfirm: (selectedServices: SelectedService[]) => void;
}

export default function ServiceSelectionModal({ isOpen, onClose, productId, productName, onConfirm }: Props) {
    const [selectedServices, setSelectedServices] = useState<number[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(false);

    // Get CSRF token from meta tag
    const getCsrfToken = () => {
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    };

    // Fetch product-specific services when modal opens
    useEffect(() => {
        console.log('=== Service Modal useEffect Triggered ===');
        console.log('isOpen:', isOpen);
        console.log('productId:', productId);

        if (isOpen && productId) {
            console.log('✓ Conditions met - Fetching services for product:', productId);
            setLoading(true);

            const csrfToken = getCsrfToken();
            console.log('CSRF Token:', csrfToken ? 'Found' : 'NOT FOUND');

            const apiUrl = `/api/services/product/${productId}`;
            console.log('API URL:', apiUrl);

            fetch(apiUrl, {
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
            })
                .then(res => {
                    console.log('Response status:', res.status);
                    console.log('Response ok:', res.ok);
                    return res.json();
                })
                .then(data => {
                    console.log('=== Services API Response ===');
                    console.log('Full response:', data);
                    console.log('data.success:', data.success);
                    console.log('data.services:', data.services);
                    console.log('Services count:', data.services?.length || 0);

                    if (data.success && data.services) {
                        console.log('✓ Setting services to state');
                        setServices(data.services);
                    } else {
                        console.warn('⚠ No services in response or success=false');
                        setServices([]);
                    }
                })
                .catch(error => {
                    console.error('❌ Failed to fetch services:', error);
                    setServices([]);
                })
                .finally(() => {
                    console.log('Setting loading to false');
                    setLoading(false);
                });
        } else {
            console.log('✗ Conditions not met');
            if (!isOpen) console.log('  - Modal is not open');
            if (!productId) console.log('  - Product ID is missing');

            if (!isOpen) {
                // Reset when modal closes
                console.log('Resetting services state');
                setServices([]);
                setSelectedServices([]);
            }
        }
    }, [isOpen, productId]);

    const toggleService = (serviceId: number) => {
        setSelectedServices(prev =>
            prev.includes(serviceId)
                ? prev.filter(id => id !== serviceId)
                : [...prev, serviceId]
        );
    };

    const handleConfirm = () => {
        const selected = services
            .filter(s => selectedServices.includes(s.id))
            .map(s => ({
                service_id: s.id,
                service_name: s.name,
                estimated_cost: s.base_price
            }));

        onConfirm(selected);
    };

    const handleSkip = () => {
        onConfirm([]);
    };

    const getTotalCost = () => {
        return services
            .filter(s => selectedServices.includes(s.id))
            .reduce((sum, s) => sum + s.base_price, 0);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP'
        }).format(price);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all">
                    {/* Header */}
                    <div className="border-b border-gray-200 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    Add Service (Optional)
                                </h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    {productName}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                                <span className="ml-3 text-gray-600">Loading services...</span>
                            </div>
                        ) : services.length === 0 ? (
                            <div className="text-center py-12">
                                <Info className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-600 font-medium">No services currently available</p>
                                <p className="text-sm text-gray-500 mt-2">You can still add this item to your cart</p>
                            </div>
                        ) : (
                            <>
                                {/* Info Banner */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                    <div className="flex items-start gap-3">
                                        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <div className="text-sm text-blue-800">
                                            <p className="font-medium mb-1">Add Professional Services (Optional)</p>
                                            <p>These services are available for all products. Select any you need and schedule during checkout.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Services List */}
                                <div className="space-y-3">
                                    {services.map((service) => {
                                        const isSelected = selectedServices.includes(service.id);
                                        return (
                                            <div
                                                key={service.id}
                                                onClick={() => toggleService(service.id)}
                                                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                                                    isSelected
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 hover:border-gray-300 bg-white'
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    {/* Checkbox */}
                                                    <div className="pt-1">
                                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                                            isSelected
                                                                ? 'bg-blue-600 border-blue-600'
                                                                : 'border-gray-300'
                                                        }`}>
                                                            {isSelected && (
                                                                <CheckCircle className="w-4 h-4 text-white" />
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Service Info */}
                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <h3 className="font-semibold text-gray-900">
                                                                    {service.name}
                                                                </h3>
                                                                {service.description && (
                                                                    <p className="text-sm text-gray-600 mt-1">
                                                                        {service.description}
                                                                    </p>
                                                                )}
                                                                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                                                    <Clock className="w-3 h-3" />
                                                                    <span>{service.duration_minutes} minutes</span>
                                                                </div>
                                                            </div>
                                                            <div className="text-right ml-4">
                                                                <div className="text-lg font-bold text-gray-900">
                                                                    {formatPrice(service.base_price)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                        {selectedServices.length > 0 && (
                            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                                <div>
                                    <p className="text-sm text-gray-600">Total Services Cost</p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {selectedServices.length} service(s) selected
                                    </p>
                                </div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {formatPrice(getTotalCost())}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={handleSkip}
                                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Skip & Add to Cart
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={services.length === 0}
                                className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {selectedServices.length > 0
                                    ? `Add with ${selectedServices.length} Service(s)`
                                    : 'Add to Cart'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
