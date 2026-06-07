<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Laravel\Sanctum\HasApiTokens;
use Laravel\Sanctum\NewAccessToken;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;
use App\Notifications\CustomResetPassword;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'password',
        'role_id',
        'panel_status',
        'video_status',
        'report_status',
        'report_notification',
        'last_login_at',
        'max_cards',
        'data_range',
        'can_create_users',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'last_login_at'     => 'datetime',
        'account_expires_at' => 'datetime',
        'email_verified_at' => 'datetime',
        'report_status'     => 'integer',
        'role_id'           => 'integer',
        'panel_status'           => 'integer',
        'video_status'           => 'integer',
        'data_range' => 'integer',
        'can_create_users' => 'integer',
    ];

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function industries()
    {
        return $this->belongsToMany(Industry::class, 'user_industries', 'user_id', 'industry_id')
                    ->withTimestamps();
    }

    // CORRECT createToken() for Laravel 12 + Sanctum 4
    public function createToken(string $name = 'auth_token', array $abilities = ['*']): NewAccessToken
    {
        $plainTextToken = Str::random(40);

        $expiresAt = $this->role_id === 3 ? now()->addHours(72) : null;

        $token = $this->tokens()->create([
            'name'       => $name,
            'token'      => hash('sha256', $plainTextToken),
            'abilities'  => $abilities,
            'expires_at' => $expiresAt,
        ]);

        return new NewAccessToken($token, $token->id . '|' . $plainTextToken);
    }

    public function sendPasswordResetNotification($token)
    {
        $this->notify(new CustomResetPassword($token));
    }
}