import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search, Filter, Eye, Edit, Trash2, Package, AlertTriangle, CheckCircle, XCircle, Star, Printer } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

interface Product {
  id: number;
  name: string;
  sku: string;
  barcode: string;
  barcode_image?: string;
  price: number;
  sale_price?: number;
  stock_quantity: number;
  status: 'active' | 'inactive' | 'draft';
  is_featured: boolean;
  brand: {
    id: number;
    name: string;
  };
  category: {
    id: number;
    name: string;
  };
  images_count: number;
  reviews_count: number;
  services_count: number;
  images?: Array<{
    id: number;
    image_path: string;
    alt_text: string;
    is_primary: boolean;
  }>;
}

interface Brand {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
}

interface Props {
  products: {
    data: Product[];
    links?: Array<{
      url: string | null;
      label: string;
      active: boolean;
    }>;
    meta?: {
      current_page?: number;
      last_page?: number;
      total?: number;
      per_page?: number;
      from?: number;
      to?: number;
    };
  };
  brands: Brand[];
  categories: Category[];
  filters: {
    search?: string;
    brand_id?: string;
    category_id?: string;
    status?: string;
    stock_status?: string;
  };
}

export default function ProductsIndex({ products, brands, categories, filters }: Props) {
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState('');
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  const [printSettings, setPrintSettings] = useState({
    width: 40, // Width in mm
    height: 20, // Height in mm
    fontSize: 8, // Font size in pt
    copies: 1, // Number of copies
    showPrice: true, // Whether to show price
    showName: true, // Whether to show product name
  });

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [productsToPrint, setProductsToPrint] = useState<Product[]>([]);

  const loadImage = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject();
      img.src = src;
    });
  };

  const printBarcodes = async (products: Product[]) => {
    if (products.length === 0) return;

    // Create print layout
    const printContent = document.createElement('div');
    printContent.style.fontFamily = 'Arial, sans-serif';
    printContent.style.margin = '0';
    printContent.style.padding = '0';

    // Add print stylesheet
    const style = document.createElement('style');
    style.textContent = `
      @page {
        size: auto;
        margin: 0mm;
      }
      @media print {
        body {
          margin: 0;
          padding: 0;
        }
        .barcode-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, ${printSettings.width}mm);
          gap: 0;
          padding: 0;
          width: 100%;
        }
        .barcode-item {
          break-inside: avoid;
          width: ${printSettings.width}mm;
          height: ${printSettings.height}mm;
          text-align: center;
          padding: 1mm;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .barcode-name {
          font-size: ${printSettings.fontSize}pt;
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 100%;
          margin-bottom: 1mm;
        }
        .barcode-image {
          max-height: ${printSettings.height - (printSettings.showName ? 6 : 4) - (printSettings.showPrice ? 4 : 0)}mm;
          width: ${printSettings.width - 2}mm;
          object-fit: contain;
        }
        .barcode-number {
          font-family: monospace;
          font-size: ${printSettings.fontSize - 1}pt;
          margin-top: 0.5mm;
        }
        .barcode-price {
          font-weight: bold;
          font-size: ${printSettings.fontSize}pt;
          margin-top: 0.5mm;
        }
      }
    `;
    printContent.appendChild(style);

    // Create container for grid layout
    const container = document.createElement('div');
    container.className = 'barcode-container';
    printContent.appendChild(container);

    try {
      // Create barcode items
      products.forEach(product => {
        if (!product.barcode_image) return;

        // Create copies
        for (let i = 0; i < printSettings.copies; i++) {
          const barcodeItem = document.createElement('div');
          barcodeItem.className = 'barcode-item';

          if (printSettings.showName) {
            const name = document.createElement('div');
            name.className = 'barcode-name';
            name.textContent = product.name;
            barcodeItem.appendChild(name);
          }

          const img = document.createElement('img');
          img.className = 'barcode-image';
          img.src = `/storage/${product.barcode_image}`;
          barcodeItem.appendChild(img);

          const number = document.createElement('div');
          number.className = 'barcode-number';
          number.textContent = product.barcode;
          barcodeItem.appendChild(number);

          if (printSettings.showPrice) {
            const price = document.createElement('div');
            price.className = 'barcode-price';
            price.textContent = formatPrice(product.sale_price || product.price);
            barcodeItem.appendChild(price);
          }

          container.appendChild(barcodeItem);
        }
      });

      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Could not open print window');
      }

      printWindow.document.write(`
        <html>
          <head>
            <title>Print Barcodes</title>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `);

      // Let the browser load images and render the page
      setTimeout(() => {
        // Focus on print window before printing
        printWindow.focus();
        printWindow.print();
        // Close window after print dialog is closed
        setTimeout(() => {
          printWindow.close();
          // Reset print settings
          setIsPrintModalOpen(false);
          setProductsToPrint([]);
        }, 1000);
      }, 500);

    } catch (error) {
      console.error('Error printing barcodes:', error);
      alert('Error printing barcodes. Please try again.');
      setIsPrintModalOpen(false);
      setProductsToPrint([]);
    }

    // Reset print settings
    setIsPrintModalOpen(false);
    setProductsToPrint([]);
  };

  const openPrintModal = (products: Product[]) => {
    setProductsToPrint(products);
    setIsPrintModalOpen(true);
  };

  const handleSearch = () => {
    router.visit('/admin/products', {
      method: 'get',
      data: {
        ...filters,
        search: searchTerm || undefined,
      },
      preserveState: true,
      replace: true,
    });
  };

  const handleFilter = (key: string, value: string) => {
    router.visit('/admin/products', {
      method: 'get',
      data: {
        ...filters,
        [key]: value || undefined,
      },
      preserveState: true,
      replace: true,
    });
  };

  const handleBulkAction = () => {
    if (!bulkAction || selectedItems.length === 0) return;

    if (bulkAction === 'print') {
      const selectedProducts = products.data.filter((p: Product) => selectedItems.includes(p.id));
      openPrintModal(selectedProducts);
      return;
    }

    if (bulkAction === 'delete') {
      if (!confirm('Are you sure you want to delete the selected products?')) return;
    }

    router.post('/admin/products/bulk-update', {
      ids: selectedItems,
      action: bulkAction,
    }, {
      onSuccess: () => {
        setSelectedItems([]);
        setBulkAction('');
      },
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(products.data.map((p: Product) => p.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, id]);
    } else {
      setSelectedItems(selectedItems.filter(item => item !== id));
    }
  };

  const handleDeleteProduct = (productId: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      router.delete(`/admin/products/${productId}`);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      inactive: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
      draft: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertTriangle },
    };

    const badge = badges[status as keyof typeof badges];
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3" />
          Out of Stock
        </span>
      );
    } else if (quantity <= 5) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-yellow-100 text-yellow-800">
          <AlertTriangle className="w-3 h-3" />
          Low Stock
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3" />
        In Stock
      </span>
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(price);
  };

  return (
    <AdminLayout>
      <Head title="Products" />

      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600">Manage your product catalog and inventory</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => openPrintModal(products.data)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print All Barcodes
            </button>
            <Link
              href="/admin/products/create"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <select
              value={filters.brand_id || ''}
              onChange={(e) => handleFilter('brand_id', e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Brands</option>
              {brands.map(brand => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>

            <select
              value={filters.category_id || ''}
              onChange={(e) => handleFilter('category_id', e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>

            <select
              value={filters.status || ''}
              onChange={(e) => handleFilter('status', e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {products.meta?.total ? (
                `Showing ${products.meta.from || 1} to ${products.meta.to || products.data.length} of ${products.meta.total} products`
              ) : (
                `${products.data.length} products found`
              )}
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedItems.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-blue-800 font-medium">
                {selectedItems.length} item(s) selected
              </span>
              <div className="flex items-center gap-3">
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Action</option>
                  <option value="activate">Activate</option>
                  <option value="deactivate">Deactivate</option>
                  <option value="feature">Feature</option>
                  <option value="unfeature">Unfeature</option>
                  <option value="delete">Delete</option>
                  <option value="print">Print Barcodes</option>
                </select>
                <button
                  onClick={handleBulkAction}
                  disabled={!bulkAction}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === products.data.length && products.data.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Product</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">SKU</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Barcode</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Brand</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Price</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Stock</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.data.length > 0 ? (
                  products.data.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(product.id)}
                          onChange={(e) => handleSelectItem(product.id, e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={`/storage/${product.images[0].image_path}`}
                                alt={product.images[0].alt_text}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <Package className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 truncate">{product.name}</div>
                            <div className="text-sm text-gray-500">
                              {product.images_count} images • {product.services_count} services
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-gray-900">{product.sku}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-gray-900">{product.barcode}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{product.brand.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{product.category.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {formatPrice(product.sale_price || product.price)}
                          </div>
                          {product.sale_price && (
                            <div className="text-sm text-gray-500 line-through">
                              {formatPrice(product.price)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-900">{product.stock_quantity}</div>
                          {getStockStatus(product.stock_quantity)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {getStatusBadge(product.status)}
                          {product.is_featured && (
                            <div className="flex items-center gap-1 text-xs text-yellow-600 font-medium">
                              <Star className="w-3 h-3 fill-current" />
                              Featured
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                                                  <div className="flex items-center gap-2">
                            <Link
                              href={`/admin/products/${product.id}`}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg"
                              title="View Product"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link
                              href={`/admin/products/${product.id}/edit`}
                              className="p-2 text-gray-400 hover:text-green-600 transition-colors rounded-lg"
                              title="Edit Product"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            {product.barcode_image && (
                                <button
                                onClick={() => openPrintModal([product])}
                                className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg"
                                title="Print Barcode"
                              >
                                <Printer className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <Package className="w-12 h-12 text-gray-400" />
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">No products found</h3>
                          <p className="text-gray-500">Get started by creating your first product.</p>
                        </div>
                        <Link
                          href="/admin/products/create"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Add Product
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {products.meta?.last_page && products.meta.last_page > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {products.meta?.total ? (
                    `Showing ${products.meta.from || 1} to ${products.meta.to || products.data.length} of ${products.meta.total} results`
                  ) : (
                    `${products.data.length} results`
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {products.links && products.links.map((link, index) => {
                    if (!link.url) {
                      return (
                        <span
                          key={index}
                          className="px-3 py-2 text-sm text-gray-400 cursor-not-allowed"
                          dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                      );
                    }

                    return (
                      <Link
                        key={index}
                        href={link.url}
                        className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                          link.active
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-200'
                        }`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Print Settings Modal Portal */}
        {isPrintModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center"
               style={{
                 position: 'fixed',
                 top: 0,
                 left: 0,
                 zIndex: 9999,
                 width: '100vw',
                 height: '100vh'
               }}>
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative"
                 style={{ zIndex: 10000 }}>
              <h3 className="text-lg font-semibold mb-4">Print Barcode Settings</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Label Size (mm)
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500">Width</label>
                      <input
                        type="number"
                        value={printSettings.width}
                        onChange={(e) => setPrintSettings({
                          ...printSettings,
                          width: Number(e.target.value)
                        })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">Height</label>
                      <input
                        type="number"
                        value={printSettings.height}
                        onChange={(e) => setPrintSettings({
                          ...printSettings,
                          height: Number(e.target.value)
                        })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Font Size (pt)
                  </label>
                  <input
                    type="number"
                    value={printSettings.fontSize}
                    onChange={(e) => setPrintSettings({
                      ...printSettings,
                      fontSize: Number(e.target.value)
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Copies per barcode
                  </label>
                  <input
                    type="number"
                    value={printSettings.copies}
                    onChange={(e) => setPrintSettings({
                      ...printSettings,
                      copies: Number(e.target.value)
                    })}
                    min="1"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="showName"
                      checked={printSettings.showName}
                      onChange={(e) => setPrintSettings({
                        ...printSettings,
                        showName: e.target.checked
                      })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="showName" className="ml-2 block text-sm text-gray-700">
                      Show product name
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="showPrice"
                      checked={printSettings.showPrice}
                      onChange={(e) => setPrintSettings({
                        ...printSettings,
                        showPrice: e.target.checked
                      })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="showPrice" className="ml-2 block text-sm text-gray-700">
                      Show price
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={() => printBarcodes(productsToPrint)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Print {productsToPrint.length} barcode(s)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
