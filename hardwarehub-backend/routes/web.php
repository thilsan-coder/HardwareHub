<?php

use App\Http\Controllers\AuthWebController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProductWebController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// Web API endpoints for React Web Admin
Route::middleware(['web'])->group(function () {
    Route::post('/api/web/login', [AuthWebController::class, 'login'])->name('login');
    Route::get('/api/web/me', [AuthWebController::class, 'user']);

    Route::middleware(['auth:web'])->group(function () {
        Route::post('/api/web/logout', [AuthWebController::class, 'logout']);
        Route::get('/api/web/dashboard-stats', [DashboardController::class, 'stats']);
        Route::get('/api/web/users', [UserController::class, 'index']);

        // Product CRUD Routes (Phase 4)
        Route::get('/api/web/products', [ProductWebController::class, 'index']);
        Route::post('/api/web/products', [ProductWebController::class, 'store']);
        Route::get('/api/web/products/{id}', [ProductWebController::class, 'show']);
        Route::put('/api/web/products/{id}', [ProductWebController::class, 'update']);
        Route::delete('/api/web/products/{id}', [ProductWebController::class, 'destroy']);
    });
});

// Single Page Application Fallback Route
Route::get('/{any?}', function () {
    return view('welcome');
})->where('any', '.*');
