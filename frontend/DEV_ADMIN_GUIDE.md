# Development Admin Guide

This document explains the development-only helpers added to the project:
- `POST /api/v1/auth/dev-admin-token` — issue admin JWTs for a single allowed user.
- `POST /api/v1/auth/dev-create-admin-key` — create an admin API key for admin/API-key-protected endpoints.

These helpers are intentionally gated for development only and require extra guards.

**Important:** Do NOT enable or expose these endpoints in production. They check `NODE_ENV !== 'production'`, require `x-dev-admin-key`, and verify the requester IP is in `DEV_ADMIN_ALLOWLIST`.

---

## Environment setup

Set these env variables in your development environment (or in `.env`) and restart the server:

- `NODE_ENV=development`
- `DEV_ADMIN_KEY` — a strong secret (base64) used as an HTTP header guard.
- `DEV_ADMIN_ALLOWLIST` — comma-separated list of allowed IPs (defaults: `127.0.0.1,::1`).

Example (PowerShell):

```powershell
$env:DEV_ADMIN_KEY='your-dev-key'
$env:DEV_ADMIN_ALLOWLIST='127.0.0.1'
$env:NODE_ENV='development'
# restart server
npm run dev
```

Example (bash):

```bash
export DEV_ADMIN_KEY='your-dev-key'
export DEV_ADMIN_ALLOWLIST='127.0.0.1,::1'
export NODE_ENV=development
# restart server
npm run dev
```

You can generate a strong key (32 bytes, base64) using Node:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Endpoints

### 1) Get a dev admin JWT

Path: `POST /api/v1/auth/dev-admin-token`

Guards:
- `NODE_ENV !== 'production'`
- Header `x-dev-admin-key: <DEV_ADMIN_KEY>` (or `x-dev-key`)
- Requester IP in `DEV_ADMIN_ALLOWLIST`
- Only allowed email: `praisedaniel979@gmail.com`

Payload (JSON):

```json
{ "email": "praisedaniel979@gmail.com", "password": "<your-password>" }
```

Successful response JSON:

```json
{ "token": "<access_jwt>", "refreshToken": "<refresh_jwt>", "user": { ... } }
```

Usage (send access JWT on requests):

```bash
curl -H "Authorization: Bearer <access_jwt>" "https://your-host/api/v1/projects?page=1&limit=12"
```

Refresh the token:

```bash
curl -X POST https://your-host/api/v1/auth/refresh -H "Content-Type: application/json" -d '{"refreshToken":"<refresh_jwt>"}'
```

---

### 2) Create a dev admin API key

Path: `POST /api/v1/auth/dev-create-admin-key`

Guards: same as `dev-admin-token` (header + IP + NODE_ENV)

Payload (optional):

```json
{ "projectId": "<project-id>", "name": "dev-admin-key" }
```

Response JSON:

```json
{ "apiKey": "<raw-api-key>", "key": { /* stored ApiKey entity */ } }
```

Use the returned `apiKey` on API-key-protected admin endpoints as either:
- Header `x-api-key: <raw-api-key>`
- Or `Authorization: Bearer <raw-api-key>`

Example:

```bash
curl -H "x-api-key: <raw-api-key>" "https://your-host/admin/modules"
```

---

## Which routes the JWT-admin can access

The JWT returned by `dev-admin-token` sets `isAdmin: true` and therefore satisfies the JWT-based admin checks used across the codebase. Concretely, the JWT-admin CAN access routes guarded by `requireAdmin` and `requireOwnershipOrAdmin`, such as:

- `GET /api/v1/projects` (list all projects)
- User admin endpoints:
  - `GET /api/v1/users` (list users) — admin-only
  - `DELETE /api/v1/users/:id` — admin-only
  - `GET /api/v1/users/:id`, `PUT /api/v1/users/:id` (ownership or admin)
- Roles management:
  - `/api/v1/roles/*` (create, list, update, delete roles) — guarded by `requireAdmin`
- Marketplace admin endpoints that call `requireAdmin`, e.g.:
  - `GET /marketplace/admin/apps`
  - `POST /marketplace/apps/:id/approve`
  - `GET /marketplace/admin/installs`
- Module-level admin handlers that call `requireAdmin`
- Many other routes that perform server-side `hasRole(userId,'admin')` checks and accept `isAdmin=true` claim.

In short: any route that checks the logged-in user's role (JWT user context) and expects `isAdmin === true` will accept the dev-admin JWT.

---

## Which routes the JWT-admin CANNOT access

The dev-admin JWT does NOT create `request.ctx.apiKey` and therefore WILL NOT pass middleware that requires an API key via `app.requireApiKey()` + `app.requirePermission(...)`. These are explicitly machine/API-key guarded routes.

Exact API-key-protected routes in this codebase include:

- Convenience dashboard (API-key check):
  - `GET /api/v1/dashboard` (only returns system dashboard when API key has `admin` permission)

- Admin routes (registered with `preHandler: [app.requireApiKey(), app.requirePermission('admin')]`):
  - `POST /admin/rotate/db`
  - `POST /admin/rotate/secrets`
  - `GET /admin/rotation/log`
  - `GET /admin/cache/projects`
  - `POST /admin/cache/invalidate/:projectId`
  - `GET /admin/streams`
  - `POST /admin/streams/start`
  - `POST /admin/streams/stop`
  - `GET /admin/dashboard`
  - `GET /admin/modules`
  - `GET /admin/modules/ui`
  - `GET /admin/modules/health`
  - `GET /admin/modules/metrics`
  - `POST /admin/modules/:name/:version`
  - `GET /admin/inventory`

- Token registry admin (prefix `/api/v1/admin/tokens`, also API-key-protected):
  - `GET /api/v1/admin/tokens/`
  - `POST /api/v1/admin/tokens/`
  - `GET /api/v1/admin/tokens/:address`
  - `PUT /api/v1/admin/tokens/:address`
  - `DELETE /api/v1/admin/tokens/:address`

- API key management (`/api/v1/api-keys/*`, guarded by `app.requireApiKey()` + `app.requirePermission('manage')`):
  - `GET /api/v1/api-keys/`
  - `GET /api/v1/api-keys/:id`
  - `POST /api/v1/api-keys/`
  - `DELETE /api/v1/api-keys/:id`
  - `POST /api/v1/api-keys/:id/revoke`

To call the above, use an API key with the required permissions (create via `dev-create-admin-key` or via DB/seed).

---

## Quick end-to-end examples

1) Obtain admin JWT (dev only):

```bash
curl -X POST https://your-host/api/v1/auth/dev-admin-token \
  -H "Content-Type: application/json" \
  -H "x-dev-admin-key: ${DEV_ADMIN_KEY}" \
  -d '{"email":"praisedaniel979@gmail.com","password":"<your-password>"}'
```

2) Use JWT to list projects:

```bash
curl -H "Authorization: Bearer <access_jwt>" "https://your-host/api/v1/projects?page=1&limit=12"
```

3) Create admin API key (dev only):

```bash
curl -X POST https://your-host/api/v1/auth/dev-create-admin-key \
  -H "Content-Type: application/json" \
  -H "x-dev-admin-key: ${DEV_ADMIN_KEY}" \
  -d '{}'
```

Response contains `apiKey` — use it on API-key-protected endpoints:

```bash
curl -H "x-api-key: <apiKey>" "https://your-host/admin/modules"
```

---

## Security & cleanup

- These endpoints are for development convenience only. Remove or disable them before deploying to production.
- Keep `DEV_ADMIN_KEY` secret and do not commit `.env` containing it.
- Prefer creating real API keys via the application admin flows (or database-seeded keys) for long-lived automation; use dev helpers only in local testing.

---

## Files changed / tests

- Dev route implementations: `src/modules/auth/presentation/routes.ts`
- Tests: `src/modules/auth/presentation/authRoutes.int.test.ts`

---

If you want, I can also:
- Add a small script `scripts/dev-create-admin-key.sh` that requests a key and prints curl examples.
- Provide the exact curl commands with your `DEV_ADMIN_KEY` and host filled in (copy/paste-ready). 

Which would you like next?
