<?php

namespace App\Http\Controllers;

use App\Models\AdminAllowedIp;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminAllowedIpController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        if ($unauthorized = $this->ensureSuperAdmin($request)) {
            return $unauthorized;
        }

        $rows = AdminAllowedIp::query()
            ->orderByDesc('is_active')
            ->orderBy('ip')
            ->get();

        return response()->json($rows);
    }

    public function store(Request $request): JsonResponse
    {
        if ($unauthorized = $this->ensureSuperAdmin($request)) {
            return $unauthorized;
        }

        $validated = $this->validatePayload($request);
        $validated['ip'] = trim($validated['ip']);
        $validated['is_active'] = array_key_exists('is_active', $validated)
            ? (bool) $validated['is_active']
            : true;

        $row = AdminAllowedIp::create($validated);

        return response()->json([
            'message' => 'Admin allowed IP added successfully.',
            'data' => $row,
        ], 201);
    }

    public function show(Request $request, AdminAllowedIp $adminAllowedIp): JsonResponse
    {
        if ($unauthorized = $this->ensureSuperAdmin($request)) {
            return $unauthorized;
        }

        return response()->json($adminAllowedIp);
    }

    public function update(Request $request, AdminAllowedIp $adminAllowedIp): JsonResponse
    {
        if ($unauthorized = $this->ensureSuperAdmin($request)) {
            return $unauthorized;
        }

        $validated = $this->validatePayload($request, $adminAllowedIp->id);
        if (array_key_exists('ip', $validated)) {
            $validated['ip'] = trim($validated['ip']);
        }

        $adminAllowedIp->update($validated);

        return response()->json([
            'message' => 'Admin allowed IP updated successfully.',
            'data' => $adminAllowedIp->fresh(),
        ]);
    }

    public function destroy(Request $request, AdminAllowedIp $adminAllowedIp): JsonResponse
    {
        if ($unauthorized = $this->ensureSuperAdmin($request)) {
            return $unauthorized;
        }

        $adminAllowedIp->delete();

        return response()->json([
            'message' => 'Admin allowed IP deleted successfully.',
        ]);
    }

    private function validatePayload(Request $request, ?int $ignoreId = null): array
    {
        return $request->validate([
            'ip' => [
                $ignoreId ? 'sometimes' : 'required',
                'string',
                'max:64',
                Rule::unique('admin_allowed_ips', 'ip')->ignore($ignoreId),
                function (string $attribute, mixed $value, \Closure $fail): void {
                    if (!is_string($value) || !$this->isValidIpOrCidr(trim($value))) {
                        $fail('The ' . $attribute . ' must be a valid IP or CIDR value.');
                    }
                },
            ],
            'description' => ['nullable', 'string', 'max:255'],
            'is_active' => ['sometimes', 'boolean'],
        ]);
    }

    private function ensureSuperAdmin(Request $request): ?JsonResponse
    {
        $user = $request->user();
        $user?->loadMissing('role');

        $isSuperAdmin = (int) ($user?->role_id ?? 0) === 1
            || $user?->role?->name === 'superadmin';

        if ($isSuperAdmin) {
            return null;
        }

        return response()->json([
            'message' => 'Forbidden. Only superadmin can manage allowed IPs.',
        ], 403);
    }

    private function isValidIpOrCidr(string $value): bool
    {
        if (filter_var($value, FILTER_VALIDATE_IP)) {
            return true;
        }

        if (!str_contains($value, '/')) {
            return false;
        }

        [$subnet, $prefix] = explode('/', $value, 2);

        if (!filter_var($subnet, FILTER_VALIDATE_IP) || !is_numeric($prefix)) {
            return false;
        }

        $prefix = (int) $prefix;
        $maxPrefix = str_contains($subnet, ':') ? 128 : 32;

        return $prefix >= 0 && $prefix <= $maxPrefix;
    }
}
