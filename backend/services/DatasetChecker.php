<?php

class DatasetChecker
{
    private array $principles = [
        ['key' => 'accuracy', 'label' => 'Accuracy', 'description' => 'Values match the real world', 'score' => 96],
        ['key' => 'consistency', 'label' => 'Consistency', 'description' => 'Values agree across records', 'score' => 94],
        ['key' => 'completeness', 'label' => 'Completeness', 'description' => 'Required data is present', 'score' => 93],
        ['key' => 'timeliness', 'label' => 'Timeliness', 'description' => 'Data is current and available', 'score' => 97],
        ['key' => 'reliability', 'label' => 'Reliability', 'description' => 'Sources behave predictably', 'score' => 95],
        ['key' => 'relevance', 'label' => 'Relevance', 'description' => 'Data serves its intended use', 'score' => 92],
    ];

    public function check(array $records): array
    {
        if (count($records) === 0) {
            throw new InvalidArgumentException('Dataset must contain at least one record.');
        }

        $issues = $this->inspectDataset($records);
        $fieldCount = count(array_keys($records[0]));
        $openIssues = count(array_filter($issues, fn($issue) => $issue['status'] === 'Open'));
        $score = max(0, 100 - ($openIssues / max(1, count($records) * $fieldCount)) * 100);
        $principles = $this->calculatePrinciples($records, $issues);

        return [
            'issues' => $issues,
            'score' => round($score, 1),
            'recordCount' => count($records),
            'fieldCount' => $fieldCount,
            'principles' => $principles,
        ];
    }

    private function inspectDataset(array $records): array
    {
        $fields = array_keys($records[0]);
        $idField = $this->findIdField($fields);
        $nameField = $this->findNameField($fields);
        $duplicateIds = $this->findDuplicates(array_column($records, $idField));
        $duplicateNames = $nameField
            ? $this->findDuplicates(array_map(
                fn($record) => strtolower(trim($record[$nameField] ?? '')),
                $records
            ))
            : [];

        $issues = [];

        foreach ($records as $index => $record) {
            $recordName = $record[$idField] ?? ('Row ' . ($index + 2));

            foreach ($fields as $field) {
                $value = $record[$field] ?? '';

                if ($value === '') {
                    $issues[] = $this->makeIssue(
                        'Critical',
                        'Required field',
                        'completeness',
                        $recordName,
                        $field,
                        'Value is empty',
                        "Make {$field} required and reject blank values."
                    );
                }

                if (str_contains($field, 'email') && $value !== '' && !preg_match('/^[^\s@]+@[^\s@]+\.[^\s@]+$/', $value)) {
                    $issues[] = $this->makeIssue(
                        'Warning',
                        'Format validation',
                        'accuracy',
                        $recordName,
                        $field,
                        'Invalid email format',
                        'Apply format validation at ingestion.'
                    );
                }

                if (preg_match('/date/i', $field) && $value !== '' && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) {
                    $issues[] = $this->makeIssue(
                        'Warning',
                        'Date format',
                        'consistency',
                        $recordName,
                        $field,
                        'Date is not ISO 8601',
                        'Standardize dates to YYYY-MM-DD.'
                    );
                }

                if (preg_match('/^(discount|score|percent|percentage|rate)$/i', $field) && $value !== '' && is_numeric($value)) {
                    $numericValue = (float) $value;
                    if ($numericValue < 0 || $numericValue > 1) {
                        $issues[] = $this->makeIssue(
                            'Warning',
                            'Value range',
                            'accuracy',
                            $recordName,
                            $field,
                            'Expected a value between 0 and 1',
                            'Enforce a numeric range validation rule.'
                        );
                    }
                }
            }

            if (in_array($record[$idField] ?? '', $duplicateIds, true)) {
                $issues[] = $this->makeIssue(
                    'Warning',
                    'Duplicate detection',
                    'consistency',
                    $recordName,
                    $idField,
                    'Duplicate identifier found',
                    'Normalize and deduplicate using a stable ID.'
                );
            }

            if ($nameField && in_array(strtolower(trim($record[$nameField] ?? '')), $duplicateNames, true)) {
                $issues[] = $this->makeIssue(
                    'Warning',
                    'Duplicate names',
                    'consistency',
                    $recordName,
                    $nameField,
                    'Name appears in multiple records',
                    'Use a unique ID for matching and merge confirmed duplicates.'
                );
            }
        }

        return $issues;
    }

    private function calculatePrinciples(array $records, array $issues): array
    {
        $basePenalty = max(1, count($records));
        $principles = $this->principles;

        foreach ($principles as &$principle) {
            $relatedIssues = count(array_filter(
                $issues,
                fn($issue) => $this->principleForRule($issue['rule']) === $principle['key']
            ));
            $principle['score'] = max(0, (int) round(100 - ($relatedIssues / $basePenalty) * 100));
        }

        return $principles;
    }

    private function principleForRule(string $rule): string
    {
        return match ($rule) {
            'Required field' => 'completeness',
            'Duplicate detection', 'Duplicate names', 'Date format' => 'consistency',
            'Format validation', 'Value range' => 'accuracy',
            'Freshness check' => 'timeliness',
            'Business relevance' => 'relevance',
            default => 'reliability',
        };
    }

    private function findIdField(array $fields): string
    {
        foreach ($fields as $field) {
            if (preg_match('/(^|_)(id|email)$/i', $field)) {
                return $field;
            }
        }

        return $fields[0];
    }

    private function findNameField(array $fields): ?string
    {
        foreach ($fields as $field) {
            if (preg_match('/(^|_)(full_?)?name$/i', $field)) {
                return $field;
            }
        }

        return null;
    }

    private function findDuplicates(array $values): array
    {
        $seen = [];
        $duplicates = [];

        foreach ($values as $value) {
            if ($value === '' || $value === null) {
                continue;
            }

            if (isset($seen[$value])) {
                $duplicates[$value] = true;
            } else {
                $seen[$value] = true;
            }
        }

        return array_keys($duplicates);
    }

    private function makeIssue(
        string $severity,
        string $rule,
        string $principle,
        string $record,
        string $field,
        string $detail,
        string $fix
    ): array {
        return [
            'severity' => $severity,
            'rule' => $rule,
            'principle' => $principle,
            'record' => $record,
            'field' => $field,
            'detail' => $detail,
            'fix' => $fix,
            'status' => 'Open',
        ];
    }
}
