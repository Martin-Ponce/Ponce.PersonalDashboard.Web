<#
.SYNOPSIS
  Registers this app as a client on the local identity provider.
#>
param(
  # No trailing slash.
  [string]$Idp = 'http://localhost:5008',
  [string[]]$AppOrigins = @('http://localhost:4200', 'http://localhost:8080')
)

$ErrorActionPreference = 'Stop'

$client = @{
  clientId      = 'personal-dashboard-web'
  clientSecret  = $null # Public client, PKCE instead of a secret.
  displayName   = 'Personal Dashboard'
  redirectUris  = @($AppOrigins | ForEach-Object { "$_/auth/callback" })
  postLogoutRedirectUris = @($AppOrigins | ForEach-Object { "$_/login" })
  allowedScopes = @('openid', 'profile', 'offline_access')
}

Write-Host "IdP: $Idp" -ForegroundColor Cyan
$discovery = Invoke-RestMethod "$Idp/.well-known/openid-configuration"
Write-Host "Issuer: $($discovery.issuer)"

# 1. PKCE pair
function ConvertTo-B64Url([byte[]]$bytes) {
  [Convert]::ToBase64String($bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_')
}
$random = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($random)
$verifier = ConvertTo-B64Url $random
$challenge = ConvertTo-B64Url ([Security.Cryptography.SHA256]::Create().ComputeHash([Text.Encoding]::ASCII.GetBytes($verifier)))

# 2. Admin sign-in through admin-cli
$adminRedirect = "$Idp/callback"
$authorize = "$Idp/connect/authorize?client_id=admin-cli&response_type=code" +
  "&redirect_uri=$([uri]::EscapeDataString($adminRedirect))" +
  "&scope=openid%20profile%20offline_access&code_challenge=$challenge&code_challenge_method=S256&state=admin"
Write-Host "`nOpening the browser: sign in as the IdP admin, then copy the authorization code it shows." -ForegroundColor Yellow
Start-Process $authorize

# 3. Code -> admin token
$code = Read-Host 'Paste the authorization code'
$tokens = Invoke-RestMethod -Method Post -Uri "$Idp/connect/token" -ContentType 'application/x-www-form-urlencoded' -Body @{
  grant_type    = 'authorization_code'
  code          = $code
  redirect_uri  = $adminRedirect
  client_id     = 'admin-cli'
  code_verifier = $verifier
}
$headers = @{ Authorization = "Bearer $($tokens.access_token)"; 'X-Version' = '1.0' }

try {
  # 4. Register or update the client
  $body = $client | ConvertTo-Json
  $existing = $null
  try {
    $existing = Invoke-RestMethod -Uri "$Idp/api/admin/clients/$($client.clientId)" -Headers $headers
  } catch {
    if ($_.Exception.Response.StatusCode.value__ -ne 404) { throw }
  }
  if ($existing) {
    Invoke-RestMethod -Method Put -Uri "$Idp/api/admin/clients/$($client.clientId)" -Headers $headers -ContentType 'application/json' -Body $body | Out-Null
    Write-Host "`nUpdated client '$($client.clientId)'." -ForegroundColor Green
  } else {
    Invoke-RestMethod -Method Post -Uri "$Idp/api/admin/clients" -Headers $headers -ContentType 'application/json' -Body $body | Out-Null
    Write-Host "`nRegistered client '$($client.clientId)'." -ForegroundColor Green
  }
  Write-Host "  Redirect URI: $($client.redirectUris -join ', ')"
  Write-Host "  After logout: $($client.postLogoutRedirectUris -join ', ')"
  Write-Host "  Scopes:       $($client.allowedScopes -join ' ')"

  # 5. CORS check
  foreach ($origin in $AppOrigins) {
    $allowed = (Invoke-WebRequest "$Idp/.well-known/openid-configuration" -Headers @{ Origin = $origin } -UseBasicParsing).Headers['Access-Control-Allow-Origin']
    if ($allowed -eq $origin) {
      Write-Host "  CORS:         $origin is allowed." -ForegroundColor Green
    } else {
      Write-Host "  CORS:         $origin is NOT allowed. Add it to the IdP's Cors:Origins (or CORS_ORIGINS) and restart the IdP." -ForegroundColor Red
    }
  }
} catch {
  Write-Host "`nFailed: $($_.Exception.Message)" -ForegroundColor Red
  if ($_.ErrorDetails.Message) { Write-Host $_.ErrorDetails.Message }
  exit 1
} finally {
  Remove-Variable tokens, headers, code, verifier, challenge -ErrorAction SilentlyContinue
}
