param (
    [string]$TargetFile = "website\public\download\onyx-windows-x64.exe"
)

$ErrorActionPreference = "Stop"

Write-Host "Looking for code signing cert in Cert:\CurrentUser\My..."
$cert = Get-ChildItem Cert:\CurrentUser\My -CodeSigningCert | Where-Object { $_.Subject -like "*Onyx Technologies*" } | Select-Object -First 1

if (-not $cert) {
    Write-Host "Creating certificate..."
    $cert = New-SelfSignedCertificate -Type CodeSigningCert -Subject "CN=Onyx Technologies Inc., O=Onyx Engineering Platform, C=US" -CertStoreLocation "Cert:\CurrentUser\My" -NotAfter (Get-Date).AddYears(5)
}

Write-Host "Signing $TargetFile with $($cert.Subject)..."
$sig = Set-AuthenticodeSignature -FilePath $TargetFile -Certificate $cert -HashAlgorithm SHA256

Write-Host "Result:"
Write-Host "  Path: $($sig.Path)"
Write-Host "  Status: $($sig.Status)"
Write-Host "  StatusMessage: $($sig.StatusMessage)"
Write-Host "  Signer: $($sig.SignerCertificate.Subject)"
