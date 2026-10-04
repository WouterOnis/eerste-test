<?php

// Bucket visibility is configured by Laravel Cloud; do not send public object ACLs.
$disks = [];
foreach (['private', 'public'] as $visibility) {
    $prefix = 'HL_UPLOADS_'.strtoupper($visibility).'_';
    $disks[$visibility] = [
        'driver' => 's3', 'key' => env($prefix.'KEY'), 'secret' => env($prefix.'SECRET'),
        'region' => env($prefix.'REGION', 'auto'), 'bucket' => env($prefix.'BUCKET'),
        'endpoint' => env($prefix.'ENDPOINT'), 'url' => env($prefix.'URL'),
        'use_path_style_endpoint' => false, 'throw' => true,
    ];
}

return $disks;
