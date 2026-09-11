# Data Quality Checker System

React + Axios frontend with PHP + MySQL backend.

## Setup

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env`
3. Start Xampp (Apache + MySQL)
4. Copy `backend/` to `C:\xampp\htdocs\checker-api\`
5. Import `backend/database/schema.sql` in phpMyAdmin
6. Run frontend: `npm run dev`

## URLs

- Frontend: http://localhost:5173/
- CRUD page: http://localhost:5173/issues
- API health: http://localhost/checker-api/api/health.php
