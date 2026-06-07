<?php

namespace App\Http\Middleware;

use App\Services\AdminIpAccessService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class RestrictAdminIp
{
    public function __construct(private readonly AdminIpAccessService $adminIpAccess)
    {
    }

    public function handle(Request $request, Closure $next): Response
    {
        $ip = $this->adminIpAccess->getClientIp($request);

        if ($this->adminIpAccess->shouldBypassChecks($ip)) {
            return $next($request);
        }

        $user = $request->user();

        if ($this->adminIpAccess->shouldRestrictUser($user) && !$this->adminIpAccess->isAllowed($ip)) {
            $request->user()?->currentAccessToken()?->delete();

            Log::warning('Blocked admin access from unauthorized IP', [
                'user_id' => $user?->id,
                'email' => $user?->email,
                'ip' => $ip,
            ]);

            return response()->json([
                'message' => 'Access denied. This IP is not allowed for admin accounts.',
                'your_ip' => $ip,
                'force_logout' => true,
            ], 403);
        }

        return $next($request);
    }
}
