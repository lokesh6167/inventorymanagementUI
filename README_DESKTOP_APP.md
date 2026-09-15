# S.E.V Grandson Inventory Management System - Desktop Application

## Overview
This is a self-contained desktop application that bundles React frontend and Spring Boot backend with an embedded H2 database.

## Prerequisites
- **Java 22** (Must be installed on the client machine)
- **Node.js 16+** (Only needed for development)

## Installation
1. Download the installer: `InventoryApp-Setup.exe`
2. Run the installer
3. Follow the on-screen instructions
4. Application will be installed in `Program Files/SEV Grandson Inventory`

## First Run
- When you run the app for the first time, it will:
  - Start the Spring Boot backend (port 8080)
  - Create the local H2 database at `C:\Users\{YourUsername}\AppData\Local\inventory_data\`
  - Create the database schema (product & transaction tables)
  - Load the React frontend

## How to Use
1. Click "S.E.V Grandson Inventory Management" desktop shortcut
2. The app will start automatically
3. Backend loads in ~5 seconds
4. Frontend opens automatically

## Data Persistence
- All your data is stored **locally** on your machine
- Database file: `inventory_data/inventary_management_system.mv.db`
- Data **persists** across app restarts
- No cloud dependency needed

## Troubleshooting

### Backend Not Starting
- Ensure Java 22 is installed: `java -version`
- Check if port 8080 is available
- Check application logs in `%APPDATA%/InventoryApp/`

### Database Issues
- Delete `inventory_data` folder to reset database (WARNING: This will delete all data)
- Let the app recreate it on next run

### Application Won't Open
- Restart your computer
- Check if another instance is running
- Uninstall and reinstall the application

## Technical Details
- **Frontend**: React 18 with PrimeReact components
- **Backend**: Spring Boot 3.3.1 with Spring Data JPA
- **Database**: H2 (File-based, persistent)
- **Architecture**: Electron wrapper with bundled JAR

## Backing Up Your Data
To backup your inventory data:
1. Locate `C:\Users\{YourUsername}\AppData\Local\inventory_data\`
2. Copy the `inventary_management_system.mv.db` file
3. Store it in a safe location

## Uninstallation
1. Go to Control Panel → Programs → Programs and Features
2. Find "S.E.V Grandson Inventory Management"
3. Click Uninstall
4. (Optional) Delete `C:\Users\{YourUsername}\AppData\Local\inventory_data\` to remove data

## Support
For issues or questions, contact: lokesh6167@gmail.com
