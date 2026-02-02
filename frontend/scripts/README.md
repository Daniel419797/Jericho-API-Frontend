# Dev helper scripts

This folder contains small helper scripts to request development-only admin API keys from the local server (guarded by `DEV_ADMIN_KEY` and `DEV_ADMIN_ALLOWLIST`).

Files:

- `dev-create-admin-key.sh` — Bash script. Usage:

```bash
DEV_ADMIN_KEY="your-key" HOST="http://localhost:3000" ./scripts/dev-create-admin-key.sh
```

You can pass a JSON body as first positional argument if the endpoint supports it (e.g., projectId/name):

```bash
DEV_ADMIN_KEY="your-key" HOST="http://localhost:3000" ./scripts/dev-create-admin-key.sh '{"projectId":"abc","name":"dev-admin-key"}'
```

- `dev-create-admin-key.ps1` — PowerShell script. Usage:

```powershell
$Env:DEV_ADMIN_KEY='your-key'
$Env:HOST='http://localhost:3000'
.
\scripts\dev-create-admin-key.ps1
```

or with a JSON payload:

```powershell
.
\scripts\dev-create-admin-key.ps1 -Data '{"projectId":"abc","name":"dev-admin-key"}'
```

Notes:
- These scripts are convenience helpers for local development only. Do NOT run them against production instances.
- Make sure `NODE_ENV=development`, server is running, and your IP is allowed by `DEV_ADMIN_ALLOWLIST` before running.
