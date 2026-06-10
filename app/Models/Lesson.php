<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lesson extends Model
{
    use HasFactory;

    protected $fillable = [
        'module_id',
        'title',
        'duration_mins',
        'video_type',
        'video_value',
        'video_thumbnail',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'duration_mins' => 'integer',
        'sort_order' => 'integer',
        'is_active' => 'boolean',
    ];

    public function module()
    {
        return $this->belongsTo(CourseModule::class, 'module_id');
    }

    public function lessonModelAnswer()
    {
        return $this->hasOne(LessonModelAnswer::class);
    }

    public function strategies()
    {
        return $this->hasMany(LessonStrategy::class)->orderBy('step_number');
    }

    public function commonMistakes()
    {
        return $this->hasMany(LessonCommonMistake::class)->orderBy('created_at')->orderBy('id');
    }

    public function userLessonProgress()
    {
        return $this->hasMany(UserLessonProgress::class);
    }
}
