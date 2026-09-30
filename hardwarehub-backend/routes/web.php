<?php

use App\Http\Controllers\AuthWebController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// Web API endpoints for React Web Admin
Route::middleware(['web'])->group(function () {
    Route::post('/api/web/login', [AuthWebController::class, 'login']);

    Route::middleware(['auth'])->group(function () {
        Route::post('/api/web/logout', [AuthWebController::class, 'logout']);
        Route::get('/api/web/me', [AuthWebController::class, 'user']);
        Route::get('/api/web/dashboard-stats', [DashboardController::class, 'stats']);
        Route::get('/api/web/users', [UserController::class, 'index']);
    });
});

// Single Page Application Fallback Route
Route::get('/{any?}', function () {
    return view('welcome');
})->where('any', '.*');
