import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Calendar as CalendarIcon, Clock, Eye, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';
import axios from 'axios';

interface Schedule {
    id: number;
    service_date: string;
    start_time: string;
    end_time: string;
    time_slot: string;
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    notes: string | null;
    order: {
        id: number;
        order_number: string;
        user: {
            first_name: string;
            last_name: string;
        };
    } | null;
}

interface ServiceProvider {
    id: number;
    business_name: string | null;
    working_hours: Record<string, { available: boolean; start: string; end: string }> | null;
    working_days: string[] | null;
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

export default function Schedule({ serviceProvider }: Props) {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
        fetchSchedules();
    }, [currentDate]);

    const fetchSchedules = async () => {
        setLoading(true);
        try {
            const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

            const response = await axios.get(
                `/admin/service-management/${serviceProvider.id}/schedule`,
                {
                    params: {
                        start_date: startDate.toISOString().split('T')[0],
                        end_date: endDate.toISOString().split('T')[0]
                    }
                }
            );
            setSchedules(response.data.schedules || []);
        } catch (error) {
            console.error('Failed to fetch schedules:', error);
        } finally {
            setLoading(false);
        }
    };

    const displayName = serviceProvider.business_name ||
        `${serviceProvider.user.first_name} ${serviceProvider.user.last_name}`;

    const previousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const getStatusBadge = (status: string) => {
        const config: Record<string, { bg: string; text: string; label: string }> = {
            scheduled: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Scheduled' },
            in_progress: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'In Progress' },
            completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' },
            cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' }
        };
        const { bg, text, label } = config[status] || config.scheduled;
        return (
            <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${bg} ${text}`}>
                {label}
            </span>
        );
    };

    const formatTime = (time: string) => {
        try {
            const [hours, minutes] = time.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12;
            return `${displayHour}:${minutes} ${ampm}`;
        } catch {
            return time;
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-GB', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const filteredSchedules = statusFilter === 'all'
        ? schedules
        : schedules.filter(s => s.status === statusFilter);

    const groupedSchedules = filteredSchedules.reduce((acc, schedule) => {
        const date = schedule.service_date;
        if (!acc[date]) acc[date] = [];
        acc[date].push(schedule);
        return acc;
    }, {} as Record<string, Schedule[]>);

    return (
        <AdminLayout>
            <Head title="Schedule" />

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
                            <h1 className="text-3xl font-bold text-gray-900">Schedule & Bookings</h1>
                            <p className="text-gray-600 mt-1">
                                {displayName} • {serviceProvider.category.name}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        {/* Month Navigation */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={previousMonth}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <div className="min-w-[200px] text-center">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {currentDate.toLocaleDateString('en-GB', {
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </h2>
                            </div>
                            <button
                                onClick={nextMonth}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Filters */}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-gray-500" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                >
                                    <option value="all">All Status</option>
                                    <option value="scheduled">Scheduled</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>

                            <div className="flex bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                        viewMode === 'list'
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    List View
                                </button>
                                <button
                                    onClick={() => setViewMode('calendar')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                        viewMode === 'calendar'
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    Calendar View
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="text-sm text-gray-600">Total Bookings</div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">{schedules.length}</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                        <div className="text-sm text-blue-700">Scheduled</div>
                        <div className="text-2xl font-bold text-blue-900 mt-1">
                            {schedules.filter(s => s.status === 'scheduled').length}
                        </div>
                    </div>
                    <div className="bg-purple-50 rounded-lg border border-purple-200 p-4">
                        <div className="text-sm text-purple-700">In Progress</div>
                        <div className="text-2xl font-bold text-purple-900 mt-1">
                            {schedules.filter(s => s.status === 'in_progress').length}
                        </div>
                    </div>
                    <div className="bg-green-50 rounded-lg border border-green-200 p-4">
                        <div className="text-sm text-green-700">Completed</div>
                        <div className="text-2xl font-bold text-green-900 mt-1">
                            {schedules.filter(s => s.status === 'completed').length}
                        </div>
                    </div>
                </div>

                {/* Schedule Content */}
                {loading ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-gray-600 mt-4">Loading schedule...</p>
                    </div>
                ) : filteredSchedules.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto" />
                        <h3 className="text-lg font-semibold text-gray-900 mt-4">No bookings found</h3>
                        <p className="text-gray-600 mt-2">
                            {statusFilter === 'all'
                                ? 'No bookings scheduled for this month'
                                : `No ${statusFilter.replace('_', ' ')} bookings`}
                        </p>
                    </div>
                ) : viewMode === 'list' ? (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Time
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Order
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Customer
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredSchedules.map((schedule) => (
                                        <tr key={schedule.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <CalendarIcon className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-900">
                                                        {formatDate(schedule.service_date)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-900">
                                                        {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {schedule.order ? (
                                                    <button
                                                        onClick={() => router.visit(`/admin/orders/${schedule.order!.id}`)}
                                                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                                                    >
                                                        {schedule.order.order_number}
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {schedule.order ? (
                                                    <span className="text-sm text-gray-900">
                                                        {schedule.order.user.first_name} {schedule.order.user.last_name}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(schedule.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {schedule.order && (
                                                    <button
                                                        onClick={() => router.visit(`/admin/orders/${schedule.order!.id}`)}
                                                        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        View
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    /* Calendar View - Day by Day */
                    <div className="space-y-4">
                        {Object.entries(groupedSchedules)
                            .sort(([a], [b]) => a.localeCompare(b))
                            .map(([date, daySchedules]) => (
                                <div key={date} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                    <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                                        <h3 className="font-semibold text-gray-900">{formatDate(date)}</h3>
                                        <p className="text-sm text-gray-600 mt-0.5">
                                            {daySchedules.length} booking(s)
                                        </p>
                                    </div>
                                    <div className="p-6 space-y-3">
                                        {daySchedules.map((schedule) => (
                                            <div
                                                key={schedule.id}
                                                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                            >
                                                <div className="flex items-center gap-2 min-w-[140px]">
                                                    <Clock className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                                                    </span>
                                                </div>
                                                <div className="flex-1">
                                                    {schedule.order ? (
                                                        <div>
                                                            <button
                                                                onClick={() => router.visit(`/admin/orders/${schedule.order!.id}`)}
                                                                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                                                            >
                                                                {schedule.order.order_number}
                                                            </button>
                                                            <p className="text-xs text-gray-600 mt-0.5">
                                                                {schedule.order.user.first_name} {schedule.order.user.last_name}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-400">No order</span>
                                                    )}
                                                </div>
                                                <div>{getStatusBadge(schedule.status)}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
