import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Save, ArrowLeft, Clock, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';

interface ServiceProvider {
    id: number;
    business_name: string | null;
    working_hours: Record<string, { available: boolean; start: string; end: string }> | null;
    working_days: string[] | null;
    avg_service_duration: number;
    min_advance_booking_hours: number;
    user: {
        first_name: string;
        last_name: string;
    };
    category: {
        name: string;
    };
}

interface Props {
    serviceProvider: ServiceProvider;
}

interface DaySchedule {
    available: boolean;
    start: string;
    end: string;
}

const DAYS = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
];

const DEFAULT_HOURS = {
    available: true,
    start: '09:00',
    end: '18:00'
};

export default function WorkingHours({ serviceProvider }: Props) {
    const [workingHours, setWorkingHours] = useState<Record<string, DaySchedule>>(
        DAYS.reduce((acc, day) => {
            acc[day.key] = serviceProvider.working_hours?.[day.key] || DEFAULT_HOURS;
            return acc;
        }, {} as Record<string, DaySchedule>)
    );

    const [serviceDuration, setServiceDuration] = useState(serviceProvider.avg_service_duration || 60);
    const [advanceBooking, setAdvanceBooking] = useState(serviceProvider.min_advance_booking_hours || 24);
    const [processing, setProcessing] = useState(false);

    const handleDayToggle = (day: string) => {
        setWorkingHours(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                available: !prev[day].available
            }
        }));
    };

    const handleTimeChange = (day: string, field: 'start' | 'end', value: string) => {
        setWorkingHours(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                [field]: value
            }
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        const workingDays = Object.entries(workingHours)
            .filter(([_, schedule]) => schedule.available)
            .map(([day]) => day);

        const formattedHours = Object.entries(workingHours).map(([day, schedule]) => ({
            day,
            ...schedule
        }));

        router.put(`/admin/service-management/${serviceProvider.id}/working-hours`, {
            working_hours: formattedHours,
            working_days: workingDays,
            avg_service_duration: serviceDuration,
            min_advance_booking_hours: advanceBooking
        }, {
            preserveScroll: true,
            onFinish: () => setProcessing(false)
        });
    };

    const displayName = serviceProvider.business_name ||
        `${serviceProvider.user.first_name} ${serviceProvider.user.last_name}`;

    const activeCount = Object.values(workingHours).filter(h => h.available).length;

    return (
        <AdminLayout>
            <Head title="Working Hours" />

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
                            <h1 className="text-3xl font-bold text-gray-900">Working Hours</h1>
                            <p className="text-gray-600 mt-1">
                                {displayName} • {serviceProvider.category.name}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Info Card */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-blue-900">Configure Availability Schedule</h3>
                            <p className="text-sm text-blue-700 mt-1">
                                Set working hours for each day. This will be used to determine when the provider can accept service bookings.
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Weekly Schedule */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Weekly Schedule</h2>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {activeCount} day(s) active
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const allActive = activeCount === 7;
                                        setWorkingHours(prev =>
                                            Object.keys(prev).reduce((acc, day) => {
                                                acc[day] = { ...prev[day], available: !allActive };
                                                return acc;
                                            }, {} as Record<string, DaySchedule>)
                                        );
                                    }}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    {activeCount === 7 ? 'Disable All' : 'Enable All'}
                                </button>
                            </div>
                        </div>

                        <div className="divide-y divide-gray-200">
                            {DAYS.map(({ key, label }) => {
                                const schedule = workingHours[key];
                                return (
                                    <div
                                        key={key}
                                        className={`p-6 transition-colors ${
                                            schedule.available ? 'bg-white' : 'bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-6">
                                            {/* Toggle */}
                                            <div className="flex items-center">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={schedule.available}
                                                        onChange={() => handleDayToggle(key)}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                </label>
                                            </div>

                                            {/* Day Name */}
                                            <div className="w-32">
                                                <h3 className={`font-semibold ${
                                                    schedule.available ? 'text-gray-900' : 'text-gray-400'
                                                }`}>
                                                    {label}
                                                </h3>
                                            </div>

                                            {/* Time Inputs */}
                                            {schedule.available ? (
                                                <div className="flex-1 flex items-center gap-4">
                                                    <div className="flex-1">
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Start Time
                                                        </label>
                                                        <input
                                                            type="time"
                                                            value={schedule.start}
                                                            onChange={(e) => handleTimeChange(key, 'start', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                    </div>
                                                    <span className="text-gray-400 mt-6">—</span>
                                                    <div className="flex-1">
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            End Time
                                                        </label>
                                                        <input
                                                            type="time"
                                                            value={schedule.end}
                                                            onChange={(e) => handleTimeChange(key, 'end', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                    </div>
                                                    <div className="mt-6">
                                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex-1 text-gray-400 font-medium">
                                                    CLOSED
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Service Settings */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Service Settings</h2>
                            <p className="text-sm text-gray-600 mt-1">
                                Configure duration and booking requirements
                            </p>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Service Duration */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Average Service Duration
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="15"
                                            max="480"
                                            step="15"
                                            value={serviceDuration}
                                            onChange={(e) => setServiceDuration(parseInt(e.target.value))}
                                            className="w-full px-4 py-2.5 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
                                            minutes
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1.5">
                                        Average time needed to complete a service (15-480 minutes)
                                    </p>
                                </div>

                                {/* Advance Booking */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Minimum Advance Booking
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="1"
                                            max="168"
                                            value={advanceBooking}
                                            onChange={(e) => setAdvanceBooking(parseInt(e.target.value))}
                                            className="w-full px-4 py-2.5 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
                                            hours
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1.5">
                                        Minimum hours required before service date (1-168 hours)
                                    </p>
                                </div>
                            </div>

                            {/* Info Alert */}
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                    <div className="text-sm text-amber-800">
                                        <p className="font-medium">Time Slot Calculation</p>
                                        <p className="mt-1">
                                            Available time slots will be automatically calculated based on your working hours
                                            and service duration. Customers can only book slots that are at least {advanceBooking} hours in advance.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-6">
                        <div className="text-sm text-gray-600">
                            {activeCount === 0 ? (
                                <span className="text-amber-600 font-medium flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    Please enable at least one working day
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    Working {activeCount} day(s) per week
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
                                disabled={processing || activeCount === 0}
                                className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {processing ? 'Saving...' : 'Save Working Hours'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
