@echo off
echo ================================
echo  BioScend - Capacitor Sync
echo ================================
echo.

echo [1/2] Building web app...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed. Aborting sync.
    pause
    exit /b 1
)

echo.
echo [2/2] Syncing to Android...
call npx cap sync android
if %errorlevel% neq 0 (
    echo ERROR: Capacitor sync failed.
    pause
    exit /b 1
)

echo.
echo ================================
echo  Sync complete!
echo  You can now open Android Studio
echo  or run: npx cap open android
echo ================================
pause
