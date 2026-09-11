<?php

require_once __DIR__ . '/../config/database.php';

class IssueRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = getDatabaseConnection();
    }

    public function findAll(): array
    {
        $statement = $this->db->query('SELECT * FROM issues ORDER BY id DESC');
        return $statement->fetchAll();
    }

    public function findById(int $id): ?array
    {
        $statement = $this->db->prepare('SELECT * FROM issues WHERE id = :id');
        $statement->execute(['id' => $id]);
        $issue = $statement->fetch();

        return $issue ?: null;
    }

    public function create(array $data): array
    {
        $statement = $this->db->prepare(
            'INSERT INTO issues (severity, rule, principle, record, field, detail, fix, status)
             VALUES (:severity, :rule, :principle, :record, :field, :detail, :fix, :status)'
        );

        $statement->execute([
            'severity' => $data['severity'],
            'rule' => $data['rule'],
            'principle' => $data['principle'],
            'record' => $data['record'],
            'field' => $data['field'],
            'detail' => $data['detail'],
            'fix' => $data['fix'],
            'status' => $data['status'] ?? 'Open',
        ]);

        return $this->findById((int) $this->db->lastInsertId());
    }

    public function update(int $id, array $data): ?array
    {
        if (!$this->findById($id)) {
            return null;
        }

        $statement = $this->db->prepare(
            'UPDATE issues
             SET severity = :severity,
                 rule = :rule,
                 principle = :principle,
                 record = :record,
                 field = :field,
                 detail = :detail,
                 fix = :fix,
                 status = :status
             WHERE id = :id'
        );

        $statement->execute([
            'id' => $id,
            'severity' => $data['severity'],
            'rule' => $data['rule'],
            'principle' => $data['principle'],
            'record' => $data['record'],
            'field' => $data['field'],
            'detail' => $data['detail'],
            'fix' => $data['fix'],
            'status' => $data['status'] ?? 'Open',
        ]);

        return $this->findById($id);
    }

    public function delete(int $id): bool
    {
        $statement = $this->db->prepare('DELETE FROM issues WHERE id = :id');
        $statement->execute(['id' => $id]);

        return $statement->rowCount() > 0;
    }
}
