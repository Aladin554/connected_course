<?php

namespace App\Services;

use App\Models\AdminAllowedIp;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Throwable;

class AdminIpAccessService
{
    public function getClientIp(Request $request): string
    {
        $candidates = [
            $request->header('CF-Connecting-IP'),
            $this->extractForwardedForIp($request->header('X-Forwarded-For')),
            $request->header('X-Real-IP'),
            $request->ip(),
        ];

        foreach ($candidates as $candidate) {
            $ip = $this->sanitizeIp($candidate);
            if ($ip !== null) {
                return $ip;
            }
        }

        return '0.0.0.0';
    }

    public function shouldRestrictUser(?User $user): bool
    {
        if (!$user) {
            return false;
        }

        return in_array((int) $user->role_id, $this->restrictedRoleIds(), true);
    }

    public function isBypassIp(string $ip): bool
    {
        if (!(bool) config('admin_security.bypass_loopback_ips', false)) {
            return false;
        }

        return in_array($ip, ['127.0.0.1', '::1'], true);
    }

    public function shouldBypassChecks(string $ip): bool
    {
        if ($this->shouldBypassInLocalEnvironment()) {
            return true;
        }

        return $this->isBypassIp($ip);
    }

    public function shouldBypassInLocalEnvironment(): bool
    {
        return app()->environment('local')
            && (bool) config('admin_security.bypass_local_environment', false);
    }

    public function isAllowed(string $clientIp): bool
    {
        $entries = $this->allowedEntries();

        // If no active IP rules are configured, do not block login/access.
        if ($entries === []) {
            return true;
        }

        if (!filter_var($clientIp, FILTER_VALIDATE_IP)) {
            return false;
        }

        foreach ($entries as $entry) {
            if ($this->ipMatchesEntry($clientIp, $entry)) {
                return true;
            }
        }

        return false;
    }

    public function allowedEntries(): array
    {
        $fromDatabase = $this->allowedEntriesFromDatabase();
        if ($fromDatabase !== null) {
            return $fromDatabase;
        }

        $configEntries = config('admin_security.allowed_ips', []);

        if (is_string($configEntries)) {
            $configEntries = explode(',', $configEntries);
        }

        if (!is_array($configEntries)) {
            return [];
        }

        return $this->sanitizeEntries($configEntries);
    }

    private function allowedEntriesFromDatabase(): ?array
    {
        try {
            if (!Schema::hasTable('admin_allowed_ips')) {
                return null;
            }

            $entries = AdminAllowedIp::query()
                ->where('is_active', true)
                ->pluck('ip')
                ->all();

            return $this->sanitizeEntries($entries);
        } catch (Throwable) {
            return null;
        }
    }

    private function restrictedRoleIds(): array
    {
        $roleIds = config('admin_security.restricted_role_ids', [2]);

        if (is_string($roleIds)) {
            $roleIds = explode(',', $roleIds);
        }

        if (!is_array($roleIds)) {
            return [2];
        }

        $normalized = array_map(static fn ($id) => (int) $id, $roleIds);
        $normalized = array_filter($normalized, static fn (int $id): bool => $id > 0);

        return array_values(array_unique($normalized));
    }

    private function extractForwardedForIp(?string $header): ?string
    {
        if (!$header) {
            return null;
        }

        $parts = explode(',', $header);
        return trim($parts[0]);
    }

    private function sanitizeEntries(array $entries): array
    {
        $clean = [];

        foreach ($entries as $entry) {
            if (!is_string($entry)) {
                continue;
            }

            $entry = trim($entry);
            if ($entry === '') {
                continue;
            }

            if ($this->isValidEntry($entry)) {
                $clean[] = $entry;
            }
        }

        return array_values(array_unique($clean));
    }

    private function sanitizeIp(?string $ip): ?string
    {
        if (!is_string($ip)) {
            return null;
        }

        $ip = trim($ip);

        // Handle values like "203.0.113.9:443" from some proxies.
        if (str_contains($ip, '.') && substr_count($ip, ':') === 1) {
            [$host, $port] = explode(':', $ip, 2);
            if (ctype_digit($port)) {
                $ip = $host;
            }
        }

        // Handle bracketed IPv6 forms like "[2001:db8::1]:443".
        if (preg_match('/^\[([0-9a-fA-F:]+)\](?::\d+)?$/', $ip, $matches) === 1) {
            $ip = $matches[1];
        }

        if ($ip === '' || !filter_var($ip, FILTER_VALIDATE_IP)) {
            return null;
        }

        return $ip;
    }

    private function isValidEntry(string $entry): bool
    {
        if (filter_var($entry, FILTER_VALIDATE_IP)) {
            return true;
        }

        return $this->isValidCidr($entry);
    }

    private function ipMatchesEntry(string $ip, string $entry): bool
    {
        if ($ip === $entry) {
            return true;
        }

        if (!str_contains($entry, '/')) {
            return false;
        }

        return $this->ipInCidr($ip, $entry);
    }

    private function isValidCidr(string $cidr): bool
    {
        if (!str_contains($cidr, '/')) {
            return false;
        }

        [$subnet, $prefix] = explode('/', $cidr, 2);

        if (!is_numeric($prefix) || !filter_var($subnet, FILTER_VALIDATE_IP)) {
            return false;
        }

        $prefix = (int) $prefix;
        $maxPrefix = str_contains($subnet, ':') ? 128 : 32;

        return $prefix >= 0 && $prefix <= $maxPrefix;
    }

    private function ipInCidr(string $ip, string $cidr): bool
    {
        if (!$this->isValidCidr($cidr)) {
            return false;
        }

        [$subnet, $prefix] = explode('/', $cidr, 2);
        $prefix = (int) $prefix;

        $ipBinary = @inet_pton($ip);
        $subnetBinary = @inet_pton($subnet);

        if ($ipBinary === false || $subnetBinary === false) {
            return false;
        }

        if (strlen($ipBinary) !== strlen($subnetBinary)) {
            return false;
        }

        $fullBytes = intdiv($prefix, 8);
        $remainingBits = $prefix % 8;

        if ($fullBytes > 0 && substr($ipBinary, 0, $fullBytes) !== substr($subnetBinary, 0, $fullBytes)) {
            return false;
        }

        if ($remainingBits === 0) {
            return true;
        }

        $mask = (0xFF << (8 - $remainingBits)) & 0xFF;
        $ipByte = ord($ipBinary[$fullBytes]);
        $subnetByte = ord($subnetBinary[$fullBytes]);

        return ($ipByte & $mask) === ($subnetByte & $mask);
    }
}
