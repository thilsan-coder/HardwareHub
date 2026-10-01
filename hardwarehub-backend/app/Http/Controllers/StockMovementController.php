<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class StockMovementController extends Controller
{
    /**
     * Get paginated stock movements log with search & filters.
     */
    public function index(Request $request): JsonResponse
    {
        $query = StockMovement::with(['product' => fn ($q) => $q->withTrashed(), 'user']);

        // Search by Product Name, SKU, or Reason
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('reason', 'like', "%{$search}%")
                  ->orWhereHas('product', function ($pq) use ($search) {
                      $pq->where('name', 'like', "%{$search}%")
                         ->orWhere('sku', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by Type
        if ($type = $request->query('type')) {
            if (in_array($type, ['in', 'out', 'adjustment', 'damage'])) {
                $query->where('type', $type);
            }
        }

        // Filter by Product ID
        if ($productId = $request->query('product_id')) {
            $query->where('product_id', $productId);
        }

        $perPage = min((int) $request->query('per_page', 10), 100);
        $paginator = $query->latest()->paginate($perPage);

        $movements = collect($paginator->items())->map(function ($m) {
            return [
                'id' => $m->id,
                'type' => $m->type,
                'quantity_changed' => (int) $m->quantity_changed,
                'previous_stock' => (int) $m->previous_stock,
                'new_stock' => (int) $m->new_stock,
                'reason' => $m->reason ?: 'Standard stock update',
                'created_at' => $m->created_at?->format('M d, Y h:i A'),
                'created_at_iso' => $m->created_at?->toISOString(),
                'product' => $m->product ? [
                    'id' => $m->product->id,
                    'name' => $m->product->name,
                    'sku' => $m->product->sku,
                    'category' => $m->product->category ?? 'General',
                    'price' => (float) $m->product->price,
                    'is_deleted' => (bool) $m->product->trashed(),
                ] : null,
                'user' => $m->user ? [
                    'id' => $m->user->id,
                    'name' => $m->user->name,
                    'email' => $m->user->email,
                ] : [
                    'id' => null,
                    'name' => 'System / Scanner',
                    'email' => null,
                ],
            ];
        });

        // Summary counts for filter tabs
        $totalCount = StockMovement::count();
        $inCount = StockMovement::where('type', 'in')->count();
        $outCount = StockMovement::where('type', 'out')->count();
        $adjustCount = StockMovement::whereIn('type', ['adjustment', 'damage'])->count();

        return response()->json([
            'status' => 'success',
            'movements' => $movements,
            'summary' => [
                'total' => $totalCount,
                'stock_in' => $inCount,
                'stock_out' => $outCount,
                'adjustments' => $adjustCount,
            ],
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ],
        ]);
    }

    /**
     * Record a new stock movement (Stock In, Stock Out, or Inventory Adjustment).
     */
    public function store(Request $request): JsonResponse
    {
        // Support both quantity and quantity_changed from mobile/web
        if (! $request->has('quantity') && $request->has('quantity_changed')) {
            $request->merge(['quantity' => abs((int) $request->input('quantity_changed'))]);
        }

        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'type' => ['required', Rule::in(['in', 'out', 'adjustment', 'damage'])],
            'quantity' => 'required|integer|min:1',
            'reason' => 'nullable|string|max:255',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $product = Product::lockForUpdate()->findOrFail($validated['product_id']);
            $previousStock = $product->quantity;
            $qty = (int) $validated['quantity'];
            $type = $validated['type'];

            if ($type === 'in') {
                $quantityChanged = +$qty;
                $newStock = $previousStock + $qty;
            } elseif ($type === 'out' || $type === 'damage') {
                $quantityChanged = -$qty;
                $newStock = max(0, $previousStock - $qty);
            } else { // adjustment
                $newStock = $qty;
                $quantityChanged = $newStock - $previousStock;
            }

            $product->update(['quantity' => $newStock]);

            $movement = StockMovement::create([
                'product_id' => $product->id,
                'user_id' => Auth::id() ?? $request->user()?->id,
                'type' => $type,
                'quantity_changed' => $quantityChanged,
                'previous_stock' => $previousStock,
                'new_stock' => $newStock,
                'reason' => $validated['reason'] ?? null,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Stock movement recorded successfully.',
                'movement' => $movement->load(['product', 'user']),
                'product' => $product->fresh(),
            ], 201);
        });
    }

    /**
     * Get a single stock movement details.
     */
    public function show(int $id): JsonResponse
    {
        $movement = StockMovement::with(['product' => fn ($q) => $q->withTrashed(), 'user'])
            ->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'movement' => [
                'id' => $movement->id,
                'type' => $movement->type,
                'quantity_changed' => (int) $movement->quantity_changed,
                'previous_stock' => (int) $movement->previous_stock,
                'new_stock' => (int) $movement->new_stock,
                'reason' => $movement->reason ?: 'Standard stock update',
                'created_at' => $movement->created_at?->format('M d, Y h:i A'),
                'created_at_iso' => $movement->created_at?->toISOString(),
                'product' => $movement->product ? [
                    'id' => $movement->product->id,
                    'name' => $movement->product->name,
                    'sku' => $movement->product->sku,
                    'category' => $movement->product->category ?? 'General',
                    'price' => (float) $movement->product->price,
                    'is_deleted' => (bool) $movement->product->trashed(),
                ] : null,
                'user' => $movement->user ? [
                    'id' => $movement->user->id,
                    'name' => $movement->user->name,
                    'email' => $movement->user->email,
                ] : [
                    'id' => null,
                    'name' => 'System Administrator',
                    'email' => null,
                ],
            ],
        ]);
    }

    /**
     * Update stock movement (Product, Type, Quantity, and Reason) with inventory reconciliation.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        if (! $request->has('quantity') && $request->has('quantity_changed')) {
            $request->merge(['quantity' => abs((int) $request->input('quantity_changed'))]);
        }

        $validated = $request->validate([
            'product_id' => 'sometimes|required|exists:products,id',
            'type' => ['sometimes', 'required', Rule::in(['in', 'out', 'adjustment', 'damage'])],
            'quantity' => 'sometimes|required|integer|min:1',
            'reason' => 'nullable|string|max:500',
        ]);

        return DB::transaction(function () use ($validated, $id, $request) {
            $movement = StockMovement::findOrFail($id);
            $oldProduct = Product::lockForUpdate()->find($movement->product_id);

            // Revert old movement first
            if ($oldProduct) {
                if ($movement->type === 'in') {
                    $oldProduct->quantity = max(0, $oldProduct->quantity - abs($movement->quantity_changed));
                } elseif ($movement->type === 'out' || $movement->type === 'damage') {
                    $oldProduct->quantity = $oldProduct->quantity + abs($movement->quantity_changed);
                } elseif ($movement->type === 'adjustment') {
                    $oldProduct->quantity = max(0, $movement->previous_stock);
                }
                $oldProduct->save();
            }

            $newProductId = $validated['product_id'] ?? $movement->product_id;
            $newType = $validated['type'] ?? $movement->type;
            $newQty = isset($validated['quantity']) ? (int) $validated['quantity'] : abs($movement->quantity_changed);
            $newReason = array_key_exists('reason', $validated) ? ($validated['reason'] ?? 'Manual stock update') : $movement->reason;

            $targetProduct = ($oldProduct && $oldProduct->id == $newProductId)
                ? $oldProduct->fresh()
                : Product::lockForUpdate()->findOrFail($newProductId);

            $previousStock = $targetProduct->quantity;

            if ($newType === 'in') {
                $quantityChanged = +$newQty;
                $newStock = $previousStock + $newQty;
            } elseif ($newType === 'out' || $newType === 'damage') {
                $quantityChanged = -$newQty;
                $newStock = max(0, $previousStock - $newQty);
            } else { // adjustment
                $newStock = $newQty;
                $quantityChanged = $newStock - $previousStock;
            }

            $targetProduct->update(['quantity' => $newStock]);

            $movement->update([
                'product_id' => $targetProduct->id,
                'type' => $newType,
                'quantity_changed' => $quantityChanged,
                'previous_stock' => $previousStock,
                'new_stock' => $newStock,
                'reason' => $newReason,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Stock movement updated successfully.',
                'movement' => $movement->load(['product', 'user']),
                'product' => $targetProduct->fresh(),
            ]);
        });
    }

    /**
     * Delete / Void a stock movement record and automatically revert inventory balance.
     */
    public function destroy(int $id): JsonResponse
    {
        return DB::transaction(function () use ($id) {
            $movement = StockMovement::findOrFail($id);
            $product = Product::lockForUpdate()->find($movement->product_id);

            if ($product) {
                // Revert stock back according to original movement type
                if ($movement->type === 'in') {
                    // Deduct what was added
                    $product->quantity = max(0, $product->quantity - abs($movement->quantity_changed));
                } elseif ($movement->type === 'out' || $movement->type === 'damage') {
                    // Add back what was removed
                    $product->quantity = $product->quantity + abs($movement->quantity_changed);
                } elseif ($movement->type === 'adjustment') {
                    // Restore previous stock
                    $product->quantity = max(0, $movement->previous_stock);
                }
                $product->save();
            }

            $movement->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Stock movement deleted and inventory stock balance safely reverted.',
            ]);
        });
    }
}
