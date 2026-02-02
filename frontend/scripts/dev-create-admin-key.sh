#!/usr/bin/env bash
set -euo pipefail

# Usage: DEV_ADMIN_KEY and HOST (optional) must be set in env.
# Example:
# DEV_ADMIN_KEY="your-key" HOST="http://localhost:3000" ./scripts/dev-create-admin-key.sh

if [ -z "${DEV_ADMIN_KEY:-}" ]; then
  echo "Error: DEV_ADMIN_KEY environment variable is not set."
  echo "Set DEV_ADMIN_KEY and retry."
  exit 1
fi

HOST="${HOST:-http://localhost:3000}"
DATA="${1:-{}}"

echo "Creating dev admin API key at $HOST/api/v1/auth/dev-create-admin-key"

resp=$(curl -sS -w "\n" -X POST "$HOST/api/v1/auth/dev-create-admin-key" \
  -H "Content-Type: application/json" \
  -H "x-dev-admin-key: $DEV_ADMIN_KEY" \
  -d "$DATA")

if [ -z "$resp" ]; then
  echo "No response received. Check HOST and DEV_ADMIN_KEY."
  exit 1
fi

echo "Response:"
echo "$resp"

echo
echo "If the response contains \"apiKey\" or \"apiKey\": { \"apiKey\": \"<raw>\" }, use the raw key like this:"
echo
echo "curl -H \"x-api-key: <raw-api-key>\" \"$HOST/admin/modules\""

echo
echo "Done."
