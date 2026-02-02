<#
Usage (PowerShell):
$Env:DEV_ADMIN_KEY='your-key'
$Env:HOST='http://localhost:3000'
.
\scripts\dev-create-admin-key.ps1
#>
param(
    [string]$Data = '{}' 
)

if (-not $Env:DEV_ADMIN_KEY) {
    Write-Error "DEV_ADMIN_KEY environment variable is not set."
    exit 1
}

$host = $Env:HOST -or 'http://localhost:3000'

Write-Host "Creating dev admin API key at $host/api/v1/auth/dev-create-admin-key"

try {
    $resp = Invoke-RestMethod -Method Post -Uri "$host/api/v1/auth/dev-create-admin-key" -Headers @{ 'x-dev-admin-key' = $Env:DEV_ADMIN_KEY } -ContentType 'application/json' -Body $Data -ErrorAction Stop
    Write-Host "Response:`n" ($resp | ConvertTo-Json -Depth 5)
    Write-Host "`nUse the returned apiKey with:`n" -ForegroundColor Green
    Write-Host "curl -H 'x-api-key: <raw-api-key>' '$host/admin/modules'"
} catch {
    Write-Error "Request failed: $_"
    exit 1
}
