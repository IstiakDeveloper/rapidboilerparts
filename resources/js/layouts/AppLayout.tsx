import React, { useState, useEffect, ReactNode } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    Search, Phone, Mail, MessageCircle, ShoppingCart, User, Menu, X,
    ChevronDown, MapPin, Clock, Award, Zap, Trash2, Plus, Minus,
    Heart, Package, Truck, Shield, Facebook, Twitter, Youtube, Instagram,
    AlertCircle, CheckCircle, Info, XCircle
} from 'lucide-react';

interface CartItem {
    id: number;
    quantity: number;
    product: {
        id: number;
        name: string;
        slug: string;
        sku: string;
        final_price: number;
        image: string;
        in_stock: boolean;
        stock_quantity: number;
        brand: {
            name: string;
        };
    };
}

interface PageProps {
    auth: {
        user: {
            id: number;
            first_name: string;
            last_name: string;
            email: string;
            user_type: string;
        } | null;
    };
    cartCount: number;
    wishlistCount: number;
    siteSettings: Record<string, string>;
    flash?: {
        success?: string;
        error?: string;
        info?: string;
        warning?: string;
    };
    csrf_token: string;
    app_url: string;
}

interface AppLayoutProps {
    children: ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
    const { auth, cartCount: initialCartCount = 0, wishlistCount = 0, siteSettings = {}, flash, csrf_token } = usePage<PageProps>().props;

    const [cartCount, setCartCount] = useState(initialCartCount);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isScrolled, setIsScrolled] = useState(false);
    const [showCategories, setShowCategories] = useState(false);
    const [showAccount, setShowAccount] = useState(false);
    const [cartSidebarOpen, setCartSidebarOpen] = useState(false);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loadingCart, setLoadingCart] = useState(false);
    const [updatingItem, setUpdatingItem] = useState<number | null>(null);
    const [deletingItem, setDeletingItem] = useState<number | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
    const [toastMessage, setToastMessage] = useState<{
        type: 'success' | 'error' | 'info' | 'warning',
        message: string
    } | null>(null);

    useEffect(() => {
        setCartCount(initialCartCount);
    }, [initialCartCount]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 5);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (flash?.success) {
            showToast('success', flash.success);
        } else if (flash?.error) {
            showToast('error', flash.error);
        } else if (flash?.info) {
            showToast('info', flash.info);
        } else if (flash?.warning) {
            showToast('warning', flash.warning);
        }
    }, [flash]);

    useEffect(() => {
        const handleCartUpdate = (e: CustomEvent) => {
            if (e.detail?.cartCount !== undefined) {
                setCartCount(e.detail.cartCount);
                if (cartSidebarOpen) {
                    loadCartItems();
                }
            }
        };

        window.addEventListener('cartUpdated', handleCartUpdate as EventListener);
        return () => window.removeEventListener('cartUpdated', handleCartUpdate as EventListener);
    }, [cartSidebarOpen]);

    useEffect(() => {
        const handleShowToast = (e: CustomEvent) => {
            setToastMessage({ type: e.detail.type, message: e.detail.message });
            setTimeout(() => setToastMessage(null), 4000);
        };

        window.addEventListener('showToast', handleShowToast as EventListener);
        return () => window.removeEventListener('showToast', handleShowToast as EventListener);
    }, []);

    const showToast = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
        setToastMessage({ type, message });
        setTimeout(() => setToastMessage(null), 4000);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.get('/products', { search: searchQuery }, {
                preserveState: true,
            });
            setMobileMenuOpen(false);
        }
    };

    const loadCartItems = async () => {
        setLoadingCart(true);
        try {
            const response = await fetch('/api/cart/items', {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setCartItems(data.items || []);
                setCartCount(data.count || 0); // ← এই line add করো
            }
        } catch (error) {
            console.error('Failed to load cart items:', error);
            showToast('error', 'Failed to load cart items');
        } finally {
            setLoadingCart(false);
        }
    };

    const handleCartSidebarToggle = () => {
        if (!cartSidebarOpen) {
            loadCartItems();
        }
        setCartSidebarOpen(!cartSidebarOpen);
    };

    const updateCartItemQuantity = async (itemId: number, newQuantity: number) => {
        if (newQuantity < 1) return;

        const item = cartItems.find(i => i.id === itemId);
        if (!item) return;

        if (newQuantity > item.product.stock_quantity) {
            showToast('warning', `Only ${item.product.stock_quantity} items available`);
            return;
        }

        setUpdatingItem(itemId);
        try {
            const response = await fetch(`/cart/${itemId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrf_token,
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ quantity: newQuantity }),
            });

            if (response.ok) {
                const data = await response.json();

                setCartItems(prev => prev.map(item =>
                    item.id === itemId ? { ...item, quantity: newQuantity } : item
                ));

                if (data.cartCount !== undefined) {
                    setCartCount(data.cartCount);
                }

                // ← এই line add করো - immediately refresh count from API
                await loadCartItems();

                window.dispatchEvent(new CustomEvent('cartUpdated', {
                    detail: { cartCount: data.cartCount }
                }));

                showToast('success', 'Quantity updated');
            } else {
                const data = await response.json();
                showToast('error', data.error || 'Failed to update quantity');
            }
        } catch (error) {
            console.error('Update quantity error:', error);
            showToast('error', 'Failed to update quantity');
        } finally {
            setUpdatingItem(null);
        }
    };

    const removeCartItem = async (itemId: number) => {
        setShowDeleteConfirm(null);
        setDeletingItem(itemId);
        try {
            const response = await fetch(`/cart/remove/${itemId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': csrf_token,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                console.error('Response status:', response.status);
                const text = await response.text();
                console.error('Response body:', text);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setCartItems(prev => prev.filter(item => item.id !== itemId));
                if (data.cartCount !== undefined) {
                    setCartCount(data.cartCount);
                }

                // ← এই line add করো - immediately refresh
                await loadCartItems();

                window.dispatchEvent(new CustomEvent('cartUpdated', {
                    detail: { cartCount: data.cartCount }
                }));
                showToast('success', data.message || 'Item removed from cart');
            } else {
                showToast('error', data.message || 'Failed to remove item');
            }
        } catch (error) {
            console.error('Remove item error:', error);
            showToast('error', 'Network error. Please try again.');
        } finally {
            setDeletingItem(null);
        }
    };

    const formatPrice = (price: number): string => {
        const symbol = siteSettings.currency_symbol || '£';
        return `${symbol}${price.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const cartTotal = cartItems.reduce((sum, item) => sum + (item.product.final_price * item.quantity), 0);

    const categories = [
        { name: 'PCB Boards', slug: 'pcb-boards', icon: '🔌' },
        { name: 'Pumps', slug: 'pumps', icon: '💧' },
        { name: 'Diverter Valves', slug: 'diverter-valves', icon: '🔧' },
        { name: 'Heat Exchangers', slug: 'heat-exchangers', icon: '🔥' },
        { name: 'Gas Valves', slug: 'gas-valves', icon: '⚡' },
        { name: 'Fans & Motors', slug: 'fans-motors', icon: '🌀' },
    ];

    const ToastIcon = ({ type }: { type: string }) => {
        switch (type) {
            case 'success': return <CheckCircle size={20} />;
            case 'error': return <XCircle size={20} />;
            case 'warning': return <AlertCircle size={20} />;
            case 'info': return <Info size={20} />;
            default: return <Info size={20} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Toast Notification */}
            {toastMessage && (
                <div className="fixed top-20 right-4 z-[60] animate-slide-in-right">
                    <div className={`rounded-lg shadow-lg px-4 py-3 flex items-center space-x-3 min-w-[300px] ${toastMessage.type === 'success' ? 'bg-green-600' :
                        toastMessage.type === 'error' ? 'bg-red-600' :
                            toastMessage.type === 'warning' ? 'bg-orange-600' :
                                'bg-blue-600'
                        } text-white`}>
                        <ToastIcon type={toastMessage.type} />
                        <span className="text-sm font-medium flex-1">{toastMessage.message}</span>
                        <button onClick={() => setToastMessage(null)} className="hover:opacity-75">
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm !== null && (
                <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                <AlertCircle className="text-red-600" size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Remove Item</h3>
                                <p className="text-sm text-gray-600">Are you sure you want to remove this item from your cart?</p>
                            </div>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => removeCartItem(showDeleteConfirm)}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Announcement Bar */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-1.5 px-4">
                <div className="max-w-7xl mx-auto flex items-center justify-center text-xs font-medium">
                    <Zap className="mr-1.5" size={14} />
                    <span>Free UK delivery over £{siteSettings.free_shipping_threshold || '50'} • Next day available • Expert support</span>
                </div>
            </div>

            {/* Header */}
            <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-lg shadow-lg' : 'bg-white shadow-sm'}`}>
                {/* Top Bar - keeping existing code */}
                <div className="border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 py-2">
                        <div className="flex justify-between items-center">
                            <div className="hidden md:flex items-center space-x-4 text-xs text-gray-600">
                                <a href={`mailto:${siteSettings.contact_email || 'info@rapidboilerparts.com'}`} className="flex items-center space-x-1.5 hover:text-red-600 transition-colors">
                                    <Mail size={12} />
                                    <span>{siteSettings.contact_email || 'info@rapidboilerparts.com'}</span>
                                </a>
                                <a href={`tel:${siteSettings.contact_phone || '01919338762'}`} className="flex items-center space-x-1.5 hover:text-red-600 transition-colors">
                                    <Phone size={12} />
                                    <span>{siteSettings.contact_phone || '01919 338762'}</span>
                                </a>
                                <div className="flex items-center space-x-1.5 text-green-600">
                                    <Clock size={12} />
                                    <span>Mon-Fri 8AM-6PM</span>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <div className="hidden md:flex space-x-2">
                                    {siteSettings.facebook_url && (
                                        <a href={siteSettings.facebook_url} className="text-gray-400 hover:text-blue-600 transition-colors" target="_blank" rel="noopener noreferrer" title="Facebook">
                                            <Facebook size={14} />
                                        </a>
                                    )}
                                    {siteSettings.twitter_url && (
                                        <a href={siteSettings.twitter_url} className="text-gray-400 hover:text-blue-400 transition-colors" target="_blank" rel="noopener noreferrer" title="Twitter">
                                            <Twitter size={14} />
                                        </a>
                                    )}
                                    {siteSettings.instagram_url && (
                                        <a href={siteSettings.instagram_url} className="text-gray-400 hover:text-pink-600 transition-colors" target="_blank" rel="noopener noreferrer" title="Instagram">
                                            <Instagram size={14} />
                                        </a>
                                    )}
                                    {siteSettings.youtube_url && (
                                        <a href={siteSettings.youtube_url} className="text-gray-400 hover:text-red-600 transition-colors" target="_blank" rel="noopener noreferrer" title="YouTube">
                                            <Youtube size={14} />
                                        </a>
                                    )}
                                </div>

                                {auth.user ? (
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowAccount(!showAccount)}
                                            onBlur={() => setTimeout(() => setShowAccount(false), 200)}
                                            className="flex items-center space-x-1.5 text-xs text-gray-600 hover:text-red-600 transition-colors"
                                        >
                                            <User size={14} />
                                            <span className="hidden sm:inline">{auth.user.first_name}</span>
                                            <ChevronDown size={12} className={`transition-transform ${showAccount ? 'rotate-180' : ''}`} />
                                        </button>

                                        {showAccount && (
                                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                                                <Link href="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                                    <User size={14} className="mr-2" />
                                                    My Profile
                                                </Link>
                                                <Link href="/orders" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                                    <Package size={14} className="mr-2" />
                                                    My Orders
                                                </Link>
                                                <Link href="/wishlist" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                                    <Heart size={14} className="mr-2" />
                                                    Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
                                                </Link>
                                                <Link href="/profile/addresses" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                                    <MapPin size={14} className="mr-2" />
                                                    Addresses
                                                </Link>
                                                <div className="border-t border-gray-100 my-2"></div>
                                                <Link
                                                    href="/logout"
                                                    method="post"
                                                    as="button"
                                                    className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                >
                                                    <X size={14} className="mr-2" />
                                                    Sign Out
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-2 text-xs">
                                        <Link href="/login" className="text-gray-600 hover:text-red-600 transition-colors px-2 py-1">Sign In</Link>
                                        <span className="text-gray-300">|</span>
                                        <Link href="/register" className="bg-red-600 text-white px-3 py-1.5 rounded-md hover:bg-red-700 transition-colors font-medium">Register</Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Header - keeping existing nav code */}
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center group">
                            <div className="relative">
                                <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-red-700 rounded-xl flex items-center justify-center mr-3 transform group-hover:scale-105 transition-transform shadow-lg">
                                    <div className="text-white font-bold text-xs text-center leading-tight">
                                        <img src="/logo.png" alt="Logo" />
                                    </div>
                                </div>
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                    <Zap size={8} className="text-white" />
                                </div>
                            </div>
                            <div className="hidden md:block">
                                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-red-600 bg-clip-text text-transparent">
                                    {siteSettings.site_name || 'RapidBoilerParts'}
                                </h1>
                                <p className="text-xs text-gray-600 font-medium -mt-0.5">
                                    {siteSettings.site_tagline || 'Fast. Reliable. Expert.'}
                                </p>
                            </div>
                        </Link>

                        <nav className="hidden lg:flex items-center space-x-1">
                            <Link href="/" className="px-3 py-1.5 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all font-medium">
                                Home
                            </Link>

                            <div className="relative">
                                <button
                                    onMouseEnter={() => setShowCategories(true)}
                                    onMouseLeave={() => setShowCategories(false)}
                                    className="flex items-center px-3 py-1.5 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all font-medium"
                                >
                                    Categories
                                    <ChevronDown size={14} className={`ml-1 transition-transform ${showCategories ? 'rotate-180' : ''}`} />
                                </button>

                                {showCategories && (
                                    <div
                                        className="absolute left-0 mt-1 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 py-3 z-50"
                                        onMouseEnter={() => setShowCategories(true)}
                                        onMouseLeave={() => setShowCategories(false)}
                                    >
                                        <div className="grid grid-cols-2 gap-1 px-3">
                                            {categories.map((category) => (
                                                <Link
                                                    key={category.slug}
                                                    href={`/categories/${category.slug}`}
                                                    className="flex items-center space-x-2.5 p-2.5 rounded-lg hover:bg-red-50 transition-all group"
                                                >
                                                    <span className="text-lg group-hover:scale-110 transition-transform">{category.icon}</span>
                                                    <span className="text-xs font-medium text-gray-700 group-hover:text-red-600">{category.name}</span>
                                                </Link>
                                            ))}
                                        </div>
                                        <div className="border-t border-gray-100 mt-3 pt-3 px-3">
                                            <Link href="/categories" className="text-red-600 font-medium text-xs hover:text-red-700">
                                                View All Categories →
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Link href="/brands" className="px-3 py-1.5 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all font-medium">
                                Brands
                            </Link>
                            <Link href="/products" className="px-3 py-1.5 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all font-medium">
                                Shop
                            </Link>
                            <Link href="/contact" className="px-3 py-1.5 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all font-medium">
                                Support
                            </Link>
                        </nav>

                        <div className="flex items-center space-x-3">
                            <div className="hidden md:block">
                                <form onSubmit={handleSearch} className="relative">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search parts..."
                                        className="w-64 pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:ring-0 transition-colors bg-gray-50 focus:bg-white text-sm"
                                    />
                                    <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                    <button
                                        type="submit"
                                        className="absolute right-1.5 top-1.5 bg-red-600 text-white p-1.5 rounded-md hover:bg-red-700 transition-colors"
                                    >
                                        <Search size={14} />
                                    </button>
                                </form>
                            </div>

                            <a
                                href={`https://wa.me/${siteSettings.whatsapp_number || '+447832156716'}`}
                                className="hidden md:flex items-center space-x-1.5 bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-all shadow-md hover:shadow-lg text-sm font-medium"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <MessageCircle size={16} />
                                <span>Chat</span>
                            </a>

                            <button
                                onClick={handleCartSidebarToggle}
                                className="relative group"
                                title="Shopping Cart"
                            >
                                <div className="bg-red-600 text-white p-2.5 rounded-lg hover:bg-red-700 transition-all shadow-md hover:shadow-lg group-hover:scale-105">
                                    <ShoppingCart size={18} />
                                </div>
                                {cartCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                                        {cartCount > 99 ? '99+' : cartCount}
                                    </span>
                                )}
                            </button>

                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                aria-label="Toggle mobile menu"
                            >
                                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu - keeping existing code */}
                {mobileMenuOpen && (
                    <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
                        <div className="px-4 py-3 space-y-3">
                            <form onSubmit={handleSearch} className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search parts..."
                                    className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:ring-0 transition-colors text-sm"
                                />
                                <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                            </form>

                            <nav className="space-y-1">
                                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm text-gray-700 font-medium border-b border-gray-100 hover:text-red-600">Home</Link>
                                <Link href="/categories" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm text-gray-700 font-medium border-b border-gray-100 hover:text-red-600">Categories</Link>
                                <Link href="/brands" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm text-gray-700 font-medium border-b border-gray-100 hover:text-red-600">Brands</Link>
                                <Link href="/products" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm text-gray-700 font-medium border-b border-gray-100 hover:text-red-600">Shop</Link>
                                <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm text-gray-700 font-medium border-b border-gray-100 hover:text-red-600">Support</Link>
                            </nav>

                            <div className="pt-3 border-t border-gray-100 space-y-2">
                                <a href={`tel:${siteSettings.contact_phone || '01919338762'}`} className="flex items-center space-x-2 text-gray-600 text-sm hover:text-red-600">
                                    <Phone size={16} />
                                    <span>{siteSettings.contact_phone || '01919 338762'}</span>
                                </a>
                                <a
                                    href={`https://wa.me/${siteSettings.whatsapp_number || '+447832156716'}`}
                                    className="flex items-center space-x-2 bg-green-500 text-white p-2.5 rounded-lg text-sm font-medium hover:bg-green-600"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <MessageCircle size={16} />
                                    <span>WhatsApp Chat</span>
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Cart Sidebar */}
            {cartSidebarOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/60 z-[55] transition-opacity"
                        onClick={() => setCartSidebarOpen(false)}
                    />

                    <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl z-[56] transform transition-transform duration-300 flex flex-col">
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-red-600 to-red-700">
                            <h2 className="text-lg font-bold text-white flex items-center">
                                <ShoppingCart size={20} className="mr-2" />
                                Shopping Cart ({cartCount})
                            </h2>
                            <button
                                onClick={() => setCartSidebarOpen(false)}
                                className="text-white hover:bg-red-800 p-1.5 rounded transition-colors"
                                aria-label="Close cart"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4">
                            {loadingCart ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                                </div>
                            ) : cartItems.length === 0 ? (
                                <div className="text-center py-12">
                                    <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
                                    <p className="text-gray-600 mb-4">Your cart is empty</p>
                                    <Link
                                        href="/products"
                                        onClick={() => setCartSidebarOpen(false)}
                                        className="inline-block bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors font-medium"
                                    >
                                        Continue Shopping
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <Link href={`/products/${item.product.slug}`} onClick={() => setCartSidebarOpen(false)} className="flex-shrink-0">
                                                <img
                                                    src={`/storage/${item.product.image}`}
                                                    alt={item.product.name}
                                                    className="w-20 h-20 object-cover rounded border border-gray-200"
                                                    onError={(e) => {
                                                        e.currentTarget.src = '/storage/products/placeholder-product.jpg';
                                                    }}
                                                />
                                            </Link>
                                            <div className="flex-1 min-w-0">
                                                <Link
                                                    href={`/products/${item.product.slug}`}
                                                    onClick={() => setCartSidebarOpen(false)}
                                                    className="font-medium text-sm text-gray-800 hover:text-red-600 line-clamp-2 block mb-1"
                                                >
                                                    {item.product.name}
                                                </Link>
                                                <p className="text-xs text-gray-500 mb-1">
                                                    {item.product.brand.name} • SKU: {item.product.sku}
                                                </p>
                                                <p className="text-sm font-bold text-gray-800 mb-2">
                                                    {formatPrice(item.product.final_price)}
                                                </p>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                                                            disabled={item.quantity <= 1 || updatingItem === item.id}
                                                            className="p-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                            aria-label="Decrease quantity"
                                                        >
                                                            <Minus size={12} />
                                                        </button>
                                                        <span className="text-sm font-medium w-8 text-center">
                                                            {updatingItem === item.id ? '...' : item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                                                            disabled={item.quantity >= item.product.stock_quantity || updatingItem === item.id}
                                                            className="p-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                            aria-label="Increase quantity"
                                                        >
                                                            <Plus size={12} />
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() => setShowDeleteConfirm(item.id)}
                                                        disabled={deletingItem === item.id}
                                                        className="text-red-600 hover:text-red-700 p-1 transition-colors disabled:opacity-50"
                                                        aria-label="Remove item"
                                                    >
                                                        {deletingItem === item.id ? (
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                                        ) : (
                                                            <Trash2 size={16} />
                                                        )}
                                                    </button>
                                                </div>

                                                {!item.product.in_stock && (
                                                    <p className="text-xs text-red-600 mt-1">Out of stock</p>
                                                )}
                                                {item.product.in_stock && item.product.stock_quantity <= 5 && (
                                                    <p className="text-xs text-orange-600 mt-1">Only {item.product.stock_quantity} left!</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {cartItems.length > 0 && (
                            <div className="border-t border-gray-200 p-4 space-y-3 bg-gray-50">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal:</span>
                                        <span className="font-medium">{formatPrice(cartTotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Shipping:</span>
                                        <span className="font-medium">
                                            {cartTotal >= parseFloat(siteSettings.free_shipping_threshold || '50') ? (
                                                <span className="text-green-600">FREE</span>
                                            ) : (
                                                'Calculated at checkout'
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                        <span className="font-bold text-gray-800">Total:</span>
                                        <span className="text-xl font-bold text-red-600">{formatPrice(cartTotal)}</span>
                                    </div>
                                </div>

                                <Link
                                    href="/checkout"
                                    onClick={() => setCartSidebarOpen(false)}
                                    className="block w-full bg-red-600 text-white text-center py-3 rounded-md hover:bg-red-700 transition-colors font-medium shadow-md"
                                >
                                    Proceed to Checkout
                                </Link>
                                <Link
                                    href="/cart"
                                    onClick={() => setCartSidebarOpen(false)}
                                    className="block w-full border border-gray-300 text-gray-700 text-center py-3 rounded-md hover:bg-gray-50 transition-colors"
                                >
                                    View Full Cart
                                </Link>
                            </div>
                        )}
                    </div>
                </>
            )}

            <main className="min-h-screen">{children}</main>

            {/* Footer - keeping existing footer code */}
            <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div>
                            <div className="flex items-center mb-4">
                                <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-700 rounded-lg flex items-center justify-center mr-3">
                                    <span className="text-white font-bold text-xs">RBP</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-base">{siteSettings.site_name || 'RapidBoilerParts'}</h3>
                                    <p className="text-xs text-gray-400">{siteSettings.site_tagline || 'Fast. Reliable. Expert.'}</p>
                                </div>
                            </div>

                            <p className="text-xs text-gray-400 mb-4">{siteSettings.site_description || 'UK\'s leading supplier of boiler spare parts.'}</p>

                            <div className="flex items-center space-x-3 mb-4">
                                <div className="bg-green-600 px-2 py-1 rounded-full text-xs font-medium">Trusted</div>
                                <div className="bg-red-600 px-2 py-1 rounded-full text-xs font-medium">Est. 2010</div>
                            </div>

                            <div className="flex space-x-3">
                                {siteSettings.facebook_url && (
                                    <a href={siteSettings.facebook_url} className="bg-gray-800 p-2 rounded-lg hover:bg-blue-600 transition-colors" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                                        <Facebook size={16} />
                                    </a>
                                )}
                                {siteSettings.twitter_url && (
                                    <a href={siteSettings.twitter_url} className="bg-gray-800 p-2 rounded-lg hover:bg-blue-400 transition-colors" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                                        <Twitter size={16} />
                                    </a>
                                )}
                                {siteSettings.instagram_url && (
                                    <a href={siteSettings.instagram_url} className="bg-gray-800 p-2 rounded-lg hover:bg-pink-600 transition-colors" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                                        <Instagram size={16} />
                                    </a>
                                )}
                                {siteSettings.youtube_url && (
                                    <a href={siteSettings.youtube_url} className="bg-gray-800 p-2 rounded-lg hover:bg-red-600 transition-colors" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                                        <Youtube size={16} />
                                    </a>
                                )}
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-sm mb-4">Quick Links</h4>
                            <ul className="space-y-2 text-xs">
                                <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                                <li><Link href="/shipping-info" className="text-gray-400 hover:text-white transition-colors">Delivery Info</Link></li>
                                <li><Link href="/returns-policy" className="text-gray-400 hover:text-white transition-colors">Returns</Link></li>
                                <li><Link href="/warranty" className="text-gray-400 hover:text-white transition-colors">Warranty</Link></li>
                                <li><Link href="/technical-support" className="text-gray-400 hover:text-white transition-colors">Technical Support</Link></li>
                                <li><Link href="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-sm mb-4">Shop Categories</h4>
                            <ul className="space-y-2 text-xs">
                                {categories.slice(0, 5).map((category) => (
                                    <li key={category.slug}>
                                        <Link href={`/categories/${category.slug}`} className="text-gray-400 hover:text-white transition-colors">
                                            {category.name}
                                        </Link>
                                    </li>
                                ))}
                                <li><Link href="/categories" className="text-red-400 hover:text-red-300 transition-colors">View All →</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-sm mb-4">Contact Us</h4>
                            <div className="space-y-3 text-xs">
                                <div className="flex items-start space-x-2">
                                    <Phone size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <a href={`tel:${siteSettings.contact_phone || '01919338762'}`} className="text-gray-300 hover:text-white transition-colors">
                                            {siteSettings.contact_phone || '01919 338762'}
                                        </a>
                                        <p className="text-gray-500">Mon-Fri 8AM-6PM</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-2">
                                    <Mail size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                                    <a href={`mailto:${siteSettings.contact_email || 'info@rapidboilerparts.com'}`} className="text-gray-300 hover:text-white transition-colors break-words">
                                        {siteSettings.contact_email || 'info@rapidboilerparts.com'}
                                    </a>
                                </div>

                                <div className="flex items-start space-x-2">
                                    <MessageCircle size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                                    <a
                                        href={`https://wa.me/${siteSettings.whatsapp_number || '+447832156716'}`}
                                        className="text-gray-300 hover:text-white transition-colors"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        WhatsApp Chat
                                    </a>
                                </div>

                                {siteSettings.company_address && (
                                    <div className="flex items-start space-x-2">
                                        <MapPin size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                                        <p className="text-gray-300">{siteSettings.company_address}</p>
                                    </div>
                                )}

                                <div className="mt-4 pt-4 border-t border-gray-700">
                                    <h5 className="font-semibold mb-2 text-xs">Newsletter</h5>
                                    <form className="flex">
                                        <input
                                            type="email"
                                            placeholder="Your email"
                                            className="flex-1 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-l-md focus:outline-none focus:border-red-500 text-white placeholder-gray-400 text-xs"
                                            required
                                        />
                                        <button
                                            type="submit"
                                            className="bg-red-600 text-white px-3 py-1.5 rounded-r-md hover:bg-red-700 transition-colors text-xs font-medium"
                                        >
                                            Subscribe
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-700 pt-6 mt-6">
                        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4 text-xs text-gray-400">
                                <p>&copy; {new Date().getFullYear()} {siteSettings.company_name || 'RapidBoilerParts'}. All rights reserved.</p>
                                {(siteSettings.company_registration || siteSettings.vat_number) && (
                                    <div className="flex items-center space-x-2">
                                        {siteSettings.company_registration && (
                                            <>
                                                <span>Reg: {siteSettings.company_registration}</span>
                                                {siteSettings.vat_number && <span>|</span>}
                                            </>
                                        )}
                                        {siteSettings.vat_number && <span>VAT: {siteSettings.vat_number}</span>}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-wrap justify-center md:justify-end space-x-3 text-xs">
                                <Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">Privacy</Link>
                                <Link href="/terms-conditions" className="text-gray-400 hover:text-white transition-colors">Terms</Link>
                                <Link href="/cookie-policy" className="text-gray-400 hover:text-white transition-colors">Cookies</Link>
                                <Link href="/sitemap" className="text-gray-400 hover:text-white transition-colors">Sitemap</Link>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row items-center justify-between mt-6 pt-6 border-t border-gray-700">
                            <div>
                                <h5 className="text-xs font-medium mb-2">We Accept</h5>
                                <div className="flex items-center space-x-2">
                                    <div className="bg-white rounded px-2 py-1">
                                        <span className="text-blue-600 font-bold text-xs">VISA</span>
                                    </div>
                                    <div className="bg-white rounded px-2 py-1">
                                        <span className="text-red-600 font-bold text-xs">MC</span>
                                    </div>
                                    <div className="bg-white rounded px-2 py-1">
                                        <span className="text-blue-400 font-bold text-xs">AMEX</span>
                                    </div>
                                    <div className="bg-white rounded px-2 py-1">
                                        <span className="text-blue-600 font-bold text-xs">PayPal</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 mt-4 md:mt-0">
                                <div className="flex items-center space-x-1 bg-green-600 px-3 py-1.5 rounded-full">
                                    <Shield size={12} />
                                    <span className="text-xs font-medium">SSL Secure</span>
                                </div>
                                <div className="flex items-center space-x-1 bg-blue-600 px-3 py-1.5 rounded-full">
                                    <Award size={12} />
                                    <span className="text-xs font-medium">Verified</span>
                                </div>
                                <div className="flex items-center space-x-1 bg-red-600 px-3 py-1.5 rounded-full">
                                    <Truck size={12} />
                                    <span className="text-xs font-medium">Fast Delivery</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Fixed Action Buttons */}
            <div className="fixed bottom-4 right-4 z-40 flex flex-col space-y-2">
                <a
                    href={`https://wa.me/${siteSettings.whatsapp_number || '+447832156716'}`}
                    className="group bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all transform hover:scale-110"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="WhatsApp Chat"
                >
                    <MessageCircle size={20} />
                    <span className="absolute right-14 bg-gray-800 text-white px-3 py-1.5 rounded-md text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                        Chat on WhatsApp
                    </span>
                </a>

                <button
                    onClick={handleCartSidebarToggle}
                    className="group bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all transform hover:scale-110 relative"
                    title="Shopping Cart"
                >
                    <ShoppingCart size={20} />
                    {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-bounce">
                            {cartCount > 99 ? '99+' : cartCount}
                        </span>
                    )}
                    <span className="absolute right-14 bg-gray-800 text-white px-3 py-1.5 rounded-md text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                        Cart ({cartCount})
                    </span>
                </button>

                {isScrolled && (
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="group bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all transform hover:scale-110"
                        title="Back to Top"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                        <span className="absolute right-14 bg-gray-800 text-white px-3 py-1.5 rounded-md text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                            Back to Top
                        </span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default AppLayout;
