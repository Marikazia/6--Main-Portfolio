$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$nodeDir = "C:\Program Files\nodejs"
$npmCmd = Join-Path $nodeDir "npm.cmd"
$nodeExe = Join-Path $nodeDir "node.exe"

function Add-NodeToPath {
  if (Test-Path $nodeDir) {
    $env:Path = "$nodeDir;$env:Path"
  }
}

function Test-NodeReady {
  Add-NodeToPath
  return (Test-Path $nodeExe) -and (Test-Path $npmCmd)
}

function Install-Node {
  Write-Host "Node.js not found. Installing LTS via winget..." -ForegroundColor Yellow

  if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
    throw "winget is unavailable. Install Node.js from https://nodejs.org and run start.bat again."
  }

  winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
  Add-NodeToPath

  if (-not (Test-NodeReady)) {
    throw "Node.js install finished, but node/npm are still in PATH. Restart the terminal and run start.bat again."
  }
}

function Invoke-Npm {
  param([Parameter(Mandatory = $true)][string[]]$Arguments)
  & $npmCmd @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "npm $($Arguments -join ' ') failed with exit code $LASTEXITCODE"
  }
}

if (-not (Test-NodeReady)) {
  Install-Node
}

if (-not (Test-Path ".\node_modules\serve")) {
  Write-Host "Installing dependencies..." -ForegroundColor Cyan
  Invoke-Npm @("install")
}

Write-Host "Starting portfolio at http://localhost:8020" -ForegroundColor Green
Invoke-Npm @("start")
