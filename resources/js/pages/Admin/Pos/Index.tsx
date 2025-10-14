import React, { useState, useEffect, useRef } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Search, ShoppingCart, User, CreditCard, Printer, Plus, Minus, X, DollarSign, Save, Mail, Phone, Package } from 'lucide-react';
import type { OrderForm } from '../../../types/pos';
import CreateCustomerModal from '@/components/Pos/CreateCustomerModal';
import { toast } from 'react-hot-toast';
import { Dialog, Transition } from '@headlessui/react';
import { formatPrice, toNumber } from '@/utils/formatters';

interface Product {
  id: number;
  name: string;
  sku: string;
  barcode: string;
  price: number;
  stock_quantity: number;
  image: string;
  brand: {
    id: number;
    name: string;
  };
  category: {
    id: number;
    name: string;
  };
}

interface CartItem {
  product: Product;
  quantity: number;
  price: number;
  subtotal: number;
}

interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

interface PageProps {
  products?: Product[];
  customers?: Customer[];
  order?: {
    id: number;
  };
}

interface Props {
  lastOrder: any;
  recentOrders: any[];
}

const defaultNewCustomer = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
};

export default function PosIndex({ lastOrder, recentOrders }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [customerResults, setCustomerResults] = useState<Customer[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState(defaultNewCustomer);

  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const TAX_RATE = 0.20;

  useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
    // Load all products when component mounts
    router.get('/admin/pos/search-products',
      { query: '' },
      {
        preserveState: true,
        preserveScroll: true,
        onSuccess: (page) => {
          setSearchResults((page.props as PageProps).products || []);
        },
        onError: () => {
          toast.error('Failed to load products');
        }
      }
    );
  }, []);

  // Update amount paid whenever cart changes
  useEffect(() => {
    const total = calculateTotals().total;
    setAmountPaid(total.toString());
  }, [cart]);

  const searchProducts = (query: string) => {
    router.get('/admin/pos/search-products',
      { query },
      {
        preserveState: true,
        preserveScroll: true,
        onSuccess: (page) => {
          setSearchResults((page.props as PageProps).products || []);
        },
        onError: () => {
          toast.error('Failed to search products');
        }
      }
    );
  };

  const searchCustomers = (query: string) => {
    router.get('/admin/pos/get-customer',
      { query },
      {
        preserveState: true,
        preserveScroll: true,
        onSuccess: (page) => {
          setCustomerResults((page.props as PageProps).customers || []);
        },
        onError: () => {
          toast.error('Failed to search customers');
        }
      }
    );
  };

  const addToCart = (product: Product) => {
    setCart(currentCart => {
      const existingItem = currentCart.find(item => item.product.id === product.id);

      if (existingItem) {
        return currentCart.map(item =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: toNumber((item.quantity + 1) * toNumber(item.price))
              }
            : item
        );
      }

      return [...currentCart, {
        product,
        quantity: 1,
        price: toNumber(product.price),
        subtotal: toNumber(product.price)
      }];
    });

    // Only clear the search query but keep the results
    setSearchQuery('');
    // Keep focus on barcode input for next scan
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    setCart(currentCart =>
      currentCart.map(item =>
        item.product.id === productId
          ? {
              ...item,
              quantity: newQuantity,
              subtotal: toNumber(newQuantity * toNumber(item.price))
            }
          : item
      )
    );
  };

  const removeFromCart = (productId: number) => {
    setCart(currentCart => currentCart.filter(item => item.product.id !== productId));
  };

  const calculateTotals = () => {
    const subtotal = toNumber(cart.reduce((sum, item) => sum + (item.subtotal || 0), 0));
    const tax = toNumber(subtotal * TAX_RATE);
    const total = toNumber(subtotal + tax);
    const change = toNumber(toNumber(amountPaid) - total);

    // Automatically update amount paid when total changes
    if (paymentMethod === 'cash' && (!amountPaid || parseFloat(amountPaid) < total)) {
      setAmountPaid(total.toString());
    }

    return {
      subtotal,
      tax,
      total,
      change
    };
  };

  const form = useForm<OrderForm>({
    items: [],
    customer_id: null,
    payment_method: 'cash',
    notes: '',
    subtotal: 0,
    tax: 0,
    total: 0,
    amount_paid: '',
    change: 0,
  });

    const handlePayment = () => {
    if (loading || form.processing) return; // Prevent submission if already processing
    setLoading(true);

    const totals = calculateTotals();

    if (paymentMethod === 'cash' && parseFloat(amountPaid) < totals.total) {
      toast.error('Amount paid must be greater than or equal to total');
      setLoading(false);
      return;
    }

    // First set form data
    form.setData({
      items: cart.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.price
      })),
      customer_id: customer?.id ?? null,
      payment_method: paymentMethod,
      notes,
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total,
      amount_paid: amountPaid || totals.total.toString(),
      change: totals.change,
    });

    // Then post with form data already set
    form.post('/admin/pos/create-order', {
      preserveScroll: true,
      preserveState: true,
      onBefore: () => {
        if (form.processing) {
          return false; // Cancel if already processing
        }
      },
      onSuccess: (page) => {
        toast.success('Order created successfully');
        const orderId = ((page.props as PageProps).order)?.id;
        if (orderId) {
          window.open(`/admin/pos/receipt/${orderId}`, '_blank');
        }
        setCart([]);
        setCustomer(null);
        setPaymentMethod('cash');
        setAmountPaid('');
        setNotes('');
        form.reset();
      },
      onError: (errors) => {
        Object.values(errors).forEach((error) => {
          toast.error(error as string);
        });
      },
      onFinish: () => {
        setLoading(false);
      }
    });
  };

  const totals = calculateTotals();

  return (
    <AdminLayout>
      <Head title="POS System" />
      <main className="flex h-[calc(100vh-64px)] bg-gray-100">
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar with Search */}
          <div className="bg-white shadow-sm p-3 flex gap-4 items-center border-b border-gray-200">
            <div className="flex-1 flex gap-4">
              {/* Barcode Scanner */}
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2 text-gray-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  ref={barcodeInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value.length >= 2) {
                      searchProducts(e.target.value);
                    } else if (e.target.value.length === 0) {
                      // Only clear results if search is completely empty
                      router.get('/admin/pos/search-products',
                        { query: '' },
                        {
                          preserveState: true,
                          preserveScroll: true,
                          onSuccess: (page) => {
                            setSearchResults((page.props as PageProps).products || []);
                          }
                        }
                      );
                    }
                  }}
                  placeholder="Scan barcode or search products..."
                  className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                />
              </div>

              {/* Quick Customer Select */}
              <div className="relative flex-1 max-w-xs">
                <User className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={customerSearchQuery}
                  onChange={(e) => {
                    setCustomerSearchQuery(e.target.value);
                    if (e.target.value.length >= 2) {
                      searchCustomers(e.target.value);
                    }
                  }}
                  placeholder="Quick customer search..."
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />

                {/* Customer Results Dropdown */}
                {customerSearchQuery && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
                    <div className="max-h-48 overflow-y-auto text-xs">
                      {customerResults.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => {
                            setCustomer(c);
                            setCustomerSearchQuery('');
                          }}
                          className="px-3 py-2 hover:bg-gray-50 cursor-pointer"
                        >
                          <div className="font-medium">{c.first_name} {c.last_name}</div>
                          <div className="text-gray-500 text-xs">{c.email}</div>
                        </div>
                      ))}
                      <div
                        onClick={() => {
                          setNewCustomer(prev => ({ ...prev, first_name: customerSearchQuery }));
                          setIsNewCustomerModalOpen(true);
                        }}
                        className="px-3 py-2 text-blue-600 hover:bg-gray-50 cursor-pointer text-xs font-medium"
                      >
                        + New customer
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Customer Selection */}
              <div className="relative">
                <button
                  onClick={() => setIsNewCustomerModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700"
                >
                  <User className="w-4 h-4 text-gray-500" />
                  {customer ? (
                    <span>{customer.first_name} {customer.last_name}</span>
                  ) : (
                    <span>Select Customer</span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex gap-4 p-4 overflow-hidden">
            {/* Products Grid */}
            <div className="flex-1 bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Products</h2>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                    Categories
                  </button>
                  <button className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                    Filter
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {(searchResults || []).map((product) => (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-blue-500 hover:shadow-md transition-all duration-200"
                    >
                      <div className="aspect-square bg-gray-100">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <div className="font-medium text-sm text-gray-900 truncate group-hover:text-blue-600">
                          {product.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{product.sku}</div>
                        <div className="text-sm font-semibold text-blue-600 mt-2">
                          £{formatPrice(product.price)}
                        </div>
                        <div className={`absolute top-2 right-2 text-xs px-1.5 py-0.5 rounded
                          ${product.stock_quantity > 0
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                        </div>
                      </div>
                    </button>
                  ))}

                </div>
              </div>
            </div>

            {/* Cart Panel */}
            <div className="w-[420px] bg-white rounded-lg shadow-lg flex flex-col border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-blue-600" />
                    <h2 className="font-semibold text-gray-900">Current Cart</h2>
                  </div>
                  <div className="text-sm text-gray-500">{cart.length} items</div>
                </div>
                {customer && (
                  <div className="mt-2 flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-md">
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {customer.first_name} {customer.last_name}
                    </span>
                  </div>
                )}
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-auto">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <ShoppingCart className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">Cart is empty</h3>
                    <p className="text-sm text-gray-500">Add products by clicking on them</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {cart.map((item) => (
                      <div
                        key={item.product.id}
                        className="p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex gap-3">
                          {item.product.image ? (
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">{item.product.name}</div>
                            <div className="text-sm text-gray-500 mt-0.5">{item.product.sku}</div>
                            <div className="mt-1 flex items-center gap-2">
                              <span className="text-sm font-medium text-blue-600">£{formatPrice(item.price)}</span>
                              <span className="text-gray-400">×</span>
                              <div className="flex items-center gap-1 bg-gray-100 rounded-md">
                                <button
                                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                  className="p-1 hover:text-blue-600"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value) || 1)}
                                  className="w-10 text-center text-sm bg-transparent border-0 focus:ring-0"
                                />
                                <button
                                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                  className="p-1 hover:text-blue-600"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <div className="text-sm font-medium">
                              £{formatPrice(item.subtotal)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Payment Summary */}
              <div className="border-t border-gray-200 bg-gray-50">
                <div className="p-4 space-y-3">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium">£{formatPrice(totals.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>VAT (20%)</span>
                    <span className="font-medium">£{formatPrice(totals.tax)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span>£{formatPrice(totals.total)}</span>
                  </div>

                  {/* Payment Method Selection */}
                  <div className="grid grid-cols-2 gap-2 pt-3">
                    <button
                      onClick={() => {
                        setPaymentMethod('cash');
                        // Set amount paid to total when switching to cash
                        const total = calculateTotals().total;
                        setAmountPaid(total.toString());
                      }}
                      className={`px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-medium
                        transition-all duration-200 border
                        ${paymentMethod === 'cash'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      <DollarSign className="w-4 h-4" />
                      Cash
                    </button>
                    <button
                      onClick={() => {
                        setPaymentMethod('card');
                        // For card payment, set exact amount
                        const total = calculateTotals().total;
                        setAmountPaid(total.toString());
                      }}
                      className={`px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-medium
                        transition-all duration-200 border
                        ${paymentMethod === 'card'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      Card
                    </button>
                  </div>

                  {/* Cash Payment Input */}
                  {paymentMethod === 'cash' && (
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Amount Received</label>
                      <div className="flex gap-2 items-center">
                        <div className="relative flex-1">
                          <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="number"
                            step="0.01"
                            value={amountPaid}
                            onChange={(e) => setAmountPaid(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        {parseFloat(amountPaid) >= totals.total && (
                          <div className="bg-emerald-50 text-emerald-700 px-3 py-2 rounded-md text-sm font-medium">
                            Change: £{formatPrice(totals.change)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  <div className="bg-white p-3 rounded-lg border border-gray-200">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Order Notes</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Add any notes about the order..."
                    />
                  </div>

                  {/* Complete Sale Button */}
                  <button
                    onClick={handlePayment}
                    disabled={cart.length === 0 || loading}
                    className="w-full px-4 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg
                      hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                      disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2
                      transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    {loading ? (
                      'Processing...'
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Complete Sale
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <CreateCustomerModal
        isOpen={isNewCustomerModalOpen}
        onClose={() => setIsNewCustomerModalOpen(false)}
        onSuccess={(newCustomer) => {
          setCustomer(newCustomer);
          setCustomerSearchQuery('');
          setCustomerResults([]);
          setIsNewCustomerModalOpen(false);
        }}
        initialData={newCustomer}
      />
    </AdminLayout>
  );
}
