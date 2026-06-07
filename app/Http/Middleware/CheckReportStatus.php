<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckReportStatus
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return $next($request);
        }
        // 2. FIXED 72-HOUR ACCOUNT EXPIRY FOR NORMAL USERS (role_id = 3)
        // This is now based on account_expires_at (set only on first login)
        if ($user->role_id === 3) {
            if ($user->account_expires_at && $user->account_expires_at->isPast()) {
                $this->revokeToken($request);

                return response()->json([
                    'message'       => 'Your 72-hour access has permanently expired.',
                    'expired_at'    => $user->account_expires_at->toDateTimeString(),
                    'force_logout'  => true,
                    'contact_admin' => true
                ], 403);
            }
        }

        // Super Admin (1) and Admin (2) → no restrictions at all
        return $next($request);
    }

    /**
     * Safely revoke current token
     */
    private function revokeToken(Request $request): void
    {
        if ($request->user()?->currentAccessToken()) {
            $request->user()->currentAccessToken()->delete();
        }
    }
}