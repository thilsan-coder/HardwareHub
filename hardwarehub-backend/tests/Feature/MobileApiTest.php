<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class MobileApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_mobile_login_returns_sanctum_bearer_token(): void
    {
        $user = User::factory()->create([
            'email' => 'mobile_test_'.uniqid().'@hardwarehub.com',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'password123',
            'device_name' => 'Flutter Android Device',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'message',
                'token_type',
                'access_token',
                'user' => ['id', 'name', 'email'],
            ])
            ->assertJson([
                'status' => 'success',
                'token_type' => 'Bearer',
            ]);
    }

    public function test_mobile_login_fails_with_invalid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'mobile_invalid_'.uniqid().'@hardwarehub.com',
            'password' => Hash::make('secret123'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'status' => 'error',
            ]);
    }

    public function test_mobile_protected_routes_require_authentication(): void
    {
        $response = $this->getJson('/api/v1/products');
        $response->assertStatus(401);
    }

    public function test_authenticated_mobile_user_can_fetch_catalog_and_scan_barcode(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('TestDevice')->plainTextToken;

        $sku = 'TEST-SCAN-'.strtoupper(uniqid());
        $product = Product::create([
            'name' => 'Cordless Drill 18V',
            'sku' => $sku,
            'description' => 'Brushless heavy duty drill',
            'price' => 89.99,
            'quantity' => 15,
            'low_stock_threshold' => 5,
            'status' => 'active',
        ]);

        // 1. Fetch catalog
        $catalogResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/products');

        $catalogResponse->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'data',
                'pagination',
            ]);

        // 2. Barcode Scan by SKU
        $scanResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/v1/products/scan/{$sku}");

        $scanResponse->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'data' => [
                    'sku' => $sku,
                    'name' => 'Cordless Drill 18V',
                    'quantity' => 15,
                    'stock_status' => 'healthy',
                ],
            ]);

        // 3. Scan unknown SKU returns 404
        $unknownScan = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/products/scan/NON-EXISTENT-SKU');

        $unknownScan->assertStatus(404)
            ->assertJson(['status' => 'error']);
    }

    public function test_mobile_stock_adjustment_endpoint(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('TestDevice')->plainTextToken;

        $product = Product::create([
            'name' => 'Heavy Duty Pliers',
            'sku' => 'TEST-PLIER-'.strtoupper(uniqid()),
            'price' => 12.50,
            'quantity' => 20,
            'low_stock_threshold' => 5,
            'status' => 'active',
        ]);

        // Add 10 items
        $addResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/v1/products/{$product->id}/adjust-stock", [
                'action' => 'add',
                'amount' => 10,
                'note' => 'New shipment received',
            ]);

        $addResponse->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'stock_change' => [
                    'action' => 'add',
                    'amount' => 10,
                    'previous_quantity' => 20,
                    'new_quantity' => 30,
                ],
            ]);

        $this->assertEquals(30, $product->fresh()->quantity);

        // Subtract 25 items (becomes 5 -> low stock)
        $subResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/v1/products/{$product->id}/adjust-stock", [
                'action' => 'subtract',
                'amount' => 25,
            ]);

        $subResponse->assertStatus(200)
            ->assertJson([
                'stock_change' => [
                    'new_quantity' => 5,
                ],
                'data' => [
                    'stock_status' => 'low_stock',
                    'is_low_stock' => true,
                ],
            ]);
    }

    public function test_mobile_dashboard_summary_endpoint(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('TestDevice')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/dashboard/summary');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'data' => [
                    'total_products',
                    'active_products',
                    'healthy_stock_count',
                    'low_stock_count',
                    'out_of_stock_count',
                    'total_inventory_value',
                ],
            ]);
    }

    public function test_mobile_logout_revokes_token(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('TestDevice')->plainTextToken;

        $logoutResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/auth/logout');

        $logoutResponse->assertStatus(200)
            ->assertJson([
                'status' => 'success',
            ]);

        $this->assertCount(0, $user->fresh()->tokens);

        // Attempting to use the revoked token must now fail with 401 Unauthorized
        $this->app['auth']->forgetGuards();
        $meResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/auth/me');

        $meResponse->assertStatus(401);
    }

    public function test_mobile_recycle_bin_list_restore_and_force_delete(): void
    {
        $user = User::factory()->create();

        $product = Product::create([
            'name' => 'Paint Roller 9-inch',
            'sku' => 'PNT-ROL-001',
            'price' => 8.99,
            'quantity' => 14,
            'category' => 'Paints',
            'status' => 'active',
        ]);
        $product->delete(); // Soft delete

        // 1. List Recycle Bin via Mobile API
        $listRes = $this->actingAs($user, 'sanctum')->getJson('/api/v1/recycle-bin');
        $listRes->assertStatus(200)
            ->assertJsonStructure(['status', 'count', 'products'])
            ->assertJsonPath('count', 1);

        // 2. Restore Product via Mobile API
        $restoreRes = $this->actingAs($user, 'sanctum')->postJson("/api/v1/recycle-bin/{$product->id}/restore");
        $restoreRes->assertStatus(200)
            ->assertJsonPath('status', 'success');
        $this->assertNull($product->fresh()->deleted_at);

        // 3. Force Delete via Mobile API
        $product->delete();
        $forceRes = $this->actingAs($user, 'sanctum')->deleteJson("/api/v1/recycle-bin/{$product->id}/force-delete");
        $forceRes->assertStatus(200)
            ->assertJsonPath('status', 'success');
        $this->assertDatabaseMissing('products', ['id' => $product->id]);
    }
}
