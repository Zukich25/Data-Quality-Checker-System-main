<?php

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$payload = json_decode(file_get_contents('php://input'), true);

if (!is_array($payload) || empty($payload['email']) || empty($payload['password'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email and password are required']);
    exit;
}

try {
    $db = getDatabaseConnection();
    $statement = $db->prepare('SELECT id, name, email, password FROM users WHERE email = :email LIMIT 1');
    $statement->execute(['email' => $payload['email']]);
    $user = $statement->fetch();

    if (!$user || $user['password'] !== $payload['password']) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
        exit;
    }

    $token = base64_encode($user['id'] . ':' . $user['email']);

    echo json_encode([
        'success' => true,
        'data' => [
            'token' => $token,
            'user' => [
                'id' => (int) $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
            ],
        ],
        'message' => 'Login successful',
    ]);
} catch (PDOException $error) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error. Make sure Docker is running.',
    ]);
}
