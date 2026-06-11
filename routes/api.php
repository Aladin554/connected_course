<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\LearningContentController;

// ==================================================================
// 1. PUBLIC ROUTES – No auth, no IP restriction
// ==================================================================
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);
Route::get('/storage/{path}', function (string $path) {
    $root = realpath(storage_path('app/public'));
    $file = realpath($root.DIRECTORY_SEPARATOR.str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $path));

    abort_unless(
        $root
        && $file
        && str_starts_with($file, $root.DIRECTORY_SEPARATOR)
        && is_file($file),
        404
    );

    return response()->file($file);
})->where('path', '.*');

// ==================================================================
// 2. AUTHENTICATED ROUTES – Require login
// ==================================================================
Route::middleware(['auth:sanctum'])->group(function () {

    // Current logged-in user
    Route::get('/user', fn(Request $request) => $request->user());

    Route::get('/profile', [UserController::class, 'showProfile']);
    Route::put('/profile', [UserController::class, 'updateProfile']);
    // Logout
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/my-categories', [CategoryController::class, 'myCategories']);
    Route::get('/home-summary', [CategoryController::class, 'homeSummary']);
    Route::get('/categories/{category}/welcome-slides', [CategoryController::class, 'welcomeSlides']);
    Route::get('/categories/{category}/modules', [LearningContentController::class, 'categoryModules']);
    Route::get('/categories/{category}/progress', [LearningContentController::class, 'categoryProgress']);
    Route::get('/modules/{module}/lessons', [LearningContentController::class, 'moduleLessons']);
    Route::get('/lessons/{lesson}', [LearningContentController::class, 'lessonDetail']);
    Route::post('/lessons/{lesson}/complete', [LearningContentController::class, 'completeLesson']);

});

// ==================================================================
// 3. ADMIN-ONLY ROUTES – Require login + IP whitelisting
// These are the dangerous ones: user management, roles, industries, departments, etc.
// ==================================================================
Route::middleware(['auth:sanctum', 'admin.ip'])->group(function () {

    // User Management (list, create, update, delete users)
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
    Route::patch('/users/{id}/toggle-data-range', [UserController::class, 'toggleDataRange']);
    Route::patch('/users/{id}/toggle-permission', [UserController::class, 'togglePermission']);
    Route::patch('/users/{user}/toggle-panel-status', [UserController::class, 'togglePanelStatus']);

    // Roles
    Route::get('/roles', [RoleController::class, 'index']);
    Route::get('/show-ip', fn (Request $request) => $request->ip());

    // Learning categories
    Route::get('/categories/active', [CategoryController::class, 'active']);
    Route::apiResource('/categories', CategoryController::class);
    Route::post('/categories/{category}/modules', [LearningContentController::class, 'storeModule']);
    Route::put('/modules/{module}', [LearningContentController::class, 'updateModule']);
    Route::delete('/modules/{module}', [LearningContentController::class, 'destroyModule']);
    Route::post('/modules/{module}/lessons', [LearningContentController::class, 'storeLesson']);
    Route::put('/lessons/{lesson}', [LearningContentController::class, 'updateLesson']);
    Route::delete('/lessons/{lesson}', [LearningContentController::class, 'destroyLesson']);

});
Route::get('/show-ip', function (Request $request) {
    return response()->json([
        'your_ip' => $request->ip(),
        'remote_addr' => $_SERVER['REMOTE_ADDR'] ?? null,
        'x_forwarded_for' => $request->header('X-Forwarded-For'),
        'cf_connecting_ip' => $request->header('CF-Connecting-IP'),
    ]);
});
