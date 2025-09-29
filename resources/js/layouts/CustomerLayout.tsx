import React, { ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    User, MapPin, Package, Heart, ChevronRight,
    Home, LogOut, Settings
} from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';

interface CustomerLayoutProps {
    children: ReactNode;
    title?: string;
}

interface PageProps {
    orderCount?: number;
    addressCount?: number;
    wishlistCount?: number;
    auth: {
        user: {
            first_name: string;
            last_name: string;
        };
    };
}

const CustomerLayout: React.FC<CustomerLayoutProps> = ({ children, title }) => {
    const { orderCount = 0, addressCount = 0, wishlistCount = 0, auth } = usePage<PageProps>().props;
    const currentPath = window.location.pathname;

    const menuItems = [
        {
            icon: User,
            label: 'Profile',
            href: '/profile',
            description: 'Manage your account',
        },
        {
            icon: Package,
            label: 'My Orders',
            href: '/orders',
            badge: orderCount > 0 ? orderCount : null,
            description: 'Track orders',
        },
        {
            icon: MapPin,
            label: 'Addresses',
            href: '/profile/addresses',
            badge: addressCount > 0 ? addressCount : null,
            description: 'Delivery addresses',
        },
        {
            icon: Heart,
            label: 'Wishlist',
            href: '/wishlist',
            badge: wishlistCount > 0 ? wishlistCount : null,
            description: 'Saved items',
        },
    ];

    return (
        <AppLayout>
            {/* Breadcrumb */}
            <div className="bg-gray-50 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center space-x-2 text-sm">
                        <Link href="/" className="text-gray-500 hover:text-red-600 transition-colors">
                            <Home size={16} />
                        </Link>
                        <ChevronRight size={14} className="text-gray-400" />
                        <span className="text-gray-700 font-medium">{title || 'My Account'}</span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Welcome Header */}
                <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-6 mb-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold mb-1">
                                Welcome back, {auth.user.first_name}!
                            </h1>
                            <p className="text-red-100 text-sm">
                                {title || 'Manage your account settings and preferences'}
                            </p>
                        </div>
                        <div className="hidden md:flex items-center justify-center w-16 h-16 bg-white/20 rounded-full backdrop-blur-sm">
                            <User size={32} className="text-white" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden sticky top-20">
                            <div className="p-4 bg-gray-50 border-b border-gray-200">
                                <h2 className="font-semibold text-gray-800 text-sm">Account Menu</h2>
                            </div>
                            <nav className="p-2">
                                {menuItems.map((item) => {
                                    const isActive = currentPath === item.href ||
                                        (item.href !== '/profile' && currentPath.startsWith(item.href));

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`flex items-center justify-between p-3 rounded-lg transition-all mb-1 group ${isActive
                                                    ? 'bg-red-50 text-red-600 font-medium'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <item.icon
                                                    size={18}
                                                    className={isActive ? 'text-red-600' : 'text-gray-400 group-hover:text-red-600'}
                                                />
                                                <div className="flex flex-col">
                                                    <span className="text-sm">{item.label}</span>
                                                    {!isActive && (
                                                        <span className="text-xs text-gray-500 hidden lg:block">
                                                            {item.description}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {item.badge && (
                                                    <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                                                        {item.badge}
                                                    </span>
                                                )}
                                                {!isActive && (
                                                    <ChevronRight size={16} className="text-gray-400 group-hover:text-red-600" />
                                                )}
                                            </div>
                                        </Link>
                                    );
                                })}

                                <div className="border-t border-gray-200 my-2 pt-2">
                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        className="w-full flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all group"
                                    >
                                        <LogOut size={18} className="text-gray-400 group-hover:text-red-600" />
                                        <span className="text-sm">Logout</span>
                                    </Link>
                                </div>
                            </nav>

                            {/* Quick Stats */}
                            <div className="hidden lg:block border-t border-gray-200 p-4 bg-gray-50">
                                <h3 className="text-sm font-semibold text-gray-800 mb-3">Quick Stats</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-600">Total Orders</span>
                                        <span className="text-sm font-bold text-gray-800">{orderCount}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-600">Saved Addresses</span>
                                        <span className="text-sm font-bold text-gray-800">{addressCount}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-600">Wishlist Items</span>
                                        <span className="text-sm font-bold text-gray-800">{wishlistCount}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {children}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default CustomerLayout;
