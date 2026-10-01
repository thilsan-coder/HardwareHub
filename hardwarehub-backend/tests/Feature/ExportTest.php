<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExportTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_export_products_csv_with_proper_headers_and_summary(): void
    {
        $user = User::factory()->create();

        Product::create([
            'name' => 'DeWalt 20V Cordless Drill',
            'sku' => 'TOOL-DRL-001',
            'price' => 129.99,
            'quantity' => 25,
            'low_stock_threshold' => 5,
            'category' => 'Power Tools',
            'status' => 'active',
            'description' => 'Heavy duty 20V drill machine',
        ]);

        $response = $this->actingAs($user)->get('/api/web/export/products');

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        $this->assertNotEmpty($response->streamedContent());
    }

    public function test_can_export_low_stock_csv(): void
    {
        $user = User::factory()->create();

        Product::create([
            'name' => 'PVC Pipe 1/2 Inch',
            'sku' => 'PLM-PVC-001',
            'price' => 4.50,
            'quantity' => 2,
            'low_stock_threshold' => 10,
            'category' => 'Plumbing',
            'status' => 'active',
        ]);

        $response = $this->actingAs($user)->get('/api/web/export/low-stock');

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        $this->assertNotEmpty($response->streamedContent());
    }

    public function test_can_export_stock_movements_csv(): void
    {
        $user = User::factory()->create();

        $product = Product::create([
            'name' => 'Safety Gloves XL',
            'sku' => 'SAF-GLV-001',
            'price' => 8.00,
            'quantity' => 50,
            'low_stock_threshold' => 10,
            'category' => 'Safety',
            'status' => 'active',
        ]);

        StockMovement::create([
            'product_id' => $product->id,
            'user_id' => $user->id,
            'type' => 'in',
            'quantity_changed' => 20,
            'previous_stock' => 30,
            'new_stock' => 50,
            'reason' => 'Vendor restock shipment',
        ]);

        $response = $this->actingAs($user)->get('/api/web/export/stock-movements');

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        $this->assertNotEmpty($response->streamedContent());
    }
}
