<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Product;
use App\Models\StockMovement;

echo "=== PRODUCTS ===\n";
echo "Active: " . Product::count() . "\n";
foreach (Product::all() as $p) {
    echo "  [{$p->id}] {$p->sku} - {$p->name} (Qty: {$p->quantity}, Status: {$p->status}, DeletedAt: " . ($p->deleted_at ?? 'NULL') . ")\n";
}

echo "\n=== TRASHED PRODUCTS ===\n";
echo "Trashed: " . Product::onlyTrashed()->count() . "\n";
foreach (Product::onlyTrashed()->get() as $p) {
    echo "  [{$p->id}] {$p->sku} - {$p->name} (Deleted: {$p->deleted_at})\n";
}

echo "\n=== STOCK MOVEMENTS ===\n";
echo "Total: " . StockMovement::count() . "\n";
foreach (StockMovement::all() as $m) {
    echo "  [{$m->id}] Type: {$m->type}, Qty: {$m->quantity_changed}, ProductID: {$m->product_id}\n";
}
