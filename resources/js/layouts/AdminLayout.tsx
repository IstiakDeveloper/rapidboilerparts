import React, { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { Toaster } from 'react-hot-toast';
import {
    LayoutDashboard,
    Package,
    Tag,
    Lightbulb,
    ShoppingBag,
    Users,
    Settings,
    Ticket,
    Star,
    MessageSquare,
    Menu,
    X,
    User,
    LogOut,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    XCircle,
    ChevronDown,
    ChevronUp,
    FileText,
    BarChart3,
    Database,
    Zap,
    Eye,
    Shield,
    Wrench,
    Upload,
    Layers,
    Target,
    Gift
} from 'lucide-react';

interface AdminLayoutProps {
    children: React.ReactNode;
}

interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    user_type: string;
}

interface PageProps extends Record<string, unknown> {
    auth: {
        user: User;
    };
    flash?: {
        success?: string;
        error?: string;
    };
}

interface NavigationItem {
    name: string;
    href?: string;
    icon: any;
    children?: NavigationItem[];
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const { auth, flash } = usePage<PageProps>().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [flashVisible, setFlashVisible] = useState(true);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [currentPath, setCurrentPath] = useState('');
    const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

    useEffect(() => {
        setCurrentPath(window.location.pathname);
    }, []);

    // Auto-expand groups that contain active routes when path changes
    useEffect(() => {
        const activeGroups = navigation
            .filter(group => group.children && hasActiveChild(group))
            .map(group => group.name);

        if (activeGroups.length > 0) {
            setExpandedGroups(prev => [...new Set([...prev, ...activeGroups])]);
        }
    }, [currentPath]);

    useEffect(() => {
        if (flash?.success || flash?.error) {
            setFlashVisible(true);
            const timer = setTimeout(() => {
                setFlashVisible(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const navigation: NavigationItem[] = [
        {
            name: 'Dashboard',
            href: '/admin/dashboard',
            icon: LayoutDashboard,
        },
        {
            name: 'Catalog Management',
            icon: Package,
            children: [
                {
                    name: 'Products',
                    href: '/admin/products',
                    icon: Package,
                },
                {
                    name: 'Categories',
                    href: '/admin/categories',
                    icon: Tag,
                },
                {
                    name: 'Brands',
                    href: '/admin/brands',
                    icon: Lightbulb,
                },
                {
                    name: 'Product Attributes',
                    href: '/admin/product-attributes',
                    icon: Layers,
                },
                {
                    name: 'Compatible Models',
                    href: '/admin/compatible-models',
                    icon: Target,
                }
            ]
        },
        {
            name: 'Services',
            icon: Wrench,
            children: [
                {
                    name: 'Product Services',
                    href: '/admin/product-services',
                    icon: Settings,
                }
            ]
        },
        {
            name: 'Order Management',
            icon: ShoppingBag,
            children: [
                {
                    name: 'POS',
                    href: '/admin/pos',
                    icon: ShoppingBag,
                },
                {
                    name: 'All Orders',
                    href: '/admin/orders',
                    icon: ShoppingBag,
                },
                {
                    name: 'Export CSV',
                    href: '/admin/orders/export/csv',
                    icon: Upload,
                },
                {
                    name: 'Export Excel',
                    href: '/admin/orders/export/excel',
                    icon: FileText,
                }
            ]
        },
        {
            name: 'Customer Management',
            icon: Users,
            children: [
                {
                    name: 'All Users',
                    href: '/admin/users',
                    icon: Users,
                },
                {
                    name: 'Product Reviews',
                    href: '/admin/product-reviews',
                    icon: Star,
                },
                {
                    name: 'Contact Inquiries',
                    href: '/admin/contact-inquiries',
                    icon: MessageSquare,
                }
            ]
        },
        {
            name: 'Marketing',
            icon: Gift,
            children: [
                {
                    name: 'Coupons',
                    href: '/admin/coupons',
                    icon: Ticket,
                }
            ]
        },
        {
            name: 'Reports & Analytics',
            icon: BarChart3,
            children: [
                {
                    name: 'Sales Report',
                    href: '/admin/reports/sales',
                    icon: BarChart3,
                },
                {
                    name: 'Products Report',
                    href: '/admin/reports/products',
                    icon: Package,
                },
                {
                    name: 'Customers Report',
                    href: '/admin/reports/customers',
                    icon: Users,
                },
                {
                    name: 'Inventory Report',
                    href: '/admin/reports/inventory',
                    icon: Database,
                },
                {
                    name: 'Reviews Report',
                    href: '/admin/reports/reviews',
                    icon: Star,
                }
            ]
        },
        {
            name: 'System Management',
            icon: Database,
            children: [
                {
                    name: 'Settings',
                    href: '/admin/settings',
                    icon: Settings,
                },
                {
                    name: 'System Info',
                    href: '/admin/system/info',
                    icon: Database,
                },
                {
                    name: 'File Manager',
                    href: '/admin/files/browse',
                    icon: Upload,
                },
                {
                    name: 'System Logs',
                    href: '/admin/system/logs',
                    icon: FileText,
                },
                {
                    name: 'Clear Cache',
                    href: '/admin/system/cache/clear',
                    icon: Zap,
                },
                {
                    name: 'Create Backup',
                    href: '/admin/system/backup',
                    icon: Shield,
                }
            ]
        }
    ];

    const handleLogout = () => {
        router.post('/logout');
    };

    const isActive = (href: string) => {
        return currentPath === href || currentPath.startsWith(href + '/');
    };

    const hasActiveChild = (group: NavigationItem): boolean => {
        if (!group.children) return false;
        return group.children.some(child =>
            child.href && (currentPath === child.href || currentPath.startsWith(child.href + '/'))
        );
    };

    const toggleGroup = (groupName: string) => {
        setExpandedGroups(prev =>
            prev.includes(groupName)
                ? prev.filter(name => name !== groupName)
                : [...prev, groupName]
        );
    };

    const renderNavigationItem = (item: NavigationItem, level: number = 0) => {
        const Icon = item.icon;
        const isExpanded = expandedGroups.includes(item.name);
        const hasChildren = item.children && item.children.length > 0;
        const isGroupActive = hasChildren && hasActiveChild(item);
        const isItemActive = item.href && isActive(item.href);
        const isActiveItem = isItemActive || isGroupActive;

        if (hasChildren) {
            return (
                <div key={item.name} className="space-y-1">
                    <button
                        onClick={() => !isCollapsed && toggleGroup(item.name)}
                        className={`group flex items-center w-full px-3 py-2.5 text-xs font-medium rounded-lg
                            transition-all duration-200 hover:scale-[1.02] relative overflow-hidden
                            ${isGroupActive
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                                : 'text-slate-600 hover:bg-gradient-to-r hover:from-slate-100 hover:to-blue-50 hover:text-blue-700'
                            }`}
                    >
                        {isGroupActive && (
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 animate-pulse" />
                        )}
                        <Icon className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4 mr-3'} relative z-10
                            ${isGroupActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-600'}
                            transition-colors duration-200`} />
                        {!isCollapsed && (
                            <>
                                <span className="relative z-10 font-medium flex-1 text-left">{item.name}</span>
                                <div className="relative z-10 ml-2">
                                    {isExpanded ?
                                        <ChevronUp className="w-3 h-3" /> :
                                        <ChevronDown className="w-3 h-3" />
                                    }
                                </div>
                            </>
                        )}
                        {isGroupActive && !isCollapsed && (
                            <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        )}
                    </button>

                    {/* Dropdown Items */}
                    {!isCollapsed && hasChildren && isExpanded && (
                        <div className="ml-4 space-y-1 border-l-2 border-slate-200 pl-4">
                            {item.children!.map(child => (
                                <Link
                                    key={child.name}
                                    href={child.href!}
                                    className={`group flex items-center px-3 py-2 text-xs font-medium rounded-lg
                                        transition-all duration-200 hover:scale-[1.01] relative overflow-hidden
                                        ${isActive(child.href!)
                                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20'
                                            : 'text-slate-500 hover:bg-gradient-to-r hover:from-slate-50 hover:to-emerald-50 hover:text-emerald-700'
                                        }`}
                                >
                                    {isActive(child.href!) && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 animate-pulse" />
                                    )}
                                    <child.icon className={`w-3 h-3 mr-2 relative z-10
                                        ${isActive(child.href!) ? 'text-white' : 'text-slate-400 group-hover:text-emerald-600'}
                                        transition-colors duration-200`} />
                                    <span className="relative z-10 font-medium">{child.name}</span>
                                    {isActive(child.href!) && (
                                        <div className="ml-auto w-1 h-1 bg-white rounded-full animate-pulse" />
                                    )}
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Collapsed mode indicator */}
                    {isCollapsed && hasChildren && isGroupActive && (
                        <div className="absolute right-1 top-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    )}
                </div>
            );
        }

        // Single navigation item (no children)
        return (
            <Link
                key={item.name}
                href={item.href!}
                className={`group flex items-center px-3 py-2.5 text-xs font-medium rounded-lg
                    transition-all duration-200 hover:scale-[1.02] relative overflow-hidden
                    ${isItemActive
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                        : 'text-slate-600 hover:bg-gradient-to-r hover:from-slate-100 hover:to-blue-50 hover:text-blue-700'
                    }`}
            >
                {isItemActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 animate-pulse" />
                )}
                <Icon className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4 mr-3'} relative z-10
                    ${isItemActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-600'}
                    transition-colors duration-200`} />
                {!isCollapsed && (
                    <span className="relative z-10 font-medium">{item.name}</span>
                )}

                {isItemActive && !isCollapsed && (
                    <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                )}
            </Link>
        );
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
            {/* Toast Container */}
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#fff',
                        color: '#363636',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        borderRadius: '0.5rem',
                        padding: '1rem',
                    },
                }}
            />

            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                >
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                </div>
            )}

            {/* Sidebar - Fixed positioning */}
            <div
                className={`fixed inset-y-0 left-0 z-40 ${isCollapsed ? 'w-20' : 'w-72'}
                    bg-white/95 backdrop-blur-xl shadow-xl border-r border-slate-200/50
                    transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    transition-all duration-300 ease-in-out lg:translate-x-0
                    flex flex-col h-full`}
            >
                {/* Logo Section - Fixed height */}
                <div className={`flex items-center ${isCollapsed ? 'justify-center px-4' : 'justify-between px-6'} h-20
                    bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 relative overflow-hidden flex-shrink-0`}>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-pulse" />
                    {!isCollapsed && (
                        <h1 className="text-xl font-bold text-white relative z-10 tracking-wide">
                            Boiler Parts Admin
                        </h1>
                    )}
                    {isCollapsed && (
                        <div className="text-2xl font-bold text-white relative z-10">BP</div>
                    )}

                    {/* Collapse Toggle - Desktop Only */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg
                            bg-white/20 hover:bg-white/30 text-white transition-all duration-200
                            hover:scale-110 relative z-10"
                    >
                        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    </button>

                    {/* Mobile Close Button */}
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-white hover:bg-white/20 p-1 rounded relative z-10"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Navigation - Scrollable middle section */}
                <div className="flex-1 overflow-y-auto min-h-0">
                    <nav className="px-4 pt-6 pb-4"
                         style={{
                             scrollbarWidth: 'thin',
                             scrollbarColor: '#cbd5e1 #f1f5f9'
                         }}>
                        <style>{`
                            nav::-webkit-scrollbar {
                                width: 4px;
                            }
                            nav::-webkit-scrollbar-track {
                                background: #f1f5f9;
                                border-radius: 2px;
                            }
                            nav::-webkit-scrollbar-thumb {
                                background: #cbd5e1;
                                border-radius: 2px;
                            }
                            nav::-webkit-scrollbar-thumb:hover {
                                background: #94a3b8;
                            }
                        `}</style>
                        <div className="space-y-2">
                            {navigation.map((item) => renderNavigationItem(item))}
                        </div>
                    </nav>
                </div>

                {/* User Profile Section - Fixed at bottom */}
                <div className={`flex-shrink-0 p-4 bg-gradient-to-r from-slate-100 to-blue-100
                    rounded-xl border border-slate-200/50 mx-4 mb-4 ${isCollapsed ? 'px-2' : ''}`}>
                    <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600
                                rounded-full flex items-center justify-center shadow-md">
                                <User className="w-4 h-4 text-white" />
                            </div>
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-900 truncate">
                                    {auth.user.first_name} {auth.user.last_name}
                                </p>
                                <p className="text-[10px] text-slate-600 truncate">{auth.user.email}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main content area - Properly offset from sidebar */}
            <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out
                ml-0 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
                {/* Top header - Fixed */}
                <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-slate-200/50 sticky top-0 z-30 flex-shrink-0">
                    <div className="flex items-center justify-between h-16 px-4 lg:px-6">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100
                                    hover:text-slate-900 transition-all duration-200 hover:scale-110"
                            >
                                <Menu className="w-6 h-6" />
                            </button>

                            <div className="hidden sm:block">
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600
                                    bg-clip-text text-transparent">
                                    Welcome back, {auth.user.first_name}! 👋
                                </h2>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r
                                from-emerald-50 to-blue-50 rounded-full border border-emerald-200/50">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-sm font-medium text-emerald-700">Online</span>
                            </div>

                            <Link
                                href="/admin/pos"
                                className="flex items-center space-x-2 px-4 py-2 rounded-lg
                                    bg-gradient-to-r from-blue-500 to-indigo-600 text-white
                                    hover:from-blue-600 hover:to-indigo-700 border border-blue-400/50
                                    transition-all duration-200 hover:scale-105 hover:shadow-md"
                            >
                                <ShoppingBag className="w-4 h-4" />
                                <span className="font-medium">POS</span>
                            </Link>

                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-2 px-4 py-2 rounded-lg
                                    bg-gradient-to-r from-red-50 to-pink-50 text-red-600
                                    hover:from-red-100 hover:to-pink-100 border border-red-200/50
                                    transition-all duration-200 hover:scale-105 hover:shadow-md"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="font-medium">Logout</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Flash messages */}
                {flashVisible && flash?.success && (
                    <div className="mx-4 lg:mx-6 mt-4 p-4 bg-gradient-to-r from-emerald-50 to-green-50
                        border border-emerald-200/50 rounded-xl shadow-lg transform transition-all
                        duration-500 ease-out animate-in slide-in-from-top-2 flex-shrink-0">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <CheckCircle className="h-6 w-6 text-emerald-500" />
                            </div>
                            <div className="ml-3 flex-1">
                                <p className="text-sm font-semibold text-emerald-800">{flash.success}</p>
                            </div>
                            <button
                                onClick={() => setFlashVisible(false)}
                                className="ml-4 text-emerald-500 hover:text-emerald-700 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {flashVisible && flash?.error && (
                    <div className="mx-4 lg:mx-6 mt-4 p-4 bg-gradient-to-r from-red-50 to-pink-50
                        border border-red-200/50 rounded-xl shadow-lg transform transition-all
                        duration-500 ease-out animate-in slide-in-from-top-2 flex-shrink-0">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <XCircle className="h-6 w-6 text-red-500" />
                            </div>
                            <div className="ml-3 flex-1">
                                <p className="text-sm font-semibold text-red-800">{flash.error}</p>
                            </div>
                            <button
                                onClick={() => setFlashVisible(false)}
                                className="ml-4 text-red-500 hover:text-red-700 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Main content area - Scrollable */}
                <main className="flex-1 overflow-y-auto bg-transparent">
                    <div className="container mx-auto px-4 lg:px-6 py-6 lg:py-8 max-w-full">
                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-6 lg:p-8">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
