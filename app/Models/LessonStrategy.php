<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LessonStrategy extends Model
{
    use HasFactory;

    protected $fillable = [
        'lesson_id',
        'step_number',
        'content',
    ];

    protected $casts = [
        'step_number' => 'integer',
    ];

    public function lesson()
    {
        return $this->belongsTo(Lesson::class);
    }
}
