<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdminAllowedIp extends Model
{
    protected $fillable = [
        'ip',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
