<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactInquiry;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ContactInquiryController extends Controller
{
    public function index(Request $request): Response
    {
        $query = ContactInquiry::query();

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
                  ->orWhere('subject', 'like', "%{$request->search}%")
                  ->orWhere('message', 'like', "%{$request->search}%");
            });
        }

        if ($request->status) {
            $query->byStatus($request->status);
        }

        $inquiries = $query->recent()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/ContactInquiries/Index', [
            'inquiries' => $inquiries,
            'filters' => $request->only('search', 'status'),
            'inquiry_statuses' => ['new', 'in_progress', 'resolved', 'closed'],
        ]);
    }

    public function show(ContactInquiry $contactInquiry): Response
    {
        return Inertia::render('Admin/ContactInquiries/Show', [
            'inquiry' => $contactInquiry,
        ]);
    }

    public function updateStatus(Request $request, ContactInquiry $contactInquiry): RedirectResponse
    {
        $request->validate([
            'status' => 'required|in:new,in_progress,resolved,closed',
            'admin_notes' => 'nullable|string',
        ]);

        $contactInquiry->update([
            'status' => $request->status,
            'admin_notes' => $request->admin_notes,
        ]);

        return redirect()->back()
            ->with('success', 'Inquiry status updated successfully.');
    }

    public function destroy(ContactInquiry $contactInquiry): RedirectResponse
    {
        $contactInquiry->delete();

        return redirect()->route('admin.contact-inquiries.index')
            ->with('success', 'Inquiry deleted successfully.');
    }

    public function bulkUpdate(Request $request): RedirectResponse
    {
        $request->validate([
            'ids' => 'required|array',
            'action' => 'required|in:mark_progress,mark_resolved,mark_closed,delete',
        ]);

        $inquiries = ContactInquiry::whereIn('id', $request->ids);

        switch ($request->action) {
            case 'mark_progress':
                $inquiries->update(['status' => 'in_progress']);
                $message = 'Inquiries marked as in progress.';
                break;
            case 'mark_resolved':
                $inquiries->update(['status' => 'resolved']);
                $message = 'Inquiries marked as resolved.';
                break;
            case 'mark_closed':
                $inquiries->update(['status' => 'closed']);
                $message = 'Inquiries marked as closed.';
                break;
            case 'delete':
                $inquiries->delete();
                $message = 'Inquiries deleted successfully.';
                break;
        }

        return redirect()->back()->with('success', $message);
    }
}
