<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LessonCommonMistake extends Model
{
    use HasFactory;

    protected $fillable = [
        'lesson_id',
        'content',
        'sort_order',
    ];

    protected $casts = [
        'sort_order' => 'integer',
    ];

    public function lesson()
    {
        return $this->belongsTo(Lesson::class);
    }
}
