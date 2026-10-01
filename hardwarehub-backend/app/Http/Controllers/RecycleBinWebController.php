<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RecycleBinWebController extends Controller
{
    /**
     * Display a listing of soft-deleted products or stock movements.
     */
    public function index(Request $request): JsonResponse
    {
        $search = $request->input('search');
        $tab = $request->input('tab', 'products'); // 'products' or 'stock-movements'

        // Trashed Products Query
        $productQuery = Product::onlyTrashed()->orderBy('deleted_at', 'desc');
        if ($search && $tab === 'products') {
            $productQuery->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
            });
        }
        $trashedProducts = $productQuery->get();

        // Trashed Stock Movements Query
        $movementQuery = StockMovement::onlyTrashed()
            ->with(['product' => fn ($q) => $q->withTrashed(), 'user'])
            ->orderBy('deleted_at', 'desc');

        if ($search && $tab === 'stock-movements') {
            $movementQuery->where(function ($q) use ($search) {
                $q->where('reason', 'like', "%{$search}%")
                  ->orWhereHas('product', function ($pq) use ($search) {
                      $pq->where('name', 'like', "%{$search}%")
                         ->orWhere('sku', 'like', "%{$search}%");
                  });
            });
        }
        $trashedMovements = $movementQuery->get()->map(function ($m) {
            return [
                'id' => $m->id,
                'type' => $m->type,
                'quantity_changed' => (int) $m->quantity_changed,
                'previous_stock' => (int) $m->previous_stock,
                'new_stock' => (int) $m->new_stock,
                'reason' => $m->reason ?: 'Stock movement',
                'deleted_at' => $m->deleted_at?->format('M d, Y h:i A'),
                'created_at' => $m->created_at?->format('M d, Y h:i A'),
                'product' => $m->product ? [
                    'id' => $m->product->id,
                    'name' => $m->product->name,
                    'sku' => $m->product->sku,
                    'category' => $m->product->category ?? 'General',
                ] : null,
                'user' => $m->user ? [
                    'id' => $m->user->id,
                    'name' => $m->user->name,
                ] : [
                    'id' => null,
                    'name' => 'System',
                ],
            ];
        });

        return response()->json([
            'status' => 'success',
            'products' => $trashedProducts,
            'movements' => $trashedMovements,
            'counts' => [
                'products' => Product::onlyTrashed()->count(),
                'movements' => StockMovement::onlyTrashed()->count(),
            ],
        ]);
    }

    /**
     * Restore a soft-deleted product.
     */
    public function restore($id): JsonResponse
    {
        $product = Product::onlyTrashed()->findOrFail($id);
        $product->restore();

        return response()->json([
            'status' => 'success',
            'message' => "Product '{$product->name}' restored successfully.",
            'product' => $product,
        ]);
    }

    /**
     * Permanently force-delete a product.
     */
    public function forceDelete($id): JsonResponse
    {
        $product = Product::onlyTrashed()->findOrFail($id);
        $productName = $product->name;
        $product->forceDelete();

        return response()->json([
            'status' => 'success',
            'message' => "Product '{$productName}' permanently deleted.",
            'id' => $id,
        ]);
    }

    /**
     * Restore a soft-deleted stock movement and re-apply inventory balance.
     */
    public function restoreMovement($id): JsonResponse
    {
        return DB::transaction(function () use ($id) {
            $movement = StockMovement::onlyTrashed()->findOrFail($id);
            $product = Product::lockForUpdate()->find($movement->product_id);

            if ($product) {
                // Re-apply original movement effect
                if ($movement->type === 'in') {
                    $product->quantity += abs($movement->quantity_changed);
                } elseif ($movement->type === 'out' || $movement->type === 'damage') {
                    $product->quantity = max(0, $product->quantity - abs($movement->quantity_changed));
                } elseif ($movement->type === 'adjustment') {
                    $product->quantity = max(0, $movement->new_stock);
                }
                $product->save();
            }

            $movement->restore();

            return response()->json([
                'status' => 'success',
                'message' => "Stock movement LOG-#{$movement->id} restored and stock balance re-applied.",
                'movement' => $movement,
            ]);
        });
    }

    /**
     * Permanently remove a stock movement from database.
     */
    public function forceDeleteMovement($id): JsonResponse
    {
        $movement = StockMovement::onlyTrashed()->findOrFail($id);
        $movementId = $movement->id;
        $movement->forceDelete();

        return response()->json([
            'status' => 'success',
            'message' => "Stock movement LOG-#{$movementId} permanently purged.",
            'id' => $movementId,
        ]);
    }
}
