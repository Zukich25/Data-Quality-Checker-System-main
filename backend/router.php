<?php

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

if ($uri === '/api/health.php' || $uri === '/api/health') {
    require __DIR__ . '/api/health.php';
    return true;
}

if ($uri === '/api/check-dataset.php' || $uri === '/api/check-dataset') {
    require __DIR__ . '/api/check-dataset.php';
    return true;
}

if ($uri === '/api/issues.php' || str_starts_with($uri, '/api/issues')) {
    require __DIR__ . '/api/issues.php';
    return true;
}

if ($uri === '/api/auth.php' || $uri === '/api/auth') {
    require __DIR__ . '/api/auth.php';
    return true;
}

http_response_code(404);
header('Content-Type: application/json; charset=utf-8');
echo json_encode([
    'success' => false,
    'message' => 'Route not found',
]);

return true;
