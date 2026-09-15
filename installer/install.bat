@echo off
REM S.E.V Grandson Inventory Management - Universal Installer
REM This script installs Java, Node.js dependencies, and bundles the application

setlocal enabledelayedexpansion
set "INSTALL_DIR=%PROGRAMFILES%\SEV Grandson Inventory"
set "LOG_FILE=%INSTALL_DIR%\install.log"

echo ============================================
echo S.E.V Grandson Inventory Management Installer
echo ============================================
echo.
echo Installation started at %date% %time%

REM Create installation directory
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

REM Check if Java is installed
echo.
echo Checking for Java 22...
java -version >nul 2>&1
if errorlevel 1 (
    echo Java not found. Installing Java 22...
    REM Download and install Java 22
    powershell -Command "(New-Object System.Net.ServicePointManager).SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://github.com/adoptium/temurin22-binaries/releases/download/jdk-22.0.1%2B8/OpenJDK22U-jdk_x64_windows_hotspot_22.0.1_8.msi'))" 
    if errorlevel 1 (
        echo Failed to install Java. Please install Java 22 manually from https://adoptium.net
        exit /b 1
    )
    echo Java 22 installed successfully.
) else (
    echo Java is already installed.
)

REM Check if Node.js is installed
echo.
echo Checking for Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo Node.js not found. Installing Node.js...
    powershell -Command "(New-Object System.Net.ServicePointManager).SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://nodejs.org/dist/v20.9.0/node-v20.9.0-x64.msi'))" 
    if errorlevel 1 (
        echo Failed to install Node.js. Please install Node.js manually from https://nodejs.org
        exit /b 1
    )
    echo Node.js installed successfully.
) else (
    echo Node.js is already installed.
    node --version
)

REM Copy application files
echo.
echo Copying application files...
xcopy /E /I /Y "%~dp0app" "%INSTALL_DIR%\"

REM Create desktop shortcut
echo.
echo Creating desktop shortcut...
powershell -Command "$TargetFile = '%INSTALL_DIR%\\InventoryApp.exe'; $LinkFile = '%USERPROFILE%\\Desktop\\S.E.V Grandson Inventory.lnk'; $WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut($LinkFile); $Shortcut.TargetPath = $TargetFile; $Shortcut.WorkingDirectory = '%INSTALL_DIR%'; $Shortcut.Description = 'S.E.V Grandson Inventory Management'; $Shortcut.Save()"

REM Create start menu shortcut
echo Creating Start Menu shortcut...
if not exist "%APPDATA%\Microsoft\Windows\Start Menu\Programs\S.E.V Grandson" mkdir "%APPDATA%\Microsoft\Windows\Start Menu\Programs\S.E.V Grandson"
powershell -Command "$TargetFile = '%INSTALL_DIR%\\InventoryApp.exe'; $LinkFile = '%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs\\S.E.V Grandson\\Inventory Management.lnk'; $WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut($LinkFile); $Shortcut.TargetPath = $TargetFile; $Shortcut.WorkingDirectory = '%INSTALL_DIR%'; $Shortcut.Description = 'S.E.V Grandson Inventory Management'; $Shortcut.Save()"

echo.
echo ============================================
echo Installation completed successfully!
echo ============================================
echo.
echo Application installed to: %INSTALL_DIR%
echo.
echo You can now:
  echo 1. Click the desktop shortcut to start the application
  echo 2. Or find it in Start Menu > S.E.V Grandson > Inventory Management
echo.
echo First startup may take 10-15 seconds as the backend initializes.
echo.
pause
