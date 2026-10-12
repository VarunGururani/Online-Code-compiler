# Cloud IDE — Cloud-Native Online Code Execution Platform

A modern, high-performance, responsive cloud IDE inspired by VS Code and Replit. Cloud IDE provides browser-based code editing and containerized execution for **Python 3**, **Java 17 LTS**, and **C++20 (GCC 13.2)**.

---

## 🚀 Key Features

- **Monaco Code Editor Core**: Powered by `@monaco-editor/react` (the editor engine behind VS Code) featuring IntelliSense, bracket matching, minimap, multi-file tabs, code folding, smooth scrolling, and multiple dark themes.
- **Polyglot Execution Support**:
  - **Python 3.11** (`main.py` starter template, algorithm execution, `sys.stdin` input stream)
  - **Java 17 LTS** (`Main.java` with OpenJDK 17 and `Scanner` standard input support)
  - **C++20** (`main.cpp` with GCC 13.2, `-O2` compiler flags, `std::cin` stream)
- **Container Sandbox & Output Drawer**:
  - Resizable bottom panel with mouse drag handle
  - Real-time stdout, stderr, and syntax/compilation error parsing
  - Interactive Standard Input (stdin) tab for feeding user inputs
  - Container execution telemetry (cgroup memory usage, wall time, exit codes, and sandbox lifecycle logs)
  - Clear and copy output actions
- **Project & File Explorer**:
  - Expandable/collapsible file and folder trees
  - Language-aware file icons
  - Create, rename, delete files with confirmation and duplicate protection
  - Unsaved change indicator dot (`Ctrl+S` to save)
- **Execution History & Audits**:
  - Searchable audit table with duration, memory, exit codes, and timestamps
  - Inspector modal to view full stdout, stderr, and stdin
  - Quick "Open in IDE" button
- **Configurable Backend Integration**:
  - Ready for Node.js/Express API with HTTP-only session cookies
  - High-fidelity **Sandbox Demo Mode** for offline evaluation
  - One-click backend health check in Settings
- **Cloud & DevOps Architecture Overview**:
  - Interactive architecture diagram detailing AWS CloudFront, ALB, Node.js API, Redis BullMQ, PostgreSQL RDS, and Kubernetes (EKS) worker sandboxes.

---

## 🛠️ Technology Stack

- **Frontend Framework**: React 19 + Vite 8
- **Editor**: Monaco Editor (`@monaco-editor/react`)
- **Styling**: Tailwind CSS v4 + Dark Theme UI
- **Icons**: Lucide React
- **Routing**: React Router v7
- **HTTP Client**: Axios (configured with `withCredentials: true` for HTTP-only cookies)
- **State Management**: React Context API (`AuthContext`, `ProjectContext`, `ToastContext`)

---

## 📁 Project Structure

```
Cloud IDE/
├── Backend/
│   ├── package.json
│   └── server.js                  # Express API gateway
├── frontend/
│   ├── package.json               # Convenience root script delegating to monaco
│   └── monaco/                    # React + Vite application
│       ├── public/
│       ├── src/
│       │   ├── components/
│       │   │   ├── ArchitectureDiagram.jsx    # Cloud infrastructure visualization
│       │   │   ├── EditorTabs.jsx             # File tabs with unsaved indicators
│       │   │   ├── ExecutionDetailsPanel.jsx  # Docker sandbox quotas & telemetry
│       │   │   ├── LanguageSelector.jsx       # Python, Java, C++ runtime picker
│       │   │   ├── MonacoEditorContainer.jsx  # Monaco editor instance & keybindings
│       │   │   ├── Navbar.jsx                 # Top nav, brand, and profile menu
│       │   │   ├── NewFileModal.jsx           # New file creation modal
│       │   │   ├── NewProjectModal.jsx        # Project initialization modal
│       │   │   ├── OutputPanel.jsx            # Resizable drawer (stdout/stderr/stdin)
│       │   │   ├── ProjectExplorer.jsx        # File tree explorer with rename/delete
│       │   │   ├── ProtectedRoute.jsx         # Session-protected route wrapper
│       │   │   ├── RunButton.jsx              # Run & stop execution button
│       │   │   ├── Sidebar.jsx                # VS Code activity sidebar
│       │   │   └── ToastContainer.jsx         # Toast feedback alerts
│       │   ├── context/
│       │   │   ├── AuthContext.jsx            # User session & HTTP-only auth state
│       │   │   ├── ProjectContext.jsx         # Active project, files, and runs state
│       │   │   └── ToastContext.jsx           # User alert feedback system
│       │   ├── pages/
│       │   │   ├── DashboardPage.jsx          # Projects grid, stats, search, sort
│       │   │   ├── HistoryPage.jsx            # Execution audit log & inspector modal
│       │   │   ├── IDEPage.jsx                # Primary IDE workspace
│       │   │   ├── LandingPage.jsx            # Product showcase & interactive preview
│       │   │   ├── LoginPage.jsx              # Sign in with instant demo fill
│       │   │   ├── RegisterPage.jsx           # Account creation form
│       │   │   └── SettingsPage.jsx           # Editor preferences & API config
│       │   ├── services/
│       │   │   ├── api.js                     # Axios instance, health ping, demo mode
│       │   │   ├── authService.js             # Auth endpoints
│       │   │   ├── projectService.js          # Project & file CRUD
│       │   │   └── executionService.js        # POST /executions & sandbox engine
│       │   ├── utils/
│       │   │   ├── languages.js               # Language definitions & container specs
│       │   │   ├── mockData.js                # Initial mock projects & executions
│       │   │   └── starterTemplates.js        # Python, Java, C++ starter templates
│       │   ├── App.jsx                        # Route hierarchy
│       │   ├── main.jsx                       # Application entry point
│       │   └── index.css                      # Tailwind base & dark scrollbars
│       ├── package.json
│       └── vite.config.js
└── README.md
```

---

## 🏃 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- npm

### 2. Running the Frontend
Navigate to the frontend application directory:
```bash
cd frontend/monaco
npm install
npm run dev
```

Alternatively, from `frontend/`:
```bash
cd frontend
npm run dev
```

The application will start at:
```
http://localhost:5173/
```

### 3. Quick Demo Login
On the Sign In page (`/login`), click the **"Instant Demo Sign In (Alex Rivera)"** button to immediately authenticate and access pre-loaded projects and telemetry.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + S` / `Cmd + S` | Save active file buffer |
| `Ctrl + Enter` / `Cmd + Enter` | Run active file in container sandbox |
| `Esc` | Close open modal or dialog |

---

## 🔌 Backend API Integration Contract

When connecting a real Node.js / Express backend, configure the environment variable in `.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

The frontend expects the following REST API endpoints:

### Authentication (`/auth`)
- `POST /auth/register` — Register a new user
- `POST /auth/login` — Sign in and issue HTTP-only cookie
- `POST /auth/logout` — Clear session cookie
- `GET /auth/me` — Return authenticated user profile

### Projects (`/projects`)
- `GET /projects` — List user's projects
- `POST /projects` — Create a new project
- `GET /projects/:projectId` — Get project details with files
- `PATCH /projects/:projectId` — Update project metadata
- `DELETE /projects/:projectId` — Delete project

### Files (`/files`)
- `GET /projects/:projectId/files` — Get all files for project
- `POST /projects/:projectId/files` — Create new file
- `PATCH /files/:fileId` — Update file content or name
- `DELETE /files/:fileId` — Delete file

### Code Execution (`/executions`)
- `POST /executions` — Submit `{ projectId, filename, language, code, stdin }`
- `GET /executions/:executionId` — Get execution result
- `GET /executions` — List execution audit history
- `POST /executions/:executionId/cancel` — Cancel active run

---

## ☁️ Target Cloud Infrastructure Overview

```
React Frontend (Vite)
       │
       ▼
AWS CloudFront (CDN Edge)
       │
       ▼
AWS Application Load Balancer (ALB)
       │
       ▼
Node.js / Express API Gateway ──► PostgreSQL (RDS) & Redis (BullMQ)
       │
       ▼
Kubernetes (EKS) Worker Pods
       │
       ▼
Docker Containers (gVisor Isolated Sandbox)
  ├── Python 3.11 (python:3.11-slim)
  ├── Java 17 LTS (eclipse-temurin:17-jdk-alpine)
  └── C++20 (gcc:13.2)
```
