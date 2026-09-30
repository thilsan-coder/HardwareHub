<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = [
            [
                'name' => 'Claw Hammer',
                'sku' => 'HW-HAM-001',
                'description' => '16 oz curved claw hammer with heavy-duty forged steel head and ergonomic fiberglass handle.',
                'price' => 18.50,
                'quantity' => 45,
                'status' => 'active',
            ],
            [
                'name' => 'Phillips Screwdriver',
                'sku' => 'HW-DRV-002',
                'description' => '#2 Phillips head screwdriver with magnetic tip and anti-slip rubber grip.',
                'price' => 7.25,
                'quantity' => 80,
                'status' => 'active',
            ],
            [
                'name' => 'Adjustable Spanner',
                'sku' => 'HW-SPN-003',
                'description' => '10-inch chrome vanadium steel adjustable wrench with precision laser scale.',
                'price' => 14.99,
                'quantity' => 30,
                'status' => 'active',
            ],
            [
                'name' => 'Cordless Drill',
                'sku' => 'HW-DRL-004',
                'description' => '20V MAX brushless cordless drill driver kit with 2.0Ah lithium-ion battery & charger.',
                'price' => 89.99,
                'quantity' => 15,
                'status' => 'active',
            ],
            [
                'name' => 'Hand Saw',
                'sku' => 'HW-SAW-005',
                'description' => '20-inch wood hand saw with triple-ground teeth for fast efficiency cutting.',
                'price' => 22.00,
                'quantity' => 25,
                'status' => 'active',
            ],
            [
                'name' => 'PVC Pipe',
                'sku' => 'HW-PIP-006',
                'description' => '3/4 inch x 10 feet Schedule 40 white PVC pressure pipe for plumbing.',
                'price' => 6.80,
                'quantity' => 120,
                'status' => 'active',
            ],
            [
                'name' => 'Electrical Cable',
                'sku' => 'HW-CBL-007',
                'description' => '100 ft 12/2 solid copper building wire NM-B with ground for interior branch circuits.',
                'price' => 64.50,
                'quantity' => 18,
                'status' => 'active',
            ],
            [
                'name' => 'Paint',
                'sku' => 'HW-PNT-008',
                'description' => '1 Gallon premium interior satin acrylic enamel latex paint in Pure White.',
                'price' => 34.99,
                'quantity' => 40,
                'status' => 'active',
            ],
            [
                'name' => 'Measuring Tape',
                'sku' => 'HW-TAP-009',
                'description' => '25 ft heavy-duty tape measure with auto-lock, fraction markings and magnetic hook.',
                'price' => 11.99,
                'quantity' => 65,
                'status' => 'active',
            ],
            [
                'name' => 'Tool Box',
                'sku' => 'HW-BOX-010',
                'description' => '19-inch plastic portable toolbox with removable interior tray and double metal latches.',
                'price' => 28.75,
                'quantity' => 20,
                'status' => 'active',
            ],
        ];

        foreach ($products as $productData) {
            Product::updateOrCreate(
                ['sku' => $productData['sku']],
                $productData
            );
        }
    }
}
