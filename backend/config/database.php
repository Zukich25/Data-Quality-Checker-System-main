<?php

function getDatabaseConnection(): PDO
{
    $host = 'localhost';
    $dbname = 'checker_system';
    $username = 'root';
    $password = '';

    $dsn = "mysql:host={$host};dbname={$dbname};charset=utf8mb4";

    return new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
}
