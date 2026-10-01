<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StockMovementWebTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_record_stock_in_and_update_quantity(): void
    {
        $user = User::factory()->create();

        $product = Product::create([
            'name' => 'Hammer Pro',
            'sku' => 'TOOL-HMR-001',
            'price' => 20.00,
            'quantity' => 10,
            'category' => 'Hand Tools',
            'status' => 'active',
        ]);

        $response = $this->actingAs($user)->postJson('/api/web/stock-movements', [
            'product_id' => $product->id,
            'type' => 'in',
            'quantity' => 15,
            'reason' => 'Vendor restock arrival',
        ]);

        $response->assertStatus(201);
        $this->assertEquals(25, $product->fresh()->quantity);
        $this->assertDatabaseHas('stock_movements', [
            'product_id' => $product->id,
            'type' => 'in',
            'quantity_changed' => 15,
            'previous_stock' => 10,
            'new_stock' => 25,
        ]);
    }

    public function test_can_view_stock_movement_voucher(): void
    {
        $user = User::factory()->create();

        $product = Product::create([
            'name' => 'Pliers 8-inch',
            'sku' => 'TOOL-PLR-001',
            'price' => 12.50,
            'quantity' => 30,
            'category' => 'Hand Tools',
            'status' => 'active',
        ]);

        $movement = StockMovement::create([
            'product_id' => $product->id,
            'user_id' => $user->id,
            'type' => 'in',
            'quantity_changed' => 10,
            'previous_stock' => 20,
            'new_stock' => 30,
            'reason' => 'Initial shipment',
        ]);

        $response = $this->actingAs($user)->getJson("/api/web/stock-movements/{$movement->id}");

        $response->assertStatus(200);
        $response->assertJsonPath('movement.id', $movement->id);
        $response->assertJsonPath('movement.product.name', 'Pliers 8-inch');
        $response->assertJsonPath('movement.reason', 'Initial shipment');
    }

    public function test_can_update_stock_movement_reason(): void
    {
        $user = User::factory()->create();

        $product = Product::create([
            'name' => 'Wrench Set',
            'sku' => 'TOOL-WRN-001',
            'price' => 45.00,
            'quantity' => 10,
            'category' => 'Hand Tools',
            'status' => 'active',
        ]);

        $movement = StockMovement::create([
            'product_id' => $product->id,
            'user_id' => $user->id,
            'type' => 'in',
            'quantity_changed' => 5,
            'previous_stock' => 5,
            'new_stock' => 10,
            'reason' => 'Old note',
        ]);

        $response = $this->actingAs($user)->putJson("/api/web/stock-movements/{$movement->id}", [
            'reason' => 'Updated PO reference #PO-8899',
        ]);

        $response->assertStatus(200);
        $this->assertEquals('Updated PO reference #PO-8899', $movement->fresh()->reason);
    }

    public function test_can_delete_stock_movement_and_safely_revert_product_stock(): void
    {
        $user = User::factory()->create();

        $product = Product::create([
            'name' => 'Drill Bit Set',
            'sku' => 'TOOL-DRL-009',
            'price' => 35.00,
            'quantity' => 50, // was increased from 30 by a stock-in of 20
            'category' => 'Power Tools',
            'status' => 'active',
        ]);

        $movement = StockMovement::create([
            'product_id' => $product->id,
            'user_id' => $user->id,
            'type' => 'in',
            'quantity_changed' => 20,
            'previous_stock' => 30,
            'new_stock' => 50,
            'reason' => 'Erroneous stock in to be deleted',
        ]);

        $response = $this->actingAs($user)->deleteJson("/api/web/stock-movements/{$movement->id}");

        $response->assertStatus(200);
        $this->assertSoftDeleted('stock_movements', ['id' => $movement->id]);
        // Stock should be reverted back to 30!
        $this->assertEquals(30, $product->fresh()->quantity);
    }
}
