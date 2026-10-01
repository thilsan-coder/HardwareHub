<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockMovement extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'user_id',
        'type', // 'in', 'out', 'adjustment', 'damage'
        'quantity_changed',
        'previous_stock',
        'new_stock',
        'reason',
    ];

    protected $casts = [
        'quantity_changed' => 'integer',
        'previous_stock' => 'integer',
        'new_stock' => 'integer',
        'created_at' => 'datetime',
    ];

    /**
     * Associated product.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class)->withTrashed();
    }

    /**
     * User / Administrator who initiated the stock change.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
