@echo off
REM BidMaster Start Script

echo.
echo ╔════════════════════════════════════════════╗
echo ║      BidMaster Auction Platform           ║
echo ║         Starting Application...            ║
echo ╚════════════════════════════════════════════╝
echo.

REM Check if running as admin
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo WARNING: Not running as Administrator
    echo Some features may not work correctly
    echo.
)

REM Kill any existing Node processes on port 5000 and 5174
echo [1/4] Checking for port conflicts...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
    taskkill /PID %%a /F >nul 2>&1
    echo Freed port 5000
)
timeout /t 2 >nul

REM Start backend in new window
echo [2/4] Starting backend server...
start "BidMaster Backend" cmd /k "cd /d D:\BidMaster\backend && node server.js"
timeout /t 3 >nul

REM Start frontend in new window
echo [3/4] Starting frontend server...
start "BidMaster Frontend" cmd /k "cd /d D:\BidMaster\project1 && npm run dev"

echo [4/4] Opening application...
timeout /t 3 >nul

REM Try to open in browser
echo.
echo ╔════════════════════════════════════════════╗
echo ║      Application Started Successfully!    ║
echo ║                                           ║
echo ║  Frontend: http://localhost:5174         ║
echo ║  Backend:  http://localhost:5000/api     ║
echo ║                                           ║
echo ║  Test Credentials:                        ║
echo ║  Admin:    admin@auction.com / admin123  ║
echo ║  Seller:   seller1@auction.com / seller123
echo ║  Bidder:   bidder1@auction.com / bidder123
echo ║                                           ║
echo ║  Press Ctrl+C to stop servers             ║
echo ╚════════════════════════════════════════════╝
echo.

timeout /t 2 >nul
start http://localhost:5174

echo.
echo Both servers are running in separate windows.
echo Close the windows to stop the application.
