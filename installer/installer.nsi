; S.E.V Grandson Inventory Management System - NSIS Installer
; This script creates a complete installer with Java bundled

!include "MUI2.nsh"
!include "x64.nsh"
!include "LogicLib.nsh"

; Basic Configuration
Name "S.E.V Grandson Inventory Management v1.0.0"
OutFile "InventoryManagementSystem-Setup.exe"
InstallDir "$PROGRAMFILES\SEV Grandson Inventory"
InstallDirRegKey HKCU "Software\SEV Grandson Inventory" ""

; Set compression
SetCompressor /SOLID lzma

; Request admin privileges
RequestExecutionLevel admin

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES

!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_LANGUAGE "English"

; Variables
Var JavaInstalled
Var JavaPath

Section "PreInstall"
  ; Check for Java
  ClearErrors
  ReadRegStr $JavaPath HKLM "Software\JavaSoft\Java Runtime Environment" "CurrentVersion"
  
  ${If} $JavaPath == ""
    ; Java not found, prompt to install
    MessageBox MB_YESNO "Java Runtime Environment 22 is required for this application.$\n$\nWould you like to download and install it now?$\n$\n(Requires internet connection)" IDYES InstallJava IDNO SkipJava
    
    InstallJava:
      ; Download Java 22 from Adoptium (OpenJDK)
      DetailPrint "Downloading Java Runtime Environment 22..."
      NSCurl::http "GET" "https://github.com/adoptium/temurin22-binaries/releases/download/jdk-22.0.1%2B8/OpenJDK22U-jdk_x64_windows_hotspot_22.0.1_8.msi" "$TEMP\java-installer.msi"
      
      DetailPrint "Installing Java Runtime Environment..."
      ExecWait '"$TEMP\java-installer.msi" /qb'
      
      Delete "$TEMP\java-installer.msi"
      
      DetailPrint "Java installation complete."
      Goto JavaDone
    
    SkipJava:
      MessageBox MB_OK "Installation cancelled. Java 22 is required.$\n$\nPlease install it manually from: https://adoptium.net"
      Abort
    
    JavaDone:
  ${Else}
    DetailPrint "Java Runtime Environment detected: $JavaPath"
  ${EndIf}
SectionEnd

Section "Install Application"
  SetOutPath "$INSTDIR"
  
  DetailPrint "Installing application files..."
  File /r "app\*.*"
  
  ; Store installation folder
  WriteRegStr HKCU "Software\SEV Grandson Inventory" "InstallPath" "$INSTDIR"
  
  ; Create uninstaller
  WriteUninstaller "$INSTDIR\Uninstall.exe"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\SEV Grandson Inventory" "DisplayName" "S.E.V Grandson Inventory Management"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\SEV Grandson Inventory" "UninstallString" "$INSTDIR\Uninstall.exe"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\SEV Grandson Inventory" "DisplayIcon" "$INSTDIR\InventoryApp.exe"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\SEV Grandson Inventory" "Publisher" "S.E.V Grandson"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\SEV Grandson Inventory" "DisplayVersion" "1.0.0"
SectionEnd

Section "Create Shortcuts"
  DetailPrint "Creating shortcuts..."
  
  ; Create Start Menu folder
  CreateDirectory "$SMPROGRAMS\S.E.V Grandson"
  
  ; Create Start Menu shortcut
  CreateShortCut "$SMPROGRAMS\S.E.V Grandson\Inventory Management.lnk" "$INSTDIR\InventoryApp.exe" "" "$INSTDIR\InventoryApp.exe" 0
  
  ; Create Desktop shortcut
  CreateShortCut "$DESKTOP\S.E.V Grandson Inventory.lnk" "$INSTDIR\InventoryApp.exe" "" "$INSTDIR\InventoryApp.exe" 0
  
  ; Create Uninstall shortcut
  CreateShortCut "$SMPROGRAMS\S.E.V Grandson\Uninstall.lnk" "$INSTDIR\Uninstall.exe"
  
  DetailPrint "Shortcuts created successfully."
SectionEnd

Section "Uninstall"
  DetailPrint "Uninstalling S.E.V Grandson Inventory Management..."
  
  ; Remove shortcuts
  Delete "$SMPROGRAMS\S.E.V Grandson\Inventory Management.lnk"
  Delete "$SMPROGRAMS\S.E.V Grandson\Uninstall.lnk"
  RMDir "$SMPROGRAMS\S.E.V Grandson"
  Delete "$DESKTOP\S.E.V Grandson Inventory.lnk"
  
  ; Remove installed files
  RMDir /r "$INSTDIR"
  
  ; Remove registry entries
  DeleteRegKey HKCU "Software\SEV Grandson Inventory"
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\SEV Grandson Inventory"
  
  DetailPrint "Uninstall complete."
SectionEnd

Function .onInstSuccess
  MessageBox MB_YESNO "Installation completed successfully!$\n$\nWould you like to launch the application now?" IDYES LaunchApp IDNO NoLaunch
  LaunchApp:
    Exec "$INSTDIR\InventoryApp.exe"
  NoLaunch:
FunctionEnd
