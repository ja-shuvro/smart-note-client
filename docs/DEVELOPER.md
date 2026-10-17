# Frontend Client Developer Guide (`client/DEVELOPER.md`)

Welcome to the Secure Note-Taking Application Frontend codebase. This document guides developers through setting up, extending, and testing the client application.

---

## 1. Quickstart & Local Setup

### Prerequisites
- Node.js v20+ & npm
- Backend server running (locally on `http://localhost:5000` or hosted on Vercel)

### Installation & Run Steps
```bash
# 1. Navigate to client directory
cd client

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# By default:
# VITE_BACKEND_URL=http://localhost:5000
# VITE_API_BASE_URL=/api

# 4. Start Vite development server
npm run dev

# 5. Typecheck & production build
npm run build
```
Open `http://localhost:5173` in your browser.

---

## 2. Architecture & Design System
The client avoids bulky CSS frameworks in favor of a fast, custom CSS token system:
- **`src/styles/variables.css`**: Color tokens (`--bg-app`, `--bg-surface`, `--color-primary`, `--border-subtle`).
- **`src/styles/global.css`**: Utility classes (`.card`, `.btn`, `.badge`, `.form-input`, `.page-header`).
- **Typography:** Uses native modern system fonts (`Inter`, system-ui) optimized for legibility and high contrast.

---

## 3. Key Components & Pages

1. **`src/pages/NotesPage.tsx`**:
   - Manages personal notes with create, edit, delete modals, and paginated lists.
2. **`src/pages/AdminPage.tsx`**:
   - Dual-tab view:
     - Tab 1: Global Notes oversight across the entire system.
     - Tab 2: User directory management with pagination, user creation, and cascading deletion.
3. **`src/pages/InterestsPage.tsx`**:
   - Renders MongoDB Scenario 1 Aggregation results with interactive pipeline query inspector.
4. **`src/pages/PostsPage.tsx`**:
   - Renders MongoDB Scenario 2 Aggregation results with dynamic user selector, post creation modal, and pipeline inspector.
5. **`src/pages/SecurityPage.tsx`**:
   - Dedicated architectural review page displaying security hardening plans, caching strategies, and AI feature roadmap.

---

## 4. API Client & Safe Networking (`src/api/client.ts`)
- All API requests pass through `apiFetch<T>(endpoint, options)`.
- It automatically handles:
  - Base URL normalization from `import.meta.env.VITE_API_BASE_URL`.
  - Bearer token injection from `localStorage`.
  - Content-Type verification (prevents HTML 404/500 text from crashing `response.json()`).
  - Automatic session cleanup on 401 Unauthorized responses.

---

## 5. Production Deployment (Vercel)
- `client/vercel.json` configures two essential rules:
  1. `/api/:path*` rewrites traffic directly to the backend server.
  2. `/(.*)` rewrites all other traffic to `/index.html` to support React Router SPA deep linking and page reloads.
- Build command: `npm run build`
- Output directory: `dist`
