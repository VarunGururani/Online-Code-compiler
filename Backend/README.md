# Cloud IDE Backend Service

A modular, secure, cloud-native backend for an online code execution platform and web-based IDE. Built with Node.js, Express, PostgreSQL, Redis, and isolated Docker container sandboxing for multi-language execution (Python 3, Java 17, C++20).

---

## 🚀 Architecture Overview

```
                           +------------------------+
                           |  React Frontend (Vite) |
                           |  Monaco Editor / Axios |
                           +-----------+------------+
                                       |
                              HTTP / REST APIs
                              (with credentials)
                                       v
                     +------------------------------------+
                     |  Node.js / Express Modular Monolith|
                     |  - Helmet, CORS, Rate Limiters     |
                     |  - Session Auth (HttpOnly Cookie)  |
                     |  - Strict Ownership Authorization  |
                     +---+------------+--------------+----+
                         |            |              |
                         v            v              v
               +------------+   +-----------+  +--------------------+
               | PostgreSQL |   |   Redis   |  |  Docker Sandbox    |
               | (pg pool)  |   | (Sessions |  |  - Python 3.11     |
               | Persistent |   |  & Cache) |  |  - C++20 (GCC)     |
               | App Data   |   +-----------+  |  - Java 17 (OpenJDK|
               +------------+                  +--------------------+
```

### Key Architectural Tenets
1. **Modular Monolith**: Clean layer separation across `routes` -> `controllers` -> `services` -> `repositories` -> `db/redis/docker`.
2. **Zero-Trust Code Execution**: User-submitted code is never executed directly on the host OS. All runs are isolated inside minimal Docker containers with `--network none`, CPU, memory, and PID limits, read-only root filesystems, non-root users, and dropped Linux capabilities.
3. **Resilient Local MVP**: Supports seamless automated graceful degradation to local memory storage when PostgreSQL or Redis are temporarily not running in development.
4. **Cloud & Kubernetes Ready**: The execution service is strictly decoupled from Express handlers, making it ready for extraction into AWS EKS Celery/Worker pods or AWS Lambda execution runtimes.

---

## 📦 Directory Structure

```
Backend/
├── docker/                     # Dedicated minimal Dockerfiles for execution runtimes
│   ├── python/Dockerfile       # Python 3.11 runner
│   ├── cpp/Dockerfile          # C++20 (g++ 13) runner
│   └── java/Dockerfile         # Java 17 (OpenJDK) runner
├── src/
│   ├── config/                 # Environment validation and app configuration
│   ├── db/
│   │   ├── migrations/         # SQL migration scripts
│   │   ├── pool.js             # node-postgres connection pool with health checking
│   │   └── migrate.js          # Migration runner CLI
│   ├── redis/                  # Redis client with reconnect and fallback logic
│   ├── logger/                 # Pino structured logger with sensitive data redaction
│   ├── middleware/             # Auth, error, rate-limit, and request-logging middleware
│   ├── validators/             # express-validator schemas for input sanitation
│   ├── repositories/           # Data access layer (User, Project, File, Execution)
│   ├── services/               # Business logic & Docker execution engine
│   ├── controllers/            # HTTP request/response handlers
│   ├── routes/                 # Express route definitions
│   ├── app.js                  # Express application setup
│   └── server.js               # HTTP server entrypoint and graceful shutdown
├── tests/                      # Jest & Supertest integration tests
├── docker-compose.yml          # PostgreSQL 16 & Redis 7 services
├── .env.example                # Template environment variables
├── package.json
└── README.md
```

---

## 🛠️ Prerequisites & Setup

### 1. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Key environment settings in `.env`:
- `PORT`: Server port (default `5000`)
- `FRONTEND_ORIGIN`: Allowed CORS origin (default `http://localhost:5173`)
- `DATABASE_URL`: `postgresql://postgres:postgres@localhost:5432/cloud_ide`
- `REDIS_URL`: `redis://localhost:6379`
- `SESSION_SECRET`: Strong secret for cookie encryption
- `COOKIE_SECURE`: `false` for localhost development, `true` in production (HTTPS)
- `EXECUTION_TIMEOUT_MS`: Wall-clock execution timeout (default `10000` ms)
- `EXECUTION_MEMORY_LIMIT`: Docker memory limit (default `256m`)
- `EXECUTION_CPUS`: Docker CPU quota (default `1.0`)
- `EXECUTION_PIDS_LIMIT`: Max processes inside sandbox (default `64`)

### 2. Start PostgreSQL & Redis via Docker Compose
```bash
docker compose up -d
```

### 3. Run Database Migrations
```bash
npm run migrate
```

### 4. Build Execution Docker Images (Optional for full containerized execution)
```bash
docker build -t cloud-ide-python:3.11 ./docker/python
docker build -t cloud-ide-cpp:latest ./docker/cpp
docker build -t cloud-ide-java:17 ./docker/java
```
*Note: If Docker is not running locally, the backend gracefully falls back to a safe simulated runtime for rapid testing and development.*

### 5. Start the Server
```bash
# Production mode
npm start

# Development mode (with live reload)
npm run dev
```

---

## 🧪 Testing

Run the comprehensive integration test suite:
```bash
npm test
```
The test suite covers:
- System health checks (`GET /api/health`)
- User registration, authentication, login rate limiting, session persistence, and logout
- Project CRUD, validation, and unauthorized access rejection
- File CRUD, path traversal protection (`../`), language validation, and Monaco save integration
- Code execution for Python, C++, and Java with timeout enforcement and history retrieval

---

## 🔒 Security & Sandbox Hardening

1. **Host Isolation**: Submitted code is run inside ephemeral containers with no access to the host filesystem.
2. **Network Disabled**: Containers run with `--network none`, preventing socket connections, reverse shells, or remote resource fetches.
3. **Least Privilege**: Sandboxes run as unprivileged `sandboxuser` (`UID 10001`), dropping all Linux capabilities (`--cap-drop ALL`) with `--security-opt no-new-privileges`.
4. **Resource Constraints**:
   - Memory capped via `--memory 256m --memory-swap 256m`
   - CPU quota capped via `--cpus 1.0`
   - Fork-bomb defense via `--pids-limit 64`
   - Output truncation limits preventing memory exhaustion (max 64 KB buffer).
5. **Session & Auth Security**:
   - Passwords hashed with `bcryptjs` (salt rounds: 12)
   - HTTP-only cookies preventing XSS token theft
   - `SameSite=lax` preventing CSRF
   - `helmet` security headers enabled
   - CORS strictly restricted to `FRONTEND_ORIGIN` with credentials enabled
   - Granular rate limiting on `/api/auth/*` and `/api/executions`.
