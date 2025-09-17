import React, { useState, useEffect, ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Search, Phone, Mail, MessageCircle, ShoppingCart, User, Menu, X, ChevronDown, MapPin, Clock, Award, Zap } from 'lucide-react';

interface PageProps {
  auth: {
    user: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
    } | null;
  };
  cartCount?: number;
  wishlistCount?: number;
  siteSettings?: Record<string, string>;
}

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { auth, cartCount = 0, wishlistCount = 0, siteSettings = {} } = usePage<PageProps>().props;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showAccount, setShowAccount] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 5);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const categories = [
    { name: 'PCB Boards', slug: 'pcb-boards', icon: '🔌' },
    { name: 'Pumps', slug: 'pumps', icon: '💧' },
    { name: 'Diverter Valves', slug: 'diverter-valves', icon: '🔧' },
    { name: 'Heat Exchangers', slug: 'heat-exchangers', icon: '🔥' },
    { name: 'Gas Valves', slug: 'gas-valves', icon: '⚡' },
    { name: 'Fans & Motors', slug: 'fans-motors', icon: '🌀' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Announcement Bar */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center text-xs font-medium">
          <Zap className="mr-1.5" size={14} />
          <span>Free UK delivery over £50 • Next day available • Expert support</span>
        </div>
      </div>

      {/* Compact Header */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-lg shadow-lg' : 'bg-white shadow-sm'
      }`}>
        {/* Top Bar - Reduced */}
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
                    <a href={siteSettings.facebook_url} className="text-gray-400 hover:text-red-600 transition-colors" target="_blank" rel="noopener noreferrer">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M20 10C20 4.477 15.523 0 10 0S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" /></svg>
                    </a>
                  )}
                  {siteSettings.twitter_url && (
                    <a href={siteSettings.twitter_url} className="text-gray-400 hover:text-blue-400 transition-colors" target="_blank" rel="noopener noreferrer">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" /></svg>
                    </a>
                  )}
                </div>

                {auth.user ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowAccount(!showAccount)}
                      className="flex items-center space-x-1.5 text-xs text-gray-600 hover:text-red-600 transition-colors"
                    >
                      <User size={14} />
                      <span className="hidden sm:inline">{auth.user.first_name}</span>
                      <ChevronDown size={12} className={`transition-transform ${showAccount ? 'rotate-180' : ''}`} />
                    </button>

                    {showAccount && (
                      <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                        <Link href="/account" className="flex items-center px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">
                          <User size={12} className="mr-2" />
                          My Account
                        </Link>
                        <Link href="/account/orders" className="flex items-center px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">
                          <ShoppingCart size={12} className="mr-2" />
                          Orders
                        </Link>
                        <Link href="/wishlist" className="flex items-center px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">
                          ❤️ Wishlist ({wishlistCount})
                        </Link>
                        <div className="border-t border-gray-100 my-1"></div>
                        <Link href="/logout" method="post" as="button" className="w-full text-left flex items-center px-3 py-2 text-xs text-red-600 hover:bg-red-50">
                          <X size={12} className="mr-2" />
                          Sign Out
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-xs">
                    <Link href="/login" className="text-gray-600 hover:text-red-600 transition-colors px-2 py-1">Sign In</Link>
                    <span className="text-gray-300">|</span>
                    <Link href="/register" className="bg-red-600 text-white px-3 py-1.5 rounded-md hover:bg-red-700 transition-colors">Register</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Header - Compact */}
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo - Smaller */}
            <Link href="/" className="flex items-center group">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-red-700 rounded-xl flex items-center justify-center mr-3 transform group-hover:scale-105 transition-transform shadow-lg">
                  <div className="text-white font-bold text-xs text-center">
                    <div className="text-xs">RAPID</div>
                    <div className="text-xs -mt-0.5">BOILER</div>
                    <div className="text-xs -mt-0.5">PARTS</div>
                  </div>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <Zap size={8} className="text-white" />
                </div>
              </div>
              <div className="hidden md:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-red-600 bg-clip-text text-transparent">
                  RapidBoilerParts
                </h1>
                <p className="text-xs text-gray-600 font-medium -mt-0.5">
                  Fast. Reliable. Expert.
                </p>
              </div>
            </Link>

            {/* Navigation - Compact */}
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

            {/* Search & Cart - Compact */}
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
                className="hidden md:flex items-center space-x-1.5 bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-all shadow-md hover:shadow-lg text-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={16} />
                <span className="font-medium">Chat</span>
              </a>

              <Link href="/cart" className="relative group">
                <div className="bg-red-600 text-white p-2.5 rounded-lg hover:bg-red-700 transition-all shadow-md hover:shadow-lg group-hover:scale-105">
                  <ShoppingCart size={18} />
                </div>
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                    {cartCount}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu - Compact */}
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
                <Link href="/" className="block py-2 text-sm text-gray-700 font-medium border-b border-gray-100">Home</Link>
                <Link href="/categories" className="block py-2 text-sm text-gray-700 font-medium border-b border-gray-100">Categories</Link>
                <Link href="/brands" className="block py-2 text-sm text-gray-700 font-medium border-b border-gray-100">Brands</Link>
                <Link href="/products" className="block py-2 text-sm text-gray-700 font-medium border-b border-gray-100">Shop</Link>
                <Link href="/contact" className="block py-2 text-sm text-gray-700 font-medium border-b border-gray-100">Support</Link>
              </nav>

              <div className="pt-3 border-t border-gray-100 space-y-2">
                <a
                  href={`tel:${siteSettings.contact_phone || '01919338762'}`}
                  className="flex items-center space-x-2 text-gray-600 text-sm"
                >
                  <Phone size={16} />
                  <span>{siteSettings.contact_phone || '01919 338762'}</span>
                </a>
                <a
                  href={`https://wa.me/${siteSettings.whatsapp_number || '+447832156716'}`}
                  className="flex items-center space-x-2 bg-green-500 text-white p-2.5 rounded-lg text-sm"
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

      <main className="min-h-screen">{children}</main>

      {/* Compact Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Company Info - Compact */}
            <div>
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-700 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-xs">RBP</span>
                </div>
                <div>
                  <h3 className="font-bold text-base">RapidBoilerParts</h3>
                  <p className="text-xs text-gray-400">Fast. Reliable. Expert.</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-green-600 px-2 py-1 rounded-full text-xs font-medium">Trusted</div>
                <div className="bg-red-600 px-2 py-1 rounded-full text-xs font-medium">Est. 2010</div>
              </div>

              <div className="flex space-x-3">
                {siteSettings.facebook_url && (
                  <a href={siteSettings.facebook_url} className="bg-gray-800 p-2 rounded-lg hover:bg-red-600 transition-colors" target="_blank" rel="noopener noreferrer">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M20 10C20 4.477 15.523 0 10 0S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" /></svg>
                  </a>
                )}
                {siteSettings.twitter_url && (
                  <a href={siteSettings.twitter_url} className="bg-gray-800 p-2 rounded-lg hover:bg-blue-400 transition-colors" target="_blank" rel="noopener noreferrer">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" /></svg>
                  </a>
                )}
              </div>
            </div>

            {/* Quick Links - Compact */}
            <div>
              <h4 className="font-bold text-sm mb-4">Quick Links</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/shipping-info" className="text-gray-400 hover:text-white transition-colors">Delivery Info</Link></li>
                <li><Link href="/returns-policy" className="text-gray-400 hover:text-white transition-colors">Returns</Link></li>
                <li><Link href="/warranty" className="text-gray-400 hover:text-white transition-colors">Warranty</Link></li>
                <li><Link href="/technical-support" className="text-gray-400 hover:text-white transition-colors">Support</Link></li>
              </ul>
            </div>

            {/* Categories - Compact */}
            <div>
              <h4 className="font-bold text-sm mb-4">Categories</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/categories/pcb-boards" className="text-gray-400 hover:text-white transition-colors">PCB Boards</Link></li>
                <li><Link href="/categories/pumps" className="text-gray-400 hover:text-white transition-colors">Pumps</Link></li>
                <li><Link href="/categories/diverter-valves" className="text-gray-400 hover:text-white transition-colors">Valves</Link></li>
                <li><Link href="/categories/heat-exchangers" className="text-gray-400 hover:text-white transition-colors">Heat Exchangers</Link></li>
                <li><Link href="/categories" className="text-red-400 hover:text-red-300 transition-colors">View All →</Link></li>
              </ul>
            </div>

            {/* Contact - Compact */}
            <div>
              <h4 className="font-bold text-sm mb-4">Contact</h4>
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

                {/* Newsletter - Compact */}
                <div className="mt-4">
                  <h5 className="font-semibold mb-2 text-xs">Newsletter</h5>
                  <form className="flex">
                    <input
                      type="email"
                      placeholder="Your email"
                      className="flex-1 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-l-md focus:outline-none focus:border-red-500 text-white placeholder-gray-400 text-xs"
                    />
                    <button
                      type="submit"
                      className="bg-red-600 text-white px-3 py-1.5 rounded-r-md hover:bg-red-700 transition-colors text-xs font-medium"
                    >
                      Go
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Footer - Compact */}
          <div className="border-t border-gray-700 pt-6 mt-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex flex-col md:flex-row items-center space-y-1 md:space-y-0 md:space-x-4 text-xs text-gray-400">
                <p>&copy; 2024 RapidBoilerParts. All rights reserved.</p>
                <div className="flex items-center space-x-2">
                  <span>Reg: 12345678</span>
                  <span>|</span>
                  <span>VAT: GB123456789</span>
                </div>
              </div>
              <div className="flex flex-wrap justify-center md:justify-end space-x-3 mt-3 md:mt-0 text-xs">
                <Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">Privacy</Link>
                <Link href="/terms-conditions" className="text-gray-400 hover:text-white transition-colors">Terms</Link>
                <Link href="/cookie-policy" className="text-gray-400 hover:text-white transition-colors">Cookies</Link>
              </div>
            </div>

            {/* Payment Methods - Compact */}
            <div className="flex flex-col md:flex-row items-center justify-between mt-4 pt-4 border-t border-gray-700">
              <div>
                <h5 className="text-xs font-medium mb-2">Secure Payments</h5>
                <div className="flex items-center space-x-3">
                  <div className="bg-white rounded p-1">
                    <img src="/images/visa.png" alt="Visa" className="h-4 w-auto" />
                  </div>
                  <div className="bg-white rounded p-1">
                    <img src="/images/mastercard.png" alt="Mastercard" className="h-4 w-auto" />
                  </div>
                  <div className="bg-white rounded p-1">
                    <img src="/images/paypal.png" alt="PayPal" className="h-4 w-auto" />
                  </div>
                </div>
              </div>
              <div className="text-center md:text-right mt-3 md:mt-0">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 bg-green-600 px-2 py-1 rounded-full">
                    <Award size={10} />
                    <span className="text-xs font-medium">SSL</span>
                  </div>
                  <div className="flex items-center space-x-1 bg-red-600 px-2 py-1 rounded-full">
                    <Zap size={10} />
                    <span className="text-xs font-medium">Fast</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Compact Fixed Action Buttons */}
      <div className="fixed bottom-4 right-4 z-40 flex flex-col space-y-2">
        <a
          href={`https://wa.me/${siteSettings.whatsapp_number || '+447832156716'}`}
          className="group bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all transform hover:scale-110"
          target="_blank"
          rel="noopener noreferrer"
          title="WhatsApp Chat"
        >
          <MessageCircle size={20} />
          <span className="absolute right-14 bg-gray-800 text-white px-2 py-1 rounded-md text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Chat
          </span>
        </a>

        <Link
          href="/cart"
          className="group bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all transform hover:scale-110 relative"
          title="Cart"
        >
          <ShoppingCart size={20} />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-bounce">
              {cartCount}
            </span>
          )}
          <span className="absolute right-14 bg-gray-800 text-white px-2 py-1 rounded-md text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Cart ({cartCount})
          </span>
        </Link>

        {isScrolled && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="group bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all transform hover:scale-110"
            title="Top"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        )}
      </div>

      {/* Click outside handler for dropdowns */}
      {(showCategories || showAccount) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            setShowCategories(false);
            setShowAccount(false);
          }}
        />
      )}
    </div>
  );
};

export default AppLayout;
