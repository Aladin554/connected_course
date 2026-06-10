<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CourseModule extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'title',
        'subtitle',
        'description',
        'icon_emoji',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function lessons()
    {
        return $this->hasMany(Lesson::class, 'module_id')->where('is_active', true)->orderBy('created_at')->orderBy('id');
    }

    public function allLessons()
    {
        return $this->hasMany(Lesson::class, 'module_id')->orderBy('created_at')->orderBy('id');
    }

    public function userModuleProgress()
    {
        return $this->hasMany(UserModuleProgress::class);
    }
}
