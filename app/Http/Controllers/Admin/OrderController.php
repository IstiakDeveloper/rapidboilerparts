<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Order::with('user')
            ->withCount('items');

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('order_number', 'like', "%{$request->search}%")
                    ->orWhereHas('user', function ($userQuery) use ($request) {
                        $userQuery->where('first_name', 'like', "%{$request->search}%")
                            ->orWhere('last_name', 'like', "%{$request->search}%")
                            ->orWhere('email', 'like', "%{$request->search}%");
                    });
            });
        }

        if ($request->status) {
            $query->byStatus($request->status);
        }

        if ($request->payment_status) {
            $query->byPaymentStatus($request->payment_status);
        }

        if ($request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $orders = $query->recent()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Orders/Index', [
            'orders' => $orders,
            'filters' => $request->only('search', 'status', 'payment_status', 'date_from', 'date_to'),
            'order_statuses' => ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
            'payment_statuses' => ['pending', 'paid', 'failed', 'refunded'],
        ]);
    }

    public function show(Order $order): Response
    {
        $order->load(['user', 'items.product']);

        return Inertia::render('Admin/Orders/Show', [
            'order' => $order,
        ]);
    }

    public function updateStatus(Request $request, Order $order): RedirectResponse
    {
        $request->validate([
            'status' => 'required|in:pending,processing,shipped,delivered,cancelled,refunded',
            'notes' => 'nullable|string',
        ]);

        $order->update([
            'status' => $request->status,
            'notes' => $request->notes,
            'shipped_at' => $request->status === 'shipped' ? now() : $order->shipped_at,
            'delivered_at' => $request->status === 'delivered' ? now() : $order->delivered_at,
        ]);

        return redirect()->back()
            ->with('success', 'Order status updated successfully.');
    }

    public function updatePaymentStatus(Request $request, Order $order): RedirectResponse
    {
        $request->validate([
            'payment_status' => 'required|in:pending,paid,failed,refunded',
            'payment_transaction_id' => 'nullable|string',
        ]);

        $order->update([
            'payment_status' => $request->payment_status,
            'payment_transaction_id' => $request->payment_transaction_id,
        ]);

        return redirect()->back()
            ->with('success', 'Payment status updated successfully.');
    }

    public function destroy(Order $order): RedirectResponse
    {
        if ($order->payment_status === 'paid') {
            return redirect()->back()
                ->with('error', 'Cannot delete paid orders.');
        }

        $order->delete();

        return redirect()->route('admin.orders.index')
            ->with('success', 'Order deleted successfully.');
    }
}
