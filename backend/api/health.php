<?php

require_once __DIR__ . '/../config/cors.php';

echo json_encode([
    'success' => true,
    'message' => 'PHP backend is running',
    'backend' => 'PHP',
]);
