<?php

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../services/DatasetChecker.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed',
    ]);
    exit;
}

$payload = json_decode(file_get_contents('php://input'), true);

if (!is_array($payload) || !isset($payload['records']) || !is_array($payload['records'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request body. Expected JSON with a records array.',
    ]);
    exit;
}

try {
    $checker = new DatasetChecker();
    $result = $checker->check($payload['records']);

    echo json_encode([
        'success' => true,
        'data' => $result,
    ]);
} catch (Throwable $error) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $error->getMessage(),
    ]);
}
