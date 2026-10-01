<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RecycleBinController extends Controller
{
    /**
     * List all soft-deleted products and stock movements for mobile app.
     */
    public function index(Request $request): JsonResponse
    {
        $search = $request->query('search');

        // 1. Trashed Products Query
        $productQuery = Product::onlyTrashed()->latest('deleted_at');
        if ($search) {
            $productQuery->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
            });
        }

        $trashedProducts = $productQuery->get()->map(function ($p) {
            return [
                'id' => $p->id,
                'name' => $p->name,
                'sku' => $p->sku,
                'description' => $p->description,
                'price' => (float) $p->price,
                'quantity' => (int) $p->quantity,
                'low_stock_threshold' => (int) ($p->low_stock_threshold ?? 10),
                'category' => $p->category ?? 'General',
                'status' => $p->status ?? 'active',
                'deleted_at' => $p->deleted_at?->format('Y-m-d H:i:s'),
                'deleted_at_human' => $p->deleted_at?->diffForHumans(),
            ];
        });

        // 2. Trashed Movements Query
        $movementQuery = StockMovement::onlyTrashed()
            ->with(['product' => fn ($q) => $q->withTrashed(), 'user'])
            ->latest('deleted_at');

        if ($search) {
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
                'deleted_at' => $m->deleted_at?->format('Y-m-d H:i:s'),
                'created_at' => $m->created_at?->format('M d, Y h:i A'),
                'product' => $m->product ? [
                    'id' => $m->product->id,
                    'name' => $m->product->name,
                    'sku' => $m->product->sku,
                    'category' => $m->product->category ?? 'General',
                    'price' => (float) $m->product->price,
                ] : null,
                'user' => $m->user ? [
                    'id' => $m->user->id,
                    'name' => $m->user->name,
                ] : [
                    'id' => null,
                    'name' => 'System Administrator',
                ],
            ];
        });

        return response()->json([
            'status' => 'success',
            'count' => $trashedProducts->count() + $trashedMovements->count(),
            'products' => $trashedProducts,
            'movements' => $trashedMovements,
            'counts' => [
                'products' => $trashedProducts->count(),
                'movements' => $trashedMovements->count(),
            ],
        ]);
    }

    /**
     * Dedicated Stock Movements index for mobile app.
     */
    public function stockMovementsIndex(Request $request): JsonResponse
    {
        $search = $request->query('search');

        $movementQuery = StockMovement::onlyTrashed()
            ->with(['product' => fn ($q) => $q->withTrashed(), 'user'])
            ->latest('deleted_at');

        if ($search) {
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
                'deleted_at' => $m->deleted_at?->format('Y-m-d H:i:s'),
                'created_at' => $m->created_at?->format('M d, Y h:i A'),
                'product' => $m->product ? [
                    'id' => $m->product->id,
                    'name' => $m->product->name,
                    'sku' => $m->product->sku,
                    'category' => $m->product->category ?? 'General',
                    'price' => (float) $m->product->price,
                ] : null,
                'user' => $m->user ? [
                    'id' => $m->user->id,
                    'name' => $m->user->name,
                ] : [
                    'id' => null,
                    'name' => 'System Administrator',
                ],
            ];
        });

        return response()->json([
            'status' => 'success',
            'count' => $trashedMovements->count(),
            'movements' => $trashedMovements,
        ]);
    }

    /**
     * Restore a soft-deleted product from recycle bin.
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
     * Permanently purge a product from database.
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

    /**
     * Restore a soft-deleted stock movement and re-apply inventory balance.
     */
    public function restoreMovement(int $id): JsonResponse
    {
        return DB::transaction(function () use ($id) {
            $movement = StockMovement::onlyTrashed()->find($id);

            if (! $movement) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Stock movement record not found in Recycle Bin.',
                ], 404);
            }

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
     * Alias for mobile API route compatibility.
     */
    public function restoreStockMovement(int $id): JsonResponse
    {
        return $this->restoreMovement($id);
    }

    /**
     * Permanently remove a stock movement from database.
     */
    public function forceDeleteMovement(int $id): JsonResponse
    {
        $movement = StockMovement::onlyTrashed()->find($id);

        if (! $movement) {
            return response()->json([
                'status' => 'error',
                'message' => 'Stock movement record not found in Recycle Bin.',
            ], 404);
        }

        $movementId = $movement->id;
        $movement->forceDelete();

        return response()->json([
            'status' => 'success',
            'message' => "Stock movement LOG-#{$movementId} permanently purged.",
            'id' => $movementId,
        ]);
    }

    /**
     * Alias for mobile API route compatibility.
     */
    public function forceDeleteStockMovement(int $id): JsonResponse
    {
        return $this->forceDeleteMovement($id);
    }
}
