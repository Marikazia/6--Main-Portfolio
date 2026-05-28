@echo off
cd /d "%~dp0"
set "PATH=C:\Program Files\nodejs;%PATH%"

where npm.cmd >nul 2>&1
if errorlevel 1 (
  echo Node.js not found. Run start.ps1 once to install, or install from https://nodejs.org
  pause
  exit /b 1
)

if not exist "node_modules\serve\" (
  echo Installing dependencies...
  call npm.cmd install
  if errorlevel 1 (
    pause
    exit /b 1
  )
)

echo Starting portfolio at http://localhost:8020
call npm.cmd start
pause
