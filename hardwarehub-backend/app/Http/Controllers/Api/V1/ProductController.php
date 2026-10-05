<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    /**
     * Mobile Product Catalog List with Search, Filter & Pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::query();

        // Keyword Search
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Category Filter
        if ($category = $request->query('category')) {
            if (strtolower($category) !== 'all') {
                $query->where('category', $category);
            }
        }

        // Status Filter
        if ($status = $request->query('status')) {
            if (in_array($status, ['active', 'inactive'])) {
                $query->where('status', $status);
            }
        }

        // Stock Health Filter
        if ($stockStatus = $request->query('stock_status')) {
            if ($stockStatus === 'out_of_stock') {
                $query->where('quantity', '<=', 0);
            } elseif ($stockStatus === 'low_stock') {
                $query->where('quantity', '>', 0)
                      ->whereColumn('quantity', '<=', 'low_stock_threshold');
            } elseif ($stockStatus === 'healthy') {
                $query->whereColumn('quantity', '>', 'low_stock_threshold');
            }
        }

        // Sorting
        $sortBy = $request->query('sort_by', 'created_at');
        $sortOrder = $request->query('sort_order', 'desc');

        if (in_array($sortBy, ['name', 'price', 'quantity', 'created_at'])) {
            $query->orderBy($sortBy, $sortOrder === 'asc' ? 'asc' : 'desc');
        } else {
            $query->latest();
        }

        $perPage = min((int) $request->query('per_page', 15), 100);
        $paginator = $query->paginate($perPage);

        $products = collect($paginator->items())->map(function ($product) {
            return $this->formatProduct($product);
        });

        return response()->json([
            'status' => 'success',
            'data' => $products,
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
                'has_more' => $paginator->hasMorePages(),
            ],
        ]);
    }

    /**
     * Show single product details.
     */
    public function show(string $id): JsonResponse
    {
        $product = Product::find($id);

        if (! $product) {
            return response()->json([
                'status' => 'error',
                'message' => 'Product not found.',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $this->formatProduct($product),
        ]);
    }

    /**
     * Barcode / SKU Scanner Lookup for Mobile Camera Scans.
     */
    public function scan(string $sku): JsonResponse
    {
        $skuClean = trim(strtoupper($sku));
        $product = Product::where('sku', $skuClean)->first();

        if (! $product) {
            return response()->json([
                'status' => 'error',
                'message' => "No product found matching SKU or barcode: {$skuClean}",
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Product scanned successfully.',
            'data' => $this->formatProduct($product),
        ]);
    }

    /**
     * Mobile Create Product.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required|string|max:50|unique:products,sku',
            'description' => 'nullable|string|max:1000',
            'category' => 'nullable|string|max:100',
            'price' => 'required|numeric|min:0',
            'quantity' => 'required|integer|min:0',
            'low_stock_threshold' => 'required|integer|min:0',
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ]);

        $validated['sku'] = strtoupper(trim($validated['sku']));

        $product = Product::create($validated);

        // Record initial stock movement if quantity > 0
        if ($product->quantity > 0) {
            StockMovement::create([
                'product_id' => $product->id,
                'user_id' => $request->user()?->id,
                'type' => 'in',
                'quantity_changed' => $product->quantity,
                'previous_stock' => 0,
                'new_stock' => $product->quantity,
                'reason' => 'Initial catalog registration stock',
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Product registered successfully.',
            'data' => $this->formatProduct($product),
        ], 201);
    }

    /**
     * Mobile Update Product.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $product = Product::find($id);

        if (! $product) {
            return response()->json([
                'status' => 'error',
                'message' => 'Product not found.',
            ], 404);
        }

        $previousQuantity = $product->quantity;

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'sku' => ['sometimes', 'required', 'string', 'max:50', Rule::unique('products', 'sku')->ignore($product->id)],
            'description' => 'nullable|string|max:1000',
            'category' => 'nullable|string|max:100',
            'price' => 'sometimes|required|numeric|min:0',
            'quantity' => 'sometimes|required|integer|min:0',
            'low_stock_threshold' => 'sometimes|required|integer|min:0',
            'status' => ['sometimes', 'required', Rule::in(['active', 'inactive'])],
        ]);

        if (isset($validated['sku'])) {
            $validated['sku'] = strtoupper(trim($validated['sku']));
        }

        $product->update($validated);

        // Record stock movement if quantity changed
        if (isset($validated['quantity']) && $previousQuantity !== (int) $validated['quantity']) {
            $diff = (int) $validated['quantity'] - $previousQuantity;
            StockMovement::create([
                'product_id' => $product->id,
                'user_id' => $request->user()?->id,
                'type' => $diff > 0 ? 'in' : 'out',
                'quantity_changed' => $diff,
                'previous_stock' => $previousQuantity,
                'new_stock' => $product->quantity,
                'reason' => 'Mobile catalog edit stock adjustment',
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Product updated successfully.',
            'data' => $this->formatProduct($product->fresh()),
        ], 200);
    }

    /**
     * Quick Mobile Stock Adjustment (+ / - / set).
     */
    public function adjustStock(Request $request, string $id): JsonResponse
    {
        $product = Product::find($id);

        if (! $product) {
            return response()->json([
                'status' => 'error',
                'message' => 'Product not found.',
            ], 404);
        }

        $validated = $request->validate([
            'action' => ['required', Rule::in(['add', 'subtract', 'set'])],
            'amount' => 'required|integer|min:1',
            'note' => 'nullable|string|max:255',
        ]);

        $previousQuantity = $product->quantity;
        $amount = $validated['amount'];

        if ($validated['action'] === 'add') {
            $newQuantity = $previousQuantity + $amount;
        } elseif ($validated['action'] === 'subtract') {
            $newQuantity = max(0, $previousQuantity - $amount);
        } else {
            $newQuantity = $amount;
        }

        $product->update(['quantity' => $newQuantity]);

        if ($previousQuantity !== $newQuantity) {
            $diff = $newQuantity - $previousQuantity;
            StockMovement::create([
                'product_id' => $product->id,
                'user_id' => $request->user()?->id,
                'type' => $diff > 0 ? 'in' : 'out',
                'quantity_changed' => $diff,
                'previous_stock' => $previousQuantity,
                'new_stock' => $newQuantity,
                'reason' => $validated['note'] ?? 'Mobile quick stock adjustment',
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Stock quantity updated successfully.',
            'stock_change' => [
                'action' => $validated['action'],
                'amount' => $amount,
                'previous_quantity' => $previousQuantity,
                'new_quantity' => $newQuantity,
                'note' => $validated['note'] ?? null,
            ],
            'data' => $this->formatProduct($product->fresh()),
        ]);
    }

    /**
     * Delete product (Soft Delete).
     */
    public function destroy(string $id): JsonResponse
    {
        $product = Product::find($id);

        if (! $product) {
            return response()->json([
                'status' => 'error',
                'message' => 'Product not found.',
            ], 404);
        }

        $product->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Product moved to recycle bin successfully.',
        ]);
    }

    /**
     * Format product payload with computed fields for mobile clients.
     */
    private function formatProduct(Product $product): array
    {
        $threshold = $product->low_stock_threshold ?? 10;
        $quantity = $product->quantity;

        $isOutOfStock = $quantity <= 0;
        $isLowStock = $quantity > 0 && $quantity <= $threshold;
        $isHealthy = $quantity > $threshold;

        return [
            'id' => $product->id,
            'name' => $product->name,
            'sku' => $product->sku,
            'description' => $product->description,
            'category' => $product->category ?? 'General',
            'price' => (float) $product->price,
            'price_formatted' => '$'.number_format((float) $product->price, 2),
            'quantity' => (int) $quantity,
            'low_stock_threshold' => (int) $threshold,
            'status' => $product->status,
            'stock_status' => $isOutOfStock ? 'out_of_stock' : ($isLowStock ? 'low_stock' : 'healthy'),
            'is_low_stock' => $isLowStock,
            'is_out_of_stock' => $isOutOfStock,
            'created_at' => $product->created_at?->toISOString(),
            'updated_at' => $product->updated_at?->toISOString(),
        ];
    }
}
