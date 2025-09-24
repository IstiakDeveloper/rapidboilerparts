<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    public function index(Request $request): Response
    {
        $group = $request->group ?: 'general';

        $settings = Setting::byGroup($group)
            ->orderBy('key')
            ->paginate(20)
            ->withQueryString();

        $groups = Setting::distinct()
            ->pluck('group')
            ->sort();

        return Inertia::render('Admin/Settings/Index', [
            'settings' => $settings,
            'groups' => $groups,
            'current_group' => $group,
        ]);
    }

    public function create(): Response
    {
        $groups = Setting::distinct()
            ->pluck('group')
            ->sort();

        return Inertia::render('Admin/Settings/Create', [
            'groups' => $groups,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'key' => 'required|string|max:255|unique:settings',
            'value' => 'required|string',
            'group' => 'required|string|max:255',
        ]);

        Setting::create($request->all());

        return redirect()->route('admin.settings.index', ['group' => $request->group])
            ->with('success', 'Setting created successfully.');
    }

    public function edit(Setting $setting): Response
    {
        $groups = Setting::distinct()
            ->pluck('group')
            ->sort();

        return Inertia::render('Admin/Settings/Edit', [
            'setting' => $setting,
            'groups' => $groups,
        ]);
    }

    public function update(Request $request, Setting $setting): RedirectResponse
    {
        $request->validate([
            'value' => 'required|string',
            'group' => 'required|string|max:255',
        ]);

        $setting->update($request->only(['value', 'group']));

        return redirect()->route('admin.settings.index', ['group' => $request->group])
            ->with('success', 'Setting updated successfully.');
    }

    public function destroy(Setting $setting): RedirectResponse
    {
        $group = $setting->group;
        $setting->delete();

        return redirect()->route('admin.settings.index', ['group' => $group])
            ->with('success', 'Setting deleted successfully.');
    }

    public function bulkUpdate(Request $request): RedirectResponse
    {
        $request->validate([
            'settings' => 'required|array',
        ]);

        foreach ($request->settings as $key => $value) {
            Setting::where('key', $key)->update(['value' => $value]);
        }

        return redirect()->back()
            ->with('success', 'Settings updated successfully.');
    }
}
