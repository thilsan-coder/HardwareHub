<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('type', ['in', 'out', 'adjustment', 'damage'])->default('in');
            $table->integer('quantity_changed'); // e.g. +20, -5
            $table->integer('previous_stock');
            $table->integer('new_stock');
            $table->string('reason')->nullable(); // e.g. "Supplier Restock #102", "Counter Sale", "Inventory Count Audit"
            $table->timestamps();

            $table->index(['product_id', 'created_at']);
            $table->index('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};
