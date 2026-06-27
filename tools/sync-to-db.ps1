# sync-to-db.ps1
param(
  [string]$ApiUrl = "https://metagro-api-ds6r.onrender.com"
)

$envPath = Join-Path $PWD ".env"
$envContent = Get-Content $envPath -Raw
$userMatch = [regex]::Match($envContent, "ADMIN_USER=(.+)")
$passMatch = [regex]::Match($envContent, "ADMIN_PASS=(.+)")

if (-not $userMatch.Success -or -not $passMatch.Success) {
  Write-Error "ADMIN_USER o ADMIN_PASS no encontrados en .env"
  exit 1
}

$username = $userMatch.Groups[1].Value.Trim()
$password = $passMatch.Groups[1].Value.Trim()

Write-Host "Logueando en $ApiUrl ..."
$loginBody = @{username=$username; password=$password} | ConvertTo-Json
$loginHeaders = @{"Content-Type"="application/json"; "Origin"="https://metagro.vercel.app"}
$loginRes = Invoke-RestMethod -Uri "$ApiUrl/api/admin/login" -Method Post -Body $loginBody -Headers $loginHeaders
$token = $loginRes.token
Write-Host "Login exitoso"

$productsPath = Join-Path $PWD "backend\data\products.json"
$products = Get-Content $productsPath -Raw | ConvertFrom-Json
Write-Host "Sincronizando $($products.Count) productos ..."
$syncHeaders = @{"Content-Type"="application/json"; "Authorization"="Bearer $token"; "Origin"="https://metagro.vercel.app"}
$syncRes = Invoke-RestMethod -Uri "$ApiUrl/api/sync-to-db" -Method Post -Body ($products | ConvertTo-Json -Depth 10) -Headers $syncHeaders -ContentType "application/json"
Write-Host "Status: 200"
Write-Host "Response:" ($syncRes | ConvertTo-Json -Depth 5)
