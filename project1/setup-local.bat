@echo off
echo ============================================
echo   BidMaster Frontend Local Setup
echo ============================================
echo.

REM Check if .env exists
if exist .env (
    echo [!] .env file already exists. Skipping copy.
) else (
    echo [+] Creating .env from .env.example...
    copy .env.example .env
)

echo.
echo [+] Installing dependencies...
call npm install

echo.
echo ============================================
echo   Frontend Setup Complete!
echo ============================================
echo.
echo To start the frontend, run: npm run dev
echo.
echo Make sure the backend is running first!
echo ============================================
pause
