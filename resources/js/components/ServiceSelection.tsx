import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, DollarSign, Info, CheckCircle } from 'lucide-react';
import axios from 'axios';

interface Service {
    id: number;
    name: string;
    description: string | null;
    base_price: number;
    duration_minutes: number;
    is_active: boolean;
}

interface TimeSlot {
    slot: string;
    display: string;
    available: boolean;
}

interface ServiceProvider {
    id: number;
    business_name: string | null;
    rating: number;
    total_orders_completed: number;
    user: {
        first_name: string;
        last_name: string;
    };
}

interface SelectedService {
    service_id: number;
    service_name: string;
    service_date: string;
    service_time: string;
    service_instructions: string;
    estimated_cost: number;
}

interface Props {
    productId: number;
    onServiceSelect: (services: SelectedService[]) => void;
    initialServices?: SelectedService[];
}

export default function ServiceSelection({ productId, onServiceSelect, initialServices = [] }: Props) {
    const [services, setServices] = useState<Service[]>([]);
    const [selectedServices, setSelectedServices] = useState<SelectedService[]>(initialServices);
    const [availableSlots, setAvailableSlots] = useState<Record<number, TimeSlot[]>>({});
    const [loading, setLoading] = useState(true);
    const [expandedService, setExpandedService] = useState<number | null>(null);

    // Service-wise selections
    const [serviceDates, setServiceDates] = useState<Record<number, string>>({});
    const [serviceTimes, setServiceTimes] = useState<Record<number, string>>({});
    const [serviceInstructions, setServiceInstructions] = useState<Record<number, string>>({});
    const [loadingSlots, setLoadingSlots] = useState<Record<number, boolean>>({});

    useEffect(() => {
        fetchProductServices();
    }, [productId]);

    useEffect(() => {
        // Initialize from initialServices if provided
        if (initialServices.length > 0) {
            const dates: Record<number, string> = {};
            const times: Record<number, string> = {};
            const instructions: Record<number, string> = {};

            initialServices.forEach(service => {
                dates[service.service_id] = service.service_date;
                times[service.service_id] = service.service_time;
                instructions[service.service_id] = service.service_instructions;
            });

            setServiceDates(dates);
            setServiceTimes(times);
            setServiceInstructions(instructions);
        }
    }, [initialServices]);

    const fetchProductServices = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/services/product/${productId}`);
            setServices(response.data.services || []);
        } catch (error) {
            console.error('Failed to fetch services:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableSlots = async (serviceId: number, date: string) => {
        setLoadingSlots({ ...loadingSlots, [serviceId]: true });
        try {
            const response = await axios.get('/api/services/available-slots', {
                params: { service_id: serviceId, date }
            });
            setAvailableSlots({
                ...availableSlots,
                [serviceId]: response.data.slots || []
            });
        } catch (error) {
            console.error('Failed to fetch time slots:', error);
            setAvailableSlots({ ...availableSlots, [serviceId]: [] });
        } finally {
            setLoadingSlots({ ...loadingSlots, [serviceId]: false });
        }
    };

    const handleDateChange = (serviceId: number, date: string) => {
        setServiceDates({ ...serviceDates, [serviceId]: date });
        setServiceTimes({ ...serviceTimes, [serviceId]: '' }); // Reset time selection

        if (date) {
            fetchAvailableSlots(serviceId, date);
        }
    };

    const handleTimeChange = (serviceId: number, time: string) => {
        setServiceTimes({ ...serviceTimes, [serviceId]: time });
        updateSelectedServices(serviceId);
    };

    const handleInstructionsChange = (serviceId: number, instructions: string) => {
        setServiceInstructions({ ...serviceInstructions, [serviceId]: instructions });
        updateSelectedServices(serviceId);
    };

    const toggleServiceSelection = (service: Service) => {
        const isSelected = selectedServices.some(s => s.service_id === service.id);

        if (isSelected) {
            // Remove service
            setSelectedServices(selectedServices.filter(s => s.service_id !== service.id));
            setExpandedService(null);

            // Clear selections
            const newDates = { ...serviceDates };
            const newTimes = { ...serviceTimes };
            const newInstructions = { ...serviceInstructions };
            delete newDates[service.id];
            delete newTimes[service.id];
            delete newInstructions[service.id];

            setServiceDates(newDates);
            setServiceTimes(newTimes);
            setServiceInstructions(newInstructions);
        } else {
            // Add service with placeholder
            const newService: SelectedService = {
                service_id: service.id,
                service_name: service.name,
                service_date: '',
                service_time: '',
                service_instructions: '',
                estimated_cost: service.base_price
            };
            setSelectedServices([...selectedServices, newService]);
            setExpandedService(service.id);
        }
    };

    const updateSelectedServices = (serviceId: number) => {
        const service = services.find(s => s.id === serviceId);
        if (!service) return;

        const date = serviceDates[serviceId] || '';
        const time = serviceTimes[serviceId] || '';
        const instructions = serviceInstructions[serviceId] || '';

        const updatedServices = selectedServices.map(s => {
            if (s.service_id === serviceId) {
                return {
                    ...s,
                    service_date: date,
                    service_time: time,
                    service_instructions: instructions,
                    estimated_cost: service.base_price
                };
            }
            return s;
        });

        setSelectedServices(updatedServices);
        onServiceSelect(updatedServices);
    };

    const isServiceComplete = (serviceId: number) => {
        return !!(serviceDates[serviceId] && serviceTimes[serviceId]);
    };

    const getMinDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP'
        }).format(price);
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (services.length === 0) {
        return null; // Don't show section if no services available
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    Available Services
                </h2>
                {selectedServices.length > 0 && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                        {selectedServices.length} Selected
                    </span>
                )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Optional Services</p>
                        <p>Add professional installation or maintenance services to your order. Select a service, choose your preferred date and time.</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {services.map((service) => {
                    const isSelected = selectedServices.some(s => s.service_id === service.id);
                    const isExpanded = expandedService === service.id;
                    const isComplete = isServiceComplete(service.id);

                    return (
                        <div
                            key={service.id}
                            className={`border-2 rounded-lg transition-all ${
                                isSelected
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            {/* Service Header */}
                            <div className="p-4">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleServiceSelection(service)}
                                        className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{service.name}</h3>
                                                {service.description && (
                                                    <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <div className="text-lg font-bold text-gray-900">
                                                        {formatPrice(service.base_price)}
                                                    </div>
                                                    <div className="text-xs text-gray-500 flex items-center justify-end">
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        {service.duration_minutes} min
                                                    </div>
                                                </div>
                                                {isSelected && isComplete && (
                                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </label>
                            </div>

                            {/* Service Details - Expanded */}
                            {isSelected && (
                                <div className="border-t border-gray-200 bg-white p-4 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Date Selection */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <Calendar className="w-4 h-4 inline mr-1" />
                                                Preferred Date *
                                            </label>
                                            <input
                                                type="date"
                                                value={serviceDates[service.id] || ''}
                                                onChange={(e) => handleDateChange(service.id, e.target.value)}
                                                min={getMinDate()}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            />
                                        </div>

                                        {/* Time Selection */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <Clock className="w-4 h-4 inline mr-1" />
                                                Preferred Time *
                                            </label>
                                            <select
                                                value={serviceTimes[service.id] || ''}
                                                onChange={(e) => handleTimeChange(service.id, e.target.value)}
                                                disabled={!serviceDates[service.id] || loadingSlots[service.id]}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                                                required
                                            >
                                                <option value="">
                                                    {!serviceDates[service.id]
                                                        ? 'Select date first'
                                                        : loadingSlots[service.id]
                                                        ? 'Loading slots...'
                                                        : 'Select time slot'}
                                                </option>
                                                {availableSlots[service.id]?.map((slot) => (
                                                    <option
                                                        key={slot.slot}
                                                        value={slot.slot}
                                                        disabled={!slot.available}
                                                    >
                                                        {slot.display} {!slot.available ? '(Booked)' : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Special Instructions */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Special Instructions (Optional)
                                        </label>
                                        <textarea
                                            value={serviceInstructions[service.id] || ''}
                                            onChange={(e) => handleInstructionsChange(service.id, e.target.value)}
                                            rows={3}
                                            placeholder="Any special requirements or notes for the service provider..."
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                        />
                                    </div>

                                    {!isComplete && (
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                            <p className="text-sm text-yellow-800 flex items-center">
                                                <Info className="w-4 h-4 mr-2" />
                                                Please select both date and time to complete this service selection
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Summary */}
            {selectedServices.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Services Cost</p>
                            <p className="text-xs text-gray-500 mt-1">
                                {selectedServices.filter(s => isServiceComplete(s.service_id)).length} of {selectedServices.length} complete
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">
                                {formatPrice(selectedServices.reduce((sum, s) => sum + s.estimated_cost, 0))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
