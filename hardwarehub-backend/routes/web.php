<?php

use App\Http\Controllers\AuthWebController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProductWebController;
use App\Http\Controllers\RecycleBinWebController;
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
        Route::post('/api/web/users', [UserController::class, 'store']);

        // Product CRUD Routes (Phase 4)
        Route::get('/api/web/products', [ProductWebController::class, 'index']);
        Route::post('/api/web/products', [ProductWebController::class, 'store']);
        Route::get('/api/web/products/{id}', [ProductWebController::class, 'show']);
        Route::put('/api/web/products/{id}', [ProductWebController::class, 'update']);
        Route::delete('/api/web/products/{id}', [ProductWebController::class, 'destroy']);

        // Stock Movements & Audit Log Routes (Phase 7)
        Route::get('/api/web/stock-movements', [\App\Http\Controllers\StockMovementController::class, 'index']);
        Route::post('/api/web/stock-movements', [\App\Http\Controllers\StockMovementController::class, 'store']);
        Route::get('/api/web/stock-movements/{id}', [\App\Http\Controllers\StockMovementController::class, 'show']);
        Route::put('/api/web/stock-movements/{id}', [\App\Http\Controllers\StockMovementController::class, 'update']);
        Route::delete('/api/web/stock-movements/{id}', [\App\Http\Controllers\StockMovementController::class, 'destroy']);

        // Data Export Routes (Phase 7)
        Route::get('/api/web/export/products', [\App\Http\Controllers\ExportController::class, 'exportProductsCsv']);
        Route::get('/api/web/export/low-stock', [\App\Http\Controllers\ExportController::class, 'exportLowStockCsv']);
        Route::get('/api/web/export/stock-movements', [\App\Http\Controllers\ExportController::class, 'exportStockMovementsCsv']);

        // Recycle Bin & Soft Delete Routes (Phase 5 & 7)
        Route::get('/api/web/recycle-bin', [RecycleBinWebController::class, 'index']);
        Route::post('/api/web/recycle-bin/{id}/restore', [RecycleBinWebController::class, 'restore']);
        Route::delete('/api/web/recycle-bin/{id}/force-delete', [RecycleBinWebController::class, 'forceDelete']);
        Route::post('/api/web/recycle-bin/stock-movements/{id}/restore', [RecycleBinWebController::class, 'restoreMovement']);
        Route::delete('/api/web/recycle-bin/stock-movements/{id}/force-delete', [RecycleBinWebController::class, 'forceDeleteMovement']);
    });
});

// Single Page Application Fallback Route
Route::get('/{any?}', function () {
    return view('welcome');
})->where('any', '.*');
