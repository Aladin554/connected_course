<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\JsonResponse;
use App\Mail\NewUserCredentialsMail;
use Illuminate\Support\Facades\Mail;

class UserController extends Controller
{
    // --- Helper Methods ---

    protected function authUser(): User
    {
        return Auth::user();
    }

    protected function isAdmin(): bool
    {
        return $this->authUser()->role->name === 'admin';
    }

    protected function isSuperAdmin(): bool
    {
        return $this->authUser()->role->name === 'superadmin';
    }

    protected function canManage(User $user): bool
    {
        if ($this->isSuperAdmin()) return true;
        if ($this->isAdmin() && $user->role->name === 'user') return true;
        return false;
    }

    protected function filterUsersForAuth()
    {
        if ($this->isSuperAdmin()) {
            return User::with(['role', 'categories', 'adminCategories', 'adminFrontendCategories']);
        }

        if ($this->isAdmin()) {
            return User::with(['role', 'categories'])->whereHas('role', fn($q) => $q->where('name', 'user'));
        }

        return User::whereRaw('0 = 1');
    }

    protected function syncCategories(User $user, array $categoryIds): void
    {
        $syncData = [];

        foreach (array_unique($categoryIds) as $categoryId) {
            $syncData[$categoryId] = ['enrolled_at' => now()];
        }

        $user->categories()->sync($syncData);
    }

    protected function syncAdminCategories(User $user, array $categoryIds): void
    {
        $user->adminCategories()->sync(array_unique($categoryIds));
    }

    protected function syncAdminFrontendCategories(User $user, array $categoryIds): void
    {
        $user->adminFrontendCategories()->sync(array_unique($categoryIds));
    }

    // --- Centralized Validation Rules ---
    protected function validationRules(bool $isUpdate = false, int $userId = 0): array
    {
        return [
            'first_name' => $isUpdate ? 'sometimes|string|max:255' : 'required|string|max:255',
            'last_name'  => $isUpdate ? 'sometimes|string|max:255' : 'required|string|max:255',
            'email'      => $isUpdate
                                ? 'sometimes|email|unique:users,email,' . $userId
                                : 'required|email|unique:users,email',
            'password'   => $isUpdate ? 'sometimes|min:6' : 'required|min:6',
            'role_id'    => $isUpdate ? 'sometimes|exists:roles,id' : 'required|exists:roles,id',
            'max_cards'  => 'sometimes|nullable|integer|min:0', // NEW
            'category_ids' => 'sometimes|array',
            'category_ids.*' => 'integer|exists:categories,id',
            'admin_category_ids' => 'sometimes|array',
            'admin_category_ids.*' => 'integer|exists:categories,id',
            'admin_frontend_category_ids' => 'sometimes|array',
            'admin_frontend_category_ids.*' => 'integer|exists:categories,id',
            'can_add_courses' => 'sometimes|boolean',
            'can_edit_courses' => 'sometimes|boolean',
            'allowed_ips' => $isUpdate ? 'sometimes|array' : 'nullable|array',
            'allowed_ips.*' => 'nullable|ip',
        ];
    }

    protected function sanitizeAllowedIps($value): array
    {
        if (!is_array($value)) {
            return [];
        }

        return array_values(array_unique(array_filter(array_map(static function ($ip) {
            return trim((string) $ip);
        }, $value))));
    }

    // --- User Listing ---
    public function index(): JsonResponse
    {
        $users = $this->filterUsersForAuth()->get();
        return response()->json($users);
    }

    // --- Create User ---
    public function store(Request $request): JsonResponse
    {
        $request->validate($this->validationRules());

        $role = Role::find($request->role_id);
        if ($this->isAdmin() && $role->name !== 'user') {
            return response()->json(['message' => 'Admins can only create users'], 403);
        }

        if (!$this->isSuperAdmin() && $request->has('allowed_ips')) {
            return response()->json(['message' => 'Only superadmin can assign IP allowlist'], 403);
        }

        if (!$this->isSuperAdmin() && $request->has('admin_category_ids')) {
            return response()->json(['message' => 'Only superadmin can assign admin course access'], 403);
        }

        if (!$this->isSuperAdmin() && $request->has('admin_frontend_category_ids')) {
            return response()->json(['message' => 'Only superadmin can assign frontend course access'], 403);
        }

        if (!$this->isSuperAdmin() && ($request->has('can_add_courses') || $request->has('can_edit_courses'))) {
            return response()->json(['message' => 'Only superadmin can assign course permissions'], 403);
        }

        try {
            $plainPassword = $request->password;

            // Only superadmin can assign max_cards
            $maxCards = $this->isSuperAdmin() ? $request->max_cards : null;

            $user = User::create([
                'first_name' => $request->first_name,
                'last_name'  => $request->last_name,
                'email'      => $request->email,
                'role_id'    => $request->role_id,
                'password'   => Hash::make($plainPassword),
                'max_cards'  => $maxCards, // NEW
                'allowed_ips' => $this->isSuperAdmin()
                    ? $this->sanitizeAllowedIps($request->input('allowed_ips', []))
                    : [],
                'can_add_courses' => $role->name === 'admin' && $this->isSuperAdmin()
                    ? (int) filter_var($request->input('can_add_courses', false), FILTER_VALIDATE_BOOLEAN)
                    : 0,
                'can_edit_courses' => $role->name === 'admin' && $this->isSuperAdmin()
                    ? (int) filter_var($request->input('can_edit_courses', true), FILTER_VALIDATE_BOOLEAN)
                    : 0,
            ]);

            $this->syncCategories($user, $request->input('category_ids', []));

            if ($role->name === 'admin' && $this->isSuperAdmin()) {
                $this->syncAdminCategories($user, $request->input('admin_category_ids', []));
                $this->syncAdminFrontendCategories($user, $request->input('admin_frontend_category_ids', []));
            }

            $token = app('auth.password.broker')->createToken($user);

            $resetUrl = env('FRONTEND_URL') . '/reset-password?token=' . $token . '&email=' . urlencode($user->email);

            Mail::to($user->email)->send(
                new NewUserCredentialsMail($user, $plainPassword, $resetUrl)
            );

            return response()->json([
                'message' => 'User created & email sent successfully',
                'user'    => $user->load(['role', 'categories', 'adminCategories', 'adminFrontendCategories']),
            ], 201);

        } catch (\Exception $e) {
            Log::error($e->getMessage());
            return response()->json(['message' => 'Server Error', 'error' => $e->getMessage()], 500);
        }
    }

    // --- Show Single User ---
    public function show(int $id): JsonResponse
    {
        $user = User::with(['role', 'categories', 'adminCategories', 'adminFrontendCategories'])->find($id);

        if (!$user) return response()->json(['message' => 'User not found'], 404);
        if (!$this->canManage($user)) return response()->json(['message' => 'Forbidden'], 403);

        return response()->json($user);
    }

    // --- Update User ---
    public function update(Request $request, int $id): JsonResponse
    {
        $user = User::find($id);
        if (!$user) return response()->json(['message' => 'User not found'], 404);
        if (!$this->canManage($user)) return response()->json(['message' => 'Forbidden'], 403);

        if (!$this->isSuperAdmin() && $request->has('allowed_ips')) {
            return response()->json(['message' => 'Only superadmin can assign IP allowlist'], 403);
        }

        if (!$this->isSuperAdmin() && $request->has('admin_category_ids')) {
            return response()->json(['message' => 'Only superadmin can assign admin course access'], 403);
        }

        if (!$this->isSuperAdmin() && $request->has('admin_frontend_category_ids')) {
            return response()->json(['message' => 'Only superadmin can assign frontend course access'], 403);
        }

        if (!$this->isSuperAdmin() && ($request->has('can_add_courses') || $request->has('can_edit_courses'))) {
            return response()->json(['message' => 'Only superadmin can assign course permissions'], 403);
        }

        $request->validate($this->validationRules(true, $id));

        if ($request->role_id) {
            $role = Role::find($request->role_id);
            if ($this->isAdmin() && $role->name !== 'user') {
                return response()->json(['message' => 'Admins can only assign user role'], 403);
            }
        }

        $user->first_name = $request->first_name ?? $user->first_name;
        $user->last_name  = $request->last_name ?? $user->last_name;
        $user->email      = $request->email ?? $user->email;
        $user->role_id    = $request->role_id ?? $user->role_id;

        if ($request->password) {
            $user->password = Hash::make($request->password);
        }

        // Only superadmin can update max_cards
        if ($this->isSuperAdmin() && $request->has('max_cards')) {
            $user->max_cards = $request->max_cards;
        }

        if ($this->isSuperAdmin() && $request->has('allowed_ips')) {
            $user->allowed_ips = $this->sanitizeAllowedIps($request->input('allowed_ips', []));
        }

        try {
            $user->save();
            if ($request->has('category_ids')) {
                $this->syncCategories($user, $request->input('category_ids', []));
            }

            $user->load('role');
            if ($this->isSuperAdmin()) {
                if ($user->role->name === 'admin') {
                    if ($request->has('admin_category_ids')) {
                        $this->syncAdminCategories($user, $request->input('admin_category_ids', []));
                    }
                    if ($request->has('admin_frontend_category_ids')) {
                        $this->syncAdminFrontendCategories($user, $request->input('admin_frontend_category_ids', []));
                    }
                    if ($request->has('can_add_courses')) {
                        $user->can_add_courses = (int) filter_var($request->can_add_courses, FILTER_VALIDATE_BOOLEAN);
                    }
                    if ($request->has('can_edit_courses')) {
                        $user->can_edit_courses = (int) filter_var($request->can_edit_courses, FILTER_VALIDATE_BOOLEAN);
                    }
                    $user->save();
                } else {
                    $user->adminCategories()->detach();
                    $user->adminFrontendCategories()->detach();
                    $user->can_add_courses = 0;
                    $user->can_edit_courses = 0;
                    $user->save();
                }
            }

            return response()->json([
                'message' => 'User updated successfully',
                'user'    => $user->load(['role', 'categories', 'adminCategories', 'adminFrontendCategories']),
            ]);
        } catch (\Exception $e) {
            Log::error($e->getMessage());
            return response()->json(['message' => 'Server Error', 'error' => $e->getMessage()], 500);
        }
    }

    // --- Delete User ---
    public function destroy(int $id): JsonResponse
    {
        $user = User::find($id);
        if (!$user) return response()->json(['message' => 'User not found'], 404);
        if (!$this->canManage($user)) return response()->json(['message' => 'Forbidden'], 403);

        try {
            $user->delete();
            return response()->json(['message' => 'User deleted successfully']);
        } catch (\Exception $e) {
            Log::error($e->getMessage());
            return response()->json(['message' => 'Server Error', 'error' => $e->getMessage()], 500);
        }
    }

    // --- Authenticated User Profile ---
    public function showProfile(): JsonResponse
    {
        return response()->json($this->authUser()->load(['role', 'adminCategories', 'adminFrontendCategories']));
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $this->authUser();

        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name'  => 'required|string|max:255',
            'email'      => 'required|email|unique:users,email,' . $user->id,
            'password'   => 'nullable|string|min:6',
        ]);

        $user->first_name = $request->first_name;
        $user->last_name  = $request->last_name;
        $user->email      = $request->email;

        if (!empty($request->password)) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully',
            'user'    => $user,
        ]);
    }

    public function toggleDataRange(int $id): JsonResponse
{
    $user = User::findOrFail($id);
    $user->data_range = (int)$user->data_range === 1 ? 0 : 1;
    $user->save();

    return response()->json([
        'message' => 'Data range updated',
        'data_range' => $user->data_range
    ]);
}

public function togglePermission(int $id): JsonResponse
{
    $user = User::find($id);
    if (!$user) return response()->json(['message' => 'User not found'], 404);

    if (!$this->canManage($user)) return response()->json(['message' => 'Forbidden'], 403);

    $user->can_create_users = (int)$user->can_create_users === 1 ? 0 : 1;

    try {
        $user->save();
        return response()->json([
            'message' => 'Permission updated',
            'can_create_users' => $user->can_create_users
        ]);
    } catch (\Exception $e) {
        Log::error($e->getMessage());
        return response()->json(['message' => 'Server Error', 'error' => $e->getMessage()], 500);
    }
}

public function togglePanelStatus(int $id): JsonResponse
{
    // Find the user by ID or fail
    $user = User::findOrFail($id);

    // Toggle panel_status (0 → 1, 1 → 0)
    $user->panel_status = $user->panel_status ? 0 : 1;
    $user->save();

    // Return JSON response
    return response()->json([
        'message' => 'Panel status updated',
        'panel_status' => $user->panel_status,
    ]);
}


}
