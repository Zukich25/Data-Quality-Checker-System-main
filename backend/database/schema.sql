CREATE DATABASE IF NOT EXISTS checker_system;
USE checker_system;

CREATE TABLE IF NOT EXISTS issues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    severity ENUM('Critical', 'Warning', 'Info') NOT NULL DEFAULT 'Warning',
    rule VARCHAR(255) NOT NULL,
    principle ENUM('accuracy', 'consistency', 'completeness', 'timeliness', 'reliability', 'relevance') NOT NULL,
    record VARCHAR(255) NOT NULL,
    field VARCHAR(255) NOT NULL,
    detail TEXT NOT NULL,
    fix TEXT NOT NULL,
    status ENUM('Open', 'Resolved') NOT NULL DEFAULT 'Open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO issues (severity, rule, principle, record, field, detail, fix, status) VALUES
('Critical', 'Required field', 'completeness', 'Row 2', 'email', 'Value is empty', 'Make email required and reject blank values.', 'Open'),
('Warning', 'Format validation', 'accuracy', 'user@bad', 'email', 'Invalid email format', 'Apply format validation at ingestion.', 'Open'),
('Warning', 'Duplicate detection', 'consistency', 'ID-001', 'id', 'Duplicate identifier found', 'Normalize and deduplicate using a stable ID.', 'Resolved');
