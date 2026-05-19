@echo off
echo Stopping existing node/python processes...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM python.exe >nul 2>&1

echo Starting Backend Server...
start "Pest Backend" cmd /k "cd backend && python app.py"

echo Waiting for backend...
timeout /t 5 >nul

echo Starting Frontend Server...
start "Pest Frontend" cmd /k "npm run dev"

echo Waiting for frontend...
timeout /t 5 >nul

echo Opening Browser...
start http://localhost:3000

echo ====================================================
echo System should be running now!
echo Backend: Port 5000
echo Frontend: Port 3000
echo ====================================================
pause
