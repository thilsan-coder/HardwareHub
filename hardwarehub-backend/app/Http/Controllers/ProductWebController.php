<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class ProductWebController extends Controller
{
    /**
     * Display a listing of active (non-deleted) products.
     */
    public function index(Request $request)
    {
        $query = Product::query()->orderBy('id', 'desc');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category') && $request->input('category') !== 'all') {
            $query->where('category', $request->input('category'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $products = $query->get();

        return response()->json([
            'products' => $products,
            'count' => $products->count(),
        ]);
    }

    /**
     * Store a newly created product in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'sku' => ['required', 'string', 'max:100', 'unique:products,sku'],
            'category' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'quantity' => ['required', 'integer', 'min:0'],
            'low_stock_threshold' => ['required', 'integer', 'min:0'],
            'status' => ['required', 'in:active,inactive'],
        ]);

        $validated['category'] = $validated['category'] ?: 'General';
        $product = Product::create($validated);

        // Record initial stock movement log if initial quantity > 0
        if ($product->quantity > 0) {
            StockMovement::create([
                'product_id' => $product->id,
                'user_id' => Auth::id(),
                'type' => 'in',
                'quantity_changed' => $product->quantity,
                'previous_stock' => 0,
                'new_stock' => $product->quantity,
                'reason' => 'Initial catalog registration stock',
            ]);
        }

        return response()->json([
            'message' => 'Product created successfully',
            'product' => $product,
        ], 201);
    }

    /**
     * Display the specified product.
     */
    public function show($id)
    {
        $product = Product::findOrFail($id);

        return response()->json([
            'product' => $product,
        ]);
    }

    /**
     * Update the specified product in storage.
     */
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        $previousQuantity = $product->quantity;

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'sku' => ['required', 'string', 'max:100', Rule::unique('products', 'sku')->ignore($product->id)],
            'category' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'quantity' => ['required', 'integer', 'min:0'],
            'low_stock_threshold' => ['required', 'integer', 'min:0'],
            'status' => ['required', 'in:active,inactive'],
        ]);

        if (array_key_exists('category', $validated)) {
            $validated['category'] = $validated['category'] ?: 'General';
        }

        $product->update($validated);

        // Record stock movement if quantity changed
        if ($previousQuantity !== $product->quantity) {
            $diff = $product->quantity - $previousQuantity;
            StockMovement::create([
                'product_id' => $product->id,
                'user_id' => Auth::id(),
                'type' => $diff > 0 ? 'in' : 'out',
                'quantity_changed' => $diff,
                'previous_stock' => $previousQuantity,
                'new_stock' => $product->quantity,
                'reason' => 'Catalog edit stock adjustment',
            ]);
        }

        return response()->json([
            'message' => 'Product updated successfully',
            'product' => $product,
        ]);
    }

    /**
     * Remove the specified product from storage (Soft Delete).
     */
    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully',
            'id' => $id,
        ]);
    }
}
