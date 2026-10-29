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
$DirectUrl = "https://github.com/Manash8666/oynx/releases/download/v1.0.0/onyx-windows-x64.exe"
$DevUrl = "http://localhost:3000/download/onyx-windows-x64.exe"

Write-Host "  Fetching Onyx binary..." -ForegroundColor Gray
try {
    Invoke-WebRequest -Uri $DirectUrl -OutFile $ExeDest -UseBasicParsing
} catch {
    try {
        Invoke-WebRequest -Uri $DevUrl -OutFile $ExeDest -UseBasicParsing
    } catch {
        Write-Host "  Note: Standalone binary can be downloaded directly from https://github.com/Manash8666/oynx/releases" -ForegroundColor Gray
    }
}

$UserPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($UserPath -notlike "*$BinDir*") {
    [Environment]::SetEnvironmentVariable("Path", "$UserPath;$BinDir", "User")
    $env:Path = "$env:Path;$BinDir"
    Write-Host "  Added $BinDir to User PATH." -ForegroundColor Green
}

Write-Host "  Onyx is ready! Run 'onyx --help' or 'onyx' in your terminal." -ForegroundColor Green
Write-Host ""
