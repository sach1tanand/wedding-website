@echo off
setlocal
cd /d "%~dp0"
title Wedding App Launcher
color 0D
cls

echo ================================================
echo   Deepak and Awantika Wedding App Launcher
echo ================================================
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo Node.js is not installed.
  echo Install it from https://nodejs.org and run this file again.
  echo.
  pause
  exit /b 1
)

where npm >nul 2>&1
if errorlevel 1 (
  echo npm is not available in PATH.
  echo Reinstall Node.js and run this file again.
  echo.
  pause
  exit /b 1
)

if not exist "%~dp0backend\.env" (
  echo Creating backend\.env for local demo mode...
  >"%~dp0backend\.env" echo PORT=5000
  >>"%~dp0backend\.env" echo NODE_ENV=development
  >>"%~dp0backend\.env" echo JWT_SECRET=local-dev-secret
  >>"%~dp0backend\.env" echo ADMIN_PASSWORD=admin123
)

echo Checking backend dependencies...
if not exist "%~dp0backend\node_modules" (
  call npm install --prefix "%~dp0backend"
  if errorlevel 1 goto :fail
)

echo Checking frontend dependencies...
if not exist "%~dp0frontend\node_modules" (
  call npm install --prefix "%~dp0frontend"
  if errorlevel 1 goto :fail
)

echo Building frontend for localhost:5000 ...
call npm run build --prefix "%~dp0frontend"
if errorlevel 1 goto :fail

echo Starting wedding app on http://localhost:5000 ...
start "Wedding App" cmd /k "cd /d "%~dp0backend" && npm start"

echo Waiting for server...
timeout /t 5 /nobreak >nul
start "" http://localhost:5000

echo.
echo Website : http://localhost:5000
echo Health  : http://localhost:5000/api/health
echo Admin password: admin123
echo.
echo Press any key to close this launcher. The server window will keep running.
pause >nul
exit /b 0

:fail
echo.
echo Setup failed. Please keep this window open and share the error above.
echo.
pause
exit /b 1
