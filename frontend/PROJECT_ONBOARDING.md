# Project Onboarding & Configuration Guide ✅

A compact playbook to create a project, configure it for your product needs, and safely manage access.

---

## 1) Create the project (Onboarding)
- Endpoint: `POST /api/v1/projects``
- Auth: **Bearer JWT** (project owner) or valid API key.
- Required body fields: `name`, `ownerId`, `databaseType` (e.g., `POSTGRESQL`).
- Optional: `databaseConfig`, `description`, `metadata`.
- Server behavior: creates the project and returns a one-time onboarding API key (`permissions: ["manage"]`) when applicable. **Save the raw key securely** (shown once).

Example request (curl):

```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"acme","ownerId":"<userId>","databaseType":"POSTGRESQL","databaseConfig":{"host":"db.example.com","port":5432}}' \
  https://your-host/api/v1/projects
```
 
## Supported database types

- **POSTGRESQL**: PostgreSQL relational database. Typical default port: `5432`.
- **MYSQL**: MySQL-compatible relational database. Typical default port: `3306`.
- **MONGODB**: MongoDB document (NoSQL) database. Typical default port: `27017`.

When creating a project set `databaseType` to one of the values above and provide a matching `databaseConfig` (host, port, credentials). The server includes validation and per-type migration runners.

Example `databaseConfig` objects by type:

- PostgreSQL

```json
{
  "host": "db.example.com",
  "port": 5432,
  "connectionString": "postgresql://user:pass@db.example.com:5432/dbname"
}
```

- MySQL

```json
{
  "host": "mysql.example.com",
  "port": 3306,
  "user": "root",
  "password": "secret",
  "database": "jericho_db"
}
```

- MongoDB

```json
{
  "uri": "mongodb://user:pass@mongo.example.com:27017",
  "database": "jericho_db"
}
```

- Supabase (hosted Postgres)

Supabase is supported as a Postgres provider — set `databaseType` to `POSTGRESQL` and provide the Supabase Postgres connection string in `databaseConfig`. Optionally include a `provider` field set to `SUPABASE`.

```json
{
  "connectionString": "postgresql://postgres:password@db.abcxyz.supabase.co:5432/postgres",
  "provider": "SUPABASE"
}
```

Note: ensure network access/allowed IPs for hosted providers; the server validates host reachability and blocks private/internal hosts when appropriate.

---

## 2) Test & configure DB
- Endpoint: `POST /api/v1/projects/{id}/database/test`
- Use after filling `databaseConfig` to verify connectivity. The server validates host access and blocks private/internal hosts.

---

## 3) Enable features (metadata)
- Store feature flags in `project.metadata`, e.g. `metadata.enabledModules = ['roles','streams']`.
- Update by `PUT /api/v1/projects/{id}` with the `metadata` object.

---

## Project metadata (accepted keys)

`project.metadata` is a flexible object (the API accepts arbitrary keys), but the platform expects and uses a few common keys. Below are the primary keys you can set and example payloads.

- `registrationFields` (array): Dynamic signup fields validated on user registration. Each item must include `key`, `label`, `type`, and `required`; optional `options` (for `select`) and `validation` object.

Example:

```json
{
  "metadata": {
    "registrationFields": [
      { "key": "dob", "label": "Date of birth", "type": "date", "required": true },
      { "key": "phone", "label": "Phone", "type": "phone", "required": false }
    ]
  }
}
```

- `enabledModules` (array of strings): Feature flags used to enable/disable modules per project. Controllers check `project.metadata.enabledModules?.includes('<module>')`.

Example:

```json
{ "metadata": { "enabledModules": ["roles", "schemas", "streams"] } }
```

- `storage` (object): Optional project-level storage override used by tenant wiring. Common shape:

```json
{
  "metadata": {
    "storage": {
      "provider": "s3",
      "config": { "region": "us-east-1", "accessKeyId": "...", "secretAccessKey": "...", "bucket": "my-bucket" }
    }
  }
}
```

Notes:
- The API's OpenAPI schema marks `metadata` with `additionalProperties: true`, so custom keys are permitted and may be consumed by modules.
- `registrationFields` are validated server-side (types: `text|number|email|phone|date|select|checkbox`) and values are copied into created users' `metadata`.
- Other modules may read/write module-specific metadata keys (e.g., `payment`, `billing`, `storage`), so coordinate naming to avoid collisions.

---

## Modules (enable / disable)

The platform is modular — individual modules live under `src/modules`. Below is the list of modules in this repo and the ones that can be toggled per-project via `metadata.enabledModules`.

- All modules (location: `src/modules`): `api-keys`, `attendance`, `audit`, `auth`, `content`, `files`, `messaging`, `notifications`, `payments`, `projects`, `roles`, `schemas`, `users`, `webhooks`.

- Modules toggleable per project (checked in code via `project.metadata.enabledModules?.includes('<module>')`): `attendance`, `files`, `messaging`, `notifications`, `roles`, `schemas`.

Example — enable modules for a project:

```json
{ "metadata": { "enabledModules": ["roles", "schemas", "files"] } }
```

Controllers and route loaders check `project.metadata.enabledModules` to decide whether to allow access to module endpoints. Ensure the appropriate modules are enabled before calling module-specific APIs.

Default enabled modules for new projects:

- By default a newly created project has no modules enabled (i.e., `metadata.enabledModules` is empty or absent). The `ProjectsService` does not populate `enabledModules` automatically — include `metadata.enabledModules` in the `POST /api/v1/projects` payload or `PUT /api/v1/projects/{id}` to set defaults for the project.

Example — create project with default enabled modules:

```json
{
  "name": "acme",
  "ownerId": "<userId>",
  "databaseType": "POSTGRESQL",
  "metadata": { "enabledModules": ["roles", "files"] }
}
```

---

## Project users vs Admin / API owner

There are two distinct personas and permission surfaces:

- **Project users (end users)**: Use the `auth` and `users` endpoints to register, login, and manage their own account within a project. These endpoints are available by default to any project that exposes the project context (they are not gated by `metadata.enabledModules`). `registrationFields` in `project.metadata` control fields required at sign-up.

- **Admin / API owner (platform or project admin)**: Administrative actions (creating/updating projects, managing `metadata.enabledModules`, creating API keys, rotating or revoking keys, and managing roles) require an admin-level credential — either a JWT belonging to an admin user or an API key with elevated permissions (e.g., `manage` or `admin`). Examples of admin-only endpoints: `POST /api/v1/projects`, `PUT /api/v1/projects/{id}`, `POST /api/v1/api-keys`, `DELETE /api/v1/api-keys/{id}`, and role management endpoints.

When building a dashboard for platform owners, ensure you call admin endpoints with a properly provisioned API key or an admin JWT and never expose raw admin keys in client-side code.




## 4) Registration fields (dynamic signup)
- Endpoint: `PATCH /api/v1/projects/{id}/registration-fields`
- Submit an array of field definitions (key, label, type, required, validation).
- The server validates these fields for new user registration.

Example field item:
```json
{ "key":"dob", "label":"Date of birth", "type":"date", "required": true }
```

---

## Exact DTOs (Request & Response Schemas)

Below are the exact DTO shapes expected by the server for the main onboarding and configuration endpoints. Use these verbatim when building frontend forms or clients.

- ProjectCreate (POST /api/v1/projects)
```json
{
  "name": "string",
  "ownerId": "string",                     // uuid of the owner (required)
  "databaseType": "string",               // e.g. "POSTGRESQL" (required)
  "databaseConfig": { "host": "string" },
  "description": "string",
  "metadata": { "enabledModules": ["roles"] }
}
```

- ProjectResponse (201 response from POST /api/v1/projects)
```json
{
  "project": {
    "id": "string",
    "name": "string",
    "description": "string",
    "ownerId": "string",
    "metadata": { "registrationFields": [] },
    "createdAt": "2026-01-29T00:00:00.000Z",
    "updatedAt": "2026-01-29T00:00:00.000Z"
  },
  "apiKey": "jka_<raw-key>" // ONBOARDING KEY, may be null if not generated
}
```

- ProjectUpdate (PUT /api/v1/projects/{id})
```json
{
  "name": "string",
  "description": "string",
  "databaseConfig": { "host": "string", "port": 5432 },
  "metadata": { "enabledModules": ["roles"] },
  "isActive": true
}
```

- RegistrationField (PATCH /api/v1/projects/{id}/registration-fields)
```json
[
  {
    "key": "string",
    "label": "string",
    "type": "text|number|email|phone|date|select|checkbox",
    "required": true,
    "options": ["string"],        // only for `select`
    "validation": { "minLength": 3 }
  }
]
```

- ApiKeyCreate (POST /api/v1/api-keys)
```json
{
  "name": "string",                 // required
  "projectId": "string",            // optional: inferred from caller context if omitted
  "userId": "string",
  "permissions": ["manage","read"]
}
```

- ApiKey Create response (201)
```json
{
  "apiKey": {
    "id": "string",
    "name": "string",
    "projectId": "string",
    "userId": "string",
    "permissions": ["manage"],
    "isActive": true,
    "createdAt": "2026-01-29T00:00:00.000Z",
    "updatedAt": "2026-01-29T00:00:00.000Z"
  },
  "rawKey": "jka_<raw-key>"  // The raw key is returned only once on creation
}
```

- RoleCreate (POST /api/v1/roles)
```json
{
  "name": "string",
  "projectId": "string",
  "permissions": ["manage","read"],
  "description": "string"
}
```

- RegisterRequest (POST /api/v1/auth/register)
```json
{
  "email": "string",
  "password": "string",  // must meet server password policy
  "firstName": "string",
  "lastName": "string"
}
```

---

## 5) Roles & permissions (RBAC)
- Create roles: `POST /api/v1/roles` (requires roles module + admin access).
- Role shape: `{ name, projectId, permissions: ["manage","read"] }`.
- Assign roles to users using `user_roles` mapping (admin action or via admin UI).

---

## 6) API keys (project access)
- Endpoints: `GET /api/v1/api-keys?projectId=...`, `POST /api/v1/api-keys`, `DELETE /api/v1/api-keys/{id}`.
- Created API keys: server stores only `key_hash` (SHA256); raw key returned only once at creation.
- Default onboarding key: `permissions: ["manage"]` (owner can manage keys).

Security note: store keys in a vault; do not expose raw keys in UI storage.

---

## 7) Frontend UX recommendations
- Project Settings: Tabs for General, Database (with Test), Registration Fields, API Keys, Roles, Advanced.
- Show one-time onboarding key with instructions to store it securely.
- Use `x-api-key` for API-key-protected actions; use JWT for user actions.
- Do not render `databaseConfig` (sensitive) in clients—use server-side editors where possible.

---

## 8) Operational best practices
- Validate DB host server-side to prevent internal host access.
- Confirm modal for destructive/admin ops.
- Rotate and revoke keys regularly; use audit logs for sensitive operations.
- Prefer short-lived tokens for UI operations and store secrets in a proper secrets manager.

---

## 9) Quick checklist to go live
1. Create project → save onboarding API key.  
2. Fill DB config → Test connection.  
3. Set `metadata.enabledModules` for needed features.  
4. Configure registration fields (if needed).  
5. Create roles and assign to users.  
6. Create/manage API keys for automation and team access.

---

If you want, I can run a live smoke test (create a project with your token and verify the onboarding key) or scaffold a simple React/Next Project Settings page that implements the flows above. Which would you like next? 🔁
