@echo off
REM Uninstaller for S.E.V Grandson Inventory Management

setlocal enabledelayedexpansion
set "INSTALL_DIR=%PROGRAMFILES%\SEV Grandson Inventory"

echo ============================================
echo Uninstalling S.E.V Grandson Inventory...
echo ============================================
echo.

REM Remove shortcuts
echo Removing shortcuts...
del /Q "%USERPROFILE%\Desktop\S.E.V Grandson Inventory.lnk" 2>nul
rmdir /S /Q "%APPDATA%\Microsoft\Windows\Start Menu\Programs\S.E.V Grandson" 2>nul

REM Remove application files
echo Removing application files...
rmdir /S /Q "%INSTALL_DIR%"

echo.
echo Uninstallation completed.
echo.
echo NOTE: Your inventory data is stored at:
echo   %%APPDATA%%\Local\inventory_data\
echo.
echo Do you want to remove your inventory data? (Y/N)
set /p RESPONSE="
if /i "%RESPONSE%"=="Y" (
    rmdir /S /Q "%APPDATA%\Local\inventory_data"
    echo Data deleted.
) else (
    echo Data preserved. You can restore it if you reinstall.
)

pause
