<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductReview;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ProductReviewController extends Controller
{
    public function index(Request $request): Response
    {
        $query = ProductReview::with(['product', 'user']);

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%")
                    ->orWhere('comment', 'like', "%{$request->search}%")
                    ->orWhereHas('product', function ($productQuery) use ($request) {
                        $productQuery->where('name', 'like', "%{$request->search}%");
                    })
                    ->orWhereHas('user', function ($userQuery) use ($request) {
                        $userQuery->where('first_name', 'like', "%{$request->search}%")
                            ->orWhere('last_name', 'like', "%{$request->search}%");
                    });
            });
        }

        if ($request->rating) {
            $query->byRating($request->rating);
        }

        if ($request->is_approved !== null) {
            $query->where('is_approved', $request->is_approved);
        }

        $reviews = $query->orderBy('created_at', 'desc')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/ProductReviews/Index', [
            'reviews' => $reviews,
            'filters' => $request->only('search', 'rating', 'is_approved'),
        ]);
    }

    public function show(ProductReview $productReview): Response
    {
        $productReview->load(['product', 'user']);

        return Inertia::render('Admin/ProductReviews/Show', [
            'review' => $productReview,
        ]);
    }

    public function approve(ProductReview $productReview): RedirectResponse
    {
        $productReview->update(['is_approved' => true]);

        return redirect()->back()
            ->with('success', 'Review approved successfully.');
    }

    public function reject(ProductReview $productReview): RedirectResponse
    {
        $productReview->update(['is_approved' => false]);

        return redirect()->back()
            ->with('success', 'Review rejected successfully.');
    }

    public function destroy(ProductReview $productReview): RedirectResponse
    {
        $productReview->delete();

        return redirect()->route('admin.product-reviews.index')
            ->with('success', 'Review deleted successfully.');
    }

    public function bulkUpdate(Request $request): RedirectResponse
    {
        $request->validate([
            'ids' => 'required|array',
            'action' => 'required|in:approve,reject,delete',
        ]);

        $reviews = ProductReview::whereIn('id', $request->ids);

        switch ($request->action) {
            case 'approve':
                $reviews->update(['is_approved' => true]);
                $message = 'Reviews approved successfully.';
                break;
            case 'reject':
                $reviews->update(['is_approved' => false]);
                $message = 'Reviews rejected successfully.';
                break;
            case 'delete':
                $reviews->delete();
                $message = 'Reviews deleted successfully.';
                break;
        }

        return redirect()->back()->with('success', $message);
    }
}
