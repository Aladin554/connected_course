<?php

$parseCsv = static function (?string $value): array {
    if (!is_string($value) || trim($value) === '') {
        return [];
    }

    $items = [];

    foreach (explode(',', $value) as $part) {
        $part = trim($part);
        if ($part !== '') {
            $items[] = $part;
        }
    }

    return array_values(array_unique($items));
};

$parseBool = static function (mixed $value, bool $default = false): bool {
    if (is_bool($value)) {
        return $value;
    }

    if (is_int($value)) {
        return $value === 1;
    }

    if (!is_string($value) || trim($value) === '') {
        return $default;
    }

    return in_array(strtolower(trim($value)), ['1', 'true', 'yes', 'on'], true);
};

$restrictedRoleIds = array_map('intval', $parseCsv(env('ADMIN_IP_RESTRICTED_ROLE_IDS', '2')));
$restrictedRoleIds = array_values(array_filter($restrictedRoleIds, static fn (int $id): bool => $id > 0));

return [
    'restricted_role_ids' => $restrictedRoleIds,
    'allowed_ips' => $parseCsv(env('ADMIN_ALLOWED_IPS', '')),
    'bypass_local_environment' => $parseBool(env('ADMIN_IP_BYPASS_LOCAL', 'false')),
    'bypass_loopback_ips' => $parseBool(env('ADMIN_IP_BYPASS_LOOPBACK', 'false')),
];
