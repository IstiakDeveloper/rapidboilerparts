<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{Product, Order, User, ContactInquiry};
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $stats = [
            'total_products' => Product::count(),
            'active_products' => Product::active()->count(),
            'total_orders' => Order::count(),
            'pending_orders' => Order::where('status', 'pending')->count(),
            'total_customers' => User::customers()->count(),
            'new_inquiries' => ContactInquiry::new()->count(),
            'monthly_revenue' => Order::where('payment_status', 'paid')
                ->whereMonth('created_at', now()->month)
                ->sum('total_amount'),
            'low_stock_products' => Product::whereRaw('stock_quantity <= low_stock_threshold')->count(),
        ];

        $recent_orders = Order::with(['user', 'items'])
            ->recent()
            ->limit(10)
            ->get();

        $recent_inquiries = ContactInquiry::recent()
            ->limit(5)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'recent_orders' => $recent_orders,
            'recent_inquiries' => $recent_inquiries,
        ]);
    }
}
