<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\AdminIpAccessService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;

class AuthController extends Controller
{
    public function __construct(private readonly AdminIpAccessService $adminIpAccess)
    {
    }

    // LOGIN
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        if ((int) $user->report_status === 3) {
            return response()->json([
                'message' => 'Your account is inactive.',
                'force_logout' => true,
            ], 403);
        }

        if ($user->role_id === 3 && $user->account_expires_at && $user->account_expires_at->isPast()) {
            return response()->json([
                'message' => 'Your 72-hour access has expired. Contact administrator.',
                'expired_at' => $user->account_expires_at->toDateTimeString(),
                'force_logout' => true,
            ], 403);
        }

        if ($this->adminIpAccess->shouldRestrictUser($user)) {
            $clientIp = $this->adminIpAccess->getClientIp($request);

            if (!$this->adminIpAccess->shouldBypassChecks($clientIp) && !$this->adminIpAccess->isAllowed($clientIp)) {
                return response()->json([
                    'message' => 'Access denied. This IP is not allowed for admin accounts.',
                    'your_ip' => $clientIp,
                ], 403);
            }
        }

        if ($user->role_id === 3 && is_null($user->account_expires_at)) {
            $user->account_expires_at = now()->addHours(72);
            $user->save();
        }

        $user->last_login_at = now();
        $user->save();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'access_token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role_id' => $user->role_id,
                'panel_status' => (bool) $user->panel_status,
                'report_status' => (int) $user->report_status,
                'last_login_at' => $user->last_login_at->toDateTimeString(),
                'account_expires_at' => $user->role_id === 3 ? $user->account_expires_at?->toDateTimeString() : null,
            ],
        ]);
    }

    // LOGOUT
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    // FORGOT PASSWORD (SPA-friendly: always returns success)
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        Password::sendResetLink($request->only('email'));

        return response()->json([
            'message' => 'Password reset link has been sent.',
        ]);
    }

    // RESET PASSWORD
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required',
            'password' => 'required|min:6|confirmed',
        ]);

        $record = DB::table('password_reset_tokens')->where('email', $request->email)->first();

        if (!$record) {
            return response()->json(['message' => 'Invalid or expired link'], 400);
        }

        $user = User::where('email', $request->email)->first();
        $user->password = Hash::make($request->password);
        $user->save();

        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json(['message' => 'Password reset successful']);
    }
}
