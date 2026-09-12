@echo off
echo Starting SODA Data Quality Checker System...
echo.
echo [1/2] Starting Docker (database + API)...
docker compose up -d --build
if errorlevel 1 (
  echo Docker failed. Make sure Docker Desktop is running.
  exit /b 1
)
echo.
echo [2/2] Starting React frontend...
echo Wait ~30 seconds for MySQL on first run.
echo.
npm install
npm run dev
