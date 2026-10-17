# Client AI Agent Context & System Blueprint (`client/AGENT.md`)

> **Instruction for AI Agents:** Read this document first. It contains the complete architectural, component, routing, and deployment blueprint for the `client` workspace. Do not scan entire directory trees repeatedly.

---

## 1. System Overview & Tech Stack
- **Runtime & Build:** Vite 8.3 with `@vitejs/plugin-react`.
- **Framework:** React 19.2 + TypeScript 6.0.
- **Routing:** React Router v7 (`BrowserRouter`, `Routes`, `Route`, `Navigate`).
- **Icons:** `lucide-react` (clean, lightweight SVG icons).
- **Styling:** Custom CSS Design System with CSS variables (`variables.css`, `global.css`). No Tailwind dependencies.
- **Deployment:** Vercel Static SPA via `client/vercel.json` with reverse proxy rewrites.

---

## 2. Directory Architecture
```text
client/
├── src/
│   ├── api/                   # API communication layer
│   │   ├── client.ts          # Central apiFetch helper (JWT headers & safe JSON parsing)
│   │   ├── auth-api.ts        # Login, Register, Me
│   │   ├── notes-api.ts       # Notes CRUD + paginated listing + ?all=true
│   │   ├── users-api.ts       # Admin user management endpoints
│   │   └── aggregations-api.ts# Scenario 1 (Interests) & Scenario 2 (Posts lookup)
│   ├── components/
│   │   └── common/            # Reusable UI (Navbar, ProtectedRoute, Pagination)
│   ├── context/
│   │   └── auth-context.tsx   # React Context for session, token, and user state
│   ├── pages/
│   │   ├── LoginPage.tsx      # User authentication
│   │   ├── RegisterPage.tsx   # User registration with interests tags
│   │   ├── NotesPage.tsx      # User personal notes management (CRUD + Pagination)
│   │   ├── InterestsPage.tsx  # Scenario 1 Aggregation viewer & pipeline inspector
│   │   ├── PostsPage.tsx      # Scenario 2 $lookup Aggregation viewer & publisher
│   │   ├── AdminPage.tsx      # Admin dual-tab panel (Global Notes & User Directory)
│   │   └── SecurityPage.tsx   # Security, roadmap, & architecture overview
│   ├── styles/
│   │   ├── variables.css      # Dark theme tokens, colors, transitions
│   │   └── global.css         # Typography, layout, cards, buttons, badges
│   ├── App.tsx                # Master Route provider & Auth Provider wrapper
│   └── main.tsx               # Entry point mounting root
├── vercel.json                # API proxy rewrites (/api -> server) & SPA fallback
└── vite.config.ts             # Dev proxy & env loader
```

---

## 3. Routing & Permissions Matrix
| Path | Component | Guard / Access Level | Description |
| :--- | :--- | :--- | :--- |
| `/login` | `LoginPage` | Public | Credentials authentication |
| `/register` | `RegisterPage` | Public | New account creation with taggable interests |
| `/security-updates`| `SecurityPage` | Public / All | Security roadmap & architecture guidelines |
| `/` | `NotesPage` | `ProtectedRoute` | Personal user notes CRUD with pagination |
| `/interests` | `InterestsPage` | `ProtectedRoute` | Scenario 1 Aggregation (Group by Interests) |
| `/posts` | `PostsPage` | `ProtectedRoute` | Scenario 2 Aggregation (User posts $lookup join) |
| `/admin` | `AdminPage` | `requireAdmin={true}` | Global notes oversight + User management |

---

## 4. API Communication Layer (`src/api/client.ts`)
- **Base URL Resolution:**
  - `import.meta.env.VITE_API_BASE_URL || '/api'`.
  - In Dev: Vite proxy forwards `/api` to `http://localhost:5000`.
  - In Production: `vercel.json` rewrites `/api/:path*` to `https://cottagehomecare-server.vercel.app/api/:path*`.
- **Token Handling:** Automatically injects `Authorization: Bearer <token>` from `localStorage`.
- **Safe Response Handling:** Checks `content-type.includes('application/json')` before calling `response.json()`, preventing HTML error crashes.
- **Auto Logout:** On `401 Unauthorized`, clears session and dispatches `auth-expired` event.

---

## 5. State Management & Authentication Flow
- `AuthContext` provides:
  - `user`: Authenticated user document (`_id`, `name`, `email`, `role`, `interests`).
  - `isAuthenticated`: Boolean flag.
  - `isAdmin`: Boolean flag (`user?.role === 'admin'`).
  - `login(token, user)` & `logout()`.

---

## 6. Development Rules for AI Agents
- Always use predefined CSS classes from `global.css` (`card`, `btn`, `btn-primary`, `badge`, `form-input`, etc.). Do not inject ad-hoc style classes.
- Preserve responsive layout tokens (`--bg-surface`, `--color-primary`, `--border-subtle`).
- Keep navigation labels concise and single-line (`white-space: nowrap`).
