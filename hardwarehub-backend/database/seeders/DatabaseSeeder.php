<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Default HardwareHub Admin User
        User::updateOrCreate(
            ['email' => 'admin@hardwarehub.com'],
            [
                'name' => 'HardwareHub Admin',
                'email' => 'admin@hardwarehub.com',
                'password' => Hash::make('password'),
            ]
        );

        // Hardware Products
        $this->call([
            ProductSeeder::class,
        ]);
    }
}
