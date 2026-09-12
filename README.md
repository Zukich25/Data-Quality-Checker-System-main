# SODA — Data Quality Checker System

Professional data quality investigation platform built with **React + Axios** frontend and **PHP + MySQL** backend, running in **Docker**. API testing with **Postman**.

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, TypeScript, Vite, Tailwind CSS, Axios |
| Backend | PHP, MySQL |
| DevOps | Docker, Docker Compose |
| API Testing | Postman |

## Quick Start

### Requirements
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Node.js 20+](https://nodejs.org/)

### Option A — One command (Windows)
```bat
start.bat
```

### Option B — Manual steps
```bash
# 1. Start backend (database + API)
docker compose up -d --build

# 2. Wait ~30 seconds for MySQL on first run

# 3. Install & run frontend
npm install
npm run dev
```

### Login credentials
| Email | Password |
|-------|----------|
| admin@soda.com | soda123 |

## URLs

| Service | URL |
|---------|-----|
| Login | http://localhost:5173/login |
| Dashboard | http://localhost:5173/ |
| Issues CRUD | http://localhost:5173/issues |
| API Health | http://localhost:8080/api/health.php |

## Postman

1. Import files from `postman/` folder
2. Select **Checker Local (Docker)** environment
3. Run **Health Check** → **Login** → CRUD endpoints

## Project Structure (Teacher Rubric)

```
src/
├── main.tsx
├── assets/
├── components/
│   ├── common/          # page-loading, app-layout, protected-route
│   ├── features/        # checker, issues feature components
│   └── ui/              # button, card, input, label, modal, section, tag, textarea
├── lib/
│   ├── axios.ts
│   ├── cn.ts
│   └── checker/         # utils & constants
├── pages/
│   ├── guest/
│   │   ├── home/index.tsx
│   │   └── login/index.tsx
│   └── issues/index.tsx
└── styles/
    └── global.css
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Docker won't start | Open Docker Desktop first, wait until it says "Running" |
| npm install fails | Install Node.js 20+: `node -v` should show v20+ |
| CRUD page errors | Run `docker compose down -v` then `docker compose up -d --build` to reset DB |
| Login fails | Wait 30s after first Docker start for MySQL to initialize |
| Port 8080 in use | Stop other apps using port 8080 or change port in docker-compose.yml |

## Stop everything

```bash
docker compose down
```
