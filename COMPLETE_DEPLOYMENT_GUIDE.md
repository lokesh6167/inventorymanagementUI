# Complete Step-by-Step Testing & Deployment Guide

## Prerequisites
- Git installed
- GitHub account with access to both repositories
- IntelliJ IDEA or VS Code
- Maven 3.8+
- Node.js 16+ (for development only)

---

## STEP 1: Clone Both Repositories

```bash
# Clone backend
git clone https://github.com/lokesh6167/inventarymanagementsystemlatest.git
cd inventarymanagementsystemlatest

# Clone frontend (in a separate directory)
cd ..
git clone https://github.com/lokesh6167/inventorymanagementUI.git
```

---

## STEP 2: Build Backend (Spring Boot)

```bash
cd inventarymanagementsystemlatest

# Build JAR file
mvn clean package -DskipTests

# Output will be:
# target/inventarymanagementsystemlatest-0.0.1-SNAPSHOT.jar

cd ..
```

---

## STEP 3: Build Frontend (React)

```bash
cd inventorymanagementUI

# Install dependencies
npm install

# Build React app
npm run build

# Output will be in: build/ directory

cd ..
```

---

## STEP 4: LOCAL TESTING (Before Creating Installer)

### Test Backend Only

```bash
cd inventarymanagementsystemlatest

# Run Spring Boot
java -jar target/inventarymanagementsystemlatest-0.0.1-SNAPSHOT.jar

# You should see:
# Started Application in X seconds
# Open browser: http://127.0.0.1:8080/inventarymanagement/testServer
# Should show: "Hi I am up.. You can use me.."
```

### Test Frontend Only

```bash
cd inventorymanagementUI

# Install Electron for local testing
npm install electron electron-is-dev --save-dev

# Start React in development
npm start

# In another terminal, run Electron
npm start (with electron-main.js configured)
```

### Test Full Integration

```bash
# Terminal 1: Start backend
cd inventarymanagementsystemlatest
java -jar target/inventarymanagementsystemlatest-0.0.1-SNAPSHOT.jar

# Terminal 2: Start frontend
cd inventorymanagementUI
npm install
npm start

# Open http://localhost:3000
# Click on each menu item to verify all APIs work
```

---

## STEP 5: Create Desktop Installer

### Option A: Using NSIS (Recommended - Easiest)

```bash
# 1. Install NSIS from: https://nsis.sourceforge.io/Download

# 2. Copy this structure:
# installer/
#   ├── installer.nsi
#   └── app/
#       ├── InventoryApp.exe (built from Electron)
#       ├── app.jar (backend JAR)
#       └── resources/

# 3. Create installer.nsi file (see NSIS_INSTALLER.nsi in repo)

# 4. Right-click installer.nsi > Compile NSIS
#    Output: InventoryManagementSystem-Setup.exe
```

### Option B: Using electron-builder (Automatic)

```bash
cd inventorymanagementUI

# 1. Update package.json with build config (already done)

# 2. Install electron-builder
npm install electron-builder --save-dev

# 3. Build installer
npm run build-win  # Creates InventoryApp Setup 1.0.0.exe

# Output in: dist/ directory
```

---

## STEP 6: Bundle Everything for Client

### Directory Structure for Installer

```
InventoryApp-Setup-1.0.0/
├── InventoryApp-Setup.exe          (Main installer)
├── install.bat                      (Runs automatically)
├── uninstall.bat                    (For future uninstall)
├── app/
│   ├── InventoryApp.exe            (Electron wrapper)
│   ├── app.jar                      (Spring Boot backend)
│   ├── LICENSE                      (OpenJDK license)
│   └── README.txt                   (Quick start guide)
└── installers/
    ├── jdk-22-windows-x64.exe       (Java installer)
    └── node-20-x64.msi              (Node.js installer - optional)
```

---

## STEP 7: Create NSIS Installer Script

Create `installer/installer.nsi`:

```nsis
; S.E.V Grandson Inventory Management Installer
!include "MUI2.nsh"
!include "x64.nsh"

Name "S.E.V Grandson Inventory Management v1.0.0"
OutFile "InventoryManagementSystem-Setup.exe"
InstallDir "$PROGRAMFILES\SEV Grandson Inventory"

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_LANGUAGE "English"

Section "Install"
  SetOutPath "$INSTDIR"
  
  ; Check Java
  ReadRegStr $0 HKLM "Software\JavaSoft\Java Runtime Environment" "CurrentVersion"
  ${If} $0 == ""
    MessageBox MB_YESNO "Java 22 is required. Would you like to install it now?" IDYES +2
    Abort "Installation cancelled. Please install Java 22 manually."
    ExecWait '"$EXEDIR\installers\jdk-22-windows-x64.exe"'
  ${EndIf}
  
  ; Copy files
  File /r "app\*.*"
  
  ; Create shortcuts
  CreateDirectory "$SMPROGRAMS\S.E.V Grandson"
  CreateShortCut "$SMPROGRAMS\S.E.V Grandson\Inventory Management.lnk" "$INSTDIR\InventoryApp.exe"
  CreateShortCut "$DESKTOP\S.E.V Grandson Inventory.lnk" "$INSTDIR\InventoryApp.exe"
  
  ; Create uninstaller
  WriteUninstaller "$INSTDIR\Uninstall.exe"
SectionEnd

Section "Uninstall"
  RMDir /r "$INSTDIR"
  RMDir /r "$SMPROGRAMS\S.E.V Grandson"
  Delete "$DESKTOP\S.E.V Grandson Inventory.lnk"
SectionEnd
```

---

## STEP 8: Test the Installer

```bash
# 1. Build the .exe
# (using NSIS or electron-builder as above)

# 2. Test on a clean machine (or VM)
# - Run: InventoryManagementSystem-Setup.exe
# - Follow installation wizard
# - Check desktop shortcut appears
# - Click shortcut to launch
# - Verify app opens and connects to backend
# - Try adding a product
# - Restart app and verify data persists

# 3. Test uninstall
# - Go to Control Panel > Programs > Uninstall
# - Find "S.E.V Grandson Inventory Management"
# - Click Uninstall
# - Verify it removes cleanly
```

---

## STEP 9: Final Deployment to Client

### Files to Deliver

1. **InventoryManagementSystem-Setup.exe** - Main installer
2. **README_DESKTOP_APP.md** - User documentation
3. **Quick Start Guide.txt** - Installation instructions

### Client Installation Steps

1. Download: `InventoryManagementSystem-Setup.exe`
2. Double-click to run
3. Click "Next" through the wizard
4. Wait for installation to complete (2-5 minutes)
5. Desktop shortcut appears automatically
6. Click shortcut to launch
7. App opens in 10-15 seconds

---

## Data Location

**Windows:**
```
C:\Users\{Username}\AppData\Local\inventory_data\inventary_management_system.mv.db
```

**Linux:**
```
~/.sev-grandson-inventory/inventory_data/inventary_management_system.mv.db
```

**Mac:**
```
~/Library/Application Support/sev-grandson-inventory/inventory_data/inventary_management_system.mv.db
```

---

## Troubleshooting

### Issue: "Backend failed to start"
- **Solution:** Ensure Java is in PATH: `java -version`
- Check if port 8080 is available
- Check logs in: `%APPDATA%/InventoryApp/logs/`

### Issue: "Cannot connect to database"
- **Solution:** Delete `inventory_data` folder to reset
- App will recreate it on next run
- WARNING: This deletes all data

### Issue: "App crashes on startup"
- **Solution:** Uninstall and reinstall
- Check Windows Event Viewer for errors
- Ensure minimum 2GB disk space

---

## Building for Other Platforms

### Build for Mac (.dmg)
```bash
cd inventorymanagementUI
npm install electron-builder --save-dev
npm run build-mac
# Output: dist/S.E.V Grandson Inventory-1.0.0.dmg
```

### Build for Linux (.deb, .rpm)
```bash
cd inventorymanagementUI
npm run build-linux
# Output: dist/*.deb and dist/*.rpm
```

---

## Quick Command Reference

```bash
# Backend
mvn clean package -DskipTests          # Build JAR
java -jar target/*.jar                 # Run backend

# Frontend
npm install                             # Install deps
npm start                              # Dev server
npm run build                          # Production build
npm run build-win                      # Build Windows installer

# Testing
http://127.0.0.1:8080/inventarymanagement/testServer
http://localhost:3000                  # React dev
```

---

## Support

For issues during setup, check:
1. `README_DESKTOP_APP.md` in React repo
2. Java version: Must be 22+
3. Disk space: Minimum 2GB free
4. Network: Localhost ports must be free

---

**Last Updated:** 2026-09-15
**Version:** 1.0.0
