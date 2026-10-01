<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'sku',
        'description',
        'category',
        'price',
        'quantity',
        'low_stock_threshold',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'quantity' => 'integer',
            'low_stock_threshold' => 'integer',
        ];
    }

    /**
     * Stock movements history for this product.
     */
    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class)->latest();
    }
}
