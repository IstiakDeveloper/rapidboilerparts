<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if user is authenticated
        if (!auth()->check()) {
            return redirect()->route('login');
        }

        // Check if user is admin or manager
        $user = auth()->user();
        if (!in_array($user->user_type, ['admin', 'manager'])) {
            abort(403, 'Access denied. Admin privileges required.');
        }

        // Check if user is active
        if (!$user->is_active) {
            abort(403, 'Account is inactive. Please contact administrator.');
        }

        return $next($request);
    }
}
