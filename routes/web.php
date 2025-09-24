<?php


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
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Home Route
Route::get('/', [HomeController::class, 'index'])->name('home');

// Product Routes
Route::prefix('products')->name('products.')->group(function () {
    Route::get('/', [ProductController::class, 'index'])->name('index');
    Route::get('/search', [ProductController::class, 'search'])->name('search');
    Route::get('/{product:slug}', [ProductController::class, 'show'])->name('show');
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
    Route::prefix('checkout')->name('checkout.')->group(function () {
        Route::get('/', [CheckoutController::class, 'index'])->name('index');
        Route::post('/process', [CheckoutController::class, 'process'])->name('process');
        Route::get('/success/{order}', [CheckoutController::class, 'success'])->name('success');
        Route::get('/cancel', [CheckoutController::class, 'cancel'])->name('cancel');
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

    // Profile Routes (from Breeze)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
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
    Route::post('categories/bulk-update', [AdminCategoryController::class, 'bulkUpdate'])->name('categories.bulk-update');

    // Brands Management
    Route::resource('brands', AdminBrandController::class);
    Route::post('brands/bulk-update', [AdminBrandController::class, 'bulkUpdate'])->name('brands.bulk-update');

    // Products Management
    Route::resource('products', AdminProductController::class);
    Route::post('products/bulk-update', [AdminProductController::class, 'bulkUpdate'])->name('products.bulk-update');
    Route::post('products/{product}/duplicate', [AdminProductController::class, 'duplicate'])->name('products.duplicate');

    // Product Services Management (for individual products)
    Route::get('products/{product}/services', [AdminProductController::class, 'manageServices'])->name('products.services');
    Route::put('products/{product}/services', [AdminProductController::class, 'updateServices'])->name('products.services.update');

    // Product Services (Global Service Management)
    Route::resource('product-services', ProductServiceController::class);
    Route::post('product-services/assign-to-product', [ProductServiceController::class, 'assignToProduct'])->name('product-services.assign');
    Route::delete('product-services/remove-from-product', [ProductServiceController::class, 'removeFromProduct'])->name('product-services.remove');
    Route::post('product-services/bulk-update', [ProductServiceController::class, 'bulkUpdate'])->name('product-services.bulk-update');

    // Product Attributes Management
    Route::resource('product-attributes', ProductAttributeController::class);
    Route::post('product-attributes/bulk-update', [ProductAttributeController::class, 'bulkUpdate'])->name('product-attributes.bulk-update');

    // Compatible Models Management
    Route::resource('compatible-models', CompatibleModelController::class);
    Route::post('compatible-models/bulk-update', [CompatibleModelController::class, 'bulkUpdate'])->name('compatible-models.bulk-update');

    // Orders Management
    Route::resource('orders', AdminOrderController::class)->except(['create', 'store', 'edit', 'update']);
    Route::patch('orders/{order}/status', [AdminOrderController::class, 'updateStatus'])->name('orders.update-status');
    Route::patch('orders/{order}/payment-status', [AdminOrderController::class, 'updatePaymentStatus'])->name('orders.update-payment-status');
    Route::post('orders/bulk-update', [AdminOrderController::class, 'bulkUpdate'])->name('orders.bulk-update');

    // Order Export/Reports
    Route::get('orders/export/csv', [AdminOrderController::class, 'exportCsv'])->name('orders.export.csv');
    Route::get('orders/export/excel', [AdminOrderController::class, 'exportExcel'])->name('orders.export.excel');

    // Users Management
    Route::resource('users', AdminUserController::class);
    Route::post('users/bulk-update', [AdminUserController::class, 'bulkUpdate'])->name('users.bulk-update');
    Route::patch('users/{user}/toggle-status', [AdminUserController::class, 'toggleStatus'])->name('users.toggle-status');

    // Product Reviews Management
    Route::resource('product-reviews', ProductReviewController::class)->except(['create', 'store', 'edit', 'update']);
    Route::patch('product-reviews/{productReview}/approve', [ProductReviewController::class, 'approve'])->name('product-reviews.approve');
    Route::patch('product-reviews/{productReview}/reject', [ProductReviewController::class, 'reject'])->name('product-reviews.reject');
    Route::post('product-reviews/bulk-update', [ProductReviewController::class, 'bulkUpdate'])->name('product-reviews.bulk-update');

    // Coupons Management
    Route::resource('coupons', CouponController::class);
    Route::post('coupons/bulk-update', [CouponController::class, 'bulkUpdate'])->name('coupons.bulk-update');
    Route::patch('coupons/{coupon}/toggle-status', [CouponController::class, 'toggleStatus'])->name('coupons.toggle-status');

    // Contact Inquiries Management
    Route::resource('contact-inquiries', ContactInquiryController::class)->except(['create', 'store', 'edit', 'update']);
    Route::patch('contact-inquiries/{contactInquiry}/status', [ContactInquiryController::class, 'updateStatus'])->name('contact-inquiries.update-status');
    Route::post('contact-inquiries/bulk-update', [ContactInquiryController::class, 'bulkUpdate'])->name('contact-inquiries.bulk-update');

    // Settings Management
    Route::resource('settings', SettingController::class)->except(['show']);
    Route::post('settings/bulk-update', [SettingController::class, 'bulkUpdate'])->name('settings.bulk-update');
    Route::get('settings/group/{group}', [SettingController::class, 'byGroup'])->name('settings.by-group');

    // Reports & Analytics
    Route::prefix('reports')->name('reports.')->group(function () {
        Route::get('sales', [DashboardController::class, 'salesReport'])->name('sales');
        Route::get('products', [DashboardController::class, 'productsReport'])->name('products');
        Route::get('customers', [DashboardController::class, 'customersReport'])->name('customers');
        Route::get('inventory', [DashboardController::class, 'inventoryReport'])->name('inventory');
        Route::get('reviews', [DashboardController::class, 'reviewsReport'])->name('reviews');
    });

    // System Management
    Route::prefix('system')->name('system.')->group(function () {
        Route::get('info', [SettingController::class, 'systemInfo'])->name('info');
        Route::get('cache/clear', [SettingController::class, 'clearCache'])->name('cache.clear');
        Route::get('logs', [SettingController::class, 'viewLogs'])->name('logs');
        Route::post('backup', [SettingController::class, 'createBackup'])->name('backup');
    });

    // File Management
    Route::prefix('files')->name('files.')->group(function () {
        Route::post('upload', [SettingController::class, 'uploadFile'])->name('upload');
        Route::delete('delete/{file}', [SettingController::class, 'deleteFile'])->name('delete');
        Route::get('browse', [SettingController::class, 'browseFiles'])->name('browse');
    });

    // Quick Actions
    Route::prefix('quick')->name('quick.')->group(function () {
        Route::post('product/toggle-featured/{product}', [AdminProductController::class, 'toggleFeatured'])->name('product.toggle-featured');
        Route::post('product/toggle-status/{product}', [AdminProductController::class, 'toggleStatus'])->name('product.toggle-status');
        Route::post('category/toggle-status/{category}', [AdminCategoryController::class, 'toggleStatus'])->name('category.toggle-status');
        Route::post('brand/toggle-status/{brand}', [AdminBrandController::class, 'toggleStatus'])->name('brand.toggle-status');
        Route::post('service/toggle-status/{productService}', [ProductServiceController::class, 'toggleStatus'])->name('service.toggle-status');
    });

    // AJAX/API Routes for Admin
    Route::prefix('api')->name('api.')->group(function () {
        // Search suggestions
        Route::get('products/search', [AdminProductController::class, 'searchProducts'])->name('products.search');
        Route::get('users/search', [AdminUserController::class, 'searchUsers'])->name('users.search');
        Route::get('categories/search', [AdminCategoryController::class, 'searchCategories'])->name('categories.search');
        Route::get('brands/search', [AdminBrandController::class, 'searchBrands'])->name('brands.search');

        // Get related data
        Route::get('products/{product}/services', [AdminProductController::class, 'getProductServices'])->name('products.get-services');
        Route::get('categories/tree', [AdminCategoryController::class, 'getCategoryTree'])->name('categories.tree');
        Route::get('compatible-models/by-brand/{brand}', [CompatibleModelController::class, 'getByBrand'])->name('compatible-models.by-brand');

        // Statistics
        Route::get('stats/overview', [DashboardController::class, 'getOverviewStats'])->name('stats.overview');
        Route::get('stats/sales', [DashboardController::class, 'getSalesStats'])->name('stats.sales');
        Route::get('stats/products', [DashboardController::class, 'getProductStats'])->name('stats.products');

        // Validation
        Route::post('validate/sku', [AdminProductController::class, 'validateSku'])->name('validate.sku');
        Route::post('validate/slug', [AdminCategoryController::class, 'validateSlug'])->name('validate.slug');
        Route::post('validate/coupon-code', [CouponController::class, 'validateCouponCode'])->name('validate.coupon-code');

        // Inventory management
        Route::patch('products/{product}/stock', [AdminProductController::class, 'updateStock'])->name('products.update-stock');
        Route::get('inventory/low-stock', [AdminProductController::class, 'getLowStockProducts'])->name('inventory.low-stock');
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
    });
});

// Customer routes that might need admin access for testing
Route::prefix('admin/preview')->name('admin.preview.')->middleware(['auth', 'admin'])->group(function () {
    Route::get('product/{product}', [AdminProductController::class, 'previewProduct'])->name('product');
    Route::get('category/{category}', [AdminCategoryController::class, 'previewCategory'])->name('category');
    Route::get('brand/{brand}', [AdminBrandController::class, 'previewBrand'])->name('brand');
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

require __DIR__ . '/auth.php';
