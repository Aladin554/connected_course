<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LessonModelAnswer extends Model
{
    use HasFactory;

    protected $fillable = [
        'lesson_id',
        'content',
    ];

    public function lesson()
    {
        return $this->belongsTo(Lesson::class);
    }
}
