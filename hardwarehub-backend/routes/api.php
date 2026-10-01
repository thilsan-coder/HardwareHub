<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\ProductController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Mobile REST API Routes (Version 1)
|--------------------------------------------------------------------------
|
| Secured by Laravel Sanctum Bearer Token Authentication.
| Used by Mobile Apps (Flutter, React Native, Android) and Barcode Scanners.
|
*/

Route::prefix('v1')->group(function () {

    // --- Public Authentication Endpoints ---
    Route::post('/auth/login', [AuthController::class, 'login'])->name('api.v1.auth.login');

    // --- Protected Mobile Endpoints (Requires Bearer Token) ---
    Route::middleware('auth:sanctum')->group(function () {

        // Auth Management
        Route::get('/auth/me', [AuthController::class, 'me'])->name('api.v1.auth.me');
        Route::post('/auth/logout', [AuthController::class, 'logout'])->name('api.v1.auth.logout');
        Route::post('/auth/logout-all', [AuthController::class, 'logoutAllDevices'])->name('api.v1.auth.logout_all');

        // Dashboard Metrics
        Route::get('/dashboard/summary', [DashboardController::class, 'summary'])->name('api.v1.dashboard.summary');

        // Products Catalog & Inventory
        Route::get('/products', [ProductController::class, 'index'])->name('api.v1.products.index');
        Route::post('/products', [ProductController::class, 'store'])->name('api.v1.products.store');
        Route::get('/products/scan/{sku}', [ProductController::class, 'scan'])->name('api.v1.products.scan');
        Route::get('/products/{id}', [ProductController::class, 'show'])->name('api.v1.products.show');
        Route::put('/products/{id}', [ProductController::class, 'update'])->name('api.v1.products.update');
        Route::delete('/products/{id}', [ProductController::class, 'destroy'])->name('api.v1.products.destroy');

        // Quick Mobile Stock Adjustment
        Route::post('/products/{id}/adjust-stock', [ProductController::class, 'adjustStock'])->name('api.v1.products.adjust_stock');
    });
});
