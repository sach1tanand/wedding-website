@echo off
setlocal
title Stop Wedding Server
color 0C
cls

echo Stopping server on port 5000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000 " 2^>nul') do taskkill /F /PID %%a >nul 2>&1
echo Done.
exit /b 0
