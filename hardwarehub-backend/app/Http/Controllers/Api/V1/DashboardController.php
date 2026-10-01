<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    /**
     * Mobile Dashboard Summary: High-level metrics for mobile screens.
     */
    public function summary(): JsonResponse
    {
        $products = Product::all();
        $totalProducts = $products->count();
        $activeProducts = $products->where('status', 'active')->count();
        $inactiveProducts = $products->where('status', 'inactive')->count();

        $outOfStock = $products->filter(fn ($p) => $p->quantity <= 0);
        $lowStock = $products->filter(function ($p) {
            $threshold = $p->low_stock_threshold ?? 10;
            return $p->quantity > 0 && $p->quantity <= $threshold;
        });
        $healthyStock = $products->filter(function ($p) {
            $threshold = $p->low_stock_threshold ?? 10;
            return $p->quantity > $threshold;
        });

        $totalInventoryValue = $products->sum(function ($p) {
            return (float) $p->price * (int) $p->quantity;
        });

        return response()->json([
            'status' => 'success',
            'data' => [
                'total_products' => $totalProducts,
                'active_products' => $activeProducts,
                'inactive_products' => $inactiveProducts,
                'healthy_stock_count' => $healthyStock->count(),
                'low_stock_count' => $lowStock->count(),
                'out_of_stock_count' => $outOfStock->count(),
                'healthy_percentage' => $totalProducts > 0 ? round(($healthyStock->count() / $totalProducts) * 100, 1) : 0,
                'low_stock_percentage' => $totalProducts > 0 ? round(($lowStock->count() / $totalProducts) * 100, 1) : 0,
                'out_of_stock_percentage' => $totalProducts > 0 ? round(($outOfStock->count() / $totalProducts) * 100, 1) : 0,
                'total_inventory_value' => (float) round($totalInventoryValue, 2),
                'total_inventory_value_formatted' => '$'.number_format($totalInventoryValue, 2),
            ],
        ]);
    }
}
