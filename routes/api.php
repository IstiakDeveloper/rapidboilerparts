<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Admin\ServiceTypeController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Public Service API Routes (for checkout)
Route::prefix('services')->group(function () {
    Route::get('/product/{product}', [ServiceController::class, 'getProductServices']);
    Route::get('/products/{product}/services', [ServiceController::class, 'getProductServices']);
    Route::post('/check-availability', [ServiceController::class, 'checkAvailability']);
    Route::get('/available-slots', [ServiceController::class, 'getAvailableSlots']);
    Route::post('/available-slots', [ServiceController::class, 'getAvailableSlots']);
    Route::get('/providers/{provider}', [ServiceController::class, 'getProviderDetails']);
    Route::post('/calculate-cost', [ServiceController::class, 'calculateServiceCost']);
});
