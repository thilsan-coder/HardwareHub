<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RecycleBinController extends Controller
{
    /**
     * List all soft-deleted products for mobile app.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::onlyTrashed()->latest('deleted_at');

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        $trashedProducts = $query->get()->map(function ($p) {
            return [
                'id' => $p->id,
                'name' => $p->name,
                'sku' => $p->sku,
                'description' => $p->description,
                'price' => (float) $p->price,
                'quantity' => (int) $p->quantity,
                'category' => $p->category ?? 'General',
                'status' => $p->status,
                'deleted_at' => $p->deleted_at?->format('Y-m-d H:i:s'),
                'deleted_at_human' => $p->deleted_at?->diffForHumans(),
            ];
        });

        return response()->json([
            'status' => 'success',
            'count' => $trashedProducts->count(),
            'products' => $trashedProducts,
        ]);
    }

    /**
     * Restore a soft-deleted product from recycle bin via mobile API.
     */
    public function restore(int $id): JsonResponse
    {
        $product = Product::onlyTrashed()->find($id);

        if (! $product) {
            return response()->json([
                'status' => 'error',
                'message' => 'Archived product not found in Recycle Bin.',
            ], 404);
        }

        $product->restore();

        return response()->json([
            'status' => 'success',
            'message' => "Product '{$product->name}' successfully restored to active catalog.",
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'price' => (float) $product->price,
                'quantity' => (int) $product->quantity,
                'category' => $product->category ?? 'General',
                'status' => $product->status,
            ],
        ]);
    }

    /**
     * Permanently purge a product from database via mobile API.
     */
    public function forceDelete(int $id): JsonResponse
    {
        $product = Product::onlyTrashed()->find($id);

        if (! $product) {
            return response()->json([
                'status' => 'error',
                'message' => 'Archived product not found in Recycle Bin.',
            ], 404);
        }

        $productName = $product->name;
        $product->forceDelete();

        return response()->json([
            'status' => 'success',
            'message' => "Product '{$productName}' has been permanently purged.",
            'id' => $id,
        ]);
    }
}
