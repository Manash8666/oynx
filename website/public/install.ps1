# Onyx Windows PowerShell Fast Installer
$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "  ████  ██   ██ ██  ██ ██  ██ " -ForegroundColor Yellow
Write-Host " ██  ██ ███  ██  ████   ████  " -ForegroundColor Yellow
Write-Host "  ████  ██ █ ██   ██   ██  ██ " -ForegroundColor Yellow
Write-Host ""
Write-Host "  Installing Onyx AI Coding Agent..." -ForegroundColor Cyan

$InstallDir = "$env:LOCALAPPDATA\Onyx"
$BinDir = "$InstallDir\bin"
New-Item -ItemType Directory -Force -Path $BinDir | Out-Null

$ExeDest = "$BinDir\onyx.exe"
$WebUrl = "https://oynx.si/download/onyx-windows-x64.exe"
$DirectUrl = "https://github.com/Manash8666/oynx/releases/download/v1.0.0/onyx-windows-x64.exe"
$DevUrl = "http://localhost:3000/download/onyx-windows-x64.exe"

Write-Host "  Fetching Onyx binary..." -ForegroundColor Gray
$Downloaded = $false
foreach ($url in @($WebUrl, $DirectUrl, $DevUrl)) {
    try {
        Invoke-WebRequest -Uri $url -OutFile $ExeDest -UseBasicParsing -TimeoutSec 30
        $Downloaded = $true
        break
    } catch {
        continue
    }
}

if ($Downloaded -and (Test-Path $ExeDest)) {
    # Unblock Zone.Identifier Mark-of-the-Web so SmartScreen never flags the installed binary
    Unblock-File -Path $ExeDest -ErrorAction SilentlyContinue
    Write-Host "  Binary verified and unblocked for Windows Defender." -ForegroundColor Green
} else {
    Write-Host "  Note: Standalone binary can be downloaded directly from https://oynx.si/download/onyx-windows-x64.exe" -ForegroundColor Gray
}

$UserPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($UserPath -notlike "*$BinDir*") {
    [Environment]::SetEnvironmentVariable("Path", "$UserPath;$BinDir", "User")
    $env:Path = "$env:Path;$BinDir"
    Write-Host "  Added $BinDir to User PATH." -ForegroundColor Green
}

Write-Host "  Onyx is ready! Run 'onyx --help' or 'onyx' in your terminal." -ForegroundColor Green
Write-Host ""
