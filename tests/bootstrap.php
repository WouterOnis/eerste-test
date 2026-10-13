<?php

require dirname(__DIR__).'/vendor/autoload.php';

Dotenv\Dotenv::createImmutable(dirname(__DIR__))->safeLoad();

// Override all inherited preview connection settings before Laravel boots.
$connection = ['DB_CONNECTION' => 'mysql', 'DB_URL' => ''];
foreach (['HOST', 'PORT', 'DATABASE', 'USERNAME', 'PASSWORD'] as $key) {
    $value = $_ENV['TEST_DB_'.$key] ?? getenv('TEST_DB_'.$key);
    if ($value === false || $value === '') {
        throw new RuntimeException('Isolated MySQL test configuration is missing: TEST_DB_'.$key);
    }
    $connection['DB_'.$key] = $value;
}
foreach ($connection as $key => $value) {
    $_ENV[$key] = $_SERVER[$key] = $value;
    putenv($key.'='.$value);
}
