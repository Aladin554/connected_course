<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WelcomeSlide extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'title',
        'body_content',
        'slide_order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'slide_order' => 'integer',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
