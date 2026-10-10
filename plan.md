# Koinogram — implementation and design plan

## Scope and assumptions

The supplied attachment is the complete MVP implementation specification. It mentions a separate UI/UX brief, but no other attachment with that brief was present. The user subsequently supplied [Koinogram UI in Figma](https://www.figma.com/design/hoHwJYtnZhZnKzrIkkSCPJ/Koinogram-UI?m=auto&t=pxJTKpYvEnFQkfLx-6), which is the visual source of truth for this update and supersedes the earlier visual treatment where they conflict. Preserve the original product behaviors, accessibility requirements, and privacy language. The deliverable remains a responsive React + TypeScript frontend with realistic but explicitly local mock data; there is no live backend, identity provider, production authorization layer, or durable database.

## Visual source and design direction

The shared Figma board has `01 · Cover / Brand`, `02 · Design System`, and `03 · Components`. The cover shows a crisp white masthead and a dark navy, two-column hero with the headline **“There’s a place for you here.”**, a concise description of Christian social connection, and a warm group photograph. The brand examples communicate a compact Koinogram K monogram and “people before pixels; care before engagement.” Those brand-guideline examples inform the identity; they are not extra website sections. The component board shows clear feed cards for Scripture, prayer, photography, and testimony, plus reusable controls, community/user cards, navigation, and visible draft/upload/success/error states.

| Design decision | Figma-aligned direction |
|---|---|
| Design movement | Contemporary, calm Christian social-product UI with modest editorial warmth reserved for Scripture and real community stories; avoid ornamental lifestyle-magazine styling or generic dashboard tropes. |
| Core principles | (1) Make real conversation easy to read. (2) Let people choose their audience, especially for prayer. (3) Put community care before engagement metrics. (4) Use consistent controls and explicit active, loading, success, and error states. |
| Color philosophy | Near-white surfaces, deep ink-blue text and hero, clear saturated blue for actions/focus, pale-blue action surfaces, quiet cool borders, gold only as a supporting highlight, and distinct labeled semantic success/danger colors. Keep readable light and dark token sets; start in light mode and let the user switch explicitly. |
| Light tokens | Surface `#FFFFFF`; primary text `#142840`; secondary text `#637287`; action blue `#285EA8`; action tint `#EAF2FC`; quiet border `#E3E9F0`; warm gold `#B58B43`; success `#247A5B`; danger `#B63D4D`. |
| Dark tokens | Surface `#142337`; primary text `#ECF2FA`; secondary text `#A8B6CA`; action blue `#93ACFF`; action tint `#213B5B`; quiet border `#2A3B50`; warm gold `#DABB7D`; success `#8FD6B8`; danger `#FFA7B1`. |
| Layout paradigm | Public pages use a clean white masthead, a bounded navy cover/hero with text left and photograph right, then readable informational sections. Desktop app uses the existing compact navigation rail, content-first feed column, and restrained contextual discovery. Tablet removes secondary rails before content narrows. Mobile is a single reading column with compact top bar and bottom navigation. |
| Signature elements | A solid rounded-square K monogram; Figma-blue primary actions and pale-blue selected navigation/filter states; type-aware post cards, including a quiet Scripture treatment and a visibly audience-labeled prayer block. |
| Interaction philosophy | Keep controls recognizable, consistent, keyboard-accessible and at least 44×44px where interactive. Never communicate status only through color. Show a clear selected state for Amen/prayer/filter controls and explain publishing/privacy outcomes. |
| Animation | Retain the existing purposeful GSAP entrance/reveal and selected interaction feedback, but keep it restrained and product-led. Clean up contexts/listeners, prevent repeated entrance effects and respect `prefers-reduced-motion`; do not add decorative movement to fixed cards. |
| Typography | Inter for product UI; Lora only for Scripture quotations. Page title 28/42/600, section heading 20/30/600, body 15/22.5/400, metadata/labels 12/18/400–500, Scripture quotation Lora 26/39. Use sentence case rather than extended all-caps copy. |
| Brand essence | A place for Christians to find real connection rather than perform perfect lives. Personality: **grounded, thoughtful, welcoming**. |
| Brand voice | Human, welcoming, and non-presumptive. Cover headline: “There’s a place for you here.” Supporting copy explains real connection—not perfect lives—and invites people to share a story, find their people, and grow in faith together. |
| Wordmark and color | Preserve the lowercase Koinogram wordmark; adapt its small mark to a solid blue square with a legible white K/cross-stem monogram. The ownable brand/action color is Figma blue `#285EA8`, grounded by ink `#142840`. |
| Geometry and responsive behavior | Use a 4px base grid with 8/12/16/24/32/48/64px spacing, 16px mobile inset and 28px desktop content gutter. Reference radii: compact 8px, controls 12px, cards 20px, hero 28px, avatars/pills fully rounded. Use a quiet 1px border and restrained shadow. Honor text contrast ≥4.5:1 (large text ≥3:1), visible 2–3px blue focus with offset, descriptive screen-reader names, and clear state labels. |

The hero image already bundled in `public/assets/outdoor-gathering.jpg` is a warm group scene suitable for the Figma cover and remains the selected local asset; no additional image search or new decorative imagery is needed.

## Implementation approach

Use the existing Vite + React + strict TypeScript project, React Router, Tailwind CSS, GSAP and Lucide React. Do not reinitialize the existing workspace. Keep the typed service context lightweight and feature state local rather than adding a broad state library. The root landing route remains public; “Explore the demo” opens the sample authenticated experience without credentials. Authentication remains a demo flow and must not claim secure identity verification. The UI clearly labels mock behavior.

Domain and API models live in `src/types`; interfaces and adapters in `src/services`; sample entities and stateful demo adapters in `src/mocks`; the centralized JSON transport in `src/api/client.ts`. `VITE_API_BASE_URL` is future-facing, and mock services remain isolated from UI components. A small explicitly mock-only persistence adapter may retain demo preferences/content, but never credentials or production authorization state. Preserve the working route tree and manifest; add the requested light/dark appearance preference only as a frontend setting persisted in mock preferences.

Deliver connected flows for public landing, sign-up/login/reset and faith/guideline pages; guided onboarding; authenticated shell and varied home feed; type-aware post composer; reactions, comments, prayer response, save/share/report; explore/search; profiles; communities; notifications; saved posts; account/privacy/safety/moderation screens. Keep explicit audience/visibility controls for prayer requests. All visible controls must navigate or have an honest interactive mock outcome. Media uploads, identity, privacy enforcement, moderation actions, and publication are not represented as secure or live backend services.

## Project structure

- `src/app/`: route tree, provider and presentation-only demo state.
- `src/layouts/`: public and authenticated navigation shells.
- `src/pages/`: landing, auth, onboarding, feed/composer, explore, profiles, communities, notifications, saved, settings and safety/moderation routes.
- `src/components/`: shared brand, buttons, inputs, cards, dialogs, avatar, feedback and empty/loading/error states.
- `src/hooks/`: reduced-motion and feature-level UI hooks.
- `src/types/`, `src/services/`, `src/api/`, `src/mocks/`, `src/config/`: domain/API types, typed service boundaries, transport, mock adapters/seed data and runtime configuration.
- `src/styles.css` and the Figma-alignment theme layer: layout styles and shared design tokens/component treatments.
- `public/manus-routes.json`: complete source-aligned route manifest.
- `public/assets/`: bundled demo photography served directly by Vite/Preview.
- Root docs: `README.md`, `.env.example`, `API_CONTRACT.md`, `plan.md`, `TODO.md`.

## Backend integration boundary

Document suggested endpoints and JSON contracts for auth/session, profiles, feed/posts, reactions, comments, prayer responses, search, communities/memberships, notifications, saved posts, reports/moderation and media uploads. The browser client receives only a future public API base URL and a future session-token provider; no secrets or hardcoded authorization claims. Before production, backend work must still provide identity/session issuance and recovery, persistent schema/ownership rules, server-side authorization and private-prayer access control, retention/deletion, safe upload validation/storage, rate limiting, block/mute/report enforcement, moderator permissions/audit trail, security review, and operational monitoring.

## Project constraints

The managed WebDev workspace began empty and runs Preview on port 3000. TypeScript diagnostics are now registered. No separate UI/UX brief file was attached; the user's Figma is the visual source for this iteration. The project is frontend-only and mock-first; passing a build or serving a Preview is not evidence of a production-secure social network. The task request was to update the existing Koinogram UI, not to connect a real backend or publish it publicly.
