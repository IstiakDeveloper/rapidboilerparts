<?php


use App\Http\Controllers\Frontend\OrderController;
use App\Http\Controllers\Frontend\ReviewController;
use App\Http\Controllers\Frontend\UserProfileController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Frontend\HomeController;
use App\Http\Controllers\Frontend\ProductController;
use App\Http\Controllers\Frontend\CategoryController;
use App\Http\Controllers\Frontend\BrandController;
use App\Http\Controllers\Frontend\CartController;
use App\Http\Controllers\Frontend\CheckoutController;
use App\Http\Controllers\Frontend\AccountController;
use App\Http\Controllers\Frontend\WishlistController;
use App\Http\Controllers\Frontend\ContactController;

// Admin Controllers
use App\Http\Controllers\Admin\{
    DashboardController,
    CategoryController as AdminCategoryController,
    BrandController as AdminBrandController,
    ProductController as AdminProductController,
    OrderController as AdminOrderController,
    UserController as AdminUserController,
    ProductAttributeController,
    CompatibleModelController,
    CouponController,
    ProductReviewController,
    ContactInquiryController,
    SettingController,
    ProductServiceController
};

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

Route::get('/storage-link', function () {
    try {
        Artisan::call('storage:link');
        return "The [public/storage] directory has been linked.";
    } catch (\Exception $e) {
        return "There was an error: " . $e->getMessage();
    }
})->name('storage.link');


Route::get('/migrate', function () {
    Artisan::call('migrate');
    return 'Migration completed successfully!';
});
// Home Route
Route::get('/', [HomeController::class, 'index'])->name('home');

// Product Routes
Route::prefix('products')->name('products.')->group(function () {
    Route::get('/', [ProductController::class, 'index'])->name('index');
    Route::get('/search', [ProductController::class, 'search'])->name('search');
    Route::get('/{product:slug}', [ProductController::class, 'show'])->name('show');
});


Route::prefix('cart')->name('cart.')->group(function () {
    Route::get('/', [CartController::class, 'index'])->name('index');
    Route::post('/add', [CartController::class, 'add'])->name('add');
    Route::patch('/{cart}', [CartController::class, 'update'])->name('update');
    Route::patch('/{cart}/services', [CartController::class, 'updateServices'])->name('updateServices');
    Route::delete('/{cart}', [CartController::class, 'remove'])->name('remove');
    Route::delete('/', [CartController::class, 'clear'])->name('clear');
    Route::get('/count', [CartController::class, 'count'])->name('count');
});

// Wishlist Routes
Route::middleware('auth')->prefix('wishlist')->name('wishlist.')->group(function () {
    Route::get('/', [WishlistController::class, 'index'])->name('index');
    Route::post('/add', [WishlistController::class, 'add'])->name('add');
    Route::delete('/{wishlist}', [WishlistController::class, 'remove'])->name('remove');
    Route::post('/toggle', [WishlistController::class, 'toggle'])->name('toggle');
    Route::get('/check', [WishlistController::class, 'check'])->name('check');
    Route::post('/{wishlist}/move-to-cart', [WishlistController::class, 'moveToCart'])->name('moveToCart');
    Route::delete('/', [WishlistController::class, 'clear'])->name('clear');
});

// Checkout Routes
Route::middleware('auth')->prefix('checkout')->name('checkout.')->group(function () {
    Route::get('/', [CheckoutController::class, 'index'])->name('index');
    Route::post('/apply-coupon', [CheckoutController::class, 'applyCoupon'])->name('applyCoupon');
    Route::delete('/remove-coupon', [CheckoutController::class, 'removeCoupon'])->name('removeCoupon');
    Route::post('/process', [CheckoutController::class, 'processCheckout'])->name('process');
    Route::get('/payment/{order}', [CheckoutController::class, 'payment'])->name('payment');
});

// Order Routes
Route::middleware('auth')->prefix('orders')->name('orders.')->group(function () {
    Route::get('/', [OrderController::class, 'index'])->name('index');
    Route::get('/{order}', [OrderController::class, 'show'])->name('show');
    Route::post('/{order}/cancel', [OrderController::class, 'cancel'])->name('cancel');
    Route::get('/{order}/invoice', [OrderController::class, 'invoice'])->name('invoice');
});

// Review Routes
Route::middleware('auth')->prefix('reviews')->name('reviews.')->group(function () {
    Route::post('/', [ReviewController::class, 'store'])->name('store');
    Route::put('/{review}', [ReviewController::class, 'update'])->name('update');
    Route::delete('/{review}', [ReviewController::class, 'destroy'])->name('destroy');
});

// User Profile Routes
Route::middleware('auth')->prefix('profile')->name('profile.')->group(function () {
    Route::get('/', [UserProfileController::class, 'index'])->name('index');
    Route::patch('/update', [UserProfileController::class, 'updateProfile'])->name('update');
    Route::patch('/update-email', [UserProfileController::class, 'updateEmail'])->name('updateEmail');
    Route::patch('/update-password', [UserProfileController::class, 'updatePassword'])->name('updatePassword');

    // Addresses
    Route::get('/addresses', [UserProfileController::class, 'addresses'])->name('addresses');
    Route::post('/addresses', [UserProfileController::class, 'storeAddress'])->name('addresses.store');
    Route::put('/addresses/{address}', [UserProfileController::class, 'updateAddress'])->name('addresses.update');
    Route::delete('/addresses/{address}', [UserProfileController::class, 'deleteAddress'])->name('addresses.delete');
    Route::post('/addresses/{address}/set-default', [UserProfileController::class, 'setDefaultAddress'])->name('addresses.setDefault');
});

// Category Routes
Route::prefix('categories')->name('categories.')->group(function () {
    Route::get('/', [CategoryController::class, 'index'])->name('index');
    Route::get('/{category:slug}', [CategoryController::class, 'show'])->name('show');
});

// Brand Routes
Route::prefix('brands')->name('brands.')->group(function () {
    Route::get('/', [BrandController::class, 'index'])->name('index');
    Route::get('/{brand:slug}', [BrandController::class, 'show'])->name('show');
});

// Cart Routes (can work for both guest and authenticated users)
Route::prefix('cart')->name('cart.')->group(function () {
    Route::get('/', [CartController::class, 'index'])->name('index');
    Route::post('/add', [CartController::class, 'add'])->name('add');
    Route::patch('/update/{id}', [CartController::class, 'update'])->name('update');
    Route::delete('/remove/{id}', [CartController::class, 'remove'])->name('remove');
    Route::delete('/clear', [CartController::class, 'clear'])->name('clear');
    Route::post('/apply-coupon', [CartController::class, 'applyCoupon'])->name('apply-coupon');
    Route::delete('/remove-coupon', [CartController::class, 'removeCoupon'])->name('remove-coupon');
});

// Contact Routes
Route::prefix('contact')->name('contact.')->group(function () {
    Route::get('/', [ContactController::class, 'index'])->name('index');
    Route::post('/', [ContactController::class, 'store'])->name('store');
});

// Static Pages
Route::get('/about', function () {
    return Inertia::render('About');
})->name('about');

Route::get('/shipping-info', function () {
    return Inertia::render('ShippingInfo');
})->name('shipping-info');

Route::get('/returns-policy', function () {
    return Inertia::render('ReturnsPolicy');
})->name('returns-policy');

Route::get('/privacy-policy', function () {
    return Inertia::render('PrivacyPolicy');
})->name('privacy-policy');

Route::get('/terms-conditions', function () {
    return Inertia::render('TermsConditions');
})->name('terms-conditions');

// Authenticated Routes
Route::middleware('auth')->group(function () {
    // Checkout Routes
    Route::middleware('auth')->group(function () {
        Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout.index');
        Route::post('/checkout/apply-coupon', [CheckoutController::class, 'applyCoupon'])->name('checkout.apply-coupon');
        Route::post('/checkout/remove-coupon', [CheckoutController::class, 'removeCoupon'])->name('checkout.remove-coupon');
        Route::post('/checkout/process', [CheckoutController::class, 'processCheckout'])->name('checkout.process'); // ← এখানে 'processCheckout' হবে
        Route::get('/checkout/payment/{order}', [CheckoutController::class, 'payment'])->name('checkout.payment');
    });

    // Wishlist Routes
    Route::prefix('wishlist')->name('wishlist.')->group(function () {
        Route::get('/', [WishlistController::class, 'index'])->name('index');
        Route::post('/add/{product}', [WishlistController::class, 'add'])->name('add');
        Route::delete('/remove/{product}', [WishlistController::class, 'remove'])->name('remove');
    });

    // Account Routes
    Route::prefix('account')->name('account.')->group(function () {
        Route::get('/', [AccountController::class, 'dashboard'])->name('dashboard');
        Route::get('/orders', [AccountController::class, 'orders'])->name('orders');
        Route::get('/orders/{order}', [AccountController::class, 'orderDetails'])->name('order-details');
        Route::get('/addresses', [AccountController::class, 'addresses'])->name('addresses');
        Route::post('/addresses', [AccountController::class, 'storeAddress'])->name('store-address');
        Route::patch('/addresses/{address}', [AccountController::class, 'updateAddress'])->name('update-address');
        Route::delete('/addresses/{address}', [AccountController::class, 'deleteAddress'])->name('delete-address');
        Route::get('/profile', [AccountController::class, 'profile'])->name('profile');
        Route::patch('/profile', [AccountController::class, 'updateProfile'])->name('update-profile');
    });

});

Route::middleware('web')->group(function () {
    Route::get('api/cart/items', [CartController::class, 'getItems']);
});

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/

// Admin Routes Group
Route::prefix('admin')->name('admin.')->middleware(['auth', 'admin'])->group(function () {

    // Dashboard
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard.index');

    // Categories Management
    Route::resource('categories', AdminCategoryController::class);
    Route::post('categories/bulk-action', [AdminCategoryController::class, 'bulkAction'])->name('categories.bulk-action');
    Route::get('categories/export', [AdminCategoryController::class, 'export'])->name('categories.export');

    // Brands Management
    Route::resource('brands', AdminBrandController::class);
    Route::post('brands/bulk-action', [AdminBrandController::class, 'bulkAction'])->name('brands.bulk-action');
    Route::get('brands/export', [AdminBrandController::class, 'export'])->name('brands.export');

    // Products Management
    Route::resource('products', AdminProductController::class);
    Route::post('products/bulk-action', [AdminProductController::class, 'bulkAction'])->name('products.bulk-action');
    Route::post('products/{product}/duplicate', [AdminProductController::class, 'duplicate'])->name('products.duplicate');
    Route::get('products/export', [AdminProductController::class, 'export'])->name('products.export');

    // Product Images Management
    Route::delete('products/{product}/images/{image}', [AdminProductController::class, 'deleteImage'])->name('products.images.delete');
    Route::patch('products/{product}/images/{image}/primary', [AdminProductController::class, 'setPrimaryImage'])->name('products.images.set-primary');
    Route::post('products/{product}/images/reorder', [AdminProductController::class, 'reorderImages'])->name('products.images.reorder');

    // Product Services Management (for individual products)
    Route::get('products/{product}/services', [AdminProductController::class, 'manageServices'])->name('products.services');
    Route::put('products/{product}/services', [AdminProductController::class, 'updateProductServices'])->name('products.services.update');

    // Product Services (Global Service Management)
    Route::resource('product-services', ProductServiceController::class);
    Route::post('product-services/assign-to-product', [ProductServiceController::class, 'assignToProduct'])->name('product-services.assign');
    Route::delete('product-services/remove-from-product', [ProductServiceController::class, 'removeFromProduct'])->name('product-services.remove');
    Route::post('product-services/bulk-action', [ProductServiceController::class, 'bulkAction'])->name('product-services.bulk-action');

    // Product Attributes Management
    Route::resource('product-attributes', ProductAttributeController::class);
    Route::post('product-attributes/bulk-action', [ProductAttributeController::class, 'bulkAction'])->name('product-attributes.bulk-action');

    // Compatible Models Management
    Route::resource('compatible-models', CompatibleModelController::class);
    Route::post('compatible-models/bulk-action', [CompatibleModelController::class, 'bulkAction'])->name('compatible-models.bulk-action');
    Route::get('compatible-models/import', [CompatibleModelController::class, 'showImportForm'])->name('compatible-models.import.form');
    Route::post('compatible-models/import', [CompatibleModelController::class, 'import'])->name('compatible-models.import');

    // Orders Management
    Route::resource('orders', AdminOrderController::class)->except(['create', 'store']);
    Route::patch('orders/{order}/status', [AdminOrderController::class, 'updateStatus'])->name('orders.update-status');
    Route::patch('orders/{order}/payment-status', [AdminOrderController::class, 'updatePaymentStatus'])->name('orders.update-payment-status');
    Route::post('orders/bulk-action', [AdminOrderController::class, 'bulkAction'])->name('orders.bulk-action');
    Route::post('orders/{order}/send-invoice', [AdminOrderController::class, 'sendInvoice'])->name('orders.send-invoice');
    Route::get('orders/{order}/invoice', [AdminOrderController::class, 'downloadInvoice'])->name('orders.download-invoice');

    // Order Export/Reports
    Route::get('orders/export/csv', [AdminOrderController::class, 'exportCsv'])->name('orders.export.csv');
    Route::get('orders/export/excel', [AdminOrderController::class, 'exportExcel'])->name('orders.export.excel');
    Route::get('orders/export/pdf', [AdminOrderController::class, 'exportPdf'])->name('orders.export.pdf');

    // Users Management
    Route::resource('users', AdminUserController::class);
    Route::post('users/bulk-action', [AdminUserController::class, 'bulkAction'])->name('users.bulk-action');
    Route::patch('users/{user}/toggle-status', [AdminUserController::class, 'toggleStatus'])->name('users.toggle-status');
    Route::get('users/export', [AdminUserController::class, 'export'])->name('users.export');

    // Product Reviews Management
    Route::resource('product-reviews', ProductReviewController::class)->except(['create', 'store', 'edit', 'update']);
    Route::patch('product-reviews/{productReview}/approve', [ProductReviewController::class, 'approve'])->name('product-reviews.approve');
    Route::patch('product-reviews/{productReview}/reject', [ProductReviewController::class, 'reject'])->name('product-reviews.reject');
    Route::post('product-reviews/bulk-action', [ProductReviewController::class, 'bulkAction'])->name('product-reviews.bulk-action');

    // Coupons Management
    Route::resource('coupons', CouponController::class);
    Route::post('coupons/bulk-action', [CouponController::class, 'bulkAction'])->name('coupons.bulk-action');
    Route::patch('coupons/{coupon}/toggle-status', [CouponController::class, 'toggleStatus'])->name('coupons.toggle-status');
    Route::post('coupons/{coupon}/test', [CouponController::class, 'testCoupon'])->name('coupons.test');

    // Contact Inquiries Management
    Route::resource('contact-inquiries', ContactInquiryController::class)->except(['create', 'store', 'edit', 'update']);
    Route::patch('contact-inquiries/{contactInquiry}/status', [ContactInquiryController::class, 'updateStatus'])->name('contact-inquiries.update-status');
    Route::post('contact-inquiries/bulk-action', [ContactInquiryController::class, 'bulkAction'])->name('contact-inquiries.bulk-action');
    Route::post('contact-inquiries/{contactInquiry}/reply', [ContactInquiryController::class, 'sendReply'])->name('contact-inquiries.reply');

    // Settings Management
    Route::resource('settings', SettingController::class)->except(['show']);
    Route::post('settings/bulk-action', [SettingController::class, 'bulkAction'])->name('settings.bulk-action');
    Route::get('settings/group/{group}', [SettingController::class, 'byGroup'])->name('settings.by-group');

    // Reports & Analytics
    Route::prefix('reports')->name('reports.')->group(function () {
        Route::get('/', [DashboardController::class, 'reportsIndex'])->name('index');
        Route::get('sales', [DashboardController::class, 'salesReport'])->name('sales');
        Route::get('products', [DashboardController::class, 'productsReport'])->name('products');
        Route::get('customers', [DashboardController::class, 'customersReport'])->name('customers');
        Route::get('inventory', [DashboardController::class, 'inventoryReport'])->name('inventory');
        Route::get('reviews', [DashboardController::class, 'reviewsReport'])->name('reviews');
        Route::get('revenue', [DashboardController::class, 'revenueReport'])->name('revenue');
        Route::get('top-products', [DashboardController::class, 'topProductsReport'])->name('top-products');
        Route::get('low-stock', [DashboardController::class, 'lowStockReport'])->name('low-stock');
    });

    // System Management
    Route::prefix('system')->name('system.')->group(function () {
        Route::get('info', [SettingController::class, 'systemInfo'])->name('info');
        Route::post('cache/clear', [SettingController::class, 'clearCache'])->name('cache.clear');
        Route::get('logs', [SettingController::class, 'viewLogs'])->name('logs');
        Route::post('backup', [SettingController::class, 'createBackup'])->name('backup');
        Route::get('database/optimize', [SettingController::class, 'optimizeDatabase'])->name('database.optimize');
        Route::post('migrate', [SettingController::class, 'runMigrations'])->name('migrate');
    });

    // File Management
    Route::prefix('files')->name('files.')->group(function () {
        Route::post('upload', [SettingController::class, 'uploadFile'])->name('upload');
        Route::delete('delete/{file}', [SettingController::class, 'deleteFile'])->name('delete');
        Route::get('browse', [SettingController::class, 'browseFiles'])->name('browse');
        Route::post('bulk-delete', [SettingController::class, 'bulkDeleteFiles'])->name('bulk-delete');
        Route::get('cleanup', [SettingController::class, 'cleanupUnusedFiles'])->name('cleanup');
    });

    // Quick Actions
    Route::prefix('quick')->name('quick.')->group(function () {
        Route::post('product/toggle-featured/{product}', [AdminProductController::class, 'toggleFeatured'])->name('product.toggle-featured');
        Route::post('product/toggle-status/{product}', [AdminProductController::class, 'toggleStatus'])->name('product.toggle-status');
        Route::post('category/toggle-status/{category}', [AdminCategoryController::class, 'toggleStatus'])->name('category.toggle-status');
        Route::post('brand/toggle-status/{brand}', [AdminBrandController::class, 'toggleStatus'])->name('brand.toggle-status');
        Route::post('service/toggle-status/{productService}', [ProductServiceController::class, 'toggleStatus'])->name('service.toggle-status');
        Route::post('review/toggle-approval/{productReview}', [ProductReviewController::class, 'toggleApproval'])->name('review.toggle-approval');
        Route::post('user/toggle-status/{user}', [AdminUserController::class, 'toggleStatus'])->name('user.toggle-status');
    });

    // AJAX/API Routes for Admin
    Route::prefix('api')->name('api.')->group(function () {
        // Search suggestions
        Route::get('products/search', [AdminProductController::class, 'searchProducts'])->name('products.search');
        Route::get('users/search', [AdminUserController::class, 'searchUsers'])->name('users.search');
        Route::get('categories/search', [AdminCategoryController::class, 'searchCategories'])->name('categories.search');
        Route::get('brands/search', [AdminBrandController::class, 'searchBrands'])->name('brands.search');
        Route::get('services/search', [ProductServiceController::class, 'searchServices'])->name('services.search');

        // Get related data
        Route::get('products/{product}/services', [AdminProductController::class, 'getProductServices'])->name('products.get-services');
        Route::get('products/{product}/attributes', [AdminProductController::class, 'getProductAttributes'])->name('products.get-attributes');
        Route::get('products/{product}/compatible-models', [AdminProductController::class, 'getCompatibleModels'])->name('products.get-compatible-models');
        Route::get('categories/tree', [AdminCategoryController::class, 'getCategoryTree'])->name('categories.tree');
        Route::get('compatible-models/by-brand/{brand}', [CompatibleModelController::class, 'getByBrand'])->name('compatible-models.by-brand');

        // Statistics
        Route::get('stats/overview', [DashboardController::class, 'getOverviewStats'])->name('stats.overview');
        Route::get('stats/sales', [DashboardController::class, 'getSalesStats'])->name('stats.sales');
        Route::get('stats/products', [DashboardController::class, 'getProductStats'])->name('stats.products');
        Route::get('stats/customers', [DashboardController::class, 'getCustomerStats'])->name('stats.customers');
        Route::get('stats/revenue', [DashboardController::class, 'getRevenueStats'])->name('stats.revenue');

        // Validation
        Route::post('validate/sku', [AdminProductController::class, 'validateSku'])->name('validate.sku');
        Route::post('validate/slug', [AdminCategoryController::class, 'validateSlug'])->name('validate.slug');
        Route::post('validate/coupon-code', [CouponController::class, 'validateCouponCode'])->name('validate.coupon-code');
        Route::post('validate/email', [AdminUserController::class, 'validateEmail'])->name('validate.email');

        // Inventory management
        Route::patch('products/{product}/stock', [AdminProductController::class, 'updateStock'])->name('products.update-stock');
        Route::get('inventory/low-stock', [AdminProductController::class, 'getLowStockProducts'])->name('inventory.low-stock');
        Route::get('inventory/out-of-stock', [AdminProductController::class, 'getOutOfStockProducts'])->name('inventory.out-of-stock');

        // Dashboard widgets
        Route::get('dashboard/recent-orders', [DashboardController::class, 'getRecentOrders'])->name('dashboard.recent-orders');
        Route::get('dashboard/pending-reviews', [DashboardController::class, 'getPendingReviews'])->name('dashboard.pending-reviews');
        Route::get('dashboard/low-stock-alerts', [DashboardController::class, 'getLowStockAlerts'])->name('dashboard.low-stock-alerts');

        // Auto-complete endpoints
        Route::get('autocomplete/products', [AdminProductController::class, 'autocompleteProducts'])->name('autocomplete.products');
        Route::get('autocomplete/users', [AdminUserController::class, 'autocompleteUsers'])->name('autocomplete.users');
        Route::get('autocomplete/categories', [AdminCategoryController::class, 'autocompleteCategories'])->name('autocomplete.categories');
        Route::get('autocomplete/brands', [AdminBrandController::class, 'autocompleteBrands'])->name('autocomplete.brands');
    });

    // Import/Export Routes
    Route::prefix('import-export')->name('import-export.')->group(function () {
        Route::get('/', [ImportExportController::class, 'index'])->name('index');

        // Products
        Route::get('products/export-template', [ImportExportController::class, 'productsExportTemplate'])->name('products.export-template');
        Route::post('products/import', [ImportExportController::class, 'importProducts'])->name('products.import');
        Route::get('products/export', [ImportExportController::class, 'exportProducts'])->name('products.export');

        // Categories
        Route::get('categories/export-template', [ImportExportController::class, 'categoriesExportTemplate'])->name('categories.export-template');
        Route::post('categories/import', [ImportExportController::class, 'importCategories'])->name('categories.import');

        // Brands
        Route::get('brands/export-template', [ImportExportController::class, 'brandsExportTemplate'])->name('brands.export-template');
        Route::post('brands/import', [ImportExportController::class, 'importBrands'])->name('brands.import');

        // Users
        Route::get('users/export-template', [ImportExportController::class, 'usersExportTemplate'])->name('users.export-template');
        Route::post('users/import', [ImportExportController::class, 'importUsers'])->name('users.import');
    });
});

// Additional middleware for specific admin routes
Route::middleware(['auth', 'admin', 'role:super-admin'])->group(function () {
    // Super admin only routes
    Route::prefix('admin/super')->name('admin.super.')->group(function () {
        Route::get('users/admins', [AdminUserController::class, 'adminUsers'])->name('users.admins');
        Route::post('users/{user}/promote', [AdminUserController::class, 'promoteUser'])->name('users.promote');
        Route::post('users/{user}/demote', [AdminUserController::class, 'demoteUser'])->name('users.demote');
        Route::delete('users/{user}/force-delete', [AdminUserController::class, 'forceDelete'])->name('users.force-delete');

        Route::get('system/settings', [SettingController::class, 'systemSettings'])->name('system.settings');
        Route::post('system/maintenance', [SettingController::class, 'toggleMaintenance'])->name('system.maintenance');
        Route::get('system/logs/error', [SettingController::class, 'errorLogs'])->name('system.logs.error');
        Route::post('system/logs/clear', [SettingController::class, 'clearLogs'])->name('system.logs.clear');

        // Database management
        Route::get('database/backup', [SettingController::class, 'databaseBackup'])->name('database.backup');
        Route::post('database/restore', [SettingController::class, 'databaseRestore'])->name('database.restore');
        Route::get('database/cleanup', [SettingController::class, 'databaseCleanup'])->name('database.cleanup');
    });
});

// Customer routes that might need admin access for testing
Route::prefix('admin/preview')->name('admin.preview.')->middleware(['auth', 'admin'])->group(function () {
    Route::get('product/{product}', [AdminProductController::class, 'previewProduct'])->name('product');
    Route::get('category/{category}', [AdminCategoryController::class, 'previewCategory'])->name('category');
    Route::get('brand/{brand}', [AdminBrandController::class, 'previewBrand'])->name('brand');
    Route::get('website', [AdminController::class, 'previewWebsite'])->name('website');
});

// Dashboard Route (from Breeze) - redirect to account for customers
Route::get('/dashboard', function () {
    if (auth()->user()->user_type === 'admin') {
        return redirect()->route('admin.dashboard');
    }
    return redirect()->route('account.dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// Route model bindings (if needed custom resolution)
Route::bind('productService', function ($value) {
    return \App\Models\ProductService::where('id', $value)->orWhere('slug', $value)->firstOrFail();
});

Route::bind('compatibleModel', function ($value) {
    return \App\Models\CompatibleModel::findOrFail($value);
});

Route::bind('productReview', function ($value) {
    return \App\Models\ProductReview::findOrFail($value);
});

Route::bind('contactInquiry', function ($value) {
    return \App\Models\ContactInquiry::findOrFail($value);
});

Route::bind('productAttribute', function ($value) {
    return \App\Models\ProductAttribute::where('id', $value)->orWhere('slug', $value)->firstOrFail();
});

Route::bind('productImage', function ($value) {
    return \App\Models\ProductImage::findOrFail($value);
});

require __DIR__ . '/auth.php';
