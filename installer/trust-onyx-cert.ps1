param(
    [string]$CertPath = ""
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Onyx Technologies Inc. -- Authenticode Certificate Trust " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

if (-not $CertPath) {
    if (Test-Path "$PSScriptRoot\onyx-signer.cer") {
        $CertPath = "$PSScriptRoot\onyx-signer.cer"
    } elseif (Test-Path "installer\onyx-signer.cer") {
        $CertPath = "installer\onyx-signer.cer"
    } else {
        $CertPath = "onyx-signer.cer"
    }
}

if (-not (Test-Path $CertPath)) {
    Write-Host "Certificate file not found: $CertPath" -ForegroundColor Red
    exit 1
}

Write-Host "Importing certificate from: $CertPath" -ForegroundColor Gray
$cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($CertPath)

Write-Host "Certificate Details:" -ForegroundColor Gray
Write-Host "  Subject:    $($cert.Subject)" -ForegroundColor White
Write-Host "  Thumbprint: $($cert.Thumbprint)" -ForegroundColor White
Write-Host "  Valid To:   $($cert.NotAfter)" -ForegroundColor White

try {
    $store = New-Object System.Security.Cryptography.X509Certificates.X509Store([System.Security.Cryptography.X509Certificates.StoreName]::Root, [System.Security.Cryptography.X509Certificates.StoreLocation]::CurrentUser)
    $store.Open([System.Security.Cryptography.X509Certificates.OpenFlags]::ReadWrite)
    $store.Add($cert)
    $store.Close()

    $pubStore = New-Object System.Security.Cryptography.X509Certificates.X509Store([System.Security.Cryptography.X509Certificates.StoreName]::TrustedPublisher, [System.Security.Cryptography.X509Certificates.StoreLocation]::CurrentUser)
    $pubStore.Open([System.Security.Cryptography.X509Certificates.OpenFlags]::ReadWrite)
    $pubStore.Add($cert)
    $pubStore.Close()

    Write-Host ""
    Write-Host "SUCCESS: Onyx certificate added to CurrentUser Trusted Root and Trusted Publisher stores." -ForegroundColor Green
    Write-Host "Onyx binaries are now recognized as signed by Onyx Technologies Inc." -ForegroundColor Green
} catch {
    Write-Warning "Failed to import certificate into CurrentUser store: $($_.Exception.Message)"
}
