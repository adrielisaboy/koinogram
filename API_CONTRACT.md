# Koinogram proposed backend API contract

This is a proposal for the future API; **no server is implemented or implied by this document**. All routes below are relative to `VITE_API_BASE_URL` and use HTTPS in production. The browser client sends/accepts JSON. Authentication examples show a possible session design; backend owners should select a provider and review the cookie/CSRF approach before implementation.

## Common conventions

Successful resource responses use `{ "data": <resource-or-list>, "meta"?: { "cursor"?: "...", "total"?: 123 } }`. Empty updates may return `204 No Content`. List endpoints use opaque cursor pagination with `?cursor=<opaque>&limit=20` (server caps `limit`). IDs are opaque strings; timestamps are ISO-8601 UTC. Enums are validated server-side. An audience is never authorization by itself: the backend must verify the requesting session and membership/visibility on every resource read and write.

Errors use a stable envelope and HTTP status appropriate to the error:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Check the highlighted fields and try again.",
    "details": { "fields": { "body": "Must be 800 characters or fewer." } },
    "requestId": "req_opaque"
  }
}
```

Recommended codes include `VALIDATION_ERROR`, `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `RATE_LIMITED`, `UPLOAD_REJECTED`, `REQUEST_TIMEOUT`, and `INTERNAL_ERROR`. Do not expose stack traces, private content, or moderation notes in public error details. The client currently understands an `error` object with `code`, `message`, and optional `details`.

## Authentication and session

| Method | Endpoint | Request | Success |
|---|---|---|---|
| POST | `/v1/auth/register` | `{ "name": "Amara James", "email": "person@example.com", "password": "…", "tradition": "Other" }` | `201 { "data": { "user": <User>, "session": <SessionSummary> } }` |
| POST | `/v1/auth/login` | `{ "email": "person@example.com", "password": "…" }` | `200` with user/session; preferably session in an appropriately configured secure cookie |
| GET | `/v1/auth/session` | No body | `200 { "data": { "user": <User>, "session": <SessionSummary> } }` |
| POST | `/v1/auth/logout` | `{}` | `204` |
| POST | `/v1/auth/password-reset` | `{ "email": "person@example.com" }` | `202 { "data": { "accepted": true } }` without revealing whether the account exists |

Return neutral auth/reset messages, rate-limit attempts, and keep credential handling entirely server-side. If cookie sessions are used, set secure production attributes and CSRF protections. The mock UI does not persist passwords, issue sessions, send email, or establish eligibility.

## Users and profiles

| Method | Endpoint | Request/response |
|---|---|---|
| GET | `/v1/users/:userId` | `200 { "data": <UserProfile> }`, authorized according to profile visibility |
| PATCH | `/v1/me/profile` | `{ "displayName": "…", "bio": "…", "tradition": "…", "interests": ["Prayer"] }` → `{ "data": <UserProfile> }` |
| POST | `/v1/users/:userId/follow` | `{}` → `201 { "data": { "following": true } }` |
| DELETE | `/v1/users/:userId/follow` | `{}` → `204` |
| GET | `/v1/me/privacy` | `200 { "data": { "profileVisibility": "public", "prayerDefaultVisibility": "followers" } }` |
| PATCH | `/v1/me/privacy` | `{ "profileVisibility": "followers", "prayerDefaultVisibility": "private" }` → `{ "data": <PrivacySettings> }` |
| GET | `/v1/me/preferences` | `200 { "data": { "appearance": "light", "emailNotifications": true } }` |
| PATCH | `/v1/me/preferences` | `{ "appearance": "dark" }` or `{ "emailNotifications": false }` → `{ "data": <UserPreferences> }` |

The proposed `User` includes `id`, `displayName`, `handle`, optional `avatarUrl`, `bio`, optional `location`/`tradition`, `interests`, and relationship state. Do not infer beliefs or eligibility from tradition. Profile fields that are private must not be returned to unauthorized callers.

Appearance is a visual preference, not an access-control setting. The current frontend keeps it only in its local mock settings; these proposed preference endpoints are not implemented.

## Feed, posts, comments, reactions, prayer

| Method | Endpoint | Request/response |
|---|---|---|
| GET | `/v1/feed?scope=all&cursor=…&limit=20` | `200 { "data": [<Post>], "meta": { "cursor": "…" } }`; `scope` can be `all`, `following`, or a community ID after authorization |
| POST | `/v1/posts` | `{ "type": "text", "text": "…", "visibility": "followers", "communityId": null }` → `201 { "data": <Post> }` |
| GET | `/v1/posts/:postId` | `200 { "data": <Post> }`, audience-checked |
| PATCH | `/v1/posts/:postId` | Owner-only post-field changes → `{ "data": <Post> }` |
| DELETE | `/v1/posts/:postId` | Owner/moderator-authorized deletion → `204` |
| PUT | `/v1/posts/:postId/reaction` | `{ "kind": "amen", "active": true }` → `{ "data": { "kind": "amen", "active": true, "count": 18 } }` |
| GET/POST | `/v1/posts/:postId/comments` | Paginated comments; create with `{ "body": "…" }` → `201 { "data": <Comment> }` |
| PUT | `/v1/posts/:postId/prayer-response` | `{ "active": true }` → `{ "data": { "active": true, "responseCount": 19 } }` |

Model `Post` with a discriminated `type`: `text`, `image`, `verse` (reference/translation), `testimony` (optional topic), `prayer` (response count and audience metadata), or `video` (media reference/duration). Common fields include author, body, creation time, visibility, community, reaction state/count, saved state, and comments. Validate post type, length, media ownership, community membership, and the selected audience. Do not return content to a caller whose account is outside the audience. Prayer requests need explicit access control and audit/privacy decisions, not only a client-supplied label.

## Communities and discovery

| Method | Endpoint | Request/response |
|---|---|---|
| GET | `/v1/communities?category=Prayer&q=…&cursor=…` | `200 { "data": [<Community>] }` |
| GET | `/v1/communities/:communityId` | `200 { "data": <Community> }` including public rules and member count |
| POST | `/v1/communities/:communityId/membership` | `{}` → `{ "data": { "joined": true } }` |
| DELETE | `/v1/communities/:communityId/membership` | `{}` → `204` |
| GET | `/v1/communities/:communityId/feed?cursor=…` | Paginated feed, membership/privacy checked |
| GET | `/v1/search?q=prayer&scope=all&cursor=…` | `200 { "data": { "users": [], "posts": [], "communities": [], "topics": [] } }` with all records permission-filtered |

A community carries `id`, `name`, `description`, `rules`, `memberCount`, `category`, image/media reference, and membership status. Apply server-side posting/reading policy and moderation rules for each group.

## Notifications and saved posts

| Method | Endpoint | Request/response |
|---|---|---|
| GET | `/v1/me/notifications?cursor=…&unreadOnly=false` | Paginated `{ "data": [<Notification>] }` |
| PUT | `/v1/me/notifications/:notificationId/read` | `{ "read": true }` → `204` |
| PUT | `/v1/me/notifications/read-all` | `{}` → `204` |
| GET | `/v1/me/saved-posts?cursor=…` | Audience-safe saved posts page |
| PUT | `/v1/me/saved-posts/:postId` | `{}` → `{ "data": { "saved": true } }` |
| DELETE | `/v1/me/saved-posts/:postId` | `{}` → `204` |

A notification should identify its type, actor, concise message, creation time, unread state, and an in-app target. The backend must not leak target data through a notification link when the viewer loses access.

## Reports, blocking, and moderation

| Method | Endpoint | Request/response |
|---|---|---|
| POST | `/v1/reports` | `{ "targetId": "…", "targetType": "post", "reason": "Privacy concern", "details": "…" }` → `202 { "data": { "id": "…", "status": "received" } }` |
| PUT/DELETE | `/v1/me/blocks/:userId` | Block/unblock; owner-scoped and idempotent |
| PUT/DELETE | `/v1/me/mutes/:userId` | Mute/unmute; owner-scoped and idempotent |
| GET | `/v1/moderation/reports?status=received` | Moderator-only paginated queue |
| PATCH | `/v1/moderation/reports/:reportId` | Moderator-only `{ "status": "reviewing", "decision": "…" }` with audit trail |

Report submissions must not reveal the reporter's identity or internal review notes to the reported user. Moderator identity, permissions, audit events, decision policy, appeal/retention, and escalation need explicit design and server enforcement. The frontend moderation screen is a mock demonstration and has no role check with security value.

## Media upload

| Method | Endpoint | Request/response |
|---|---|---|
| POST | `/v1/media/uploads` | `{ "filename": "garden.jpg", "contentType": "image/jpeg", "size": 12345, "purpose": "post" }` → `201 { "data": { "uploadId": "…", "uploadUrl": "…", "expiresAt": "…" } }` |
| POST | `/v1/media/uploads/:uploadId/complete` | `{ "checksum": "…", "alt": "…" }` → `{ "data": { "mediaId": "…", "url": "…", "status": "ready" } }` |
| POST | `/v1/posts` | Refer to validated `mediaId`, never trust arbitrary client storage paths |

Use short-lived upload grants, server-side MIME/signature/size checks, image processing, malware handling where appropriate, access control for private media, and retention/deletion policy. Video upload/transcoding is a later integration; the current demo only displays a thumbnail placeholder.

## Cross-cutting production requirements

Authentication, ownership, audience checks, community membership, blocking/muting behavior, private-prayer delivery, moderation authority, request limits, secure sessions, CSRF/CORS, content sanitization, media security, user deletion, retention, and backups must be enforced and verified on the backend. Client state is only a presentation hint. Add observability without collecting more sensitive faith/prayer data than necessary. The current app's localStorage mock snapshot and object URLs must never be mistaken for production storage.
