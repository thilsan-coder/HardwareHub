<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        $totalProducts = Product::count();
        $activeProducts = Product::where('status', 'active')->count();
        $inactiveProducts = Product::where('status', 'inactive')->count();

        return response()->json([
            'total_products' => $totalProducts,
            'active_products' => $activeProducts,
            'inactive_products' => $inactiveProducts,
        ]);
    }
}
