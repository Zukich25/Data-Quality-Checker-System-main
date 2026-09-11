# Data Quality Checker System

React + Axios frontend with PHP + MySQL backend, running in **Docker**. API testing with **Postman**.

## Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Axios
- **Backend:** PHP, MySQL
- **DevOps:** Docker, Docker Compose
- **API Testing:** Postman

## Quick Start (Docker)

### Requirements

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Run everything

```bash
git clone https://github.com/Zukich25/Data-Quality-Checker-System-main.git
cd Data-Quality-Checker-System-main
docker compose up -d --build
```

Wait ~30 seconds for MySQL to initialize, then open:

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173/ |
| CRUD page | http://localhost:5173/issues |
| API health | http://localhost:8080/api/health.php |

### Stop containers

```bash
docker compose down
```

## Postman Setup

1. Open **Postman**
2. Click **Import**
3. Import both files from the `postman/` folder:
   - `Data-Quality-Checker-System.postman_collection.json`
   - `local.postman_environment.json`
4. Select the **Checker Local (Docker)** environment
5. Make sure Docker is running (`docker compose up -d`)
6. Test **Health Check** first, then CRUD endpoints

## Local Development (without Docker frontend)

Run only database + API in Docker:

```bash
docker compose up -d db api
npm install
npm run dev
```

Copy `.env.example` to `.env` if needed.

## Project Structure

```
├── src/                  # React frontend
├── backend/              # PHP API
│   ├── api/              # REST endpoints
│   ├── config/           # Database & CORS
│   ├── database/         # MySQL schema
│   └── services/         # Business logic
├── postman/              # Postman collection & environment
├── docker-compose.yml
└── Dockerfile.frontend
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health.php` | Health check |
| GET | `/api/issues.php` | Get all issues |
| GET | `/api/issues.php?id=1` | Get one issue |
| POST | `/api/issues.php` | Create issue |
| PUT | `/api/issues.php?id=1` | Update issue |
| DELETE | `/api/issues.php?id=1` | Delete issue |
| POST | `/api/check-dataset.php` | Check dataset quality |
