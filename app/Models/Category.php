<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'flag_emoji',
        'description',
        'thumbnail_image',
        'background_color',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function welcomeSlides()
    {
        return $this->hasMany(WelcomeSlide::class)->where('is_active', true)->orderBy('created_at')->orderBy('id');
    }

    public function allWelcomeSlides()
    {
        return $this->hasMany(WelcomeSlide::class)->orderBy('created_at')->orderBy('id');
    }

    public function courseModules()
    {
        return $this->hasMany(CourseModule::class)->where('is_active', true)->orderBy('created_at')->orderBy('id');
    }

    public function allCourseModules()
    {
        return $this->hasMany(CourseModule::class)->orderBy('created_at')->orderBy('id');
    }

    public function userCategoryEnrollments()
    {
        return $this->hasMany(UserCategoryEnrollment::class);
    }
}
