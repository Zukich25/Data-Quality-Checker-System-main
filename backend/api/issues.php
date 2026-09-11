<?php

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../services/IssueRepository.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int) $_GET['id'] : null;
$repository = new IssueRepository();

try {
    switch ($method) {
        case 'GET':
            if ($id) {
                $issue = $repository->findById($id);

                if (!$issue) {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => 'Issue not found']);
                    exit;
                }

                echo json_encode(['success' => true, 'data' => $issue]);
                exit;
            }

            echo json_encode(['success' => true, 'data' => $repository->findAll()]);
            exit;

        case 'POST':
            $payload = json_decode(file_get_contents('php://input'), true);

            if (!is_array($payload)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid JSON body']);
                exit;
            }

            $issue = $repository->create($payload);
            http_response_code(201);
            echo json_encode(['success' => true, 'data' => $issue, 'message' => 'Issue created']);
            exit;

        case 'PUT':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Issue id is required']);
                exit;
            }

            $payload = json_decode(file_get_contents('php://input'), true);

            if (!is_array($payload)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid JSON body']);
                exit;
            }

            $issue = $repository->update($id, $payload);

            if (!$issue) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Issue not found']);
                exit;
            }

            echo json_encode(['success' => true, 'data' => $issue, 'message' => 'Issue updated']);
            exit;

        case 'DELETE':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Issue id is required']);
                exit;
            }

            $deleted = $repository->delete($id);

            if (!$deleted) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Issue not found']);
                exit;
            }

            echo json_encode(['success' => true, 'message' => 'Issue deleted']);
            exit;

        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
            exit;
    }
} catch (PDOException $error) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error. Make sure MySQL is running and schema.sql was imported.',
        'error' => $error->getMessage(),
    ]);
}
