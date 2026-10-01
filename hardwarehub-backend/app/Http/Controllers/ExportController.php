<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportController extends Controller
{
    /**
     * Export complete product catalog as CSV.
     */
    public function exportProductsCsv(Request $request): StreamedResponse
    {
        $filename = 'hardwarehub_products_catalog_'.date('Y-m-d_His').'.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        return response()->stream(function () {
            $handle = fopen('php://output', 'w');

            // UTF-8 BOM for Excel compatibility
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));

            // CSV Header Row
            fputcsv($handle, [
                'Product ID',
                'SKU Code',
                'Product Name',
                'Category',
                'Unit Price ($)',
                'Stock In Hand',
                'Low Stock Alert Limit',
                'Status',
                'Stock Health',
                'Total Valuation ($)',
                'Description',
                'Registered Date',
            ]);

            Product::orderBy('name')->chunk(200, function ($products) use ($handle) {
                foreach ($products as $p) {
                    $threshold = $p->low_stock_threshold ?? 10;
                    $valuation = (float) $p->price * (int) $p->quantity;
                    $health = $p->quantity <= 0 ? 'Out of Stock' : ($p->quantity <= $threshold ? 'Low Stock' : 'Healthy');

                    fputcsv($handle, [
                        $p->id,
                        $p->sku,
                        $p->name,
                        $p->category ?? 'General',
                        number_format((float) $p->price, 2, '.', ''),
                        $p->quantity,
                        $threshold,
                        ucfirst($p->status),
                        $health,
                        number_format($valuation, 2, '.', ''),
                        $p->description ?? '',
                        $p->created_at?->format('Y-m-d H:i'),
                    ]);
                }
            });

            fclose($handle);
        }, 200, $headers);
    }

    /**
     * Export low-stock purchase replenishment list as CSV.
     */
    public function exportLowStockCsv(Request $request): StreamedResponse
    {
        $filename = 'hardwarehub_low_stock_replenishment_'.date('Y-m-d_His').'.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        return response()->stream(function () {
            $handle = fopen('php://output', 'w');
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));

            fputcsv($handle, [
                'SKU Code',
                'Product Name',
                'Category',
                'Current Stock',
                'Alert Limit',
                'Suggested Reorder Qty',
                'Unit Price ($)',
                'Estimated Restock Cost ($)',
            ]);

            $lowStockProducts = Product::where('status', 'active')
                ->where(function ($q) {
                    $q->where('quantity', '<=', 0)
                      ->orWhereColumn('quantity', '<=', 'low_stock_threshold');
                })
                ->orderBy('quantity')
                ->get();

            foreach ($lowStockProducts as $p) {
                $threshold = $p->low_stock_threshold ?? 10;
                $suggestedReorder = max(10, ($threshold * 2) - $p->quantity);
                $estCost = $suggestedReorder * (float) $p->price;

                fputcsv($handle, [
                    $p->sku,
                    $p->name,
                    $p->category ?? 'General',
                    $p->quantity,
                    $threshold,
                    $suggestedReorder,
                    number_format((float) $p->price, 2, '.', ''),
                    number_format($estCost, 2, '.', ''),
                ]);
            }

            fclose($handle);
        }, 200, $headers);
    }

    /**
     * Export stock movement history audit log as CSV.
     */
    public function exportStockMovementsCsv(Request $request): StreamedResponse
    {
        $filename = 'hardwarehub_stock_movements_log_'.date('Y-m-d_His').'.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        return response()->stream(function () {
            $handle = fopen('php://output', 'w');
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));

            fputcsv($handle, [
                'Log ID',
                'Timestamp',
                'SKU Code',
                'Product Name',
                'Movement Type',
                'Quantity Changed',
                'Previous Stock',
                'New Stock',
                'Operator / User',
                'Notes / Reason',
            ]);

            StockMovement::with(['product' => fn ($q) => $q->withTrashed(), 'user'])
                ->latest()
                ->chunk(200, function ($movements) use ($handle) {
                    foreach ($movements as $m) {
                        $typeLabel = match ($m->type) {
                            'in' => 'Stock In (Arrival)',
                            'out' => 'Stock Out (Sale/Dispatch)',
                            'damage' => 'Damaged/Waste',
                            default => 'Inventory Adjustment',
                        };

                        fputcsv($handle, [
                            $m->id,
                            $m->created_at?->format('Y-m-d H:i:s'),
                            $m->product?->sku ?? 'N/A',
                            $m->product?->name ?? 'Deleted Item',
                            $typeLabel,
                            $m->quantity_changed > 0 ? "+{$m->quantity_changed}" : $m->quantity_changed,
                            $m->previous_stock,
                            $m->new_stock,
                            $m->user?->name ?? 'System / Scanner',
                            $m->reason ?? 'Standard stock update',
                        ]);
                    }
                });

            fclose($handle);
        }, 200, $headers);
    }
}
