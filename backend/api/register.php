<?php

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$payload = json_decode(file_get_contents('php://input'), true);

if (!is_array($payload) || empty($payload['name']) || empty($payload['email']) || empty($payload['password'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Name, email, and password are required']);
    exit;
}

try {
    $db = getDatabaseConnection();

    $check = $db->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
    $check->execute(['email' => $payload['email']]);

    if ($check->fetch()) {
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => 'Email already registered']);
        exit;
    }

    $insert = $db->prepare('INSERT INTO users (name, email, password) VALUES (:name, :email, :password)');
    $insert->execute([
        'name' => $payload['name'],
        'email' => $payload['email'],
        'password' => $payload['password'],
    ]);

    $userId = (int) $db->lastInsertId();
    $token = base64_encode($userId . ':' . $payload['email']);

    echo json_encode([
        'success' => true,
        'data' => [
            'token' => $token,
            'user' => [
                'id' => $userId,
                'name' => $payload['name'],
                'email' => $payload['email'],
            ],
        ],
        'message' => 'Account created successfully',
    ]);
} catch (PDOException $error) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error. Make sure Docker is running.']);
}
