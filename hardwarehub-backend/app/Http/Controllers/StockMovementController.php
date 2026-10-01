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
}
