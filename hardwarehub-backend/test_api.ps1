$loginBody = @{
    email = 'admin@hardwarehub.com'
    password = 'password'
    device_name = 'PowerShell Test Client'
} | ConvertTo-Json

# 1. Login & Generate Token
Write-Host "================ 1. TESTING LOGIN ================" -ForegroundColor Cyan
$loginResponse = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$loginResponse | ConvertTo-Json

$token = $loginResponse.access_token
$headers = @{
    Authorization = "Bearer $token"
    Accept = "application/json"
}

# 2. Get Dashboard Summary
Write-Host "`n================ 2. TESTING DASHBOARD SUMMARY ================" -ForegroundColor Cyan
$dashboard = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/dashboard/summary" -Method Get -Headers $headers
$dashboard | ConvertTo-Json -Depth 5

# 3. Get Products List
Write-Host "`n================ 3. TESTING PRODUCTS LIST ================" -ForegroundColor Cyan
$products = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/products?per_page=3" -Method Get -Headers $headers
$products | ConvertTo-Json -Depth 5

# 4. Barcode Scan Test (First product SKU)
if ($products.data.Count -gt 0) {
    $firstSku = $products.data[0].sku
    $firstId = $products.data[0].id
    Write-Host "`n================ 4. TESTING BARCODE SCAN ($firstSku) ================" -ForegroundColor Cyan
    $scan = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/products/scan/$firstSku" -Method Get -Headers $headers
    $scan | ConvertTo-Json -Depth 5

    # 5. Quick Stock Adjustment (+5 items)
    Write-Host "`n================ 5. TESTING STOCK ADJUSTMENT (+5 items) ================" -ForegroundColor Cyan
    $adjustBody = @{
        action = "add"
        amount = 5
        note = "Restocked via Mobile Scanner"
    } | ConvertTo-Json
    $adjusted = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/products/$firstId/adjust-stock" -Method Post -Body $adjustBody -Headers $headers -ContentType "application/json"
    $adjusted | ConvertTo-Json -Depth 5
}
