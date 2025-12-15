@echo off
echo ============================================
echo   BidMaster Local Setup
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
echo [+] Seeding database with test users...
call npm run seed

echo.
echo ============================================
echo   Setup Complete!
echo ============================================
echo.
echo Test Accounts:
echo   Admin:  admin@auction.com / admin123
echo   Seller: seller1@auction.com / seller123
echo   Bidder: bidder1@auction.com / bidder123
echo.
echo To start the server, run: npm run dev
echo ============================================
pause
