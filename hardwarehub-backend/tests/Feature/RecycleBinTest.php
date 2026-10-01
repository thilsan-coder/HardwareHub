<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RecycleBinTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_trashed_products_and_trashed_movements(): void
    {
        $user = User::factory()->create();

        $product = Product::create([
            'name' => 'Old Paint Can',
            'sku' => 'PNT-001',
            'price' => 15.00,
            'quantity' => 10,
            'category' => 'Paints',
            'status' => 'active',
        ]);
        $product->delete(); // Soft delete

        $movement = StockMovement::create([
            'product_id' => $product->id,
            'user_id' => $user->id,
            'type' => 'in',
            'quantity_changed' => 5,
            'previous_stock' => 5,
            'new_stock' => 10,
            'reason' => 'Test movement',
        ]);
        $movement->delete(); // Soft delete

        $response = $this->actingAs($user)->getJson('/api/web/recycle-bin');

        $response->assertStatus(200);
        $response->assertJsonPath('counts.products', 1);
        $response->assertJsonPath('counts.movements', 1);
    }

    public function test_can_restore_and_force_delete_trashed_stock_movement(): void
    {
        $user = User::factory()->create();

        $product = Product::create([
            'name' => 'Circular Saw',
            'sku' => 'SAW-009',
            'price' => 89.00,
            'quantity' => 20,
            'category' => 'Power Tools',
            'status' => 'active',
        ]);

        $movement = StockMovement::create([
            'product_id' => $product->id,
            'user_id' => $user->id,
            'type' => 'in',
            'quantity_changed' => 10,
            'previous_stock' => 10,
            'new_stock' => 20,
            'reason' => 'Restock saw',
        ]);

        // When voided/deleted, product quantity was reverted to 10
        $product->update(['quantity' => 10]);
        $movement->delete(); // Soft delete

        // Restore movement
        $restoreRes = $this->actingAs($user)->postJson("/api/web/recycle-bin/stock-movements/{$movement->id}/restore");
        $restoreRes->assertStatus(200);
        $this->assertNull($movement->fresh()->deleted_at);
        // Stock should be re-applied back to 20!
        $this->assertEquals(20, $product->fresh()->quantity);

        // Force delete
        $movement->delete();
        $forceRes = $this->actingAs($user)->deleteJson("/api/web/recycle-bin/stock-movements/{$movement->id}/force-delete");
        $forceRes->assertStatus(200);
        $this->assertDatabaseMissing('stock_movements', ['id' => $movement->id]);
    }
}
