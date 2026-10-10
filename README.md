# Koinogram

Koinogram is a responsive React + TypeScript community experience for Christians to connect, share Scripture and testimonies, ask for prayer, and find supportive communities. This repository is a **frontend MVP with interactive local mock services**; it does not contain a real authentication provider, backend, persistent database, production moderation, or security guarantees.

## Run the app

Requirements: Node.js 22+ and npm. From the project directory:

```bash
npm install
cp .env.example .env.local
npm run dev
```

Vite listens on `http://localhost:3000` (or the next free port if 3000 is taken) (and binds `0.0.0.0:3000` in the managed Preview). Open `/` for the public landing page or `/app` to explore the connected sample application directly. All application routes support client-side navigation; `public/manus-routes.json` declares the page route set for the managed Preview.

Run the production checks/build with `npm run typecheck` and `npm run build`. The compiled static assets are written to `dist/`.

## Environment and service mode

`.env.example` contains only browser-safe placeholders. `VITE_USE_MOCKS=true` is the intended default and `VITE_API_BASE_URL` may remain empty. No API key, password, or private backend secret belongs in a `VITE_*` variable. The UI labels the experience as a demo and the password/reset/signup forms never claim to verify or create a real account. If `VITE_USE_MOCKS=false`, the application deliberately shows a clear “API adapter not connected” notice; setting a URL alone does not connect a backend.

The UI calls typed interfaces from `src/services/contracts.ts`. Mock implementations and sample records live in `src/mocks/`; shared state/provider code is in `src/app/AppProvider.tsx`. Replace mock service selection with API-backed implementations that satisfy the same contracts, use `src/api/client.ts` for JSON/error/timeout handling, supply a session-token provider, and configure `VITE_API_BASE_URL`. No screen needs to import mock arrays or be rewritten. The centralized client returns the backend `{data: ...}` envelope or throws a normalized `ApiClientError`.

## Mock behavior and data

Mock mode supports feed filtering; text, image, verse, testimony, prayer, and video-preview posts; Amen and prayer responses; comments and saves; sharing feedback; people search; profile editing/following; community join/leave; notification read states; privacy and email preferences; appearance selection; reports; and reversible block/mute actions. `localStorage` key `koinogram_mock_snapshot_v1` stores only non-authentication demo state for this browser, including the light/dark selection. It is not a secure database. Reset the demo by removing that key in browser storage and reloading.

File attachments use temporary local object URLs; a local upload is not a durable media object and may disappear after reload. Three bundled image assets in `public/assets/` provide the cover and sample-feed/video visuals so they load from the Preview origin; their source and licensing note is in [`public/assets/SOURCES.md`](./public/assets/SOURCES.md). Older mock snapshots that point to managed-storage image URLs are migrated to bundled assets or initials. The video sample is a poster/preview rather than an actual playable file.

## Product areas and design system

Public routes: `/`, `/signup`, `/login`, `/reset-password`, `/faith`, and `/guidelines`. Onboarding: `/onboarding`. The connected demo: `/app`, `/app/create`, `/app/explore`, `/app/people/:userId`, `/app/communities`, `/app/community/:communityId`, `/app/notifications`, `/app/saved`, `/app/settings`, `/app/settings/privacy`, `/app/safety`, and `/app/moderation`.

The landing page and shared app UI follow the supplied Figma cover, design system and component sheet. Product UI uses bundled Inter; Lora is reserved for Scripture quotations. In Settings, choose the light palette or the Figma-inspired dark palette (“Quiet after hours”). Desktop uses the compact navigation rail and readable feed column; mobile uses a compact top bar, direct Settings/notification access, and touch-friendly bottom navigation. GSAP provides scoped, restrained reveals and form/feed motion; `prefers-reduced-motion` is honored.

## Backend contract

See [`API_CONTRACT.md`](./API_CONTRACT.md) for proposed endpoints, HTTP methods, request/response examples, error conventions, sensitive-data requirements, and suggested authorization boundaries. The appearance preference endpoint is a proposal only; the current choice persists in local demo state.

## Before production

Implement real account creation, login/session and password recovery; database schema, ownership and deletion/retention policies; server-verified authorization for profile visibility and prayer audiences; secure media upload validation/storage; rate limiting and abuse controls; follow/community/member relationships; reliable notification delivery/preferences; report triage, moderator roles, audit logs, and enforcement; and a security/privacy review. Video upload/playback is not included. Frontend checks, local sample storage, and demo moderator screens are presentational only and provide no production security or privacy guarantee.
