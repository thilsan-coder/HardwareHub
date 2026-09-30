<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class RecycleBinWebController extends Controller
{
    /**
     * Display a listing of soft-deleted products.
     */
    public function index(Request $request)
    {
        $query = Product::onlyTrashed()->orderBy('deleted_at', 'desc');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        $trashedProducts = $query->get();

        return response()->json([
            'products' => $trashedProducts,
            'count' => $trashedProducts->count(),
        ]);
    }

    /**
     * Restore the specified soft-deleted product.
     */
    public function restore($id)
    {
        $product = Product::onlyTrashed()->findOrFail($id);
        $product->restore();

        return response()->json([
            'message' => "Product '{$product->name}' restored successfully",
            'product' => $product,
        ]);
    }

    /**
     * Permanently remove the specified product from database.
     */
    public function forceDelete($id)
    {
        $product = Product::onlyTrashed()->findOrFail($id);
        $productName = $product->name;
        $product->forceDelete();

        return response()->json([
            'message' => "Product '{$productName}' permanently deleted",
            'id' => $id,
        ]);
    }
}
