@echo off
echo Starting Pest Management System (Production Mode)...

:: Kill existing processes
taskkill /F /IM python.exe >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1

:: Start Backend (which now serves Frontend too)
echo Starting Application Server...
start "Pest App" cmd /k "cd backend && python app.py"

echo.
echo Server is starting...
echo Please wait for the browser window to open or go to:
echo http://localhost:5000
echo.
timeout /t 5
start http://localhost:5000
pause
