@echo off
echo Starting all Ghar Ka Kitchen services...
echo.

start "Auth Service" cmd /k "cd services\auth && npm run dev"
timeout /t 2 /nobreak >nul

start "Kitchen Service" cmd /k "cd services\kitchen && npm run dev"
timeout /t 2 /nobreak >nul

start "Search Service" cmd /k "cd services\search && npm run dev"
timeout /t 2 /nobreak >nul

start "Order Service" cmd /k "cd services\order && npm run dev"
timeout /t 2 /nobreak >nul

start "Payment Service" cmd /k "cd services\payment && npm run dev"
timeout /t 2 /nobreak >nul

start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo All services started!
echo Auth: http://localhost:5000
echo Kitchen: http://localhost:5001
echo Search: http://localhost:5002
echo Order: http://localhost:5003
echo Payment: http://localhost:5004
echo Frontend: http://localhost:3000
