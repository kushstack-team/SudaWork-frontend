# SudaWork Web

React 19 + Vite single-page app (Arabic, RTL) for the SudaWork freelance marketplace. All data comes from the SudaWork REST API; there is no mock data layer.

## Setup

```bash
cp .env.example .env.local   # VITE_API_URL=http://localhost:3000/api/v1
npm install
npm run dev                  # http://localhost:5173
```

Start the API first (see `../../backend/README.md`).

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build into `dist/` |
| `npm run lint` | ESLint (currently 0 problems) |
| `npm run preview` | Serve the production build |

## Where things live

- `src/services/api/` — HTTP client (tokens, refresh, errors, uploads), mappers, and domain API modules.
- `src/context/` — session (`AuthContext`, `useAuth` in `auth.js`) and platform settings / feature availability (`PlatformContext`, `usePlatform` in `platform.js`).
- `src/components/FeatureRoute`, `ProtectedRoute` — route guards.
- `src/components/common/` — `EmptyState`, `ErrorState`, `ConfirmModal`, `PageLoader`.
- `src/hooks/` — `useLoader`, `useApiData`, `useGoogleAuthFlow`.

Integration details, Google sign-in setup and admin feature flags: [../../docs/INTEGRATION.md](../../docs/INTEGRATION.md).
