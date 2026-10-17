# NT Tech Innovation — Full Stack Client Application

Frontend client application built with React 19, TypeScript, and Vite. Designed with responsive UI, custom CSS theme tokens, protected routing, and automated UI testing.

---

## 1. Quick Start & Setup

### Prerequisites
- Node.js (v20+ recommended)
- Running backend server (defaults to `http://localhost:5000`)

### Installation & Run
```bash
cd client
npm install

# Setup environment variables
cp .env.example .env

# Run automated component & page tests
npm test

# Run tests in watch mode
npm run test:watch

# Start local dev server (Runs on http://localhost:5173)
npm run dev
```

---

## 2. Environment Configuration (`.env`)

| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Base endpoint for REST API | `/api` (proxied in Vite to `http://localhost:5000`) |

---

## 3. Automated Testing Suite

Built with **Vitest**, **React Testing Library**, and **jsdom**.

```bash
npm test
```

### Coverage:
- **`Pagination.test.tsx`**: Tests pagination boundaries, page transitions, and disabled states.
- **`ProtectedRoute.test.tsx`**: Tests session loading states, unauthenticated redirection to `/login`, and RBAC admin protection.
- **`LoginPage.test.tsx`**: Tests form input states, reviewer quick demo auto-fill, successful login dispatch, and error state alerts.

---

## 4. Production Build

```bash
npm run build
npm run preview
```
